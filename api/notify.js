export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { type, stock } = req.body;

    if (!type || !stock) {
      return res.status(400).json({ error: 'Missing type or stock' });
    }

    let message;

    // タイプごとのメッセージ生成
    switch (type) {
      case 'gosign':
        message = `🚀 ${stock}が爆発しそう！監視強化！`;
        break;
      case 'alert':
        message = `⚠️ ${stock}が逆指値に接近中！注意！`;
        break;
      case 'stop':
        message = `🛑 ${stock}が逆指値到達。損切り提案。`;
        break;
      case 'test':
        message = `受け取ったよ！: ${stock}`;
        break;
      default:
        message = `🔔 ${stock}に通知：${type}`;
    }

    // LINE Notifyへの送信
    const lineRes = await fetch('https://notify-api.line.me/api/notify', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.LINE_ACCESS_TOKEN}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({ message }),
    });

    if (!lineRes.ok) {
      const errorText = await lineRes.text();
      throw new Error(`LINE送信エラー: ${errorText}`);
    }

    res.status(200).json({ status: 'ok', sent: message });
  } catch (error) {
    console.error('通知エラー:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}
