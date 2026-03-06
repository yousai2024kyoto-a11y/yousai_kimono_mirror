import React from 'react';
import GestureButton from '../GestureButton/GestureButton';
import styles from '../../pages/Yukata.module.css';

export default function CapturedPreview({ 
  photoData, 
  targetPerson, 
  obiColor, 
  onRetake, 
  onProceed 
}) {
  const getPersonLabel = (person) => {
    switch (person) {
      case 'woman': return '女性';
      case 'man': return '男性';
      case 'child': return '子供';
      default: return person;
    }
  };

  const getObiLabel = (color) => {
    switch (color) {
      case 'auto': return 'おまかせ';
      case 'red': return '赤系';
      case 'blue': return '青系';
      case 'yellow': return '黄系';
      case 'black': return '黒系';
      default: return color;
    }
  };

  return (
    <div className={styles.previewBox}>
      <h3>✨ 綺麗に撮れました！ ✨</h3>
      <img src={photoData} alt="Captured" className={styles.previewImage} />
      
      <p style={{ color: '#555', marginTop: '10px', fontSize: '14px', fontWeight: 'bold' }}>
        適用される設定: {getPersonLabel(targetPerson)} / 
        帯: {getObiLabel(obiColor)}
      </p>
      
      <div className={styles.actionGroup}>
        <GestureButton variant="chip" onClick={onRetake}>
          撮り直す
        </GestureButton>
        
        <GestureButton variant="chip" active={true} onClick={onProceed}>
          🚀 AIで着付けする
        </GestureButton>
      </div>
    </div>
  );
}
