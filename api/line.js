// /api/line.js

export const config = {
  api: {
    bodyParser: false, // LINEの署名検証のために必要
  },
};

import { buffer } from 'micro';
import crypto from 'crypto';

// 環境変数はそのまま直書きでもOK（セキュアには.env推奨）
const LINE_CHANNEL_SECRET = 'd9bd6d98a29d04823486e1b56a88aaa7';
const LINE_CHANNEL_ACCESS_TOKEN = 'jzcN59ozbLmEoRNvZLDqqKR5F5knZfYJshH1WIWzS0/J1Qq3KFNrPAOj38fQSrbBWYZexpcee7ay1FKdFCQR/2XYT0WU/M6DzfpBpig6QQqW/wDya8A/HUutZ6ostNExr74OE+5xGyyEwezl3xH5LAdB04t89/1O/w1cDnyilFU=';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).send('Method Not Allowed');
  }

  const bodyBuffer = await buffer(req);
  const bodyText = bodyBuffer.toString();
  const signature = req.headers['x-line-signature'];

  // 署名検証
  const hash = crypto
    .createHmac('sha256', LINE_CHANNEL_SECRET)
    .update(bodyBuffer)
    .digest('base64');

  if (hash !== signature) {
    return res.status(400).send('Invalid signature');
  }

  let body;
  try {
    body = JSON.parse(bodyText);
  } catch (err) {
    return res.status(400).send('Invalid JSON');
  }

  // 複数イベントに対応
  const events = body.events || [];
  for (const event of events) {
    if (!event.replyToken || !event.message?.text) {
      continue; // 無効なイベントはスキップ
    }

    const userMessage = event.message.text;

    // 返信メッセージ
    const response = await fetch('https://api.line.me/v2/bot/message/reply', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${LINE_CHANNEL_ACCESS_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        replyToken: event.replyToken,
        messages: [{ type: 'text', text: `受け取ったよ！: ${userMessage}` }],
      }),
    });

    if (!response.ok) {
      console.error('LINE返信エラー:', await response.text());
    }
  }

  res.status(200).send('OK'); // 最後に正常終了を通知
}
