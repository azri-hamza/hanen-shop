import React from 'react';
import { View, Text } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

interface Props {
  icon?: keyof typeof MaterialCommunityIcons.glyphMap;
  message: string;
}

export function EmptyState({ icon = 'inbox-outline', message }: Props) {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 48 }}>
      <MaterialCommunityIcons name={icon} size={48} color="#ccc" />
      <Text style={{ marginTop: 16, fontSize: 16, color: '#999', textAlign: 'center' }}>{message}</Text>
    </View>
  );
}
