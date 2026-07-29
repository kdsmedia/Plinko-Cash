import React, { useRef, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { WebView } from 'react-native-webview';
import { PLINKO_HTML } from '@/constants/plinkoHtml';
import { useGame } from '@/contexts/GameContext';
import { BallType } from '@/types/game';

export function PlinkoBoard() {
  const webViewRef = useRef<WebView>(null);
  const { dropTrigger, handleBallLanded } = useGame();

  useEffect(() => {
    if (dropTrigger > 0 && webViewRef.current) {
      webViewRef.current.injectJavaScript(
        `window.dropBall && window.dropBall("standard", 1); true;`
      );
    }
  }, [dropTrigger]);

  const handleMessage = (event: { nativeEvent: { data: string } }) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      if (data.type === 'BALL_LANDED') {
        handleBallLanded(
          data.payout,
          data.multiplier,
          data.ballType as BallType,
          data.goldenPegsHit
        );
      }
    } catch {}
  };

  return (
    <View style={styles.container}>
      <WebView
        ref={webViewRef}
        source={{ html: PLINKO_HTML }}
        onMessage={handleMessage}
        scrollEnabled={false}
        bounces={false}
        javaScriptEnabled
        originWhitelist={['*']}
        style={styles.webview}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0f1d',
    overflow: 'hidden',
  },
  webview: {
    flex: 1,
    backgroundColor: '#0a0f1d',
  },
});
