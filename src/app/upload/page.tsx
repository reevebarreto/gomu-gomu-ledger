"use client";

import Image from "next/image";
import { useState } from "react";

export default function UploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [image, setImage] = useState<string | null>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      setFile(event.target.files[0]);
      setImage(URL.createObjectURL(event.target.files[0]));
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setUploading(true);
    setMessage("");

    const formData = new FormData();
    formData.append("image", file);

    try {
      const response = await fetch("/api/receipts/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Upload failed");
      }
      response.json().then((data) => {
        console.log(data);
      });
      setMessage("Upload successful!");
    } catch (e) {
      console.log(e);
      setMessage("An unexpected error occurred");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="flex items-center justify-center p-4">
      <div className="flex flex-col items-center justify-center space-y-4 border p-4 rounded-lg">
        <label className="flex flex-col cursor-pointer">
          <input type="file" accept="image/*" onChange={handleFileChange} />
        </label>
        {image && (
          <>
            <div className="w-48 h-48 flex items-center justify-center border">
              <Image
                height={192}
                width={192}
                src={image}
                alt="Uploaded Receipt"
                className="w-full h-full object-contain"
              />
            </div>
            <button
              className="flex items-center space-x-2"
              onClick={handleUpload}
              disabled={!file || uploading}
            >
              <Image
                height={24}
                width={24}
                src="/camera.png"
                alt="Camera Icon"
                className="w-6 h-6"
              />
              <span>Upload Receipt</span>
            </button>
            {message && <p>{message}</p>}
          </>
        )}
      </div>
    </div>
  );
}
