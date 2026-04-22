import React, { useEffect, useState } from 'react';
import {
  View,
  FlatList,
  Button,
  ActivityIndicator,
  Text,
  Alert,
  TextInput,
  Pressable,
  StyleSheet,
} from 'react-native';
import { addItem, deleteItem, getWishlist, refreshItem, searchItems } from '../services/api';
import ItemCard from '../components/ItemCard';

export default function WishlistScreen({ navigation }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingItemId, setDeletingItemId] = useState(null);
  const [refreshingItemId, setRefreshingItemId] = useState(null);
  const [addingResultKey, setAddingResultKey] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [input, setInput] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searched, setSearched] = useState(false);
  const [activeSection, setActiveSection] = useState('wishlist');

  useEffect(() => {
    loadItems();
  }, []);

  const loadItems = async () => {
    setLoading(true);
    const wishlistItems = await getWishlist();
    setItems(wishlistItems);
    setLoading(false);
  };

  const handleSearch = async () => {
    const trimmedInput = input.trim();

    if (!trimmedInput) {
      Alert.alert('Missing Input', 'Please enter a product query or paste a product URL.');
      return;
    }

    try {
      setSubmitting(true);
      const results = await searchItems(trimmedInput);
      setSearchResults(results);
      setSearched(true);
    } catch (err) {
      Alert.alert('Error', err.message || 'Failed to search for items');
    } finally {
      setSubmitting(false);
    }
  };

  const handleAddSearchResult = async (result) => {
    try {
      setAddingResultKey(result.itemId);
      const newItem = await addItem(result);
      setItems((currentItems) => [
        newItem,
        ...currentItems.filter((currentItem) => currentItem.itemId !== newItem.itemId),
      ]);
      setInput('');
      setSearchResults([]);
      setSearched(false);
      setActiveSection('wishlist');
      Alert.alert('Success', 'Item added to your wishlist.');
    } catch (err) {
      Alert.alert('Error', err.message || 'Failed to add item');
    } finally {
      setAddingResultKey(null);
    }
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
      const refreshedItem = await refreshItem(item);
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

  const openProductDetails = (item) => {
    navigation.navigate('Product Details', { item });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Wishlist Price Comparison</Text>
      <View style={styles.sectionBar}>
        <Pressable
          style={[
            styles.sectionButton,
            activeSection === 'add' ? styles.sectionButtonActive : null,
          ]}
          onPress={() => setActiveSection('add')}
        >
          <Text
            style={[
              styles.sectionButtonText,
              activeSection === 'add' ? styles.sectionButtonTextActive : null,
            ]}
          >
            Add Item
          </Text>
        </Pressable>
        <Pressable
          style={[
            styles.sectionButton,
            activeSection === 'wishlist' ? styles.sectionButtonActive : null,
          ]}
          onPress={() => {
            setActiveSection('wishlist');
            loadItems();
          }}
        >
          <Text
            style={[
              styles.sectionButtonText,
              activeSection === 'wishlist' ? styles.sectionButtonTextActive : null,
            ]}
          >
            Wishlist
          </Text>
        </Pressable>
      </View>

      {activeSection === 'add' ? (
        <View style={styles.panel}>
          <Text style={styles.panelTitle}>Add a product</Text>
          <TextInput
            placeholder='Paste a URL or type a query like "ipad pro"'
            value={input}
            onChangeText={setInput}
            autoCapitalize="none"
            autoCorrect={false}
            style={styles.input}
          />
          <Button
            title={submitting ? 'Searching...' : 'Search'}
            onPress={handleSearch}
            disabled={submitting}
          />
          {searched && searchResults.length === 0 ? (
            <Text style={styles.emptyText}>No matching products found.</Text>
          ) : null}
          <FlatList
            data={searchResults}
            keyExtractor={(item, index) => `${item.itemId}-${index}`}
            renderItem={({ item }) => (
              <ItemCard
                item={item}
                adding={addingResultKey === item.itemId}
                onPress={() => openProductDetails(item)}
                onAdd={() => handleAddSearchResult(item)}
              />
            )}
          />
        </View>
      ) : (
        <View style={styles.panel}>
          {loading ? <ActivityIndicator style={styles.statusSpacing} /> : null}
          {!loading && items.length === 0 ? (
            <Text style={styles.emptyText}>No wishlist items yet.</Text>
          ) : null}
          <FlatList
            data={items}
            keyExtractor={(item) => item.itemId}
            renderItem={({ item }) => (
              <ItemCard
                item={item}
                refreshing={refreshingItemId === item.itemId}
                deleting={deletingItemId === item.itemId}
                onPress={() => openProductDetails(item)}
                onRefresh={() => handleRefresh(item)}
                onDelete={() => handleDelete(item)}
              />
            )}
          />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f8fafc',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 16,
  },
  sectionBar: {
    flexDirection: 'row',
    backgroundColor: '#e5e7eb',
    borderRadius: 14,
    padding: 4,
    marginBottom: 16,
  },
  sectionButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  sectionButtonActive: {
    backgroundColor: '#2563eb',
  },
  sectionButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#374151',
  },
  sectionButtonTextActive: {
    color: '#ffffff',
  },
  panel: {
    flex: 1,
  },
  panelTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 10,
    padding: 12,
    marginBottom: 12,
    backgroundColor: '#ffffff',
  },
  statusSpacing: {
    marginTop: 20,
  },
  emptyText: {
    marginTop: 20,
    color: '#6b7280',
  },
});
