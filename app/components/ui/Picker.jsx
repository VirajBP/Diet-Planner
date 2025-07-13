import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useTheme } from '../../context/ThemeContext';

const FRESH_CALM_LIGHT = {
  primary: '#2ECC71', // Mint Green
  secondary: '#A3E4D7',
  background: '#FDFEFE',
  surface: '#FFFFFF',
  text: '#1C1C1C',
  card: '#FFFFFF',
  border: '#A3E4D7',
  error: '#FF5252',
};

const FRESH_CALM_DARK = {
  primary: '#27AE60',
  secondary: '#48C9B0',
  background: '#121212',
  surface: '#1E1E1E',
  text: '#FAFAFA',
  card: '#1E1E1E',
  border: '#48C9B0',
  error: '#FF5252',
};

export const Picker = ({
  label,
  selectedValue,
  onValueChange,
  items,
  options,
  multiple = false,
  placeholder = 'Select an option',
}) => {
  const [modalVisible, setModalVisible] = useState(false);
  const { isDark } = useTheme();
  const customColors = isDark ? FRESH_CALM_DARK : FRESH_CALM_LIGHT;
  
  // Handle both items and options props for backward compatibility
  const pickerOptions = options || items || [];
  
  // Find the selected option's label
  const getDisplayText = () => {
    if (multiple) {
      if (!Array.isArray(selectedValue) || selectedValue.length === 0) {
        return placeholder;
      }
      const selectedLabels = selectedValue.map(value => 
        pickerOptions.find(opt => opt.value === value)?.label
      ).filter(Boolean);
      return selectedLabels.length > 0 ? selectedLabels.join(', ') : placeholder;
    } else {
      const selectedOption = pickerOptions.find(opt => opt.value === selectedValue);
      return selectedOption ? selectedOption.label : placeholder;
    }
  };

  const handleSelect = (value) => {
    if (multiple) {
      let newValue;
      if (Array.isArray(selectedValue)) {
        if (value === 'none') {
          newValue = ['none'];
        } else {
          if (selectedValue.includes(value)) {
            newValue = selectedValue.filter(v => v !== value);
          } else {
            newValue = selectedValue.filter(v => v !== 'none').concat(value);
          }
        }
      } else {
        newValue = [value];
      }
      onValueChange(newValue);
    } else {
      onValueChange(value);
      setModalVisible(false);
    }
  };

  const isSelected = (value) => {
    if (multiple) {
      return Array.isArray(selectedValue) && selectedValue.includes(value);
    }
    return selectedValue === value;
  };

  return (
    <View style={styles.container}>
      {label && <Text style={[styles.label, { color: customColors.text }]}>{label}</Text>}
      <TouchableOpacity
        style={[styles.pickerButton, { 
          backgroundColor: customColors.card,
          borderColor: customColors.border
        }]}
        onPress={() => setModalVisible(true)}
      >
        <Text style={[
          styles.pickerButtonText, 
          !selectedValue && styles.placeholder,
          { color: customColors.text }
        ]}>
          {getDisplayText()}
        </Text>
        <Ionicons name="chevron-down" size={20} color={customColors.text} />
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
          onPress={() => !multiple && setModalVisible(false)}
        >
          <View style={[styles.modalContent, { backgroundColor: customColors.background }]}>
            <View style={[styles.modalHeader, { borderBottomColor: customColors.border }]}>
              <Text style={[styles.modalTitle, { color: customColors.text }]}>{label || 'Select Option'}</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color={customColors.text} />
              </TouchableOpacity>
            </View>
            <ScrollView>
              {pickerOptions.map((option) => (
                <TouchableOpacity
                  key={option.value}
                  style={[
                    styles.option,
                    isSelected(option.value) && [styles.selectedOption, { backgroundColor: customColors.primary + '20' }],
                    { borderBottomColor: customColors.border }
                  ]}
                  onPress={() => handleSelect(option.value)}
                >
                  <Text style={[
                    styles.optionText,
                    isSelected(option.value) && [styles.selectedOptionText, { color: customColors.primary }],
                    { color: customColors.text }
                  ]}>
                    {option.label}
                  </Text>
                  {isSelected(option.value) && (
                    <Ionicons name="checkmark" size={20} color={customColors.primary} />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
            {multiple && (
              <View style={[styles.modalFooter, { borderTopColor: customColors.border }]}>
                <TouchableOpacity
                  style={[styles.doneButton, { backgroundColor: customColors.primary }]}
                  onPress={() => setModalVisible(false)}
                >
                  <Text style={[styles.doneButtonText, { color: isDark ? '#000000' : '#FFFFFF' }]}>
                    Done
                  </Text>
                </TouchableOpacity>
              </View>
            )}
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
  modalFooter: {
    padding: 16,
    borderTopWidth: 1,
  },
  doneButton: {
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  doneButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
}); 