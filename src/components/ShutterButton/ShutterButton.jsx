// components/ShutterButton/ShutterButton.jsx
import { useRef, useEffect, useState } from 'react';
import { useHandTrackingContext } from '../../contexts/HandTrackingContext';
import styles from './ShutterButton.module.css';

export default function ShutterButton({ videoRef, onCapture }) {
  const { fingerPosition } = useHandTrackingContext();
  const canvasRef = useRef(null);
  const [countdown, setCountdown] = useState(null); 
  const isShootingRef = useRef(false);
  const [hoverProgress, setHoverProgress] = useState(0);
  const startTimeRef = useRef(null);
  const animationFrameRef = useRef(null);

  const DURATION = 2000; 

  // ジェスチャー判定
  useEffect(() => {
    if (fingerPosition && !isShootingRef.current) {
      const isInside = 
        (fingerPosition.x > 0.4 && fingerPosition.x < 0.6 && fingerPosition.y > 0.05 && fingerPosition.y < 0.25) ||
        (fingerPosition.x > 0.4 && fingerPosition.x < 0.6 && fingerPosition.y > 0.75 && fingerPosition.y < 0.95);

      if (isInside) {
        if (!startTimeRef.current) {
          startTimeRef.current = performance.now();
          const animate = (time) => {
            const elapsed = time - startTimeRef.current;
            const progress = Math.min((elapsed / DURATION) * 100, 100);
            setHoverProgress(progress);
            if (progress < 100) animationFrameRef.current = requestAnimationFrame(animate);
            else triggerShutter();
          };
          animationFrameRef.current = requestAnimationFrame(animate);
        }
      } else resetHover();
    } else resetHover();
  }, [fingerPosition]);

  const resetHover = () => {
    if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    startTimeRef.current = null;
    setHoverProgress(0);
  };

  const triggerShutter = () => {
    if (isShootingRef.current) return;
    isShootingRef.current = true;
    setCountdown(3); 
  };

  useEffect(() => {
    if (countdown === null) return;
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer); 
    } else if (countdown === 0) {
      takePhoto();
      setCountdown(null);
      setTimeout(() => { isShootingRef.current = false; }, 1000);
    }
  }, [countdown]);

  const takePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.translate(canvas.width, 0);
        ctx.scale(-1, 1);
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        onCapture(canvas.toDataURL('image/jpeg')); 
      }
    }
  };

  return (
    <>
      <div className={styles.shutterContainer}>
        {/* 🌟 物理クリック(onClick)を確実に追加 */}
        <button 
          className={styles.shutterButton} 
          onClick={triggerShutter}
          aria-label="シャッター"
        >
          <div className={styles.innerCircle}>
            {hoverProgress > 0 && (
              <div className={styles.progressFill} style={{ height: `${hoverProgress}%` }} />
            )}
          </div>
        </button>
      </div>

      {countdown !== null && (
        <div className={styles.countdownOverlay}>
          <div className={styles.countdownNumber}>{countdown > 0 ? countdown : ''}</div>
        </div>
      )}
      <canvas ref={canvasRef} style={{ display: 'none' }} />
    </>
  );
}
