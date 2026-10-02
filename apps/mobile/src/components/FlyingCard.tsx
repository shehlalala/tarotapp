import { useCallback, useEffect, useRef } from 'react';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';
import { FLIGHT_MS, flightTransform, type Rect } from '../animation/motion';
import { CardBack } from './CardBack';

interface Props {
  from: Rect;
  to: Rect;
  onDone: () => void;
}

/**
 * A face-down card travelling from its place in the deck to its slot. Drawn in
 * a full-screen overlay in window coordinates, above both the deck and slots.
 */
export function FlyingCard({ from, to, onDone }: Props) {
  const t = useSharedValue(0);
  const { dx, dy, scale } = flightTransform(from, to);

  // Keep the latest callback without restarting the flight when the parent re-renders.
  const onDoneRef = useRef(onDone);
  onDoneRef.current = onDone;
  const finish = useCallback(() => onDoneRef.current(), []);

  useEffect(() => {
    t.value = withTiming(1, { duration: FLIGHT_MS, easing: Easing.out(Easing.cubic) }, (finished) => {
      if (finished) scheduleOnRN(finish);
    });
  }, [t, finish]);

  const style = useAnimatedStyle(() => ({
    transform: [
      { translateX: dx * t.value },
      // A slight arc: lift above the straight line mid-flight.
      { translateY: dy * t.value - Math.sin(Math.PI * t.value) * 24 },
      { scale: 1 + (scale - 1) * t.value },
      { rotate: `${Math.sin(Math.PI * t.value) * -6}deg` },
    ],
  }));

  return (
    <Animated.View
      pointerEvents="none"
      style={[{ position: 'absolute', left: from.x, top: from.y, width: from.width, height: from.height }, style]}
    >
      <CardBack width={from.width} />
    </Animated.View>
  );
}
