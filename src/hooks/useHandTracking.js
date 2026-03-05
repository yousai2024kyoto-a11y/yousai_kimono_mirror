// hooks/useHandTracking.js
import { useState, useEffect, useRef } from 'react';

export default function useHandTracking(videoRef, isEnabled = true) {
  const [fingerPosition, setFingerPosition] = useState(null);
  const handsRef = useRef(null);
  const cameraRef = useRef(null);

  useEffect(() => {
    let isComponentMounted = true;
    let checkInterval;

    // 🌟 設定がOFFの時は、AIもカメラ解析も完全に停止させる
    if (!isEnabled) {
      setFingerPosition(null);
      if (cameraRef.current) {
        cameraRef.current.stop();
        cameraRef.current = null;
      }
      if (handsRef.current) {
        handsRef.current.close();
        handsRef.current = null;
      }
      return;
    }

    // AIの初期化処理
    const initMediaPipe = () => {
      handsRef.current = new window.Hands({
        locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`,
      });

      handsRef.current.setOptions({
        maxNumHands: 1,
        modelComplexity: 1,
        minDetectionConfidence: 0.7,
        minTrackingConfidence: 0.7,
      });

      handsRef.current.onResults((results) => {
        if (!isComponentMounted) return;
        if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
          const indexFinger = results.multiHandLandmarks[0][8];
          setFingerPosition({ x: indexFinger.x, y: indexFinger.y });
        } else {
          setFingerPosition(null);
        }
      });

      // AIにカメラの映像を流し込む
      if (videoRef.current) {
        cameraRef.current = new window.Camera(videoRef.current, {
          onFrame: async () => {
            if (handsRef.current && videoRef.current && isComponentMounted) {
              await handsRef.current.send({ image: videoRef.current });
            }
          },
          width: 640,
          height: 480,
        });
        cameraRef.current.start();
      }
    };

    // 🌟 修正ポイント：スクリプトとvideoタグの両方が準備完了するまで待つ（ポーリング）
    const checkReady = () => {
      if (window.Hands && window.Camera && videoRef.current) {
        clearInterval(checkInterval); // 準備が完了したら監視タイマーを止める
        initMediaPipe(); // AIを確実に起動！
      }
    };

    // 0.5秒ごとに準備できたかチェックする
    checkInterval = setInterval(checkReady, 500);
    checkReady(); // 初回チェック

    // クリーンアップ関数（画面移動時やOFFに切り替わった時）
    return () => {
      isComponentMounted = false;
      clearInterval(checkInterval);
      if (cameraRef.current) {
        cameraRef.current.stop();
        cameraRef.current = null;
      }
      if (handsRef.current) {
        handsRef.current.close();
        handsRef.current = null;
      }
    };
  }, [isEnabled]); // videoRefは内部のポーリングで監視するため依存配列から外します

  return fingerPosition;
}