import React, { useEffect, useState } from 'react';
import { View, FlatList, Button, ActivityIndicator, Text } from 'react-native';
import { getWishlist } from '../services/api';
import ItemCard from '../components/ItemCard';

export default function WishlistScreen({ navigation }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', loadItems);
    loadItems();

    return unsubscribe;
  }, [navigation]);

  const loadItems = async () => {
    setLoading(true);
    const wishlistItems = await getWishlist();
    setItems(wishlistItems);
    setLoading(false);
  };

  return (
    <View style={{ flex: 1, padding: 10 }}>
      <Button title="Add Item" onPress={() => navigation.navigate('Add Item')} />
      {loading ? <ActivityIndicator style={{ marginTop: 20 }} /> : null}
      {!loading && items.length === 0 ? (
        <Text style={{ marginTop: 20 }}>No wishlist items yet.</Text>
      ) : null}
      <FlatList
        data={items}
        keyExtractor={(item) => item.itemId}
        renderItem={({ item }) => <ItemCard item={item} />}
      />
    </View>
  );
}
