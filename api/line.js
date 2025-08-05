export default async function handler(req, res) {
  if (req.method === 'POST') {
    const token = 'ここにLINEのアクセストークン';
    const message = req.body.message || 'チャトちゃん通知テストです📢';

    const response = await fetch('https://notify-api.line.me/api/notify', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({ message }),
    });

    if (response.ok) {
      res.status(200).json({ success: true });
    } else {
      const errorText = await response.text();
      res.status(500).json({ success: false, error: errorText });
    }
  } else {
    res.status(405).end('Method Not Allowed');
  }
}
