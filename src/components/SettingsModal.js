import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useTV } from '../context/TVContext';
import { scanSubnet } from '../api/tvScanner';
import { COLORS } from '../theme/colors';

export const SettingsModal = ({ visible, onClose }) => {
  const { ip, port, apiVersion, updateSettings, checkConnection, systemInfo, latency } = useTV();

  const [inputIp, setInputIp] = useState(ip);
  const [inputPort, setInputPort] = useState(port.toString());
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState(null);

  // Subnet scanning state
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [discoveredDevices, setDiscoveredDevices] = useState([]);
  const cancelScanRef = useRef({ cancelled: false });

  const handleSave = async () => {
    await updateSettings(inputIp.trim(), parseInt(inputPort, 10) || 1925, apiVersion);
    await checkConnection(inputIp.trim());
    onClose();
  };

  const handleTest = async () => {
    setTesting(true);
    setTestResult(null);
    const ok = await checkConnection(inputIp.trim());
    setTesting(false);
    setTestResult(ok ? 'success' : 'error');
  };

  const handleStartScan = async () => {
    setIsScanning(true);
    setScanProgress(0);
    setDiscoveredDevices([]);
    cancelScanRef.current.cancelled = false;

    // Determine subnet base from input IP
    const parts = inputIp.trim().split('.');
    const subnetBase = parts.length >= 3 ? `${parts[0]}.${parts[1]}.${parts[2]}` : '192.168.1';

    try {
      const found = await scanSubnet(
        subnetBase,
        (progress, devices) => {
          setScanProgress(progress);
          setDiscoveredDevices([...devices]);
        },
        cancelScanRef.current
      );
      setDiscoveredDevices(found);
    } catch (e) {
      console.warn('Scan error', e);
    } finally {
      setIsScanning(false);
    }
  };

  const handleStopScan = () => {
    cancelScanRef.current.cancelled = true;
    setIsScanning(false);
  };

  const handleSelectDevice = (dev) => {
    setInputIp(dev.ip);
    setInputPort((dev.port || 1925).toString());
    updateSettings(dev.ip, dev.port || 1925, 1);
    checkConnection(dev.ip);
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={styles.modalContent}>
          {/* Header */}
          <View style={styles.header}>
            <View>
              <Text style={styles.title}>Настройки подключения</Text>
              <Text style={styles.subtitle}>PHILIPS JointSpace Network Setup</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close" size={24} color={COLORS.textPrimary} />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            {/* IP Address Field */}
            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>IP адрес телевизора</Text>
              <View style={styles.inputRow}>
                <Ionicons name="wifi-outline" size={20} color={COLORS.accentCyan} style={styles.inputIcon} />
                <TextInput
                  style={styles.textInput}
                  value={inputIp}
                  onChangeText={setInputIp}
                  placeholder="192.168.1.xxx"
                  placeholderTextColor={COLORS.textMuted}
                  keyboardType="numeric"
                  autoCorrect={false}
                />
              </View>
              <Text style={styles.hint}>
                IP можно посмотреть в меню ТВ: Меню {'>'} Конфигурация {'>'} Сеть {'>'} Параметры сети.
              </Text>
            </View>

            {/* Port & API Version */}
            <View style={styles.twoCol}>
              <View style={[styles.fieldGroup, { flex: 1 }]}>
                <Text style={styles.fieldLabel}>Порт (по умолч. 1925)</Text>
                <TextInput
                  style={styles.textInputCompact}
                  value={inputPort}
                  onChangeText={setInputPort}
                  keyboardType="numeric"
                />
              </View>
              <View style={[styles.fieldGroup, { flex: 1 }]}>
                <Text style={styles.fieldLabel}>Версия API (1 для 2011г)</Text>
                <View style={styles.textInputCompact}>
                  <Text style={{ color: COLORS.textPrimary, fontWeight: '700' }}>v{apiVersion}</Text>
                </View>
              </View>
            </View>

            {/* Test Connection Button */}
            <View style={styles.actionRow}>
              <TouchableOpacity
                style={[styles.btnSecondary, { flex: 1 }]}
                onPress={handleTest}
                disabled={testing}
              >
                {testing ? (
                  <ActivityIndicator size="small" color={COLORS.accentCyan} />
                ) : (
                  <>
                    <Ionicons name="flash-outline" size={18} color={COLORS.accentCyan} />
                    <Text style={styles.btnSecondaryText}>Тест связи</Text>
                  </>
                )}
              </TouchableOpacity>

              <TouchableOpacity style={[styles.btnPrimary, { flex: 1 }]} onPress={handleSave}>
                <Ionicons name="save-outline" size={18} color="#fff" />
                <Text style={styles.btnPrimaryText}>Сохранить</Text>
              </TouchableOpacity>
            </View>

            {/* Test Connection Feedback */}
            {testResult === 'success' && (
              <View style={styles.successBox}>
                <Ionicons name="checkmark-circle" size={20} color={COLORS.statusOnline} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.successTitle}>Связь установлена! ({latency}мс)</Text>
                  {systemInfo && (
                    <Text style={styles.systemDetails}>
                      Модель: {systemInfo.model || 'Philips Smart TV'}
                      {systemInfo.softwareversion ? `\nПО: ${systemInfo.softwareversion}` : ''}
                    </Text>
                  )}
                </View>
              </View>
            )}

            {testResult === 'error' && (
              <View style={styles.errorBox}>
                <Ionicons name="alert-circle" size={20} color={COLORS.statusOffline} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.errorTitle}>Телевизор не отвечает по адресу {inputIp}:{inputPort}</Text>
                  <Text style={styles.errorText}>
                    Проверьте, включен ли ТВ в ту же Wi-Fi сеть и активирован ли JointSpace.
                  </Text>
                </View>
              </View>
            )}

            {/* Subnet Auto-Scanner */}
            <View style={styles.scannerSection}>
              <View style={styles.scannerHeader}>
                <View>
                  <Text style={styles.sectionTitle}>Автопоиск телевизора в сети</Text>
                  <Text style={styles.sectionSubtitle}>Сканирование подсети на порт 1925</Text>
                </View>
                <TouchableOpacity
                  style={[styles.scanBtn, isScanning && styles.scanBtnActive]}
                  onPress={isScanning ? handleStopScan : handleStartScan}
                >
                  <Ionicons
                    name={isScanning ? 'stop-circle-outline' : 'search-outline'}
                    size={16}
                    color="#fff"
                  />
                  <Text style={styles.scanBtnText}>{isScanning ? 'Стоп' : 'Найти'}</Text>
                </TouchableOpacity>
              </View>

              {isScanning && (
                <View style={styles.progressContainer}>
                  <View style={styles.progressBar}>
                    <View style={[styles.progressFill, { width: `${scanProgress}%` }]} />
                  </View>
                  <Text style={styles.progressText}>Проверено {scanProgress}%</Text>
                </View>
              )}

              {discoveredDevices.length > 0 && (
                <View style={styles.deviceList}>
                  {discoveredDevices.map((d, idx) => (
                    <TouchableOpacity
                      key={idx}
                      style={styles.deviceCard}
                      onPress={() => handleSelectDevice(d)}
                    >
                      <Ionicons name="tv-outline" size={24} color={COLORS.accentCyan} />
                      <View style={{ flex: 1 }}>
                        <Text style={styles.deviceName}>{d.name || d.model}</Text>
                        <Text style={styles.deviceIp}>{d.ip}:{d.port}</Text>
                      </View>
                      <Text style={styles.connectLabel}>Выбрать</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>

            {/* Important Philips 2011 JointSpace Activation Instruction */}
            <View style={styles.guideCard}>
              <View style={styles.guideHeader}>
                <MaterialCommunityIcons name="information" size={22} color={COLORS.accentCyan} />
                <Text style={styles.guideTitle}>Как активировать JointSpace на Philips 2011</Text>
              </View>
              <Text style={styles.guideStep}>
                1. Включите любой ТВ-канал на телевизоре Philips 46PFL8606H.
              </Text>
              <Text style={styles.guideStep}>
                2. На обычном пульте введите цифры: <Text style={styles.boldCode}>5646877223</Text> (это слово «jointspace»).
              </Text>
              <Text style={styles.guideStep}>
                3. На экране телевизора высветится подтверждение: «JointSpace enabled».
              </Text>
              <Text style={styles.guideStep}>
                4. Убедитесь, что iPhone и ТВ подключены к одному роутеру Wi-Fi.
              </Text>
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
    maxHeight: '90%',
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
    color: COLORS.textSecondary,
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
  fieldGroup: {
    marginBottom: 14,
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 6,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#181e2b',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#263145',
    paddingHorizontal: 12,
    height: 48,
  },
  inputIcon: {
    marginRight: 8,
  },
  textInput: {
    flex: 1,
    color: COLORS.textPrimary,
    fontSize: 16,
    fontFamily: 'Courier',
    fontWeight: '700',
  },
  hint: {
    fontSize: 11,
    color: COLORS.textMuted,
    marginTop: 6,
  },
  twoCol: {
    flexDirection: 'row',
    gap: 12,
  },
  textInputCompact: {
    backgroundColor: '#181e2b',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#263145',
    paddingHorizontal: 12,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    color: COLORS.textPrimary,
    fontSize: 15,
    fontFamily: 'Courier',
    fontWeight: '700',
  },
  actionRow: {
    flexDirection: 'row',
    gap: 12,
    marginVertical: 12,
  },
  btnSecondary: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#192130',
    borderWidth: 1,
    borderColor: COLORS.accentCyan,
    borderRadius: 12,
    height: 44,
    gap: 6,
  },
  btnSecondaryText: {
    color: COLORS.accentCyan,
    fontSize: 14,
    fontWeight: '700',
  },
  btnPrimary: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.philipsBlue,
    borderRadius: 12,
    height: 44,
    gap: 6,
  },
  btnPrimaryText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
  },
  successBox: {
    flexDirection: 'row',
    backgroundColor: 'rgba(16, 185, 129, 0.12)',
    borderWidth: 1,
    borderColor: COLORS.statusOnline,
    borderRadius: 12,
    padding: 12,
    gap: 10,
    marginBottom: 14,
  },
  successTitle: {
    color: COLORS.statusOnline,
    fontWeight: '700',
    fontSize: 13,
  },
  systemDetails: {
    color: COLORS.textPrimary,
    fontSize: 11,
    marginTop: 4,
    lineHeight: 16,
  },
  errorBox: {
    flexDirection: 'row',
    backgroundColor: 'rgba(239, 68, 68, 0.12)',
    borderWidth: 1,
    borderColor: COLORS.statusOffline,
    borderRadius: 12,
    padding: 12,
    gap: 10,
    marginBottom: 14,
  },
  errorTitle: {
    color: COLORS.statusOffline,
    fontWeight: '700',
    fontSize: 13,
  },
  errorText: {
    color: COLORS.textSecondary,
    fontSize: 11,
    marginTop: 4,
  },
  scannerSection: {
    backgroundColor: '#161c28',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: '#252f44',
    marginBottom: 16,
  },
  scannerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  sectionSubtitle: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  scanBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.philipsBlue,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 8,
    gap: 4,
  },
  scanBtnActive: {
    backgroundColor: COLORS.powerRed,
  },
  scanBtnText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
  },
  progressContainer: {
    marginTop: 10,
  },
  progressBar: {
    height: 4,
    backgroundColor: '#263145',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: COLORS.accentCyan,
  },
  progressText: {
    fontSize: 10,
    color: COLORS.textSecondary,
    marginTop: 4,
    textAlign: 'right',
  },
  deviceList: {
    marginTop: 10,
    gap: 8,
  },
  deviceCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1b2232',
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#2e3a54',
    gap: 10,
  },
  deviceName: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  deviceIp: {
    fontSize: 11,
    color: COLORS.accentCyan,
    fontFamily: 'Courier',
    marginTop: 2,
  },
  connectLabel: {
    fontSize: 12,
    color: COLORS.philipsBlue,
    fontWeight: '700',
  },
  guideCard: {
    backgroundColor: '#141822',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#222b3c',
    marginBottom: 20,
  },
  guideHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  guideTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.accentCyan,
  },
  guideStep: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginBottom: 6,
    lineHeight: 17,
  },
  boldCode: {
    color: COLORS.textPrimary,
    fontWeight: '800',
    fontFamily: 'Courier',
  },
});
