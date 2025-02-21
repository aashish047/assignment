import { NextRequest, NextResponse } from "next/server";
import sharp from "sharp";
import axios from "axios";
import FormData from "form-data";
import path from "path";
import fs from "fs/promises";

// ImgBB API Key (Replace with your key)
const IMGBB_API_KEY = process.env.IMGBB_API_KEY ;

// Predefined Image Sizes
const PREDEFINED_SIZES = [
  { width: 300, height: 250 },
  { width: 728, height: 90 },
  { width: 160, height: 600 },
  { width: 300, height: 600 },
];

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as Blob | null;

    if (!file) {
      return NextResponse.json({ message: "No file uploaded" }, { status: 400 });
    }

    // Convert Blob to Buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Temporary storage for resized images
    const resizedImages: string[] = [];

    // Resize and upload each size to ImgBB
    for (const size of PREDEFINED_SIZES) {
      const resizedBuffer = await sharp(buffer)
        .resize(size.width, size.height)
        .toFormat("png")
        .toBuffer();

      // Convert buffer to a temporary file
      const tempFilePath = path.join("/tmp", `resized-${size.width}x${size.height}.png`);
      await fs.writeFile(tempFilePath, resizedBuffer);

      // Upload to ImgBB
      const imgFormData = new FormData();
      imgFormData.append("image", await fs.readFile(tempFilePath), {
        filename: `resized-${size.width}x${size.height}.png`,
      });

      const response = await axios.post(
        `https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`,
        imgFormData,
        { headers: imgFormData.getHeaders() }
      );

      // Store the uploaded image URL
      resizedImages.push(response.data.data.url);

      // Clean up temporary file
      await fs.unlink(tempFilePath);
    }

    return NextResponse.json({
      message: "Images resized and uploaded successfully",
      images: resizedImages,
    });
  } catch (error) {
    console.error("Error processing image:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
