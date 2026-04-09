import React, { useState } from 'react';
import { View, TextInput, Button, Alert } from 'react-native';
import { addItem } from '../services/api';

export default function AddItemScreen({ navigation }) {
  const [url, setUrl] = useState('');

  const handleAdd = async () => {
    try {
      await addItem(url);
      Alert.alert('Success', 'Item added!');
      navigation.goBack();
    } catch (err) {
      Alert.alert('Error', 'Failed to add item');
    }
  };

  return (
    <View style={{ padding: 20 }}>
      <TextInput
        placeholder="Paste product URL"
        value={url}
        onChangeText={setUrl}
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
