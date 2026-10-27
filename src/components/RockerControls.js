import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons, Feather } from '@expo/vector-icons';
import { useTV } from '../context/TVContext';
import { COLORS } from '../theme/colors';

export const RockerControls = ({ onOpenSourcePicker }) => {
  const { volumeUp, volumeDown, toggleMute, channelUp, channelDown, volume, sendKey } = useTV();

  return (
    <View style={styles.container}>
      {/* Left Rocker: Volume */}
      <View style={styles.rockerPill}>
        <TouchableOpacity
          style={styles.rockerHalf}
          onPress={volumeUp}
          activeOpacity={0.6}
        >
          <Ionicons name="add" size={26} color={COLORS.textPrimary} />
        </TouchableOpacity>

        <View style={styles.rockerLabelBox}>
          <Text style={styles.rockerLabel}>VOL</Text>
          {volume.current !== undefined && (
            <Text style={styles.volumeValue}>{volume.muted ? 'MUTED' : volume.current}</Text>
          )}
        </View>

        <TouchableOpacity
          style={styles.rockerHalf}
          onPress={volumeDown}
          activeOpacity={0.6}
        >
          <Ionicons name="remove" size={26} color={COLORS.textPrimary} />
        </TouchableOpacity>
      </View>

      {/* Center Column: Mute & Source */}
      <View style={styles.centerActions}>
        <TouchableOpacity
          style={[styles.actionBtn, volume.muted && styles.actionBtnMuted]}
          onPress={toggleMute}
          activeOpacity={0.6}
        >
          <Ionicons
            name={volume.muted ? 'volume-mute' : 'volume-medium-outline'}
            size={22}
            color={volume.muted ? COLORS.powerRed : COLORS.textPrimary}
          />
          <Text style={[styles.actionLabel, volume.muted && { color: COLORS.powerRed }]}>
            {volume.muted ? 'MUTED' : 'MUTE'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionBtn}
          onPress={onOpenSourcePicker}
          activeOpacity={0.6}
        >
          <Feather name="tv" size={20} color={COLORS.accentCyan} />
          <Text style={[styles.actionLabel, { color: COLORS.accentCyan }]}>SOURCE</Text>
        </TouchableOpacity>
      </View>

      {/* Right Rocker: Channel */}
      <View style={styles.rockerPill}>
        <TouchableOpacity
          style={styles.rockerHalf}
          onPress={channelUp}
          activeOpacity={0.6}
        >
          <Ionicons name="chevron-up" size={26} color={COLORS.textPrimary} />
        </TouchableOpacity>

        <View style={styles.rockerLabelBox}>
          <Text style={styles.rockerLabel}>CH</Text>
          <Text style={styles.channelLabel}>PAGE</Text>
        </View>

        <TouchableOpacity
          style={styles.rockerHalf}
          onPress={channelDown}
          activeOpacity={0.6}
        >
          <Ionicons name="chevron-down" size={26} color={COLORS.textPrimary} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    marginVertical: 14,
    paddingHorizontal: 10,
  },
  rockerPill: {
    width: 68,
    height: 140,
    borderRadius: 34,
    backgroundColor: '#1b212d',
    borderWidth: 1.5,
    borderColor: '#2e3749',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
  rockerHalf: {
    width: 56,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#242b3b',
  },
  rockerLabelBox: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  rockerLabel: {
    fontSize: 12,
    fontWeight: '800',
    color: COLORS.textSecondary,
    letterSpacing: 1,
  },
  volumeValue: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.accentCyan,
    marginTop: 2,
  },
  channelLabel: {
    fontSize: 9,
    fontWeight: '600',
    color: COLORS.textMuted,
    marginTop: 2,
  },
  centerActions: {
    justifyContent: 'space-between',
    height: 130,
    gap: 12,
  },
  actionBtn: {
    width: 68,
    height: 58,
    borderRadius: 16,
    backgroundColor: '#1d2330',
    borderWidth: 1,
    borderColor: '#2e3749',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
  },
  actionBtnMuted: {
    backgroundColor: 'rgba(255, 59, 48, 0.15)',
    borderColor: 'rgba(255, 59, 48, 0.4)',
  },
  actionLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.textSecondary,
    letterSpacing: 0.5,
  },
});
