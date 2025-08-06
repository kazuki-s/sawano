export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  try {
    // POSTされた内容を取得
    const body = req.body || {};
    const message = body.message || "これはチャトちゃんからのテストメッセージです✨";

    // ✅ かずきくんのLINE userId（Webhookから取得した値）
    const userId = "U965e48c6b9d5cc3ae80e112f0d665357";

    // LINE Messaging APIのPush送信用リクエスト
    const response = await fetch("https://api.line.me/v2/bot/message/push", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.LINE_ACCESS_TOKEN}`
      },
      body: JSON.stringify({
        to: userId,
        messages: [
          {
            type: "text",
            text: message
          }
        ]
      })
    });

    // LINE APIからの応答をチェック
    if (!response.ok) {
      const errorText = await response.text();
      return res.status(500).json({
        error: "LINE API Error",
        details: errorText
      });
    }

    return res.status(200).json({ success: true });

  } catch (err) {
    // 予期しないサーバーエラー
    return res.status(500).json({
      error: "Internal Server Error",
      details: err.message
    });
  }
}
