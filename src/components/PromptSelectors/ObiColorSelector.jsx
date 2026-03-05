// components/PromptSelectors/ObiColorSelector.jsx
import GestureButton from '../GestureButton/GestureButton';
import styles from './PromptSelectors.module.css';

export default function ObiColorSelector({ fingerPosition, value, onChange }) {
  const options = [
    // { id: 'auto', label: 'おまかせ' },
    { id: 'red', label: '#f00' },
    { id: 'blue', label: '#00f' },
    { id: 'pink', label: '#f0f' },
    { id: 'black', label: '#000' }
  ];

  return (
    <div className={styles.selectorContainer}>
      <div className={styles.chipGroup}>
        {options.map(opt => (
          <GestureButton
            key={opt.id}
            icon=''
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