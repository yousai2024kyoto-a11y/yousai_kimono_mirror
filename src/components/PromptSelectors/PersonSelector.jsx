// components/PromptSelectors/PersonSelector.jsx
import GestureButton from '../GestureButton/GestureButton';
import styles from './PromptSelectors.module.css';

export default function PersonSelector({ fingerPosition, value, onChange }) {
  // 選択肢のリスト
  const options = [
    { id: 'woman', label: '女性' },
    { id: 'man', label: '男性' },
    { id: 'child', label: '子供' }
  ];

  return (
    <div className={styles.selectorContainer}>
      <span className={styles.settingLabel}>👤 着用モデル</span>
      <div className={styles.chipGroup}>
        {options.map(opt => (
          <GestureButton 
            key={opt.id}
            variant="chip" 
            fingerPosition={fingerPosition} 
            active={value === opt.id} 
            onClick={() => onChange(opt.id)}
          >
            {opt.label}
          </GestureButton>
        ))}
      </div>
    </div>
  );
}