"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ReceiptItems } from "@/types";

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

export default function ReceiptsPage() {
  const [receipts, setReceipts] = useState<ReceiptItems[]>([]);
  const [selectedReceipt, setSelectedReceipt] = useState<ReceiptItems | null>(
    null
  );

  // Fetch receipts from API
  useEffect(() => {
    const fetchReceipts = async () => {
      try {
        const response = await fetch("/api/receipts");
        const data = await response.json();
        if (response.ok) {
          setReceipts(data);
        } else {
          console.error("Failed to fetch receipts:", data);
        }
      } catch (error) {
        console.error("Error fetching receipts:", error);
      }
    };

    fetchReceipts();
  }, []);

  return (
    <div className="flex h-screen">
      {/* Left Side - List of Receipts */}
      <div className="w-1/2 border-r p-4 overflow-y-auto">
        <h2 className="text-lg font-semibold mb-2">All Receipts</h2>
        <motion.ul
          className="space-y-2"
          initial="hidden"
          animate="visible"
          variants={listVariants}
        >
          {receipts.length > 0 ? (
            receipts.map((receipt) => (
              <motion.li
                key={receipt.id}
                onClick={() => setSelectedReceipt(receipt)}
                className={`p-3 border rounded-lg cursor-pointer hover:bg-gray-100 ${
                  selectedReceipt?.id === receipt.id ? "bg-gray-200" : ""
                }`}
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
            ))
          ) : (
            <p className="text-gray-500">No receipts found.</p>
          )}
        </motion.ul>
      </div>

      {/* Right Side - Selected Receipt Details */}
      <div className="w-1/2 p-4">
        {selectedReceipt ? (
          <div className="flex">
            <div className="p-4">
              <h2 className="text-xl font-bold">{selectedReceipt.store}</h2>
              <p className="text-gray-500">
                {new Date(selectedReceipt.date).toLocaleDateString()}
              </p>
              <h3 className="mt-4 text-lg font-semibold">Items</h3>
              <ul className="mt-2 space-y-1">
                {selectedReceipt.receipt_items.length > 0 ? (
                  selectedReceipt.receipt_items.map((item, index) => (
                    <li
                      key={index}
                      className="flex justify-between border-b py-1"
                    >
                      <span>{item.name}</span>
                      <p className="p-4"></p>
                      <span className="font-medium">
                        ${item.price.toFixed(2)}
                      </span>
                    </li>
                  ))
                ) : (
                  <p className="text-gray-500">No items found.</p>
                )}
              </ul>
              <p className="mt-4 font-bold text-lg">
                Total: $
                {selectedReceipt.total
                  ? selectedReceipt.total.toFixed(2)
                  : "0.00"}
              </p>
            </div>
          </div>
        ) : (
          <p className="text-gray-500 text-center mt-20">
            Select a receipt to view details.
          </p>
        )}
      </div>
    </div>
  );
}
