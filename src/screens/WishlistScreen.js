import React, { useEffect, useState } from 'react';
import { View, FlatList, Button, ActivityIndicator, Text, Alert } from 'react-native';
import { deleteItem, getWishlist, refreshItem } from '../services/api';
import ItemCard from '../components/ItemCard';

export default function WishlistScreen({ navigation }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingItemId, setDeletingItemId] = useState(null);
  const [refreshingItemId, setRefreshingItemId] = useState(null);

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

  const handleDelete = (item) => {
    Alert.alert(
      'Remove Item',
      `Remove "${item.name}" from your wishlist?`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            try {
              setDeletingItemId(item.itemId);
              await deleteItem(item.itemId);
              setItems((currentItems) =>
                currentItems.filter((currentItem) => currentItem.itemId !== item.itemId),
              );
            } catch (err) {
              Alert.alert('Error', err.message || 'Failed to remove item');
            } finally {
              setDeletingItemId(null);
            }
          },
        },
      ],
    );
  };

  const handleRefresh = async (item) => {
    try {
      setRefreshingItemId(item.itemId);
      const refreshedItem = await refreshItem(item.itemId);
      setItems((currentItems) =>
        currentItems.map((currentItem) =>
          currentItem.itemId === item.itemId ? refreshedItem : currentItem,
        ),
      );
    } catch (err) {
      Alert.alert('Error', err.message || 'Failed to refresh item');
    } finally {
      setRefreshingItemId(null);
    }
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
        renderItem={({ item }) => (
          <ItemCard
            item={item}
            refreshing={refreshingItemId === item.itemId}
            deleting={deletingItemId === item.itemId}
            onRefresh={() => handleRefresh(item)}
            onDelete={() => handleDelete(item)}
          />
        )}
      />
    </View>
  );
}
