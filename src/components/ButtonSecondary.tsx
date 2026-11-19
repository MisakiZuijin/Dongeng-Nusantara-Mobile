import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import React from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { COLORS, FONTS, RADIUS } from '@/constants/theme';

interface ButtonSecondaryProps {
  label: string;
  onPress: () => void;
  iconName?: keyof typeof MaterialIcons.glyphMap;
  style?: StyleProp<ViewStyle>;
}

export function ButtonSecondary({
  label,
  onPress,
  iconName,
  style,
}: ButtonSecondaryProps) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.button, pressed && styles.pressed, style]}
      accessibilityRole="button"
      accessibilityLabel={label}
    >
      {iconName ? (
        <MaterialIcons name={iconName} size={20} color={COLORS.midnightBlue} />
      ) : null}
      <Text style={styles.label}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    minHeight: 50,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.white,
    borderWidth: 2,
    borderColor: COLORS.midnightBlue,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingHorizontal: 18,
    paddingVertical: 12,
  },
  pressed: {
    backgroundColor: COLORS.warmCreamAlt,
    transform: [{ scale: 0.98 }],
  },
  label: {
    fontFamily: FONTS.bold,
    fontSize: 14,
    color: COLORS.midnightBlue,
  },
});
