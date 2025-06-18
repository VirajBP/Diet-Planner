import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useTheme } from '../../context/ThemeContext';

export const Picker = ({
  label,
  selectedValue,
  onValueChange,
  items,
  options,
  placeholder = 'Select an option',
}) => {
  const [modalVisible, setModalVisible] = useState(false);
  const { theme } = useTheme();
  
  // Handle both items and options props for backward compatibility
  const pickerOptions = options || items || [];
  
  // Find the selected option's label
  const selectedOption = pickerOptions.find(opt => opt.value === selectedValue);
  const displayText = selectedOption ? selectedOption.label : placeholder;

  return (
    <View style={styles.container}>
      {label && <Text style={[styles.label, { color: theme.colors.text }]}>{label}</Text>}
      <TouchableOpacity
        style={[styles.pickerButton, { 
          backgroundColor: theme.colors.card,
          borderColor: theme.colors.border
        }]}
        onPress={() => setModalVisible(true)}
      >
        <Text style={[
          styles.pickerButtonText, 
          !selectedValue && styles.placeholder,
          { color: theme.colors.text }
        ]}>
          {displayText}
        </Text>
        <Ionicons name="chevron-down" size={20} color={theme.colors.text} />
      </TouchableOpacity>

      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setModalVisible(false)}
        >
          <View style={[styles.modalContent, { backgroundColor: theme.colors.background }]}>
            <View style={[styles.modalHeader, { borderBottomColor: theme.colors.border }]}>
              <Text style={[styles.modalTitle, { color: theme.colors.text }]}>{label || 'Select Option'}</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color={theme.colors.text} />
              </TouchableOpacity>
            </View>
            <ScrollView>
              {pickerOptions.map((option) => (
                <TouchableOpacity
                  key={option.value}
                  style={[
                    styles.option,
                    selectedValue === option.value && [styles.selectedOption, { backgroundColor: theme.colors.primary + '20' }],
                    { borderBottomColor: theme.colors.border }
                  ]}
                  onPress={() => {
                    onValueChange(option.value);
                    setModalVisible(false);
                  }}
                >
                  <Text style={[
                    styles.optionText,
                    selectedValue === option.value && [styles.selectedOptionText, { color: theme.colors.primary }],
                    { color: theme.colors.text }
                  ]}>
                    {option.label}
                  </Text>
                  {selectedValue === option.value && (
                    <Ionicons name="checkmark" size={20} color={theme.colors.primary} />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
  },
  pickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 12,
    borderWidth: 1,
    padding: 12,
    height: 50,
  },
  pickerButtonText: {
    fontSize: 16,
  },
  placeholder: {
    opacity: 0.5,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  option: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
  },
  selectedOption: {
    backgroundColor: 'rgba(0, 122, 255, 0.1)',
  },
  optionText: {
    fontSize: 16,
  },
  selectedOptionText: {
    fontWeight: '500',
  },
}); 