// /pages/api/send.js

export default async function handler(req, res) {
  try {
    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method Not Allowed' });
    }

    const { message, userId } = req.body;

    if (!message || !userId) {
      return res.status(400).json({ error: 'Missing message or userId' });
    }

    // ✨ UTF-8で使えない文字を除外するサニタイズ処理（最強版）
    const sanitizeMessage = (text) => {
      return Array.from(text)
        .filter(char => {
          try {
            const bytes = new TextEncoder().encode(char);
            return bytes.length <= 3; // LINE APIが受け付ける最大バイト数（emoji除外）
          } catch {
            return false;
          }
        })
        .join('');
    };

    const safeMessage = sanitizeMessage(message);

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
