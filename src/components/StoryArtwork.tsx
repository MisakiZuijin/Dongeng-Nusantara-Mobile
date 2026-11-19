import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';
import { COLORS, FONTS } from '@/constants/theme';
import type { AvatarKey, StoryArtworkKey } from '@/types/models';

const KANCIL_AVATAR = require('../../assets/images/avatar_kancil.png');

interface StoryArtworkProps {
  artworkKey: StoryArtworkKey;
  style?: StyleProp<ViewStyle>;
  badgeText?: string;
  size?: 'sm' | 'md' | 'lg';
}

const ARTWORK_THEME: Record<
  StoryArtworkKey,
  {
    colors: [string, string];
    icon: keyof typeof MaterialIcons.glyphMap;
    accentColor: string;
    subtitle: string;
  }
> = {
  'timun-mas': {
    colors: ['#1E2246', '#FF7A45'],
    icon: 'auto-awesome',
    accentColor: COLORS.goldenAccent,
    subtitle: 'Jawa Tengah',
  },
  'sang-kancil': {
    colors: ['#262B5C', '#1B8E83'],
    icon: 'pets',
    accentColor: COLORS.goldenAccent,
    subtitle: 'Jawa Barat',
  },
  'danau-toba': {
    colors: ['#1B8E83', '#1E2246'],
    icon: 'waves',
    accentColor: '#E6F9F7',
    subtitle: 'Sumatera Utara',
  },
  'bawang-merah': {
    colors: ['#3A3F7A', '#FFB800'],
    icon: 'spa',
    accentColor: COLORS.warmCream,
    subtitle: 'Riau',
  },
  gamelan: {
    colors: ['#181B3A', '#3A3F7A'],
    icon: 'music-note',
    accentColor: COLORS.goldenAccent,
    subtitle: 'Gamelan Malam',
  },
  nature: {
    colors: ['#1E2246', '#1B8E83'],
    icon: 'nights-stay',
    accentColor: COLORS.goldenAccent,
    subtitle: 'Suara Alam',
  },
};

export function StoryArtwork({
  artworkKey,
  style,
  badgeText,
  size = 'md',
}: StoryArtworkProps) {
  const theme = ARTWORK_THEME[artworkKey];
  const iconSize = size === 'sm' ? 28 : size === 'lg' ? 68 : 42;

  return (
    <LinearGradient
      colors={theme.colors}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[styles.container, style]}
    >
      <View style={styles.glowCircle} />
      {artworkKey === 'sang-kancil' && size !== 'sm' ? (
        <Image source={KANCIL_AVATAR} style={styles.kancilFill} contentFit="cover" />
      ) : (
        <View style={styles.centerContent}>
          <View style={styles.iconOrb}>
            <MaterialIcons name={theme.icon} size={iconSize} color={theme.accentColor} />
          </View>
          {size === 'lg' ? <Text style={styles.subLabel}>{theme.subtitle}</Text> : null}
        </View>
      )}
      {badgeText ? (
        <View style={styles.badge}>
          <Text style={styles.badgeText} numberOfLines={1}>
            {badgeText}
          </Text>
        </View>
      ) : null}
    </LinearGradient>
  );
}

export function ProfileAvatar({
  avatarKey,
  size = 84,
}: {
  avatarKey: AvatarKey;
  size?: number;
}) {
  if (avatarKey === 'kancil') {
    return (
      <Image
        source={KANCIL_AVATAR}
        style={{ width: size, height: size, borderRadius: size / 2 }}
        contentFit="cover"
      />
    );
  }

  const iconMap: Record<Exclude<AvatarKey, 'kancil'>, keyof typeof MaterialIcons.glyphMap> = {
    cendrawasih: 'flutter-dash',
    komodo: 'pets',
    jalak: 'auto-stories',
  };
  const bgMap: Record<Exclude<AvatarKey, 'kancil'>, string> = {
    cendrawasih: COLORS.emeraldLeaf,
    komodo: COLORS.sunsetOrange,
    jalak: COLORS.twilightPurple,
  };

  return (
    <View
      style={[
        styles.avatarFallback,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: bgMap[avatarKey],
        },
      ]}
    >
      <MaterialIcons
        name={iconMap[avatarKey]}
        size={Math.round(size * 0.46)}
        color={COLORS.goldenAccent}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  glowCircle: {
    position: 'absolute',
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: 'rgba(255, 209, 102, 0.16)',
  },
  centerContent: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  iconOrb: {
    padding: 12,
    borderRadius: 999,
    backgroundColor: 'rgba(255, 255, 255, 0.14)',
  },
  subLabel: {
    fontFamily: FONTS.bold,
    fontSize: 13,
    color: COLORS.warmCreamAlt,
    letterSpacing: 0.4,
  },
  kancilFill: {
    width: '100%',
    height: '100%',
  },
  badge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: 'rgba(30, 34, 70, 0.88)',
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  badgeText: {
    fontFamily: FONTS.semiBold,
    fontSize: 10,
    color: COLORS.white,
  },
  avatarFallback: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
