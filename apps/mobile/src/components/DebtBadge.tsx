import React from 'react';
import { View, Text } from 'react-native';

interface Props {
  value: number;
}

export function DebtBadge({ value }: Props) {
  const color = value === 0 ? '#4caf50' : value < 1000 ? '#ff9800' : '#f44336';
  const bg = value === 0 ? '#e8f5e9' : value < 1000 ? '#fff3e0' : '#ffebee';

  return (
    <View style={{ backgroundColor: bg, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 }}>
      <Text style={{ color, fontWeight: '600', fontSize: 13 }}>{value.toFixed(2)}</Text>
    </View>
  );
}
