import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import React from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { COLORS, FONTS, RADIUS, SHADOWS } from '@/constants/theme';

interface ButtonPrimaryProps {
  label: string;
  onPress: () => void;
  iconName?: keyof typeof MaterialIcons.glyphMap;
  trailingIconName?: keyof typeof MaterialIcons.glyphMap;
  style?: StyleProp<ViewStyle>;
  disabled?: boolean;
}

export function ButtonPrimary({
  label,
  onPress,
  iconName,
  trailingIconName,
  style,
  disabled = false,
}: ButtonPrimaryProps) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.button,
        SHADOWS.cta,
        pressed && styles.pressed,
        disabled && styles.disabled,
        style,
      ]}
      accessibilityRole="button"
      accessibilityLabel={label}
    >
      {iconName ? (
        <MaterialIcons name={iconName} size={20} color={COLORS.white} />
      ) : null}
      <Text style={styles.label}>{label}</Text>
      {trailingIconName ? (
        <MaterialIcons name={trailingIconName} size={20} color={COLORS.white} />
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    minHeight: 52,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.sunsetOrange,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingHorizontal: 24,
    paddingVertical: 14,
  },
  pressed: {
    backgroundColor: COLORS.sunsetOrangeHover,
    transform: [{ scale: 0.98 }],
  },
  disabled: {
    opacity: 0.55,
  },
  label: {
    fontFamily: FONTS.bold,
    fontSize: 16,
    color: COLORS.white,
    letterSpacing: 0.2,
  },
});
