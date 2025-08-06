export default async function handler(req, res) {
  // ① POST以外は拒否
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    // ② リクエストボディをJSONとして読み取る
    const body = await req.json();
    const { type, stock } = body;

    if (!type || !stock) {
      return res.status(400).json({ error: 'Missing type or stock' });
    }

    // ③ 通知メッセージをタイプ別に生成（全角記号は使わない！）
    let message = '';
    switch (type) {
      case 'gosign':
        message = `Go sign issued for ${stock}`;
        break;
      case 'alert':
        message = `Price alert for ${stock}`;
        break;
      case 'cutloss':
        message = `Stop-loss triggered for ${stock}`;
        break;
      case 'check':
        message = `Current value checked for ${stock}`;
        break;
      default:
        message = `Notification for ${stock}`;
        break;
    }

    // ④ LINE Notify のアクセストークン（秘密）
    const token = 'jzcN59ozbLmEoRNvZLDqqKR5F5knZfYJshH1WIWzS0/J1Qq3KFNrPAOj38fQSrbBWYZexpcee7ay1FKdFCQR/2XYT0WU/M6DzfpBpig6QQqW/wDya8A/HUutZ6ostNExr74OE+5xGyyEwezl3xH5LAdB04t89/1O/w1cDnyilFU=';

    // ⑤ LINE Notify に送信（x-www-form-urlencoded）
    const resNotify = await fetch('https://notify-api.line.me/api/notify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Bearer ${token}`,
      },
      body: `message=${encodeURIComponent(message)}`, // ← 全角禁止対策あり
    });

    // ⑥ 応答確認
    if (!resNotify.ok) {
      const errText = await resNotify.text();
      console.error('通知エラー:', errText);
      return res.status(500).json({ error: 'Failed to notify LINE' });
    }

    // ⑦ 成功時の応答
    return res.status(200).json({ success: true, message });

  } catch (err) {
    console.error('サーバーエラー:', err);
    return res.status(500).json({ error: 'Server error' });
  }
}
