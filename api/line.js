export const config = {
  api: {
    bodyParser: false, // 手動でパースするためにfalse
  },
};

import { buffer } from 'micro';
import crypto from 'crypto';

const LINE_CHANNEL_SECRET = 'd9bd6d98a29d04823486e1b56a88aaa7'; // 🔑 シークレット
const LINE_CHANNEL_ACCESS_TOKEN = 'jzcN59ozbLmEoRNvZLDqqKR5F5knZfYJshH1WIWzS0/J1Qq3KFNrPAOj38fQSrbBWYZexpcee7ay1FKdFCQR/2XYT0WU/M6DzfpBpig6QQqW/wDya8A/HUutZ6ostNExr74OE+5xGyyEwezl3xH5LAdB04t89/1O/w1cDnyilFU=';  // 🔑 アクセストークン

export default async function handler(req, res) {
  console.log('✅ リクエスト受信');

  if (req.method !== 'POST') {
    console.warn('⚠️ POST以外のリクエスト');
    return res.status(405).send('Method Not Allowed');
  }

  let bodyBuffer;
  try {
    bodyBuffer = await buffer(req);
    console.log('📦 バッファ取得成功');
  } catch (err) {
    console.error('❌ バッファ読み込み失敗:', err);
    return res.status(500).send('Buffer read error');
  }

  const signature = req.headers['x-line-signature'];
  const hash = crypto
    .createHmac('sha256', LINE_CHANNEL_SECRET)
    .update(bodyBuffer)
    .digest('base64');

  if (hash !== signature) {
    console.warn('❌ 署名検証失敗');
    return res.status(400).send('Invalid signature');
  }

  let body;
  try {
    body = JSON.parse(bodyBuffer.toString());
    console.log('📝 JSONパース成功');
  } catch (err) {
    console.error('❌ JSONパースエラー:', err);
    return res.status(400).send('Invalid JSON');
  }

  const event = body.events?.[0];
  if (!event?.replyToken || !event?.message?.text) {
    console.warn('⚠️ 不正なイベント形式');
    return res.status(400).send('Invalid event');
  }

  const messageText = event.message.text;
  console.log(`📩 メッセージ内容: ${messageText}`);

  try {
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
            text: `受け取ったよ！: ${messageText}`,
          },
        ],
      }),
    });

    if (!reply.ok) {
      const errorText = await reply.text();
      console.error('❌ LINE返信APIエラー:', errorText);
      return res.status(500).send(errorText);
    }

    console.log('✅ 返信成功');
    res.status(200).send('OK');
  } catch (err) {
    console.error('❌ 返信処理中にエラー:', err);
    res.status(500).send('Reply failed');
  }
}
