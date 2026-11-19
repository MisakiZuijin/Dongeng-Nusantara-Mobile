import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { usePathname, useRouter } from 'expo-router';
import {
  DrawerContentScrollView,
  type DrawerContentComponentProps,
} from 'expo-router/drawer';
import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ParentalGateModal } from '@/components/ParentalGateModal';
import { ProfileAvatar } from '@/components/StoryArtwork';
import { COLORS, FONTS, RADIUS } from '@/constants/theme';
import { useAudioStore } from '@/store/useAudioStore';
import { useSessionStore } from '@/store/useSessionStore';

interface NavEntry {
  routeName: string;
  href: '/(drawer)/home' | '/(drawer)/bookshelf' | '/(drawer)/bedtime-audio' | '/(drawer)/favorites';
  label: string;
  icon: keyof typeof MaterialIcons.glyphMap;
}

const CHILD_MENU: NavEntry[] = [
  {
    routeName: 'home',
    href: '/(drawer)/home',
    label: 'Beranda Dongeng',
    icon: 'home',
  },
  {
    routeName: 'bookshelf',
    href: '/(drawer)/bookshelf',
    label: 'Koleksi Rak Buku',
    icon: 'auto-stories',
  },
  {
    routeName: 'bedtime-audio',
    href: '/(drawer)/bedtime-audio',
    label: 'Audio Tidur Nyenyak',
    icon: 'bedtime',
  },
  {
    routeName: 'favorites',
    href: '/(drawer)/favorites',
    label: 'Cerita Favorit',
    icon: 'favorite',
  },
];

export function CustomDrawerContent(props: DrawerContentComponentProps) {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const pathname = usePathname();
  const activeProfile = useSessionStore((s) => s.activeProfile);
  const logout = useSessionStore((s) => s.logout);
  const stopAudio = useAudioStore((s) => s.stopAudio);
  const [gateOpen, setGateOpen] = useState(false);

  const handleNavigate = (href: NavEntry['href']) => {
    props.navigation.closeDrawer();
    router.navigate(href);
  };

  const handleOpenParentSettings = () => {
    setGateOpen(true);
  };

  const handleLogout = async () => {
    props.navigation.closeDrawer();
    stopAudio();
    await logout();
    router.replace('/(auth)/sign-in');
  };

  return (
    <View
      style={[
        styles.root,
        { paddingTop: Math.max(insets.top, 16), paddingBottom: Math.max(insets.bottom, 16) },
      ]}
    >
      <DrawerContentScrollView
        {...props}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header Branding + Close Button */}
        <View style={styles.brandRow}>
          <View style={styles.brandLeft}>
            <View style={styles.brandOrb}>
              <MaterialIcons name="auto-stories" size={20} color={COLORS.sunsetOrange} />
            </View>
            <Text style={styles.brandTitle}>Dongeng Nusantara</Text>
          </View>
          <Pressable
            onPress={() => props.navigation.closeDrawer()}
            hitSlop={10}
            style={styles.closeBtn}
            accessibilityLabel="Tutup Menu Navigasi"
          >
            <MaterialIcons name="close" size={20} color={COLORS.midnightBlue} />
          </Pressable>
        </View>

        {/* Active Child Profile Card */}
        <Pressable
          onPress={() => {
            props.navigation.closeDrawer();
            router.push('/profile-picker');
          }}
          style={styles.profileCard}
        >
          <View style={styles.avatarRing}>
            <ProfileAvatar
              avatarKey={activeProfile?.avatarKey ?? 'kancil'}
              size={44}
            />
          </View>
          <View style={styles.profileText}>
            <Text style={styles.profileName} numberOfLines={1}>
              {activeProfile?.name ?? 'Adik'}
            </Text>
            <Text style={styles.profileMeta}>
              Akun Anak • Usia {activeProfile?.ageBracket ?? '6-8'} Thn
            </Text>
          </View>
          <MaterialIcons name="swap-horiz" size={20} color={COLORS.slateGray} />
        </Pressable>

        {/* Menu Items */}
        <View style={styles.navList}>
          {CHILD_MENU.map((item) => {
            const active = pathname.includes(item.routeName);
            return (
              <Pressable
                key={item.routeName}
                onPress={() => handleNavigate(item.href)}
                style={[styles.navItem, active && styles.navItemActive]}
              >
                <MaterialIcons
                  name={item.icon}
                  size={22}
                  color={active ? COLORS.sunsetOrange : COLORS.slateGray}
                />
                <Text style={[styles.navLabel, active && styles.navLabelActive]}>
                  {item.label}
                </Text>
              </Pressable>
            );
          })}

          <View style={styles.divider} />

          <Pressable
            onPress={handleOpenParentSettings}
            style={[
              styles.navItem,
              pathname.includes('parent-settings') && styles.navItemActive,
            ]}
          >
            <MaterialIcons
              name="manage-accounts"
              size={22}
              color={
                pathname.includes('parent-settings')
                  ? COLORS.sunsetOrange
                  : COLORS.slateGray
              }
            />
            <Text
              style={[
                styles.navLabel,
                pathname.includes('parent-settings') && styles.navLabelActive,
              ]}
            >
              Pengaturan Orang Tua
            </Text>
          </Pressable>
        </View>
      </DrawerContentScrollView>

      {/* Bottom Logout & Version */}
      <View style={styles.footer}>
        <Pressable onPress={handleLogout} style={styles.logoutBtn}>
          <MaterialIcons name="logout" size={18} color={COLORS.midnightBlue} />
          <Text style={styles.logoutText}>Keluar Akun</Text>
        </Pressable>
        <Text style={styles.version}>Dongeng Nusantara v1.0.0</Text>
      </View>

      <ParentalGateModal
        visible={gateOpen}
        onClose={() => setGateOpen(false)}
        onVerified={() => {
          props.navigation.closeDrawer();
          router.navigate('/(drawer)/parent-settings');
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: COLORS.white,
    paddingHorizontal: 20,
    justifyContent: 'space-between',
  },
  scrollContent: {
    paddingTop: 8,
    gap: 18,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  brandLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  brandOrb: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 122, 69, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandTitle: {
    fontFamily: FONTS.bold,
    fontSize: 16,
    color: COLORS.midnightBlue,
  },
  closeBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: COLORS.warmCream,
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 14,
    borderRadius: RADIUS.lg,
    backgroundColor: COLORS.warmCream,
    borderWidth: 1,
    borderColor: COLORS.borderSoft,
  },
  avatarRing: {
    borderRadius: 999,
    borderWidth: 2,
    borderColor: COLORS.sunsetOrange,
    padding: 1,
  },
  profileText: {
    flex: 1,
    gap: 2,
  },
  profileName: {
    fontFamily: FONTS.bold,
    fontSize: 15,
    color: COLORS.midnightBlue,
  },
  profileMeta: {
    fontFamily: FONTS.semiBold,
    fontSize: 12,
    color: COLORS.slateGray,
  },
  navList: {
    gap: 6,
  },
  navItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingHorizontal: 14,
    paddingVertical: 13,
    borderRadius: RADIUS.default,
  },
  navItemActive: {
    backgroundColor: 'rgba(255, 122, 69, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(255, 122, 69, 0.25)',
  },
  navLabel: {
    fontFamily: FONTS.semiBold,
    fontSize: 14,
    color: COLORS.midnightBlue,
  },
  navLabelActive: {
    fontFamily: FONTS.bold,
    color: COLORS.lightSecondary,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.borderSoft,
    marginVertical: 6,
  },
  footer: {
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderSoft,
    gap: 10,
    alignItems: 'center',
  },
  logoutBtn: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 13,
    borderRadius: RADIUS.full,
    borderWidth: 1,
    borderColor: COLORS.borderSoft,
    backgroundColor: COLORS.white,
  },
  logoutText: {
    fontFamily: FONTS.semiBold,
    fontSize: 14,
    color: COLORS.midnightBlue,
  },
  version: {
    fontFamily: FONTS.semiBold,
    fontSize: 11,
    color: COLORS.slateGray,
  },
});
