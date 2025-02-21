import { NextRequest, NextResponse } from "next/server";
import sharp from "sharp";
import fs from "fs/promises";
import path from "path";

// Allowed image sizes
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

    // Define the uploads directory inside `public/`
    const uploadDir = path.join(process.cwd(), "public", "uploads");
    await fs.mkdir(uploadDir, { recursive: true });

    // Save original image
    const originalFileName = `original-${Date.now()}.png`;
    const originalFilePath = path.join(uploadDir, originalFileName);
    await fs.writeFile(originalFilePath, buffer);

    // Process image resizing
    const resizedImages: string[] = [];

    for (const size of PREDEFINED_SIZES) {
      const resizedFileName = `resized-${size.width}x${size.height}-${Date.now()}.png`;
      const resizedFilePath = path.join(uploadDir, resizedFileName);

      await sharp(originalFilePath)
        .resize(size.width, size.height)
        .toFormat("png")
        .toFile(resizedFilePath);

      // Store accessible URL instead of file path
      resizedImages.push(`/uploads/${resizedFileName}`);
    }

    return NextResponse.json({
      message: "Images resized successfully",
      images: resizedImages,
    });
  } catch (error) {
    console.error("Error processing image:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
