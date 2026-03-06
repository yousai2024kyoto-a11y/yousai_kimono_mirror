import React, { createContext, useContext, useRef, useState, useEffect } from 'react';

const HandTrackingContext = createContext(null);

export const HandTrackingProvider = ({ children, videoRef, isEnabled = true }) => {
  const [fingerPosition, setFingerPosition] = useState(null);
  const handsRef = useRef(null);
  const cameraRef = useRef(null);

  useEffect(() => {
    let isComponentMounted = true;
    let checkInterval;

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

    const initMediaPipe = () => {
      if (!window.Hands || !window.Camera) return;

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

    const checkReady = () => {
      if (window.Hands && window.Camera && videoRef.current) {
        clearInterval(checkInterval);
        initMediaPipe();
      }
    };

    checkInterval = setInterval(checkReady, 500);
    checkReady();

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
  }, [isEnabled, videoRef]);

  return (
    <HandTrackingContext.Provider value={{ fingerPosition, isEnabled }}>
      {children}
    </HandTrackingContext.Provider>
  );
};

export const useHandTrackingContext = () => {
  const context = useContext(HandTrackingContext);
  if (!context) {
    throw new Error('useHandTrackingContext must be used within a HandTrackingProvider');
  }
  return context;
};
