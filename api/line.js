export default async function handler(req, res) {
  if (req.method === 'POST') {
    const token = 'ここにチャネルアクセストークン';
    const message = req.body.message;

    const response = await fetch('https://api.line.me/v2/bot/message/broadcast', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
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

    if (response.ok) {
      res.status(200).json({ success: true });
    } else {
      const errorData = await response.json();
      console.error('LINE API error:', errorData);
      res.status(500).json({ success: false, error: errorData });
    }
  } else {
    res.status(405).end(); // Method Not Allowed
  }
}
