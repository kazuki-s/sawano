export default async function handler(req, res) {
  if (req.method === 'POST') {
    try {
      const token = 'jzcN59ozbLmEoRNvZLDqqKR5F5knZfYJshH1WIWzS0/J1Qq3KFNrPAOj38fQSrbBWYZexpcee7ay1FKdFCQR/2XYT0WU/M6DzfpBp...

（ここに実際のトークンを省略せずにコピペしてね。上記トークンの全体を貼り付ける）

      const events = req.body.events;

      if (!events || events.length === 0) {
        return res.status(200).send('No event');
      }

      const replyToken = events[0].replyToken;
      const userMessage = events[0].message?.text || 'こんにちは！';

      const response = await fetch('https://api.line.me/v2/bot/message/reply', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          replyToken: replyToken,
          messages: [
            {
              type: 'text',
              text: `「${userMessage}」と受け取りました！`
            }
          ]
        })
      });

      if (response.ok) {
        res.status(200).json({ success: true });
      } else {
        const errorText = await response.text();
        res.status(500).json({ error: 'LINE API error', details: errorText });
      }
    } catch (error) {
      res.status(500).json({ error: 'Internal error', details: error.message });
    }
  } else {
    res.status(405).send('Method Not Allowed');
  }
}
