import { useEffect, useState } from 'react';

function Camera({ deviceId, videoRef }) {
  const [isFrontCamera, setIsFrontCamera] = useState(true);

  useEffect(() => {
    let currentStream = null;

    const startCamera = async () => {
      try {
        // 🌟 deviceIdがある場合はそれを優先、ない場合はfacingMode指定
        const videoConstraints = deviceId 
          ? { deviceId: { exact: deviceId } } 
          : { facingMode: 'user' };

        const stream = await navigator.mediaDevices.getUserMedia({ 
          video: {
            ...videoConstraints,
            width: { ideal: 1920 },
            height: { ideal: 1080 }
          },
          audio: false 
        });
        
        currentStream = stream;

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          
          const track = stream.getVideoTracks()[0];
          const settings = track.getSettings();
          const label = track.label.toLowerCase();
          
          // 🌟 反転判定の強化
          // 1. facingMode をチェック
          // 2. ラベルに front/selfie/user が含まれるかチェック
          // 3. 背面カメラ（environment/back/rear）でない場合は、PCなどを含め「正面」とみなす
          const isBack = settings.facingMode === 'environment' || 
                         label.includes('back') || 
                         label.includes('rear') || 
                         label.includes('environment');
          
          setIsFrontCamera(!isBack);
        }
      } catch (error) {
        console.error("カメラ起動エラー:", error);
        // deviceId指定で失敗した場合はデフォルトで再試行
        if (deviceId) {
          console.log("デフォルトカメラで再試行します...");
          const fallbackStream = await navigator.mediaDevices.getUserMedia({ video: true });
          if (videoRef.current) videoRef.current.srcObject = fallbackStream;
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
