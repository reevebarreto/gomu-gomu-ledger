interface ReceiptItem {
  name: string;
  price: number;
}

const parseReceiptText = (extractedText: string | null | undefined) => {
  if (!extractedText) {
    return {
      store: "Unknown",
      date: null,
      items: [],
      total: 0,
    };
  }

  const lines = extractedText
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line);

  const storeName = lines.length > 0 ? lines[0] : null; // Assume first line is the store name
  let date = null;
  const items: ReceiptItem[] = [];
  let total: number | null = null;

  // Attempt to find the date
  const datePattern = /\b(\d{1,2}[/-]\d{1,2}[/-]\d{2,4})\b/;
  for (const line of lines) {
    const dateMatch = line.match(datePattern);
    if (dateMatch) {
      date = dateMatch[1];
      break;
    }
  }

  if (!date) {
    date = new Date().toISOString().split("T")[0]; // Use today if no date found
  }

  // Extract items and prices (handling multi-line format)
  let itemName = null;
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (line.toUpperCase().includes("TOTAL")) {
      break; // Stop processing items when reaching total
    }

    // Match standalone prices (ignoring quantity breakdowns like '2 @ £0.95')
    const priceMatch = /^(\d+\.?\d*)\s*[A-Z]?$|^£?(\d+\.?\d*)$/.exec(line);
    if (priceMatch && itemName) {
      const price = parseFloat(priceMatch[1] || priceMatch[2]);
      items.push({ name: itemName, price });
      itemName = null; // Reset item name after price is found
    } else if (!/\d+\s*@/.test(line) && !/^£?\d+\.?\d*$/.test(line)) {
      itemName = line; // Assume this line is an item name
    }
  }

  // Extract total (handling multi-line format)
  for (let i = 0; i < lines.length - 1; i++) {
    if (lines[i].toUpperCase().includes("TOTAL")) {
      try {
        total = parseFloat(lines[i + 1].replace("£", "")); // Remove currency symbol if present
      } catch {
        continue;
      }
      break;
    }
  }

  return {
    store: storeName,
    date: date,
    items,
    total,
  };
};

export default parseReceiptText;
