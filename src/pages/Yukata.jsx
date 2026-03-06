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
  return (
    <div className={styles.guidanceChip}>
      {fingerPosition ? "設定を選び、シャッターへ手をかざしてください" : "画面の前に立ってください"}
    </div>
  );
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
        
        {/* レイヤー1: 背景カメラ */}
        <div className={styles.cameraLayer}>
          <Camera videoRef={videoRef} />
        </div>

        {/* レイヤー2: UI操作層 */}
        <div className={styles.uiLayer}>
          
          <header className={styles.headerArea}>
            <Guidance />
          </header>

          <main className={styles.mainLayout}>
            {/* PC: 左サイド */}
            <aside className={styles.desktopSidebar}>
              <div className={styles.glassPanel}>
                <ObiColorSelector value={obiColor} onChange={setObiColor} />
              </div>
            </aside>

            {/* 中央: シャッター */}
            <div className={styles.centerArea}>
              <ShutterButton videoRef={videoRef} onCapture={handleCapture} />
            </div>

            {/* PC: 右サイド */}
            <aside className={styles.desktopSidebar}>
              <div className={styles.glassPanel}>
                <PersonSelector value={targetPerson} onChange={setTargetPerson} />
              </div>
              <div className={styles.glassPanel}>
                <BackgroundSelector value={backgroundStyle} onChange={setBackgroundStyle} />
              </div>
            </aside>

            {/* スマホ: 下部パネル */}
            <footer className={styles.mobilePanel}>
              <div className={styles.mobileScrollRow}>
                <PersonSelector value={targetPerson} onChange={setTargetPerson} />
                <BackgroundSelector value={backgroundStyle} onChange={setBackgroundStyle} />
              </div>
              <ObiColorSelector value={obiColor} onChange={setObiColor} />
            </footer>
          </main>

        </div>

        {/* 固定パーツ */}
        <div className={styles.homeButtonPos}>
          <HomeButton onClick={() => navigate('/')} />
        </div>

        {isCapturing && <div className={styles.flash} />}
        <HandPointer />
      </div>
    </HandTrackingProvider>
  );
}
