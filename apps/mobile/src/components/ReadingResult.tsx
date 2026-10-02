import { StyleSheet, Text, View } from 'react-native';
import { getCard, getPositionLabel, type Spread } from '@tarot/content';
import { t } from '../i18n';
import type { ReadingState } from '../reading/reducer';
import { colors, fonts, space } from '../theme';

/** The short, position-specific meaning of each revealed card. */
export function ReadingResult({ spread, state }: { spread: Spread; state: ReadingState }) {
  return (
    <View style={styles.list}>
      {spread.positions.map((position, index) => {
        const id = state.slots[index];
        const card = id ? getCard(id) : undefined;
        if (!id || !card) return null;
        const orientation = state.orientation[id] ?? 'upright';
        return (
          <View key={position.id} style={styles.item}>
            <Text style={styles.position}>{getPositionLabel(position.id)}</Text>
            <Text style={styles.name}>
              {card.name}
              {orientation === 'reversed' ? <Text style={styles.reversed}>{`  ·  ${t('reading.reversed')}`}</Text> : null}
            </Text>
            <Text style={styles.meaning}>{card.positions[position.id][orientation].short}</Text>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  list: { gap: space.lg },
  item: { gap: space.xs },
  position: { color: colors.gold, fontSize: 12, letterSpacing: 1.5, textTransform: 'uppercase' },
  name: { color: colors.text, fontFamily: fonts.serif, fontSize: 20 },
  reversed: { color: colors.textMuted, fontSize: 14 },
  meaning: { color: colors.textMuted, fontSize: 15, lineHeight: 22 },
});
