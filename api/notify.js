export const config = {
  runtime: 'edge',
};

export default async function handler(req) {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const bodyText = await req.text();
    const data = JSON.parse(bodyText);

    const { type, stock } = data;

    if (!type || !stock) {
      return new Response(JSON.stringify({ error: 'Missing type or stock' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // 通知メッセージ作成（全角記号などに注意）
    const rawMessage = type === "gosign"
      ? `${stock} に Goサインが出ました！`
      : `${stock} の通知タイプ(${type})が届きました。`;

    const message = encodeURIComponent(rawMessage);

    const token = process.env.LINE_ACCESS_TOKEN;

    const res = await fetch("https://notify-api.line.me/api/notify", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: `Bearer ${token}`,
      },
      body: `message=${message}`,
    });

    if (!res.ok) {
      const errorText = await res.text();
      return new Response(JSON.stringify({ error: `LINE通知失敗: ${errorText}` }), {
        status: res.status,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (error) {
    return new Response(JSON.stringify({ error: `通知エラー: ${error.message}` }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
