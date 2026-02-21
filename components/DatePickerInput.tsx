import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
  Modal,
} from 'react-native';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { Calendar } from 'lucide-react-native';
import { Colors } from '@/constants/colors';

interface DatePickerInputProps {
  value: string; // ISO date string "YYYY-MM-DD"
  onChange: (date: string) => void;
  style?: object;
}

export default function DatePickerInput({ value, onChange, style }: DatePickerInputProps) {
  const [show, setShow] = useState(false);
  const [tempDate, setTempDate] = useState<Date | null>(null);

  const date = value
    ? new Date(parseInt(value.slice(0, 4)), parseInt(value.slice(5, 7)) - 1, parseInt(value.slice(8, 10)))
    : new Date();

  const formatDisplay = (d: Date) => {
    return d.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  const toIso = (d: Date) =>
    [
      d.getFullYear(),
      String(d.getMonth() + 1).padStart(2, '0'),
      String(d.getDate()).padStart(2, '0'),
    ].join('-');

  const handleChange = (_event: DateTimePickerEvent, selected?: Date) => {
    if (Platform.OS === 'android') {
      setShow(false);
      if (selected) {
        onChange(toIso(selected));
      }
    } else {
      // iOS: accumulate selection until user taps Done
      if (selected) {
        setTempDate(selected);
      }
    }
  };

  const handleIosDone = () => {
    setShow(false);
    if (tempDate) {
      onChange(toIso(tempDate));
    }
    setTempDate(null);
  };

  const handleOpen = () => {
    setTempDate(date);
    setShow(true);
  };

  return (
    <View style={[styles.container, style]}>
      <TouchableOpacity style={styles.button} onPress={handleOpen}>
        <Calendar size={20} color={Colors.textSecondary} />
        <Text style={styles.text}>{formatDisplay(date)}</Text>
      </TouchableOpacity>
      {Platform.OS === 'ios' ? (
        <Modal visible={show} transparent animationType="slide">
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <TouchableOpacity onPress={() => { setShow(false); setTempDate(null); }}>
                  <Text style={styles.cancelText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={handleIosDone}>
                  <Text style={styles.doneText}>Done</Text>
                </TouchableOpacity>
              </View>
              <DateTimePicker
                value={tempDate ?? date}
                mode="date"
                display="spinner"
                onChange={handleChange}
                style={styles.iosPicker}
              />
            </View>
          </View>
        </Modal>
      ) : (
        show && (
          <DateTimePicker
            value={date}
            mode="date"
            display="default"
            onChange={handleChange}
          />
        )
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.card,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 12,
  },
  text: {
    flex: 1,
    fontSize: 16,
    color: Colors.text,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: Colors.overlay,
  },
  modalContent: {
    backgroundColor: Colors.card,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingBottom: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  cancelText: {
    fontSize: 16,
    color: Colors.textSecondary,
  },
  doneText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.primary,
  },
  iosPicker: {
    width: '100%',
  },
});
