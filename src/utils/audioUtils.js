/**
 * Audio URL Manager for managing Blob URLs and revoking them to prevent memory leaks
 */
class AudioUrlManager {
  constructor() {
    this.activeUrls = new Map(); // key: songId, value: objectUrl
  }

  /**
   * Get an object URL for a given song Blob. Reuses existing URL if already created.
   * @param {string} songId
   * @param {Blob} blob
   * @returns {string}
   */
  getUrl(songId, blob) {
    if (!songId || !blob) return null;
    if (this.activeUrls.has(songId)) {
      return this.activeUrls.get(songId);
    }
    const url = URL.createObjectURL(blob);
    this.activeUrls.set(songId, url);
    return url;
  }

  /**
   * Revoke a single song's object URL
   * @param {string} songId
   */
  revoke(songId) {
    if (this.activeUrls.has(songId)) {
      const url = this.activeUrls.get(songId);
      try {
        URL.revokeObjectURL(url);
      } catch (e) {
        console.warn('Failed to revoke object URL', e);
      }
      this.activeUrls.delete(songId);
    }
  }

  /**
   * Revoke all active object URLs
   */
  revokeAll() {
    for (const [id, url] of this.activeUrls.entries()) {
      try {
        URL.revokeObjectURL(url);
      } catch (e) {
        // ignore
      }
    }
    this.activeUrls.clear();
  }
}

export const audioUrlManager = new AudioUrlManager();

/**
 * Creates a synthetic demo audio track entirely in memory using Web Audio API
 * and exports it as a valid WAV Blob. This provides an instant offline test track.
 * @param {Object} options
 * @returns {Promise<{blob: Blob, duration: number}>}
 */
export async function generateSyntheticTrack({
  title = 'TuneFlow Chill Demo',
  artist = 'TuneFlow Synthesizer',
  style = 'ambient',
  duration = 12,
} = {}) {
  const sampleRate = 44100;
  const numChannels = 2;
  const numFrames = sampleRate * duration;

  const offlineCtx = new (window.OfflineAudioContext || window.webkitOfflineAudioContext)(
    numChannels,
    numFrames,
    sampleRate
  );

  if (style === 'synthwave') {
    // 80s Synthwave bassline & arpeggio
    const bassFreqs = [110, 110, 130.81, 98.0, 87.31, 87.31, 98.0, 110];
    const stepDuration = duration / bassFreqs.length;

    bassFreqs.forEach((freq, idx) => {
      const start = idx * stepDuration;
      const osc = offlineCtx.createOscillator();
      const gain = offlineCtx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(freq, start);

      gain.gain.setValueAtTime(0, start);
      gain.gain.linearRampToValueAtTime(0.12, start + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, start + stepDuration - 0.02);

      osc.connect(gain);
      gain.connect(offlineCtx.destination);

      osc.start(start);
      osc.stop(start + stepDuration);

      // Lead melody note
      const leadOsc = offlineCtx.createOscillator();
      const leadGain = offlineCtx.createGain();
      leadOsc.type = 'triangle';
      leadOsc.frequency.setValueAtTime(freq * 3, start);

      leadGain.gain.setValueAtTime(0, start);
      leadGain.gain.linearRampToValueAtTime(0.06, start + 0.1);
      leadGain.gain.exponentialRampToValueAtTime(0.001, start + stepDuration - 0.04);

      leadOsc.connect(leadGain);
      leadGain.connect(offlineCtx.destination);

      leadOsc.start(start);
      leadOsc.stop(start + stepDuration);
    });
  } else {
    // Ambient chord progression: Cmaj7 - Am7 - Fmaj7 - G
    const chordNotes = [
      [261.63, 329.63, 392.0, 493.88], // Cmaj7
      [220.0, 261.63, 329.63, 392.0],  // Am7
      [174.61, 220.0, 261.63, 329.63], // Fmaj7
      [196.0, 246.94, 293.66, 392.0],  // G
    ];

    const chordDuration = duration / chordNotes.length;

    chordNotes.forEach((notes, chordIdx) => {
      const startTime = chordIdx * chordDuration;
      notes.forEach((freq, noteIdx) => {
        const osc = offlineCtx.createOscillator();
        const gain = offlineCtx.createGain();

        osc.type = noteIdx % 2 === 0 ? 'sine' : 'triangle';
        osc.frequency.setValueAtTime(freq, startTime);

        gain.gain.setValueAtTime(0, startTime);
        gain.gain.linearRampToValueAtTime(0.07, startTime + 0.2);
        gain.gain.exponentialRampToValueAtTime(0.001, startTime + chordDuration - 0.05);

        osc.connect(gain);
        gain.connect(offlineCtx.destination);

        osc.start(startTime);
        osc.stop(startTime + chordDuration);
      });
    });
  }

  const renderedBuffer = await offlineCtx.startRendering();
  const wavBlob = audioBufferToWav(renderedBuffer);

  return {
    blob: wavBlob,
    duration,
  };
}

/**
 * Convert AudioBuffer to WAV format Blob
 */
function audioBufferToWav(buffer) {
  const numChannels = buffer.numberOfChannels;
  const sampleRate = buffer.sampleRate;
  const format = 1; // PCM
  const bitDepth = 16;

  const bytesPerSample = bitDepth / 8;
  const blockAlign = numChannels * bytesPerSample;

  const dataLength = buffer.length * blockAlign;
  const bufferLength = 44 + dataLength;
  const arrayBuffer = new ArrayBuffer(bufferLength);
  const view = new DataView(arrayBuffer);

  function writeString(offset, string) {
    for (let i = 0; i < string.length; i++) {
      view.setUint8(offset + i, string.charCodeAt(i));
    }
  }

  // RIFF identifier
  writeString(0, 'RIFF');
  view.setUint32(4, 36 + dataLength, true);
  writeString(8, 'WAVE');
  // format chunk
  writeString(12, 'fmt ');
  view.setUint32(16, 16, true); // chunk length
  view.setUint16(20, format, true);
  view.setUint16(22, numChannels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * blockAlign, true); // byte rate
  view.setUint16(32, blockAlign, true);
  view.setUint16(34, bitDepth, true);
  // data chunk
  writeString(36, 'data');
  view.setUint32(40, dataLength, true);

  // Write interleaved PCM samples
  let offset = 44;
  for (let i = 0; i < buffer.length; i++) {
    for (let channel = 0; channel < numChannels; channel++) {
      const sample = Math.max(-1, Math.min(1, buffer.getChannelData(channel)[i]));
      const intSample = sample < 0 ? sample * 0x8000 : sample * 0x7fff;
      view.setInt16(offset, intSample, true);
      offset += 2;
    }
  }

  return new Blob([arrayBuffer], { type: 'audio/wav' });
}
