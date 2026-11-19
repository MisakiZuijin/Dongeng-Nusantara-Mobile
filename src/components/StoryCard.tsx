import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { StoryArtwork } from '@/components/StoryArtwork';
import { COLORS, FONTS, RADIUS, SHADOWS } from '@/constants/theme';
import type { StoryWithProgress } from '@/types/models';

interface StoryCardProps {
  story: StoryWithProgress;
  onPress: () => void;
  onToggleFavorite?: () => void;
  showFavoriteButton?: boolean;
  footerIcon?: 'play' | 'book';
}

export function StoryCard({
  story,
  onPress,
  onToggleFavorite,
  showFavoriteButton = false,
  footerIcon = 'play',
}: StoryCardProps) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.card, SHADOWS.card, pressed && styles.pressed]}
      accessibilityRole="button"
      accessibilityLabel={`Buka dongeng ${story.title}`}
    >
      <View style={styles.imageWrap}>
        <StoryArtwork
          artworkKey={story.artworkKey}
          badgeText={story.province}
          style={styles.artwork}
          size="md"
        />
        {showFavoriteButton && onToggleFavorite ? (
          <Pressable
            onPress={onToggleFavorite}
            hitSlop={12}
            style={styles.favBtn}
            accessibilityRole="button"
            accessibilityLabel="Ubah status favorit"
          >
            <MaterialIcons
              name={story.isFavorite ? 'favorite' : 'favorite-border'}
              size={16}
              color={story.isFavorite ? COLORS.sunsetOrange : COLORS.slateGray}
            />
          </Pressable>
        ) : null}
      </View>

      <View style={styles.body}>
        <Text style={styles.title} numberOfLines={1}>
          {story.title}
        </Text>
        <Text style={styles.synopsis} numberOfLines={2}>
          {story.synopsis}
        </Text>
      </View>

      <View style={styles.footer}>
        <Text style={styles.duration}>{story.durationMinutes} Menit</Text>
        <MaterialIcons
          name={footerIcon === 'book' ? 'auto-stories' : 'play-circle-filled'}
          size={20}
          color={COLORS.midnightBlue}
        />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.lg,
    padding: 12,
    borderWidth: 1,
    borderColor: COLORS.borderSoft,
    justifyContent: 'space-between',
    gap: 8,
  },
  pressed: {
    borderColor: COLORS.sunsetOrange,
    transform: [{ scale: 0.99 }],
  },
  imageWrap: {
    position: 'relative',
    width: '100%',
    aspectRatio: 4 / 3,
    borderRadius: RADIUS.md,
    overflow: 'hidden',
    backgroundColor: COLORS.warmCream,
  },
  artwork: {
    width: '100%',
    height: '100%',
  },
  favBtn: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'rgba(255, 255, 255, 0.92)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  body: {
    gap: 4,
  },
  title: {
    fontFamily: FONTS.bold,
    fontSize: 15,
    color: COLORS.midnightBlue,
  },
  synopsis: {
    fontFamily: FONTS.regular,
    fontSize: 12,
    lineHeight: 17,
    color: COLORS.slateGray,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderSoft,
  },
  duration: {
    fontFamily: FONTS.bold,
    fontSize: 12,
    color: COLORS.midnightBlue,
  },
});
