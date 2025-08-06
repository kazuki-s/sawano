export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method Not Allowed' });
    return;
  }

  try {
    // JSON bodyのパース（Vercelでは自動で req.body に格納される）
    const { message } = req.body || {};

    if (!message) {
      res.status(400).json({ error: 'メッセージが未定義です' });
      return;
    }

    const response = await fetch('https://api.line.me/v2/bot/message/broadcast', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.LINE_ACCESS_TOKEN}`,
      },
      body: JSON.stringify({
        messages: [
          {
            type: 'text',
            text: message,
          },
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      res.status(response.status).json({ error: errorText });
      return;
    }

    res.status(200).json({ status: 'OK' });
  } catch (error) {
    console.error('送信エラー:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}
