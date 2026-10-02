import type { RefObject } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { getCard, getPositionLabel, type Orientation, type Spread } from '@tarot/content';
import { flipDelay, flipEnd } from '../animation/motion';
import { t } from '../i18n';
import type { ReadingState } from '../reading/reducer';
import { CARD_ASPECT, colors, fonts, radius, space } from '../theme';
import { CardBack } from './CardBack';
import { CardFace } from './CardFace';
import { FlipCard } from './FlipCard';

interface Props {
  spread: Spread;
  state: ReadingState;
  cardWidth: number;
  /** Filled in with each slot's card-sized view, so cards can fly to it. */
  slotRefs: RefObject<Array<View | null>>;
  /** Slots whose card is still in flight; drawn empty until it lands. */
  landing: ReadonlySet<number>;
  reducedMotion: boolean;
  onUnslot: (index: number) => void;
  onOpen: (index: number) => void;
}

export function SlotRow({ spread, state, cardWidth, slotRefs, landing, reducedMotion, onUnslot, onOpen }: Props) {
  const revealed = state.phase === 'revealed';
  const height = cardWidth / CARD_ASPECT;

  return (
    <View style={styles.row}>
      {spread.positions.map((position, index) => {
        const label = getPositionLabel(position.id);
        const id = state.slots[index] ?? null;
        const card = id ? getCard(id) : undefined;
        const orientation: Orientation = id ? (state.orientation[id] ?? 'upright') : 'upright';
        const showCard = card && !landing.has(index);

        let a11yLabel = t('a11y.slotEmpty', { position: label });
        let a11yHint: string | undefined;
        if (card && revealed) {
          a11yLabel = t('a11y.slotRevealed', { position: label, name: card.name, orientation: t(`reading.${orientation}`) });
          a11yHint = t('a11y.slotRevealedHint');
        } else if (card) {
          a11yLabel = t('a11y.slotFilled', { position: label });
          a11yHint = t('a11y.slotFilledHint');
        }

        return (
          <View key={position.id} style={styles.slot}>
            <Text style={styles.label}>{label}</Text>
            <Pressable
              onPress={() => (revealed ? onOpen(index) : onUnslot(index))}
              disabled={!card}
              accessibilityRole={card ? 'button' : undefined}
              accessibilityLabel={a11yLabel}
              accessibilityHint={a11yHint}
              style={({ pressed }) => pressed && styles.pressed}
            >
              <View
                ref={(node) => {
                  slotRefs.current[index] = node;
                }}
                collapsable={false}
                style={[{ width: cardWidth, height }, !showCard && styles.empty]}
              >
                {showCard ? (
                  <FlipCard
                    width={cardWidth}
                    height={height}
                    flipped={revealed}
                    delay={flipDelay(index)}
                    reducedMotion={reducedMotion}
                    back={<CardBack width={cardWidth} />}
                    front={<CardFace card={card} width={cardWidth} orientation={orientation} />}
                  />
                ) : null}
              </View>
            </Pressable>
            {card && revealed ? (
              <Animated.Text entering={FadeIn.delay(flipEnd(index)).duration(300)} style={styles.orientation}>
                {t(`reading.${orientation}`)}
              </Animated.Text>
            ) : (
              <Text style={styles.orientation}> </Text>
            )}
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
