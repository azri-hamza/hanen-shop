import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { CustomerListScreen } from '../../screens/Customers/CustomerListScreen';
import { CustomerDetailScreen } from '../../screens/Customers/CustomerDetailScreen';
import { CustomerFormScreen } from '../../screens/Customers/CustomerFormScreen';

export type CustomersStackParamList = {
  CustomerList: undefined;
  CustomerDetail: { id: string };
  CustomerForm: undefined;
};

const Stack = createStackNavigator<CustomersStackParamList>();

export function CustomersStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="CustomerList" component={CustomerListScreen} options={{ title: 'Customers' }} />
      <Stack.Screen name="CustomerDetail" component={CustomerDetailScreen} options={{ title: 'Customer' }} />
      <Stack.Screen name="CustomerForm" component={CustomerFormScreen} options={{ title: 'New Customer' }} />
    </Stack.Navigator>
  );
}
