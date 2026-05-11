import { ApiClient } from '@hanen-shop/api-client';
import type { IProduct, ICustomer, ITransaction, ISaleItem } from '@hanen-shop/shared-types';
import { BASE_URL } from '../constants/api';

const client = new ApiClient(BASE_URL);

export interface ProductsQueryParams {
  search?: string;
  category?: string;
}

export interface CustomersQueryParams {
  search?: string;
}

export interface CreateProductDto {
  name: string;
  price: number;
  stockQuantity?: number;
  unit?: string;
  category?: string;
}

export interface UpdateProductDto {
  name?: string;
  price?: number;
  stockQuantity?: number;
  unit?: string;
  category?: string;
}

export interface UpdateStockDto {
  quantity: number;
  operation: 'increment' | 'decrement';
}

export interface CreateCustomerDto {
  name: string;
  phone?: string;
}

export interface UpdateCustomerDto {
  name?: string;
  phone?: string;
}

export interface CreateSaleDto {
  customerId: string;
  items: ISaleItem[];
  note?: string;
}

export interface CreatePaymentDto {
  customerId: string;
  amount: number;
  note?: string;
}

export interface DashboardSummary {
  lowStockProducts: IProduct[];
  topDebtors: ICustomer[];
  todayRevenue: number;
  todayPayments: number;
}

export const api = {
  products: {
    getAll: (params?: ProductsQueryParams) =>
      client.get<IProduct[]>('/products', { params } as any).then((r) => r.data),

    getOne: (id: string) =>
      client.get<IProduct>(`/products/${id}`).then((r) => r.data),

    create: (dto: CreateProductDto) =>
      client.post<IProduct>('/products', dto).then((r) => r.data),

    update: (id: string, dto: UpdateProductDto) =>
      client.patch<IProduct>(`/products/${id}`, dto).then((r) => r.data),

    adjustStock: (id: string, dto: UpdateStockDto) =>
      client.patch<IProduct>(`/products/${id}/stock`, dto).then((r) => r.data),
  },

  customers: {
    getAll: (params?: CustomersQueryParams) =>
      client.get<ICustomer[]>('/customers', { params } as any).then((r) => r.data),

    getOne: (id: string) =>
      client.get<ICustomer>(`/customers/${id}`).then((r) => r.data),

    create: (dto: CreateCustomerDto) =>
      client.post<ICustomer>('/customers', dto).then((r) => r.data),

    update: (id: string, dto: UpdateCustomerDto) =>
      client.patch<ICustomer>(`/customers/${id}`, dto).then((r) => r.data),
  },

  transactions: {
    createSale: (dto: CreateSaleDto) =>
      client.post<ITransaction>('/transactions/sale', dto).then((r) => r.data),

    createPayment: (dto: CreatePaymentDto) =>
      client.post<ITransaction>('/transactions/payment', dto).then((r) => r.data),

    getCustomerLedger: (customerId: string) =>
      client.get<ITransaction[]>(`/transactions/customer/${customerId}`).then((r) => r.data),
  },

  dashboard: {
    getSummary: () =>
      client.get<DashboardSummary>('/dashboard/summary').then((r) => r.data),
  },
};
