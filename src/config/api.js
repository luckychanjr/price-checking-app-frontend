import { Platform } from 'react-native';

// Paste your deployed API Gateway base URL here when you want the app to talk
// directly to AWS instead of a local dev server.
const MANUAL_API_BASE_URL = 'https://ooqbjz3cq6.execute-api.us-east-1.amazonaws.com/dev';
const MANUAL_ADD_ITEM_PATH = '/wishlist';
const MANUAL_GET_WISHLIST_PATH = '/wishlist';
const DEFAULT_DEV_PORT = 8000;

const defaultDevHost = Platform.select({
  android: '10.0.2.2',
  ios: '127.0.0.1',
  default: 'localhost',
});

const normalizeBaseUrl = (value) => value.replace(/\/+$/, '');

const normalizePath = (value) => (value.startsWith('/') ? value : `/${value}`);

const joinUrl = (baseUrl, path) => {
  if (/^https?:\/\//i.test(path)) {
    return path;
  }

  return `${normalizeBaseUrl(baseUrl)}${normalizePath(path)}`;
};

export const API_BASE_URL =
  MANUAL_API_BASE_URL || `http://${defaultDevHost}:${DEFAULT_DEV_PORT}`;

export const API_ENDPOINTS = {
  addItem: joinUrl(API_BASE_URL, MANUAL_ADD_ITEM_PATH),
  wishlist: joinUrl(API_BASE_URL, MANUAL_GET_WISHLIST_PATH),
};
