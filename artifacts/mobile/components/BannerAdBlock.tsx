import React from 'react';
import { View, StyleSheet, Text } from 'react-native';

// Lazy-load AdMob — only available in native production builds, not Expo Go
let BannerAd: any = null;
let BannerAdSize: any = null;
let TestIds: any = null;

try {
  const ads = require('react-native-google-mobile-ads');
  BannerAd = ads.BannerAd;
  BannerAdSize = ads.BannerAdSize;
  TestIds = ads.TestIds;
} catch {}

const BANNER_UNIT_ID = __DEV__
  ? (TestIds?.ADAPTIVE_BANNER ?? 'ca-app-pub-3940256099942544/9214589741')
  : 'ca-app-pub-6881903056221433/5160607111';

export function BannerAdBlock() {
  if (!BannerAd || !BannerAdSize) {
    return (
      <View style={styles.placeholder}>
        <Text style={styles.placeholderText}>AD</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <BannerAd
        unitId={BANNER_UNIT_ID}
        size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER}
        requestOptions={{ requestNonPersonalizedAdsOnly: false }}
        onAdFailedToLoad={() => {}}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    alignItems: 'center',
    minHeight: 52,
    backgroundColor: '#020617',
  },
  placeholder: {
    width: '100%', height: 50,
    backgroundColor: '#1e293b', borderRadius: 8,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: '#334155',
  },
  placeholderText: { fontSize: 11, color: '#475569', letterSpacing: 2 },
});
