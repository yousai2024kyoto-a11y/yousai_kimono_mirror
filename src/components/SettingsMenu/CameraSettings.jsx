// components/SettingsMenu/CameraSettings.jsx
import { useState, useEffect } from 'react';
import styles from './SettingsMenu.module.css';

export default function CameraSettings() {
  const [cameras, setCameras] = useState([]);
  const [selectedCameraId, setSelectedCameraId] = useState('');

  const loadCameras = async () => {
    try {
      // 🌟 重要：一度カメラ権限を要求しないと、デバイス名（label）が取得できないブラウザが多い
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      
      // デバイス一覧を取得
      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = devices.filter(device => device.kind === 'videoinput');
      setCameras(videoDevices);

      // 使用が終わった一時的なストリームを止める
      stream.getTracks().forEach(track => track.stop());
    } catch (error) {
      console.error("カメラリストの取得に失敗しました:", error);
      // 権限拒否された場合でもリストだけは試みる
      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = devices.filter(device => device.kind === 'videoinput');
      setCameras(videoDevices);
    }
  };

  useEffect(() => {
    loadCameras();

    // 保存されているカメラ設定を読み込む
    const savedId = localStorage.getItem('preferredCameraId');
    if (savedId) setSelectedCameraId(savedId);
  }, []);

  const handleCameraChange = (e) => {
    const newId = e.target.value;
    setSelectedCameraId(newId);
    localStorage.setItem('preferredCameraId', newId);
    // 🌟 即座に反映させるためにページをリロードするか、親に通知する
    // 今回は最も確実な「リロード（再起動）」を促すか、自動で行います
    window.location.reload(); 
  };

  return (
    <div className={styles.settingRow}>
      <div>
        <div className={styles.settingLabel}>📸 カメラを選択</div>
        <div className={styles.settingDescription}>
          {cameras.length > 0 ? `${cameras.length}台のカメラを検出` : "カメラを読み込み中..."}
        </div>
      </div>
      
      <select 
        className={styles.selectBox} 
        value={selectedCameraId} 
        onChange={handleCameraChange}
      >
        <option value="">デフォルト</option>
        {cameras.map(camera => (
          <option key={camera.deviceId} value={camera.deviceId}>
            {camera.label || `カメラ (${camera.deviceId.substring(0, 5)})`}
          </option>
        ))}
      </select>
    </div>
  );
}
