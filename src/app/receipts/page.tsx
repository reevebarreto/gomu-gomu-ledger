"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ReceiptItems } from "@/types";

const listVariants = {
  hidden: { opacity: 0, y: -20 },
  visible: { opacity: 1, y: 0, transition: { staggerChildren: 0.2 } },
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

  const handleDeleteReceipt = async () => {
    if (!selectedReceipt) return;

    try {
      const response = await fetch(`/api/receipts/${selectedReceipt.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Failed to delete receipt:", errorData.error);
        return;
      }

      // Remove deleted receipt from state
      setReceipts((prevReceipts) =>
        prevReceipts.filter((receipt) => receipt.id !== selectedReceipt.id)
      );

      setSelectedReceipt(null); // Clear selection
    } catch (error) {
      console.error("Error deleting receipt:", error);
    }
  };

  return (
    <div className="grid grid-cols-5">
      {/* Left Side - List of Receipts */}
      <div className="col-span-2 p-4 overflow-y-auto">
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
                className={`px-3 py-2 border border-neutral-600 rounded cursor-pointer hover:bg-[#2c2c2c] ${
                  selectedReceipt?.id === receipt.id ? "bg-[#2c2c2c]" : ""
                }`}
                variants={itemVariants}
              >
                <div className="flex justify-between">
                  <span className="font-medium text-md">{receipt.store}</span>
                  <span className="font-semibold">
                    €{receipt.total?.toFixed(2)}
                  </span>
                </div>
                <p className="text-sm text-neutral-500">
                  {new Date(receipt.date).toLocaleDateString()}
                </p>
              </motion.li>
            ))
          ) : (
            <p className="text-lg">No receipts found.</p>
          )}
        </motion.ul>
      </div>

      {/* Right Side - Selected Receipt Details */}
      <div className="col-span-3 p-4 border-l border-neutral-600">
        {selectedReceipt ? (
          <div className="flex flex-col p-4">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">{selectedReceipt.store}</h2>
              {/* Delete Button */}
              <button
                onClick={handleDeleteReceipt}
                className="bg-rose-500 text-neutral-200 text-sm px-6 py-2 rounded hover:bg-rose-600"
              >
                Delete
              </button>
            </div>
            <p className="text-md text-neutral-500">
              {new Date(selectedReceipt.date).toLocaleDateString()}
            </p>
            <h3 className="mt-4 text-lg font-semibold">Items</h3>
            <ul className="mt-2 space-y-2">
              {selectedReceipt.receipt_items.length > 0 ? (
                selectedReceipt.receipt_items.map((item, index) => (
                  <li
                    key={index}
                    className="flex justify-between border-b border-neutral-600 py-1 hover:text-neutral-300 cursor-pointer"
                  >
                    <span>
                      {item.quantity} x {item.name}
                    </span>
                    <span className="font-medium">
                      €{item.price.toFixed(2)}
                    </span>
                  </li>
                ))
              ) : (
                <p className="">No items found.</p>
              )}
            </ul>
            <p className="mt-4 font-bold text-xl text-neutral-300">
              Total: €
              {selectedReceipt.total
                ? selectedReceipt.total.toFixed(2)
                : "0.00"}
            </p>
          </div>
        ) : (
          <p className="text-center mt-20">Select a receipt to view details.</p>
        )}
      </div>
    </div>
  );
}
