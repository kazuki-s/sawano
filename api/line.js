// Vercel設定：手動でbodyを読むための設定
export const config = {
  api: {
    bodyParser: false,
  },
};

import { buffer } from 'micro';
import crypto from 'crypto';

// ★ 書き換える場所（チャネルシークレット＆アクセストークン）
const LINE_CHANNEL_SECRET = 'd9bd6d98a29d04823486e1b56a88aaa7';
const LINE_CHANNEL_ACCESS_TOKEN = 'jzcN59ozbLmEoRNvZLDqqKR5F5knZfYJshH1WIWzS0/J1Qq3KFNrPAOj38fQSrbBWYZexpcee7ay1FKdFCQR/2XYT0WU/M6DzfpBpig6QQqW/wDya8A/HUutZ6ostNExr74OE+5xGyyEwezl3xH5LAdB04t89/1O/w1cDnyilFU=';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).send('Method Not Allowed');
  }

  try {
    const bodyBuffer = await buffer(req);
    const bodyText = bodyBuffer.toString();

    // ✅ ヘッダー名の大文字小文字どちらにも対応
    const signature =
      req.headers['x-line-signature'] || req.headers['X-Line-Signature'];

    // ✅ 署名検証
    const hash = crypto
      .createHmac('sha256', LINE_CHANNEL_SECRET)
      .update(bodyBuffer)
      .digest('base64');

    if (hash !== signature) {
      console.error('❌ 署名が一致しません');
      return res.status(400).send('Invalid signature');
    }

    const body = JSON.parse(bodyText);
    const event = body.events?.[0];

    if (!event?.replyToken || !event?.message?.text) {
      console.error('❌ イベント形式が不正');
      return res.status(400).send('Invalid event');
    }

    const userMessage = event.message.text;
    console.log('✅ 受信したメッセージ:', userMessage);

    // ✅ 返信送信
    const reply = await fetch('https://api.line.me/v2/bot/message/reply', {
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

    if (!reply.ok) {
      const errorText = await reply.text();
      console.error('❌ LINE返信エラー:', errorText);
      return res.status(500).send(errorText);
    }

    console.log('✅ LINEに返信完了');
    res.status(200).send('OK');
  } catch (err) {
    console.error('❌ サーバーエラー:', err);
    res.status(500).send('Server error');
  }
}
