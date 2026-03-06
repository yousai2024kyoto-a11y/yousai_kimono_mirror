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
    <div className={styles.guidance}>
      {fingerPosition ? "設定を選んで、シャッターを押してください" : "画面の前に立ってください"}
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
        
        {/* 背景: カメラ */}
        <div className={styles.cameraLayer}>
          <Camera videoRef={videoRef} />
        </div>

        {/* 🌟 3セクションHUDレイアウト */}
        <div className={styles.uiLayer}>
          
          <section className={styles.topSection}>
            <Guidance />
          </section>

          <section className={styles.midSection}>
            {/* PC左 */}
            <aside className={`${styles.panel} ${styles.desktopSidebar}`}>
              <ObiColorSelector value={obiColor} onChange={setObiColor} />
            </aside>

            {/* 中央シャッター */}
            <ShutterButton videoRef={videoRef} onCapture={handleCapture} />

            {/* PC右 */}
            <aside className={`${styles.panel} ${styles.desktopSidebar}`}>
              <PersonSelector value={targetPerson} onChange={setTargetPerson} />
              <div style={{ marginTop: '10px' }}>
                <BackgroundSelector value={backgroundStyle} onChange={setBackgroundStyle} />
              </div>
            </aside>
          </section>

          <section className={styles.bottomSection}>
            {/* スマホ用パネル（縦長時のみ表示） */}
            <div className={styles.mobilePanel}>
              <div className={styles.scrollRow}>
                <PersonSelector value={targetPerson} onChange={setTargetPerson} />
                <BackgroundSelector value={backgroundStyle} onChange={setBackgroundStyle} />
              </div>
              <ObiColorSelector value={obiColor} onChange={setObiColor} />
            </div>
          </section>

        </div>

        {/* 固定パーツ */}
        <div className={styles.homeBtn}>
          <HomeButton onClick={() => navigate('/')} />
        </div>

        {isCapturing && <div className={styles.flash} />}
        <HandPointer />
      </div>
    </HandTrackingProvider>
  );
}
