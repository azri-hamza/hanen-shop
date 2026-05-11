import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api, CreateSaleDto, CreatePaymentDto } from '../services/api.service';

export function useCreateSale() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: CreateSaleDto) => api.transactions.createSale(dto),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['customers'] });
      qc.invalidateQueries({ queryKey: ['products'] });
      qc.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}

export function useCreatePayment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: CreatePaymentDto) => api.transactions.createPayment(dto),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['customers'] });
      qc.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}
