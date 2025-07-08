// SoundEffects.js - Cult-themed Web Audio API sounds for mobile compatibility
// These sounds work on mobile devices without requiring external files

class CultSoundEffects {
  constructor() {
    this.audioContext = null;
    this.enabled = false;
    this.initializeAudio();
  }

  initializeAudio() {
    try {
      // Create AudioContext on user interaction to comply with mobile policies
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
      this.enabled = true;
    } catch (error) {
      console.log('Audio not supported:', error);
      this.enabled = false;
    }
  }

  // Ensure audio context is resumed (required for mobile)
  async ensureAudioReady() {
    if (!this.enabled || !this.audioContext) return false;
    
    if (this.audioContext.state === 'suspended') {
      try {
        await this.audioContext.resume();
      } catch (error) {
        console.log('Could not resume audio context:', error);
        return false;
      }
    }
    return true;
  }

  // Create mystical connection sound
  async playConnectSound() {
    if (!(await this.ensureAudioReady())) return;

    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(this.audioContext.destination);
    
    // Mystical ascending chord
    oscillator.frequency.setValueAtTime(220, this.audioContext.currentTime); // A3
    oscillator.frequency.exponentialRampToValueAtTime(440, this.audioContext.currentTime + 0.3); // A4
    oscillator.frequency.exponentialRampToValueAtTime(660, this.audioContext.currentTime + 0.6); // E5
    
    oscillator.type = 'triangle'; // Softer, more mystical sound
    
    gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.1, this.audioContext.currentTime + 0.1);
    gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.8);
    
    oscillator.start(this.audioContext.currentTime);
    oscillator.stop(this.audioContext.currentTime + 0.8);
  }

  // Create ethereal swap sound
  async playSwapSound() {
    if (!(await this.ensureAudioReady())) return;

    // Create multiple oscillators for a richer sound
    const oscillators = [];
    const gainNodes = [];
    
    // Base frequencies for a minor chord (mystical sound)
    const frequencies = [261.63, 311.13, 392.00]; // C4, D#4, G4
    
    frequencies.forEach((freq, index) => {
      const oscillator = this.audioContext.createOscillator();
      const gainNode = this.audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(this.audioContext.destination);
      
      oscillator.frequency.setValueAtTime(freq, this.audioContext.currentTime);
      oscillator.type = 'sine';
      
      // Staggered attack for ethereal effect
      const startTime = this.audioContext.currentTime + (index * 0.1);
      gainNode.gain.setValueAtTime(0, startTime);
      gainNode.gain.linearRampToValueAtTime(0.05, startTime + 0.1);
      gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + 1.0);
      
      oscillator.start(startTime);
      oscillator.stop(startTime + 1.0);
      
      oscillators.push(oscillator);
      gainNodes.push(gainNode);
    });
  }

  // Create subtle hover sound
  async playHoverSound() {
    if (!(await this.ensureAudioReady())) return;

    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(this.audioContext.destination);
    
    oscillator.frequency.setValueAtTime(800, this.audioContext.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(1200, this.audioContext.currentTime + 0.15);
    
    oscillator.type = 'triangle';
    
    gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.02, this.audioContext.currentTime + 0.05);
    gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.15);
    
    oscillator.start(this.audioContext.currentTime);
    oscillator.stop(this.audioContext.currentTime + 0.15);
  }

  // Create error/warning sound
  async playErrorSound() {
    if (!(await this.ensureAudioReady())) return;

    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(this.audioContext.destination);
    
    // Descending minor sound for error
    oscillator.frequency.setValueAtTime(400, this.audioContext.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(200, this.audioContext.currentTime + 0.5);
    
    oscillator.type = 'sawtooth';
    
    gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.08, this.audioContext.currentTime + 0.1);
    gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.5);
    
    oscillator.start(this.audioContext.currentTime);
    oscillator.stop(this.audioContext.currentTime + 0.5);
  }

  // Create ritual completion sound
  async playRitualCompleteSound() {
    if (!(await this.ensureAudioReady())) return;

    // Create a sequence of ascending tones
    const frequencies = [293.66, 369.99, 440.00, 554.37]; // D4, F#4, A4, C#5
    
    frequencies.forEach((freq, index) => {
      setTimeout(async () => {
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        oscillator.frequency.setValueAtTime(freq, this.audioContext.currentTime);
        oscillator.type = 'triangle';
        
        gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
        gainNode.gain.linearRampToValueAtTime(0.06, this.audioContext.currentTime + 0.1);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.6);
        
        oscillator.start(this.audioContext.currentTime);
        oscillator.stop(this.audioContext.currentTime + 0.6);
      }, index * 150);
    });
  }

  // Initialize sound on first user interaction
  initializeOnUserAction() {
    if (!this.enabled) {
      this.initializeAudio();
    }
  }
}

// Export singleton instance
export const cultSounds = new CultSoundEffects();

// Auto-initialize on first user interaction
document.addEventListener('click', () => {
  cultSounds.initializeOnUserAction();
}, { once: true });

document.addEventListener('touchstart', () => {
  cultSounds.initializeOnUserAction();
}, { once: true });
