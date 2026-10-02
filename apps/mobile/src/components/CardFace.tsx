import { Image, StyleSheet, Text, View } from 'react-native';
import type { Card, Orientation } from '@tarot/content';
import { getCardImage, getCommonText } from '@tarot/content';
import { CARD_ASPECT, colors, fonts, radius } from '../theme';

const ROMAN = ['0', 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII', 'XIII', 'XIV', 'XV', 'XVI', 'XVII', 'XVIII', 'XIX', 'XX', 'XXI'];

/** Card face: the Rider-Waite-Smith artwork when bundled, otherwise placeholder art. */
export function CardFace({ card, width, orientation }: { card: Card; width: number; orientation: Orientation }) {
  const height = width / CARD_ASPECT;
  const image = getCardImage(card.id);
  if (image !== undefined) {
    return (
      <View style={[styles.artCard, { width, height }, orientation === 'reversed' && styles.reversed]}>
        <Image
          source={image}
          style={styles.art}
          resizeMode="cover"
          accessibilityLabel={card.imageAlt}
          accessibilityIgnoresInvertColors
        />
      </View>
    );
  }
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
  artCard: { borderRadius: radius.card, overflow: 'hidden', borderWidth: 1, borderColor: colors.goldMuted, backgroundColor: colors.cardFace },
  art: { width: '100%', height: '100%' },
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
