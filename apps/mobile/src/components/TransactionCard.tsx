import React, { useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { ITransaction, ITransactionItem, TransactionType } from '@hanen-shop/shared-types';

interface Props {
  transaction: ITransaction & { items?: ITransactionItem[]; runningBalance?: number };
}

export function TransactionCard({ transaction }: Props) {
  const [expanded, setExpanded] = useState(false);
  const isSale = transaction.type === TransactionType.SALE;

  return (
    <View style={{ backgroundColor: '#fff', borderRadius: 8, padding: 12, marginBottom: 8, elevation: 1 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
        <Text style={{ color: '#666', fontSize: 12, minWidth: 70 }}>
          {new Date(transaction.createdAt).toLocaleDateString()}
        </Text>
        <View
          style={{
            backgroundColor: isSale ? '#e3f2fd' : '#fce4ec',
            paddingHorizontal: 8,
            paddingVertical: 2,
            borderRadius: 4,
            minWidth: 50,
            alignItems: 'center',
          }}
        >
          <Text style={{ fontSize: 11, fontWeight: '600', color: isSale ? '#1565c0' : '#c62828' }}>
            {transaction.type}
          </Text>
        </View>
        <Text style={{ flex: 1, fontWeight: '500' }}>{Number(transaction.amount).toFixed(2)}</Text>
        {transaction.note ? (
          <Text style={{ color: '#666', flex: 1 }} numberOfLines={1}>{transaction.note}</Text>
        ) : null}
        {transaction.runningBalance != null && (
          <Text style={{ fontWeight: '500', color: '#1565c0' }}>
            {transaction.runningBalance.toFixed(2)}
          </Text>
        )}
        {isSale && transaction.items?.length ? (
          <TouchableOpacity onPress={() => setExpanded(!expanded)}>
            <Text style={{ color: '#1565c0' }}>{expanded ? '▲' : '▼'}</Text>
          </TouchableOpacity>
        ) : null}
      </View>
      {isSale && expanded && transaction.items?.length ? (
        <View style={{ marginTop: 8, marginLeft: 94, padding: 8, backgroundColor: '#f5f5f5', borderRadius: 8 }}>
          {transaction.items.map((item) => (
            <View key={item.id} style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 2 }}>
              <Text>{item.productId}</Text>
              <Text>{item.quantity} × {Number(item.unitPrice).toFixed(2)}</Text>
            </View>
          ))}
        </View>
      ) : null}
    </View>
  );
}
