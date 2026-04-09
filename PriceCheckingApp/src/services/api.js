import AsyncStorage from '@react-native-async-storage/async-storage';

const BASE_URL = "https://your-api-id.execute-api.region.amazonaws.com/dev";
const STORAGE_KEY = 'wishlist';

export const addItem = async (url) => {
  try {
    const res = await fetch(`${BASE_URL}/wishlist`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ url })
    });
    const newItem = await res.json();
    // Also save locally
    const localData = await AsyncStorage.getItem(STORAGE_KEY);
    const items = localData ? JSON.parse(localData) : [];
    items.push(newItem);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    return newItem;
  } catch (err) {
    // Fallback to local storage
    const newItem = { itemId: Date.now().toString(), name: 'New Item', url, lowestPrice: 0, cheapestRetailer: 'Unknown', lastUpdated: new Date().toISOString() };
    const localData = await AsyncStorage.getItem(STORAGE_KEY);
    const items = localData ? JSON.parse(localData) : [];
    items.push(newItem);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    return newItem;
  }
};

export const getWishlist = async () => {
  try {
    const res = await fetch(`${BASE_URL}/wishlist`);
    const data = await res.json();
    // Cache locally
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    return data;
  } catch (err) {
    // Load from local storage
    const localData = await AsyncStorage.getItem(STORAGE_KEY);
    return localData ? JSON.parse(localData) : [];
  }
};
