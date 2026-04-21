import React from 'react';
import { View, Text, Button } from 'react-native';

export default function ItemCard({
  item,
  onRefresh,
  onDelete,
  refreshing = false,
  deleting = false,
}) {
  return (
    <View style={{
      borderWidth: 1,
      padding: 10,
      marginVertical: 5
    }}>
      <Text>{item.name}</Text>
      <Text>Best Price: ${item.lowestPrice}</Text>
      <Text>Retailer: {item.cheapestRetailer}</Text>
      <Text>Updated: {item.lastUpdated}</Text>
      <Button
        title={refreshing ? 'Refreshing...' : 'Refresh'}
        onPress={onRefresh}
        disabled={refreshing || deleting}
      />
      <Button
        title={deleting ? 'Removing...' : 'Remove'}
        onPress={onDelete}
        disabled={refreshing || deleting}
      />
    </View>
  );
}
