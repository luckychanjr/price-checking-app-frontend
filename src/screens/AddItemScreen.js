import React, { useState } from 'react';
import { View, TextInput, Button, Alert } from 'react-native';
import { addItem } from '../services/api';

export default function AddItemScreen({ navigation }) {
  const [input, setInput] = useState('');

  const handleAdd = async () => {
    const trimmedInput = input.trim();

    if (!trimmedInput) {
      Alert.alert('Missing Input', 'Please enter a product query or paste a product URL.');
      return;
    }

    try {
      await addItem(trimmedInput);
      Alert.alert('Success', 'Item added to your wishlist.');
      navigation.goBack();
    } catch (err) {
      Alert.alert('Error', err.message || 'Failed to add item');
    }
  };

  return (
    <View style={{ padding: 20 }}>
      <TextInput
        placeholder='Paste a URL or type a query like "ipad pro"'
        value={input}
        onChangeText={setInput}
        autoCapitalize="none"
        autoCorrect={false}
        style={{
          borderWidth: 1,
          padding: 10,
          marginBottom: 10
        }}
      />
      <Button title="Add to Wishlist" onPress={handleAdd} />
    </View>
  );
}
