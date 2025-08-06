// notify.js (Edge Functionとして対応済みバージョン)
export const config = {
  runtime: 'edge',
};

export default async function handler(req) {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method Not Allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const bodyText = await req.text();
    const { message } = JSON.parse(bodyText);

    const token = process.env.LINE_ACCESS_TOKEN;
    const notifyURL = 'https://notify-api.line.me/api/notify';

    const notifyRes = await fetch(notifyURL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: `message=${encodeURIComponent(message)}`,
    });

    const notifyText = await notifyRes.text();

    return new Response(JSON.stringify({ success: true, response: notifyText }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (error) {
    return new Response(JSON.stringify({ error: String(error) }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
