import React from 'react';
import { View, Text } from 'react-native';

export default function ItemCard({ item }) {
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
    </View>
  );
}
