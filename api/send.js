// 全角記号などを半角に変換する関数
function sanitizeText(text) {
  return text
    .replace(/[（]/g, "(")
    .replace(/[）]/g, ")")
    .replace(/[［]/g, "[")
    .replace(/[］]/g, "]")
    .replace(/[｛]/g, "{")
    .replace(/[｝]/g, "}")
    .replace(/[＜]/g, "<")
    .replace(/[＞]/g, ">")
    .replace(/[　]/g, " ") // 全角スペース
    .replace(/[\uFF01-\uFF5E]/g, ch => String.fromCharCode(ch.charCodeAt(0) - 0xFEE0)); // 全角英数記号を半角に
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  try {
    const body = req.body || {};
    const rawMessage = body.message || "これはチャトちゃんからの通知（テスト）";

    // 🔥 強制変換して確認ログ
    const sanitized = sanitizeText(rawMessage);
    console.log("💬 Before:", rawMessage);
    console.log("💬 After:", sanitized);

    const userId = "U965e48c6b9d5cc3ae80e112f0d665357";

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
            text: sanitized
          }
        ]
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("❌ LINE API ERROR:", errorText);
      return res.status(500).json({
        error: "LINE API Error",
        details: errorText
      });
    }

    return res.status(200).json({ success: true });

  } catch (err) {
    console.error("💥 Unexpected Error:", err);
    return res.status(500).json({
      error: "Internal Server Error",
      details: err.message
    });
  }
}
