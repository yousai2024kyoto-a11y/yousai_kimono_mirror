import { useEffect, useState } from 'react';

function Camera({ deviceId, videoRef }) {
  const [isFrontCamera, setIsFrontCamera] = useState(true);

  useEffect(() => {
    let currentStream = null;

    const startCamera = async () => {
      try {
        const videoConstraints = deviceId ? { deviceId: { exact: deviceId } } : { 
          facingMode: 'user', // デフォルトはインカメラ
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        };
        const stream = await navigator.mediaDevices.getUserMedia({ video: videoConstraints });
        currentStream = stream;

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          
          // 🌟 カメラの向きを判定（インカメラなら反転、アウトカメラなら反転なし）
          const track = stream.getVideoTracks()[0];
          const settings = track.getSettings();
          // user, front は反転。environment, back は反転なし
          const facing = settings.facingMode || '';
          setIsFrontCamera(facing.includes('user') || facing === '' || !facing); 
        }
      } catch (error) {
        console.error("カメラの起動に失敗しました:", error);
      }
    };

    startCamera();

    return () => {
      if (currentStream) {
        currentStream.getTracks().forEach(track => track.stop());
      }
    };
  }, [deviceId, videoRef]);

  return (
    <div style={{ 
      width: '100vw', 
      height: '100vh', 
      position: 'absolute', 
      top: 0, 
      left: 0,
      overflow: 'hidden',
      backgroundColor: '#000'
    }}>
      <video 
        ref={videoRef}
        autoPlay 
        playsInline 
        muted 
        style={{ 
          width: '100%', 
          height: '100%', 
          objectFit: 'cover',
          // 🌟 インカメラの時だけ鏡面反転させる
          transform: isFrontCamera ? 'scaleX(-1)' : 'none'
        }} 
      />
    </div>
  );
}

export default Camera
