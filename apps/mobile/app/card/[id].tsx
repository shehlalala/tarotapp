import type { ReactNode } from 'react';
import { router, useLocalSearchParams } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getCard, getPositionLabel, type Orientation, type PositionId } from '@tarot/content';
import { CardFace } from '../../src/components/CardFace';
import { t } from '../../src/i18n';
import { colors, fonts, space } from '../../src/theme';

const POSITIONS: PositionId[] = ['past', 'present', 'future'];

/** Card detail: the longer, position-specific meaning, plus the general meaning. */
export default function CardDetailScreen() {
  const params = useLocalSearchParams<{ id: string; position?: string; orientation?: string }>();
  const card = getCard(params.id);
  const position = POSITIONS.find((p) => p === params.position);
  const orientation: Orientation = params.orientation === 'reversed' ? 'reversed' : 'upright';
  const orientationLabel = t(`reading.${orientation}`);

  return (
    <SafeAreaView style={styles.screen} edges={['bottom']}>
      <View style={styles.bar}>
        <Pressable onPress={() => router.back()} accessibilityRole="button" hitSlop={12}>
          <Text style={styles.close}>{t('detail.close')}</Text>
        </Pressable>
      </View>

      {!card ? (
        <Text style={styles.body}>{t('detail.notFound')}</Text>
      ) : (
        <ScrollView contentContainerStyle={styles.content}>
          <View style={styles.hero}>
            <CardFace card={card} width={170} orientation={orientation} />
          </View>

          <Text style={styles.kicker}>
            {position ? `${getPositionLabel(position)}  ·  ` : ''}
            {orientationLabel}
          </Text>
          <Text style={styles.title} accessibilityRole="header">
            {card.name}
          </Text>

          {position ? (
            <Section title={t('detail.inPosition', { position: getPositionLabel(position) })}>
              <Text style={styles.body}>{card.positions[position][orientation].long}</Text>
            </Section>
          ) : null}

          <Section title={t('detail.generalMeaning', { orientation: orientationLabel })}>
            <Text style={styles.body}>{card[orientation]}</Text>
          </Section>

          <Section title={t('detail.keywords')}>
            <View style={styles.chips}>
              {card.keywords[orientation].map((k) => (
                <Text key={k} style={styles.chip}>
                  {k}
                </Text>
              ))}
            </View>
          </Section>

          <Section title={t('detail.symbolism')}>
            <Text style={styles.body}>{card.symbolism}</Text>
          </Section>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle} accessibilityRole="header">
        {title}
      </Text>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  bar: { flexDirection: 'row', justifyContent: 'flex-end', paddingHorizontal: space.md, paddingTop: space.md },
  close: { color: colors.gold, fontSize: 16 },
  content: { padding: space.lg, paddingTop: space.sm, paddingBottom: space.xl * 2 },
  hero: { alignItems: 'center', marginBottom: space.lg },
  kicker: { color: colors.gold, fontSize: 12, letterSpacing: 1.5, textTransform: 'uppercase', textAlign: 'center' },
  title: { color: colors.text, fontFamily: fonts.serif, fontSize: 30, textAlign: 'center', marginTop: space.xs },
  section: { marginTop: space.lg, gap: space.sm },
  sectionTitle: { color: colors.gold, fontFamily: fonts.serif, fontSize: 18 },
  body: { color: colors.text, fontSize: 16, lineHeight: 25 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: space.sm },
  chip: {
    color: colors.textMuted,
    fontSize: 14,
    paddingHorizontal: space.md - 4,
    paddingVertical: space.xs + 2,
    borderRadius: 999,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    overflow: 'hidden',
  },
});
