// /pages/api/line.ts または /pages/api/line.js

export const config = {
  api: {
    bodyParser: false, // 手動でパースするためにfalseにする
  },
};

import { buffer } from 'micro';
import crypto from 'crypto';

const LINE_CHANNEL_SECRET = 'd9bd6d98a29d04823486e1b56a88aaa7'; // ✅ あなたのチャネルシークレット
const LINE_CHANNEL_ACCESS_TOKEN = 'jzcN59ozbLmEoRNvZLDqqKR5F5knZfYJshH1WIWzS0/J1Qq3KFNrPAOj38fQSrbBWYZexpcee7ay1FKdFCQR/2XYT0WU/M6DzfpBpig6QQqW/wDya8A/HUutZ6ostNExr74OE+5xGyyEwezl3xH5LAdB04t89/1O/w1cDnyilFU='; // ✅ アクセストークン

export default async function handler(req, res) {
  // POST以外拒否
  if (req.method !== 'POST') {
    console.log('❌ POSTじゃないリクエスト');
    return res.status(405).send('Method Not Allowed');
  }

  try {
    // ボディ取得と署名検証
    const bodyBuffer = await buffer(req);
    const signature = req.headers['x-line-signature'];

    const hash = crypto
      .createHmac('sha256', LINE_CHANNEL_SECRET)
      .update(bodyBuffer)
      .digest('base64');

    if (hash !== signature) {
      console.log('❌ 署名が一致しません');
      return res.status(400).send('Invalid signature');
    }

    const bodyText = bodyBuffer.toString();
    const body = JSON.parse(bodyText);
    const event = body.events?.[0];

    // 🔍 ログ出力：イベントの中身を確認！
    console.log('👉 受け取ったイベント:', JSON.stringify(event, null, 2));

    if (!event?.replyToken || !event?.message?.text) {
      console.log('⚠️ replyTokenかmessage.textがありません');
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
      console.log('❌ LINEへの返信失敗:', errorText);
      return res.status(500).send(errorText);
    }

    console.log('✅ 正常に返信しました');
    return res.status(200).send('OK');
  } catch (err) {
    console.error('❌ サーバーエラー:', err);
    return res.status(500).send('Server error');
  }
}
