import { Pressable, StyleSheet, Text } from 'react-native';
import { colors, fonts, radius, space } from '../theme';

interface Props {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  disabledHint?: string;
}

export function PrimaryButton({ label, onPress, disabled = false, disabledHint }: Props) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      accessibilityHint={disabled ? disabledHint : undefined}
      style={({ pressed }) => [styles.button, disabled && styles.disabled, pressed && styles.pressed]}
    >
      <Text style={[styles.label, disabled && styles.labelDisabled]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    alignSelf: 'center',
    minWidth: 220,
    paddingVertical: space.md - 2,
    paddingHorizontal: space.xl,
    borderRadius: radius.button,
    backgroundColor: colors.gold,
    alignItems: 'center',
  },
  disabled: { backgroundColor: colors.surfaceRaised },
  pressed: { opacity: 0.85 },
  label: { color: colors.bg, fontFamily: fonts.serif, fontSize: 17, letterSpacing: 0.5 },
  labelDisabled: { color: colors.textFaint },
});
