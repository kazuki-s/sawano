export const config = {
  runtime: 'edge',
};

export default async function handler(req) {
  try {
    const { message } = await req.json();

    const lineRes = await fetch('https://notify-api.line.me/api/notify', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer あなたのLINEアクセストークン',
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({ message }),
    });

    const resultText = await lineRes.text();
    return new Response(resultText, {
      status: lineRes.status,
      headers: { 'Content-Type': 'text/plain' },
    });

  } catch (error) {
    return new Response(`エラー: ${error.message}`, { status: 500 });
  }
}
