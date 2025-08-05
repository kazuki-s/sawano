// api/notify.js
export const config = {
  runtime: 'edge',
}

export default async function handler(req) {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method Not Allowed' }), { status: 405 })
  }

  try {
    const body = await req.json()
    const { type, name, price, current, percent } = body

    const message = generateMessage({ type, name, price, current, percent })

    const token = process.env.CHANNEL_ACCESS_TOKEN
    if (!token) {
      return new Response(JSON.stringify({ error: 'Missing CHANNEL_ACCESS_TOKEN' }), { status: 500 })
    }

    const response = await fetch('https://api.line.me/v2/bot/message/broadcast', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        messages: [{ type: 'text', text: message }],
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      return new Response(JSON.stringify({ error: 'LINE API error', detail: errorText }), { status: response.status })
    }

    return new Response(JSON.stringify({ status: 'ok' }), { status: 200 })

  } catch (error) {
    return new Response(JSON.stringify({ error: 'Invalid request', detail: error.message }), { status: 400 })
  }
}

function generateMessage({ type, name, price, current, percent }) {
  switch (type) {
    case 'gosign':
      return `🚦 Goサイン：${name} にGoサインが出ました！`
    case 'approaching':
      return `📉 接近アラート：${name} が逆指値（${price}円）に接近中（現在：${current}円）`
    case 'explosion':
      return `💥 爆発予兆：${name} に爆発予兆を検出！（出来高急増＋高値ブレイク）`
    case 'cutloss':
      return `🟥 損切り提案：${name} が逆指値に到達（${price}円）→自動損切りを検討してください`
    case 'pricecheck':
      return `📊 株価チェック：${name} 現在値：${current}円（${percent >= 0 ? '+' : ''}${percent}%）`
    default:
      return `📢 通知：${name} に関するお知らせです`
  }
}
