import { router, useFocusEffect } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getCard, getPositionLabel } from '@tarot/content';
import { ScreenHeader } from '../src/components/ScreenHeader';
import type { SavedCard, SavedReading } from '../src/history/model';
import { clearHistory, loadHistory } from '../src/history/storage';
import { t } from '../src/i18n';
import { colors, fonts, space } from '../src/theme';

const CONFIRM_WINDOW_MS = 3000;

export default function HistoryScreen() {
  const [readings, setReadings] = useState<SavedReading[] | null>(null);
  const [confirming, setConfirming] = useState(false);

  useFocusEffect(
    useCallback(() => {
      let active = true;
      loadHistory().then((list) => active && setReadings(list));
      return () => {
        active = false;
      };
    }, []),
  );

  // Two-tap confirmation built into the page: system dialogs are not available everywhere.
  useEffect(() => {
    if (!confirming) return;
    const timer = setTimeout(() => setConfirming(false), CONFIRM_WINDOW_MS);
    return () => clearTimeout(timer);
  }, [confirming]);

  const onClear = async () => {
    if (!confirming) return setConfirming(true);
    setConfirming(false);
    await clearHistory();
    setReadings([]);
  };

  return (
    <SafeAreaView style={styles.screen} edges={['top', 'bottom']}>
      <ScreenHeader title={t('history.title')} />
      {readings === null ? null : readings.length === 0 ? (
        <Text style={styles.empty}>{t('history.empty')}</Text>
      ) : (
        <FlatList
          data={readings}
          keyExtractor={(r) => r.id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => <ReadingRow reading={item} />}
          ListFooterComponent={
            <Pressable onPress={onClear} accessibilityRole="button" style={styles.clear} hitSlop={8}>
              <Text style={[styles.clearText, confirming && styles.clearConfirm]}>
                {confirming ? t('history.clearConfirm') : t('history.clear')}
              </Text>
            </Pressable>
          }
        />
      )}
    </SafeAreaView>
  );
}

function ReadingRow({ reading }: { reading: SavedReading }) {
  const date = new Date(reading.date);
  return (
    <View style={styles.row}>
      <Text style={styles.date}>
        {date.toLocaleDateString(undefined, { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}
        {'  ·  '}
        {date.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })}
      </Text>
      {reading.cards.map((c) => (
        <CardLine key={c.position} saved={c} />
      ))}
    </View>
  );
}

function CardLine({ saved }: { saved: SavedCard }) {
  const card = getCard(saved.id);
  if (!card) return null;
  const reversed = saved.orientation === 'reversed';
  return (
    <Pressable
      onPress={() =>
        router.push({ pathname: '/card/[id]', params: { id: saved.id, position: saved.position, orientation: saved.orientation } })
      }
      accessibilityRole="button"
      style={({ pressed }) => [styles.cardLine, pressed && styles.pressed]}
    >
      <Text style={styles.position}>{getPositionLabel(saved.position)}</Text>
      <Text style={styles.name}>
        {card.name}
        {reversed ? <Text style={styles.reversed}>{`  ·  ${t('reading.reversed')}`}</Text> : null}
      </Text>
      <Text style={styles.more}>›</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  empty: { color: colors.textMuted, fontSize: 16, lineHeight: 24, textAlign: 'center', padding: space.xl },
  list: { padding: space.md, gap: space.md },
  row: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    paddingVertical: space.sm,
  },
  date: { color: colors.textMuted, fontSize: 13, paddingHorizontal: space.md, paddingVertical: space.sm },
  cardLine: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: space.md, paddingVertical: space.sm, gap: space.md },
  pressed: { backgroundColor: colors.surfaceRaised },
  position: { width: 64, color: colors.gold, fontSize: 11, letterSpacing: 1.2, textTransform: 'uppercase' },
  name: { flex: 1, color: colors.text, fontFamily: fonts.serif, fontSize: 17 },
  reversed: { color: colors.textMuted, fontSize: 13 },
  more: { color: colors.goldMuted, fontSize: 20 },
  clear: { alignSelf: 'center', padding: space.md, marginTop: space.sm },
  clearText: { color: colors.textFaint, fontSize: 14 },
  clearConfirm: { color: colors.gold },
});
