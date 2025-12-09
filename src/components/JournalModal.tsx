import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Modal,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';

interface JournalModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (notes: string) => void;
  initialNotes?: string;
}

/**
 * JournalModal - Popup for journaling after saving mood
 */
export const JournalModal: React.FC<JournalModalProps> = ({
  visible,
  onClose,
  onSave,
  initialNotes = '',
}) => {
  const [notes, setNotes] = useState(initialNotes);

  // Update notes when modal opens with new initialNotes
  useEffect(() => {
    if (visible) {
      setNotes(initialNotes || '');
    }
  }, [visible, initialNotes]);

  const handleSave = () => {
    onSave(notes);
    onClose();
  };

  const handleSkip = () => {
    // If there were existing notes, preserve them
    if (initialNotes) {
      onSave(initialNotes);
    } else {
      onSave('');
    }
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleSkip}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.modalOverlay}
      >
        <View style={styles.modalContent}>
          <Text style={styles.title}>How are you feeling?</Text>
          <Text style={styles.subtitle}>
            {initialNotes ? 'Edit your journal entry (optional)' : 'Add a note about your mood (optional)'}
          </Text>

          <TextInput
            style={styles.input}
            placeholder="Write your thoughts here..."
            placeholderTextColor="rgba(0, 0, 0, 0.4)"
            multiline
            numberOfLines={6}
            value={notes}
            onChangeText={setNotes}
            autoFocus
          />

          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.button, styles.skipButton]}
              onPress={handleSkip}
            >
              <Text style={styles.skipButtonText}>
                {initialNotes ? 'Keep Original' : 'Skip'}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, styles.saveButton]}
              onPress={handleSave}
            >
              <Text style={styles.saveButtonText}>Save</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 24,
    width: '100%',
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#333',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#333',
    minHeight: 120,
    textAlignVertical: 'top',
    marginBottom: 20,
    backgroundColor: '#f9f9f9',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  button: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  skipButton: {
    backgroundColor: '#f0f0f0',
  },
  skipButtonText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '600',
  },
  saveButton: {
    backgroundColor: '#007AFF',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});