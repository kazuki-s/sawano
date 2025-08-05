export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { type, stock } = req.body;

  const message = {
    gosign: `🟢 Goサイン：${stock} にGoサインが出ました！`,
    alert: `⚠️ 逆指値接近：${stock}`,
    trigger: `🔥 爆発予兆検出：${stock}`,
    cutloss: `❌ 損切りライン到達：${stock}`,
    price: `
