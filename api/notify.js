export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { type, stock } = req.body;

  if (!type || !stock) {
    return res.status(400).json({ error: 'Missing type or stock' });
  }

  const token = process.env.LINE_ACCESS_TOKEN;

  // メッセージテンプレート（絵文字や全角記号を避ける or encodeURI）
  let message = '';

  if (type === 'gosign') {
    message = `ZETAにGoサインが出ました！`; // 括弧や全角は避けた
  } else if (type === 'alert') {
    message = `${stock} が逆指値に接近中！監視を強化してください`;
  } else if (type === 'spike') {
    message = `${stock} に出来高急増＋高値ブレイクあり！爆発予兆検出`;
  } else {
    message = `${stock} に通知が届きました（種類: ${type}）`;
  }

  try {
    const response = await fetch('https://api.line.me/v2/bot/message/broadcast', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        messages: [{
          type: 'text',
          text: message
        }]
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`LINE通知エラー: ${errorText}`);
    }

    res.status(200).json({ status: 'ok', message: '通知送信成功！' });
  } catch (error) {
    console.error('通知エラー:', error.message);
    res.status(500).json({ error: '通知送信に失敗しました', detail: error.message });
  }
}
