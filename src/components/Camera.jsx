import { useEffect } from 'react';

function Camera({ deviceId, videoRef }) {
  useEffect(() => {
    let currentStream = null;

    const startCamera = async () => {
      try {
        const videoConstraints = deviceId ? { deviceId: { exact: deviceId } } : { 
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        };
        const stream = await navigator.mediaDevices.getUserMedia({ video: videoConstraints });
        currentStream = stream;

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
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
      overflow: 'hidden'
    }}>
      <video 
        ref={videoRef}
        autoPlay 
        playsInline 
        muted 
        style={{ 
          width: '100%', 
          height: '100%', 
          objectFit: 'cover', // 🌟 これで画面いっぱいに広がる
          transform: 'scaleX(-1)' // 鏡面反転
        }} 
      />
    </div>
  );
}

export default Camera
