// src/components/Print.jsx
import GestureButton from './GestureButton/GestureButton';

export default function Print({ generatedImage }) {
  
  const handlePrint = () => {
    if (!generatedImage) return;
    
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>AI Kimono Mirror - Print</title>
            <style>
              /* 🌟 印刷用の純粋なスタイル設定 */
              @page {
                margin: 0;
                size: auto;
              }
              body {
                margin: 0;
                padding: 0;
                display: flex;
                justify-content: center;
                align-items: center;
                min-height: 100vh;
                background-color: #fff;
              }
              img {
                max-width: 100%;
                max-height: 100vh;
                object-fit: contain;
                display: block;
              }
            </style>
          </head>
          <body>
            <img src="${generatedImage}" onload="window.print(); setTimeout(() => window.close(), 500);" />
          </body>
        </html>
      `);
      printWindow.document.close();
    } else {
      alert("印刷ウィンドウが開けませんでした。ポップアップブロックを解除してください。");
    }
  };

  return (
    <GestureButton variant="panel" onClick={handlePrint}>
      <span style={{ fontSize: '24px' }}>🖨️</span>
      <span>印刷する</span>
    </GestureButton>
  );
}
