import React, { useState, useEffect } from 'react';
import { View, TextInput, TouchableOpacity, Text, StyleSheet, Platform, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

import { PermissionsAndroid } from 'react-native';

interface TaskInputProps {
  onTaskSubmit: (task: string) => void;
  isProcessing: boolean;
}

async function requestMicrophonePermission() {
  if (Platform.OS !== 'android') return true;

  try {
    const granted = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
      {
        title: 'Microphone Permission',
        message: 'This app needs access to your microphone for speech recognition',
        buttonPositive: 'OK',
      }
    );
    return granted === PermissionsAndroid.RESULTS.GRANTED;
  } catch (err) {
    console.warn(err);
    return false;
  }
}

export default function TaskInput({ onTaskSubmit, isProcessing }: TaskInputProps) {
  const [task, setTask] = useState('');
  const [isListening, setIsListening] = useState(false);

  // useEffect(() => {
  //   if (!isListening) return;

  //   const onSpeechResults = (result: string) => {
  //     setTask(result);
  //     setIsListening(false);
  //   };

  //   const onSpeechError = (error: any) => {
  //     setIsListening(false);
  //   };

  //   VoiceToText.on(VoiceToTextEvents.onSpeechResults, onSpeechResults);
  //   VoiceToText.on(VoiceToTextEvents.onSpeechError, onSpeechError);

  //   return () => {
  //     VoiceToText.off(VoiceToTextEvents.onSpeechResults, onSpeechResults);
  //     VoiceToText.off(VoiceToTextEvents.onSpeechError, onSpeechError);
  //   };
  // }, [isListening]);

  const handleSubmit = () => {
    if (task.trim()) {
      onTaskSubmit(task.trim());
      setTask('');
    }
  };

  const startVoiceInput = async () => {
    // setIsListening(true);

    // const hasPermission = await requestMicrophonePermission();
    // if (!hasPermission) {
    //   setIsListening(false);
    // }
    Alert.alert('Voice Input Coming Soon on Android...')
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>What errands do you need to run?</Text>
      <Text style={styles.subtitle}>
        Tell me your tasks and I'll find the best places nearby
      </Text>

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="e.g., Buy groceries, pick up medicine, grab coffee..."
          value={task}
          onChangeText={setTask}
          multiline
          placeholderTextColor="#9CA3AF"
        />

        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={[styles.voiceButton, isListening && styles.listeningButton]}
            onPress={startVoiceInput}
            disabled={isProcessing || isListening}
          >
            <Ionicons
              name={isListening ? "radio-button-on" : "mic"}
              size={24}
              color={isListening ? "#EF4444" : "#6B7280"}
            />
            <Text style={[styles.voiceButtonText, isListening && styles.listeningText]}>
              {isListening ? "Listening..." : "Voice"}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleSubmit}
            disabled={!task.trim() || isProcessing}
            style={styles.submitButtonContainer}
          >
            <LinearGradient
              colors={task.trim() && !isProcessing ? ['#3B82F6', '#1D4ED8'] : ['#E5E7EB', '#D1D5DB']}
              style={styles.submitButton}
            >
              {isProcessing ? (
                <Ionicons name="hourglass" size={20} color="#FFFFFF" />
              ) : (
                <Ionicons name="send" size={20} color="#FFFFFF" />
              )}
              <Text style={styles.submitButtonText}>
                {isProcessing ? "Planning..." : "Plan Errands"}
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: '#1F2937',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 24,
  },
  inputContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  input: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#1F2937',
    minHeight: 80,
    textAlignVertical: 'top',
    padding: 16,
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: 16,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
  },
  voiceButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 20,
    flex: 1,
    gap: 8,
  },
  listeningButton: {
    backgroundColor: '#FEF2F2',
  },
  voiceButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#6B7280',
  },
  listeningText: {
    color: '#EF4444',
  },
  submitButtonContainer: {
    flex: 2,
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 20,
    gap: 8,
  },
  submitButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
  },
});