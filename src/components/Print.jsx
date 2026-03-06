// src/components/Print.jsx
import GestureButton from './GestureButton/GestureButton';

export default function Print({ generatedImage }) {
  
  const handlePrint = () => {
    // 画像がまだ生成されていない時は何もしない
    if (!generatedImage) return;
    
    // 印刷用の新しいウィンドウ（タブ）を開く
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      // 🌟 画像1枚だけを含む純粋なHTMLを書き込む
      printWindow.document.write(`
        <!DOCTYPE html>
        <html lang="ja">
          <head>
            <meta charset="UTF-8">
            <title>Kimono Mirror Print</title>
            <style>
              /* 🌟 印刷設定: 余白をゼロにし、ヘッダー/フッターを抑制 */
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
                width: 100vw;
                height: 100vh;
                background-color: #fff;
              }
              img {
                max-width: 100%;
                max-height: 100%;
                object-fit: contain; /* アスペクト比を維持して用紙に収める */
                display: block;
              }
              /* 印刷時の追加微調整 */
              @media print {
                body {
                  -webkit-print-color-adjust: exact;
                }
              }
            </style>
          </head>
          <body>
            <img src="${generatedImage}" alt="Generated Image" />
            <script>
              // 画像の読み込みが完了してから印刷ダイアログを表示
              window.onload = function() {
                window.print();
                // 印刷が終わったら（またはキャンセルされたら）ウィンドウを閉じる
                // 少しだけ待機してから閉じないと、ブラウザによって印刷が中断される場合がある
                setTimeout(function() {
                  window.close();
                }, 500);
              };
            </script>
          </body>
        </html>
      `);
      printWindow.document.close();
    } else {
      alert("印刷ウィンドウが開けませんでした。ブラウザの設定でポップアップを許可してください。");
    }
  };

  return (
    <GestureButton variant="panel" onClick={handlePrint}>
      <span style={{ fontSize: '24px' }}>🖨️</span>
      <span>印刷する</span>
    </GestureButton>
  );
}
