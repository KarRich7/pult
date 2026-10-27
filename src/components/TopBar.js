import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useTV } from '../context/TVContext';
import { COLORS } from '../theme/colors';

export const TopBar = ({ onToggleKeypad, showKeypad }) => {
  const { togglePower, sendKey } = useTV();

  return (
    <View style={styles.container}>
      {/* Keypad Toggle Button */}
      <TouchableOpacity
        style={[styles.smallBtn, showKeypad && styles.activeBtn]}
        onPress={onToggleKeypad}
        activeOpacity={0.6}
      >
        <Ionicons
          name={showKeypad ? 'keypad' : 'keypad-outline'}
          size={20}
          color={showKeypad ? COLORS.accentCyan : COLORS.textPrimary}
        />
        <Text style={[styles.btnLabel, showKeypad && { color: COLORS.accentCyan }]}>123</Text>
      </TouchableOpacity>

      {/* Adjust / Quick Settings */}
      <TouchableOpacity
        style={styles.smallBtn}
        onPress={() => sendKey('Adjust', 'Adjust')}
        activeOpacity={0.6}
      >
        <Ionicons name="tune-outline" size={18} color={COLORS.textPrimary} />
        <Text style={styles.btnLabel}>ADJUST</Text>
      </TouchableOpacity>

      {/* Teletext / Subtitle */}
      <TouchableOpacity
        style={styles.smallBtn}
        onPress={() => sendKey('Subtitle', 'Субтитры')}
        activeOpacity={0.6}
      >
        <MaterialCommunityIcons name="subtitles-outline" size={19} color={COLORS.textPrimary} />
        <Text style={styles.btnLabel}>SUBTITLE</Text>
      </TouchableOpacity>

      {/* Power Button */}
      <TouchableOpacity
        style={styles.powerBtn}
        onPress={togglePower}
        activeOpacity={0.6}
      >
        <Ionicons name="power" size={24} color="#fff" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 8,
    marginVertical: 8,
  },
  smallBtn: {
    width: 62,
    height: 48,
    borderRadius: 14,
    backgroundColor: COLORS.buttonDark,
    borderWidth: 1,
    borderColor: COLORS.buttonBorder,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
  },
  activeBtn: {
    backgroundColor: 'rgba(0, 210, 255, 0.15)',
    borderColor: COLORS.accentCyan,
  },
  btnLabel: {
    fontSize: 9,
    fontWeight: '700',
    color: COLORS.textSecondary,
    letterSpacing: 0.5,
  },
  powerBtn: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: COLORS.powerRed,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: COLORS.powerRed,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.6,
    shadowRadius: 8,
    elevation: 6,
  },
});
