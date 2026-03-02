import * as Speech from 'expo-speech';

export class SpeechService {
  private static isSpeaking = false;

  /**
   * Speak text in Malayalam
   * @param text The text to be spoken
   * @param onDone Callback when speech is finished
   */
  static async speakMalayalam(text: string, onDone?: () => void) {
    if (this.isSpeaking) {
      await this.stop();
    }

    this.isSpeaking = true;

    // Malayalam language code
    const languageCode = 'ml-IN';

    Speech.speak(text, {
      language: languageCode,
      pitch: 1.0,
      rate: 0.85, // Slightly slower for better clarity in Malayalam
      onDone: () => {
        this.isSpeaking = false;
        if (onDone) onDone();
      },
      onStopped: () => {
        this.isSpeaking = false;
        if (onDone) onDone();
      },
      onError: (error) => {
        console.error('Speech Error:', error);
        this.isSpeaking = false;
        if (onDone) onDone();
      }
    });
  }

  /**
   * Stop current speech
   */
  static async stop() {
    try {
      await Speech.stop();
    } catch (e) {
      console.log('Speech stop error:', e);
    }
    this.isSpeaking = false;
  }

  /**
   * Check if speech is currently active
   */
  static getIsSpeaking() {
    return this.isSpeaking;
  }
}
