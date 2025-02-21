/*import { NextRequest, NextResponse } from "next/server";
import { TwitterApi } from "twitter-api-v2";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";

dotenv.config();

// Initialize Twitter API client using OAuth 1.0a
const twitterClient = new TwitterApi({
  appKey: process.env.TWITTER_CONSUMER_KEY as string,
  appSecret: process.env.TWITTER_CONSUMER_SECRET as string,
  accessToken: process.env.TWITTER_ACCESS_TOKEN as string,
  accessSecret: process.env.TWITTER_ACCESS_SECRET as string,
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

      const mediaId = await uploadImageToTwitter(imagePath);
      if (mediaId) uploadedMediaIds.push(mediaId);
    }

    if (uploadedMediaIds.length === 0) {
      return NextResponse.json({ message: "Failed to upload images to Twitter" }, { status: 500 });
    }

    // Post a tweet with media
  //  const tweetResponse = await twitterClient.v2.tweet({
  //    text: "Here are my resized images! 📸 #ImageProcessing",
  //    media: { media_ids: uploadedMediaIds },
   // });
//
  //  return NextResponse.json({ message: "Tweet posted successfully!", tweet: tweetResponse });
  } catch (error: any) {
    console.error("Error posting to Twitter:", error);
    return NextResponse.json(
      { message: "Internal server error", error: error.message },
      { status: 500 }
    );
  }
}

async function uploadImageToTwitter(imagePath: string): Promise<string | null> {
  try {
    const imageBuffer = fs.readFileSync(imagePath);
    const mediaId = await twitterClient.v1.uploadMedia(imageBuffer, { mimeType: "image/png" });

    if (!mediaId) {
      console.error("Twitter media upload failed: No media ID returned.");
      return null;
    }

    console.log("Uploaded media ID:", mediaId);
    return mediaId;
  } catch (error) {
    console.error("Twitter image upload error:", error);
    return null;
  }
}
*/