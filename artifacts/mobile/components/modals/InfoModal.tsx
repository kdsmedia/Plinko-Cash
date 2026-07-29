import React, { useState } from 'react';
import {
  View, Text, StyleSheet, Modal, TouchableOpacity, ScrollView,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useGame } from '@/contexts/GameContext';

type Tab = 'about' | 'cara' | 'disclaimer' | 'privacy';

export function InfoModal() {
  const { isInfoOpen, setIsInfoOpen, settings } = useGame();
  const isIndo = settings.language === 'id';
  const [tab, setTab] = useState<Tab>('about');

  const TABS: { key: Tab; label: string; icon: string }[] = [
    { key: 'about', label: isIndo ? 'Tentang' : 'About', icon: 'information-circle' },
    { key: 'cara', label: isIndo ? 'Cara Main' : 'How to Play', icon: 'game-controller' },
    { key: 'disclaimer', label: 'Disclaimer', icon: 'warning' },
    { key: 'privacy', label: isIndo ? 'Privasi' : 'Privacy', icon: 'shield-checkmark' },
  ];

  const content: Record<Tab, { title: string; body: string }> = {
    about: {
      title: isIndo ? 'Tentang Plinko Cash' : 'About Plinko Cash',
      body: isIndo
        ? 'Plinko Cash adalah game mobile hiburan yang dikembangkan oleh ALTOMEDIA. Pemain menjatuhkan bola melalui papan penuh paku dan mengumpulkan POIN berdasarkan kotak pendaratan bola.\n\nVersi: 1.0.0\nDeveloper: ALTOMEDIA\nPackage: com.altomedia.plinkocash'
        : 'Plinko Cash is an entertainment mobile game developed by ALTOMEDIA. Players drop balls through a peg board and collect POINTS based on where the ball lands.\n\nVersion: 1.0.0\nDeveloper: ALTOMEDIA\nPackage: com.altomedia.plinkocash',
    },
    cara: {
      title: isIndo ? 'Cara Bermain' : 'How to Play',
      body: isIndo
        ? '1. Tekan tombol "Jatuhkan" untuk menjatuhkan bola ke papan.\n\n2. Bola akan memantul ke paku dan mendarat di kotak poin.\n\n3. Setiap kotak memiliki nilai POIN berbeda (5x–150x). Kotak ADS memberi bonus, ZONK tidak memberi poin.\n\n4. Jatah bola harian: 10 bola per hari. Bola diperbarui setiap hari.\n\n5. Tonton iklan untuk mendapatkan bola tambahan kapan saja.\n\n6. Gunakan POIN untuk ditukar ke Rupiah di menu Penarikan.\n\n7. Kurs Penarikan: 1.000 POIN = Rp10\n\n8. Kumpulkan POIN sebanyak mungkin dan tarik ke akun DANA kamu!\n\n9. Bonus Harian (1×/hari) dan Roda Keberuntungan tersedia setiap hari.'
        : '1. Press "Drop Ball" to drop a ball onto the board.\n\n2. The ball bounces off pegs and lands in a bucket.\n\n3. Each bucket has a POINT value (5x–150x). ADS = bonus, ZONK = no points.\n\n4. Daily ball quota: 10 balls per day. Resets every day.\n\n5. Watch ads to get extra balls anytime.\n\n6. Use POINTS to exchange for Rupiah in the Withdraw menu.\n\n7. Exchange Rate: 1,000 POINTS = Rp10\n\n8. Collect as many POINTS as possible and withdraw to your DANA account!\n\n9. Daily Bonus (1×/day) and Spin Wheel available every day.',
    },
    disclaimer: {
      title: 'Disclaimer',
      body: isIndo
        ? 'Plinko Cash adalah aplikasi hiburan semata. POIN yang dikumpulkan dalam game tidak memiliki nilai moneter nyata hingga ditukarkan melalui fitur penarikan resmi aplikasi.\n\nAltomedia tidak bertanggung jawab atas kerugian yang mungkin timbul dari penggunaan aplikasi ini di luar prosedur yang telah ditentukan.\n\nPermainan ini mengandung iklan dari Google AdMob.\n\nHak Cipta © 2024 ALTOMEDIA. Semua hak dilindungi.'
        : 'Plinko Cash is an entertainment application only. POINTS collected in the game have no real monetary value until exchanged through the official app withdrawal feature.\n\nAltomedia is not responsible for any losses arising from use of this application outside the prescribed procedures.\n\nThis game contains advertisements from Google AdMob.\n\nCopyright © 2024 ALTOMEDIA. All rights reserved.',
    },
    privacy: {
      title: isIndo ? 'Kebijakan Privasi' : 'Privacy Policy',
      body: isIndo
        ? 'Kami menghargai privasi Anda.\n\nData yang dikumpulkan:\n- Data permainan (skor, saldo) disimpan lokal di perangkat Anda.\n- Google AdMob dapat mengumpulkan data anonim untuk penargetan iklan sesuai kebijakan Google.\n\nKami tidak menjual atau membagikan data pribadi Anda kepada pihak ketiga.\n\nDengan menggunakan aplikasi ini, Anda menyetujui kebijakan privasi ini.\n\nKontak: altomedia@email.com'
        : 'We value your privacy.\n\nData collected:\n- Game data (score, balance) is stored locally on your device.\n- Google AdMob may collect anonymous data for ad targeting per Google\'s policy.\n\nWe do not sell or share your personal data with third parties.\n\nBy using this app, you agree to this privacy policy.\n\nContact: altomedia@email.com',
    },
  };

  return (
    <Modal visible={isInfoOpen} transparent animationType="slide" onRequestClose={() => setIsInfoOpen(false)}>
      <View style={styles.overlay}>
        <View style={styles.card}>
          {/* Header */}
          <View style={styles.header}>
            <MaterialCommunityIcons name="information" size={20} color="#06b6d4" />
            <Text style={styles.headerTitle}>{isIndo ? 'Informasi' : 'Information'}</Text>
            <TouchableOpacity onPress={() => setIsInfoOpen(false)}>
              <Ionicons name="close" size={22} color="#94a3b8" />
            </TouchableOpacity>
          </View>

          {/* Tabs */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabsRow}>
            {TABS.map(t => (
              <TouchableOpacity
                key={t.key}
                style={[styles.tabBtn, tab === t.key && styles.tabBtnActive]}
                onPress={() => setTab(t.key)}
              >
                <Ionicons name={t.icon as any} size={13} color={tab === t.key ? '#020617' : '#64748b'} />
                <Text style={[styles.tabBtnText, tab === t.key && styles.tabBtnTextActive]}>{t.label}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Content */}
          <ScrollView style={styles.body} showsVerticalScrollIndicator={false}>
            <Text style={styles.contentTitle}>{content[tab].title}</Text>
            <Text style={styles.contentBody}>{content[tab].body}</Text>
          </ScrollView>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>Plinko Cash © 2024 ALTOMEDIA</Text>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(2,6,23,0.85)', justifyContent: 'flex-end' },
  card: {
    backgroundColor: '#0f172a', borderTopLeftRadius: 24, borderTopRightRadius: 24,
    borderWidth: 1, borderColor: '#1e293b', maxHeight: '80%',
  },
  header: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    paddingHorizontal: 18, paddingVertical: 16,
    borderBottomWidth: 1, borderBottomColor: '#1e293b',
  },
  headerTitle: { fontFamily: 'Inter_700Bold', fontSize: 16, color: '#06b6d4', flex: 1 },
  tabsRow: { flexDirection: 'row', gap: 8, paddingHorizontal: 16, paddingVertical: 10 },
  tabBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    backgroundColor: '#020617', borderRadius: 20,
    paddingHorizontal: 12, paddingVertical: 6,
    borderWidth: 1, borderColor: '#1e293b',
  },
  tabBtnActive: { backgroundColor: '#06b6d4', borderColor: '#06b6d4' },
  tabBtnText: { fontFamily: 'Inter_600SemiBold', fontSize: 11, color: '#64748b' },
  tabBtnTextActive: { color: '#020617' },
  body: { paddingHorizontal: 18, paddingBottom: 12, maxHeight: 300 },
  contentTitle: { fontFamily: 'Inter_700Bold', fontSize: 14, color: '#fbbf24', marginBottom: 10, marginTop: 4 },
  contentBody: { fontFamily: 'Inter_400Regular', fontSize: 12, color: '#94a3b8', lineHeight: 20 },
  footer: {
    paddingVertical: 12, alignItems: 'center',
    borderTopWidth: 1, borderTopColor: '#1e293b',
  },
  footerText: { fontFamily: 'Inter_400Regular', fontSize: 10, color: '#334155' },
});
