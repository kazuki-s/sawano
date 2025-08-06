export const config = {
  runtime: "edge",
};

export default async function handler(req) {
  try {
    const { message, userId } = await req.json();

    // ログ出力（デバッグ用）
    console.log("Raw message:", message);
    console.log("Raw userId:", userId);

    // ByteString制限対応（1文字ずつcodePointで判定）
    const sanitizeMessage = (text) => {
      return Array.from(text).filter(char => {
        const code = char.codePointAt(0);
        return code !== undefined && code <= 255;
      }).join('');
    };

    const safeMessage = sanitizeMessage(message);
    console.log("Sanitized:", safeMessage);

    const res = await fetch("https://api.line.me/v2/bot/message/push", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.LINE_ACCESS_TOKEN}`,
      },
      body: JSON.stringify({
        to: userId,
        messages: [
          {
            type: "text",
            text: safeMessage,
          },
        ],
      }),
    });

    if (!res.ok) {
      const errorText = await res.text();
      console.error("LINE API error:", errorText);
      return new Response(JSON.stringify({ error: "Failed to send LINE message", details: errorText }), {
        status: res.status,
        headers: { "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("Unhandled Error:", error);
    return new Response(JSON.stringify({
      error: "Internal Server Error",
      details: error.message,
    }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
