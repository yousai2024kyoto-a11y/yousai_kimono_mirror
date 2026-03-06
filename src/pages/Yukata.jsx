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
    if (isCapturing) return;
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
        
        <div className={styles.cameraLayer}>
          <Camera videoRef={videoRef} />
        </div>

        <div className={styles.uiLayer}>
          
          {/* 上部: 案内 + 上部シャッター */}
          <section className={styles.topSection}>
            <Guidance />
            <ShutterButton videoRef={videoRef} onCapture={handleCapture} position="top" />
          </section>

          {/* 中央: 左右にパネルを配置 (PC/スマホ共通) */}
          <section className={styles.midSection}>
            <aside className={styles.panel}>
              <ObiColorSelector value={obiColor} onChange={setObiColor} />
            </aside>

            {/* 中央はあえて空けて被写体を見せる */}
            <div style={{ flex: 1, pointerEvents: 'none' }} />

            <aside className={styles.panel}>
              <PersonSelector value={targetPerson} onChange={setTargetPerson} />
              <div style={{ marginTop: '10px' }}>
                <BackgroundSelector value={backgroundStyle} onChange={setBackgroundStyle} />
              </div>
            </aside>
          </section>

          {/* 下部: 下部シャッター */}
          <section className={styles.bottomSection}>
            <ShutterButton videoRef={videoRef} onCapture={handleCapture} position="bottom" />
          </section>

        </div>

        <div className={styles.homeBtn}>
          <HomeButton onClick={() => navigate('/')} />
        </div>

        {isCapturing && <div className={styles.flash} />}
        <HandPointer />
      </div>
    </HandTrackingProvider>
  );
}
