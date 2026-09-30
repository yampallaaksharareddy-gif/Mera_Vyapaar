import { SupportedLanguage } from '../types';
import { apiUrl } from '../utils/apiUrl';

export interface BhashiniTranscriptionResult {
  transcript: string;
  sourceLanguage: SupportedLanguage;
  confidence?: number;
  engine: 'BHASHINI-ASR' | 'BHASHINI-ULCA';
  error?: string;
}

export interface BhashiniLangConfig {
  bhashiniCode: string;
  bcp47: string;
  label: string;
  script: string;
  serviceId: string;
}

export const BHASHINI_LANG_CODES: Record<SupportedLanguage, BhashiniLangConfig> = {
  hi: { bhashiniCode: 'hi', bcp47: 'hi-IN', label: 'Hindi (हिन्दी)', script: 'Devanagari', serviceId: 'ai4bharat/conformer-hi' },
  mr: { bhashiniCode: 'mr', bcp47: 'mr-IN', label: 'Marathi (मराठी)', script: 'Devanagari', serviceId: 'ai4bharat/conformer-mr' },
  te: { bhashiniCode: 'te', bcp47: 'te-IN', label: 'Telugu (తెలుగు)', script: 'Telugu', serviceId: 'ai4bharat/conformer-te' },
  ta: { bhashiniCode: 'ta', bcp47: 'ta-IN', label: 'Tamil (தமிழ்)', script: 'Tamil', serviceId: 'ai4bharat/conformer-ta' },
  bn: { bhashiniCode: 'bn', bcp47: 'bn-IN', label: 'Bengali (বাংলা)', script: 'Bengali', serviceId: 'ai4bharat/conformer-bn' },
  en: { bhashiniCode: 'en', bcp47: 'en-IN', label: 'Indian English', script: 'Latin', serviceId: 'ai4bharat/conformer-en' }
};

/**
 * Encodes Float32Array audio buffer into a 16-bit PCM WAV ArrayBuffer at 16000Hz.
 */
export const encodeWav16k = (samples: Float32Array, sampleRate: number): ArrayBuffer => {
  let pcmSamples = samples;
  const targetSampleRate = 16000;

  if (sampleRate !== targetSampleRate) {
    const ratio = sampleRate / targetSampleRate;
    const newLength = Math.round(samples.length / ratio);
    const result = new Float32Array(newLength);
    let offsetResult = 0;
    let offsetBuffer = 0;

    while (offsetResult < newLength) {
      const nextOffsetBuffer = Math.round((offsetResult + 1) * ratio);
      let accum = 0;
      let count = 0;
      for (let i = offsetBuffer; i < nextOffsetBuffer && i < samples.length; i++) {
        accum += samples[i];
        count++;
      }
      result[offsetResult] = count > 0 ? accum / count : 0;
      offsetResult++;
      offsetBuffer = nextOffsetBuffer;
    }
    pcmSamples = result;
  }

  const numChannels = 1;
  const bytesPerSample = 2; // 16-bit PCM
  const blockAlign = numChannels * bytesPerSample;
  const byteRate = targetSampleRate * blockAlign;
  const dataSize = pcmSamples.length * bytesPerSample;
  const buffer = new ArrayBuffer(44 + dataSize);
  const view = new DataView(buffer);

  const writeString = (offset: number, str: string) => {
    for (let i = 0; i < str.length; i++) {
      view.setUint8(offset + i, str.charCodeAt(i));
    }
  };

  /* RIFF chunk descriptor */
  writeString(0, 'RIFF');
  view.setUint32(4, 36 + dataSize, true);
  writeString(8, 'WAVE');

  /* "fmt " sub-chunk */
  writeString(12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true); // PCM
  view.setUint16(22, numChannels, true);
  view.setUint32(24, targetSampleRate, true);
  view.setUint32(28, byteRate, true);
  view.setUint16(32, blockAlign, true);
  view.setUint16(34, 16, true); // 16-bit

  /* "data" sub-chunk */
  writeString(36, 'data');
  view.setUint32(40, dataSize, true);

  let offset = 44;
  for (let i = 0; i < pcmSamples.length; i++) {
    const s = Math.max(-1, Math.min(1, pcmSamples[i]));
    view.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7fff, true);
    offset += 2;
  }

  return buffer;
};

/**
 * Converts ArrayBuffer bytes into Base64 string without data URL prefix.
 */
export const arrayBufferToBase64 = (buffer: ArrayBuffer): string => {
  let binary = '';
  const bytes = new Uint8Array(buffer);
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return typeof btoa !== 'undefined' ? btoa(binary) : Buffer.from(binary, 'binary').toString('base64');
};

export class BhashiniSTTEngine {
  private isListening: boolean = false;
  private stream: MediaStream | null = null;
  private audioContext: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private scriptProcessor: ScriptProcessorNode | null = null;
  private pcmBuffers: Float32Array[] = [];
  private animFrameId: number | null = null;
  private currentLanguage: SupportedLanguage = 'hi';
  private volumeCallback: ((volume: number) => void) | null = null;

  public isSupported(): boolean {
    return !!(
      typeof navigator !== 'undefined' &&
      navigator.mediaDevices &&
      !!navigator.mediaDevices.getUserMedia &&
      (window.AudioContext || (window as any).webkitAudioContext)
    );
  }

  public getLanguageConfig(lang: SupportedLanguage): BhashiniLangConfig {
    return BHASHINI_LANG_CODES[lang] || BHASHINI_LANG_CODES.hi;
  }

  /**
   * Starts real microphone recording with PCM audio buffer collection & live volume meter
   */
  public async startSession(
    lang: SupportedLanguage,
    onInterimTranscript: (text: string) => void,
    onFinalTranscript: (result: BhashiniTranscriptionResult) => void,
    onError: (err: Error) => void,
    onVolume?: (volume: number) => void
  ): Promise<boolean> {
    this.currentLanguage = lang;
    this.isListening = true;
    this.pcmBuffers = [];
    this.volumeCallback = onVolume || null;

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Microphone access is not supported on this browser/device.');
      }

      this.stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          channelCount: 1,
          sampleRate: 16000,
          echoCancellation: true,
          noiseSuppression: true
        }
      });

      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      this.audioContext = new AudioContextClass();

      const source = this.audioContext.createMediaStreamSource(this.stream);
      this.analyser = this.audioContext.createAnalyser();
      this.analyser.fftSize = 64;
      source.connect(this.analyser);

      // Setup ScriptProcessorNode to capture PCM audio samples
      this.scriptProcessor = this.audioContext.createScriptProcessor(4096, 1, 1);
      this.scriptProcessor.onaudioprocess = (e) => {
        if (!this.isListening) return;
        const inputData = e.inputBuffer.getChannelData(0);
        const bufferCopy = new Float32Array(inputData.length);
        bufferCopy.set(inputData);
        this.pcmBuffers.push(bufferCopy);
      };

      source.connect(this.scriptProcessor);
      this.scriptProcessor.connect(this.audioContext.destination);

      // Volume visualization loop
      const bufferLength = this.analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);

      const updateVolume = () => {
        if (!this.isListening || !this.analyser) return;
        this.analyser.getByteFrequencyData(dataArray);
        let sum = 0;
        for (let i = 0; i < bufferLength; i++) {
          sum += dataArray[i];
        }
        const average = sum / bufferLength;
        const normalized = Math.min(100, Math.round((average / 255) * 100));
        if (this.volumeCallback) {
          this.volumeCallback(normalized);
        }
        this.animFrameId = requestAnimationFrame(updateVolume);
      };
      updateVolume();

      // Show initial listening status feedback
      onInterimTranscript('Listening...');

      return true;
    } catch (micErr: any) {
      console.warn('[BHASHINI ASR] Microphone start notice:', micErr);
      this.cleanup();
      onError(micErr as Error);
      return false;
    }
  }

  /**
   * Stops microphone recording, encodes PCM audio to 16kHz WAV Base64, and sends request to BHASHINI ASR server endpoint
   */
  public async stopSession(): Promise<BhashiniTranscriptionResult> {
    this.isListening = false;

    // 1. Gather all PCM sample buffers
    const totalSamples = this.pcmBuffers.reduce((sum, b) => sum + b.length, 0);
    const combinedSamples = new Float32Array(totalSamples);
    let sampleOffset = 0;
    for (const buf of this.pcmBuffers) {
      combinedSamples.set(buf, sampleOffset);
      sampleOffset += buf.length;
    }

    const currentSampleRate = this.audioContext?.sampleRate || 16000;

    // 2. Clean up media stream and AudioContext
    this.cleanup();

    if (totalSamples === 0) {
      return {
        transcript: '',
        sourceLanguage: this.currentLanguage,
        engine: 'BHASHINI-ASR',
        error: 'No speech audio captured.'
      };
    }

    // 3. Encode to 16-bit 16kHz WAV ArrayBuffer and Base64 string
    const wavBuffer = encodeWav16k(combinedSamples, currentSampleRate);
    const base64Wav = arrayBufferToBase64(wavBuffer);

    // 4. Send real audio request to BHASHINI ASR server endpoint
    return await this.transcribeViaBhashiniServer(base64Wav, this.currentLanguage);
  }

  /**
   * Cleans up Web Audio nodes, MediaStream tracks, and animation frames.
   */
  private cleanup() {
    this.isListening = false;

    if (this.animFrameId) {
      cancelAnimationFrame(this.animFrameId);
      this.animFrameId = null;
    }

    if (this.scriptProcessor) {
      try {
        this.scriptProcessor.disconnect();
      } catch (e) {}
      this.scriptProcessor = null;
    }

    if (this.analyser) {
      try {
        this.analyser.disconnect();
      } catch (e) {}
      this.analyser = null;
    }

    if (this.audioContext) {
      try {
        this.audioContext.close();
      } catch (e) {}
      this.audioContext = null;
    }

    if (this.stream) {
      this.stream.getTracks().forEach((track) => track.stop());
      this.stream = null;
    }

    if (this.volumeCallback) {
      this.volumeCallback(0);
      this.volumeCallback = null;
    }
  }

  /**
   * Sends audio Base64 to BHASHINI ASR server endpoint `/api/bhashini/stt`
   */
  public async transcribeViaBhashiniServer(
    audioBase64: string,
    language: SupportedLanguage
  ): Promise<BhashiniTranscriptionResult> {
    try {
      console.log(`[BHASHINI ASR] Sending audio (${audioBase64.length} chars base64) to server...`);
      const res = await fetch(apiUrl('/api/bhashini/stt'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          audio: audioBase64,
          language,
          audioFormat: 'wav',
          samplingRate: 16000
        })
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.error || `Server returned HTTP ${res.status}`);
      }

      const data = await res.json();
      if (data.success && data.transcript) {
        return {
          transcript: data.transcript,
          sourceLanguage: language,
          confidence: data.confidence,
          engine: 'BHASHINI-ASR'
        };
      }

      return {
        transcript: '',
        sourceLanguage: language,
        engine: 'BHASHINI-ASR',
        error: data.error || 'No speech transcript produced by BHASHINI ASR.'
      };
    } catch (err: any) {
      console.warn('[BHASHINI ASR] Server request notice:', err?.message || err);
      return {
        transcript: '',
        sourceLanguage: language,
        engine: 'BHASHINI-ASR',
        error: err?.message || 'BHASHINI ASR request failed.'
      };
    }
  }
}

export const bhashiniSTTEngine = new BhashiniSTTEngine();
