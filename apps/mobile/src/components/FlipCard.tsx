import { useEffect, type ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';
import { FLIP_MS, REDUCED_MOTION_MS } from '../animation/motion';

interface Props {
  width: number;
  height: number;
  flipped: boolean;
  /** ms to wait before flipping, for staggering. */
  delay: number;
  reducedMotion: boolean;
  back: ReactNode;
  front: ReactNode;
}

/**
 * 3D flip around the vertical axis. Back shows for the first half, front for
 * the second. Opacity is switched at the midpoint as well as using
 * backfaceVisibility, so the hidden side never bleeds through on any platform.
 * With Reduce Motion on, it crossfades instead of rotating.
 */
export function FlipCard({ width, height, flipped, delay, reducedMotion, back, front }: Props) {
  const progress = useSharedValue(flipped ? 1 : 0);

  useEffect(() => {
    if (!flipped) {
      progress.value = 0;
      return;
    }
    const duration = reducedMotion ? REDUCED_MOTION_MS : FLIP_MS;
    progress.value = withDelay(delay, withTiming(1, { duration, easing: Easing.inOut(Easing.cubic) }));
  }, [flipped, delay, reducedMotion, progress]);

  const backStyle = useAnimatedStyle(() => {
    if (reducedMotion) return { opacity: 1 - progress.value };
    return {
      opacity: progress.value < 0.5 ? 1 : 0,
      transform: [
        { perspective: 1000 },
        { rotateY: `${progress.value * 180}deg` },
        { scale: 1 + 0.08 * Math.sin(Math.PI * progress.value) },
      ],
    };
  });

  const frontStyle = useAnimatedStyle(() => {
    if (reducedMotion) return { opacity: progress.value };
    return {
      opacity: progress.value >= 0.5 ? 1 : 0,
      transform: [
        { perspective: 1000 },
        { rotateY: `${interpolate(progress.value, [0, 1], [-180, 0])}deg` },
        { scale: 1 + 0.08 * Math.sin(Math.PI * progress.value) },
      ],
    };
  });

  return (
    <View style={{ width, height }}>
      <Animated.View style={[styles.side, backStyle]}>{back}</Animated.View>
      <Animated.View style={[styles.side, frontStyle]}>{front}</Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  side: { ...StyleSheet.absoluteFill, backfaceVisibility: 'hidden' },
});
