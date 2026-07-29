import React, { useState, useRef } from 'react';
import {
  View, Text, StyleSheet, Modal, TouchableOpacity,
  Animated, Easing, ActivityIndicator,
} from 'react-native';
import Svg, { Path, Text as SvgText, G, Circle } from 'react-native-svg';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useGame } from '@/contexts/GameContext';
import { useRewardedAd } from '@/hooks/useRewardedAd';

interface Segment {
  label: string;
  type: 'cash' | 'balls' | 'zonk';
  value: number;
  color: string;
  weight: number;
}

const SEGMENTS: Segment[] = [
  { label: '+1 Bola', type: 'balls', value: 1,   color: '#f59e0b', weight: 12 },
  { label: 'Rp100',  type: 'cash',  value: 100,  color: '#10b981', weight: 12 },
  { label: 'Zonk',   type: 'zonk',  value: 0,    color: '#475569', weight: 30 },
  { label: 'Rp200',  type: 'cash',  value: 200,  color: '#3b82f6', weight: 5  },
  { label: '+2 Bola',type: 'balls', value: 2,    color: '#ec4899', weight: 4  },
  { label: 'Zonk',   type: 'zonk',  value: 0,    color: '#334155', weight: 25 },
  { label: 'Rp250',  type: 'cash',  value: 250,  color: '#8b5cf6', weight: 2  },
  { label: '+3 Bola',type: 'balls', value: 3,    color: '#f97316', weight: 2  },
  { label: 'Rp50',   type: 'cash',  value: 50,   color: '#06b6d4', weight: 15 },
  { label: '+1 Bola',type: 'balls', value: 1,    color: '#eab308', weight: 12 },
];

const SEG_ANGLE = 360 / SEGMENTS.length;
const CX = 130, CY = 130, R = 118;

function polar(deg: number, r: number) {
  const rad = ((deg - 90) * Math.PI) / 180;
  return { x: CX + r * Math.cos(rad), y: CY + r * Math.sin(rad) };
}

function arcPath(i: number) {
  const s = i * SEG_ANGLE, e = (i + 1) * SEG_ANGLE;
  const p1 = polar(s, R), p2 = polar(e, R);
  return `M ${CX} ${CY} L ${p1.x} ${p1.y} A ${R} ${R} 0 0 1 ${p2.x} ${p2.y} Z`;
}

function weighted(): number {
  const total = SEGMENTS.reduce((a, s) => a + s.weight, 0);
  let r = Math.random() * total;
  for (let i = 0; i < SEGMENTS.length; i++) {
    if (r < SEGMENTS[i].weight) return i;
    r -= SEGMENTS[i].weight;
  }
  return 2;
}

export function SpinWheelModal() {
  const { isSpinWheelOpen, setIsSpinWheelOpen, handleWinSpinWheel, settings } = useGame();
  const { showAd } = useRewardedAd();
  const isIndo = settings.language === 'id';

  const [spinning, setSpinning] = useState(false);
  const [result, setResult] = useState<Segment | null>(null);
  const [claiming, setClaiming] = useState(false);
  const rotAnim = useRef(new Animated.Value(0)).current;
  const currentRot = useRef(0);

  const close = () => {
    if (spinning || claiming) return;
    setIsSpinWheelOpen(false);
    setResult(null);
    rotAnim.setValue(0);
    currentRot.current = 0;
  };

  const handleSpin = () => {
    if (spinning) return;
    setSpinning(true);
    setResult(null);
    const idx = weighted();
    const target = currentRot.current + 360 * 12 + (360 - (idx * SEG_ANGLE + SEG_ANGLE / 2));
    currentRot.current = target;
    Animated.timing(rotAnim, {
      toValue: target, duration: 5800,
      easing: Easing.out(Easing.exp), useNativeDriver: true,
    }).start(() => {
      setSpinning(false);
      setResult(SEGMENTS[idx]);
    });
  };

  const handleConfirm = () => {
    if (!result || claiming) return;
    if (result.type === 'zonk') {
      close();
      return;
    }
    setClaiming(true);
    // Rewarded ad before giving prize
    showAd(() => {
      handleWinSpinWheel(result.type, result.value);
      setClaiming(false);
      close();
    });
  };

  const spin = rotAnim.interpolate({ inputRange: [0, 360], outputRange: ['0deg', '360deg'] });

  return (
    <Modal visible={isSpinWheelOpen} transparent animationType="fade" onRequestClose={close}>
      <View style={styles.overlay}>
        <View style={styles.card}>
          <TouchableOpacity style={styles.closeBtn} onPress={close} disabled={spinning || claiming}>
            <Ionicons name="close" size={20} color={spinning ? '#334155' : '#94a3b8'} />
          </TouchableOpacity>

          <MaterialCommunityIcons name="disc" size={24} color="#f59e0b" style={{ marginBottom: 4 }} />
          <Text style={styles.title}>{isIndo ? 'Roda Keberuntungan' : 'Lucky Spin Wheel'}</Text>

          {/* Pointer */}
          <View style={styles.pointer} />

          {/* SVG Wheel */}
          <Animated.View style={{ transform: [{ rotate: spin }] }}>
            <Svg width={260} height={260} viewBox="0 0 260 260">
              {SEGMENTS.map((seg, i) => {
                const mid = i * SEG_ANGLE + SEG_ANGLE / 2;
                const lp = polar(mid, R * 0.64);
                return (
                  <G key={i}>
                    <Path d={arcPath(i)} fill={seg.color} stroke="#0f172a" strokeWidth={1.2} />
                    <SvgText
                      x={lp.x} y={lp.y}
                      fill="#fff" fontSize={7.5} fontWeight="bold"
                      textAnchor="middle" alignmentBaseline="middle"
                      rotation={mid} originX={lp.x} originY={lp.y}
                    >
                      {seg.label}
                    </SvgText>
                  </G>
                );
              })}
              <Circle cx={CX} cy={CY} r={20} fill="#f59e0b" stroke="#0f172a" strokeWidth={2} />
              <SvgText x={CX} y={CY} fill="#020617" fontSize={7.5} fontWeight="bold" textAnchor="middle" alignmentBaseline="middle">
                SPIN
              </SvgText>
            </Svg>
          </Animated.View>

          {/* Action */}
          {result ? (
            <View style={styles.resultBox}>
              <Text style={[styles.resultTitle, result.type === 'zonk' && { color: '#64748b' }]}>
                {result.type === 'zonk'
                  ? (isIndo ? 'ZONK! Coba lagi!' : 'ZONK! Better luck next time!')
                  : (isIndo ? '🎉 SELAMAT MENANG!' : '🎉 YOU WON!')}
              </Text>
              {result.type !== 'zonk' && (
                <Text style={styles.resultPrize}>{result.label}</Text>
              )}
              <TouchableOpacity
                style={[
                  result.type === 'zonk' ? styles.zonkBtn : styles.confirmBtn,
                  claiming && styles.btnDisabled,
                ]}
                onPress={handleConfirm}
                disabled={claiming}
              >
                {claiming ? (
                  <ActivityIndicator color="#020617" size="small" />
                ) : result.type === 'zonk' ? (
                  <Text style={styles.confirmBtnText}>OK</Text>
                ) : (
                  <>
                    <Ionicons name="play-circle" size={18} color="#020617" />
                    <Text style={styles.confirmBtnText}>
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
              <MaterialCommunityIcons name="autorenew" size={20} color="#020617" />
              <Text style={styles.spinBtnText}>
                {spinning ? (isIndo ? 'Berputar...' : 'Spinning...') : (isIndo ? 'PUTAR SEKARANG' : 'SPIN NOW')}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(2,6,23,0.9)', justifyContent: 'center', alignItems: 'center', padding: 16 },
  card: {
    width: '100%', maxWidth: 340,
    backgroundColor: '#0f172a', borderRadius: 24,
    borderWidth: 1, borderColor: '#1e293b',
    padding: 18, alignItems: 'center',
  },
  closeBtn: { position: 'absolute', top: 14, right: 14, padding: 6 },
  title: { fontFamily: 'Inter_700Bold', fontSize: 17, color: '#fbbf24', marginBottom: 10 },
  pointer: {
    width: 0, height: 0,
    borderLeftWidth: 10, borderRightWidth: 10, borderBottomWidth: 20,
    borderLeftColor: 'transparent', borderRightColor: 'transparent', borderBottomColor: '#f59e0b',
    zIndex: 10, marginBottom: -6,
  },
  spinBtn: {
    width: '100%', flexDirection: 'row',
    backgroundColor: '#f59e0b', borderRadius: 14,
    paddingVertical: 14, alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 14,
  },
  spinBtnText: { fontFamily: 'Inter_700Bold', fontSize: 14, color: '#020617' },
  resultBox: { width: '100%', alignItems: 'center', gap: 10, marginTop: 10 },
  resultTitle: { fontFamily: 'Inter_700Bold', fontSize: 16, color: '#10b981', textAlign: 'center' },
  resultPrize: { fontFamily: 'Inter_700Bold', fontSize: 24, color: '#fbbf24' },
  confirmBtn: {
    width: '100%', backgroundColor: '#10b981', borderRadius: 14,
    paddingVertical: 13, flexDirection: 'row',
    alignItems: 'center', justifyContent: 'center', gap: 8,
  },
  zonkBtn: {
    width: '100%', backgroundColor: '#1e293b', borderRadius: 14,
    paddingVertical: 13, alignItems: 'center',
  },
  confirmBtnText: { fontFamily: 'Inter_700Bold', fontSize: 15, color: '#020617' },
  btnDisabled: { opacity: 0.55 },
});
