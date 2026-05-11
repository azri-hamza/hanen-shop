import React, { useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, RefreshControl } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../services/api.service';
import { StockIndicator } from '../../components/StockIndicator';
import { DebtBadge } from '../../components/DebtBadge';
import { EmptyState } from '../../components/EmptyState';

export function DashboardScreen() {
  const navigation = useNavigation<any>();
  const { data, isLoading, isError, refetch, isRefetching } = useQuery({
    queryKey: ['dashboard', 'summary'],
    queryFn: () => api.dashboard.getSummary(),
  });

  const onRefresh = useCallback(() => refetch(), [refetch]);

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (isError) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 16 }}>
        <Text style={{ color: '#f44336', marginBottom: 12 }}>Failed to load dashboard</Text>
        <TouchableOpacity onPress={onRefresh} style={{ backgroundColor: '#3f51b5', padding: 10, borderRadius: 8 }}>
          <Text style={{ color: '#fff', fontWeight: '600' }}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: '#f5f5f5' }}
      contentContainerStyle={{ padding: 16 }}
      refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={onRefresh} />}
    >
      <Text style={{ fontSize: 24, fontWeight: '600', marginBottom: 16 }}>Dashboard</Text>

      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 24 }}>
        {[
          { label: 'Low Stock', value: data?.lowStockProducts.length ?? 0, color: '#f44336' },
          { label: 'Top Debtors', value: data?.topDebtors.length ?? 0, color: '#ff9800' },
          { label: 'Revenue', value: (data?.todayRevenue ?? 0).toFixed(2), color: '#4caf50' },
          { label: 'Payments', value: (data?.todayPayments ?? 0).toFixed(2), color: '#2196f3' },
        ].map((card) => (
          <View key={card.label} style={{ flex: 1, minWidth: 140, backgroundColor: '#fff', borderRadius: 12, padding: 16, elevation: 2 }}>
            <Text style={{ fontSize: 28, fontWeight: '700', color: card.color }}>{card.value}</Text>
            <Text style={{ color: '#666', marginTop: 4 }}>{card.label}</Text>
          </View>
        ))}
      </View>

      <Text style={{ fontSize: 18, fontWeight: '600', marginBottom: 8 }}>Low Stock Products</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 24 }}>
        <View style={{ flexDirection: 'row', gap: 12 }}>
          {data?.lowStockProducts.length ? (
            data.lowStockProducts.map((p) => (
              <View key={p.id} style={{ backgroundColor: '#fff', borderRadius: 8, padding: 12, minWidth: 140, elevation: 1 }}>
                <Text style={{ fontWeight: '500' }}>{p.name}</Text>
                <StockIndicator quantity={p.stockQuantity} />
              </View>
            ))
          ) : (
            <Text style={{ color: '#999' }}>All products well stocked</Text>
          )}
        </View>
      </ScrollView>

      <Text style={{ fontSize: 18, fontWeight: '600', marginBottom: 8 }}>Top Debtors</Text>
      {data?.topDebtors.length ? (
        data.topDebtors.map((c) => (
          <TouchableOpacity
            key={c.id}
            onPress={() => navigation.navigate('CustomersTab', { screen: 'CustomerDetail', params: { id: c.id } })}
            style={{ backgroundColor: '#fff', borderRadius: 8, padding: 12, marginBottom: 8, elevation: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}
          >
            <Text style={{ fontWeight: '500' }}>{c.name}</Text>
            <DebtBadge value={c.totalDebt} />
          </TouchableOpacity>
        ))
      ) : (
        <EmptyState message="No debtors" />
      )}
    </ScrollView>
  );
}
