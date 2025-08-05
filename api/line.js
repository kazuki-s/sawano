export default async function handler(req, res) {
  // ① POSTでなければ拒否
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    // ② リクエストボディを手動で読み込む
    const buffers = [];
    for await (const chunk of req) {
      buffers.push(chunk);
    }
    const bodyData = Buffer.concat(buffers).toString();

    // ③ JSONに変換
    const body = JSON.parse(bodyData);
    const event = body.events?.[0];

    if (!event?.replyToken || !event?.message?.text) {
      return res.status(400).json({ error: 'Invalid event format' });
    }

    // ④ アクセストークン（★ここを書き換えてね！）
    const token = 'jzcN59ozbLmEoRNvZLDqqKR5F5knZfYJshH1WIWzS0/J1Qq3KFNrPAOj38fQSrbBWYZexpcee7ay1FKdFCQR/2XYT0WU/M6DzfpBpig6QQqW/wDya8A/HUutZ6ostNExr74OE+5xGyyEwezl3xH5LAdB04t89/1O/w1cDnyilFU=';

    // ⑤ LINEに返信
    const reply = await fetch('https://api.line.me/v2/bot/message/reply', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        replyToken: event.replyToken,
        messages: [
          {
            type: 'text',
            text: `受け取ったよ！: ${event.message.text}`,
          },
        ],
      }),
    });

    if (reply.ok) {
      return res.status(200).json({ success: true });
    } else {
      const err = await reply.text();
      return res.status(500).json({ error: err });
    }

  } catch (err) {
    console.error('❌ エラー:', err);
    return res.status(500).json({ error: 'Server error' });
  }
}
