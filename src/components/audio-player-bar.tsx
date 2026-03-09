import React, { useState, useMemo } from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
  Text,
  Modal,
  FlatList,
  Pressable,
} from 'react-native';
import { useAudioSync } from '../hooks/use-audio-sync';
import { getAvailableReciters } from '../services/ayah-timing-service';
import { toArabicDigits } from '../utils/linguistic';

interface Props {
  chapterNumber: number;
  onVerseChange: (verseNumber: number | null) => void;
}

export const AudioPlayerBar: React.FC<Props> = ({
  chapterNumber,
  onVerseChange,
}) => {
  const [reciterId, setReciterId] = useState(1);
  const [reciterModalVisible, setReciterModalVisible] = useState(false);

  const {
    isPlaying,
    currentVerse,
    currentTimeMs,
    durationMs,
    togglePlay,
    nextVerse,
    previousVerse,
  } = useAudioSync({
    reciterId,
    chapterNumber,
    onVerseChange,
  });

  const reciters = useMemo(() => getAvailableReciters(), []);
  const currentReciter = reciters.find((r) => r.id === reciterId);

  const formatTime = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const progress = durationMs > 0 ? currentTimeMs / durationMs : 0;

  return (
    <View style={styles.container}>
      <View style={styles.progressBarContainer}>
        <View style={[styles.progressBar, { width: `${progress * 100}%` }]} />
      </View>

      <View style={styles.controls}>
        <TouchableOpacity
          style={styles.reciterButton}
          onPress={() => setReciterModalVisible(true)}
          accessibilityRole="button"
          accessibilityLabel={`القارئ: ${currentReciter?.name ?? ''}`}
          accessibilityHint="اضغط لاختيار قارئ آخر"
        >
          <Text style={styles.reciterName} numberOfLines={1}>
            {currentReciter?.name ?? ''}
          </Text>
        </TouchableOpacity>

        <View style={styles.mainControls}>
          <TouchableOpacity
            onPress={previousVerse}
            style={styles.controlButton}
            accessibilityLabel="الآية السابقة"
            accessibilityRole="button"
            accessibilityHint="الانتقال إلى الآية السابقة"
          >
            <Text style={styles.controlIcon}>⏮</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={togglePlay}
            style={styles.playButton}
            accessibilityLabel={isPlaying ? 'إيقاف مؤقت' : 'تشغيل'}
            accessibilityRole="button"
            accessibilityHint={isPlaying ? 'إيقاف التلاوة مؤقتاً' : 'بدء التلاوة'}
          >
            <Text style={styles.playIcon}>{isPlaying ? '⏸' : '▶'}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={nextVerse}
            style={styles.controlButton}
            accessibilityLabel="الآية التالية"
            accessibilityRole="button"
            accessibilityHint="الانتقال إلى الآية التالية"
          >
            <Text style={styles.controlIcon}>⏭</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.info}>
          {currentVerse !== null && currentVerse > 0 && (
            <Text style={styles.verseIndicator}>
              آية {toArabicDigits(currentVerse)}
            </Text>
          )}
          <Text style={styles.timeText}>
            {formatTime(currentTimeMs)} / {formatTime(durationMs)}
          </Text>
        </View>
      </View>

      <Modal
        visible={reciterModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setReciterModalVisible(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setReciterModalVisible(false)}
        >
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>اختيار القارئ</Text>
            <FlatList
              data={reciters}
              keyExtractor={(item) => item.id.toString()}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.reciterItem,
                    item.id === reciterId && styles.reciterItemActive,
                  ]}
                  onPress={() => {
                    setReciterId(item.id);
                    setReciterModalVisible(false);
                  }}
                >
                  <Text
                    style={[
                      styles.reciterItemText,
                      item.id === reciterId && styles.reciterItemTextActive,
                    ]}
                  >
                    {item.name}
                  </Text>
                  <Text style={styles.reciterItemSubtext}>{item.name_en}</Text>
                </TouchableOpacity>
              )}
            />
          </View>
        </Pressable>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#1B5E20',
  },
  progressBarContainer: {
    height: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#A5D6A7',
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  reciterButton: {
    flex: 1,
    marginRight: 8,
  },
  reciterName: {
    color: '#C8E6C9',
    fontSize: 12,
    fontWeight: '600',
  },
  mainControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  controlButton: {
    padding: 6,
  },
  controlIcon: {
    fontSize: 16,
    color: '#FFFFFF',
  },
  playButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  playIcon: {
    fontSize: 16,
    color: '#FFFFFF',
  },
  info: {
    flex: 1,
    alignItems: 'flex-end',
    marginLeft: 8,
  },
  verseIndicator: {
    color: '#A5D6A7',
    fontSize: 12,
    fontWeight: '700',
  },
  timeText: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 10,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    maxHeight: '60%',
    paddingBottom: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
    paddingVertical: 16,
    color: '#1B5E20',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  reciterItem: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E0E0E0',
  },
  reciterItemActive: {
    backgroundColor: '#E8F5E9',
  },
  reciterItemText: {
    fontSize: 16,
    color: '#333333',
    textAlign: 'right',
  },
  reciterItemTextActive: {
    color: '#1B5E20',
    fontWeight: '700',
  },
  reciterItemSubtext: {
    fontSize: 12,
    color: '#888888',
    textAlign: 'right',
    marginTop: 2,
  },
});
