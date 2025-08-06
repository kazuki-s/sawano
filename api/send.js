export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const body = await req.json?.().catch(() => null) || req.body;
  const message = body.message || "これはチャトちゃんからのテストメッセージです！";

  const userId = "YOUR_USER_ID_HERE"; // ← ここにLINEのユーザーIDを入れる

  const response = await fetch("https://api.line.me/v2/bot/message/push", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${process.env.LINE_ACCESS_TOKEN}`
    },
    body: JSON.stringify({
      to: userId,
      messages: [{ type: "text", text: message }]
    })
  });

  if (!response.ok) {
    const error = await response.text();
    return res.status(500).json({ error });
  }

  return res.status(200).json({ success: true });
}
