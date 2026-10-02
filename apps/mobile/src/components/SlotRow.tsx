import { Pressable, StyleSheet, Text, View } from 'react-native';
import { getCard, getPositionLabel, type Orientation, type Spread } from '@tarot/content';
import { t } from '../i18n';
import type { ReadingState } from '../reading/reducer';
import { CARD_ASPECT, colors, fonts, radius, space } from '../theme';
import { CardBack } from './CardBack';
import { CardFace } from './CardFace';

interface Props {
  spread: Spread;
  state: ReadingState;
  cardWidth: number;
  onUnslot: (index: number) => void;
}

export function SlotRow({ spread, state, cardWidth, onUnslot }: Props) {
  const revealed = state.phase === 'revealed';
  return (
    <View style={styles.row}>
      {spread.positions.map((position, index) => {
        const label = getPositionLabel(position.id);
        const id = state.slots[index] ?? null;
        const card = id ? getCard(id) : undefined;
        const orientation: Orientation = id ? (state.orientation[id] ?? 'upright') : 'upright';

        let a11yLabel = t('a11y.slotEmpty', { position: label });
        if (card && revealed) {
          a11yLabel = t('a11y.slotRevealed', { position: label, name: card.name, orientation: t(`reading.${orientation}`) });
        } else if (card) {
          a11yLabel = t('a11y.slotFilled', { position: label });
        }

        return (
          <View key={position.id} style={styles.slot}>
            <Text style={styles.label}>{label}</Text>
            <Pressable
              onPress={() => onUnslot(index)}
              disabled={!card || revealed}
              accessibilityRole={card && !revealed ? 'button' : undefined}
              accessibilityLabel={a11yLabel}
              accessibilityHint={card && !revealed ? t('a11y.slotFilledHint') : undefined}
              style={({ pressed }) => pressed && styles.pressed}
            >
              {card && revealed ? (
                <CardFace card={card} width={cardWidth} orientation={orientation} />
              ) : card ? (
                <CardBack width={cardWidth} />
              ) : (
                <View style={[styles.empty, { width: cardWidth, height: cardWidth / CARD_ASPECT }]} />
              )}
            </Pressable>
            <Text style={styles.orientation}>{card && revealed && orientation === 'reversed' ? t('reading.reversed') : ' '}</Text>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', justifyContent: 'space-evenly' },
  slot: { alignItems: 'center', gap: space.sm },
  label: { color: colors.gold, fontFamily: fonts.serif, fontSize: 16, letterSpacing: 1.5, textTransform: 'uppercase' },
  empty: {
    borderRadius: radius.card,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  orientation: { color: colors.textMuted, fontSize: 12, letterSpacing: 1, textTransform: 'uppercase' },
  pressed: { opacity: 0.7 },
});
