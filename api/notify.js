export const config = {
  runtime: 'edge',
};

export default async function handler(req) {
  try {
    const { message } = await req.json();

    const lineRes = await fetch('https://notify-api.line.me/api/notify', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer jzcN59ozbLmEoRNvZLDqqKR5F5knZfYJshH1WIWzS0/J1Qq3KFNrPAOj38fQSrbBWYZexpcee7ay1FKdFCQR/2XYT0WU/M6DzfpBpig6QQqW/wDya8A/HUutZ6ostNExr74OE+5xGyyEwezl3xH5LAdB04t89/1O/w1cDnyilFU=',
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
