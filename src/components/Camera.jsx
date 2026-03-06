import { useEffect, useState } from 'react';

function Camera({ deviceId, videoRef }) {
  const [isFrontCamera, setIsFrontCamera] = useState(true);

  useEffect(() => {
    let currentStream = null;

    const startCamera = async () => {
      // 🌟 前のストリームを確実に停止させる（重要）
      if (videoRef.current && videoRef.current.srcObject) {
        const oldStream = videoRef.current.srcObject;
        oldStream.getTracks().forEach(track => track.stop());
        videoRef.current.srcObject = null;
      }

      // 🌟 少しだけ待機（iOS Safariなどのリソース競合対策）
      await new Promise(resolve => setTimeout(resolve, 100));

      try {
        let videoConstraints;
        
        if (deviceId) {
          // 🌟 ID指定がある場合は、facingModeを指定しない（衝突防止）
          videoConstraints = { deviceId: { exact: deviceId } };
        } else {
          // デフォルトは背面の「environment」を試みる（ミラー体験として外を映したい場合があるため）
          // または、スマホの標準的な挙動に合わせる
          videoConstraints = { facingMode: 'user' };
        }

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
          
          // イン/アウト判定
          const track = stream.getVideoTracks()[0];
          const settings = track.getSettings();
          const label = track.label.toLowerCase();
          
          const isBack = settings.facingMode === 'environment' || 
                         label.includes('back') || 
                         label.includes('rear') || 
                         label.includes('environment');
          
          setIsFrontCamera(!isBack);
        }
      } catch (error) {
        console.error("カメラ起動失敗:", error);
        // 万が一ID指定で失敗した場合は、最も緩い制約で再試行
        if (deviceId) {
          try {
            const fallbackStream = await navigator.mediaDevices.getUserMedia({ video: true });
            currentStream = fallbackStream;
            if (videoRef.current) videoRef.current.srcObject = fallbackStream;
          } catch (e) { console.error("完全失敗:", e); }
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
