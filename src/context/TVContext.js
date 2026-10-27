import React, { createContext, useContext, useState, useEffect, useRef, useMemo } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Haptics from 'expo-haptics';
import { PhilipsApi } from '../api/philipsApi';

const STORAGE_KEY_IP = '@philips_remote_ip';
const STORAGE_KEY_PORT = '@philips_remote_port';
const STORAGE_KEY_API_VER = '@philips_remote_api_ver';

const TVContext = createContext(null);

export const TVProvider = ({ children }) => {
  const [ip, setIp] = useState('192.168.1.50');
  const [port, setPort] = useState(1925);
  const [apiVersion, setApiVersion] = useState(1);

  const [connectionStatus, setConnectionStatus] = useState('offline'); // 'connected' | 'connecting' | 'offline'
  const [latency, setLatency] = useState(null);
  const [systemInfo, setSystemInfo] = useState(null);
  const [volume, setVolume] = useState({ current: 20, min: 0, max: 60, muted: false });
  const [powerState, setPowerState] = useState('Unknown');
  const [lastAction, setLastAction] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);

  const api = useMemo(() => new PhilipsApi(ip, port, apiVersion), [ip, port, apiVersion]);
  const pollTimerRef = useRef(null);

  // Load saved settings
  useEffect(() => {
    (async () => {
      try {
        const savedIp = await AsyncStorage.getItem(STORAGE_KEY_IP);
        const savedPort = await AsyncStorage.getItem(STORAGE_KEY_PORT);
        const savedVer = await AsyncStorage.getItem(STORAGE_KEY_API_VER);
        if (savedIp) setIp(savedIp);
        if (savedPort) setPort(parseInt(savedPort, 10));
        if (savedVer) setApiVersion(parseInt(savedVer, 10));
      } catch (e) {
        console.warn('Failed to load settings', e);
      }
    })();
  }, []);

  // Save settings when changed
  const updateSettings = async (newIp, newPort = 1925, newVer = 1) => {
    setIp(newIp);
    setPort(newPort);
    setApiVersion(newVer);
    try {
      await AsyncStorage.setItem(STORAGE_KEY_IP, newIp);
      await AsyncStorage.setItem(STORAGE_KEY_PORT, newPort.toString());
      await AsyncStorage.setItem(STORAGE_KEY_API_VER, newVer.toString());
    } catch (e) {
      console.warn('Failed to save settings', e);
    }
  };

  // Test connection and update status
  const checkConnection = async (customIp) => {
    setConnectionStatus('connecting');
    const testApi = customIp ? new PhilipsApi(customIp, port, apiVersion) : api;
    const res = await testApi.testConnection();

    if (res.success) {
      setConnectionStatus('connected');
      setLatency(res.latency);
      if (res.system) {
        setSystemInfo(res.system);
      }
      setErrorMsg(null);
      // Fetch initial volume
      const vol = await testApi.getVolume();
      if (vol) setVolume(vol);
      return true;
    } else {
      setConnectionStatus('offline');
      setLatency(null);
      setErrorMsg(res.error || 'Телевизор недоступен');
      return false;
    }
  };

  // Periodic heartbeat / status check
  useEffect(() => {
    checkConnection();
    pollTimerRef.current = setInterval(() => {
      checkConnection();
    }, 15000);

    return () => {
      if (pollTimerRef.current) clearInterval(pollTimerRef.current);
    };
  }, [ip, port, apiVersion]);

  // Send Remote Button Command with Haptic feedback
  const sendKey = async (keyName, label = keyName) => {
    try {
      // Tactile iPhone feedback
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {}

    setLastAction(label);

    try {
      await api.sendKey(keyName);
      setConnectionStatus('connected');
      setErrorMsg(null);
    } catch (err) {
      console.warn(`Key error ${keyName}:`, err.message);
      setErrorMsg(`Ошибка: ${err.message}`);
    }
  };

  // Volume controls
  const volumeUp = async () => {
    await sendKey('VolumeUp', 'Громкость +');
    setVolume(prev => ({ ...prev, current: Math.min(prev.max || 60, prev.current + 1), muted: false }));
  };

  const volumeDown = async () => {
    await sendKey('VolumeDown', 'Громкость -');
    setVolume(prev => ({ ...prev, current: Math.max(prev.min || 0, prev.current - 1) }));
  };

  const toggleMute = async () => {
    await sendKey('Mute', 'Mute');
    setVolume(prev => ({ ...prev, muted: !prev.muted }));
  };

  // Channel controls
  const channelUp = () => sendKey('ChannelStepUp', 'Канал +');
  const channelDown = () => sendKey('ChannelStepDown', 'Канал -');

  // Power
  const togglePower = () => sendKey('Standby', 'Питание (Standby)');

  return (
    <TVContext.Provider
      value={{
        ip,
        port,
        apiVersion,
        api,
        connectionStatus,
        latency,
        systemInfo,
        volume,
        powerState,
        lastAction,
        errorMsg,
        updateSettings,
        checkConnection,
        sendKey,
        volumeUp,
        volumeDown,
        toggleMute,
        channelUp,
        channelDown,
        togglePower,
      }}
    >
      {children}
    </TVContext.Provider>
  );
};

export const useTV = () => {
  const context = useContext(TVContext);
  if (!context) {
    throw new Error('useTV must be used within TVProvider');
  }
  return context;
};
