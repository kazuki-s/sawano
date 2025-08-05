// /api/line.js
import { createHmac } from 'crypto';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const signature = req.headers['x-line-signature'];
  const body = JSON.stringify(req.body);

  const channelSecret = process.env.LINE_CHANNEL_SECRET;

  if (!channelSecret) {
    return res.status(500).json({ error: 'Missing LINE_CHANNEL_SECRET' });
  }

  const hash = createHmac('SHA256', channelSecret)
    .update(body)
    .digest('base64');

  if (hash !== signature) {
    return res.status(401).json({ error: 'Invalid signature' });
  }

  const events = req.body.events;

  const channelAccessToken = process.env.CHANNEL_ACCESS_TOKEN;

  if (!channelAccessToken) {
    return res.status(500).json({ error: 'Missing CHANNEL_ACCESS_TOKEN' });
  }

  for (const event of events) {
    if (!event.replyToken || !event.message || !event.message.text) continue;

    const replyToken = event.replyToken;
    const userMessage = event.message.text;

    const responseMessage = {
      replyToken,
      messages: [
        {
          type: 'text',
          text: `受け取ったよ！: ${userMessage}`
        }
      ]
    };

    await fetch('https://api.line.me/v2/bot/message/reply', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${channelAccessToken}`
      },
      body: JSON.stringify(responseMessage)
    });
  }

  res.status(200).send('OK');
}
