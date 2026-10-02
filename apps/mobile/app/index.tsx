import { router } from 'expo-router';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Platform, Pressable, ScrollView, Share, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { useReducedMotion } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { brand, getCard, getPositionLabel } from '@tarot/content';
import type { Rect } from '../src/animation/motion';
import { Deck } from '../src/components/Deck';
import { FlyingCard } from '../src/components/FlyingCard';
import { PrimaryButton } from '../src/components/PrimaryButton';
import { ReadingResult } from '../src/components/ReadingResult';
import { ShuffleAnimation } from '../src/components/ShuffleAnimation';
import { SlotRow } from '../src/components/SlotRow';
import { newReadingId } from '../src/history/model';
import { saveReading } from '../src/history/storage';
import { t } from '../src/i18n';
import { buildShareText } from '../src/reading/shareText';
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

  const handleReveal = useCallback(() => {
    if (!canReveal) return;
    reveal();
    void saveReading({
      id: newReadingId(new Date()),
      date: new Date().toISOString(),
      spreadId: spread.id,
      cards: spread.positions.map((p, i) => {
        const id = state.slots[i]!;
        return { id, position: p.id, orientation: state.orientation[id] ?? 'upright' };
      }),
    });
  }, [canReveal, reveal, spread, state]);

  const [toast, setToast] = useState<string | null>(null);
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 3000);
    return () => clearTimeout(timer);
  }, [toast]);

  const handleShare = useCallback(() => {
    const lines = spread.positions.flatMap((p, i) => {
      const id = state.slots[i];
      const card = id ? getCard(id) : undefined;
      if (!id || !card) return [];
      const orientation = state.orientation[id] ?? 'upright';
      return [
        {
          position: getPositionLabel(p.id),
          name: card.name,
          reversedNote: orientation === 'reversed' ? t('share.reversedNote') : null,
          meaning: card.positions[p.id][orientation].short,
        },
      ];
    });
    const message = buildShareText(t('share.title'), lines, t('share.footer', { appName: brand.appName, url: brand.siteUrl }));
    // Browsers without a share sheet (and embedded previews) get a clipboard copy instead.
    // This must run synchronously inside the tap for the clipboard to accept it.
    const webNav = typeof navigator === 'undefined' ? undefined : (navigator as Partial<Navigator>);
    if (Platform.OS === 'web' && webNav && !webNav.share) {
      webNav.clipboard?.writeText(message).then(
        () => setToast(t('share.copied')),
        () => undefined,
      );
      return;
    }
    Share.share({ message }).catch(() => undefined);
  }, [spread, state]);

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
        <View style={styles.topBar}>
          <Pressable onPress={() => router.push('/history')} accessibilityRole="button" hitSlop={10} style={styles.navSide}>
            <Text style={styles.navLink}>{t('nav.history')}</Text>
          </Pressable>
          <Text style={styles.brand} accessibilityRole="header" numberOfLines={1}>
            {brand.appName}
          </Text>
          <Pressable
            onPress={() => router.push('/about')}
            accessibilityRole="button"
            hitSlop={10}
            style={[styles.navSide, styles.navRight]}
          >
            <Text style={styles.navLink}>{t('nav.about')}</Text>
          </Pressable>
        </View>

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
          {toast ? (
            <Text style={styles.toast} accessibilityLiveRegion="polite">
              {toast}
            </Text>
          ) : null}
          {revealed ? (
            <View style={styles.actions}>
              <PrimaryButton label={t('share.button')} onPress={handleShare} variant="secondary" />
              <PrimaryButton label={t('reading.newReading')} onPress={handleNewReading} />
            </View>
          ) : (
            <PrimaryButton
              label={t('reading.reveal')}
              onPress={handleReveal}
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
  topBar: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: space.md, marginTop: space.sm },
  navSide: { width: 72 },
  navRight: { alignItems: 'flex-end' },
  navLink: { color: colors.gold, fontSize: 15 },
  brand: {
    flex: 1,
    color: colors.textMuted,
    fontFamily: fonts.serif,
    fontSize: 15,
    letterSpacing: 3,
    textAlign: 'center',
    textTransform: 'uppercase',
  },
  slots: { paddingTop: space.lg, paddingHorizontal: space.md },
  deckArea: { justifyContent: 'center' },
  deckSlot: { minHeight: 180, justifyContent: 'center' },
  hint: { color: colors.textMuted, textAlign: 'center', fontSize: 15 },
  result: { padding: space.lg, paddingBottom: space.xl },
  footer: { paddingHorizontal: space.md, paddingVertical: space.md, gap: space.sm },
  actions: { flexDirection: 'row', justifyContent: 'center', gap: space.sm },
  toast: { color: colors.textMuted, fontSize: 14, textAlign: 'center' },
});
