import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import React, { useEffect, useState } from 'react';
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { ButtonPrimary } from '@/components/ButtonPrimary';
import { COLORS, FONTS, RADIUS } from '@/constants/theme';
import { useSessionStore } from '@/store/useSessionStore';

interface ParentalGateModalProps {
  visible: boolean;
  onClose: () => void;
  onVerified: () => void;
  title?: string;
}

function generateChallenge() {
  const a = 3 + Math.floor(Math.random() * 7);
  const b = 2 + Math.floor(Math.random() * 8);
  return { a, b, answer: String(a * b) };
}

export function ParentalGateModal({
  visible,
  onClose,
  onVerified,
  title = 'Verifikasi Orang Tua',
}: ParentalGateModalProps) {
  const parentPin = useSessionStore((s) => s.parentPin);
  const [challenge, setChallenge] = useState(generateChallenge);
  const [inputValue, setInputValue] = useState('');
  const [errorText, setErrorText] = useState('');

  useEffect(() => {
    if (visible) {
      setChallenge(generateChallenge());
      setInputValue('');
      setErrorText('');
    }
  }, [visible]);

  const handleSubmit = () => {
    const trimmed = inputValue.trim();
    if (parentPin) {
      if (trimmed === parentPin) {
        onClose();
        onVerified();
      } else {
        setErrorText('PIN orang tua belum sesuai. Coba lagi.');
      }
      return;
    }

    if (trimmed === challenge.answer) {
      onClose();
      onVerified();
    } else {
      setErrorText('Jawaban belum tepat. Soal baru disiapkan.');
      setChallenge(generateChallenge());
      setInputValue('');
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={styles.card}>
          <View style={styles.headerRow}>
            <View style={styles.iconCircle}>
              <MaterialIcons name="lock" size={22} color={COLORS.sunsetOrange} />
            </View>
            <Pressable onPress={onClose} hitSlop={12} style={styles.closeBtn}>
              <MaterialIcons name="close" size={20} color={COLORS.midnightBlue} />
            </Pressable>
          </View>

          <Text style={styles.title}>{title}</Text>
          <Text style={styles.subtitle}>
            {parentPin
              ? 'Masukkan 4 digit PIN orang tua untuk melanjutkan ke pengaturan.'
              : `Khusus orang tua. Berapakah hasil dari ${challenge.a} × ${challenge.b}?`}
          </Text>

          <TextInput
            value={inputValue}
            onChangeText={(t) => {
              setInputValue(t);
              setErrorText('');
            }}
            keyboardType="number-pad"
            maxLength={parentPin ? 4 : 3}
            secureTextEntry={Boolean(parentPin)}
            placeholder={parentPin ? 'Masukkan 4 digit PIN' : 'Tulis jawaban angka'}
            placeholderTextColor={COLORS.slateGrayLight}
            style={styles.input}
            onSubmitEditing={handleSubmit}
          />

          {errorText ? <Text style={styles.errorText}>{errorText}</Text> : null}

          <View style={styles.actions}>
            <Pressable onPress={onClose} style={styles.cancelBtn}>
              <Text style={styles.cancelText}>Batal</Text>
            </Pressable>
            <View style={{ flex: 1 }}>
              <ButtonPrimary label="Lanjutkan" onPress={handleSubmit} />
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(30, 34, 70, 0.55)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  card: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.lg,
    padding: 24,
    borderWidth: 1,
    borderColor: COLORS.borderSoft,
    gap: 12,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 122, 69, 0.14)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.warmCream,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontFamily: FONTS.bold,
    fontSize: 20,
    color: COLORS.midnightBlue,
  },
  subtitle: {
    fontFamily: FONTS.regular,
    fontSize: 14,
    lineHeight: 20,
    color: COLORS.slateGray,
  },
  input: {
    borderWidth: 1.5,
    borderColor: COLORS.borderSoft,
    backgroundColor: COLORS.warmCream,
    borderRadius: RADIUS.default,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontFamily: FONTS.bold,
    fontSize: 18,
    color: COLORS.midnightBlue,
    textAlign: 'center',
    marginTop: 4,
  },
  errorText: {
    fontFamily: FONTS.semiBold,
    fontSize: 12,
    color: COLORS.lightSecondary,
    textAlign: 'center',
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 6,
  },
  cancelBtn: {
    paddingVertical: 14,
    paddingHorizontal: 18,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.warmCream,
    borderWidth: 1,
    borderColor: COLORS.borderSoft,
  },
  cancelText: {
    fontFamily: FONTS.semiBold,
    fontSize: 14,
    color: COLORS.midnightBlue,
  },
});
