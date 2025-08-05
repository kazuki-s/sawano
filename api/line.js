export default async function handler(req, res) {
  if (req.method === 'POST') {
    const token = 'あなたのチャネルアクセストークン（長期）';

    const replyToken = req.body.events?.[0]?.replyToken;
    const receivedMessage = req.body.events?.[0]?.message?.text;

    if (!replyToken || !receivedMessage) {
      return res.status(400).json({ success: false, error: 'Invalid payload' });
    }

    const response = await fetch('https://api.line.me/v2/bot/message/reply', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        replyToken: replyToken,
        messages: [
          {
            type: 'text',
            text: `あなたのメッセージ: ${receivedMessage}`
          }
        ]
      }),
    });

    if (response.ok) {
      res.status(200).json({ success: true });
    } else {
      const errorText = await response.text();
      res.status(500).json({ success: false, error: errorText });
    }
  } else {
    res.status(405).json({ error: 'Method Not Allowed' });
  }
}
