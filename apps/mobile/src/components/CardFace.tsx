import { StyleSheet, Text, View } from 'react-native';
import type { Card, Orientation } from '@tarot/content';
import { getCommonText } from '@tarot/content';
import { CARD_ASPECT, colors, fonts, radius } from '../theme';

const ROMAN = ['0', 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII', 'XIII', 'XIV', 'XV', 'XVI', 'XVII', 'XVIII', 'XIX', 'XX', 'XXI'];

/** Placeholder card face: numeral or suit, name, frame. Replaced by artwork later. */
export function CardFace({ card, width, orientation }: { card: Card; width: number; orientation: Orientation }) {
  const height = width / CARD_ASPECT;
  const common = getCommonText(card.locale);
  const top = card.arcana === 'major' ? ROMAN[card.number] : common.suits[card.suit!].name;
  const bottom = card.arcana === 'major' ? common.arcana.major.name : common.ranks[card.rank!];
  return (
    <View
      style={[styles.card, { width, height }, orientation === 'reversed' && styles.reversed]}
      accessible={false}
    >
      <View style={styles.frame}>
        <Text style={[styles.small, { fontSize: width * 0.1 }]} numberOfLines={1}>
          {top}
        </Text>
        <Text style={[styles.name, { fontSize: width * 0.14 }]} numberOfLines={3} adjustsFontSizeToFit>
          {card.name}
        </Text>
        <Text style={[styles.small, { fontSize: width * 0.08 }]} numberOfLines={1}>
          {bottom}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.cardFace,
    borderRadius: radius.card,
    borderWidth: 1,
    borderColor: colors.gold,
    padding: 5,
  },
  reversed: { transform: [{ rotate: '180deg' }] },
  frame: {
    flex: 1,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.goldMuted,
    borderRadius: radius.card - 3,
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  small: { color: colors.gold, fontFamily: fonts.serif, letterSpacing: 1 },
  name: { color: colors.text, fontFamily: fonts.serif, textAlign: 'center' },
});
