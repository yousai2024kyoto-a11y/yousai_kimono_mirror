// pages/Home.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import SettingsMenu from '../components/SettingsMenu/SettingsMenu';
import styles from './Home.module.css';

export default function Home() {
  // 設定メニューが開いているかどうかの状態（State）
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const navigate = useNavigate();

  const startFitting = () => {
    navigate('/yukata')
  }

  return (
    <div className={styles.container}>
      
      {/* 🌟 ギアアイコン（クリックで設定メニューを開く） */}
      <button 
        className={styles.settingsButton} 
        onClick={() => setIsSettingsOpen(true)}
        title="設定を開く"
      >
        ⚙️
      </button>

      {/* メインのタイトル画面 */}
      <div className={styles.mainContent}>
        <h1 className={styles.title}>Kimono Mirror</h1>
        <p className={styles.subtitle}>AIで体験する、新しい浴衣の試着</p>

        <button className={styles.startButton} onClick={startFitting}>
          試着をはじめる
        </button>
      </div>

      {/* 🌟 設定メニューのモーダル（isSettingsOpen が true の時だけ表示される） */}
      {isSettingsOpen && (
        <SettingsMenu onClose={() => setIsSettingsOpen(false)} />
      )}
      
    </div>
  );
}