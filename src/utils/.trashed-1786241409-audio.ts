/* v8 ignore start */
import { KeyboardSettings } from '../types';

// Synthesized typing sounds using Web Audio API to bypass external file downloads
class AudioSynthesizer {
  private ctx: AudioContext | null = null;
  private soundEnabled: boolean = true;

  private initContext() {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  setSoundEnabled(enabled: boolean) {
    this.soundEnabled = enabled;
  }

  playClick(type: KeyboardSettings['soundType']) {
    if (!this.soundEnabled || type === 'mute') return;

    try {
      this.initContext();
      if (!this.ctx) return;

      const time = this.ctx.currentTime;

      if (type === 'cherry_mx_blue') {
        // High-pitched sharp click + bottom out
        const osc1 = this.ctx.createOscillator();
        const gain1 = this.ctx.createGain();
        osc1.type = 'square';
        osc1.frequency.setValueAtTime(1200, time);
        osc1.frequency.exponentialRampToValueAtTime(100, time + 0.03);
        gain1.gain.setValueAtTime(0.1, time);
        gain1.gain.exponentialRampToValueAtTime(0.01, time + 0.03);

        const osc2 = this.ctx.createOscillator();
        const gain2 = this.ctx.createGain();
        osc2.type = 'triangle';
        osc2.frequency.setValueAtTime(250, time);
        osc2.frequency.exponentialRampToValueAtTime(50, time + 0.08);
        gain2.gain.setValueAtTime(0.15, time);
        gain2.gain.exponentialRampToValueAtTime(0.01, time + 0.08);

        osc1.connect(gain1);
        gain1.connect(this.ctx.destination);
        osc2.connect(gain2);
        gain2.connect(this.ctx.destination);

        osc1.start(time);
        osc2.start(time);
        osc1.stop(time + 0.04);
        osc2.stop(time + 0.09);

      } else if (type === 'linear_red') {
        // Soft bottom out without the sharp click
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(150, time);
        osc.frequency.exponentialRampToValueAtTime(50, time + 0.07);
        gain.gain.setValueAtTime(0.2, time);
        gain.gain.exponentialRampToValueAtTime(0.01, time + 0.07);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(time);
        osc.stop(time + 0.08);

      } else if (type === 'silent_tactile') {
        // Extremely muted thud
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(100, time);
        osc.frequency.exponentialRampToValueAtTime(40, time + 0.05);
        gain.gain.setValueAtTime(0.1, time);
        gain.gain.exponentialRampToValueAtTime(0.01, time + 0.05);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(time);
        osc.stop(time + 0.06);

      } else if (type === 'topre') {
        // "Thock" sound - deeper resonance, soft impact
        const osc1 = this.ctx.createOscillator();
        const gain1 = this.ctx.createGain();
        osc1.type = 'triangle';
        osc1.frequency.setValueAtTime(200, time);
        osc1.frequency.exponentialRampToValueAtTime(80, time + 0.1);
        gain1.gain.setValueAtTime(0.2, time);
        gain1.gain.exponentialRampToValueAtTime(0.01, time + 0.1);

        const osc2 = this.ctx.createOscillator();
        const gain2 = this.ctx.createGain();
        osc2.type = 'sine';
        osc2.frequency.setValueAtTime(80, time);
        osc2.frequency.exponentialRampToValueAtTime(40, time + 0.12);
        gain2.gain.setValueAtTime(0.15, time);
        gain2.gain.exponentialRampToValueAtTime(0.01, time + 0.12);

        osc1.connect(gain1);
        gain1.connect(this.ctx.destination);
        osc2.connect(gain2);
        gain2.connect(this.ctx.destination);

        osc1.start(time);
        osc2.start(time);
        osc1.stop(time + 0.11);
        osc2.stop(time + 0.13);

      } else if (type === 'buckling_spring') {
        // Metallic ping + heavy clack
        const osc1 = this.ctx.createOscillator();
        const gain1 = this.ctx.createGain();
        osc1.type = 'sawtooth';
        osc1.frequency.setValueAtTime(800, time);
        osc1.frequency.exponentialRampToValueAtTime(150, time + 0.05);
        gain1.gain.setValueAtTime(0.12, time);
        gain1.gain.exponentialRampToValueAtTime(0.01, time + 0.05);

        const osc2 = this.ctx.createOscillator();
        const gain2 = this.ctx.createGain();
        osc2.type = 'sine';
        osc2.frequency.setValueAtTime(1800, time);
        gain2.gain.setValueAtTime(0.04, time);
        gain2.gain.exponentialRampToValueAtTime(0.001, time + 0.2);

        osc1.connect(gain1);
        gain1.connect(this.ctx.destination);
        osc2.connect(gain2);
        gain2.connect(this.ctx.destination);

        osc1.start(time);
        osc2.start(time);
        osc1.stop(time + 0.06);
        osc2.stop(time + 0.21);

      } else if (type === 'mechanical') {
        // High-pitched switch click followed by a deeper keycap bottom-out
        const osc1 = this.ctx.createOscillator();
        const gain1 = this.ctx.createGain();
        osc1.type = 'triangle';
        osc1.frequency.setValueAtTime(1000, time);
        osc1.frequency.exponentialRampToValueAtTime(100, time + 0.04);
        gain1.gain.setValueAtTime(0.15, time);
        gain1.gain.exponentialRampToValueAtTime(0.01, time + 0.04);

        const osc2 = this.ctx.createOscillator();
        const gain2 = this.ctx.createGain();
        osc2.type = 'sine';
        osc2.frequency.setValueAtTime(120, time);
        osc2.frequency.exponentialRampToValueAtTime(50, time + 0.08);
        gain2.gain.setValueAtTime(0.25, time);
        gain2.gain.exponentialRampToValueAtTime(0.01, time + 0.08);

        osc1.connect(gain1);
        gain1.connect(this.ctx.destination);
        osc2.connect(gain2);
        gain2.connect(this.ctx.destination);

        osc1.start(time);
        osc2.start(time);
        osc1.stop(time + 0.05);
        osc2.stop(time + 0.09);

      } else if (type === 'chiclet') {
        // Snappy, subtle mid-frequency pop
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(350, time);
        osc.frequency.exponentialRampToValueAtTime(200, time + 0.03);
        gain.gain.setValueAtTime(0.1, time);
        gain.gain.exponentialRampToValueAtTime(0.01, time + 0.03);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(time);
        osc.stop(time + 0.04);

      } else if (type === 'typewriter') {
        // Metallic clack + tiny resonance ring
        const osc1 = this.ctx.createOscillator();
        const gain1 = this.ctx.createGain();
        osc1.type = 'sawtooth';
        osc1.frequency.setValueAtTime(800, time);
        osc1.frequency.exponentialRampToValueAtTime(80, time + 0.06);
        gain1.gain.setValueAtTime(0.1, time);
        gain1.gain.exponentialRampToValueAtTime(0.01, time + 0.06);

        const osc2 = this.ctx.createOscillator();
        const gain2 = this.ctx.createGain();
        osc2.type = 'sine';
        osc2.frequency.setValueAtTime(2200, time);
        gain2.gain.setValueAtTime(0.03, time);
        gain2.gain.exponentialRampToValueAtTime(0.001, time + 0.15);

        osc1.connect(gain1);
        gain1.connect(this.ctx.destination);
        osc2.connect(gain2);
        gain2.connect(this.ctx.destination);

        osc1.start(time);
        osc2.start(time);
        osc1.stop(time + 0.07);
        osc2.stop(time + 0.16);
      }
    } catch (e) {
      console.warn('Audio click synth failed to play:', e);
    }
  }

  playDynamicClick(key: string, type: KeyboardSettings['soundType']) {
    if (!this.soundEnabled || type === 'mute') return;

    try {
      this.initContext();
      if (!this.ctx) return;

      const time = this.ctx.currentTime;
      const cleanKey = key || '';

      // Base random jitter to prevent robotic monotony ("machine gun" effect)
      const randomJitter = (Math.random() - 0.5) * 15; // +/- 7.5 Hz

      // Helper to generate a character-dependent pitch variation (adds acoustic depth)
      const getCharOffset = (k: string) => {
        if (k.length !== 1) return 0;
        const code = k.charCodeAt(0);
        return ((code % 9) - 4) * 20; // range from -80Hz to +80Hz
      };

      const charOffset = getCharOffset(cleanKey);

      if (type === 'cherry_mx_blue' || type === 'mechanical' || type === 'topre' || type === 'buckling_spring' || type === 'linear_red' || type === 'silent_tactile') {
        let osc1Freq = 1000 + charOffset + randomJitter;
        let osc2Freq = 120 + (charOffset / 10) + (randomJitter / 2);
        let decayTime1 = 0.04;
        let decayTime2 = 0.08;
        let gain1Val = 0.15;
        let gain2Val = 0.25;
        let osc1Type: OscillatorType = 'triangle';
        const osc2Type: OscillatorType = 'sine';

        // Apply profile-specific base adjustments
        if (type === 'cherry_mx_blue') {
          osc1Freq = 1200 + charOffset + randomJitter;
          osc2Freq = 250 + (charOffset / 10) + randomJitter;
          osc1Type = 'square';
          decayTime1 = 0.03;
          gain1Val = 0.1;
          gain2Val = 0.15;
        } else if (type === 'linear_red') {
          osc1Freq = 150 + charOffset + randomJitter;
          osc2Freq = 50 + (charOffset / 10) + randomJitter;
          decayTime1 = 0.07;
          decayTime2 = 0.08;
          gain1Val = 0.2;
          gain2Val = 0; // Disable second osc
        } else if (type === 'silent_tactile') {
          osc1Freq = 100 + charOffset + randomJitter;
          osc2Freq = 40 + (charOffset / 10) + randomJitter;
          osc1Type = 'sine';
          decayTime1 = 0.05;
          decayTime2 = 0.06;
          gain1Val = 0.1;
          gain2Val = 0; // Disable second osc
        } else if (type === 'topre') {
          osc1Freq = 200 + charOffset + randomJitter;
          osc2Freq = 80 + (charOffset / 10) + randomJitter;
          decayTime1 = 0.1;
          decayTime2 = 0.12;
          gain1Val = 0.2;
          gain2Val = 0.15;
        } else if (type === 'buckling_spring') {
          osc1Freq = 800 + charOffset + randomJitter;
          osc2Freq = 1800 + charOffset * 2 + randomJitter * 2;
          osc1Type = 'sawtooth';
          decayTime1 = 0.05;
          decayTime2 = 0.2;
          gain1Val = 0.12;
          gain2Val = 0.04;
        }

        if (cleanKey === ' ' || cleanKey === 'Spacebar') {
          // Spacebar is deeper, heavier and has longer decay
          osc1Freq = (type === 'linear_red' || type === 'silent_tactile') ? osc1Freq * 0.8 : 650 + randomJitter;
          osc2Freq = (type === 'linear_red' || type === 'silent_tactile') ? osc2Freq : 85 + randomJitter / 2;
          decayTime1 *= 1.5;
          decayTime2 *= 1.5;
          gain1Val *= 0.8;
          gain2Val *= 1.4; // extra bottom-out weight
        } else if (cleanKey === 'Enter') {
          // Enter is solid and resonant
          osc1Freq = (type === 'linear_red' || type === 'silent_tactile') ? osc1Freq * 0.9 : 850 + randomJitter;
          osc2Freq = (type === 'linear_red' || type === 'silent_tactile') ? osc2Freq : 100 + randomJitter / 2;
          decayTime1 *= 1.2;
          decayTime2 *= 1.2;
          gain1Val *= 1.1;
          gain2Val *= 1.2;
        } else if (cleanKey === 'Backspace') {
          // Backspace is sharper and alert
          osc1Freq = (type === 'linear_red' || type === 'silent_tactile') ? osc1Freq * 1.1 : 1200 + randomJitter;
          osc2Freq = (type === 'linear_red' || type === 'silent_tactile') ? osc2Freq : 145 + randomJitter / 2;
          decayTime1 *= 0.8;
          decayTime2 *= 0.8;
          gain1Val *= 1.1;
          gain2Val *= 0.9;
        }

        const osc1 = this.ctx.createOscillator();
        const gain1 = this.ctx.createGain();
        osc1.type = osc1Type;
        osc1.frequency.setValueAtTime(osc1Freq, time);
        osc1.frequency.exponentialRampToValueAtTime(Math.max(10, osc1Freq / 10), time + decayTime1);
        gain1.gain.setValueAtTime(gain1Val, time);
        gain1.gain.exponentialRampToValueAtTime(0.005, time + decayTime1);

        osc1.connect(gain1);
        gain1.connect(this.ctx.destination);
        osc1.start(time);
        osc1.stop(time + decayTime1 + 0.01);

        if (gain2Val > 0) {
          const osc2 = this.ctx.createOscillator();
          const gain2 = this.ctx.createGain();
          osc2.type = osc2Type;
          osc2.frequency.setValueAtTime(osc2Freq, time);
          osc2.frequency.exponentialRampToValueAtTime(Math.max(5, osc2Freq / 2.4), time + decayTime2);
          gain2.gain.setValueAtTime(gain2Val, time);
          gain2.gain.exponentialRampToValueAtTime(0.005, time + decayTime2);

          osc2.connect(gain2);
          gain2.connect(this.ctx.destination);
          osc2.start(time);
          osc2.stop(time + decayTime2 + 0.01);
        }

      } else if (type === 'chiclet') {
        let oscFreq = 350 + charOffset / 2 + randomJitter;
        let decayTime = 0.03;
        let gainVal = 0.1;

        if (cleanKey === ' ' || cleanKey === 'Spacebar') {
          oscFreq = 220 + randomJitter;
          decayTime = 0.05;
          gainVal = 0.14;
        } else if (cleanKey === 'Enter') {
          oscFreq = 280 + randomJitter;
          decayTime = 0.04;
          gainVal = 0.12;
        } else if (cleanKey === 'Backspace') {
          oscFreq = 440 + randomJitter;
          decayTime = 0.025;
          gainVal = 0.12;
        }

        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(oscFreq, time);
        osc.frequency.exponentialRampToValueAtTime(Math.max(5, oscFreq / 1.75), time + decayTime);
        gain.gain.setValueAtTime(gainVal, time);
        gain.gain.exponentialRampToValueAtTime(0.005, time + decayTime);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(time);
        osc.stop(time + decayTime + 0.01);

      } else if (type === 'typewriter') {
        if (cleanKey === 'Enter') {
          // ENTER KEY: Gorgeous retro bell "Ding!" sound
          const oscBell1 = this.ctx.createOscillator();
          const oscBell2 = this.ctx.createOscillator();
          const gainBell = this.ctx.createGain();

          oscBell1.type = 'sine';
          oscBell1.frequency.setValueAtTime(1046.50 + randomJitter, time); // C6 Note
          
          oscBell2.type = 'sine';
          oscBell2.frequency.setValueAtTime(1567.98 + randomJitter * 1.5, time); // G6 Overtone

          gainBell.gain.setValueAtTime(0.08, time);
          gainBell.gain.exponentialRampToValueAtTime(0.001, time + 0.45); // highly resonant metal ring

          oscBell1.connect(gainBell);
          oscBell2.connect(gainBell);
          gainBell.connect(this.ctx.destination);

          oscBell1.start(time);
          oscBell2.start(time);
          oscBell1.stop(time + 0.5);
          oscBell2.stop(time + 0.5);

          // Add a subtle heavy physical typewriter bar clack
          const oscClack = this.ctx.createOscillator();
          const gainClack = this.ctx.createGain();
          oscClack.type = 'sawtooth';
          oscClack.frequency.setValueAtTime(250 + randomJitter, time);
          oscClack.frequency.exponentialRampToValueAtTime(50, time + 0.05);
          gainClack.gain.setValueAtTime(0.12, time);
          gainClack.gain.exponentialRampToValueAtTime(0.001, time + 0.05);
          oscClack.connect(gainClack);
          gainClack.connect(this.ctx.destination);
          oscClack.start(time);
          oscClack.stop(time + 0.06);

        } else if (cleanKey === 'Backspace') {
          // Backspace is a double quick mechanical ratchet click (cl-clack)
          const playTick = (delay: number) => {
            const t = time + delay;
            const osc = this.ctx!.createOscillator();
            const gain = this.ctx!.createGain();
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(1100 + randomJitter, t);
            osc.frequency.exponentialRampToValueAtTime(100, t + 0.02);
            gain.gain.setValueAtTime(0.14, t);
            gain.gain.exponentialRampToValueAtTime(0.005, t + 0.02);
            osc.connect(gain);
            gain.connect(this.ctx!.destination);
            osc.start(t);
            osc.stop(t + 0.025);
          };
          playTick(0);
          playTick(0.04);

        } else if (cleanKey === ' ' || cleanKey === 'Spacebar') {
          // Spacebar has heavy wooden slide & solid hollow release thud
          const oscThud = this.ctx.createOscillator();
          const gainThud = this.ctx.createGain();
          oscThud.type = 'triangle';
          oscThud.frequency.setValueAtTime(180 + randomJitter, time);
          oscThud.frequency.exponentialRampToValueAtTime(30, time + 0.12);
          gainThud.gain.setValueAtTime(0.2, time);
          gainThud.gain.exponentialRampToValueAtTime(0.005, time + 0.12);
          oscThud.connect(gainThud);
          gainThud.connect(this.ctx.destination);
          oscThud.start(time);
          oscThud.stop(time + 0.13);

          const oscRing = this.ctx.createOscillator();
          const gainRing = this.ctx.createGain();
          oscRing.type = 'sine';
          oscRing.frequency.setValueAtTime(1500 + randomJitter * 2, time);
          gainRing.gain.setValueAtTime(0.02, time);
          gainRing.gain.exponentialRampToValueAtTime(0.001, time + 0.1);
          oscRing.connect(gainRing);
          gainRing.connect(this.ctx.destination);
          oscRing.start(time);
          oscRing.stop(time + 0.11);

        } else {
          // Standard typewriter mechanical clack
          const osc1Freq = 800 + charOffset + randomJitter;
          const osc2Freq = 2200 + charOffset * 2.5 + randomJitter * 3;
          const decayTime1 = 0.06;
          const decayTime2 = 0.15;
          const gain1Val = 0.1;
          const gain2Val = 0.03;

          const osc1 = this.ctx.createOscillator();
          const gain1 = this.ctx.createGain();
          osc1.type = 'sawtooth';
          osc1.frequency.setValueAtTime(osc1Freq, time);
          osc1.frequency.exponentialRampToValueAtTime(Math.max(10, osc1Freq / 10), time + decayTime1);
          gain1.gain.setValueAtTime(gain1Val, time);
          gain1.gain.exponentialRampToValueAtTime(0.005, time + decayTime1);

          const osc2 = this.ctx.createOscillator();
          const gain2 = this.ctx.createGain();
          osc2.type = 'sine';
          osc2.frequency.setValueAtTime(osc2Freq, time);
          gain2.gain.setValueAtTime(gain2Val, time);
          gain2.gain.exponentialRampToValueAtTime(0.001, time + decayTime2);

          osc1.connect(gain1);
          gain1.connect(this.ctx.destination);
          osc2.connect(gain2);
          gain2.connect(this.ctx.destination);

          osc1.start(time);
          osc2.start(time);
          osc1.stop(time + decayTime1 + 0.01);
          osc2.stop(time + decayTime2 + 0.01);
        }
      }
    } catch (e) {
      console.warn('Audio dynamic click synth failed to play:', e);
    }
  }

  playError() {
    if (!this.soundEnabled) return;

    try {
      this.initContext();
      if (!this.ctx) return;

      const time = this.ctx.currentTime;
      // Harsh low frequency buzz
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(130, time);
      osc.frequency.linearRampToValueAtTime(110, time + 0.15);
      gain.gain.setValueAtTime(0.15, time);
      gain.gain.exponentialRampToValueAtTime(0.01, time + 0.15);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(time);
      osc.stop(time + 0.16);
    } catch (e) {
      console.warn('Audio error synth failed to play:', e);
    }
  }

  playSuccess() {
    if (!this.soundEnabled) return;

    try {
      this.initContext();
      if (!this.ctx) return;

      const time = this.ctx.currentTime;
      const notes = [261.63, 329.63, 392.00, 523.25]; // C4, E4, G4, C5 arpeggio
      
      notes.forEach((freq, idx) => {
        const noteTime = time + (idx * 0.08);
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();
        
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, noteTime);
        
        gain.gain.setValueAtTime(0.12, noteTime);
        gain.gain.exponentialRampToValueAtTime(0.01, noteTime + 0.25);
        
        osc.connect(gain);
        gain.connect(this.ctx!.destination);
        
        osc.start(noteTime);
        osc.stop(noteTime + 0.3);
      });
    } catch (e) {
      console.warn('Audio success synth failed to play:', e);
    }
  }
}

export const audioSynth = new AudioSynthesizer();
export default audioSynth;
/* v8 ignore stop */
