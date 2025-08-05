// line.js
export const config = {
  api: {
    bodyParser: false, // LINE署名検証のために無効化
  },
};

import { buffer } from 'micro';
import crypto from 'crypto';

// 🔑 チャネル情報（環境に合わせて書き換え）
const LINE_CHANNEL_SECRET = 'd9bd6d98a29d04823486e1b56a88aaa7';
const LINE_CHANNEL_ACCESS_TOKEN = 'jzcN59ozbLmEoRNvZLDqqKR5F5knZfYJshH1WIWzS0/J1Qq3KFNrPAOj38fQSrbBWYZexpcee7ay1FKdFCQR/2XYT0WU/M6DzfpBpig6QQqW/wDya8A/HUutZ6ostNExr74OE+5xGyyEwezl3xH5LAdB04t89/1O/w1cDnyilFU=';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    console.warn('⚠️ 非POSTリクエスト:', req.method);
    return res.status(405).send('Method Not Allowed');
  }

  let bodyBuffer;
  try {
    bodyBuffer = await buffer(req);
  } catch (err) {
    console.error('❌ リクエストのバッファ取得失敗:', err);
    return res.status(500).send('Failed to read request body');
  }

  const signature = req.headers['x-line-signature'];
  const hash = crypto
    .createHmac('sha256', LINE_CHANNEL_SECRET)
    .update(bodyBuffer)
    .digest('base64');

  if (hash !== signature) {
    console.warn('⚠️ 署名検証失敗');
    return res.status(400).send('Invalid signature');
  }

  let body;
  try {
    body = JSON.parse(bodyBuffer.toString());
  } catch (err) {
    console.error('❌ JSONパース失敗:', err);
    return res.status(400).send('Invalid JSON');
  }

  const event = body.events?.[0];
  if (!event?.replyToken || !event?.message?.text) {
    console.warn('⚠️ 無効なイベント:', JSON.stringify(body));
    return res.status(400).send('Invalid event');
  }

  console.log('✅ メッセージ受信:', event.message.text);

  // LINEへの返信処理
  try {
    const response = await fetch('https://api.line.me/v2/bot/message/reply', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LINE_CHANNEL_ACCESS_TOKEN}`,
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

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ LINE返信失敗:', response.status);
      console.error('📩 レスポンス:', errorText);
      return res.status(500).send(errorText);
    }

    console.log('✅ LINE返信成功');
    res.status(200).send('OK');

  } catch (err) {
    console.error('❌ fetch通信エラー:', err);
    res.status(500).send('Reply failed');
  }
}
