export default async function handler(req, res) {
  try {
    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method Not Allowed' });
    }

    const { message, userId } = req.body;

    if (!message || !userId) {
      return res.status(400).json({ error: 'Missing message or userId' });
    }

    // 💡 全角記号・非ASCIIを削除（65288含むすべての問題文字を除去）
    const sanitizeMessage = (text) => {
      return text
        .replace(/[^\x20-\x7E]/g, ''); // ASCII範囲外（\x00〜\x1F, \x7F〜）を全部除去
    };

    const safeMessage = sanitizeMessage(message);

    console.log('Raw Message:', message);
    console.log('Sanitized:', safeMessage);

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
