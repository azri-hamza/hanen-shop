import { computed, inject } from '@angular/core';
import {
  signalStore,
  withState,
  withMethods,
  withComputed,
  patchState,
} from '@ngrx/signals';
import { ICustomer, ITransaction } from '@hanen-shop/shared-types';
import { ApiService, CreateCustomerDto } from '../../core/services/api.service';

interface CustomersState {
  customers: ICustomer[];
  selectedCustomer: ICustomer | null;
  ledger: ITransaction[];
  loading: boolean;
  error: string | null;
}

const initialState: CustomersState = {
  customers: [],
  selectedCustomer: null,
  ledger: [],
  loading: false,
  error: null,
};

export const CustomersStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withComputed(({ customers }) => ({
    customerCount: computed(() => customers().length),
  })),
  withMethods((store, api = inject(ApiService)) => ({
    async loadCustomers(search?: string) {
      patchState(store, { loading: true, error: null });
      try {
        const res = await api.customers.getAll({ search });
        patchState(store, { customers: res.data, loading: false });
      } catch {
        patchState(store, { error: 'Failed to load customers', loading: false });
      }
    },

    async loadCustomerDetail(id: string) {
      patchState(store, { loading: true, error: null });
      try {
        const [customerRes, ledgerRes] = await Promise.all([
          api.customers.getOne(id),
          api.transactions.getCustomerLedger(id),
        ]);
        patchState(store, {
          selectedCustomer: customerRes.data,
          ledger: ledgerRes.data,
          loading: false,
        });
      } catch {
        patchState(store, { error: 'Failed to load customer detail', loading: false });
      }
    },

    async createCustomer(dto: CreateCustomerDto) {
      const res = await api.customers.create(dto);
      patchState(store, ({ customers }) => ({ customers: [...customers, res.data] }));
      return res.data;
    },

    clearSelection() {
      patchState(store, { selectedCustomer: null, ledger: [] });
    },
  })),
);
