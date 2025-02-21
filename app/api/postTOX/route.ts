import { NextApiRequest, NextApiResponse } from "next";
import axios from "axios";

const X_API_URL = "https://upload.twitter.com/1.1/media/upload.json";
const X_POST_URL = "https://api.twitter.com/2/tweets";
const BEARER_TOKEN = process.env.TWITTER_BEARER_TOKEN || "";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).json({ message: "Method Not Allowed" });

  try {
    const { images } = req.body;

    if (!images || images.length === 0) return res.status(400).json({ message: "No images provided" });

    const mediaIds = [];
    for (const image of images) {
      const imageData = await axios.get(image, { responseType: "arraybuffer" });
      const encodedImage = Buffer.from(imageData.data).toString("base64");

      const uploadResponse = await axios.post(X_API_URL, { media_data: encodedImage }, {
        headers: { Authorization: `Bearer ${BEARER_TOKEN}` },
      });

      mediaIds.push(uploadResponse.data.media_id_string);
    }

    await axios.post(X_POST_URL, { text: "Here are my resized images!", media_ids: mediaIds.join(",") }, {
      headers: { Authorization: `Bearer ${BEARER_TOKEN}` },
    });

    res.status(200).json({ message: "Images posted to X successfully!" });
  } catch (error) {
    console.error("Error posting to X:", error);
    res.status(500).json({ message: "Failed to post to X" });
  }
}
