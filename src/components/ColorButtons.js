import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { useTV } from '../context/TVContext';
import { COLORS } from '../theme/colors';

export const ColorButtons = () => {
  const { sendKey } = useTV();

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[styles.colorBtn, { backgroundColor: COLORS.btnRed }]}
        onPress={() => sendKey('RedColour', 'Красная')}
        activeOpacity={0.6}
      />
      <TouchableOpacity
        style={[styles.colorBtn, { backgroundColor: COLORS.btnGreen }]}
        onPress={() => sendKey('GreenColour', 'Зеленая')}
        activeOpacity={0.6}
      />
      <TouchableOpacity
        style={[styles.colorBtn, { backgroundColor: COLORS.btnYellow }]}
        onPress={() => sendKey('YellowColour', 'Желтая')}
        activeOpacity={0.6}
      />
      <TouchableOpacity
        style={[styles.colorBtn, { backgroundColor: COLORS.btnBlue }]}
        onPress={() => sendKey('BlueColour', 'Синяя')}
        activeOpacity={0.6}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    marginVertical: 10,
  },
  colorBtn: {
    width: 60,
    height: 18,
    borderRadius: 9,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 3,
  },
});
