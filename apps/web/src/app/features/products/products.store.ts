import { computed, inject } from '@angular/core';
import {
  signalStore,
  withState,
  withMethods,
  withComputed,
  patchState,
} from '@ngrx/signals';
import { IProduct } from '@hanen-shop/shared-types';
import { ApiService, CreateProductDto, UpdateProductDto, UpdateStockDto } from '../../core/services/api.service';

interface ProductsState {
  products: IProduct[];
  loading: boolean;
  error: string | null;
  searchQuery: string;
  categoryFilter: string;
}

const initialState: ProductsState = {
  products: [],
  loading: false,
  error: null,
  searchQuery: '',
  categoryFilter: '',
};

export const ProductsStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withComputed(({ products }) => ({
    productCount: computed(() => products().length),
  })),
  withMethods((store, api = inject(ApiService)) => ({
    async loadProducts(search?: string, category?: string) {
      patchState(store, { loading: true, error: null, searchQuery: search ?? '', categoryFilter: category ?? '' });
      try {
        const res = await api.products.getAll({ search, category });
        patchState(store, { products: res.data, loading: false });
      } catch {
        patchState(store, { error: 'Failed to load products', loading: false });
      }
    },

    async createProduct(dto: CreateProductDto) {
      const res = await api.products.create(dto);
      patchState(store, ({ products }) => ({ products: [...products, res.data] }));
      return res.data;
    },

    async updateProduct(id: string, dto: UpdateProductDto) {
      const res = await api.products.update(id, dto);
      patchState(store, ({ products }) => ({
        products: products.map((p) => (p.id === id ? res.data : p)),
      }));
      return res.data;
    },

    async adjustStock(id: string, dto: UpdateStockDto) {
      const res = await api.products.adjustStock(id, dto);
      patchState(store, ({ products }) => ({
        products: products.map((p) => (p.id === id ? res.data : p)),
      }));
      return res.data;
    },
  })),
);
