import React from 'react';
import { View, Text, Button, Image, Pressable, StyleSheet } from 'react-native';

export default function ItemCard({
  item,
  onAdd,
  onRefresh,
  onDelete,
  onPress,
  adding = false,
  refreshing = false,
  deleting = false,
}) {
  return (
    <View style={styles.card}>
      <Pressable
        onPress={onPress}
        disabled={!onPress}
        style={({ pressed }) => [
          styles.headerPressable,
          pressed && onPress ? styles.headerPressableActive : null,
        ]}
      >
        <View style={styles.headerRow}>
          <View style={styles.imageWrapper}>
            {item.image ? (
              <Image source={{ uri: item.image }} style={styles.image} resizeMode="contain" />
            ) : (
              <View style={styles.imagePlaceholder}>
                <Text style={styles.placeholderText}>No Image</Text>
              </View>
            )}
          </View>
          <View style={styles.content}>
            <Text style={styles.name}>{item.name}</Text>
            <Text style={styles.meta}>Best Price: ${item.lowestPrice.toFixed(2)}</Text>
            <Text style={styles.meta}>Retailer: {item.cheapestRetailer}</Text>
            <Text style={styles.meta}>Updated: {item.lastUpdated}</Text>
            {onPress ? <Text style={styles.detailHint}>Tap to compare retailer offers</Text> : null}
            {refreshing ? (
              <Text style={styles.refreshStatus}>Fetching new price...</Text>
            ) : null}
          </View>
        </View>
      </Pressable>
      <View style={styles.actions}>
        {onAdd ? (
          <View style={styles.actionButtonSingle}>
            <Button title={adding ? 'Adding...' : 'Add Item'} onPress={onAdd} disabled={adding} />
          </View>
        ) : (
          <>
            <View style={styles.actionButton}>
              <Button
                title={refreshing ? 'Fetching Price...' : 'Refresh'}
                onPress={onRefresh}
                disabled={refreshing || deleting}
              />
            </View>
            <View style={styles.actionButton}>
              <Button
                title={deleting ? 'Removing...' : 'Remove'}
                onPress={onDelete}
                disabled={refreshing || deleting}
              />
            </View>
          </>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 12,
    marginVertical: 8,
    backgroundColor: '#ffffff',
  },
  headerPressable: {
    padding: 12,
    borderRadius: 12,
  },
  headerPressableActive: {
    backgroundColor: '#f8fafc',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  imageWrapper: {
    width: 92,
    height: 92,
    marginRight: 12,
  },
  image: {
    width: '100%',
    height: '100%',
    borderRadius: 10,
    backgroundColor: '#f3f4f6',
  },
  imagePlaceholder: {
    width: '100%',
    height: '100%',
    borderRadius: 10,
    backgroundColor: '#e5e7eb',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
  },
  placeholderText: {
    fontSize: 12,
    color: '#6b7280',
    textAlign: 'center',
  },
  content: {
    flex: 1,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 6,
    color: '#111827',
  },
  meta: {
    fontSize: 13,
    color: '#4b5563',
    marginBottom: 4,
  },
  refreshStatus: {
    fontSize: 13,
    fontWeight: '600',
    color: '#2563eb',
    marginTop: 4,
  },
  detailHint: {
    fontSize: 13,
    fontWeight: '600',
    color: '#0f766e',
    marginTop: 4,
  },
  actions: {
    flexDirection: 'row',
    marginTop: 12,
    paddingHorizontal: 12,
    paddingBottom: 12,
  },
  actionButton: {
    flex: 1,
    marginRight: 8,
  },
  actionButtonSingle: {
    flex: 1,
  },
});
