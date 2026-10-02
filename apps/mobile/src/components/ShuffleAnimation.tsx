import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  FadeOut,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
  type SharedValue,
} from 'react-native-reanimated';
import {
  SHUFFLE_CARDS,
  SHUFFLE_CARD_STAGGER_MS,
  SHUFFLE_MS,
  SHUFFLE_RIFFLES,
  SHUFFLE_RIFFLE_MS,
} from '../animation/motion';
import { CARD_ASPECT } from '../theme';
import { CardBack } from './CardBack';

interface Props {
  cardWidth: number;
  /** Called once the shuffle has played. Not called when reduced motion skips it. */
  onDone: () => void;
  reducedMotion: boolean;
}

/**
 * A short riffle: a small stack of cards splits left and right and folds back
 * together, twice. Plays on launch and on New Reading.
 */
export function ShuffleAnimation({ cardWidth, onDone, reducedMotion }: Props) {
  useEffect(() => {
    const timer = setTimeout(onDone, reducedMotion ? 0 : SHUFFLE_MS);
    return () => clearTimeout(timer);
  }, [onDone, reducedMotion]);

  if (reducedMotion) return null;

  return (
    <Animated.View exiting={FadeOut.duration(250)} style={styles.container} pointerEvents="none">
      <View style={{ width: cardWidth, height: cardWidth / CARD_ASPECT }}>
        {Array.from({ length: SHUFFLE_CARDS }, (_, i) => (
          <RiffleCard key={i} index={i} width={cardWidth} />
        ))}
      </View>
    </Animated.View>
  );
}

function RiffleCard({ index, width }: { index: number; width: number }) {
  const progress = useSharedValue(0);
  const side = index % 2 === 0 ? -1 : 1;

  useEffect(() => {
    const half = { duration: SHUFFLE_RIFFLE_MS, easing: Easing.inOut(Easing.quad) };
    progress.value = withDelay(
      index * SHUFFLE_CARD_STAGGER_MS,
      withRepeat(withSequence(withTiming(1, half), withTiming(0, half)), SHUFFLE_RIFFLES),
    );
  }, [index, progress]);

  const style = useRiffleStyle(progress, side, index, width);
  return (
    <Animated.View style={[StyleSheet.absoluteFill, style]}>
      <CardBack width={width} />
    </Animated.View>
  );
}

function useRiffleStyle(progress: SharedValue<number>, side: number, index: number, width: number) {
  return useAnimatedStyle(() => ({
    transform: [
      { translateX: progress.value * side * width * 0.62 },
      { translateY: -index * 1.5 - progress.value * 6 },
      { rotate: `${progress.value * side * 9}deg` },
    ],
  }));
}

const styles = StyleSheet.create({
  container: { ...StyleSheet.absoluteFill, alignItems: 'center', justifyContent: 'center' },
});
