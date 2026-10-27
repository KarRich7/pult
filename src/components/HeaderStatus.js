import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTV } from '../context/TVContext';
import { COLORS } from '../theme/colors';

export const HeaderStatus = ({ onOpenSettings, onOpenAmbilight }) => {
  const { ip, connectionStatus, latency, systemInfo, checkConnection, lastAction } = useTV();

  const isConnected = connectionStatus === 'connected';
  const isConnecting = connectionStatus === 'connecting';

  return (
    <View style={styles.container}>
      <View style={styles.leftCol}>
        <View style={styles.brandRow}>
          <Text style={styles.brandTitle}>PHILIPS</Text>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>8606 Series</Text>
          </View>
        </View>

        <View style={styles.statusRow}>
          <View
            style={[
              styles.statusDot,
              {
                backgroundColor: isConnected
                  ? COLORS.statusOnline
                  : isConnecting
                  ? COLORS.statusScanning
                  : COLORS.statusOffline,
                shadowColor: isConnected ? COLORS.statusOnline : COLORS.statusOffline,
              },
            ]}
          />
          <Text style={styles.ipText}>
            {ip} {latency ? `• ${latency}ms` : ''}
          </Text>
          <Text style={styles.statusLabel}>
            {isConnected ? 'В сети' : isConnecting ? 'Поиск...' : 'Не в сети'}
          </Text>
        </View>
      </View>

      <View style={styles.rightCol}>
        {/* Quick Ambilight button */}
        <TouchableOpacity
          style={styles.iconButton}
          onPress={onOpenAmbilight}
          activeOpacity={0.7}
        >
          <Ionicons name="sunny-outline" size={20} color={COLORS.ambilightPurple} />
        </TouchableOpacity>

        {/* Refresh connection */}
        <TouchableOpacity
          style={styles.iconButton}
          onPress={() => checkConnection()}
          activeOpacity={0.7}
          disabled={isConnecting}
        >
          {isConnecting ? (
            <ActivityIndicator size="small" color={COLORS.philipsBlue} />
          ) : (
            <Ionicons name="reload" size={18} color={COLORS.textSecondary} />
          )}
        </TouchableOpacity>

        {/* Settings button */}
        <TouchableOpacity
          style={[styles.iconButton, styles.settingsBtn]}
          onPress={onOpenSettings}
          activeOpacity={0.7}
        >
          <Ionicons name="settings-sharp" size={18} color={COLORS.textPrimary} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: COLORS.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    marginBottom: 12,
  },
  leftCol: {
    flex: 1,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  brandTitle: {
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 2,
    color: COLORS.textPrimary,
  },
  badge: {
    backgroundColor: 'rgba(0, 102, 204, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    marginLeft: 8,
    borderWidth: 1,
    borderColor: 'rgba(0, 102, 204, 0.4)',
  },
  badgeText: {
    color: COLORS.accentCyan,
    fontSize: 10,
    fontWeight: '700',
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 4,
  },
  ipText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontFamily: 'Courier',
    marginRight: 6,
  },
  statusLabel: {
    fontSize: 11,
    color: COLORS.textMuted,
    fontWeight: '500',
  },
  rightCol: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  iconButton: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: COLORS.buttonDark,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.buttonBorder,
  },
  settingsBtn: {
    backgroundColor: '#262f3f',
    borderColor: '#39465e',
  },
});
