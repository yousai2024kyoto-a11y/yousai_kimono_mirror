// components/GestureButton/GestureButton.jsx
import { useEffect, useState, useRef } from 'react';
import { useHandTrackingContext } from '../../contexts/HandTrackingContext';
import styles from './GestureButton.module.css';

export default function GestureButton({
  children,       
  onClick,        
  variant = 'panel', // 'panel', 'chip', 'circle'
  active = false,
  themeColor = null
}) {
  const { fingerPosition } = useHandTrackingContext();
  const buttonRef = useRef(null);
  
  // プログレス（進行度 0〜100）
  const [progress, setProgress] = useState(0);
  const [isHovering, setIsHovering] = useState(false);
  const animationFrameRef = useRef(null);
  const startTimeRef = useRef(null);
  const isClickedRef = useRef(false);

  // 決定までの時間（ミリ秒）
  const DURATION = 2000; 

  useEffect(() => {
    // ボタン要素がない、またはクリック済みなら何もしない
    if (!buttonRef.current || isClickedRef.current) return;

    if (fingerPosition) {
      const rect = buttonRef.current.getBoundingClientRect();
      // 指の位置を画面座標に変換
      const fingerX = (1 - fingerPosition.x) * window.innerWidth;
      const fingerY = fingerPosition.y * window.innerHeight;

      // 当たり判定を少し広めにとる（UX向上）
      const padding = 20;
      const isInside =
        fingerX >= rect.left - padding &&
        fingerX <= rect.right + padding &&
        fingerY >= rect.top - padding &&
        fingerY <= rect.bottom + padding;

      if (isInside) {
        if (!isHovering) {
          setIsHovering(true);
          startTimeRef.current = performance.now();
          
          // アニメーション開始
          const animate = (time) => {
            const elapsed = time - startTimeRef.current;
            const newProgress = Math.min((elapsed / DURATION) * 100, 100);
            setProgress(newProgress);

            if (newProgress < 100) {
              animationFrameRef.current = requestAnimationFrame(animate);
            } else {
              // 100%到達！クリック発火
              isClickedRef.current = true;
              onClick();
              
              // クリック後のクールダウン（連打防止）
              setTimeout(() => {
                isClickedRef.current = false;
                setProgress(0);
                setIsHovering(false);
              }, 1500);
            }
          };
          animationFrameRef.current = requestAnimationFrame(animate);
        }
      } else {
        // 指が離れたらリセット
        if (isHovering) {
          cancelAnimationFrame(animationFrameRef.current);
          setIsHovering(false);
          setProgress(0);
          startTimeRef.current = null;
        }
      }
    } else {
      // 指を見失ったらリセット
      if (isHovering) {
        cancelAnimationFrame(animationFrameRef.current);
        setIsHovering(false);
        setProgress(0);
        startTimeRef.current = null;
      }
    }
  }, [fingerPosition, isHovering, onClick]);

  // クリーンアップ
  useEffect(() => {
    return () => cancelAnimationFrame(animationFrameRef.current);
  }, []);

  const baseClass = variant === 'chip' ? styles.chip : styles.panel;
  const activeClass = active ? styles.active : '';
  const hoverClass = isHovering ? styles.hovering : '';
  
  // 円の周長（SVGアニメーション用）: 半径24px * 2 * PI ≈ 150.8
  const radius = 24;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  const handlePhysicalClick = (e) => {
    // 物理クリック時はジェスチャーのタイマーを止めて即実行
    if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    setIsHovering(false);
    setProgress(0);
    
    if (!isClickedRef.current) {
      isClickedRef.current = true;
      onClick();
      setTimeout(() => { isClickedRef.current = false; }, 1500);
    }
  };

  return (
    <button
      ref={buttonRef} 
      className={`${baseClass} ${activeClass} ${hoverClass}`}
      style={themeColor ? { '--theme-color': themeColor } : {}}
      onClick={handlePhysicalClick}
    >
      {/* ホバー時のプログレスリング（背景に表示） */}
      {isHovering && !isClickedRef.current && (
        <div className={styles.progressRing}>
          <svg width="60" height="60" viewBox="0 0 60 60">
            <circle
              className={styles.progressCircleBg}
              stroke="rgba(255,255,255,0.2)"
              strokeWidth="4"
              fill="transparent"
              r={radius}
              cx="30"
              cy="30"
            />
            <circle
              className={styles.progressCircle}
              stroke="var(--color-secondary)"
              strokeWidth="4"
              fill="transparent"
              r={radius}
              cx="30"
              cy="30"
              style={{
                strokeDasharray: `${circumference} ${circumference}`,
                strokeDashoffset: strokeDashoffset
              }}
            />
          </svg>
        </div>
      )}
      
      <div className={styles.content}>
        {children}
      </div>
    </button>
  );
}
