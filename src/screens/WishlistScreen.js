import React, { useEffect, useState } from 'react';
import { View, FlatList, Button } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getWishlist } from '../services/api';
import ItemCard from '../components/ItemCard';

export default function WishlistScreen({ navigation }) {
  const [items, setItems] = useState([]);

  useEffect(() => {
    // For now, just load from local storage
    loadItemsLocal();
  }, []);

  const loadItemsLocal = async () => {
    const localData = await AsyncStorage.getItem('wishlist');
    setItems(localData ? JSON.parse(localData) : []);
  };

  return (
    <View style={{ flex: 1, padding: 10 }}>
      <Button title="Add Item" onPress={() => navigation.navigate('Add Item')} />
      <FlatList
        data={items}
        keyExtractor={(item) => item.itemId}
        renderItem={({ item }) => <ItemCard item={item} />}
      />
    </View>
  );
}
