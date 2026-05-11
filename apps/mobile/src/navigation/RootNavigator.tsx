import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { DashboardScreen } from '../screens/Dashboard/DashboardScreen';
import { ProductsStack } from './stacks/ProductsStack';
import { CustomersStack } from './stacks/CustomersStack';
import { TransactionsStack } from './stacks/TransactionsStack';

export type RootTabParamList = {
  DashboardTab: undefined;
  ProductsTab: undefined;
  CustomersTab: undefined;
  TransactionsTab: { screen?: string; params?: Record<string, any> } | undefined;
};

const Tab = createBottomTabNavigator<RootTabParamList>();

export function RootNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ color, size }) => {
          let iconName: keyof typeof MaterialCommunityIcons.glyphMap = 'home';
          if (route.name === 'DashboardTab') iconName = 'home';
          else if (route.name === 'ProductsTab') iconName = 'package';
          else if (route.name === 'CustomersTab') iconName = 'account-group';
          else if (route.name === 'TransactionsTab') iconName = 'plus-circle';
          return <MaterialCommunityIcons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#3f51b5',
        tabBarInactiveTintColor: '#999',
      })}
    >
      <Tab.Screen name="DashboardTab" component={DashboardScreen} options={{ tabBarLabel: 'Dashboard' }} />
      <Tab.Screen name="ProductsTab" component={ProductsStack} options={{ tabBarLabel: 'Products' }} />
      <Tab.Screen name="CustomersTab" component={CustomersStack} options={{ tabBarLabel: 'Customers' }} />
      <Tab.Screen
        name="TransactionsTab"
        component={TransactionsStack}
        options={{
          tabBarLabel: 'New Sale',
          tabBarStyle: { borderTopWidth: 0 },
        }}
      />
    </Tab.Navigator>
  );
}

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootTabParamList {}
  }
}
