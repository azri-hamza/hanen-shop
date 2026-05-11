import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import * as Haptics from 'expo-haptics';
import { ICustomer } from '@hanen-shop/shared-types';
import { api } from '../../services/api.service';
import { useCreatePayment } from '../../hooks/useTransactions';
import type { TransactionsStackParamList } from '../../navigation/stacks/TransactionsStack';

export function NewPaymentScreen() {
  const route = useRoute<RouteProp<TransactionsStackParamList, 'NewPayment'>>();
  const navigation = useNavigation();
  const createPayment = useCreatePayment();

  const [customers, setCustomers] = useState<ICustomer[]>([]);
  const [customerSearch, setCustomerSearch] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<ICustomer | null>(null);
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');

  useEffect(() => {
    api.customers.getAll().then(setCustomers).catch(() => {});

    const prefillId = route.params?.customerId;
    if (prefillId) {
      api.customers.getOne(prefillId).then(setSelectedCustomer).catch(() => {});
    }
  }, [route.params?.customerId]);

  const filteredCustomers = customers.filter((c) =>
    c.name.toLowerCase().includes(customerSearch.toLowerCase()),
  );

  const numericAmount = parseFloat(amount) || 0;
  const maxAmount = selectedCustomer?.totalDebt ?? 0;
  const amountExceeds = numericAmount > maxAmount;

  const debtColor = !maxAmount ? '#4caf50' : maxAmount < 1000 ? '#ff9800' : '#f44336';

  const handleSubmit = async () => {
    if (!selectedCustomer || !numericAmount || numericAmount <= 0 || amountExceeds) return;

    try {
      await createPayment.mutateAsync({
        customerId: selectedCustomer.id,
        amount: numericAmount,
        note: note || undefined,
      });
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert('Success', 'Payment recorded', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert('Error', 'Failed to record payment');
    }
  };

  if (!customers.length) {
    return <ActivityIndicator style={{ flex: 1, justifyContent: 'center' }} />;
  }

  return (
    <ScrollView style={{ flex: 1, backgroundColor: '#f5f5f5' }} contentContainerStyle={{ padding: 16 }}>
      <View style={{ backgroundColor: '#fff', borderRadius: 12, padding: 16, elevation: 2 }}>
        <Text style={{ fontSize: 14, color: '#666', marginBottom: 4 }}>Search customer</Text>
        <TextInput
          placeholder="Customer name..."
          value={customerSearch}
          onChangeText={setCustomerSearch}
          style={{ backgroundColor: '#f5f5f5', borderRadius: 8, padding: 12, fontSize: 16, marginBottom: 8 }}
        />

        {filteredCustomers.map((c) => (
          <TouchableOpacity
            key={c.id}
            onPress={() => setSelectedCustomer(c)}
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
          <View style={{ alignItems: 'center', marginBottom: 16 }}>
            <Text style={{ fontSize: 18, fontWeight: '600' }}>{selectedCustomer.name}</Text>
            <Text style={{ fontSize: 32, fontWeight: '700', color: debtColor, marginTop: 8 }}>
              {maxAmount.toFixed(2)}
            </Text>
            <Text style={{ color: '#666' }}>Current Balance</Text>
          </View>

          <Text style={{ fontSize: 14, color: '#666', marginBottom: 4 }}>Amount</Text>
          <TextInput
            placeholder="0.00"
            value={amount}
            onChangeText={setAmount}
            keyboardType="decimal-pad"
            style={{
              backgroundColor: '#f5f5f5', borderRadius: 8, padding: 12, fontSize: 20,
              textAlign: 'center', marginBottom: amountExceeds ? 4 : 16,
            }}
          />
          {amountExceeds && (
            <Text style={{ color: '#f44336', fontSize: 12, marginBottom: 12 }}>
              Amount cannot exceed current balance
            </Text>
          )}

          <Text style={{ fontSize: 14, color: '#666', marginBottom: 4 }}>Note (optional)</Text>
          <TextInput
            placeholder="Payment note"
            value={note}
            onChangeText={setNote}
            style={{ backgroundColor: '#f5f5f5', borderRadius: 8, padding: 12, fontSize: 16, marginBottom: 16 }}
          />

          <TouchableOpacity
            onPress={handleSubmit}
            disabled={!numericAmount || numericAmount <= 0 || amountExceeds || createPayment.isPending}
            style={{
              backgroundColor: !numericAmount || amountExceeds ? '#ccc' : '#3f51b5',
              padding: 14, borderRadius: 8, alignItems: 'center',
            }}
          >
            <Text style={{ color: '#fff', fontWeight: '600', fontSize: 16 }}>
              {createPayment.isPending ? 'Processing...' : 'Record Payment'}
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </ScrollView>
  );
}
