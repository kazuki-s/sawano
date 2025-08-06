export const config = {
  runtime: 'edge',
};

export default async function handler(req) {
  try {
    const { message } = await req.json();

    const LINE_ACCESS_TOKEN = process.env.LINE_ACCESS_TOKEN;

    const response = await fetch('https://notify-api.line.me/api/notify', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LINE_ACCESS_TOKEN}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: `message=${encodeURIComponent(message)}`, // ← ここが重要！
    });

    if (!response.ok) {
      const errorText = await response.text();
      return new Response(`LINE通知エラー: ${response.status}\n${errorText}`, { status: 500 });
    }

    return new Response('LINE通知に成功しました', { status: 200 });

  } catch (error) {
    return new Response(`通知エラー: ${error.message}`, { status: 500 });
  }
}
