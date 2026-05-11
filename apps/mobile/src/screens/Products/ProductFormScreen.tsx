import React from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { useForm, Controller } from 'react-hook-form';
import { useProduct, useCreateProduct, useUpdateProduct } from '../../hooks/useProducts';
import type { ProductsStackParamList } from '../../navigation/stacks/ProductsStack';

type FormData = {
  name: string;
  price: string;
  stockQuantity: string;
  unit: string;
  category: string;
};

export function ProductFormScreen() {
  const route = useRoute<RouteProp<ProductsStackParamList, 'ProductForm'>>();
  const navigation = useNavigation();
  const productId = route.params?.id;
  const isEdit = !!productId;

  const { data: existing } = useProduct(productId ?? '');
  const createMutation = useCreateProduct();
  const updateMutation = useUpdateProduct();

  const { control, handleSubmit, formState: { errors } } = useForm<FormData>({
    defaultValues: {
      name: existing?.name ?? '',
      price: existing ? String(existing.price) : '',
      stockQuantity: existing ? String(existing.stockQuantity) : '0',
      unit: existing?.unit ?? 'piece',
      category: existing?.category ?? '',
    },
    values: existing
      ? {
          name: existing.name,
          price: String(existing.price),
          stockQuantity: String(existing.stockQuantity),
          unit: existing.unit,
          category: existing.category ?? '',
        }
      : undefined,
  });

  const onSubmit = async (data: FormData) => {
    try {
      const payload = {
        name: data.name,
        price: parseFloat(data.price),
        stockQuantity: parseInt(data.stockQuantity, 10) || 0,
        unit: data.unit,
        category: data.category || undefined,
      };

      if (isEdit && productId) {
        await updateMutation.mutateAsync({ id: productId, dto: payload });
      } else {
        await createMutation.mutateAsync(payload);
      }
      navigation.goBack();
    } catch {
      Alert.alert('Error', 'Failed to save product');
    }
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: '#f5f5f5' }} contentContainerStyle={{ padding: 16 }}>
      <View style={{ backgroundColor: '#fff', borderRadius: 12, padding: 16, elevation: 2 }}>
        <Controller
          name="name"
          control={control}
          rules={{ required: 'Name is required' }}
          render={({ field: { onChange, value } }) => (
            <View style={{ marginBottom: 16 }}>
              <Text style={{ fontSize: 14, color: '#666', marginBottom: 4 }}>Name *</Text>
              <TextInput style={inputStyle} value={value} onChangeText={onChange} placeholder="Product name" />
              {errors.name && <Text style={{ color: '#f44336', fontSize: 12 }}>{errors.name.message}</Text>}
            </View>
          )}
        />

        <Controller
          name="price"
          control={control}
          rules={{ required: 'Price is required', validate: (v) => parseFloat(v) > 0 || 'Must be positive' }}
          render={({ field: { onChange, value } }) => (
            <View style={{ marginBottom: 16 }}>
              <Text style={{ fontSize: 14, color: '#666', marginBottom: 4 }}>Price *</Text>
              <TextInput style={inputStyle} value={value} onChangeText={onChange} placeholder="0.00" keyboardType="decimal-pad" />
              {errors.price && <Text style={{ color: '#f44336', fontSize: 12 }}>{errors.price.message}</Text>}
            </View>
          )}
        />

        <Controller
          name="stockQuantity"
          control={control}
          render={({ field: { onChange, value } }) => (
            <View style={{ marginBottom: 16 }}>
              <Text style={{ fontSize: 14, color: '#666', marginBottom: 4 }}>Stock Quantity</Text>
              <TextInput style={inputStyle} value={value} onChangeText={onChange} keyboardType="number-pad" />
            </View>
          )}
        />

        <Controller
          name="unit"
          control={control}
          render={({ field: { onChange, value } }) => (
            <View style={{ marginBottom: 16 }}>
              <Text style={{ fontSize: 14, color: '#666', marginBottom: 4 }}>Unit</Text>
              <TextInput style={inputStyle} value={value} onChangeText={onChange} placeholder="piece, kg, litre..." />
            </View>
          )}
        />

        <Controller
          name="category"
          control={control}
          render={({ field: { onChange, value } }) => (
            <View style={{ marginBottom: 16 }}>
              <Text style={{ fontSize: 14, color: '#666', marginBottom: 4 }}>Category</Text>
              <TextInput style={inputStyle} value={value} onChangeText={onChange} placeholder="Category" />
            </View>
          )}
        />

        <TouchableOpacity
          onPress={handleSubmit(onSubmit)}
          style={{ backgroundColor: '#3f51b5', padding: 14, borderRadius: 8, alignItems: 'center' }}
        >
          <Text style={{ color: '#fff', fontWeight: '600', fontSize: 16 }}>
            {isEdit ? 'Update' : 'Create'}
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const inputStyle = {
  backgroundColor: '#f5f5f5',
  borderRadius: 8,
  padding: 12,
  fontSize: 16,
};
