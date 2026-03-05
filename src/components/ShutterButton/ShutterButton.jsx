// components/ShutterButton/ShutterButton.jsx
import { useRef, useEffect, useState } from 'react';
import styles from './ShutterButton.module.css';

export default function ShutterButton({ videoRef, fingerPosition, onCapture }) {
  const canvasRef = useRef(null);
  
  const [isShooting, setIsShooting] = useState(false);
  const [countdown, setCountdown] = useState(null); 
  const isShootingRef = useRef(false);

  // 🌟 追加：ホバー（指が重なっている）状態と、タイマーの目印
  const [isHovering, setIsHovering] = useState(false);
  const hoverTimerRef = useRef(null);

  // AIの当たり判定（ホバー機能付きにアップグレード！）
  useEffect(() => {
    // 指が認識されている場合
    if (fingerPosition) {
      const btnX_min = 0.4; 
      const btnX_max = 0.6;
      const btnY_min = 0.75;
      const btnY_max = 0.95;

      // 指がエリア内に入っているかどうかの判定結果（true / false）
      const isInside = 
        fingerPosition.x > btnX_min && fingerPosition.x < btnX_max &&
        fingerPosition.y > btnY_min && fingerPosition.y < btnY_max;

      if (isInside) {
        // エリア内にいて、かつ「まだ撮影中でない」「タイマーも動いていない」場合
        if (!isShootingRef.current && !hoverTimerRef.current) {
          setIsHovering(true); // ホバー開始！（ボタンの見た目を変える用）
          
          // 🌟 2秒間（2000ミリ秒）指を止め続けたら、シャッターを起動する
          hoverTimerRef.current = setTimeout(() => {
            triggerShutter();
            hoverTimerRef.current = null;
            setIsHovering(false);
          }, 2000); 
        }
      } else {
        // 🌟 エリア外に出た場合：タイマーをキャンセルしてリセットする！
        if (hoverTimerRef.current) {
          clearTimeout(hoverTimerRef.current);
          hoverTimerRef.current = null;
          setIsHovering(false);
        }
      }
    } else {
      // 🌟 指が画面から消えた場合もリセットする
      if (hoverTimerRef.current) {
        clearTimeout(hoverTimerRef.current);
        hoverTimerRef.current = null;
        setIsHovering(false);
      }
    }
  }, [fingerPosition]);

  const triggerShutter = () => {
    isShootingRef.current = true;
    setIsShooting(true); 
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
      setTimeout(() => {
        isShootingRef.current = false;
        setIsShooting(false);
      }, 1000);
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
        const imageUrl = canvas.toDataURL('image/jpeg');
        onCapture(imageUrl); 
      }
    }
  };

  return (
    <>
      <div className={styles.hitArea}>
        <div className={styles.hitBoxHint} />
        
        <div className={styles.outerRing}>
          <div 
            // 🌟 クラス名の条件を追加：ホバー中（isHovering）なら .hovering クラスを付ける
            className={`
              ${styles.innerCircle} 
              ${isHovering ? styles.hovering : ''} 
              ${isShooting ? styles.shooting : ''}
            `}
            onClick={!isShootingRef.current ? triggerShutter : undefined}
          />
        </div>
      </div>

      {countdown !== null && countdown > 0 && (
        <div key={countdown} className={styles.countdownOverlay}>
          {countdown}
        </div>
      )}

      <canvas ref={canvasRef} style={{ display: 'none' }} />
    </>
  );
}