// ✅ VercelでbodyParserを無効化
export const config = {
  api: {
    bodyParser: false,
  },
};

import { buffer } from 'micro';
import crypto from 'crypto';

// ✅ あなたのチャンネル情報に書き換える
const LINE_CHANNEL_SECRET = 'd9bd6d98a29d04823486e1b56a88aaa7';
const LINE_CHANNEL_ACCESS_TOKEN = 'jzcN59ozbLmEoRNvZLDqqKR5F5knZfYJshH1WIWzS0/J1Qq3KFNrPAOj38fQSrbBWYZexpcee7ay1FKdFCQR/2XYT0WU/M6DzfpBpig6QQqW/wDya8A/HUutZ6ostNExr74OE+5xGyyEwezl3xH5LAdB04t89/1O/w1cDnyilFU='; // ← ここも絶対正確に！

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).send('Method Not Allowed');
  }

  // ✅ リクエストBodyの読み取り
  const bodyBuffer = await buffer(req);
  const bodyText = bodyBuffer.toString();
  const signature = req.headers['x-line-signature'];

  // ✅ 署名チェック
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

  // ✅ メッセージ返信
  const reply = await fetch('https://api.line.me/v2/bot/message/reply', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${LINE_CHANNEL_ACCESS_TOKEN}`,
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
