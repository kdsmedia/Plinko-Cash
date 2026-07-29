import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, Modal, TouchableOpacity, Animated,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useGame } from '@/contexts/GameContext';
import { useRewardedAd } from '@/hooks/useRewardedAd';

export function AdRewardModal() {
  const {
    isAdRewardOpen, setIsAdRewardOpen,
    cash, handleClaimAdBalls, handleExchangePoints, settings,
  } = useGame();
  const { showAd } = useRewardedAd();
  const isIndo = settings.language === 'id';

  const [tab, setTab] = useState<'ad' | 'exchange'>('ad');
  const [countdown, setCountdown] = useState(5);
  const [completed, setCompleted] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [exchangeAmt, setExchangeAmt] = useState(1);
  const [exMsg, setExMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const pulseAnim = useRef(new Animated.Value(1)).current;

  // Reset on open
  useEffect(() => {
    if (!isAdRewardOpen) {
      setCountdown(5); setCompleted(false); setPlaying(false);
      setExMsg(null); setTab('ad');
    } else {
      startAdCountdown();
    }
  }, [isAdRewardOpen]);

  useEffect(() => {
    if (tab === 'ad' && isAdRewardOpen) {
      startAdCountdown();
    }
  }, [tab]);

  const startAdCountdown = () => {
    setCountdown(5); setCompleted(false); setPlaying(true);
    let c = 5;
    const iv = setInterval(() => {
      c -= 1;
      setCountdown(c);
      if (c <= 0) {
        clearInterval(iv);
        setCompleted(true);
        setPlaying(false);
      }
    }, 1000);
    return () => clearInterval(iv);
  };

  useEffect(() => {
    if (completed) {
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.15, duration: 200, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1,    duration: 200, useNativeDriver: true }),
      ]).start();
    }
  }, [completed, pulseAnim]);

  const handleClaimAd = () => {
    if (!completed) return;
    // Show real rewarded ad
    showAd(() => {
      handleClaimAdBalls(2);
      setIsAdRewardOpen(false);
    });
  };

  const handleExchange = () => {
    setExMsg(null);
    const cost = exchangeAmt * 50;
    if (cash < cost) {
      setExMsg({
        ok: false,
        text: isIndo
          ? `Poin tidak cukup! Butuh ${cost.toLocaleString('id-ID')} POIN`
          : `Need ${cost.toLocaleString()} pts`,
      });
      return;
    }
    // Show rewarded ad before exchange
    showAd(() => {
      handleExchangePoints(cost, exchangeAmt);
      setExMsg({
        ok: true,
        text: isIndo
          ? `Berhasil! −${cost.toLocaleString('id-ID')} POIN → +${exchangeAmt} Bola`
          : `Done! −${cost.toLocaleString()} pts → +${exchangeAmt} balls`,
      });
    });
  };

  return (
    <Modal
      visible={isAdRewardOpen}
      transparent
      animationType="fade"
      onRequestClose={() => { if (!playing) setIsAdRewardOpen(false); }}
    >
      <View style={styles.overlay}>
        <View style={styles.card}>
          {/* Header */}
          <View style={styles.header}>
            <MaterialCommunityIcons name="star-circle" size={20} color="#f59e0b" />
            <Text style={styles.title}>{isIndo ? 'Dapatkan Bola Gratis' : 'Get Free Balls'}</Text>
            <TouchableOpacity
              onPress={() => { if (!playing) setIsAdRewardOpen(false); }}
              disabled={playing}
            >
              <Ionicons name="close" size={20} color={playing ? '#334155' : '#94a3b8'} />
            </TouchableOpacity>
          </View>

          {/* Tabs */}
          <View style={styles.tabs}>
            <TouchableOpacity
              style={[styles.tab, tab === 'ad' && styles.tabActiveAmber]}
              onPress={() => setTab('ad')}
            >
              <Ionicons name="tv" size={13} color={tab === 'ad' ? '#020617' : '#64748b'} />
              <Text style={[styles.tabText, tab === 'ad' && styles.tabTextActive]}>
                {isIndo ? 'Iklan (+2)' : 'Watch Ad (+2)'}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tab, tab === 'exchange' && styles.tabActiveCyan]}
              onPress={() => setTab('exchange')}
            >
              <MaterialCommunityIcons name="swap-horizontal" size={13} color={tab === 'exchange' ? '#020617' : '#64748b'} />
              <Text style={[styles.tabText, tab === 'exchange' && styles.tabTextActive]}>
                {isIndo ? 'Tukar Poin' : 'Exchange Points'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Ad Tab */}
          {tab === 'ad' && (
            <View style={styles.tabBody}>
              <View style={styles.adScreen}>
                {playing && (
                  <>
                    <Ionicons name="play-circle" size={44} color="#f59e0b" />
                    <Text style={styles.adText}>{isIndo ? 'Menonton Iklan...' : 'Watching Ad...'}</Text>
                    <View style={styles.timerBadge}>
                      <Text style={styles.timerText}>{countdown}s</Text>
                    </View>
                  </>
                )}
                {completed && (
                  <Animated.View style={[styles.doneWrap, { transform: [{ scale: pulseAnim }] }]}>
                    <Ionicons name="checkmark-circle" size={48} color="#10b981" />
                    <Text style={styles.doneTitle}>{isIndo ? 'Iklan Selesai!' : 'Ad Complete!'}</Text>
                    <Text style={styles.doneSub}>{isIndo ? 'Klaim +2 Bola' : 'Claim +2 balls'}</Text>
                  </Animated.View>
                )}
              </View>
              <TouchableOpacity
                style={[styles.claimBtn, !completed && styles.btnDisabled]}
                onPress={handleClaimAd}
                disabled={!completed}
              >
                <MaterialCommunityIcons name="star-circle" size={18} color="#020617" />
                <Text style={styles.claimBtnText}>
                  {completed
                    ? (isIndo ? 'KLAIM +2 BOLA' : 'CLAIM +2 BALLS')
                    : (isIndo ? 'Tunggu Iklan...' : 'Wait for Ad...')}
                </Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Exchange Tab */}
          {tab === 'exchange' && (
            <View style={styles.tabBody}>
              <View style={styles.exBalance}>
                <Text style={styles.exBalLabel}>{isIndo ? 'Saldo POIN' : 'Points Balance'}</Text>
                <Text style={styles.exBalVal}>{cash.toLocaleString('id-ID')} POIN</Text>
                <View style={styles.rateBadge}>
                  <Text style={styles.rateText}>50 POIN = 1 Bola</Text>
                </View>
              </View>

              <Text style={styles.label}>{isIndo ? 'Jumlah Bola:' : 'Balls Amount:'}</Text>
              <View style={styles.exGrid}>
                {[1, 5, 10, 20].map(n => {
                  const cost = n * 50;
                  const sel = exchangeAmt === n;
                  const canAfford = cash >= cost;
                  return (
                    <TouchableOpacity
                      key={n}
                      style={[styles.exBtn, sel && styles.exBtnActive, !canAfford && styles.exBtnDisabled]}
                      onPress={() => canAfford && setExchangeAmt(n)}
                    >
                      <Text style={[styles.exBtnBalls, sel && { color: '#020617' }]}>{n} Bola</Text>
                      <Text style={[styles.exBtnCost, sel && { color: '#02061788' }]}>{cost} P</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              <View style={styles.exSummary}>
                <Text style={styles.exSumLabel}>{isIndo ? 'Biaya:' : 'Cost:'}</Text>
                <Text style={styles.exSumVal}>{(exchangeAmt * 50).toLocaleString('id-ID')} POIN + Iklan</Text>
              </View>

              {exMsg && (
                <View style={[styles.msgBox, exMsg.ok ? styles.msgOk : styles.msgErr]}>
                  <Ionicons name={exMsg.ok ? 'checkmark-circle' : 'alert-circle'} size={14} color={exMsg.ok ? '#10b981' : '#ef4444'} />
                  <Text style={[styles.msgText, { color: exMsg.ok ? '#10b981' : '#ef4444' }]}>{exMsg.text}</Text>
                </View>
              )}

              <TouchableOpacity style={styles.exBtn2} onPress={handleExchange}>
                <Ionicons name="play-circle" size={18} color="#020617" />
                <Text style={styles.exBtn2Text}>
                  {isIndo ? 'Tonton Iklan & Tukar' : 'Watch Ad & Exchange'}
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(2,6,23,0.9)', justifyContent: 'center', alignItems: 'center', padding: 16 },
  card: {
    width: '100%', maxWidth: 360,
    backgroundColor: '#0f172a', borderRadius: 24,
    borderWidth: 1, borderColor: '#1e293b', padding: 18,
  },
  header: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 14 },
  title: { fontFamily: 'Inter_700Bold', fontSize: 15, color: '#fbbf24', flex: 1 },
  tabs: {
    flexDirection: 'row', backgroundColor: '#020617',
    borderRadius: 12, borderWidth: 1, borderColor: '#1e293b',
    padding: 4, gap: 4, marginBottom: 14,
  },
  tab: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 5, paddingVertical: 9, borderRadius: 9 },
  tabActiveAmber: { backgroundColor: '#f59e0b' },
  tabActiveCyan: { backgroundColor: '#06b6d4' },
  tabText: { fontFamily: 'Inter_600SemiBold', fontSize: 12, color: '#64748b' },
  tabTextActive: { color: '#020617' },
  tabBody: { gap: 12 },

  adScreen: {
    height: 148, backgroundColor: '#020617', borderRadius: 14,
    borderWidth: 1, borderColor: '#1e293b',
    alignItems: 'center', justifyContent: 'center', gap: 10,
  },
  adText: { fontFamily: 'Inter_600SemiBold', fontSize: 14, color: '#f1f5f9' },
  timerBadge: {
    backgroundColor: '#1e293b', borderRadius: 20,
    paddingHorizontal: 16, paddingVertical: 5,
    borderWidth: 1, borderColor: '#f59e0b55',
  },
  timerText: { fontFamily: 'Inter_700Bold', fontSize: 16, color: '#f59e0b' },
  doneWrap: { alignItems: 'center', gap: 6 },
  doneTitle: { fontFamily: 'Inter_700Bold', fontSize: 15, color: '#10b981' },
  doneSub: { fontFamily: 'Inter_400Regular', fontSize: 12, color: '#94a3b8' },
  claimBtn: {
    backgroundColor: '#f59e0b', borderRadius: 14,
    paddingVertical: 13, flexDirection: 'row',
    alignItems: 'center', justifyContent: 'center', gap: 8,
  },
  claimBtnText: { fontFamily: 'Inter_700Bold', fontSize: 14, color: '#020617' },
  btnDisabled: { opacity: 0.4 },

  exBalance: {
    backgroundColor: '#020617', borderRadius: 12,
    padding: 12, flexDirection: 'row', alignItems: 'center',
    borderWidth: 1, borderColor: '#06b6d433', gap: 8, flexWrap: 'wrap',
  },
  exBalLabel: { fontFamily: 'Inter_600SemiBold', fontSize: 10, color: '#64748b' },
  exBalVal: { fontFamily: 'Inter_700Bold', fontSize: 13, color: '#06b6d4', flex: 1 },
  rateBadge: { backgroundColor: '#06b6d422', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4, borderWidth: 1, borderColor: '#06b6d433' },
  rateText: { fontFamily: 'Inter_600SemiBold', fontSize: 9, color: '#06b6d4' },
  label: { fontFamily: 'Inter_600SemiBold', fontSize: 11, color: '#94a3b8' },
  exGrid: { flexDirection: 'row', gap: 8 },
  exBtn: {
    flex: 1, backgroundColor: '#020617', borderRadius: 10,
    borderWidth: 1, borderColor: '#334155',
    paddingVertical: 10, alignItems: 'center',
  },
  exBtnActive: { backgroundColor: '#06b6d4', borderColor: '#06b6d4' },
  exBtnDisabled: { opacity: 0.35 },
  exBtnBalls: { fontFamily: 'Inter_700Bold', fontSize: 12, color: '#f1f5f9' },
  exBtnCost: { fontFamily: 'Inter_400Regular', fontSize: 9, color: '#64748b' },
  exSummary: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#1e293b', borderRadius: 10, padding: 10, gap: 8,
  },
  exSumLabel: { fontFamily: 'Inter_400Regular', fontSize: 11, color: '#64748b' },
  exSumVal: { fontFamily: 'Inter_700Bold', fontSize: 12, color: '#f59e0b' },
  msgBox: { flexDirection: 'row', alignItems: 'center', gap: 6, borderRadius: 10, padding: 10, borderWidth: 1 },
  msgOk: { backgroundColor: '#10b98115', borderColor: '#10b98133' },
  msgErr: { backgroundColor: '#ef444415', borderColor: '#ef444433' },
  msgText: { fontFamily: 'Inter_400Regular', fontSize: 11, flex: 1 },
  exBtn2: {
    backgroundColor: '#06b6d4', borderRadius: 14,
    paddingVertical: 13, flexDirection: 'row',
    alignItems: 'center', justifyContent: 'center', gap: 8,
  },
  exBtn2Text: { fontFamily: 'Inter_700Bold', fontSize: 14, color: '#020617' },
});
