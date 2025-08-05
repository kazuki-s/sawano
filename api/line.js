export const config = {
  api: {
    bodyParser: false,
  },
};

import crypto from 'crypto';

const LINE_CHANNEL_SECRET = 'd9bd6d98a29d04823486e1b56a88aaa7';
const LINE_CHANNEL_ACCESS_TOKEN = 'jzcN59ozbLmEoRNvZLDqqKR5F5knZfYJshH1WIWzS0/J1Qq3KFNrPAOj38fQSrbBWYZexpcee7ay1FKdFCQR/2XYT0WU/M6DzfpBpig6QQqW/wDya8A/HUutZ6ostNExr74OE+5xGyyEwezl3xH5LAdB04t89/1O/w1cDnyilFU=';

async function getRawBody(req) {
  const chunks = [];
  for await (const chunk of req) {
    chunks.push(chunk);
  }
  return Buffer.concat(chunks);
}

export default async function handler(req, res) {
  try {
    if (req.method !== 'POST') {
      console.error('❌ Not a POST request');
      return res.status(405).send('Method Not Allowed');
    }

    const bodyBuffer = await getRawBody(req);
    const signature = req.headers['x-line-signature'];

    const hash = crypto
      .createHmac('sha256', LINE_CHANNEL_SECRET)
      .update(bodyBuffer)
      .digest('base64');

    if (hash !== signature) {
      console.error('❌ Invalid signature');
      return res.status(400).send('Invalid signature');
    }

    const bodyText = bodyBuffer.toString();
    const body = JSON.parse(bodyText);
    console.log('📦 Parsed body:', body);

    const event = body.events?.[0];
    if (!event?.replyToken || !event?.message?.text) {
      console.error('❌ Invalid event structure');
      return res.status(400).send('Invalid event');
    }

    const replyBody = {
      replyToken: event.replyToken,
      messages: [{ type: 'text', text: `受け取ったよ！: ${event.message.text}` }],
    };

    console.log('📤 Sending reply to LINE:', replyBody);

    const reply = await fetch('https://api.line.me/v2/bot/message/reply', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${LINE_CHANNEL_ACCESS_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(replyBody),
    });

    if (!reply.ok) {
      const errorText = await reply.text();
      console.error('❌ LINE API error:', errorText);
      return res.status(500).send(errorText);
    }

    console.log('✅ Reply sent successfully');
    res.status(200).send('OK');
  } catch (err) {
    console.error('❌ Unexpected error:', err);
    res.status(500).send('Internal Server Error');
  }
}
