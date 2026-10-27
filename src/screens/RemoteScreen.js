import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Platform,
  StatusBar,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useTV } from '../context/TVContext';
import { HeaderStatus } from '../components/HeaderStatus';
import { TopBar } from '../components/TopBar';
import { DPad } from '../components/DPad';
import { RockerControls } from '../components/RockerControls';
import { ColorButtons } from '../components/ColorButtons';
import { NumericKeypad } from '../components/NumericKeypad';
import { MediaControls } from '../components/MediaControls';
import { SettingsModal } from '../components/SettingsModal';
import { AmbilightModal } from '../components/AmbilightModal';
import { SourcePickerModal } from '../components/SourcePickerModal';
import { COLORS } from '../theme/colors';

export const RemoteScreen = () => {
  const { lastAction, errorMsg } = useTV();

  const [activeTab, setActiveTab] = useState('main'); // 'main' | 'digits' | 'media'
  const [showSettings, setShowSettings] = useState(false);
  const [showAmbilight, setShowAmbilight] = useState(false);
  const [showSources, setShowSources] = useState(false);

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#0b0e14" />
      <LinearGradient
        colors={['#181e2b', '#0f131c', '#090c12']}
        style={styles.gradientContainer}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          bounces={false}
        >
          {/* Header Status */}
          <HeaderStatus
            onOpenSettings={() => setShowSettings(true)}
            onOpenAmbilight={() => setShowAmbilight(true)}
          />

          {/* Action / Error Toast Feedback */}
          {errorMsg ? (
            <View style={styles.errorToast}>
              <Ionicons name="warning-outline" size={16} color={COLORS.powerRed} />
              <Text style={styles.errorToastText} numberOfLines={1}>{errorMsg}</Text>
            </View>
          ) : lastAction ? (
            <View style={styles.actionToast}>
              <Ionicons name="radio-outline" size={14} color={COLORS.accentCyan} />
              <Text style={styles.actionToastText}>Команда: {lastAction}</Text>
            </View>
          ) : null}

          {/* Top Bar with Power & Shortcuts */}
          <TopBar
            showKeypad={activeTab === 'digits'}
            onToggleKeypad={() => setActiveTab(prev => (prev === 'digits' ? 'main' : 'digits'))}
          />

          {/* Mode Switcher Tabs */}
          <View style={styles.tabBar}>
            <TouchableOpacity
              style={[styles.tabBtn, activeTab === 'main' && styles.tabBtnActive]}
              onPress={() => setActiveTab('main')}
              activeOpacity={0.7}
            >
              <MaterialCommunityIcons
                name="remote"
                size={16}
                color={activeTab === 'main' ? COLORS.accentCyan : COLORS.textSecondary}
              />
              <Text style={[styles.tabLabel, activeTab === 'main' && styles.tabLabelActive]}>
                Пульт
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.tabBtn, activeTab === 'digits' && styles.tabBtnActive]}
              onPress={() => setActiveTab('digits')}
              activeOpacity={0.7}
            >
              <Ionicons
                name="keypad-outline"
                size={16}
                color={activeTab === 'digits' ? COLORS.accentCyan : COLORS.textSecondary}
              />
              <Text style={[styles.tabLabel, activeTab === 'digits' && styles.tabLabelActive]}>
                Цифры
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.tabBtn, activeTab === 'media' && styles.tabBtnActive]}
              onPress={() => setActiveTab('media')}
              activeOpacity={0.7}
            >
              <Ionicons
                name="play-skip-forward-outline"
                size={16}
                color={activeTab === 'media' ? COLORS.accentCyan : COLORS.textSecondary}
              />
              <Text style={[styles.tabLabel, activeTab === 'media' && styles.tabLabelActive]}>
                Медиа
              </Text>
            </TouchableOpacity>
          </View>

          {/* Conditional Sub-panel */}
          {activeTab === 'digits' && <NumericKeypad />}
          {activeTab === 'media' && <MediaControls />}

          {/* Circular Navigation Pad */}
          <DPad />

          {/* Teletext / Interactive 4 Colors */}
          <ColorButtons />

          {/* Volume, Mute, Source, Channel Rockers */}
          <RockerControls onOpenSourcePicker={() => setShowSources(true)} />

          {/* Ambilight Spectra 2 Card Banner */}
          <TouchableOpacity
            style={styles.ambilightBanner}
            onPress={() => setShowAmbilight(true)}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={['rgba(168, 85, 247, 0.25)', 'rgba(0, 102, 204, 0.25)']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.ambilightBannerGradient}
            >
              <View style={styles.ambilightIconBox}>
                <Ionicons name="sunny" size={20} color={COLORS.ambilightPurple} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.ambilightBannerTitle}>Ambilight Spectra 2 Studio</Text>
                <Text style={styles.ambilightBannerSubtitle}>
                  Управление подсветкой 46PFL8606H
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={COLORS.textSecondary} />
            </LinearGradient>
          </TouchableOpacity>
        </ScrollView>
      </LinearGradient>

      {/* Modals */}
      <SettingsModal visible={showSettings} onClose={() => setShowSettings(false)} />
      <AmbilightModal visible={showAmbilight} onClose={() => setShowAmbilight(false)} />
      <SourcePickerModal visible={showSources} onClose={() => setShowSources(false)} />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#0c0f14',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  gradientContainer: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 30,
  },
  actionToast: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 210, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(0, 210, 255, 0.3)',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 4,
    marginBottom: 6,
    gap: 6,
  },
  actionToastText: {
    color: COLORS.accentCyan,
    fontSize: 12,
    fontWeight: '600',
  },
  errorToast: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 59, 48, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(255, 59, 48, 0.35)',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 4,
    marginBottom: 6,
    gap: 6,
  },
  errorToastText: {
    color: COLORS.powerRed,
    fontSize: 12,
    fontWeight: '600',
    flex: 1,
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#151923',
    borderRadius: 12,
    padding: 3,
    marginVertical: 6,
    borderWidth: 1,
    borderColor: '#242d3e',
  },
  tabBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderRadius: 9,
    gap: 6,
  },
  tabBtnActive: {
    backgroundColor: '#222938',
  },
  tabLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  tabLabelActive: {
    color: COLORS.accentCyan,
    fontWeight: '700',
  },
  ambilightBanner: {
    marginTop: 8,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(168, 85, 247, 0.35)',
  },
  ambilightBannerGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    gap: 12,
  },
  ambilightIconBox: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: 'rgba(168, 85, 247, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  ambilightBannerTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  ambilightBannerSubtitle: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
});
