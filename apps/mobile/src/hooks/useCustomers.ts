import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api, CreateCustomerDto } from '../services/api.service';

const CUSTOMERS_KEY = ['customers'] as const;

export function useCustomers(search?: string) {
  return useQuery({
    queryKey: [...CUSTOMERS_KEY, { search }],
    queryFn: () => api.customers.getAll({ search }),
  });
}

export function useCustomer(id: string) {
  return useQuery({
    queryKey: [...CUSTOMERS_KEY, id],
    queryFn: () => api.customers.getOne(id),
    enabled: !!id,
  });
}

export function useCustomerLedger(customerId: string) {
  return useQuery({
    queryKey: [...CUSTOMERS_KEY, customerId, 'ledger'],
    queryFn: () => api.transactions.getCustomerLedger(customerId),
    enabled: !!customerId,
  });
}

export function useCreateCustomer() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: CreateCustomerDto) => api.customers.create(dto),
    onSuccess: () => qc.invalidateQueries({ queryKey: CUSTOMERS_KEY }),
  });
}
