import React, { useMemo, useState } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, ScrollView } from 'react-native';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { FlashList } from '@shopify/flash-list';
import { TransactionType } from '@hanen-shop/shared-types';
import { useCustomer, useCustomerLedger } from '../../hooks/useCustomers';
import { TransactionCard } from '../../components/TransactionCard';
import { EmptyState } from '../../components/EmptyState';
import type { CustomersStackParamList } from '../../navigation/stacks/CustomersStack';

export function CustomerDetailScreen() {
  const route = useRoute<RouteProp<CustomersStackParamList, 'CustomerDetail'>>();
  const navigation = useNavigation<any>();
  const { id } = route.params;

  const { data: customer, isLoading: loadingCustomer } = useCustomer(id);
  const { data: ledger, isLoading: loadingLedger } = useCustomerLedger(id);

  const ledgerWithBalance = useMemo(() => {
    if (!ledger) return [];
    const chronological = [...ledger].reverse();
    let balance = 0;
    return chronological
      .map((tx) => ({
        ...tx,
        runningBalance: (balance += tx.type === TransactionType.SALE ? Number(tx.amount) : -Number(tx.amount)),
      }))
      .reverse();
  }, [ledger]);

  const debtColor = !customer?.totalDebt
    ? '#4caf50'
    : customer.totalDebt < 1000
      ? '#ff9800'
      : '#f44336';

  if (loadingCustomer) {
    return <ActivityIndicator style={{ flex: 1, justifyContent: 'center' }} />;
  }

  if (!customer) return <EmptyState message="Customer not found" />;

  return (
    <ScrollView style={{ flex: 1, backgroundColor: '#f5f5f5' }} contentContainerStyle={{ padding: 16 }}>
      <View style={{ backgroundColor: '#fff', borderRadius: 12, padding: 16, elevation: 2, marginBottom: 16 }}>
        <Text style={{ fontSize: 20, fontWeight: '600' }}>{customer.name}</Text>
        <Text style={{ color: '#666', marginTop: 4 }}>{customer.phone || 'No phone'}</Text>
        <Text style={{ fontSize: 32, fontWeight: '700', color: debtColor, marginTop: 12 }}>
          {customer.totalDebt.toFixed(2)}
        </Text>

        <View style={{ flexDirection: 'row', gap: 12, marginTop: 16 }}>
          <TouchableOpacity
            onPress={() => navigation.navigate('TransactionsTab', { screen: 'NewSale', params: { customerId: customer.id } })}
            style={{ flex: 1, backgroundColor: '#3f51b5', padding: 12, borderRadius: 8, alignItems: 'center' }}
          >
            <Text style={{ color: '#fff', fontWeight: '600' }}>New Sale</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => navigation.navigate('TransactionsTab', { screen: 'NewPayment', params: { customerId: customer.id } })}
            style={{ flex: 1, backgroundColor: '#ff9800', padding: 12, borderRadius: 8, alignItems: 'center' }}
          >
            <Text style={{ color: '#fff', fontWeight: '600' }}>New Payment</Text>
          </TouchableOpacity>
        </View>
      </View>

      <Text style={{ fontSize: 18, fontWeight: '600', marginBottom: 8 }}>Transactions</Text>
      {loadingLedger ? (
        <ActivityIndicator />
      ) : ledgerWithBalance.length ? (
        <FlashList
          data={ledgerWithBalance}
          keyExtractor={(item: any) => item.id}
          estimatedItemSize={80}
          scrollEnabled={false}
          renderItem={({ item }) => <TransactionCard transaction={item} />}
        />
      ) : (
        <EmptyState message="No transactions yet" />
      )}
    </ScrollView>
  );
}
