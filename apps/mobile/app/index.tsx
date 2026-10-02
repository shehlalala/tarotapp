import { router } from 'expo-router';
import { useCallback, useMemo, useRef, useState } from 'react';
import { ScrollView, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { useReducedMotion } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { brand } from '@tarot/content';
import type { Rect } from '../src/animation/motion';
import { Deck } from '../src/components/Deck';
import { FlyingCard } from '../src/components/FlyingCard';
import { PrimaryButton } from '../src/components/PrimaryButton';
import { ReadingResult } from '../src/components/ReadingResult';
import { ShuffleAnimation } from '../src/components/ShuffleAnimation';
import { SlotRow } from '../src/components/SlotRow';
import { t } from '../src/i18n';
import { useReading } from '../src/reading/useReading';
import { colors, fonts, space } from '../src/theme';

interface Flight {
  key: number;
  slot: number;
  from: Rect;
  /** Unknown until the target slot has been measured. */
  to: Rect | null;
}

/** The reading starts on the first screen: no account, no onboarding. */
export default function ReadingScreen() {
  const { width } = useWindowDimensions();
  const reducedMotion = useReducedMotion();
  const { state, spread, filled, canReveal, pick, unslot, reveal, newReading } = useReading();
  const revealed = state.phase === 'revealed';
  const total = spread.positions.length;

  const [shuffling, setShuffling] = useState(true);
  const [shuffleRound, setShuffleRound] = useState(0);
  const [flights, setFlights] = useState<Flight[]>([]);
  const flightKey = useRef(0);
  const slotRefs = useRef<Array<View | null>>([]);
  const landing = useMemo(() => new Set(flights.map((f) => f.slot)), [flights]);

  const contentWidth = Math.min(width, 600);
  const slotWidth = Math.min(120, (contentWidth - space.md * 2 - space.md * (total - 1)) / total);
  const deckCardWidth = Math.min(84, width * 0.2);

  const finishShuffle = useCallback(() => setShuffling(false), []);

  const handlePick = useCallback(
    (id: string, from: Rect | null) => {
      const slot = pick(id);
      if (slot < 0 || !from || reducedMotion) return;
      const key = ++flightKey.current;
      setFlights((fs) => [...fs, { key, slot, from, to: null }]);
      const target = slotRefs.current[slot];
      if (!target) {
        setFlights((fs) => fs.filter((f) => f.key !== key));
        return;
      }
      target.measureInWindow((x, y, w, h) =>
        setFlights((fs) => fs.map((f) => (f.key === key ? { ...f, to: { x, y, width: w, height: h } } : f))),
      );
    },
    [pick, reducedMotion],
  );

  const handleUnslot = useCallback(
    (slot: number) => {
      setFlights((fs) => fs.filter((f) => f.slot !== slot));
      unslot(slot);
    },
    [unslot],
  );

  const handleNewReading = useCallback(() => {
    setFlights([]);
    newReading();
    setShuffleRound((n) => n + 1);
    setShuffling(true);
  }, [newReading]);

  const openDetail = useCallback(
    (index: number) => {
      const id = state.slots[index];
      const position = spread.positions[index];
      if (!id || !position) return;
      router.push({
        pathname: '/card/[id]',
        params: { id, position: position.id, orientation: state.orientation[id] ?? 'upright' },
      });
    },
    [spread, state],
  );

  let hint = t('reading.hintChoose');
  if (shuffling) hint = t('reading.shuffling');
  else if (canReveal) hint = t('reading.hintReady');
  else if (filled > 0) hint = t('reading.hintProgress', { count: filled, total });

  return (
    <View style={styles.root}>
      <SafeAreaView style={styles.screen} edges={['top', 'bottom']}>
        <Text style={styles.brand} accessibilityRole="header">
          {brand.appName}
        </Text>

        <View style={styles.slots}>
          <SlotRow
            spread={spread}
            state={state}
            cardWidth={slotWidth}
            slotRefs={slotRefs}
            landing={landing}
            reducedMotion={reducedMotion}
            onUnslot={handleUnslot}
            onOpen={openDetail}
          />
        </View>

        {revealed ? (
          <ScrollView style={styles.flex} contentContainerStyle={styles.result}>
            <ReadingResult spread={spread} state={state} onOpen={openDetail} />
          </ScrollView>
        ) : (
          <View style={[styles.flex, styles.deckArea]}>
            <Text style={styles.hint} accessibilityLiveRegion="polite">
              {hint}
            </Text>
            <View style={styles.deckSlot}>
              {shuffling ? (
                <ShuffleAnimation
                  key={shuffleRound}
                  cardWidth={deckCardWidth}
                  reducedMotion={reducedMotion}
                  onDone={finishShuffle}
                />
              ) : (
                <Deck deck={state.deck} slotted={state.slots} cardWidth={deckCardWidth} onPick={handlePick} />
              )}
            </View>
          </View>
        )}

        <View style={styles.footer}>
          {revealed ? (
            <PrimaryButton label={t('reading.newReading')} onPress={handleNewReading} />
          ) : (
            <PrimaryButton
              label={t('reading.reveal')}
              onPress={reveal}
              // Wait for in-flight cards to land so every card flips from its slot.
              disabled={!canReveal || flights.length > 0}
              disabledHint={t('a11y.revealDisabledHint')}
            />
          )}
        </View>
      </SafeAreaView>

      {/* Window-coordinate overlay for cards travelling from the deck to a slot. */}
      <View style={StyleSheet.absoluteFill} pointerEvents="none">
        {flights.map((f) =>
          f.to ? (
            <FlyingCard
              key={f.key}
              from={f.from}
              to={f.to}
              onDone={() => setFlights((fs) => fs.filter((x) => x.key !== f.key))}
            />
          ) : null,
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  screen: { flex: 1 },
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
  deckSlot: { minHeight: 180, justifyContent: 'center' },
  hint: { color: colors.textMuted, textAlign: 'center', fontSize: 15 },
  result: { padding: space.lg, paddingBottom: space.xl },
  footer: { paddingHorizontal: space.md, paddingVertical: space.md },
});
