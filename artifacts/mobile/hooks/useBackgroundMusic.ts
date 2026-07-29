import { useEffect, useRef, useCallback } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import { Audio } from 'expo-av';

const BACKSOUND = require('@/assets/backsound.mp3');

export function useBackgroundMusic(soundEnabled: boolean) {
  const soundRef = useRef<Audio.Sound | null>(null);
  const isMountedRef = useRef(true);
  const isPlayingRef = useRef(false);

  const play = useCallback(async () => {
    if (!soundRef.current || isPlayingRef.current) return;
    try {
      await soundRef.current.playAsync();
      isPlayingRef.current = true;
    } catch {}
  }, []);

  const pause = useCallback(async () => {
    if (!soundRef.current || !isPlayingRef.current) return;
    try {
      await soundRef.current.pauseAsync();
      isPlayingRef.current = false;
    } catch {}
  }, []);

  // Load sound once on mount
  useEffect(() => {
    isMountedRef.current = true;

    (async () => {
      try {
        await Audio.setAudioModeAsync({
          playsInSilentModeIOS: true,
          staysActiveInBackground: false,
        });

        const { sound } = await Audio.Sound.createAsync(BACKSOUND, {
          isLooping: true,
          volume: 0.5,
          shouldPlay: soundEnabled,
        });

        if (!isMountedRef.current) {
          await sound.unloadAsync();
          return;
        }

        soundRef.current = sound;
        isPlayingRef.current = soundEnabled;
      } catch {}
    })();

    return () => {
      isMountedRef.current = false;
      soundRef.current?.unloadAsync().catch(() => {});
      soundRef.current = null;
      isPlayingRef.current = false;
    };
  }, []);

  // React to soundEnabled toggle
  useEffect(() => {
    if (soundEnabled) {
      play();
    } else {
      pause();
    }
  }, [soundEnabled, play, pause]);

  // Pause when app goes to background, resume when foreground
  useEffect(() => {
    const handleAppState = (nextState: AppStateStatus) => {
      if (nextState === 'active' && soundEnabled) {
        play();
      } else if (nextState !== 'active') {
        pause();
      }
    };

    const sub = AppState.addEventListener('change', handleAppState);
    return () => sub.remove();
  }, [soundEnabled, play, pause]);
}
