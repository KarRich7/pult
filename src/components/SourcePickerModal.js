import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useTV } from '../context/TVContext';
import { COLORS } from '../theme/colors';

const DEFAULT_SOURCES = [
  { id: 'tv', name: 'Телевидение (TV)', icon: 'tv-outline' },
  { id: 'hdmi1', name: 'HDMI 1', icon: 'game-controller-outline' },
  { id: 'hdmi2', name: 'HDMI 2', icon: 'film-outline' },
  { id: 'hdmi3', name: 'HDMI 3', icon: 'laptop-outline' },
  { id: 'hdmiside', name: 'HDMI Side', icon: 'hardware-chip-outline' },
  { id: 'satellite', name: 'Спутник (Satellite)', icon: 'planet-outline' },
  { id: 'ypbpr', name: 'Компонент (Y Pb Pr)', icon: 'color-palette-outline' },
  { id: 'vga', name: 'VGA / PC', icon: 'desktop-outline' },
];

export const SourcePickerModal = ({ visible, onClose }) => {
  const { api, sendKey } = useTV();
  const [sources, setSources] = useState(DEFAULT_SOURCES);
  const [currentSource, setCurrentSource] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (visible) {
      loadSources();
    }
  }, [visible]);

  const loadSources = async () => {
    setLoading(true);
    try {
      const tvSources = await api.getSources();
      if (tvSources && Object.keys(tvSources).length > 0) {
        const mapped = Object.entries(tvSources).map(([id, item]) => ({
          id,
          name: item.name || id,
          icon: id.includes('hdmi') ? 'film-outline' : 'tv-outline',
        }));
        setSources(mapped);
      }
      const cur = await api.getCurrentSource();
      if (cur && cur.id) {
        setCurrentSource(cur.id);
      }
    } catch {
      // Use fallback list
    } finally {
      setLoading(false);
    }
  };

  const handleSelectSource = async (sourceId) => {
    setCurrentSource(sourceId);
    try {
      await api.setSource(sourceId);
    } catch {
      // Fallback: send Source key
      await sendKey('Source', 'Источник');
    }
    setTimeout(() => onClose(), 400);
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={styles.modalContent}>
          {/* Header */}
          <View style={styles.header}>
            <View>
              <Text style={styles.title}>Выбор источника</Text>
              <Text style={styles.subtitle}>Входы телевизора Philips</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close" size={24} color={COLORS.textPrimary} />
            </TouchableOpacity>
          </View>

          {loading ? (
            <ActivityIndicator size="large" color={COLORS.accentCyan} style={{ marginVertical: 30 }} />
          ) : (
            <ScrollView showsVerticalScrollIndicator={false}>
              <View style={styles.sourcesList}>
                {sources.map((item) => {
                  const isSelected = currentSource === item.id;
                  return (
                    <TouchableOpacity
                      key={item.id}
                      style={[styles.sourceCard, isSelected && styles.sourceCardSelected]}
                      onPress={() => handleSelectSource(item.id)}
                      activeOpacity={0.7}
                    >
                      <View
                        style={[
                          styles.iconBox,
                          isSelected && { backgroundColor: COLORS.philipsBlue },
                        ]}
                      >
                        <Ionicons
                          name={item.icon || 'tv-outline'}
                          size={22}
                          color={isSelected ? '#fff' : COLORS.textPrimary}
                        />
                      </View>
                      <Text style={[styles.sourceName, isSelected && styles.sourceNameSelected]}>
                        {item.name}
                      </Text>
                      {isSelected && (
                        <Ionicons name="checkmark-circle" size={20} color={COLORS.accentCyan} />
                      )}
                    </TouchableOpacity>
                  );
                })}
              </View>

              {/* Quick remote Source button */}
              <TouchableOpacity
                style={styles.osdSourceBtn}
                onPress={() => {
                  sendKey('Source', 'Экранное меню источников');
                  onClose();
                }}
              >
                <MaterialCommunityIcons name="remote" size={18} color={COLORS.accentCyan} />
                <Text style={styles.osdSourceText}>Открыть экранное меню Source на ТВ</Text>
              </TouchableOpacity>
            </ScrollView>
          )}
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
    maxHeight: '80%',
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
  sourcesList: {
    gap: 8,
    marginBottom: 16,
  },
  sourceCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#181e2b',
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#263145',
  },
  sourceCardSelected: {
    borderColor: COLORS.accentCyan,
    backgroundColor: 'rgba(0, 210, 255, 0.12)',
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: '#242d3e',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  sourceName: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  sourceNameSelected: {
    color: COLORS.accentCyan,
    fontWeight: '700',
  },
  osdSourceBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: '#19202c',
    borderWidth: 1,
    borderColor: '#2b364a',
    gap: 8,
    marginBottom: 10,
  },
  osdSourceText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.accentCyan,
  },
});
