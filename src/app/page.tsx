"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Receipt } from "@/types";

const listVariants = {
  hidden: { opacity: 0, y: -20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { staggerChildren: 0.2 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: -10 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
};

export default function UploadPage() {
  const [recentReceipts, setRecentReceipts] = useState<Receipt[]>([]);

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
  return (
    <div className="flex items-center justify-center p-4">
      <div className="w-full max-w-2xl p-4 rounded-lg">
        <h2 className="text-lg font-semibold mb-2">Recent Receipts</h2>
        <motion.ul
          className="space-y-2"
          initial="hidden"
          animate="visible"
          variants={listVariants}
        >
          {recentReceipts.length > 0 &&
            recentReceipts.map((receipt) => (
              <motion.li
                key={receipt.id}
                className={`p-3 border rounded-lg hover:bg-gray-100}`}
                variants={itemVariants}
              >
                <div className="flex justify-between">
                  <span className="font-medium">{receipt.store}</span>
                  <span className="font-semibold">${receipt.total}</span>
                </div>
                <p className="text-sm text-gray-500">
                  {new Date(receipt.date).toLocaleDateString()}
                </p>
              </motion.li>
            ))}
        </motion.ul>
      </div>
    </div>
  );
}
