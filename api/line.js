export default function handler(req, res) {
  if (req.method === 'POST') {
    console.log('✅ POST受け取りました！');
    res.status(200).json({ message: 'OK' });
  } else {
    res.status(405).json({ error: 'Method Not Allowed' });
  }
}
