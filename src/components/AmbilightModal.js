import React, { useState } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTV } from '../context/TVContext';
import { COLORS } from '../theme/colors';

const PRESET_COLORS = [
  { name: 'Теплый белый', r: 255, g: 240, b: 210, hex: '#fff0d2' },
  { name: 'Золотой закат', r: 255, g: 140, b: 0, hex: '#ff8c00' },
  { name: 'Неоновый синий', r: 0, g: 180, b: 255, hex: '#00b4ff' },
  { name: 'Изумрудный', r: 0, g: 230, b: 120, hex: '#00e678' },
  { name: 'Пурпурный', r: 200, g: 50, b: 255, hex: '#c832ff' },
  { name: 'Глубокий красный', r: 255, g: 40, b: 50, hex: '#ff2832' },
  { name: 'Холодный лед', r: 180, g: 230, b: 255, hex: '#b4e6ff' },
  { name: 'Мягкий янтарь', r: 255, g: 191, b: 0, hex: '#ffbf00' },
];

export const AmbilightModal = ({ visible, onClose }) => {
  const { api, sendKey } = useTV();
  const [selectedHex, setSelectedHex] = useState('#00b4ff');
  const [mode, setMode] = useState('internal'); // 'internal' | 'manual'
  const [isOn, setIsOn] = useState(true);

  const handleSetMode = async (newMode) => {
    setMode(newMode);
    try {
      await api.setAmbilightMode(newMode);
    } catch (e) {
      console.warn(e);
    }
  };

  const handleSetColor = async (color) => {
    setSelectedHex(color.hex);
    setMode('manual');
    try {
      await api.setAmbilightColor(color.r, color.g, color.b);
    } catch (e) {
      console.warn(e);
    }
  };

  const handleTogglePower = async () => {
    const nextState = !isOn;
    setIsOn(nextState);
    try {
      await sendKey('AmbilightOnOff', 'Ambilight Вкл/Выкл');
    } catch (e) {
      console.warn(e);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={styles.modalContent}>
          {/* Header */}
          <View style={styles.header}>
            <View>
              <Text style={styles.title}>Ambilight Spectra 2</Text>
              <Text style={styles.subtitle}>PHILIPS 46PFL8606H Smart Backlight</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close" size={24} color={COLORS.textPrimary} />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            {/* TV Preview with Ambilight Glow */}
            <View style={styles.previewContainer}>
              {/* Left Ambilight Glow */}
              <View
                style={[
                  styles.glowSide,
                  styles.glowLeft,
                  { backgroundColor: isOn ? selectedHex : 'transparent' },
                ]}
              />

              {/* Mock TV Screen */}
              <View style={styles.mockTV}>
                <View style={styles.mockScreen}>
                  <Ionicons
                    name="sunny"
                    size={32}
                    color={isOn ? selectedHex : COLORS.textMuted}
                  />
                  <Text style={styles.tvText}>
                    {isOn ? (mode === 'internal' ? 'Синхронизация с экраном' : 'Статический цвет') : 'Выключен'}
                  </Text>
                </View>
                <Text style={styles.brandSmall}>PHILIPS</Text>
              </View>

              {/* Right Ambilight Glow */}
              <View
                style={[
                  styles.glowSide,
                  styles.glowRight,
                  { backgroundColor: isOn ? selectedHex : 'transparent' },
                ]}
              />
            </View>

            {/* Quick Toggle On/Off */}
            <View style={styles.powerRow}>
              <Text style={styles.sectionLabel}>Питание подсветки</Text>
              <TouchableOpacity
                style={[styles.toggleBtn, isOn && styles.toggleBtnActive]}
                onPress={handleTogglePower}
              >
                <Text style={styles.toggleText}>{isOn ? 'ВКЛЮЧЕН' : 'ВЫКЛЮЧЕН'}</Text>
              </TouchableOpacity>
            </View>

            {/* Mode Selector */}
            <Text style={styles.sectionLabel}>Режим подсветки</Text>
            <View style={styles.modeRow}>
              <TouchableOpacity
                style={[styles.modeBtn, mode === 'internal' && styles.modeBtnActive]}
                onPress={() => handleSetMode('internal')}
              >
                <Ionicons
                  name="color-filter-outline"
                  size={18}
                  color={mode === 'internal' ? COLORS.accentCyan : COLORS.textSecondary}
                />
                <Text style={[styles.modeText, mode === 'internal' && styles.modeTextActive]}>
                  Динамический (Экран)
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modeBtn, mode === 'manual' && styles.modeBtnActive]}
                onPress={() => handleSetMode('manual')}
              >
                <Ionicons
                  name="color-palette-outline"
                  size={18}
                  color={mode === 'manual' ? COLORS.accentCyan : COLORS.textSecondary}
                />
                <Text style={[styles.modeText, mode === 'manual' && styles.modeTextActive]}>
                  Свой цвет
                </Text>
              </TouchableOpacity>
            </View>

            {/* Color Palette */}
            <Text style={styles.sectionLabel}>Цветовые пресеты</Text>
            <View style={styles.colorGrid}>
              {PRESET_COLORS.map((col, idx) => (
                <TouchableOpacity
                  key={idx}
                  style={[
                    styles.colorCard,
                    selectedHex === col.hex && mode === 'manual' && styles.colorCardSelected,
                  ]}
                  onPress={() => handleSetColor(col)}
                  activeOpacity={0.7}
                >
                  <View style={[styles.colorCircle, { backgroundColor: col.hex }]} />
                  <Text style={styles.colorName}>{col.name}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#121620',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    maxHeight: '85%',
    borderWidth: 1,
    borderColor: '#252e40',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  subtitle: {
    fontSize: 12,
    color: COLORS.ambilightPurple,
    fontWeight: '600',
    marginTop: 2,
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#1d2332',
    alignItems: 'center',
    justifyContent: 'center',
  },
  previewContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 14,
    height: 120,
  },
  glowSide: {
    width: 18,
    height: 90,
    borderRadius: 8,
    opacity: 0.85,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 18,
  },
  glowLeft: {
    marginRight: 10,
    shadowColor: COLORS.ambilightPurple,
  },
  glowRight: {
    marginLeft: 10,
    shadowColor: COLORS.ambilightPurple,
  },
  mockTV: {
    width: 180,
    height: 100,
    backgroundColor: '#05070a',
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#30394c',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 6,
  },
  mockScreen: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  tvText: {
    color: COLORS.textSecondary,
    fontSize: 10,
    fontWeight: '600',
    marginTop: 4,
    textAlign: 'center',
    paddingHorizontal: 6,
  },
  brandSmall: {
    color: COLORS.textMuted,
    fontSize: 7,
    letterSpacing: 1.5,
    fontWeight: '800',
  },
  powerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#181e2b',
    padding: 12,
    borderRadius: 12,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#263145',
  },
  sectionLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 8,
  },
  toggleBtn: {
    backgroundColor: '#283244',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 8,
  },
  toggleBtnActive: {
    backgroundColor: COLORS.philipsBlue,
  },
  toggleText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
  },
  modeRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16,
  },
  modeBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1a202d',
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#293347',
    gap: 6,
  },
  modeBtnActive: {
    borderColor: COLORS.accentCyan,
    backgroundColor: 'rgba(0, 210, 255, 0.12)',
  },
  modeText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  modeTextActive: {
    color: COLORS.accentCyan,
  },
  colorGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 20,
  },
  colorCard: {
    width: '48%',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#171d29',
    padding: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#273145',
    gap: 8,
  },
  colorCardSelected: {
    borderColor: COLORS.accentCyan,
    backgroundColor: 'rgba(0, 210, 255, 0.1)',
  },
  colorCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
  },
  colorName: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
});
