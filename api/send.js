// 全角記号や制御不能な文字を全て排除・変換する関数
function sanitizeText(text) {
  return text
    .normalize("NFKC") // 全角英数字・記号を半角へ変換
    .replace(/[（]/g, "(")
    .replace(/[）]/g, ")")
    .replace(/[｛]/g, "{")
    .replace(/[｝]/g, "}")
    .replace(/[＜]/g, "<")
    .replace(/[＞]/g, ">")
    .replace(/[［]/g, "[")
    .replace(/[］]/g, "]")
    .replace(/[　]/g, " ") // 全角スペースを半角スペースに
    .replace(/[^\x00-\x7F]/g, ""); // ASCII範囲外の文字を全削除
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  try {
    const body = req.body || {};
    const rawMessage = body.message || "これはチャトちゃんからの自動通知です📩";

    // ★ サニタイズ実行（全角除去）
    const message = sanitizeText(rawMessage);

    // 🔒 かずきくんのLINE User ID
    const userId = "U965e48c6b9d5cc3ae80e112f0d665357";

    // 🔐 LINE Messaging APIへ送信
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

    // レスポンスのチェック
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
