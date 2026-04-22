import React from 'react';
import {
  Alert,
  Button,
  Image,
  Linking,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

function formatPrice(price) {
  return Number.isFinite(price) ? `$${price.toFixed(2)}` : 'Unavailable';
}

function formatTimestamp(value) {
  if (!value) {
    return 'Unknown';
  }

  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? value : parsed.toLocaleString();
}

export default function ProductDetailsScreen({ route }) {
  const item = route?.params?.item;
  const offers = Array.isArray(item?.offers) ? item.offers : [];

  const openOfferLink = async (url) => {
    if (!url) {
      Alert.alert('Missing Link', 'This retailer offer does not include a product link yet.');
      return;
    }

    try {
      const supported = await Linking.canOpenURL(url);

      if (!supported) {
        Alert.alert('Cannot Open Link', 'Your device could not open this retailer link.');
        return;
      }

      await Linking.openURL(url);
    } catch (err) {
      Alert.alert('Link Error', err.message || 'Unable to open the retailer link.');
    }
  };

  if (!item) {
    return (
      <View style={styles.emptyState}>
        <Text style={styles.emptyTitle}>No product data available.</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.heroCard}>
        {item.image ? (
          <Image source={{ uri: item.image }} style={styles.heroImage} resizeMode="contain" />
        ) : (
          <View style={styles.heroPlaceholder}>
            <Text style={styles.heroPlaceholderText}>No Image</Text>
          </View>
        )}
        <View style={styles.heroContent}>
          <Text style={styles.title}>{item.name}</Text>
          <Text style={styles.summary}>Matched offers: {offers.length}</Text>
          <Text style={styles.summary}>Lowest price: {formatPrice(item.lowestPrice)}</Text>
          <Text style={styles.summary}>Cheapest retailer: {item.cheapestRetailer}</Text>
          <Text style={styles.summary}>Last updated: {formatTimestamp(item.lastUpdated)}</Text>
          {item.sourceInput ? (
            <Text style={styles.sourceText}>Search source: {item.sourceInput}</Text>
          ) : null}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Retailer Offers</Text>
        <Text style={styles.sectionDescription}>
          Use this list to verify whether the matching grouped the same product across retailers.
        </Text>

        {offers.length === 0 ? (
          <View style={styles.emptyOffersCard}>
            <Text style={styles.emptyOffersText}>No retailer offers were saved for this item.</Text>
          </View>
        ) : (
          offers.map((offer, index) => (
            <View key={`${offer.retailer}-${offer.retailerId || index}`} style={styles.offerCard}>
              <View style={styles.offerHeader}>
                <Text style={styles.offerRetailer}>{offer.retailer}</Text>
                <Text style={styles.offerPrice}>{formatPrice(offer.price)}</Text>
              </View>
              <Text style={styles.offerName}>{offer.name}</Text>
              {offer.url ? (
                <Text style={styles.offerUrl} numberOfLines={2}>
                  {offer.url}
                </Text>
              ) : (
                <Text style={styles.offerUrlMissing}>No retailer link available</Text>
              )}
              <View style={styles.offerAction}>
                <Button title="Open Retailer Link" onPress={() => openOfferLink(offer.url)} />
              </View>
            </View>
          ))
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#f8fafc',
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    backgroundColor: '#f8fafc',
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  heroCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#dbe4f0',
    marginBottom: 16,
  },
  heroImage: {
    width: '100%',
    height: 220,
    borderRadius: 14,
    backgroundColor: '#eef2f7',
    marginBottom: 16,
  },
  heroPlaceholder: {
    width: '100%',
    height: 220,
    borderRadius: 14,
    backgroundColor: '#e5e7eb',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  heroPlaceholderText: {
    fontSize: 16,
    color: '#6b7280',
  },
  heroContent: {
    gap: 6,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  summary: {
    fontSize: 15,
    color: '#334155',
  },
  sourceText: {
    fontSize: 13,
    color: '#64748b',
    marginTop: 4,
  },
  section: {
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 6,
  },
  sectionDescription: {
    fontSize: 14,
    color: '#475569',
    marginBottom: 12,
  },
  emptyOffersCard: {
    backgroundColor: '#ffffff',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: '#dbe4f0',
  },
  emptyOffersText: {
    fontSize: 14,
    color: '#64748b',
  },
  offerCard: {
    backgroundColor: '#ffffff',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: '#dbe4f0',
    marginBottom: 12,
  },
  offerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    gap: 12,
  },
  offerRetailer: {
    fontSize: 17,
    fontWeight: '700',
    color: '#0f172a',
  },
  offerPrice: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0f766e',
  },
  offerName: {
    fontSize: 15,
    color: '#1e293b',
    marginBottom: 10,
  },
  offerUrl: {
    fontSize: 13,
    color: '#2563eb',
    marginBottom: 12,
  },
  offerUrlMissing: {
    fontSize: 13,
    color: '#94a3b8',
    marginBottom: 12,
  },
  offerAction: {
    alignSelf: 'flex-start',
  },
});
