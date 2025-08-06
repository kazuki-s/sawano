export default async function handler(req, res) {
  try {
    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method Not Allowed' });
    }

    const { message, userId } = req.body;

    if (!message || !userId) {
      return res.status(400).json({ error: 'Missing message or userId' });
    }

    // ✅ サニタイズ処理（UTF-8でByte > 255 の文字を除外）
    const sanitizeMessage = (text) => {
      const encoder = new TextEncoder();
      return Array.from(text).filter(char => {
        try {
          const encoded = encoder.encode(char);
          // 1文字が4バイト超えないかつ255以下（undiciのByteString対応）
          return encoded.every(byte => byte <= 255);
        } catch {
          return false;
        }
      }).join('');
    };

    const safeMessage = sanitizeMessage(message);
    console.log("Sanitized:", safeMessage); // ✅ ログ確認用

    const response = await fetch('https://api.line.me/v2/bot/message/push', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.LINE_ACCESS_TOKEN}`
      },
      body: JSON.stringify({
        to: userId,
        messages: [
          {
            type: 'text',
            text: safeMessage
          }
        ]
      })
    });

    if (!response.ok) {
      const error = await response.text();
      return res.status(500).json({ error: 'LINE API Error', details: error });
    }

    return res.status(200).json({ success: true });

  } catch (error) {
    console.error('Unhandled Error:', error);
    return res.status(500).json({ error: 'Internal Server Error', details: error.message });
  }
}
