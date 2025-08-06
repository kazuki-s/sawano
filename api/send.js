export default async function handler(req, res) {
  try {
    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method Not Allowed' });
    }

    const { message, userId } = req.body;

    if (!message || !userId) {
      return res.status(400).json({ error: 'Missing message or userId' });
    }

    // ✅ 安全なメッセージ（全角記号を除去 or 半角へ）
    const sanitizeMessage = (text) => {
      return text
        .replace(/[！-～]/g, (ch) => String.fromCharCode(ch.charCodeAt(0) - 0xfee0)) // 全角→半角
        .replace(/[“”‘’〈〉《》「」『』【】（）［］｛｝]/g, '') // 全角カッコ類除去
        .replace(/[^\x00-\x7F]/g, ''); // その他非ASCII文字も一旦除去（UTF-8安全化）
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
