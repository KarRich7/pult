import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTV } from '../context/TVContext';
import { COLORS } from '../theme/colors';

export const NumericKeypad = () => {
  const { sendKey } = useTV();
  const [typedBuffer, setTypedBuffer] = useState('');
  const [isSendingCode, setIsSendingCode] = useState(false);

  const handleDigit = (digit) => {
    setTypedBuffer(prev => (prev.length < 10 ? prev + digit : digit.toString()));
    sendKey(`Digit${digit}`, digit.toString());
  };

  // Helper to automatically send the JointSpace activation code "5646877223"
  const sendJointSpaceCode = async () => {
    const code = '5646877223';
    setIsSendingCode(true);
    setTypedBuffer('');

    for (let i = 0; i < code.length; i++) {
      const d = code[i];
      setTypedBuffer(prev => prev + d);
      await sendKey(`Digit${d}`, d);
      await new Promise(r => setTimeout(r, 350));
    }
    setIsSendingCode(false);
  };

  return (
    <View style={styles.container}>
      {/* Typed numbers display & Jointspace activation shortcut */}
      <View style={styles.displayRow}>
        <Text style={styles.bufferText}>
          {typedBuffer ? typedBuffer : 'Введите номер канала'}
        </Text>
        {typedBuffer.length > 0 && (
          <TouchableOpacity onPress={() => setTypedBuffer('')} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <Ionicons name="backspace-outline" size={20} color={COLORS.textSecondary} />
          </TouchableOpacity>
        )}
      </View>

      {/* Digits Grid */}
      <View style={styles.grid}>
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
          <TouchableOpacity
            key={num}
            style={styles.keyBtn}
            onPress={() => handleDigit(num)}
            activeOpacity={0.6}
            disabled={isSendingCode}
          >
            <Text style={styles.digitText}>{num}</Text>
          </TouchableOpacity>
        ))}

        {/* Bottom row: Dot, 0, TV Guide */}
        <TouchableOpacity
          style={styles.keyBtn}
          onPress={() => sendKey('Dot', '.')}
          activeOpacity={0.6}
        >
          <Text style={styles.digitText}>.</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.keyBtn}
          onPress={() => handleDigit(0)}
          activeOpacity={0.6}
          disabled={isSendingCode}
        >
          <Text style={styles.digitText}>0</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.keyBtn}
          onPress={() => sendKey('WatchTV', 'Watch TV')}
          activeOpacity={0.6}
        >
          <Text style={styles.subText}>TV</Text>
        </TouchableOpacity>
      </View>

      {/* Jointspace auto-activation helper */}
      <TouchableOpacity
        style={[styles.jointspaceBtn, isSendingCode && styles.jointspaceBtnActive]}
        onPress={sendJointSpaceCode}
        disabled={isSendingCode}
        activeOpacity={0.7}
      >
        <Ionicons name="flash-outline" size={16} color={COLORS.accentCyan} />
        <Text style={styles.jointspaceText}>
          {isSendingCode ? 'Отправка кода JointSpace...' : 'Ввести код JointSpace (5646877223)'}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#151923',
    borderRadius: 18,
    padding: 12,
    borderWidth: 1,
    borderColor: '#262f40',
    marginVertical: 8,
  },
  displayRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#0f121a',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#1f2737',
  },
  bufferText: {
    color: COLORS.accentCyan,
    fontFamily: 'Courier',
    fontSize: 15,
    fontWeight: '700',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 8,
  },
  keyBtn: {
    width: '31%',
    height: 48,
    borderRadius: 12,
    backgroundColor: '#202736',
    borderWidth: 1,
    borderColor: '#2e384e',
    alignItems: 'center',
    justifyContent: 'center',
  },
  digitText: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  subText: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.accentCyan,
  },
  jointspaceBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 210, 255, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(0, 210, 255, 0.25)',
    borderRadius: 10,
    paddingVertical: 8,
    marginTop: 10,
    gap: 6,
  },
  jointspaceBtnActive: {
    backgroundColor: 'rgba(0, 210, 255, 0.2)',
  },
  jointspaceText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.accentCyan,
  },
});
