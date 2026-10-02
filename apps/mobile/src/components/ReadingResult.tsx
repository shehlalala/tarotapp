import { Pressable, StyleSheet, Text } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { getCard, getPositionLabel, type Spread } from '@tarot/content';
import { flipEnd } from '../animation/motion';
import { t } from '../i18n';
import type { ReadingState } from '../reading/reducer';
import { colors, fonts, space } from '../theme';

interface Props {
  spread: Spread;
  state: ReadingState;
  onOpen: (index: number) => void;
}

/** The short, position-specific meaning of each card, appearing as its flip finishes. */
export function ReadingResult({ spread, state, onOpen }: Props) {
  return (
    <>
      {spread.positions.map((position, index) => {
        const id = state.slots[index];
        const card = id ? getCard(id) : undefined;
        if (!id || !card) return null;
        const orientation = state.orientation[id] ?? 'upright';
        return (
          <Animated.View key={position.id} entering={FadeInDown.delay(flipEnd(index)).duration(400)}>
            <Pressable
              onPress={() => onOpen(index)}
              accessibilityRole="button"
              accessibilityHint={t('a11y.resultHint')}
              style={({ pressed }) => [styles.item, pressed && styles.pressed]}
            >
              <Text style={styles.position}>{getPositionLabel(position.id)}</Text>
              <Text style={styles.name}>
                {card.name}
                {orientation === 'reversed' ? <Text style={styles.reversed}>{`  ·  ${t('reading.reversed')}`}</Text> : null}
              </Text>
              <Text style={styles.meaning}>{card.positions[position.id][orientation].short}</Text>
              <Text style={styles.more}>›</Text>
            </Pressable>
          </Animated.View>
        );
      })}
    </>
  );
}

const styles = StyleSheet.create({
  item: {
    gap: space.xs,
    padding: space.md,
    paddingRight: space.xl,
    marginBottom: space.md,
    borderRadius: 12,
    backgroundColor: colors.surface,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
  },
  pressed: { backgroundColor: colors.surfaceRaised },
  position: { color: colors.gold, fontSize: 12, letterSpacing: 1.5, textTransform: 'uppercase' },
  name: { color: colors.text, fontFamily: fonts.serif, fontSize: 20 },
  reversed: { color: colors.textMuted, fontSize: 14 },
  meaning: { color: colors.textMuted, fontSize: 15, lineHeight: 22 },
  more: { position: 'absolute', right: space.md, top: '50%', color: colors.goldMuted, fontSize: 24, marginTop: -14 },
});
