// pages/Yukata.jsx
import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

import Camera from '../components/Camera';
import ShutterButton from '../components/ShutterButton/ShutterButton';
import HomeButton from '../components/HomeButton/HomeButton';
import GestureButton from '../components/GestureButton/GestureButton';
import PersonSelector from '../components/PromptSelectors/PersonSelector';
import ObiColorSelector from '../components/ObiColorSelector/ObiColorSelector';
import useHandTracking from '../hooks/useHandTracking';
import styles from './Yukata.module.css';

export default function Yukata() {
  const navigate = useNavigate();
  const [targetCameraId, setTargetCameraId] = useState(null);
  const [photoData, setPhotoData] = useState(null);
  
  const [targetPerson, setTargetPerson] = useState('woman');
  const [obiColor, setObiColor] = useState('auto');
  
  // デフォルトはAIオン
  const [useAI, setUseAI] = useState(true);
  
  const videoRef = useRef(null);
  const fingerPosition = useHandTracking(videoRef, useAI);

  useEffect(() => {
    const savedId = localStorage.getItem('preferredCameraId');
    if (savedId) setTargetCameraId(savedId);

    // 設定画面からAIのON/OFFを読み込む
    const savedAI = localStorage.getItem('useMediaPipe');
    if (savedAI !== null) setUseAI(savedAI === 'true');
  }, []);

  const goBack = () => {
    navigate('/'); 
  };

  const clearPhoto = () => {
    setPhotoData(null);
  };

  const goToPreview = () => {
    sessionStorage.setItem('originalPhoto', photoData);
    sessionStorage.setItem('targetPerson', targetPerson);
    sessionStorage.setItem('obiColor', obiColor);
    navigate('/preview');
  };

  return (
    <div className={styles.container}>
      
      <div className={styles.cameraWrapper}>
        <Camera deviceId={targetCameraId} videoRef={videoRef} />
        
        {!photoData && (
          <>
            <div className={styles.overlayLeft}>
              <ObiColorSelector 
                fingerPosition={fingerPosition} 
                value={obiColor} 
                onChange={setObiColor} 
              />
            </div>

            <div className={styles.overlayRight}>
              <PersonSelector 
                fingerPosition={fingerPosition} 
                value={targetPerson} 
                onChange={setTargetPerson} 
              />
            </div>

            <ShutterButton 
              videoRef={videoRef} 
              fingerPosition={fingerPosition} 
              onCapture={setPhotoData} 
            />
          </>
        )}

        {useAI && fingerPosition && (
          <div
            className={styles.pointer}
            style={{ left: `${(1 - fingerPosition.x) * 100}%`, top: `${fingerPosition.y * 100}%` }}
          />
        )}
      </div>

      <div className={styles.header}>
        <h1 className={styles.title}>浴衣 試着ルーム👘</h1>
      </div>
      <div className={styles.bottomLeftOverlay}>
        <div style={{ pointerEvents: 'auto' }}>
          <HomeButton onClick={goBack} fingerPosition={fingerPosition} />
        </div>
      </div>

      {photoData && (
        <div className={styles.previewBox}>
          <h3>✨ 綺麗に撮れました！ ✨</h3>
          <img src={photoData} alt="Captured" className={styles.previewImage} />
          
          <p style={{ color: '#555', marginTop: '10px', fontSize: '14px', fontWeight: 'bold' }}>
            適用される設定: {targetPerson === 'woman' ? '女性' : targetPerson === 'man' ? '男性' : '子供'} / 
            帯: {obiColor === 'auto' ? 'おまかせ' : obiColor === 'red' ? '赤系' : obiColor === 'blue' ? '青系' : obiColor === 'yellow' ? '黄系' : '黒系'}
          </p>
          
          <div className={styles.actionGroup}>
            <GestureButton variant="chip" fingerPosition={fingerPosition} onClick={clearPhoto}>
              撮り直す
            </GestureButton>
            
            <GestureButton variant="chip" fingerPosition={fingerPosition} active={true} onClick={goToPreview}>
              🚀 AIで着付けする
            </GestureButton>
          </div>
        </div>
      )}
    </div>
  );
}