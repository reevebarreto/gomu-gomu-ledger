interface ReceiptItem {
  name: string;
  price: number;
}

const parseReceiptText = (extractedText: string | null | undefined) => {
  if (!extractedText) {
    return {
      store: "Unknown",
      date: new Date().toISOString().split("T")[0], // Default to today
      items: [],
      total: 0,
    };
  }

  const lines = extractedText
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line);

  // 1️⃣ **Extract Store Name (First Line)**
  const storeName = lines[0] || "Unknown";

  // 2️⃣ **Extract Date (If Present)**
  let date: string | null = null;
  const datePattern = /\b(\d{1,2}[/-]\d{1,2}[/-]\d{2,4})\b/;
  for (const line of lines) {
    const match = line.match(datePattern);
    if (match) {
      date = match[1];
      break;
    }
  }
  if (!date) {
    date = new Date().toISOString().split("T")[0]; // Default to today
  }

  // 3️⃣ **Extract Prices (and assume the last price is the total)**
  const pricePattern = /€\s?(\d+\.\d{2})|EUR\s?(\d+\.\d{2})/g;
  let lastPrice: number | null = null;
  const potentialPrices: number[] = [];

  lines.forEach((line) => {
    let match;
    while ((match = pricePattern.exec(line)) !== null) {
      const price = parseFloat(match[1] || match[2]);
      potentialPrices.push(price);
    }
  });

  if (potentialPrices.length > 0) {
    lastPrice = potentialPrices[potentialPrices.length - 1]; // Assume the last price is the total
  }

  // 4️⃣ **Extract Items (Matching Names with Prices)**
  const items: ReceiptItem[] = [];
  let currentItemName = "";
  let collectingItems = true;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Ignore sections that indicate the receipt summary (payment details, total, etc.)
    if (
      line.toUpperCase().includes("TOTAL") ||
      line.toUpperCase().includes("VISA") ||
      line.toUpperCase().includes("CARD") ||
      line.toUpperCase().includes("CLUBCARD") ||
      line.toUpperCase().includes("CHANGE DUE") ||
      line.toUpperCase().includes("AUTH CODE") ||
      line.toUpperCase().includes("MERCHANT")
    ) {
      collectingItems = false;
      break;
    }

    // Check if the line contains a price
    const priceMatch = line.match(pricePattern);
    if (priceMatch) {
      const price = parseFloat(priceMatch[1] || priceMatch[2]);

      // Store the item only if we previously collected a name
      if (currentItemName) {
        items.push({ name: currentItemName, price });
        currentItemName = ""; // Reset
      }
    } else {
      // If no price is found, assume it's part of the item name
      if (collectingItems) {
        currentItemName += (currentItemName ? " " : "") + line;
      }
    }
  }

  return {
    store: storeName,
    date: date,
    items,
    total: lastPrice || 0,
  };
};

export default parseReceiptText;
