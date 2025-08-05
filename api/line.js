import { json } from 'micro';
import { createHmac } from 'crypto';

// 環境変数から取得
const CHANNEL_SECRET = process.env.LINE_CHANNEL_SECRET;
const CHANNEL_ACCESS_TOKEN = process.env.LINE_CHANNEL_ACCESS_TOKEN;

export default async function handler(req, res) {
  try {
    if (req.method !== 'POST') {
      res.statusCode = 405;
      res.end('Method Not Allowed');
      return;
    }

    const body = await json(req);
    const signature = req.headers['x-line-signature'];

    const hash = createHmac('sha256', CHANNEL_SECRET)
      .update(JSON.stringify(body))
      .digest('base64');

    if (signature !== hash) {
      console.log('❌ Invalid signature');
      res.statusCode = 401;
      res.end('Unauthorized');
      return;
    }

    console.log('✅ 正常なリクエストを受信');
    console.log('📦 受信イベント:', JSON.stringify(body, null, 2));

    // 検証用イベントはスキップ
    if (body.events && body.events.length === 0) {
      console.log('⚠️ 検証用イベントのためスキップ');
      res.statusCode = 200;
      res.end('OK');
      return;
    }

    for (const event of body.events) {
      if (event.type === 'message' && event.message.type === 'text') {
        const replyToken = event.replyToken;
        const userMessage = event.message.text;

        // ログ表示
        console.log('🗨️ ユーザーのメッセージ:', userMessage);

        const replyMessage = {
          replyToken,
          messages: [
            {
              type: 'text',
              text: `受け取ったよ！: ${userMessage}`,
            },
          ],
        };

        const response = await fetch('https://api.line.me/v2/bot/message/reply', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${CHANNEL_ACCESS_TOKEN}`,
          },
          body: JSON.stringify(replyMessage),
        });

        const responseBody = await response.text();
        console.log('📨 LINEへの送信結果:', response.status, responseBody);
      }
    }

    res.statusCode = 200;
    res.end('OK');
  } catch (error) {
    console.error('❗エラーが発生:', error);
    res.statusCode = 500;
    res.end('Internal Server Error');
  }
}
