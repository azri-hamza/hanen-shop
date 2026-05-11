import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api, CreateProductDto, UpdateProductDto, UpdateStockDto } from '../services/api.service';

const PRODUCTS_KEY = ['products'] as const;

export function useProducts(search?: string, category?: string) {
  return useQuery({
    queryKey: [...PRODUCTS_KEY, { search, category }],
    queryFn: () => api.products.getAll({ search, category }),
  });
}

export function useProduct(id: string) {
  return useQuery({
    queryKey: [...PRODUCTS_KEY, id],
    queryFn: () => api.products.getOne(id),
    enabled: !!id,
  });
}

export function useCreateProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: CreateProductDto) => api.products.create(dto),
    onSuccess: () => qc.invalidateQueries({ queryKey: PRODUCTS_KEY }),
  });
}

export function useUpdateProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: UpdateProductDto }) => api.products.update(id, dto),
    onSuccess: () => qc.invalidateQueries({ queryKey: PRODUCTS_KEY }),
  });
}

export function useAdjustStock() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: UpdateStockDto }) => api.products.adjustStock(id, dto),
    onSuccess: () => qc.invalidateQueries({ queryKey: PRODUCTS_KEY }),
  });
}
