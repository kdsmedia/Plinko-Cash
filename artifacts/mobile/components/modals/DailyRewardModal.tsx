import React, { useState, useRef } from 'react';
import {
  View, Text, StyleSheet, Modal, TouchableOpacity,
  Animated, Easing, ActivityIndicator,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useGame } from '@/contexts/GameContext';
import { useRewardedAd } from '@/hooks/useRewardedAd';

const PRIZES = [500, 1000, 2500, 5000, 10000, 25000, 50000, 100000];
const SEG = 360 / PRIZES.length;
const COLORS = ['#f59e0b','#ea580c','#10b981','#3b82f6','#8b5cf6','#ec4899','#06b6d4','#f97316'];

export function DailyRewardModal() {
  const { isDailyOpen, setIsDailyOpen, handleClaimDaily, settings } = useGame();
  const { showAd } = useRewardedAd();
  const isIndo = settings.language === 'id';

  const [spinning, setSpinning] = useState(false);
  const [prize, setPrize] = useState<number | null>(null);
  const [claiming, setClaiming] = useState(false);
  const rotAnim = useRef(new Animated.Value(0)).current;
  const currentRot = useRef(0);

  const handleSpin = () => {
    if (spinning || prize !== null) return;
    setSpinning(true);
    const idx = Math.floor(Math.random() * PRIZES.length);
    const target = currentRot.current + 360 * 6 + (360 - (idx * SEG + SEG / 2));
    currentRot.current = target;
    Animated.timing(rotAnim, {
      toValue: target,
      duration: 3800,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start(() => {
      setSpinning(false);
      setPrize(PRIZES[idx]);
    });
  };

  const handleClaim = () => {
    if (!prize || claiming) return;
    setClaiming(true);
    // Show rewarded ad before giving reward
    showAd(() => {
      handleClaimDaily(prize);
      setClaiming(false);
      setPrize(null);
      setIsDailyOpen(false);
      rotAnim.setValue(0);
      currentRot.current = 0;
    });
  };

  const handleClose = () => {
    if (spinning || claiming) return;
    setIsDailyOpen(false);
    setPrize(null);
    rotAnim.setValue(0);
    currentRot.current = 0;
  };

  const spin = rotAnim.interpolate({
    inputRange: [0, 360],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <Modal visible={isDailyOpen} transparent animationType="fade" onRequestClose={handleClose}>
      <View style={styles.overlay}>
        <View style={styles.card}>
          <TouchableOpacity style={styles.closeBtn} onPress={handleClose} disabled={spinning || claiming}>
            <Ionicons name="close" size={20} color="#94a3b8" />
          </TouchableOpacity>

          <View style={styles.iconBox}>
            <MaterialCommunityIcons name="gift" size={28} color="#f59e0b" />
          </View>
          <Text style={styles.title}>{isIndo ? 'Bonus Harian' : 'Daily Bonus'}</Text>
          <Text style={styles.sub}>
            {isIndo ? 'Putar roda untuk klaim poin gratis!' : 'Spin the wheel for free points!'}
          </Text>

          {/* Wheel */}
          <View style={styles.wheelWrap}>
            <View style={styles.pointer} />
            <Animated.View style={[styles.wheel, { transform: [{ rotate: spin }] }]}>
              {PRIZES.map((_, i) => {
                const angle = i * SEG;
                return (
                  <View
                    key={i}
                    style={[
                      styles.segment,
                      { transform: [{ rotate: `${angle}deg` }], borderTopColor: COLORS[i % COLORS.length] },
                    ]}
                  />
                );
              })}
              {/* Labels */}
              {PRIZES.map((p, i) => {
                const angle = (i * SEG + SEG / 2) * (Math.PI / 180);
                const r = 68;
                return (
                  <View
                    key={`lbl-${i}`}
                    style={[
                      styles.labelWrap,
                      {
                        left: 90 + r * Math.cos(angle - Math.PI / 2) - 18,
                        top:  90 + r * Math.sin(angle - Math.PI / 2) - 10,
                        transform: [{ rotate: `${i * SEG + SEG / 2}deg` }],
                      },
                    ]}
                  >
                    <Text style={styles.labelText}>{p >= 1000 ? `${p / 1000}k` : p}</Text>
                  </View>
                );
              })}
              <View style={styles.hub}>
                <Text style={styles.hubText}>POIN</Text>
              </View>
            </Animated.View>
          </View>

          {/* Action */}
          {prize !== null ? (
            <View style={styles.prizeRow}>
              <Text style={styles.prizeText}>+{prize.toLocaleString('id-ID')} POIN</Text>
              <Text style={styles.prizeHint}>
                {isIndo ? '≈ Rp' : '≈ Rp'}{(prize * 0.01).toLocaleString('id-ID', { minimumFractionDigits: 0 })}
              </Text>
              <TouchableOpacity
                style={[styles.claimBtn, claiming && styles.btnDisabled]}
                onPress={handleClaim}
                disabled={claiming}
              >
                {claiming ? (
                  <ActivityIndicator color="#020617" size="small" />
                ) : (
                  <>
                    <Ionicons name="play-circle" size={18} color="#020617" />
                    <Text style={styles.claimBtnText}>
                      {isIndo ? 'Tonton Iklan & Klaim' : 'Watch Ad & Claim'}
                    </Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity
              style={[styles.spinBtn, spinning && styles.btnDisabled]}
              onPress={handleSpin}
              disabled={spinning}
            >
              <MaterialCommunityIcons name="autorenew" size={18} color="#020617" />
              <Text style={styles.spinBtnText}>
                {spinning
                  ? (isIndo ? 'Berputar...' : 'Spinning...')
                  : (isIndo ? 'Putar Roda' : 'Spin Wheel')}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(2,6,23,0.88)', justifyContent: 'center', alignItems: 'center', padding: 20 },
  card: {
    width: '100%', maxWidth: 340,
    backgroundColor: '#0f172a', borderRadius: 24,
    borderWidth: 1, borderColor: '#1e293b',
    padding: 20, alignItems: 'center',
  },
  closeBtn: { position: 'absolute', top: 14, right: 14, padding: 6 },
  iconBox: {
    width: 52, height: 52, borderRadius: 14,
    backgroundColor: '#1e293b', borderWidth: 1, borderColor: '#f59e0b44',
    alignItems: 'center', justifyContent: 'center', marginBottom: 8,
  },
  title: { fontFamily: 'Inter_700Bold', fontSize: 18, color: '#fbbf24', marginBottom: 2 },
  sub: { fontFamily: 'Inter_400Regular', fontSize: 12, color: '#64748b', marginBottom: 16, textAlign: 'center' },

  wheelWrap: { width: 180, height: 200, alignItems: 'center', justifyContent: 'flex-start', marginBottom: 18 },
  pointer: {
    width: 0, height: 0,
    borderLeftWidth: 9, borderRightWidth: 9, borderBottomWidth: 17,
    borderLeftColor: 'transparent', borderRightColor: 'transparent', borderBottomColor: '#f59e0b',
    marginBottom: 4,
  },
  wheel: {
    width: 180, height: 180, borderRadius: 90,
    borderWidth: 3, borderColor: '#f59e0b',
    backgroundColor: '#1e293b', overflow: 'hidden',
    position: 'relative',
  },
  segment: {
    position: 'absolute',
    top: 0, left: 90,
    width: 0, height: 0,
    borderLeftWidth: 90, borderRightWidth: 0,
    borderTopWidth: 90,
    borderLeftColor: 'transparent', borderRightColor: 'transparent',
    transformOrigin: '0% 100%',
    opacity: 0.9,
  },
  labelWrap: { position: 'absolute', width: 36, height: 20, alignItems: 'center', justifyContent: 'center' },
  labelText: { fontFamily: 'Inter_700Bold', fontSize: 7.5, color: '#fff' },
  hub: {
    position: 'absolute', top: 72, left: 72,
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: '#f59e0b', alignItems: 'center', justifyContent: 'center',
    borderWidth: 2, borderColor: '#0f172a', zIndex: 5,
  },
  hubText: { fontFamily: 'Inter_700Bold', fontSize: 6, color: '#020617' },

  prizeRow: { width: '100%', alignItems: 'center', gap: 8 },
  prizeText: { fontFamily: 'Inter_700Bold', fontSize: 22, color: '#10b981' },
  prizeHint: { fontFamily: 'Inter_400Regular', fontSize: 11, color: '#64748b' },
  claimBtn: {
    width: '100%', backgroundColor: '#10b981', borderRadius: 14,
    paddingVertical: 13, flexDirection: 'row',
    alignItems: 'center', justifyContent: 'center', gap: 8,
  },
  claimBtnText: { fontFamily: 'Inter_700Bold', fontSize: 14, color: '#020617' },

  spinBtn: {
    width: '100%', flexDirection: 'row',
    backgroundColor: '#f59e0b', borderRadius: 14,
    paddingVertical: 14, alignItems: 'center',
    justifyContent: 'center', gap: 8,
  },
  spinBtnText: { fontFamily: 'Inter_700Bold', fontSize: 15, color: '#020617' },
  btnDisabled: { opacity: 0.55 },
});
