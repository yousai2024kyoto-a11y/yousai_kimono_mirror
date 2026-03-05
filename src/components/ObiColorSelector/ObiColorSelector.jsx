// components/ObiColorSelector/ObiColorSelector.jsx
import GestureButton from '../GestureButton/GestureButton';
import styles from './ObiColorSelector.module.css';

export default function ObiColorSelector({ fingerPosition, value, onChange }) {
  // 🌟 将来、色の種類を増やしたり、柄（Pattern）のデータを足したりするのもこのファイルの中だけで完結します
  const options = [
    { id: 'auto', label: 'おまかせ', color: '#f1c40f' }, 
    { id: 'red', label: '赤系', color: '#ff4757' },
    { id: 'blue', label: '青系', color: '#1e90ff' },
    { id: 'yellow', label: '黄系', color: '#ffa502' },
    { id: 'black', label: '黒系', color: '#2f3542' }
  ];

  return (
    <div className={styles.container}>
      <span className={styles.label}>🎀 帯の色</span>
      <div className={styles.group}>
        {options.map(opt => (
          <GestureButton 
            key={opt.id}
            variant="chip" 
            themeColor={opt.color}
            fingerPosition={fingerPosition} 
            active={value === opt.id} 
            onClick={() => onChange(opt.id)}
          >
            <span style={{
              display: 'inline-block',
              width: '14px',
              height: '14px',
              borderRadius: '50%',
              backgroundColor: opt.color,
              border: '2px solid rgba(255, 255, 255, 0.8)',
              boxShadow: '0 1px 3px rgba(0,0,0,0.2)'
            }} />
            {opt.label}
          </GestureButton>
        ))}
      </div>
    </div>
  );
}