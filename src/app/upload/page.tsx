"use client";

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
      setMessage("Ding ding! You're all good!");
    } catch {
      setMessage("Uh oh, something went wrong");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="flex items-center justify-center p-4">
      <div className="flex flex-col items-center justify-center space-y-4 p-4 rounded-lg">
        <h1 className="text-2xl font-semibold">Upload Receipt</h1>
        <label className="flex flex-col cursor-pointer">
          <input type="file" accept="image/*" onChange={handleFileChange} />
        </label>
        {image && (
          <>
            <div className="flex items-center justify-center border">
              <img
                src={image}
                alt="Uploaded Receipt"
                className="max-w-xs object-contain"
              />
            </div>
            <button
              className="flex items-center space-x-2 px-4 py-2 bg-sky-600 text-neutral-200 rounded disabled:opacity-50"
              onClick={handleUpload}
              disabled={!file || uploading}
            >
              {uploading ? (
                <>
                  <svg
                    className="animate-spin h-5 w-5 mr-2 text-white"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8v8H4z"
                    ></path>
                  </svg>
                  <span>Uploading...</span>
                </>
              ) : (
                <span>Upload Receipt</span>
              )}
            </button>
            {message && <p>{message}</p>}
          </>
        )}
      </div>
    </div>
  );
}
