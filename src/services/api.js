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

const normalizeOffer = (offer, fallback = {}) => {
  const price = Number(
    offer?.price ??
      fallback.price ??
      0,
  );

  return {
    retailer: offer?.retailer ?? fallback.retailer ?? 'Unknown',
    retailerId: String(offer?.retailerId ?? fallback.retailerId ?? ''),
    name: offer?.name ?? fallback.name ?? 'Unknown Item',
    price,
    url: offer?.url ?? fallback.url ?? '',
    image: offer?.image ?? fallback.image ?? '',
  };
};

const normalizeOffers = (offers, fallbackOffers = []) => {
  const sourceOffers = Array.isArray(offers) && offers.length > 0 ? offers : fallbackOffers;

  return sourceOffers
    .filter(Boolean)
    .map((offer) => normalizeOffer(offer))
    .filter((offer) => Number.isFinite(offer.price) && offer.price > 0)
    .sort((a, b) => a.price - b.price);
};

const normalizeItem = (item, fallback = {}) => {
  const offers = normalizeOffers(item?.offers, fallback.offers);
  const firstOffer = offers[0] ?? null;

  return {
    itemId: String(item?.itemId ?? item?.id ?? fallback.itemId ?? Date.now()),
    name:
      item?.name ??
      item?.title ??
      firstOffer?.name ??
      fallback.name ??
      fallback.input ??
      'Unknown Item',
    image: item?.image ?? firstOffer?.image ?? fallback.image ?? '',
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
    sourceInput: item?.sourceInput ?? fallback.sourceInput ?? '',
    offers,
  };
};

const hasMeaningfulText = (value) =>
  typeof value === 'string' && value.trim() !== '' && value.trim().toLowerCase() !== 'unknown item';

const mergeRefreshedItem = (existingItem, refreshedData) => {
  const offers = normalizeOffers(refreshedData?.offers, existingItem?.offers);
  const firstOffer = offers[0] ?? null;
  const refreshedPrice = Number(
    refreshedData?.lowestPrice ??
      refreshedData?.cheapestPrice ??
      refreshedData?.price ??
      firstOffer?.price ??
      existingItem?.lowestPrice ??
      0,
  );

  return {
    ...existingItem,
    itemId: String(refreshedData?.itemId ?? refreshedData?.id ?? existingItem?.itemId ?? Date.now()),
    name: hasMeaningfulText(refreshedData?.name)
      ? refreshedData.name
      : hasMeaningfulText(refreshedData?.title)
        ? refreshedData.title
        : existingItem?.name ?? 'Unknown Item',
    image: refreshedData?.image ?? existingItem?.image ?? '',
    url: refreshedData?.url ?? existingItem?.url ?? '',
    lowestPrice: refreshedPrice,
    cheapestRetailer:
      refreshedData?.cheapestRetailer ??
      refreshedData?.retailer ??
      firstOffer?.retailer ??
      existingItem?.cheapestRetailer ??
      'Unknown',
    lastUpdated:
      refreshedData?.lastUpdated ??
      refreshedData?.updatedAt ??
      new Date().toISOString(),
    sourceInput:
      refreshedData?.sourceInput ??
      existingItem?.sourceInput ??
      '',
    offers,
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

const saveWishlistItemLocally = async (rawItem, fallback = {}) => {
  const newItem = normalizeItem(rawItem, fallback);
  const items = await readWishlist();
  const nextItems = [newItem, ...items.filter((item) => item.itemId !== newItem.itemId)];
  await saveWishlist(nextItems);
  return newItem;
};

export const searchItems = async (input) => {
  const trimmedInput = input.trim();
  const payload = buildAddItemPayload(trimmedInput);

  const res = await fetch(API_ENDPOINTS.searchItems, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  const data = await parseJson(res);
  ensureOk(res, data);

  if (!Array.isArray(data?.items)) {
    return [];
  }

  return data.items.map((item, index) => ({
    ...normalizeItem(item, {
      itemId: `${item?.title ?? item?.name ?? 'result'}-${index}`,
      input: trimmedInput,
      image: item?.image ?? item?.offers?.[0]?.image ?? '',
      url: item?.url ?? item?.offers?.[0]?.url ?? '',
      sourceInput: item?.sourceInput ?? trimmedInput,
      offers: item?.offers,
    }),
    sourceInput: item?.sourceInput ?? trimmedInput,
    raw: item,
  }));
};

export const addItem = async (inputOrProduct) => {
  const isSelectedProduct =
    typeof inputOrProduct === 'object' && inputOrProduct !== null && !Array.isArray(inputOrProduct);

  const payload = isSelectedProduct
    ? { selectedProduct: inputOrProduct.raw ?? inputOrProduct }
    : buildAddItemPayload(inputOrProduct.trim());

  const res = await fetch(API_ENDPOINTS.addItem, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  const data = await parseJson(res);
  ensureOk(res, data);

  return saveWishlistItemLocally(data, {
    input: typeof inputOrProduct === 'string' ? inputOrProduct.trim() : inputOrProduct?.name ?? '',
    url: payload.url ?? inputOrProduct?.url ?? '',
    image: inputOrProduct?.image ?? '',
    lastUpdated: new Date().toISOString(),
  });
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

export const deleteItem = async (itemId) => {
  const res = await fetch(`${API_ENDPOINTS.wishlist}/${encodeURIComponent(itemId)}`, {
    method: 'DELETE',
  });

  const data = await parseJson(res);
  ensureOk(res, data);

  const items = await readWishlist();
  const nextItems = items.filter((item) => item.itemId !== itemId);
  await saveWishlist(nextItems);

  return data ?? { success: true, itemId };
};

export const refreshItem = async (itemOrId) => {
  const existingItem =
    typeof itemOrId === 'object' && itemOrId !== null ? itemOrId : null;
  const itemId = existingItem?.itemId ?? itemOrId;
  const res = await fetch(
    `${API_ENDPOINTS.wishlist}/${encodeURIComponent(itemId)}/refresh`,
    {
      method: 'POST',
    },
  );

  const data = await parseJson(res);
  ensureOk(res, data);

  const refreshedItem = existingItem
    ? mergeRefreshedItem(existingItem, data)
    : normalizeItem(data, { itemId });
  const items = await readWishlist();
  const nextItems = items.map((item) =>
    item.itemId === itemId ? refreshedItem : item,
  );
  await saveWishlist(nextItems);

  return refreshedItem;
};
