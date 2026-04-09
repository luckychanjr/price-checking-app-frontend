import React, { useEffect, useState } from 'react';
import { View, FlatList, Button } from 'react-native';
import { getWishlist } from '../services/api';
import ItemCard from '../components/ItemCard';

export default function WishlistScreen({ navigation }) {
  const [items, setItems] = useState([]);

  useEffect(() => {
    loadItems();
  }, []);

  const loadItems = async () => {
    const data = await getWishlist();
    setItems(data);
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
