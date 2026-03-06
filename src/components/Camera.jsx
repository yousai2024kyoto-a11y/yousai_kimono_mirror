import { useEffect, useState } from 'react';

function Camera({ deviceId, videoRef }) {
  const [isFrontCamera, setIsFrontCamera] = useState(true);

  useEffect(() => {
    let currentStream = null;

    const startCamera = async () => {
      try {
        // 🌟 カメラ制約の最適化
        const videoConstraints = deviceId ? { deviceId: { exact: deviceId } } : { 
          // 優先順位: 1. 指定された向き 2. デフォルト
          facingMode: { ideal: 'user' }, 
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        };

        const stream = await navigator.mediaDevices.getUserMedia({ 
          video: videoConstraints,
          audio: false 
        });
        
        currentStream = stream;

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          
          const track = stream.getVideoTracks()[0];
          const settings = track.getSettings();
          
          // 🌟 より確実にイン/アウト判定（facingModeが取れない場合のフォールバック）
          const facing = settings.facingMode || '';
          const label = track.label.toLowerCase();
          
          const isUser = facing.includes('user') || label.includes('front') || label.includes('selfie');
          setIsFrontCamera(isUser);
        }
      } catch (error) {
        console.error("カメラの起動に失敗しました:", error);
        // 失敗した場合のフォールバック（最低限のカメラ起動）
        try {
          const fallbackStream = await navigator.mediaDevices.getUserMedia({ video: true });
          currentStream = fallbackStream;
          if (videoRef.current) videoRef.current.srcObject = fallbackStream;
        } catch (e) {
          console.error("フォールバックカメラも失敗:", e);
        }
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
      inset: 0,
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
          transform: isFrontCamera ? 'scaleX(-1)' : 'none'
        }} 
      />
    </div>
  );
}

export default Camera
