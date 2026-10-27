import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useTV } from '../context/TVContext';
import { COLORS } from '../theme/colors';

export const DPad = () => {
  const { sendKey } = useTV();

  return (
    <View style={styles.wrapper}>
      {/* Top Corner Buttons */}
      <View style={styles.cornersRow}>
        <TouchableOpacity
          style={styles.cornerBtn}
          onPress={() => sendKey('Home', 'Home')}
          activeOpacity={0.6}
        >
          <Ionicons name="home-outline" size={20} color={COLORS.textPrimary} />
          <Text style={styles.cornerLabel}>HOME</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.cornerBtn}
          onPress={() => sendKey('Options', 'Options')}
          activeOpacity={0.6}
        >
          <Ionicons name="options-outline" size={20} color={COLORS.textPrimary} />
          <Text style={styles.cornerLabel}>OPTIONS</Text>
        </TouchableOpacity>
      </View>

      {/* Circular D-Pad */}
      <View style={styles.dpadCircle}>
        {/* UP */}
        <TouchableOpacity
          style={[styles.arrowBtn, styles.arrowUp]}
          onPress={() => sendKey('CursorUp', 'Вверх')}
          activeOpacity={0.5}
        >
          <Ionicons name="caret-up" size={26} color={COLORS.textPrimary} />
        </TouchableOpacity>

        {/* DOWN */}
        <TouchableOpacity
          style={[styles.arrowBtn, styles.arrowDown]}
          onPress={() => sendKey('CursorDown', 'Вниз')}
          activeOpacity={0.5}
        >
          <Ionicons name="caret-down" size={26} color={COLORS.textPrimary} />
        </TouchableOpacity>

        {/* LEFT */}
        <TouchableOpacity
          style={[styles.arrowBtn, styles.arrowLeft]}
          onPress={() => sendKey('CursorLeft', 'Влево')}
          activeOpacity={0.5}
        >
          <Ionicons name="caret-back" size={26} color={COLORS.textPrimary} />
        </TouchableOpacity>

        {/* RIGHT */}
        <TouchableOpacity
          style={[styles.arrowBtn, styles.arrowRight]}
          onPress={() => sendKey('CursorRight', 'Вправо')}
          activeOpacity={0.5}
        >
          <Ionicons name="caret-forward" size={26} color={COLORS.textPrimary} />
        </TouchableOpacity>

        {/* CENTER OK */}
        <TouchableOpacity
          style={styles.centerOkBtn}
          onPress={() => sendKey('Confirm', 'OK')}
          activeOpacity={0.7}
        >
          <Text style={styles.okText}>OK</Text>
        </TouchableOpacity>
      </View>

      {/* Bottom Corner Buttons */}
      <View style={styles.cornersRow}>
        <TouchableOpacity
          style={styles.cornerBtn}
          onPress={() => sendKey('Back', 'Назад')}
          activeOpacity={0.6}
        >
          <Ionicons name="arrow-back" size={20} color={COLORS.textPrimary} />
          <Text style={styles.cornerLabel}>BACK</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.cornerBtn}
          onPress={() => sendKey('Info', 'Инфо')}
          activeOpacity={0.6}
        >
          <MaterialCommunityIcons name="information-variant" size={20} color={COLORS.textPrimary} />
          <Text style={styles.cornerLabel}>INFO</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    alignItems: 'center',
    marginVertical: 12,
  },
  cornersRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: 250,
    marginVertical: 4,
  },
  cornerBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 60,
    height: 48,
    borderRadius: 12,
    backgroundColor: COLORS.buttonDark,
    borderWidth: 1,
    borderColor: COLORS.buttonBorder,
  },
  cornerLabel: {
    fontSize: 9,
    fontWeight: '700',
    color: COLORS.textSecondary,
    marginTop: 2,
    letterSpacing: 0.5,
  },
  dpadCircle: {
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: '#181d28',
    borderWidth: 2,
    borderColor: '#2f384c',
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 8,
  },
  arrowBtn: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
  arrowUp: {
    top: 10,
    width: 80,
    height: 50,
  },
  arrowDown: {
    bottom: 10,
    width: 80,
    height: 50,
  },
  arrowLeft: {
    left: 10,
    width: 50,
    height: 80,
  },
  arrowRight: {
    right: 10,
    width: 50,
    height: 80,
  },
  centerOkBtn: {
    width: 86,
    height: 86,
    borderRadius: 43,
    backgroundColor: '#262e3e',
    borderWidth: 2,
    borderColor: '#3c4860',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.5,
    shadowRadius: 5,
    elevation: 6,
    zIndex: 5,
  },
  okText: {
    fontSize: 22,
    fontWeight: '800',
    color: COLORS.textPrimary,
    letterSpacing: 1,
  },
});
