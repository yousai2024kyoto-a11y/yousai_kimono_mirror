// pages/Yukata.jsx
import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

import Camera from '../components/Camera';
import ShutterButton from '../components/ShutterButton/ShutterButton';
import HomeButton from '../components/HomeButton/HomeButton';
import PersonSelector from '../components/PromptSelectors/PersonSelector';
import ObiColorSelector from '../components/ObiColorSelector/ObiColorSelector';
import BackgroundSelector from '../components/PromptSelectors/BackgroundSelector';
import { HandTrackingProvider, useHandTrackingContext } from '../contexts/HandTrackingContext';
import HandPointer from '../components/HandPointer/HandPointer';
import styles from './Yukata.module.css';

function GuidanceSystem() {
  const { fingerPosition } = useHandTrackingContext();
  if (!fingerPosition) {
    return <div className={styles.guidanceText}>画面の前に立ってください</div>;
  }
  return null;
}

export default function Yukata() {
  const navigate = useNavigate();
  const [targetCameraId, setTargetCameraId] = useState(null);
  const [targetPerson, setTargetPerson] = useState('woman');
  const [obiColor, setObiColor] = useState('auto');
  const [backgroundStyle, setBackgroundStyle] = useState('style_studio');
  const [useAI, setUseAI] = useState(true);
  const [isCapturing, setIsCapturing] = useState(false);
  const videoRef = useRef(null);

  useEffect(() => {
    const savedId = localStorage.getItem('preferredCameraId');
    if (savedId) setTargetCameraId(savedId);
    const savedAI = localStorage.getItem('useMediaPipe');
    if (savedAI !== null) setUseAI(savedAI === 'true');
  }, []);

  const handleCapture = (photoData) => {
    setIsCapturing(true); 
    sessionStorage.setItem('originalPhoto', photoData);
    sessionStorage.setItem('targetPerson', targetPerson);
    sessionStorage.setItem('obiColor', obiColor);
    sessionStorage.setItem('backgroundStyle', backgroundStyle);
    setTimeout(() => navigate('/preview'), 200);
  };

  return (
    <HandTrackingProvider videoRef={videoRef} isEnabled={useAI}>
      <div className={styles.container}>
        
        <div className={styles.cameraWrapper}>
          <Camera deviceId={targetCameraId} videoRef={videoRef} />
        </div>

        <div className={styles.uiOverlay}>
          {/* 上部 */}
          <header className={styles.header}>
            <GuidanceSystem />
          </header>

          {/* 左サイド（PC用） */}
          <aside className={styles.overlayLeft}>
            <ObiColorSelector value={obiColor} onChange={setObiColor} />
          </aside>

          {/* 中央（シャッター） */}
          <main className={styles.centerArea}>
            <ShutterButton videoRef={videoRef} onCapture={handleCapture} />
          </main>

          {/* 右サイド（PC用） */}
          <aside className={styles.overlayRight}>
            <PersonSelector value={targetPerson} onChange={setTargetPerson} />
            <div style={{ marginTop: '20px' }}>
              <BackgroundSelector value={backgroundStyle} onChange={setBackgroundStyle} />
            </div>
          </aside>

          {/* 下部パネル（モバイル用） */}
          <footer className={styles.mobileControls}>
            <div className={styles.horizontalScroll}>
              <PersonSelector value={targetPerson} onChange={setTargetPerson} />
              <BackgroundSelector value={backgroundStyle} onChange={setBackgroundStyle} />
            </div>
            <div style={{ padding: '0 10px' }}>
              <ObiColorSelector value={obiColor} onChange={setObiColor} />
            </div>
          </footer>
        </div>

        <div className={styles.topLeftOverlay}>
          <HomeButton onClick={() => navigate('/')} />
        </div>

        {isCapturing && <div className={styles.flashOverlay} />}
        <HandPointer />
      </div>
    </HandTrackingProvider>
  );
}
