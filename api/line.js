export const config = {
  api: {
    bodyParser: false, // 手動でパースするためにfalse
  },
};

import { buffer } from 'micro';
import crypto from 'crypto';

const LINE_CHANNEL_SECRET = 'd9bd6d98a29d04823486e1b56a88aaa7'; // 🔑 ここを書き換えて！
const LINE_CHANNEL_ACCESS_TOKEN = 'jzcN59ozbLmEoRNvZLDqqKR5F5knZfYJshH1WIWzS0/J1Qq3KFNrPAOj38fQSrbBWYZexpcee7ay1FKdFCQR/2XYT0WU/M6DzfpBpig6QQqW/wDya8A/HUutZ6ostNExr74OE+5xGyyEwezl3xH5LAdB04t89/1O/w1cDnyilFU=';   // 🔑 ここを書き換えて！

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).send('Method Not Allowed');
  }

  const bodyBuffer = await buffer(req);
  const bodyText = bodyBuffer.toString();
  const signature = req.headers['x-line-signature'];

  // 署名の検証
  const hash = crypto
    .createHmac('sha256', LINE_CHANNEL_SECRET)
    .update(bodyBuffer)
    .digest('base64');

  if (hash !== signature) {
    return res.status(400).send('Invalid signature');
  }

  const body = JSON.parse(bodyText);
  const event = body.events?.[0];

  if (!event?.replyToken || !event?.message?.text) {
    return res.status(400).send('Invalid event');
  }

  // 返信処理
  const reply = await fetch('https://api.line.me/v2/bot/message/reply', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${LINE_CHANNEL_ACCESS_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      replyToken: event.replyToken,
      messages: [{ type: 'text', text: `受け取ったよ！: ${event.message.text}` }],
    }),
  });

  if (!reply.ok) {
    const errorText = await reply.text();
    return res.status(500).send(errorText);
  }

  res.status(200).send('OK');
}
