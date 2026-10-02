import { ScrollView, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { brand } from '@tarot/content';
import { Deck } from '../src/components/Deck';
import { PrimaryButton } from '../src/components/PrimaryButton';
import { ReadingResult } from '../src/components/ReadingResult';
import { SlotRow } from '../src/components/SlotRow';
import { t } from '../src/i18n';
import { useReading } from '../src/reading/useReading';
import { colors, fonts, space } from '../src/theme';

/** The reading starts on the first screen: no account, no onboarding. */
export default function ReadingScreen() {
  const { width } = useWindowDimensions();
  const { state, spread, filled, canReveal, pick, unslot, reveal, newReading } = useReading();
  const revealed = state.phase === 'revealed';
  const total = spread.positions.length;

  const contentWidth = Math.min(width, 600);
  const slotWidth = Math.min(120, (contentWidth - space.md * 2 - space.md * (total - 1)) / total);
  const deckCardWidth = Math.min(84, width * 0.2);

  const hint = filled === 0 ? t('reading.hintChoose') : canReveal ? t('reading.hintReady') : t('reading.hintProgress', { count: filled, total });

  return (
    <SafeAreaView style={styles.screen} edges={['top', 'bottom']}>
      <Text style={styles.brand} accessibilityRole="header">
        {brand.appName}
      </Text>

      <View style={styles.slots}>
        <SlotRow spread={spread} state={state} cardWidth={slotWidth} onUnslot={unslot} />
      </View>

      {revealed ? (
        <ScrollView style={styles.flex} contentContainerStyle={styles.result}>
          <ReadingResult spread={spread} state={state} />
        </ScrollView>
      ) : (
        <View style={[styles.flex, styles.deckArea]}>
          <Text style={styles.hint} accessibilityLiveRegion="polite">
            {hint}
          </Text>
          <Deck deck={state.deck} slotted={state.slots} cardWidth={deckCardWidth} onPick={pick} />
        </View>
      )}

      <View style={styles.footer}>
        {revealed ? (
          <PrimaryButton label={t('reading.newReading')} onPress={newReading} />
        ) : (
          <PrimaryButton
            label={t('reading.reveal')}
            onPress={reveal}
            disabled={!canReveal}
            disabledHint={t('a11y.revealDisabledHint')}
          />
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  flex: { flex: 1 },
  brand: {
    color: colors.textMuted,
    fontFamily: fonts.serif,
    fontSize: 15,
    letterSpacing: 3,
    textAlign: 'center',
    textTransform: 'uppercase',
    marginTop: space.sm,
  },
  slots: { paddingTop: space.lg, paddingHorizontal: space.md },
  deckArea: { justifyContent: 'center' },
  hint: { color: colors.textMuted, textAlign: 'center', fontSize: 15 },
  result: { padding: space.lg, paddingBottom: space.xl },
  footer: { paddingHorizontal: space.md, paddingVertical: space.md },
});
