export type Receipt = {
  id: string;
  store: string;
  total: string;
  date: string;
};

export type ReceiptItems = {
  id: string;
  store: string;
  date: string;
  total: number;
  receipt_items: { name: string; price: number; quantity: number }[];
};
