export default function handler(req, res) {
  console.log(req.body);  // Vercelのログで確認する用

  return res.status(200).json({ message: `受け取ったよ！: ${req.body.stock}` });
}
