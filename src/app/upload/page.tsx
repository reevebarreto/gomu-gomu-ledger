"use client";

import { useState } from "react";

export default function UploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      setFile(event.target.files[0]);
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

      setMessage("Upload successful!");
    } catch (error) {
      // when the error is a response from the server NextResponse.json({ error: error.message }, { status: 500 });
      if (error instanceof Response) {
        const json = await error.json();
        setMessage(json.error);
      } else {
        setMessage("An unexpected error occurred");
      }
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <h1 className="text-2xl font-bold mb-4">Upload Receipt</h1>
      <input type="file" accept="image/*" onChange={handleFileChange} />
      <button
        className="mt-4 p-2 bg-blue-500 text-white rounded"
        onClick={handleUpload}
        disabled={!file || uploading}
      >
        {uploading ? "Uploading..." : "Upload"}
      </button>
      {message && <p className="mt-2">{message}</p>}
    </div>
  );
}
