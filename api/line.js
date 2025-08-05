export const config = {
  api: {
    bodyParser: false, // 手動でパースするため false
  },
};

import { buffer } from 'micro';
import crypto from 'crypto';

const LINE_CHANNEL_SECRET = 'd9bd6d98a29d04823486e1b56a88aaa7';
const LINE_CHANNEL_ACCESS_TOKEN = 'jzcN59ozbLmEoRNvZLDqqKR5F5knZfYJshH1WIWzS0/J1Qq3KFNrPAOj38fQSrbBWYZexpcee7ay1FKdFCQR/2XYT0WU/M6DzfpBpig6QQqW/wDya8A/HUutZ6ostNExr74OE+5xGyyEwezl3xH5LAdB04t89/1O/w1cDnyilFU=';

export default async function handler(req, res) {
  console.log('🟢 Webhook受信開始');

  if (req.method !== 'POST') {
    console.log('⛔ 不正なメソッド:', req.method);
    return res.status(405).send('Method Not Allowed');
  }

  try {
    const bodyBuffer = await buffer(req);
    const bodyText = bodyBuffer.toString();
    const signature = req.headers['x-line-signature'];

    console.log('🟡 シグネチャ:', signature);

    const hash = crypto
      .createHmac('sha256', LINE_CHANNEL_SECRET)
      .update(bodyBuffer)
      .digest('base64');

    if (hash !== signature) {
      console.log('❌ シグネチャ検証失敗');
      return res.status(400).send('Invalid signature');
    }

    console.log('✅ シグネチャOK');

    const body = JSON.parse(bodyText);
    const event = body.events?.[0];

    if (!event?.replyToken || !event?.message?.text) {
      console.log('⚠️ 不正なイベント構造:', JSON.stringify(body));
      return res.status(400).send('Invalid event');
    }

    console.log('📩 メッセージ受信:', event.message.text);

    const reply = await fetch('https://api.line.me/v2/bot/message/reply', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${LINE_CHANNEL_ACCESS_TOKEN}`,
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

    const replyResult = await reply.text();

    if (!reply.ok) {
      console.error('❌ LINE API返信失敗:', reply.status, replyResult);
      return res.status(500).send(replyResult);
    }

    console.log('✅ LINEに返信完了:', replyResult);
    res.status(200).send('OK');
  } catch (error) {
    console.error('🔥 ハンドラーエラー:', error);
    res.status(500).send('Internal Server Error');
  }
}
