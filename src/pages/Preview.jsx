// pages/Preview.jsx
import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Camera from '../components/Camera';
import Print from '../components/Print';
import GestureButton from '../components/GestureButton/GestureButton';
import { HandTrackingProvider } from '../contexts/HandTrackingContext';
import HandPointer from '../components/HandPointer/HandPointer';
import styles from './Preview.module.css';

const BACKGROUND_PROMPTS = {
  "style_studio": "清潔感のある白背景のフォトスタジオ。プロフェッショナルなライティング、ハイキー照明、被写体が際立つシンプルな背景。",
  "style_matsuri": "活気ある日本の夏祭りの夜。背景にはたくさんの輝く提灯（ちょうちん）と屋台の明かり。お祭りの賑やかな雰囲気。背景は美しくボケている（ソフトフォーカス）。",
  "style_shrine": "京都の古風な神社の参道。連なる赤い鳥居、石畳の階段、静寂で神秘的な雰囲気。周囲を取り囲む深い森と木漏れ日。"
};

export default function Preview() {
  const navigate = useNavigate();
  const hasRequested = useRef(false);
  
  const [generatedImage, setGeneratedImage] = useState(null);
  const [isGenerating, setIsGenerating] = useState(true);
  
  const [useAI, setUseAI] = useState(true);
  const [targetCameraId, setTargetCameraId] = useState(null);

  const videoRef = useRef(null);

  useEffect(() => {
    if (hasRequested.current) return;
    hasRequested.current = true;

    const savedId = localStorage.getItem('preferredCameraId');
    if (savedId) setTargetCameraId(savedId);

    const savedAI = localStorage.getItem('useMediaPipe');
    if (savedAI !== null) setUseAI(savedAI === 'true');

    const savedPhoto = sessionStorage.getItem('originalPhoto');
    const gender = sessionStorage.getItem('targetPerson') || 'woman';
    const obiColorSelection = sessionStorage.getItem('obiColor') || 'auto';
    const background = sessionStorage.getItem('backgroundStyle') || 'style_studio';

    if (!savedPhoto) {
      navigate('/yukata');
      return;
    }

    const generateYukata = async (base64String, gender, obi) => {
      try {
        const bg_text = BACKGROUND_PROMPTS[background] || BACKGROUND_PROMPTS["style_studio"];
        
        let subject_base, style_desc, obi_term, obi_instruction;
        const garment_type = "「浴衣（夏着物）と帯」";

        if (gender === "man") {
          subject_base = "男性";
          style_desc = "男性的な和モダンなスタイル";
          obi_term = "「角帯」（男性用の幅の狭い帯）";
          obi_instruction = (
            "必ず『角帯』を使用してください。" +
            "帯はウエストではなく、腰骨の位置で低く締めてください。" +
            "女性のようなおはしょりはありません。必ず男性的な着方になるようにしてください。" +
            "結び方は「貝の口」などの男性的な結び方にし、女性のような大きなリボンや幅広の帯は絶対に避けてください。"
          );
        } else {
          subject_base = "女性";
          style_desc = "美しい女性のスタイル";
          obi_term = "「半幅帯」，「浴衣帯」，無地の帯";
          obi_instruction = "ウエストの高い位置で締めてください。";
        }

        const obi_color_info = obi !== 'auto' ? `帯の色は ${obi}。` : "";

        const promptText = (
          "あなたはプロのAIファッションスタイリスト兼フォトエディターです。" +
          "入力画像を元に、超高画質な写真を生成してください。" +
          `現在、画像の人物は手に${garment_type}を持っています。` +
          `あなたの任務は、その手に持っている${garment_type}を、実際にその人物に着せることです。` +
          `被写体：${subject_base}、${style_desc}。` +
          `背景：${bg_text}。` +
          "\n【重要要件（必ず守ること）】:\n" +
          "1. 顔と髪型の完全維持（最優先事項）: \n" +
          "   - 入力画像の人物の顔立ち、表情、特徴を厳密に維持してください。\n" +
          "   - 髪型と髪色を入力画像そのまま維持してください。髪の長さや質感を勝手に変更しないでください。\n" +
          "   - 丈は足元まで生成してください。\n" +
          "2. 生地の再現: \n" +
          "   - 人物が手に持っている布地や衣服の「柄・色・質感」を分析し、それを着用後の着物に正確に適用してください。" +
          "   - 手に持っている布と全く違う柄を捏造しないでください。\n" +
          `3. 帯（オビ）の仕様 - ${obi_term}: \n` +
          `   - ${obi_instruction}\n` +
          `   - ${obi_color_info} 手に帯を持っている場合は、その色や柄を必ず使用してください。\n` +
          "4. ポーズと手: \n" +
          "   - 人物は自然な立ち姿にしてください。\n" +
          "   - 服をすでに「着ている」状態なので、手には何も持たせず、体の横に自然に下ろすか、お腹の前で軽く組ませてください。\n" +
          "   - 下駄を履かせてください。\n" +
          "5. 品質設定:\n" +
          "   - 8k解像度、写真のようなリアルな質感、映画のようなライティング、高精細。"
        );

        const response = await fetch('/api/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ imageBase64: base64String, promptText: promptText }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'サーバーエラー');
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
    
    generateYukata(savedPhoto, gender, obiColorSelection);

  }, [navigate]);

  const handleRetake = () => {
    sessionStorage.removeItem('originalPhoto');
    hasRequested.current = false;
    navigate('/yukata');
  };

  return (
    <HandTrackingProvider videoRef={videoRef} isEnabled={useAI}>
      <div className={styles.container}>
        <div className={styles.cameraBackground}>
          {useAI && <Camera deviceId={targetCameraId} videoRef={videoRef} />}
        </div>
        <div className={styles.splitLayout}>
          <div className={styles.imageArea}>
            {isGenerating ? (
              <div className={styles.loadingBox}>
                <div className={styles.spinner}></div>
                <h2 className={styles.loadingTitle}>AIが着付けをしております...</h2>
                <p className={styles.loadingSubtitle}>しばらくお待ちください</p>
              </div>
            ) : (
              <img src={generatedImage} alt="Generated Yukata" className={styles.generatedImage} />
            )}
          </div>
          <div className={styles.controlArea}>
            <GestureButton variant="panel" onClick={handleRetake}>
              <span style={{ fontSize: '24px' }}>📸</span>
              <span>もう一度撮影</span>
            </GestureButton>
            <Print generatedImage={generatedImage} />
          </div>
        </div>
        <HandPointer />
      </div>
    </HandTrackingProvider>
  );
}
