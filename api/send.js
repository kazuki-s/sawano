// 全角記号を半角に置き換える関数（ByteString変換対策）
function sanitizeText(text) {
  return text
    .replace(/（/g, "(")
    .replace(/）/g, ")")
    .replace(/［/g, "[")
    .replace(/］/g, "]")
    .replace(/｛/g, "{")
    .replace(/｝/g, "}")
    .replace(/＜/g, "<")
    .replace(/＞/g, ">")
    .replace(/　/g, " ")  // 全角スペースも半角に変換（任意）
    .replace(/[^\x00-\x7F]/g, (c) => c); // その他は通す
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  try {
    // 安全にメッセージ取得し、全角→半角へ変換
    const body = req.body || {};
    const rawMessage = body.message || "これはチャトちゃんからの自動通知テストです📩";
    const message = sanitizeText(rawMessage);

    // かずきくんのLINE userId
    const userId = "U965e48c6b9d5cc3ae80e112f0d665357";

    // LINE APIへプッシュ通知送信
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

    if (!response.ok) {
      const errorText = await response.text();
      return res.status(500).json({
        error: "LINE API Error",
        details: errorText
      });
    }

    return res.status(200).json({ success: true });

  } catch (err) {
    return res.status(500).json({
      error: "Internal Server Error",
      details: err.message
    });
  }
}
