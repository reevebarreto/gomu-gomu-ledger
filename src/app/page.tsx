"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

type Receipt = {
  id: string;
  store: string;
  total: string;
  date: string;
};

export default function UploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [recentReceipts, setRecentReceipts] = useState<Receipt[]>([]);
  const [image, setImage] = useState<string | null>(null);

  useEffect(() => {
    fetchReceipts();
  }, []);

  const fetchReceipts = async () => {
    try {
      const response = await fetch("/api/receipts");
      const data = await response.json();

      if (response.ok) {
        // Sort receipts by date (assuming 'date' is a valid ISO string)
        const sortedReceipts = data.sort(
          (a: Receipt, b: Receipt) =>
            new Date(b.date).getTime() - new Date(a.date).getTime()
        );

        // Get the 4 most recent receipts
        setRecentReceipts(sortedReceipts.slice(0, 4));
      } else {
        console.error("Failed to fetch receipts:", data);
      }
    } catch (error) {
      console.error("Error fetching receipts:", error);
    }
  };

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

      setMessage("Upload successful!");

      await fetchReceipts();
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
    <div className="h-screen flex items-center justify-center p-4">
      <div className="grid md:grid-cols-2 gap-4">
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

        <div className="w-full max-w-md border p-4 rounded-lg">
          <h2 className="text-lg font-semibold mb-2">Recent Receipts</h2>
          <ul className="space-y-2">
            {recentReceipts.length > 0 ? (
              recentReceipts.map((receipt) => (
                <li
                  key={receipt.id}
                  className="p-2 border rounded-lg flex justify-between"
                >
                  <span>{receipt.date}</span>
                  <span>{receipt.store}</span>
                  <span className="font-semibold">${receipt.total}</span>
                </li>
              ))
            ) : (
              <p className="text-gray-500">No receipts found.</p>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
}
