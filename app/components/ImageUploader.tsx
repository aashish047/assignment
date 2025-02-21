"use client";

import { useState } from "react";

export default function ImageUploader() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [resizedImages, setResizedImages] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setPreview(URL.createObjectURL(e.target.files[0]));
    }
  };
  const handlePostToTwitter = async () => {
    if (resizedImages.length === 0) return alert("No images to post!");
  
    try {
      const response = await fetch("/api/twitter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ images: resizedImages }),
      });
  
      const data = await response.json();
      if (response.ok) {
        alert("Tweet posted successfully!");
      } else {
        alert(data.message);
      }
    } catch (error) {
      console.error("Twitter post failed:", error);
      alert("Failed to post to Twitter.");
    }
  };
  const handleUpload = async () => {
    if (!file) return alert("Please select an image");

    setLoading(true);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();
      if (response.ok) {
        setResizedImages(data.images);
      } else {
        alert(data.message);
      }
    } catch (error) {
      console.error("Upload failed:", error);
      alert("Upload failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 max-w-md mx-auto" style={{display: "flex", flexDirection:"column",justifyContent:"center", alignItems:"center"}}>
      <h1 style={{fontSize:"3vw", margin:"30px 10px 30px 10px"}}>Z1 Task Image Resizer</h1>
      <input type="file" accept="image/*" onChange={handleFileChange} className="mb-4" />
      {preview && <img src={preview} alt="Preview" className="mb-4 w-full" />}
      <button
        onClick={handleUpload}
        className="bg-blue-500 text-white px-4 py-2 rounded"
        disabled={loading} style={{width:"100%"}}
      >
        {loading ? "Uploading..." : "Upload & Resize"}
      </button>
      <button
  onClick={handlePostToTwitter}
  className="bg-blue-500 text-white px-4 py-2 rounded mt-4"
  style={{width:"100%"}}
>
  Post to Twitter
</button>
      {resizedImages.length > 0 && (
        <div className="mt-4">
          <h3 className="text-lg font-semibold">Resized Images:</h3>
          {resizedImages.map((url, index) => (
            <img key={index} src={url} alt={`Resized ${index}`} className="mt-2 w-full" />
          ))}
        </div>
      )}
    </div>
  );
}
