export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { type, stock } = req.body;

    const message = type === "gosign"
      ? `${stock} に Goサインが出ました！`
      : `${stock} の通知タイプ（${type}）が届きました。`;

    const token = process.env.LINE_ACCESS_TOKEN;

    const response = await fetch("https://notify-api.line.me/api/notify", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "Authorization": `Bearer ${token}`,
      },
      body: `message=${encodeURIComponent(message)}`
    });

    if (!response.ok) {
      const text = await response.text();
      return res.status(response.status).json({ error: "LINE通知に失敗しました", detail: text });
    }

    return res.status(200).json({ success: true });

  } catch (err) {
    console.error("通知エラー:", err);
    return res.status(500).json({ error: "サーバーエラー", detail: err.message });
  }
}
