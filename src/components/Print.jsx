// src/components/Print.jsx
import GestureButton from './GestureButton/GestureButton';

export default function Print({ generatedImage }) {
  
  const handlePrint = () => {
    // 画像がまだ生成されていない時は何もしない
    if (!generatedImage) return;
    
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>AI 浴衣 - 印刷</title>
            <style>
              body { margin: 0; display: flex; justify-content: center; align-items: center; height: 100vh; background-color: #fff; }
              img { max-width: 100%; max-height: 100%; object-fit: contain; }
              @media print {
                @page { margin: 0; }
                body { margin: 1cm; }
              }
            </style>
          </head>
          <body>
            <img src="${generatedImage}" onload="window.print(); window.close();" />
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
      <span style={{ fontSize: '32px' }}>🖨️</span>
      <span>印刷する</span>
    </GestureButton>
  );
}