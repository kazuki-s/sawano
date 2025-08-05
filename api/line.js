export const config = {
  api: {
    bodyParser: false,
  },
};

import { buffer } from 'micro';
import crypto from 'crypto';

const LINE_CHANNEL_SECRET = 'd9bd6d98a29d04823486e1b56a88aaa7';
const LINE_CHANNEL_ACCESS_TOKEN = 'jzcN59ozbLmEoRNvZLDqqKR5F5knZfYJshH1WIWzS0/J1Qq3KFNrPAOj38fQSrbBWYZexpcee7ay1FKdFCQR/2XYT0WU/M6DzfpBpig6QQqW/wDya8A/HUutZ6ostNExr74OE+5xGyyEwezl3xH5LAdB04t89/1O/w1cDnyilFU=';

export default async function handler(req, res) {
  console.log('📩 リクエスト受信');

  if (req.method !== 'POST') {
    console.log('⛔ POST以外のメソッドです');
    return res.status(405).send('Method Not Allowed');
  }

  try {
    const bodyBuffer = await buffer(req);
    console.log('📦 ボディ読み込み完了');

    const bodyText = bodyBuffer.toString();
    const signature = req.headers['x-line-signature'];

    const hash = crypto
      .createHmac('sha256', LINE_CHANNEL_SECRET)
      .update(bodyBuffer)
      .digest('base64');

    if (hash !== signature) {
      console.log('⚠️ シグネチャー不一致');
      return res.status(400).send('Invalid signature');
    }

    const body = JSON.parse(bodyText);
    console.log('✅ JSONパース成功');

    const event = body.events?.[0];

    if (!event?.replyToken || !event?.message?.text) {
      console.log('⚠️ イベント形式が不正');
      return res.status(400).send('Invalid event');
    }

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
      console.error('❌ LINEへの返信失敗:', errorText);
      return res.status(500).send(errorText);
    }

    console.log('✅ LINEに返信成功');
    res.status(200).send('OK');

  } catch (err) {
    console.error('🔥 サーバーエラー:', err);
    return res.status(500).send('Server error');
  }
}
