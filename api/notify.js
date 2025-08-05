// /api/notify.js
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { type, stock, message } = req.body;

  if (!message) {
    return res.status(400).json({ error: 'Missing message in body' });
  }

  try {
    const response = await fetch('https://api.line.me/v2/bot/message/broadcast', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.CHANNEL_ACCESS_TOKEN}`,
      },
      body: JSON.stringify({
        messages: [
          {
            type: 'text',
            text: message
          }
        ]
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      return res.status(response.status).json({ error: 'LINE API error', details: errorText });
    }

    return res.status(200).json({ success: true, sent: message });

  } catch (error) {
    console.error('Notify Error:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}
