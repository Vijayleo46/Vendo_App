import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

// Simple haptic feedback utility using expo-haptics
export const hapticFeedback = {
  light: () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch (e) {
      console.log('Light haptic feedback error');
    }
  },

  medium: () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch (e) {
      console.log('Medium haptic feedback error');
    }
  },

  heavy: () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    } catch (e) {
      console.log('Heavy haptic feedback error');
    }
  },

  selection: () => {
    try {
      Haptics.selectionAsync();
    } catch (e) {
      console.log('Selection haptic feedback error');
    }
  },

  impact: () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch (e) {
      console.log('Impact haptic feedback error');
    }
  }
};