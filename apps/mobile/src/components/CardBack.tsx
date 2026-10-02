import { StyleSheet, Text, View } from 'react-native';
import { CARD_ASPECT, colors, radius } from '../theme';

/** Placeholder card back: inset gold frame around a star. Replaced by artwork later. */
export function CardBack({ width }: { width: number }) {
  const height = width / CARD_ASPECT;
  const inset = Math.max(3, width * 0.07);
  return (
    <View style={[styles.card, { width, height }]}>
      <View style={[styles.frame, { top: inset, left: inset, right: inset, bottom: inset }]}>
        <View style={[styles.ring, { width: width * 0.46, height: width * 0.46, borderRadius: width }]}>
          <Text style={[styles.star, { fontSize: width * 0.26 }]}>✦</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.cardBack,
    borderRadius: radius.card,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.goldMuted,
    shadowColor: '#000',
    shadowOpacity: 0.4,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 4,
  },
  frame: {
    position: 'absolute',
    borderWidth: 1,
    borderColor: colors.goldMuted,
    borderRadius: radius.card - 3,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ring: {
    borderWidth: 1,
    borderColor: colors.gold,
    alignItems: 'center',
    justifyContent: 'center',
  },
  star: { color: colors.gold, includeFontPadding: false },
});
