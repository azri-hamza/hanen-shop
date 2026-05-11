import React from 'react';
import { View, Text } from 'react-native';

interface Props {
  quantity: number;
}

export function StockIndicator({ quantity }: Props) {
  const color = quantity === 0 ? '#f44336' : quantity <= 5 ? '#ff9800' : '#4caf50';
  const bg = quantity === 0 ? '#ffebee' : quantity <= 5 ? '#fff3e0' : '#e8f5e9';

  return (
    <View style={{ backgroundColor: bg, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 }}>
      <Text style={{ color, fontWeight: '700', fontSize: 14 }}>{quantity}</Text>
    </View>
  );
}
