export default function handler(req, res) {
  try {
    const { type, stock } = req.body;

    if (!type || !stock) {
      return res.status(400).json({ error: 'Missing type or stock' });
    }

    return res.status(200).json({ message: `受け取ったよ！type: ${type}, stock: ${stock}` });
  } catch (error) {
    console.error('Error:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}
