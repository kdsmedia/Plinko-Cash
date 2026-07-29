import React, { useState } from 'react';
import {
  View, Text, StyleSheet, Modal, TouchableOpacity,
  TextInput, ScrollView, ActivityIndicator,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useGame } from '@/contexts/GameContext';

// 1000 POIN = Rp10  →  Rp = POIN * 0.01
const RATE = 0.01;
const NOMINAL_OPTIONS = [
  { poin: 50_000 },
  { poin: 100_000 },
  { poin: 200_000 },
  { poin: 500_000 },
  { poin: 1_000_000 },
  { poin: 2_000_000 },
];

export function WithdrawModal() {
  const { isWithdrawOpen, setIsWithdrawOpen, cash, handleWithdraw, settings } = useGame();
  const isIndo = settings.language === 'id';
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [selected, setSelected] = useState(100_000);
  const [processing, setProcessing] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const close = () => {
    if (processing) return;
    setIsWithdrawOpen(false);
    setSuccess('');
    setError('');
  };

  const submit = () => {
    setError('');
    setSuccess('');
    if (!name.trim()) {
      setError(isIndo ? 'Masukkan nama lengkap!' : 'Enter your full name!');
      return;
    }
    if (phone.trim().length < 9) {
      setError(isIndo ? 'Nomor DANA tidak valid!' : 'Invalid DANA number!');
      return;
    }
    if (cash < selected) {
      setError(isIndo ? `Poin tidak cukup!` : 'Insufficient points!');
      return;
    }
    setProcessing(true);
    setTimeout(() => {
      setProcessing(false);
      handleWithdraw(selected);
      const rp = (selected * RATE).toLocaleString('id-ID', { minimumFractionDigits: 0 });
      setSuccess(isIndo
        ? `Penarikan ${selected.toLocaleString('id-ID')} POIN (Rp${rp}) ke DANA ${phone} berhasil!`
        : `Withdrawal of ${selected.toLocaleString()} pts (Rp${rp}) to DANA ${phone} done!`
      );
    }, 1800);
  };

  return (
    <Modal visible={isWithdrawOpen} transparent animationType="slide" onRequestClose={close}>
      <View style={styles.overlay}>
        <View style={styles.card}>
          <View style={styles.header}>
            <MaterialCommunityIcons name="wallet" size={20} color="#06b6d4" />
            <View style={{ flex: 1 }}>
              <Text style={styles.title}>{isIndo ? 'Tarik Poin ke DANA' : 'Withdraw to DANA'}</Text>
              <Text style={styles.sub}>1,000 POIN = Rp10</Text>
            </View>
            <TouchableOpacity onPress={close} disabled={processing}>
              <Ionicons name="close" size={22} color="#94a3b8" />
            </TouchableOpacity>
          </View>

          {/* Balance */}
          <View style={styles.balance}>
            <Text style={styles.balLabel}>{isIndo ? 'Saldo POIN:' : 'Points Balance:'}</Text>
            <Text style={styles.balValue}>{cash.toLocaleString('id-ID')} POIN</Text>
            <Text style={styles.balRp}>≈ Rp{(cash * RATE).toLocaleString('id-ID', { minimumFractionDigits: 0 })}</Text>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Name */}
            <Text style={styles.label}>{isIndo ? 'Nama Pemilik DANA' : 'DANA Account Name'}</Text>
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
              placeholder={isIndo ? 'Contoh: Budi Santoso' : 'e.g. John Doe'}
              placeholderTextColor="#475569"
            />

            {/* Phone */}
            <Text style={styles.label}>{isIndo ? 'Nomor HP DANA' : 'DANA Phone'}</Text>
            <TextInput
              style={styles.input}
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
              placeholder="081234567890"
              placeholderTextColor="#475569"
            />

            {/* Amounts */}
            <Text style={styles.label}>{isIndo ? 'Pilih Jumlah Penarikan' : 'Select Amount'}</Text>
            <View style={styles.grid}>
              {NOMINAL_OPTIONS.map(({ poin }) => {
                const rp = (poin * RATE).toLocaleString('id-ID', { minimumFractionDigits: 0 });
                const active = selected === poin;
                const disabled = cash < poin;
                return (
                  <TouchableOpacity
                    key={poin}
                    style={[styles.amtBtn, active && styles.amtBtnActive, disabled && styles.amtBtnDisabled]}
                    onPress={() => !disabled && setSelected(poin)}
                    disabled={disabled}
                  >
                    <Text style={[styles.amtBtnPoin, active && { color: '#020617' }]}>
                      {poin >= 1_000_000 ? `${poin / 1_000_000}Jt` : `${poin / 1000}K`}
                    </Text>
                    <Text style={[styles.amtBtnRp, active && { color: '#02061799' }]}>Rp{rp}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Summary */}
            <View style={styles.summary}>
              <Text style={styles.summaryLabel}>{isIndo ? 'Akan Ditarik:' : 'Withdrawing:'}</Text>
              <Text style={styles.summaryVal}>{selected.toLocaleString('id-ID')} POIN → Rp{(selected * RATE).toLocaleString('id-ID')}</Text>
            </View>

            {/* Messages */}
            {error !== '' && (
              <View style={styles.errorBox}>
                <Ionicons name="alert-circle" size={14} color="#ef4444" />
                <Text style={styles.errorText}>{error}</Text>
              </View>
            )}
            {success !== '' && (
              <View style={styles.successBox}>
                <Ionicons name="checkmark-circle" size={14} color="#10b981" />
                <Text style={styles.successText}>{success}</Text>
              </View>
            )}

            {/* Submit */}
            <TouchableOpacity style={[styles.submitBtn, processing && { opacity: 0.6 }]} onPress={submit} disabled={processing}>
              {processing ? (
                <ActivityIndicator color="#020617" />
              ) : (
                <Text style={styles.submitBtnText}>{isIndo ? 'TARIK SEKARANG' : 'WITHDRAW NOW'}</Text>
              )}
            </TouchableOpacity>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(2,6,23,0.85)', justifyContent: 'flex-end' },
  card: {
    backgroundColor: '#0f172a',
    borderTopLeftRadius: 28, borderTopRightRadius: 28,
    borderWidth: 1, borderColor: '#1e293b',
    padding: 20, maxHeight: '90%',
  },
  header: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 14 },
  title: { fontFamily: 'Inter_700Bold', fontSize: 15, color: '#06b6d4' },
  sub: { fontFamily: 'Inter_400Regular', fontSize: 10, color: '#475569' },
  balance: {
    backgroundColor: '#020617', borderRadius: 12,
    padding: 12, marginBottom: 14, flexDirection: 'row',
    alignItems: 'center', gap: 8, borderWidth: 1, borderColor: '#1e293b',
  },
  balLabel: { fontFamily: 'Inter_600SemiBold', fontSize: 11, color: '#64748b' },
  balValue: { fontFamily: 'Inter_700Bold', fontSize: 14, color: '#f1f5f9', flex: 1 },
  balRp: { fontFamily: 'Inter_600SemiBold', fontSize: 11, color: '#10b981' },
  label: { fontFamily: 'Inter_600SemiBold', fontSize: 11, color: '#94a3b8', marginBottom: 6, marginTop: 10 },
  input: {
    backgroundColor: '#020617', borderRadius: 12,
    borderWidth: 1, borderColor: '#334155',
    paddingHorizontal: 14, paddingVertical: 11,
    color: '#f1f5f9', fontFamily: 'Inter_400Regular', fontSize: 13,
  },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 4 },
  amtBtn: {
    width: '30%', backgroundColor: '#020617',
    borderRadius: 12, borderWidth: 1, borderColor: '#334155',
    paddingVertical: 10, alignItems: 'center',
  },
  amtBtnActive: { backgroundColor: '#06b6d4', borderColor: '#06b6d4' },
  amtBtnDisabled: { opacity: 0.35 },
  amtBtnPoin: { fontFamily: 'Inter_700Bold', fontSize: 13, color: '#f1f5f9' },
  amtBtnRp: { fontFamily: 'Inter_400Regular', fontSize: 9, color: '#64748b' },
  summary: {
    backgroundColor: '#1e293b', borderRadius: 10,
    padding: 10, marginTop: 14, flexDirection: 'row',
    alignItems: 'center', gap: 8, flexWrap: 'wrap',
  },
  summaryLabel: { fontFamily: 'Inter_600SemiBold', fontSize: 11, color: '#94a3b8' },
  summaryVal: { fontFamily: 'Inter_700Bold', fontSize: 12, color: '#f59e0b' },
  errorBox: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: '#ef444415', borderRadius: 10,
    borderWidth: 1, borderColor: '#ef444433',
    padding: 10, marginTop: 10,
  },
  errorText: { fontFamily: 'Inter_400Regular', fontSize: 11, color: '#ef4444', flex: 1 },
  successBox: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: '#10b98115', borderRadius: 10,
    borderWidth: 1, borderColor: '#10b98133',
    padding: 10, marginTop: 10,
  },
  successText: { fontFamily: 'Inter_400Regular', fontSize: 11, color: '#10b981', flex: 1 },
  submitBtn: {
    backgroundColor: '#06b6d4', borderRadius: 14,
    paddingVertical: 14, alignItems: 'center', marginTop: 14, marginBottom: 6,
  },
  submitBtnText: { fontFamily: 'Inter_700Bold', fontSize: 15, color: '#020617' },
});
