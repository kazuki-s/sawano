// api/line.js

import { buffer } from 'micro';
import crypto from 'crypto';

export const config = {
  api: {
    bodyParser: false,
  },
};

const validateSignature = (rawBody, signature, channelSecret) => {
  const hash = crypto
    .createHmac('SHA256', channelSecret)
    .update(rawBody)
    .digest('base64');
  return hash === signature;
};

export default async function handler(req, res) {
  try {
    if (req.method !== 'POST') {
      return res.status(405).send('Method Not Allowed');
    }

    const signature = req.headers['x-line-signature'];
    const channelSecret = process.env.CHANNEL_SECRET;
    const channelAccessToken = process.env.CHANNEL_ACCESS_TOKEN;

    const rawBody = await buffer(req);

    // 🔐 署名検証
    if (!validateSignature(rawBody, signature, channelSecret)) {
      console.error('❌ Invalid signature');
      return res.status(401).send('❌ Invalid signature');
    }

    const body = JSON.parse(rawBody.toString('utf-8'));
    console.log('✅ Webhook received:', JSON.stringify(body, null, 2));

    // 🔁 メッセージイベント処理
    const events = body.events;
    for (const event of events) {
      if (event.type === 'message' && event.message.type === 'text') {
        const replyMessage = {
          replyToken: event.replyToken,
          messages: [
            {
              type: 'text',
              text: `受け取ったよ！: ${event.message.text}`,
            },
          ],
        };

        await fetch('https://api.line.me/v2/bot/message/reply', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${channelAccessToken}`,
          },
          body: JSON.stringify(replyMessage),
        });
      }
    }

    res.status(200).send('OK');
  } catch (error) {
    console.error('🔥 Error in webhook handler:', error);
    res.status(500).send('Internal Server Error');
  }
}
