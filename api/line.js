export default function handler(req, res) {
  if (req.method === "POST") {
    console.log("POST received:", req.body);
    res.status(200).send("LINE Notify webhook received!");
  } else {
    res.status(405).send("Method Not Allowed");
  }
}
