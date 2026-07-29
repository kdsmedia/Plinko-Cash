// Web stub — AdMob is native-only
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export function BannerAdBlock() {
  return (
    <View style={styles.placeholder}>
      <Text style={styles.text}>AD</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  placeholder: {
    width: '100%', height: 50,
    backgroundColor: '#1e293b', borderRadius: 8,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: '#334155',
    borderStyle: 'dashed',
  },
  text: { fontSize: 11, color: '#475569', letterSpacing: 2 },
});
