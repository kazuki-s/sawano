export const config = {
  runtime: 'nodejs',
};

export default async function handler(req, res) {
  try {
    const { message } = await req.json(); // JSONボディからmessageを抽出

    if (!message || typeof message !== 'string') {
      console.error('❌ 無効なメッセージ形式:', message);
      return res.status(400).json({ error: 'Invalid message format' });
    }

    const token = process.env.LINE_NOTIFY_TOKEN; // 環境変数からトークンを取得
    if (!token) {
      console.error('❌ LINE_NOTIFY_TOKENが未設定です');
      return res.status(500).json({ error: 'Missing LINE_NOTIFY_TOKEN' });
    }

    const payload = new URLSearchParams({ message });

    const notifyRes = await fetch('https://notify-api.line.me/api/notify', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: payload,
    });

    const responseText = await notifyRes.text();
    console.log('✅ 通知成功:', responseText);

    if (!notifyRes.ok) {
      return res.status(500).json({ error: responseText });
    }

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error('❌ 通知エラー:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
