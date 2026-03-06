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

function Guidance() {
  const { fingerPosition } = useHandTrackingContext();
  return !fingerPosition ? <div className={styles.guidanceText}>画面の前に立ってください</div> : null;
}

export default function Yukata() {
  const navigate = useNavigate();
  const [targetPerson, setTargetPerson] = useState('woman');
  const [obiColor, setObiColor] = useState('auto');
  const [backgroundStyle, setBackgroundStyle] = useState('style_studio');
  const [isCapturing, setIsCapturing] = useState(false);
  const videoRef = useRef(null);

  const handleCapture = (photoData) => {
    setIsCapturing(true); 
    sessionStorage.setItem('originalPhoto', photoData);
    sessionStorage.setItem('targetPerson', targetPerson);
    sessionStorage.setItem('obiColor', obiColor);
    sessionStorage.setItem('backgroundStyle', backgroundStyle);
    setTimeout(() => navigate('/preview'), 200);
  };

  return (
    <HandTrackingProvider videoRef={videoRef}>
      <div className={styles.container}>
        {/* レイヤー1: カメラ映像 */}
        <div className={styles.cameraWrapper}>
          <Camera videoRef={videoRef} />
        </div>

        {/* レイヤー2: UIオーバーレイ */}
        <div className={styles.uiOverlay}>
          <header className={styles.header}>
            <Guidance />
          </header>

          <main className={styles.mainContent}>
            <div className={styles.desktopOnly}>
              <aside className={styles.sidePanel}>
                <ObiColorSelector value={obiColor} onChange={setObiColor} />
              </aside>
            </div>

            <ShutterButton videoRef={videoRef} onCapture={handleCapture} />

            <div className={styles.desktopOnly}>
              <aside className={styles.sidePanel}>
                <PersonSelector value={targetPerson} onChange={setTargetPerson} />
                <div style={{ marginTop: '15px' }}>
                  <BackgroundSelector value={backgroundStyle} onChange={setBackgroundStyle} />
                </div>
              </aside>
            </div>
          </main>

          <footer className={styles.footer}>
            <div className={styles.mobilePanel}>
              <div className={styles.scrollRow}>
                <PersonSelector value={targetPerson} onChange={setTargetPerson} />
                <BackgroundSelector value={backgroundStyle} onChange={setBackgroundStyle} />
              </div>
              <ObiColorSelector value={obiColor} onChange={setObiColor} />
            </div>
          </footer>
        </div>

        {/* 最前面レイヤー: ホームボタンとポインター */}
        <div className={styles.topLeftOverlay}>
          <HomeButton onClick={() => navigate('/')} />
        </div>

        {isCapturing && <div className={styles.flashOverlay} />}
        <HandPointer />
      </div>
    </HandTrackingProvider>
  );
}
