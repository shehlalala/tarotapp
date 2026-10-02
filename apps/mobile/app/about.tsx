import Constants from 'expo-constants';
import type { ReactNode } from 'react';
import { Linking, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { brand } from '@tarot/content';
import { ScreenHeader } from '../src/components/ScreenHeader';
import { t } from '../src/i18n';
import { colors, fonts, space } from '../src/theme';

export default function AboutScreen() {
  const privacyUrl = `${brand.siteUrl}/privacy`;
  const version = Constants.expoConfig?.version ?? '';
  return (
    <SafeAreaView style={styles.screen} edges={['top', 'bottom']}>
      <ScreenHeader title={t('about.title')} />
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.appName}>{brand.appName}</Text>
        <Text style={styles.tagline}>{brand.tagline}</Text>

        <Section title={t('about.entertainmentTitle')}>
          <Text style={styles.body}>{t('about.entertainment')}</Text>
        </Section>

        <Section title={t('about.privacyTitle')}>
          <Text style={styles.body}>{t('about.privacy')}</Text>
          <Pressable onPress={() => Linking.openURL(privacyUrl)} accessibilityRole="link" hitSlop={8}>
            <Text style={styles.link}>{t('about.privacyLink')}</Text>
          </Pressable>
          <Text style={styles.url} selectable>
            {privacyUrl}
          </Text>
        </Section>

        <Section title={t('about.deckTitle')}>
          <Text style={styles.body}>{t('about.deck')}</Text>
        </Section>

        {version ? <Text style={styles.version}>{t('about.version', { version })}</Text> : null}
      </ScrollView>
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
  content: { padding: space.lg, paddingBottom: space.xl * 2, gap: space.lg },
  appName: { color: colors.text, fontFamily: fonts.serif, fontSize: 28, textAlign: 'center' },
  tagline: { color: colors.textMuted, fontSize: 16, lineHeight: 24, textAlign: 'center' },
  section: { gap: space.sm },
  sectionTitle: { color: colors.gold, fontFamily: fonts.serif, fontSize: 18 },
  body: { color: colors.text, fontSize: 16, lineHeight: 25 },
  link: { color: colors.gold, fontSize: 16, textDecorationLine: 'underline' },
  url: { color: colors.textFaint, fontSize: 13 },
  version: { color: colors.textFaint, fontSize: 13, textAlign: 'center' },
});
