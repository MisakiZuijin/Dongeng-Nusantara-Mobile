import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AddProfileModal } from '@/components/AddProfileModal';
import { ParentalGateModal } from '@/components/ParentalGateModal';
import { ProfileAvatar } from '@/components/StoryArtwork';
import { COLORS, FONTS, RADIUS } from '@/constants/theme';
import { useSessionStore } from '@/store/useSessionStore';

export default function ProfilePickerScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const profiles = useSessionStore((s) => s.profiles);
  const selectProfile = useSessionStore((s) => s.selectProfile);
  const addChildProfile = useSessionStore((s) => s.addChildProfile);

  const [addModalVisible, setAddModalVisible] = useState(false);
  const [gateVisible, setGateVisible] = useState(false);

  const handleChooseProfile = async (profileId: string) => {
    await selectProfile(profileId);
    router.replace('/(drawer)/home');
  };

  return (
    <View
      style={[
        styles.root,
        { paddingTop: Math.max(insets.top, 16), paddingBottom: Math.max(insets.bottom, 24) },
      ]}
    >
      <StatusBar style="light" />

      <View style={styles.topRow}>
        <Pressable
          onPress={() =>
            router.canGoBack() ? router.back() : router.replace('/(auth)/sign-in')
          }
          hitSlop={10}
          style={styles.backBtn}
        >
          <MaterialIcons name="arrow-back" size={20} color={COLORS.warmCream} />
        </Pressable>

        <View style={styles.nightPill}>
          <MaterialIcons name="bedtime" size={15} color={COLORS.goldenAccent} />
          <Text style={styles.nightPillText}>Waktu Dongeng</Text>
        </View>
      </View>

      <View style={styles.headerCopy}>
        <View style={styles.bookBadge}>
          <MaterialIcons name="auto-stories" size={26} color={COLORS.goldenAccent} />
        </View>
        <Text style={styles.title}>Siapa yang Mau Membaca Hari Ini?</Text>
        <Text style={styles.subtitle}>
          Pilih profil petualang cilik untuk menyesuaikan cerita dan suara narasi favorit.
        </Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.gridContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.grid}>
          {profiles.map((profile, index) => {
            const isOrange = index % 2 === 0;
            return (
              <Pressable
                key={profile.id}
                onPress={() => handleChooseProfile(profile.id)}
                style={[
                  styles.profileCard,
                  {
                    borderColor: isOrange
                      ? 'rgba(255, 122, 69, 0.7)'
                      : 'rgba(27, 142, 131, 0.7)',
                  },
                ]}
              >
                <View
                  style={[
                    styles.avatarRing,
                    {
                      borderColor: isOrange ? COLORS.sunsetOrange : COLORS.emeraldLeaf,
                    },
                  ]}
                >
                  <ProfileAvatar avatarKey={profile.avatarKey} size={86} />
                  <View
                    style={[
                      styles.levelBadge,
                      {
                        backgroundColor: isOrange
                          ? COLORS.sunsetOrange
                          : COLORS.emeraldLeaf,
                      },
                    ]}
                  >
                    <MaterialIcons
                      name={isOrange ? 'star' : 'auto-stories'}
                      size={13}
                      color={COLORS.white}
                    />
                  </View>
                </View>

                <Text style={styles.profileName} numberOfLines={1}>
                  {profile.name} ({profile.ageYears} Tahun)
                </Text>
                <Text style={styles.profileLevel}>
                  Level {profile.readingLevel} •{' '}
                  {profile.ageBracket === '3-5' ? 'Cerita Gambar' : 'Cerita Bab'}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <Pressable
          onPress={() => setAddModalVisible(true)}
          style={styles.addBtn}
        >
          <View style={styles.addPlusCircle}>
            <MaterialIcons name="add" size={20} color={COLORS.goldenAccent} />
          </View>
          <Text style={styles.addText}>Tambah Profil Anak</Text>
        </Pressable>
      </ScrollView>

      <View style={styles.footer}>
        <Pressable onPress={() => setGateVisible(true)} style={styles.parentBtn}>
          <MaterialIcons name="lock" size={16} color={COLORS.slateGrayLight} />
          <Text style={styles.parentText}>Mode Orang Tua • Keamanan Akun</Text>
        </Pressable>
      </View>

      <AddProfileModal
        visible={addModalVisible}
        onClose={() => setAddModalVisible(false)}
        onCreate={async (input) => {
          const created = await addChildProfile(input);
          await handleChooseProfile(created.id);
        }}
      />

      <ParentalGateModal
        visible={gateVisible}
        onClose={() => setGateVisible(false)}
        onVerified={async () => {
          const first = profiles[0];
          if (first) await selectProfile(first.id);
          router.replace('/(drawer)/parent-settings');
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: COLORS.midnightBlue,
    paddingHorizontal: 24,
    justifyContent: 'space-between',
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.18)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  nightPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: RADIUS.full,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.16)',
  },
  nightPillText: {
    fontFamily: FONTS.semiBold,
    fontSize: 12,
    color: COLORS.goldenAccent,
  },
  headerCopy: {
    alignItems: 'center',
    gap: 8,
    marginTop: 12,
  },
  bookBadge: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 184, 0, 0.2)',
    borderWidth: 1,
    borderColor: 'rgba(255, 209, 102, 0.45)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 2,
  },
  title: {
    fontFamily: FONTS.bold,
    fontSize: 22,
    lineHeight: 28,
    color: COLORS.warmCreamAlt,
    textAlign: 'center',
    maxWidth: 280,
  },
  subtitle: {
    fontFamily: FONTS.regular,
    fontSize: 13,
    lineHeight: 19,
    color: 'rgba(255, 249, 240, 0.8)',
    textAlign: 'center',
    maxWidth: 290,
  },
  gridContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 16,
    gap: 20,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 14,
    width: '100%',
  },
  profileCard: {
    width: '46%',
    minWidth: 144,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderRadius: RADIUS.xl,
    borderWidth: 2,
    paddingVertical: 16,
    paddingHorizontal: 10,
    alignItems: 'center',
    gap: 8,
  },
  avatarRing: {
    position: 'relative',
    padding: 3,
    borderRadius: 999,
    borderWidth: 3,
    backgroundColor: COLORS.midnightBlue,
  },
  levelBadge: {
    position: 'absolute',
    bottom: -2,
    right: 2,
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: COLORS.midnightBlue,
  },
  profileName: {
    fontFamily: FONTS.bold,
    fontSize: 15,
    color: COLORS.warmCreamAlt,
    textAlign: 'center',
  },
  profileLevel: {
    fontFamily: FONTS.semiBold,
    fontSize: 11,
    color: 'rgba(255, 249, 240, 0.72)',
    textAlign: 'center',
  },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: RADIUS.full,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  addPlusCircle: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  addText: {
    fontFamily: FONTS.bold,
    fontSize: 14,
    color: COLORS.warmCreamAlt,
  },
  footer: {
    alignItems: 'center',
  },
  parentBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: RADIUS.full,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.14)',
  },
  parentText: {
    fontFamily: FONTS.semiBold,
    fontSize: 12,
    color: COLORS.slateGrayLight,
  },
});
