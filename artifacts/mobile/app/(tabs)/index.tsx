import React from 'react';
import { View, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { GameHeader } from '@/components/GameHeader';
import { PlinkoBoard } from '@/components/PlinkoBoard';
import { ControlPanel } from '@/components/ControlPanel';
import { DailyRewardModal } from '@/components/modals/DailyRewardModal';
import { SpinWheelModal } from '@/components/modals/SpinWheelModal';
import { WithdrawModal } from '@/components/modals/WithdrawModal';
import { AdRewardModal } from '@/components/modals/AdRewardModal';
import { InfoModal } from '@/components/modals/InfoModal';

export default function GameScreen() {
  return (
    <View style={styles.root}>
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <GameHeader />
      </SafeAreaView>

      <View style={styles.board}>
        <PlinkoBoard />
      </View>

      <ControlPanel />

      {/* Modals */}
      <DailyRewardModal />
      <SpinWheelModal />
      <WithdrawModal />
      <AdRewardModal />
      <InfoModal />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#020617',
  },
  safeArea: {
    backgroundColor: '#0f172a',
  },
  board: {
    flex: 1,
    backgroundColor: '#0a0f1d',
  },
});
