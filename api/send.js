export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { message } = await req.json?.(); // ❌ これは .json() ではなく `req.body.message` を使うべき
    // 修正ポイント：Vercel Edge Functions（Node.jsランタイム）では req.body を直接使う

    const msg = req.body?.message || '（メッセージがありません）';

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
            text: msg,
          },
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      return res.status(response.status).json({ error: errorText });
    }

    return res.status(200).json({ status: 'OK' });
  } catch (error) {
    console.error('送信エラー:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}
