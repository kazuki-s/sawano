// 安全な文字列に変換する（全角→半角＋ASCII外除去）
function sanitizeText(text) {
  return text
    .normalize("NFKC") // 全角→半角英数字記号へ変換
    .replace(/[（]/g, "(")
    .replace(/[）]/g, ")")
    .replace(/[｛]/g, "{")
    .replace(/[｝]/g, "}")
    .replace(/[＜]/g, "<")
    .replace(/[＞]/g, ">")
    .replace(/[［]/g, "[")
    .replace(/[］]/g, "]")
    .replace(/[　]/g, " ")
    .replace(/[^\x00-\x7F]/g, ""); // ASCII範囲外を削除
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  try {
    // 外部から送られた文字列は一切使わず、固定文を送る
    const rawMessage = "テスト（強制サニタイズ）チャトちゃん通知";
    const message = sanitizeText(rawMessage);

    // ログで変換結果を明示
    console.log("💬 Raw Message:", rawMessage);
    console.log("💬 Sanitized:", message);

    // かずきくんのLINE User ID
    const userId = "U965e48c6b9d5cc3ae80e112f0d665357";

    // LINE Messaging APIにPush通知
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

    // LINE APIの応答確認
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
