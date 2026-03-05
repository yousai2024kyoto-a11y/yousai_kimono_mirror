// pages/Preview.jsx
import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Camera from '../components/Camera';
import Print from '../components/Print';
import useHandTracking from '../hooks/useHandTracking';
import GestureButton from '../components/GestureButton/GestureButton';
import styles from './Preview.module.css';

export default function Preview() {
  const navigate = useNavigate();
  const hasRequested = useRef(false);
  
  const [generatedImage, setGeneratedImage] = useState(null);
  const [isGenerating, setIsGenerating] = useState(true);
  
  const [useAI, setUseAI] = useState(true);
  const [targetCameraId, setTargetCameraId] = useState(null);

  const videoRef = useRef(null);
  const fingerPosition = useHandTracking(videoRef, useAI);

  useEffect(() => {
    // 🌟 防壁強化：画面が開いた「0.01秒後」に即座にロックをかける！
    if (hasRequested.current) return;
    hasRequested.current = true;

    const savedId = localStorage.getItem('preferredCameraId');
    if (savedId) setTargetCameraId(savedId);

    const savedAI = localStorage.getItem('useMediaPipe');
    if (savedAI !== null) setUseAI(savedAI === 'true');

    const savedPhoto = sessionStorage.getItem('originalPhoto');
    const targetPerson = sessionStorage.getItem('targetPerson') || 'woman';
    const obiColor = sessionStorage.getItem('obiColor') || 'auto';

    if (!savedPhoto) {
      navigate('/yukata');
      return;
    }

    const generateYukata = async (base64String, person, obi) => {
      try {
        const personStr = person === 'woman' ? 'woman' : person === 'man' ? 'man' : 'child';
        const obiStr = obi === 'auto' ? 'a matching' : obi;
        let personPrompt;
        
        switch (person) {
          case 'man':
            personPrompt = '男性的な和モダンなスタイル。必ず『角帯』（男性用の幅の狭い帯）を使用してください。帯はウエストではなく、腰骨の位置で低く締めてください。女性のようなおはしょりはありません。必ず男性的な着方になるようにしてください。帯の結び方は結び目が見えないようにして、女性のような大きなリボンや幅広の帯は絶対に避けてください。'
            break;
          case 'child':
            personPrompt = '帯は兵児帯。リボンはいらない。';
            break;
          case 'woman':
          default:
            personPrompt = '美しい女性のスタイル。「半幅帯」，「浴衣帯」，無地の帯。着物の柄に調和する美しい幅広の帯を選び、コーディネートしてください。"ウエストの高い位置で締めてください。'
            break;
        }

        const promptText = `あなたはプロのAIファッションスタイリスト兼フォトエディターです。入力画像を元に、超高画質な写真を生成してください。現在、画像の人物は${person}で，手に浴衣を持っています。あなたの任務は、その手に持っている浴衣を、実際にその人物に着せることです。${personPrompt}帯の色は ${obiStr} 。背景は清潔感のある白背景のフォトスタジオ。プロフェッショナルなライティング、ハイキー照明、被写体が際立つシンプルな背景。`;

        const response = await fetch('/api/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ imageBase64: base64String, promptText: promptText }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'サーバーで不明なエラーが発生しました');
        }

        const data = await response.json();
        setGeneratedImage(`data:image/jpeg;base64,${data.newImage}`);

      } catch (error) {
        console.error("生成エラー:", error);
        alert(`処理が失敗しました。\n詳細: ${error.message}`);
        hasRequested.current = false;
        navigate('/yukata');
      } finally {
        setIsGenerating(false);
      }
    };
    
    generateYukata(savedPhoto, targetPerson, obiColor);

  }, [navigate]);

  const handleRetake = () => {
    // 🌟 ゴミ箱強化：次の撮影に悪影響が出ないよう、古い写真を完全に消し去る！
    sessionStorage.removeItem('originalPhoto');
    
    // 再挑戦できるようにロックを解除
    hasRequested.current = false;
    
    navigate('/yukata');
  };

  return (
    <div className={styles.container}>
      <div className={styles.cameraBackground}>
        {useAI && <Camera deviceId={targetCameraId} videoRef={videoRef} />}
      </div>
      <div className={styles.splitLayout}>
        <div className={styles.imageArea}>
          {isGenerating ? (
            <div className={styles.loadingBox}>
              <div className={styles.spinner}></div>
              <h2>AIが着付け中...👘</h2>
              <p>帯を結んでいます...</p>
            </div>
          ) : (
            <img src={generatedImage} alt="Generated Yukata" className={styles.generatedImage} />
          )}
        </div>
        <div className={styles.controlArea}>
          <GestureButton variant="panel" fingerPosition={fingerPosition} onClick={handleRetake}>
            <span style={{ fontSize: '32px' }}>📸</span>
            <span>もう一度撮影</span>
          </GestureButton>
          <Print generatedImage={generatedImage} fingerPosition={fingerPosition} />
        </div>
      </div>
      {useAI && fingerPosition && (
        <div className={styles.pointer} style={{ left: `${(1 - fingerPosition.x) * 100}%`, top: `${fingerPosition.y * 100}%` }} />
      )}
    </div>
  );
}