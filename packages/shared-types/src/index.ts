export enum TransactionType {
  SALE = "SALE",
  PAYMENT = "PAYMENT",
}

export interface IProduct {
  id: string;
  name: string;
  price: number;
  stockQuantity: number;
  unit: string;
  category: string;
  createdAt: string;
  updatedAt: string;
}

export interface ICustomer {
  id: string;
  name: string;
  phone: string;
  totalDebt: number;
  createdAt: string;
  updatedAt: string;
}

export interface ITransaction {
  id: string;
  customerId: string;
  type: TransactionType;
  amount: number;
  note: string;
  createdAt: string;
}

export interface ITransactionItem {
  id: string;
  transactionId: string;
  productId: string;
  quantity: number;
  unitPrice: number;
}

export interface ISaleItem {
  productId: string;
  quantity: number;
}
