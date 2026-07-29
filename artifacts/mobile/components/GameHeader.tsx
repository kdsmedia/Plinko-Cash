import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useGame } from '@/contexts/GameContext';

export function GameHeader() {
  const insets = useSafeAreaInsets();
  const {
    cash,
    ballsCount,
    settings,
    setSettings,
    setIsDailyOpen,
    setIsSpinWheelOpen,
    setIsWithdrawOpen,
    setIsAdRewardOpen,
    setIsInfoOpen,
  } = useGame();

  const isIndo = settings.language === 'id';
  const rpValue = (cash * 0.01).toLocaleString('id-ID', { minimumFractionDigits: 0 });

  return (
    <View style={[styles.header, { paddingTop: insets.top + 6 }]}>
      {/* Brand */}
      <View style={styles.brand}>
        <View style={styles.logoBox}>
          <Text style={styles.logoText}>P</Text>
        </View>
        <View>
          <Text style={styles.brandName}>Plinko Cash</Text>
          <Text style={styles.brandSub}>by ALTOMEDIA</Text>
        </View>
      </View>

      {/* Balances */}
      <View style={styles.balances}>
        {/* POIN */}
        <TouchableOpacity style={styles.balanceBadge} onPress={() => setIsWithdrawOpen(true)}>
          <MaterialCommunityIcons name="star-circle" size={13} color="#f59e0b" />
          <View>
            <Text style={styles.balanceLabel}>{isIndo ? 'POIN' : 'POINTS'}</Text>
            <Text style={styles.balanceValue}>{cash.toLocaleString('id-ID')}</Text>
          </View>
        </TouchableOpacity>

        {/* BALLS */}
        <TouchableOpacity style={[styles.balanceBadge, styles.ballsBadge]} onPress={() => setIsAdRewardOpen(true)}>
          <MaterialCommunityIcons name="circle-slice-8" size={13} color="#f59e0b" />
          <View>
            <Text style={styles.balanceLabel}>{isIndo ? 'BOLA' : 'BALLS'}</Text>
            <Text style={styles.balanceValue}>{ballsCount}</Text>
          </View>
          <View style={styles.addBtn}>
            <Ionicons name="add" size={12} color="#020617" />
          </View>
        </TouchableOpacity>
      </View>

      {/* Actions */}
      <View style={styles.actions}>
        <TouchableOpacity style={styles.iconBtn} onPress={() => setIsSpinWheelOpen(true)}>
          <MaterialCommunityIcons name="gift" size={18} color="#f59e0b" />
          <View style={styles.dot} />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.iconBtn}
          onPress={() => setSettings(p => ({ ...p, soundEnabled: !p.soundEnabled }))}
        >
          <Ionicons
            name={settings.soundEnabled ? 'volume-high' : 'volume-mute'}
            size={18}
            color={settings.soundEnabled ? '#10b981' : '#64748b'}
          />
        </TouchableOpacity>
        <TouchableOpacity style={styles.iconBtn} onPress={() => setIsInfoOpen(true)}>
          <Ionicons name="information-circle-outline" size={18} color="#06b6d4" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#0f172a',
    paddingHorizontal: 10,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#1e293b',
    gap: 6,
  },
  brand: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  logoBox: {
    width: 30, height: 30, borderRadius: 8,
    backgroundColor: '#f59e0b',
    alignItems: 'center', justifyContent: 'center',
  },
  logoText: { fontFamily: 'Inter_700Bold', fontSize: 16, color: '#020617' },
  brandName: { fontFamily: 'Inter_700Bold', fontSize: 11, color: '#fbbf24' },
  brandSub: { fontFamily: 'Inter_400Regular', fontSize: 8, color: '#64748b' },
  balances: { flexDirection: 'row', gap: 5, flex: 1, justifyContent: 'center' },
  balanceBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: '#020617', borderRadius: 10,
    borderWidth: 1, borderColor: '#334155',
    paddingHorizontal: 8, paddingVertical: 4,
  },
  ballsBadge: { borderColor: '#f59e0b44' },
  balanceLabel: { fontFamily: 'Inter_600SemiBold', fontSize: 7, color: '#94a3b8', letterSpacing: 0.5 },
  balanceValue: { fontFamily: 'Inter_700Bold', fontSize: 11, color: '#f1f5f9' },
  addBtn: {
    width: 16, height: 16, borderRadius: 5,
    backgroundColor: '#f59e0b',
    alignItems: 'center', justifyContent: 'center',
  },
  actions: { flexDirection: 'row', gap: 2 },
  iconBtn: {
    width: 32, height: 32, borderRadius: 9,
    backgroundColor: '#1e293b',
    alignItems: 'center', justifyContent: 'center',
  },
  dot: {
    position: 'absolute', top: 2, right: 2,
    width: 6, height: 6, borderRadius: 3,
    backgroundColor: '#f59e0b',
  },
});
