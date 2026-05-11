import React, { useState, useCallback } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, RefreshControl } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { FlashList } from '@shopify/flash-list';
import { useCustomers } from '../../hooks/useCustomers';
import { DebtBadge } from '../../components/DebtBadge';
import { EmptyState } from '../../components/EmptyState';

export function CustomerListScreen() {
  const navigation = useNavigation<any>();
  const [search, setSearch] = useState('');
  const { data: customers, isLoading, isError, refetch, isRefetching } = useCustomers(search || undefined);

  const onRefresh = useCallback(() => refetch(), [refetch]);

  const sorted = [...(customers ?? [])].sort((a, b) => b.totalDebt - a.totalDebt);

  if (isLoading) {
    return (
      <View style={{ flex: 1, backgroundColor: '#f5f5f5', justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (isError) {
    return (
      <View style={{ flex: 1, backgroundColor: '#f5f5f5', justifyContent: 'center', alignItems: 'center', padding: 16 }}>
        <Text style={{ color: '#f44336', marginBottom: 12 }}>Failed to load customers</Text>
        <TouchableOpacity onPress={onRefresh} style={{ backgroundColor: '#3f51b5', padding: 10, borderRadius: 8 }}>
          <Text style={{ color: '#fff', fontWeight: '600' }}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#f5f5f5' }}>
      <View style={{ padding: 16 }}>
        <TextInput
          placeholder="Search customers..."
          value={search}
          onChangeText={setSearch}
          style={{ backgroundColor: '#fff', borderRadius: 8, padding: 12, fontSize: 16, elevation: 1 }}
        />
      </View>

      <FlashList
        data={sorted}
        keyExtractor={(item) => item.id}
        estimatedItemSize={70}
        refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={onRefresh} />}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => navigation.navigate('CustomerDetail', { id: item.id })}
            style={{
              backgroundColor: '#fff', marginHorizontal: 16, marginBottom: 8,
              borderRadius: 8, padding: 12, elevation: 1,
              flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
            }}
          >
            <View>
              <Text style={{ fontWeight: '500', fontSize: 16 }}>{item.name}</Text>
              <Text style={{ color: '#666', marginTop: 2 }}>{item.phone || '—'}</Text>
            </View>
            <DebtBadge value={item.totalDebt} />
          </TouchableOpacity>
        )}
        ListEmptyComponent={<EmptyState message="No customers found" />}
      />

      <TouchableOpacity
        onPress={() => navigation.navigate('CustomerForm')}
        style={{
          position: 'absolute', bottom: 24, right: 24,
          backgroundColor: '#3f51b5', width: 56, height: 56, borderRadius: 28,
          justifyContent: 'center', alignItems: 'center', elevation: 6,
        }}
      >
        <Text style={{ color: '#fff', fontSize: 28 }}>+</Text>
      </TouchableOpacity>
    </View>
  );
}
