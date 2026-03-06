// pages/Yukata.jsx
import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

import Camera from '../components/Camera';
import ShutterButton from '../components/ShutterButton/ShutterButton';
import HomeButton from '../components/HomeButton/HomeButton';
import PersonSelector from '../components/PromptSelectors/PersonSelector';
import ObiColorSelector from '../components/ObiColorSelector/ObiColorSelector';
import { HandTrackingProvider, useHandTrackingContext } from '../contexts/HandTrackingContext';
import HandPointer from '../components/HandPointer/HandPointer';
import styles from './Yukata.module.css';

function GuidanceSystem() {
  const { fingerPosition } = useHandTrackingContext();
  if (!fingerPosition) return (
    <div className={styles.guidanceOverlay}>
      <div className={styles.guidanceText}>画面の前に立ってください</div>
    </div>
  );
  return null;
}
import BackgroundSelector from '../components/PromptSelectors/BackgroundSelector';

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

    setTimeout(() => {
      navigate('/preview');
    }, 200);
  };

  return (
    <HandTrackingProvider videoRef={videoRef} isEnabled={useAI}>
      <div className={styles.container}>
        <div className={styles.cameraWrapper}>
          <Camera deviceId={targetCameraId} videoRef={videoRef} />
          <GuidanceSystem />
          <div className={styles.overlayLeft}>
            <ObiColorSelector value={obiColor} onChange={setObiColor} />
          </div>
          <div className={styles.overlayRight}>
            <PersonSelector value={targetPerson} onChange={setTargetPerson} />
            <div style={{ marginTop: '20px' }}>
              <BackgroundSelector value={backgroundStyle} onChange={setBackgroundStyle} />
            </div>
          </div>
          <ShutterButton videoRef={videoRef} onCapture={handleCapture} />
        </div>
...
        <div className={styles.topLeftOverlay}>
          <HomeButton onClick={() => navigate('/')} />
        </div>
        {isCapturing && <div className={styles.flashOverlay} />}
        <HandPointer />
      </div>
    </HandTrackingProvider>
  );
}
