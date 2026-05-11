import React from 'react';
import { View, Text } from 'react-native';
import { useNetInfo } from '@react-native-community/netinfo';

export function NetworkBanner() {
  const netInfo = useNetInfo();
  const isOffline = netInfo.isConnected === false;

  if (!isOffline) return null;

  return (
    <View style={{ backgroundColor: '#f44336', padding: 8, alignItems: 'center' }}>
      <Text style={{ color: '#fff', fontSize: 13, fontWeight: '500' }}>
        No internet connection
      </Text>
    </View>
  );
}
