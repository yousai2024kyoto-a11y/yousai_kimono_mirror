import { useEffect } from 'react';

// 引数に `videoRef` を追加して受け取ります！
function Camera({ deviceId, videoRef }) {
  useEffect(() => {
    let currentStream = null;

    const startCamera = async () => {
      try {
        const videoConstraints = deviceId ? { deviceId: { exact: deviceId } } : true;
        const stream = await navigator.mediaDevices.getUserMedia({ video: videoConstraints });
        currentStream = stream;

        // 親から渡された videoRef をそのまま使います
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
  }, [deviceId, videoRef]); // 依存配列に videoRef も追加

  return (
    <div style={{ textAlign: 'center' }}>
      <video 
        ref={videoRef} // 親からもらった目印をセット！
        autoPlay 
        playsInline 
        muted 
        style={{ 
          width: '100%', 
          maxWidth: '100%', 
          objectFit: 'cover',
          transform: 'scaleX(-1)' // 鏡面反転
        }} 
      />
    </div>
  );
}

export default Camera