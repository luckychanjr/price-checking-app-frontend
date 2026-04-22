import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import ProductDetailsScreen from './src/screens/ProductDetailsScreen';
import WishlistScreen from './src/screens/WishlistScreen';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name="Wishlist" component={WishlistScreen} />
        <Stack.Screen
          name="Product Details"
          component={ProductDetailsScreen}
          options={{ title: 'Retailer Comparison' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
