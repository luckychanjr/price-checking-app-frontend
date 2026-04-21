import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_ENDPOINTS } from '../config/api';

const STORAGE_KEY = 'wishlist';

const isUrlInput = (value) => {
  try {
    const parsed = new URL(value);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
};

const normalizeItem = (item, fallback = {}) => {
  const firstOffer = Array.isArray(item?.offers) ? item.offers.find(Boolean) : null;

  return {
    itemId: String(item?.itemId ?? item?.id ?? fallback.itemId ?? Date.now()),
    name:
      item?.name ??
      item?.title ??
      firstOffer?.name ??
      fallback.name ??
      fallback.input ??
      'Unknown Item',
    url: item?.url ?? firstOffer?.url ?? fallback.url ?? '',
    lowestPrice: Number(
      item?.lowestPrice ??
        item?.cheapestPrice ??
        item?.price ??
        firstOffer?.price ??
        fallback.lowestPrice ??
        0,
    ),
    cheapestRetailer:
      item?.cheapestRetailer ??
      item?.retailer ??
      firstOffer?.retailer ??
      fallback.cheapestRetailer ??
      'Unknown',
    lastUpdated:
      item?.lastUpdated ??
      item?.updatedAt ??
      item?.createdAt ??
      fallback.lastUpdated ??
      new Date().toISOString(),
  };
};

const buildAddItemPayload = (input) => {
  if (isUrlInput(input)) {
    return { url: input };
  }

  return { query: input };
};

const saveWishlist = async (items) => {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(items));
};

const readWishlist = async () => {
  const localData = await AsyncStorage.getItem(STORAGE_KEY);
  return localData ? JSON.parse(localData) : [];
};

const parseJson = async (res) => {
  const text = await res.text();

  if (!text) {
    return null;
  }

  try {
    return JSON.parse(text);
  } catch {
    return { message: text };
  }
};

const ensureOk = (res, data) => {
  if (res.ok) {
    return;
  }

  const message =
    data?.message ?? data?.error ?? `Request failed with status ${res.status}`;

  throw new Error(message);
};

const normalizeWishlistResponse = (data) => {
  if (Array.isArray(data)) {
    return data.map((item) => normalizeItem(item));
  }

  if (Array.isArray(data?.Items)) {
    return data.Items.map((item) => normalizeItem(item));
  }

  if (Array.isArray(data?.items)) {
    return data.items.map((item) => normalizeItem(item));
  }

  return [];
};

export const addItem = async (input) => {
  const trimmedInput = input.trim();
  const payload = buildAddItemPayload(trimmedInput);

  const res = await fetch(API_ENDPOINTS.addItem, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  const data = await parseJson(res);
  ensureOk(res, data);

  const newItem = normalizeItem(data, {
    input: trimmedInput,
    url: payload.url ?? '',
    lastUpdated: new Date().toISOString(),
  });
  const items = await readWishlist();
  const nextItems = [newItem, ...items.filter((item) => item.itemId !== newItem.itemId)];
  await saveWishlist(nextItems);
  return newItem;
};

export const getWishlist = async () => {
  try {
    const res = await fetch(API_ENDPOINTS.wishlist);
    const data = await parseJson(res);
    ensureOk(res, data);

    const items = normalizeWishlistResponse(data);
    await saveWishlist(items);
    return items;
  } catch (err) {
    const items = await readWishlist();
    return items.length > 0 ? items : [];
  }
};
