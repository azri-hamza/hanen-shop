import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { ProductListScreen } from '../../screens/Products/ProductListScreen';
import { ProductFormScreen } from '../../screens/Products/ProductFormScreen';

export type ProductsStackParamList = {
  ProductList: undefined;
  ProductForm: { id?: string } | undefined;
};

const Stack = createStackNavigator<ProductsStackParamList>();

export function ProductsStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="ProductList" component={ProductListScreen} options={{ title: 'Products' }} />
      <Stack.Screen name="ProductForm" component={ProductFormScreen} options={{ title: 'Product' }} />
    </Stack.Navigator>
  );
}
