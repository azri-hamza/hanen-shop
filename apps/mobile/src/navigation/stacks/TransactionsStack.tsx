import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { NewSaleScreen } from '../../screens/Transactions/NewSaleScreen';
import { NewPaymentScreen } from '../../screens/Transactions/NewPaymentScreen';

export type TransactionsStackParamList = {
  NewSale: { customerId?: string } | undefined;
  NewPayment: { customerId?: string } | undefined;
};

const Stack = createStackNavigator<TransactionsStackParamList>();

export function TransactionsStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="NewSale" component={NewSaleScreen} options={{ title: 'New Sale' }} />
      <Stack.Screen name="NewPayment" component={NewPaymentScreen} options={{ title: 'New Payment' }} />
    </Stack.Navigator>
  );
}
