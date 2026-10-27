import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTV } from '../context/TVContext';
import { COLORS } from '../theme/colors';

export const MediaControls = () => {
  const { sendKey } = useTV();

  return (
    <View style={styles.container}>
      {/* Rewind */}
      <TouchableOpacity
        style={styles.mediaBtn}
        onPress={() => sendKey('Rewind', 'Перемотка назад')}
        activeOpacity={0.6}
      >
        <Ionicons name="play-back" size={18} color={COLORS.textPrimary} />
      </TouchableOpacity>

      {/* Play / Pause */}
      <TouchableOpacity
        style={[styles.mediaBtn, styles.playBtn]}
        onPress={() => sendKey('PlayPause', 'Play/Pause')}
        activeOpacity={0.6}
      >
        <Ionicons name="play" size={20} color="#fff" />
      </TouchableOpacity>

      {/* Pause */}
      <TouchableOpacity
        style={styles.mediaBtn}
        onPress={() => sendKey('Pause', 'Пауза')}
        activeOpacity={0.6}
      >
        <Ionicons name="pause" size={18} color={COLORS.textPrimary} />
      </TouchableOpacity>

      {/* Fast Forward */}
      <TouchableOpacity
        style={styles.mediaBtn}
        onPress={() => sendKey('FastForward', 'Перемотка вперед')}
        activeOpacity={0.6}
      >
        <Ionicons name="play-forward" size={18} color={COLORS.textPrimary} />
      </TouchableOpacity>

      {/* Stop */}
      <TouchableOpacity
        style={styles.mediaBtn}
        onPress={() => sendKey('Stop', 'Стоп')}
        activeOpacity={0.6}
      >
        <Ionicons name="stop" size={18} color={COLORS.textPrimary} />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#141822',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#242b3c',
    marginVertical: 8,
  },
  mediaBtn: {
    width: 44,
    height: 40,
    borderRadius: 10,
    backgroundColor: '#202636',
    borderWidth: 1,
    borderColor: '#2d374d',
    alignItems: 'center',
    justifyContent: 'center',
  },
  playBtn: {
    backgroundColor: COLORS.philipsBlue,
    borderColor: '#257ce6',
  },
});
