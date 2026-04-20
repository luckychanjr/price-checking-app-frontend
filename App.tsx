import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import AddItemScreen from './src/screens/AddItemScreen';
import WishlistScreen from './src/screens/WishlistScreen';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name="Wishlist" component={WishlistScreen} />
        <Stack.Screen name="Add Item" component={AddItemScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
