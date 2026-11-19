import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import React, { useState } from 'react';
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { ButtonPrimary } from '@/components/ButtonPrimary';
import { ProfileAvatar } from '@/components/StoryArtwork';
import { COLORS, FONTS, RADIUS } from '@/constants/theme';
import type { AgeBracket, AvatarKey } from '@/types/models';

interface AddProfileModalProps {
  visible: boolean;
  onClose: () => void;
  onCreate: (input: {
    name: string;
    ageBracket: AgeBracket;
    avatarKey: AvatarKey;
  }) => Promise<void>;
}

const AVATARS: { key: AvatarKey; label: string }[] = [
  { key: 'kancil', label: 'Kancil' },
  { key: 'cendrawasih', label: 'Cendrawasih' },
  { key: 'komodo', label: 'Komodo' },
  { key: 'jalak', label: 'Jalak Bali' },
];

const AGE_BRACKETS: { key: AgeBracket; label: string }[] = [
  { key: '3-5', label: '3–5 Thn' },
  { key: '6-8', label: '6–8 Thn' },
  { key: '9-12', label: '9–12 Thn' },
];

export function AddProfileModal({
  visible,
  onClose,
  onCreate,
}: AddProfileModalProps) {
  const [name, setName] = useState('');
  const [ageBracket, setAgeBracket] = useState<AgeBracket>('6-8');
  const [avatarKey, setAvatarKey] = useState<AvatarKey>('kancil');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (saving) return;
    setSaving(true);
    try {
      await onCreate({
        name: name.trim() || 'Adik Nusantara',
        ageBracket,
        avatarKey,
      });
      setName('');
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={styles.sheet}>
          <View style={styles.headerRow}>
            <Text style={styles.title}>Tambah Profil Anak</Text>
            <Pressable onPress={onClose} hitSlop={12} style={styles.closeBtn}>
              <MaterialIcons name="close" size={20} color={COLORS.midnightBlue} />
            </Pressable>
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Nama Panggilan Anak</Text>
            <TextInput
              value={name}
              onChangeText={setName}
              placeholder="Contoh: Adik Arka"
              placeholderTextColor={COLORS.slateGrayLight}
              style={styles.input}
            />
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Rentang Usia</Text>
            <View style={styles.row3}>
              {AGE_BRACKETS.map((item) => {
                const active = ageBracket === item.key;
                return (
                  <Pressable
                    key={item.key}
                    onPress={() => setAgeBracket(item.key)}
                    style={[styles.chip, active && styles.chipActive]}
                  >
                    <Text style={[styles.chipText, active && styles.chipTextActive]}>
                      {item.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Pilih Karakter Avatar</Text>
            <View style={styles.avatarRow}>
              {AVATARS.map((item) => {
                const active = avatarKey === item.key;
                return (
                  <Pressable
                    key={item.key}
                    onPress={() => setAvatarKey(item.key)}
                    style={[styles.avatarChoice, active && styles.avatarChoiceActive]}
                  >
                    <ProfileAvatar avatarKey={item.key} size={48} />
                    <Text style={styles.avatarLabel} numberOfLines={1}>
                      {item.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>

          <ButtonPrimary
            label={saving ? 'Menyimpan...' : 'Simpan Profil Anak'}
            onPress={handleSave}
            disabled={saving}
            trailingIconName="check"
          />
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(30, 34, 70, 0.55)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: RADIUS.xl,
    borderTopRightRadius: RADIUS.xl,
    padding: 24,
    gap: 16,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    fontFamily: FONTS.bold,
    fontSize: 20,
    color: COLORS.midnightBlue,
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.warmCream,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fieldGroup: {
    gap: 8,
  },
  label: {
    fontFamily: FONTS.bold,
    fontSize: 13,
    color: COLORS.midnightBlue,
  },
  input: {
    borderWidth: 1,
    borderColor: COLORS.borderSoft,
    backgroundColor: COLORS.warmCream,
    borderRadius: RADIUS.md,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontFamily: FONTS.regular,
    fontSize: 15,
    color: COLORS.midnightBlue,
  },
  row3: {
    flexDirection: 'row',
    gap: 8,
  },
  chip: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: RADIUS.default,
    backgroundColor: COLORS.warmCream,
    borderWidth: 1,
    borderColor: COLORS.borderSoft,
    alignItems: 'center',
  },
  chipActive: {
    backgroundColor: 'rgba(255, 122, 69, 0.14)',
    borderColor: COLORS.sunsetOrange,
    borderWidth: 2,
  },
  chipText: {
    fontFamily: FONTS.semiBold,
    fontSize: 13,
    color: COLORS.midnightBlue,
  },
  chipTextActive: {
    fontFamily: FONTS.bold,
    color: COLORS.lightSecondary,
  },
  avatarRow: {
    flexDirection: 'row',
    gap: 8,
  },
  avatarChoice: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 4,
    borderRadius: RADIUS.default,
    borderWidth: 1,
    borderColor: COLORS.borderSoft,
    backgroundColor: COLORS.warmCream,
    gap: 6,
  },
  avatarChoiceActive: {
    borderColor: COLORS.sunsetOrange,
    borderWidth: 2,
    backgroundColor: COLORS.white,
  },
  avatarLabel: {
    fontFamily: FONTS.semiBold,
    fontSize: 11,
    color: COLORS.midnightBlue,
  },
});
