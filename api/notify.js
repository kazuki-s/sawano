export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { type, stock } = req.body;

    let message = '';

    // 通知タイプごとにメッセージを構成（全角記号なし／ASCII中心）
    switch (type) {
      case 'gosign':
        message = `Go sign issued for ${stock}.`;
        break;
      case 'alert':
        message = `${stock} is close to the stop price.`;
        break;
      case 'trigger':
        message = `${stock} shows signs of a breakout.`;
        break;
      case 'cut':
        message = `${stock} hit the stop price. Consider exiting.`;
        break;
      case 'check':
        message = `Current price check: ${stock}.`;
        break;
      default:
        message = `Unknown alert type for ${stock}.`;
        break;
    }

    const token = process.env.LINE_ACCESS_TOKEN;

    const response = await fetch('https://notify-api.line.me/api/notify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Bearer ${token}`,
      },
      body: `message=${encodeURIComponent(message)}`,
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`LINE Notify failed: ${text}`);
    }

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('通知エラー:', error.message);
    return res.status(500).json({ error: error.message });
  }
}
