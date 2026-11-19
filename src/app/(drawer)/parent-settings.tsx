import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useNavigation, useRouter } from 'expo-router';
import type { DrawerNavigationProp } from 'expo-router/drawer';
import { StatusBar } from 'expo-status-bar';
import React, { useState } from 'react';
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AddProfileModal } from '@/components/AddProfileModal';
import { ProfileAvatar } from '@/components/StoryArtwork';
import { COLORS, FONTS, RADIUS } from '@/constants/theme';
import { useLibraryStore } from '@/store/useLibraryStore';
import { useSessionStore } from '@/store/useSessionStore';

export default function ParentSettingsScreen() {
  const router = useRouter();
  const navigation = useNavigation<DrawerNavigationProp<Record<string, undefined>>>();
  const insets = useSafeAreaInsets();

  const profiles = useSessionStore((s) => s.profiles);
  const activeProfile = useSessionStore((s) => s.activeProfile);
  const parentPin = useSessionStore((s) => s.parentPin);
  const sessionMode = useSessionStore((s) => s.sessionMode);
  const addChildProfile = useSessionStore((s) => s.addChildProfile);
  const deleteChildProfile = useSessionStore((s) => s.deleteChildProfile);
  const selectProfile = useSessionStore((s) => s.selectProfile);
  const setParentPin = useSessionStore((s) => s.setParentPin);

  const stories = useLibraryStore((s) => s.stories);
  const toggleOffline = useLibraryStore((s) => s.toggleOffline);

  const [pinInput, setPinInput] = useState(parentPin ?? '');
  const [addModalOpen, setAddModalOpen] = useState(false);

  const handleSavePin = async () => {
    const clean = pinInput.trim();
    if (clean.length === 0) {
      await setParentPin(null);
      Alert.alert('PIN Dihapus', 'Parental Gate kembali memakai soal matematika.');
      return;
    }
    if (!/^\d{4}$/.test(clean)) {
      Alert.alert('Format PIN Salah', 'Masukkan tepat 4 digit angka untuk PIN Orang Tua.');
      return;
    }
    await setParentPin(clean);
    Alert.alert('PIN Disimpan', 'PIN Orang Tua aktif untuk melindungi menu ini.');
  };

  return (
    <View style={styles.root}>
      <StatusBar style="dark" />

      <View
        style={[
          styles.header,
          { paddingTop: Math.max(insets.top, 14) },
        ]}
      >
        <Pressable
          onPress={() => router.navigate('/(drawer)/home')}
          hitSlop={10}
          style={styles.iconBtn}
        >
          <MaterialIcons name="arrow-back" size={20} color={COLORS.midnightBlue} />
        </Pressable>

        <View style={styles.headerCenter}>
          <Text style={styles.headerSub}>Kendali Keluarga</Text>
          <Text style={styles.headerTitle}>Pengaturan Orang Tua</Text>
        </View>

        <Pressable
          onPress={() => navigation.openDrawer()}
          hitSlop={10}
          style={styles.iconBtn}
        >
          <MaterialIcons name="menu" size={22} color={COLORS.midnightBlue} />
        </Pressable>
      </View>

      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: Math.max(insets.bottom, 28) },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Status Sesi */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Status Akun & Mode Aplikasi</Text>
          <Text style={styles.cardSub}>
            Mode saat ini:{' '}
            <Text style={styles.bold}>
              {sessionMode === 'account' ? 'Akun Keluarga Lokal' : 'Mode Tamu (Offline)'}
            </Text>
          </Text>
        </View>

        {/* PIN Parental Gate */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>PIN Keamanan Orang Tua (Opsional)</Text>
          <Text style={styles.cardSub}>
            Kosongkan untuk memakai tantangan perkalian, atau isi 4 digit PIN.
          </Text>
          <View style={styles.pinRow}>
            <TextInput
              value={pinInput}
              onChangeText={setPinInput}
              keyboardType="number-pad"
              maxLength={4}
              secureTextEntry
              placeholder="Contoh: 1234"
              placeholderTextColor={COLORS.slateGrayLight}
              style={styles.pinInput}
            />
            <Pressable onPress={handleSavePin} style={styles.savePinBtn}>
              <Text style={styles.savePinText}>Simpan PIN</Text>
            </Pressable>
          </View>
        </View>

        {/* Manajemen Profil Anak */}
        <View style={styles.card}>
          <View style={styles.rowBetween}>
            <Text style={styles.cardTitle}>Profil Anak ({profiles.length})</Text>
            <Pressable
              onPress={() => setAddModalOpen(true)}
              style={styles.addSmallBtn}
            >
              <MaterialIcons name="add" size={16} color={COLORS.white} />
              <Text style={styles.addSmallText}>Tambah</Text>
            </Pressable>
          </View>

          {profiles.map((p) => {
            const isCurrent = p.id === activeProfile?.id;
            return (
              <View key={p.id} style={styles.profileRow}>
                <ProfileAvatar avatarKey={p.avatarKey} size={40} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.profileName}>
                    {p.name} ({p.ageYears} Thn)
                  </Text>
                  <Text style={styles.profileMeta}>
                    Streak {p.streakCount}/7 • {isCurrent ? 'Aktif' : 'Siap Dipilih'}
                  </Text>
                </View>
                {!isCurrent ? (
                  <Pressable
                    onPress={() => selectProfile(p.id)}
                    style={styles.switchBtn}
                  >
                    <Text style={styles.switchText}>Pakai</Text>
                  </Pressable>
                ) : null}
                {profiles.length > 1 ? (
                  <Pressable
                    onPress={() => deleteChildProfile(p.id)}
                    hitSlop={10}
                  >
                    <MaterialIcons
                      name="delete-outline"
                      size={20}
                      color={COLORS.lightSecondary}
                    />
                  </Pressable>
                ) : null}
              </View>
            );
          })}
        </View>

        {/* Manajer Mode Cerita Offline */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Manajer Cerita Offline</Text>
          <Text style={styles.cardSub}>
            Atur dongeng yang tersedia tanpa koneksi internet di perangkat ini.
          </Text>
          {stories.map((story) => (
            <View key={story.id} style={styles.offlineRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.offlineTitle}>{story.title}</Text>
                <Text style={styles.offlineMeta}>
                  {story.province} • {story.durationMinutes} Menit
                </Text>
              </View>
              <Switch
                value={story.isOfflineDownloaded}
                onValueChange={() => {
                  if (activeProfile?.id) {
                    toggleOffline(story.id, activeProfile.id);
                  }
                }}
                trackColor={{ false: COLORS.borderSoft, true: COLORS.emeraldLeaf }}
                thumbColor={COLORS.white}
              />
            </View>
          ))}
        </View>
      </ScrollView>

      <AddProfileModal
        visible={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        onCreate={async (input) => {
          await addChildProfile(input);
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: COLORS.warmCream,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderSoft,
    backgroundColor: COLORS.white,
  },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.warmCream,
    borderWidth: 1,
    borderColor: COLORS.borderSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerCenter: {
    alignItems: 'center',
  },
  headerSub: {
    fontFamily: FONTS.semiBold,
    fontSize: 11,
    color: COLORS.slateGray,
  },
  headerTitle: {
    fontFamily: FONTS.bold,
    fontSize: 18,
    color: COLORS.midnightBlue,
  },
  scrollContent: {
    padding: 24,
    gap: 16,
  },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.borderSoft,
    padding: 18,
    gap: 10,
  },
  cardTitle: {
    fontFamily: FONTS.bold,
    fontSize: 16,
    color: COLORS.midnightBlue,
  },
  cardSub: {
    fontFamily: FONTS.regular,
    fontSize: 13,
    lineHeight: 19,
    color: COLORS.slateGray,
  },
  bold: {
    fontFamily: FONTS.bold,
    color: COLORS.midnightBlue,
  },
  pinRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 4,
  },
  pinInput: {
    flex: 1,
    backgroundColor: COLORS.warmCream,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.borderSoft,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontFamily: FONTS.bold,
    fontSize: 15,
    color: COLORS.midnightBlue,
  },
  savePinBtn: {
    backgroundColor: COLORS.midnightBlue,
    borderRadius: RADIUS.md,
    paddingHorizontal: 16,
    justifyContent: 'center',
  },
  savePinText: {
    fontFamily: FONTS.bold,
    fontSize: 13,
    color: COLORS.white,
  },
  rowBetween: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  addSmallBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: COLORS.sunsetOrange,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: RADIUS.full,
  },
  addSmallText: {
    fontFamily: FONTS.bold,
    fontSize: 12,
    color: COLORS.white,
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderSoft,
  },
  profileName: {
    fontFamily: FONTS.bold,
    fontSize: 14,
    color: COLORS.midnightBlue,
  },
  profileMeta: {
    fontFamily: FONTS.regular,
    fontSize: 12,
    color: COLORS.slateGray,
  },
  switchBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.warmCream,
    borderWidth: 1,
    borderColor: COLORS.borderSoft,
  },
  switchText: {
    fontFamily: FONTS.bold,
    fontSize: 12,
    color: COLORS.midnightBlue,
  },
  offlineRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderSoft,
  },
  offlineTitle: {
    fontFamily: FONTS.bold,
    fontSize: 14,
    color: COLORS.midnightBlue,
  },
  offlineMeta: {
    fontFamily: FONTS.regular,
    fontSize: 12,
    color: COLORS.slateGray,
  },
});
