import React, { useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Animated,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useGame } from '@/contexts/GameContext';
import { BannerAdBlock } from '@/components/BannerAdBlock';

export function ControlPanel() {
  const insets = useSafeAreaInsets();
  const {
    ballsCount,
    isAutoDropping,
    setIsAutoDropping,
    handleDropBall,
    setIsAdRewardOpen,
    settings,
  } = useGame();

  const pulseAnim = useRef(new Animated.Value(1)).current;

  // Pulse animation while auto-dropping
  useEffect(() => {
    if (isAutoDropping) {
      const anim = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.04, duration: 380, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1,    duration: 380, useNativeDriver: true }),
        ])
      );
      anim.start();
      return () => anim.stop();
    } else {
      pulseAnim.setValue(1);
    }
  }, [isAutoDropping, pulseAnim]);

  // Auto-drop interval
  useEffect(() => {
    if (!isAutoDropping) return;
    if (ballsCount <= 0) {
      setIsAutoDropping(false);
      setIsAdRewardOpen(true);
      return;
    }
    const interval = setInterval(handleDropBall, settings.autoDropSpeed);
    return () => clearInterval(interval);
  }, [isAutoDropping, settings.autoDropSpeed, handleDropBall, ballsCount, setIsAutoDropping, setIsAdRewardOpen]);

  const onPressAuto = () => {
    if (!isAutoDropping && ballsCount <= 0) {
      setIsAdRewardOpen(true);
      return;
    }
    setIsAutoDropping((v) => !v);
  };

  const isIndo = settings.language === 'id';

  return (
    <View style={[styles.container, { paddingBottom: Math.max(insets.bottom, 8) }]}>
      {/* Banner Ad above buttons */}
      <BannerAdBlock />

      <View style={styles.row}>
        {/* Drop Ball */}
        <TouchableOpacity
          style={styles.dropBtn}
          onPress={ballsCount > 0 ? handleDropBall : () => setIsAdRewardOpen(true)}
          activeOpacity={0.8}
        >
          <Ionicons name="play" size={18} color="#020617" />
          <Text style={styles.dropBtnText}>{isIndo ? 'Jatuhkan' : 'Drop Ball'}</Text>
          <View style={styles.ballBadge}>
            <Text style={styles.ballBadgeText}>{ballsCount}</Text>
          </View>
        </TouchableOpacity>

        {/* Auto Drop */}
        <Animated.View style={[styles.autoWrap, { transform: [{ scale: pulseAnim }] }]}>
          <TouchableOpacity
            style={[styles.autoBtn, isAutoDropping && styles.autoBtnActive]}
            onPress={onPressAuto}
            activeOpacity={0.8}
          >
            <MaterialCommunityIcons
              name={isAutoDropping ? 'stop-circle' : 'autorenew'}
              size={18}
              color={isAutoDropping ? '#020617' : '#94a3b8'}
            />
            <Text style={[styles.autoBtnText, isAutoDropping && styles.autoBtnTextActive]}>
              {isAutoDropping
                ? (isIndo ? 'Stop' : 'Stop')
                : (isIndo ? 'Auto' : 'Auto')}
            </Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#0f172a',
    borderTopWidth: 1,
    borderTopColor: '#1e293b',
    paddingHorizontal: 12,
    paddingTop: 8,
    gap: 8,
  },
  row: {
    flexDirection: 'row',
    gap: 10,
    paddingBottom: 4,
  },
  dropBtn: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#f59e0b',
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 12,
  },
  dropBtnText: {
    fontFamily: 'Inter_700Bold',
    fontSize: 14,
    color: '#020617',
    letterSpacing: 0.3,
  },
  ballBadge: {
    backgroundColor: '#020617',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 2,
    minWidth: 28,
    alignItems: 'center',
  },
  ballBadgeText: {
    fontFamily: 'Inter_700Bold',
    fontSize: 12,
    color: '#fbbf24',
  },
  autoWrap: { flex: 1 },
  autoBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#1e293b',
    borderRadius: 14,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: '#334155',
  },
  autoBtnActive: {
    backgroundColor: '#10b981',
    borderColor: '#10b981',
  },
  autoBtnText: {
    fontFamily: 'Inter_700Bold',
    fontSize: 14,
    color: '#94a3b8',
  },
  autoBtnTextActive: {
    color: '#020617',
  },
});
