// components/SettingsMenu/CameraSettings.jsx
import { useState, useEffect } from 'react';
import styles from './SettingsMenu.module.css';

export default function CameraSettings() {
  const [cameras, setCameras] = useState([]);
  const [selectedCameraId, setSelectedCameraId] = useState('');

  useEffect(() => {
    // 接続されているカメラの一覧を取得
    navigator.mediaDevices.enumerateDevices().then(devices => {
      const videoDevices = devices.filter(device => device.kind === 'videoinput');
      setCameras(videoDevices);
    });

    // 保存されているカメラ設定があれば読み込む
    const savedId = localStorage.getItem('preferredCameraId');
    if (savedId) setSelectedCameraId(savedId);
  }, []);

  const handleCameraChange = (e) => {
    const newId = e.target.value;
    setSelectedCameraId(newId);
    localStorage.setItem('preferredCameraId', newId);
  };

  return (
    <div className={styles.settingRow}>
      <div>
        <div className={styles.settingLabel}>📸 カメラを選択</div>
        <div className={styles.settingDescription}>使用するWebカメラ</div>
      </div>
      
      <select 
        className={styles.selectBox} 
        value={selectedCameraId} 
        onChange={handleCameraChange}
      >
        <option value="">デフォルト</option>
        {cameras.map(camera => (
          <option key={camera.deviceId} value={camera.deviceId}>
            {/* 名前が長すぎる場合は省略する */}
            {camera.label ? (camera.label.length > 15 ? `${camera.label.substring(0, 15)}...` : camera.label) : `カメラ ${camera.deviceId.substring(0, 5)}...`}
          </option>
        ))}
      </select>
    </div>
  );
}