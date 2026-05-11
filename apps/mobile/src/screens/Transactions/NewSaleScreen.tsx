import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import * as Haptics from 'expo-haptics';
import { ICustomer, IProduct, ISaleItem } from '@hanen-shop/shared-types';
import { api } from '../../services/api.service';
import { useCreateSale } from '../../hooks/useTransactions';
import type { TransactionsStackParamList } from '../../navigation/stacks/TransactionsStack';

interface SelectedItem {
  product: IProduct;
  quantity: number;
}

export function NewSaleScreen() {
  const route = useRoute<RouteProp<TransactionsStackParamList, 'NewSale'>>();
  const navigation = useNavigation();
  const createSale = useCreateSale();

  const [step, setStep] = useState(1);

  const [customers, setCustomers] = useState<ICustomer[]>([]);
  const [products, setProducts] = useState<IProduct[]>([]);
  const [customerSearch, setCustomerSearch] = useState('');
  const [productSearch, setProductSearch] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<ICustomer | null>(null);
  const [selectedItems, setSelectedItems] = useState<SelectedItem[]>([]);
  const [note, setNote] = useState('');

  useEffect(() => {
    api.customers.getAll().then(setCustomers).catch(() => {});
    api.products.getAll().then(setProducts).catch(() => {});

    const prefillId = route.params?.customerId;
    if (prefillId) {
      api.customers.getOne(prefillId).then(setSelectedCustomer).catch(() => {});
    }
  }, [route.params?.customerId]);

  const filteredCustomers = customers.filter((c) =>
    c.name.toLowerCase().includes(customerSearch.toLowerCase()),
  );

  const filteredProducts = products.filter((p) =>
    p.name.toLowerCase().includes(productSearch.toLowerCase()),
  );

  const totalAmount = selectedItems.reduce(
    (sum, item) => sum + Number(item.product.price) * item.quantity, 0,
  );

  const addProduct = (product: IProduct) => {
    if (product.stockQuantity <= 0) {
      Alert.alert('Out of stock', `"${product.name}" is out of stock`);
      return;
    }
    setSelectedItems((prev) => {
      const existing = prev.find((i) => i.product.id === product.id);
      if (existing) {
        return prev.map((i) =>
          i.product.id === product.id ? { ...i, quantity: i.quantity + 1 } : i,
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
  };

  const updateQty = (productId: string, qty: number) => {
    const num = Math.max(1, Math.floor(Number(qty)));
    setSelectedItems((prev) =>
      prev.map((i) => (i.product.id === productId ? { ...i, quantity: num } : i)),
    );
  };

  const removeItem = (productId: string) => {
    setSelectedItems((prev) => prev.filter((i) => i.product.id !== productId));
  };

  const handleSubmit = async () => {
    if (!selectedCustomer || !selectedItems.length) return;

    try {
      await createSale.mutateAsync({
        customerId: selectedCustomer.id,
        items: selectedItems.map((i): ISaleItem => ({ productId: i.product.id, quantity: i.quantity })),
        note: note || undefined,
      });
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert('Success', 'Sale created', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (err: any) {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      const msg = err?.response?.data?.message ?? err?.message ?? 'Failed to create sale';
      Alert.alert('Error', msg);
    }
  };

  if (!customers.length || !products.length) {
    return <ActivityIndicator style={{ flex: 1, justifyContent: 'center' }} />;
  }

  return (
    <ScrollView style={{ flex: 1, backgroundColor: '#f5f5f5' }} contentContainerStyle={{ padding: 16 }}>
      <View style={{ backgroundColor: '#fff', borderRadius: 12, padding: 16, elevation: 2 }}>
        <Text style={{ fontSize: 18, fontWeight: '600', marginBottom: 12 }}>Step 1: Select Customer</Text>
        <TextInput
          placeholder="Search customer..."
          value={customerSearch}
          onChangeText={setCustomerSearch}
          style={{ backgroundColor: '#f5f5f5', borderRadius: 8, padding: 12, fontSize: 16, marginBottom: 8 }}
        />
        {filteredCustomers.map((c) => (
          <TouchableOpacity
            key={c.id}
            onPress={() => { setSelectedCustomer(c); setStep(2); }}
            style={{
              padding: 10, borderBottomWidth: 1, borderBottomColor: '#eee',
              backgroundColor: selectedCustomer?.id === c.id ? '#e3f2fd' : 'transparent',
            }}
          >
            <Text style={{ fontWeight: '500' }}>{c.name}</Text>
            <Text style={{ color: '#666', fontSize: 12 }}>Debt: {c.totalDebt.toFixed(2)}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {selectedCustomer && (
        <View style={{ backgroundColor: '#fff', borderRadius: 12, padding: 16, elevation: 2, marginTop: 16 }}>
          <Text style={{ fontSize: 18, fontWeight: '600', marginBottom: 12 }}>Step 2: Add Products</Text>
          <TextInput
            placeholder="Search products..."
            value={productSearch}
            onChangeText={setProductSearch}
            style={{ backgroundColor: '#f5f5f5', borderRadius: 8, padding: 12, fontSize: 16, marginBottom: 8 }}
          />

          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
            {filteredProducts.map((p) => (
              <TouchableOpacity
                key={p.id}
                onPress={() => addProduct(p)}
                style={{ backgroundColor: '#e8eaf6', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16 }}
              >
                <Text style={{ fontSize: 13 }}>{p.name} ({p.stockQuantity})</Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={{ fontWeight: '500', marginBottom: 8 }}>Selected Items:</Text>
          {selectedItems.map((item) => (
            <View key={item.product.id} style={{ flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 6 }}>
              <Text style={{ flex: 1 }}>{item.product.name}</Text>
              <Text>{Number(item.product.price).toFixed(2)} ×</Text>
              <TextInput
                value={String(item.quantity)}
                onChangeText={(v) => updateQty(item.product.id, parseInt(v, 10) || 1)}
                keyboardType="number-pad"
                style={{ width: 50, textAlign: 'center', borderWidth: 1, borderColor: '#ccc', borderRadius: 4, padding: 4 }}
              />
              <Text style={{ fontWeight: '500', minWidth: 70, textAlign: 'right' }}>
                {(Number(item.product.price) * item.quantity).toFixed(2)}
              </Text>
              <TouchableOpacity onPress={() => removeItem(item.product.id)}>
                <Text style={{ color: '#f44336' }}>✕</Text>
              </TouchableOpacity>
            </View>
          ))}

          <Text style={{ textAlign: 'right', fontSize: 16, fontWeight: '600', marginTop: 12 }}>
            Total: {totalAmount.toFixed(2)}
          </Text>
        </View>
      )}

      {selectedCustomer && (
        <View style={{ backgroundColor: '#fff', borderRadius: 12, padding: 16, elevation: 2, marginTop: 16 }}>
          <Text style={{ fontSize: 18, fontWeight: '600', marginBottom: 12 }}>Step 3: Confirm</Text>
          <TextInput
            placeholder="Note (optional)"
            value={note}
            onChangeText={setNote}
            multiline
            style={{ backgroundColor: '#f5f5f5', borderRadius: 8, padding: 12, fontSize: 16, marginBottom: 16, minHeight: 60 }}
          />
          <TouchableOpacity
            onPress={handleSubmit}
            disabled={!selectedItems.length || createSale.isPending}
            style={{
              backgroundColor: selectedItems.length ? '#3f51b5' : '#ccc',
              padding: 14, borderRadius: 8, alignItems: 'center',
            }}
          >
            <Text style={{ color: '#fff', fontWeight: '600', fontSize: 16 }}>
              {createSale.isPending ? 'Creating...' : `Confirm Sale — ${totalAmount.toFixed(2)}`}
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </ScrollView>
  );
}
