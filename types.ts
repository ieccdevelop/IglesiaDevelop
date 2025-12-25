
export interface Book {
  id: string;
  isbn: string;
  title: string;
  author: string;
  publisher: string;
  vendor: string;
  purchasePrice: number;
  sellingPrice: number;
  stock: number;
  createdAt: number;
}

export enum PaymentMethod {
  CASH = 'Efectivo',
  CARD = 'Tarjeta',
  TRANSFER = 'Transferencia'
}

export interface Sale {
  id: string;
  bookId: string;
  bookTitle: string;
  finalPrice: number;
  paymentMethod: PaymentMethod;
  timestamp: number;
}

export interface CashTransaction {
  id: string;
  type: 'IN' | 'OUT';
  amount: number;
  description: string;
  timestamp: number;
}

export interface InventoryStats {
  totalBooks: number;
  inventoryValue: number;
  potentialProfit: number;
}
