import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { t } from '../i18n';
import { colors, fonts, space } from '../theme';

/** Back button + title for secondary screens (the stack runs without native headers). */
export function ScreenHeader({ title }: { title: string }) {
  return (
    <View style={styles.bar}>
      <Pressable
        onPress={() => (router.canGoBack() ? router.back() : router.replace('/'))}
        accessibilityRole="button"
        accessibilityLabel={t('nav.back')}
        hitSlop={12}
        style={styles.side}
      >
        <Text style={styles.back}>‹ {t('nav.back')}</Text>
      </Pressable>
      <Text style={styles.title} accessibilityRole="header" numberOfLines={1}>
        {title}
      </Text>
      <View style={styles.side} />
    </View>
  );
}

const styles = StyleSheet.create({
  bar: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: space.md, paddingVertical: space.sm },
  side: { width: 80 },
  back: { color: colors.gold, fontSize: 16 },
  title: { flex: 1, textAlign: 'center', color: colors.text, fontFamily: fonts.serif, fontSize: 18 },
});
