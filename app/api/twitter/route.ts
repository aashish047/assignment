import { NextRequest, NextResponse } from "next/server";
import TwitterApi from "twitter-api-sdk";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import FormData from "form-data";

dotenv.config();

// Initialize Twitter client
const client = new TwitterApi({
  bearer_token: process.env.TWITTER_BEARER_TOKEN as string,
  consumer_key: process.env.TWITTER_CONSUMER_KEY as string,
  consumer_secret: process.env.TWITTER_CONSUMER_SECRET as string,
  access_token: process.env.TWITTER_ACCESS_TOKEN as string,
  access_token_secret: process.env.TWITTER_ACCESS_SECRET as string,
});

export async function POST(req: NextRequest) {
  try {
    const { images } = await req.json();

    if (!images || images.length === 0) {
      return NextResponse.json({ message: "No images provided" }, { status: 400 });
    }

    const uploadedMediaIds: string[] = [];

    for (const imageUrl of images) {
      const imagePath = path.join(process.cwd(), "public", imageUrl);

      if (!fs.existsSync(imagePath)) {
        console.error("File not found:", imagePath);
        return NextResponse.json({ message: `File not found: ${imageUrl}` }, { status: 404 });
      }

      // Read image as binary
      const imageBuffer = fs.readFileSync(imagePath);
      const formData = new FormData();
      formData.append("media", imageBuffer, { filename: path.basename(imageUrl) });

      // Upload image to Twitter/X
      const uploadResponse = await fetch("https://upload.twitter.com/1.1/media/upload.json", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.TWITTER_BEARER_TOKEN}`,
        },
        body: formData,
      });

      const uploadData = await uploadResponse.json();

      if (!uploadResponse.ok) {
        console.error("Twitter upload failed:", uploadData);
        return NextResponse.json({ message: "Twitter upload failed" }, { status: 500 });
      }

      uploadedMediaIds.push(uploadData.media_id_string);
    }

    // Post tweet with media
    const tweetResponse = await client.tweets.createTweet({
      text: "Here are my resized images! 📸 #ImageProcessing",
      media: { media_ids: uploadedMediaIds },
    });

    return NextResponse.json({ message: "Tweet posted successfully!", tweet: tweetResponse });
  } catch (error) {
    console.error("Error posting to Twitter:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
