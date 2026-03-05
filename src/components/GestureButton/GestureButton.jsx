// components/GestureButton/GestureButton.jsx
import { useEffect, useState, useRef } from 'react';
import styles from './GestureButton.module.css';

export default function GestureButton({
  children,       
  onClick,        
  fingerPosition, 
  variant = 'panel', // 'panel' または 'chip'
  active = false  
}) {
  const buttonRef = useRef(null);
  const [isHovering, setIsHovering] = useState(false);
  const hoverTimerRef = useRef(null);
  const isClickedRef = useRef(false);

  useEffect(() => {
    // ボタンの描画完了＆指認識＆まだクリック処理中でない場合
    if (fingerPosition && !isClickedRef.current && buttonRef.current) {
      
      // 🌟 CSSでサイズや隙間を変えても、ここで常に「今の正確な位置とサイズ」を取得する！
      const rect = buttonRef.current.getBoundingClientRect();

      const fingerX = (1 - fingerPosition.x) * window.innerWidth;
      const fingerY = fingerPosition.y * window.innerHeight;

      const isInside =
        fingerX >= rect.left &&
        fingerX <= rect.right &&
        fingerY >= rect.top &&
        fingerY <= rect.bottom;

      if (isInside) {
        if (!hoverTimerRef.current) {
          setIsHovering(true);
          // 2.5秒ホバーでクリック判定
          hoverTimerRef.current = setTimeout(() => {
            isClickedRef.current = true;
            onClick();
            setTimeout(() => { isClickedRef.current = false; }, 2000);
          }, 2500);
        }
      } else {
        if (hoverTimerRef.current) {
          clearTimeout(hoverTimerRef.current);
          hoverTimerRef.current = null;
          setIsHovering(false);
        }
      }
    } else {
      if (hoverTimerRef.current) {
        clearTimeout(hoverTimerRef.current);
        hoverTimerRef.current = null;
        setIsHovering(false);
      }
    }
  }, [fingerPosition, onClick]);

  const baseClass = variant === 'chip' ? styles.chip : styles.panel;
  const activeClass = active ? styles.active : '';
  const hoverClass = isHovering ? styles.hovering : '';

  return (
    <button
      ref={buttonRef} 
      className={`${baseClass} ${activeClass} ${hoverClass}`}
      onClick={() => { if(!isClickedRef.current) onClick(); }}
    >
      {children}
    </button>
  );
}