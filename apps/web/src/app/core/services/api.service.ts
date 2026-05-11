import { Injectable, inject } from '@angular/core';
import { ApiClient } from '@hanen-shop/api-client';
import type { IProduct, ICustomer, ITransaction, ISaleItem } from '@hanen-shop/shared-types';

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

@Injectable({ providedIn: 'root' })
export class ApiService {
  private readonly client = new ApiClient('http://localhost:3000');

  products = {
    getAll: (params?: ProductsQueryParams) =>
      this.client.get<IProduct[]>('/products', { params }),

    getOne: (id: string) =>
      this.client.get<IProduct>(`/products/${id}`),

    create: (dto: CreateProductDto) =>
      this.client.post<IProduct>('/products', dto),

    update: (id: string, dto: UpdateProductDto) =>
      this.client.patch<IProduct>(`/products/${id}`, dto),

    adjustStock: (id: string, dto: UpdateStockDto) =>
      this.client.patch<IProduct>(`/products/${id}/stock`, dto),
  };

  customers = {
    getAll: (params?: CustomersQueryParams) =>
      this.client.get<ICustomer[]>('/customers', { params }),

    getOne: (id: string) =>
      this.client.get<ICustomer>(`/customers/${id}`),

    create: (dto: CreateCustomerDto) =>
      this.client.post<ICustomer>('/customers', dto),

    update: (id: string, dto: UpdateCustomerDto) =>
      this.client.patch<ICustomer>(`/customers/${id}`, dto),
  };

  transactions = {
    createSale: (dto: CreateSaleDto) =>
      this.client.post<ITransaction>('/transactions/sale', dto),

    createPayment: (dto: CreatePaymentDto) =>
      this.client.post<ITransaction>('/transactions/payment', dto),

    getCustomerLedger: (customerId: string) =>
      this.client.get<ITransaction[]>(`/transactions/customer/${customerId}`),
  };

  dashboard = {
    getSummary: () =>
      this.client.get<DashboardSummary>('/dashboard/summary'),
  };
}
