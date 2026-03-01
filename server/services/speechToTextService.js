import { pipeline, env } from '@xenova/transformers';

const SAMPLE_RATE_HZ = 16000;
const CHUNK_MIN_BYTES = 3200;
// Accumulate 3-5 seconds of audio before transcribing for better accuracy
const TRANSCRIBE_BUFFER_SECONDS = 4; // 4 seconds
const TRANSCRIBE_BUFFER_BYTES = SAMPLE_RATE_HZ * 2 * TRANSCRIBE_BUFFER_SECONDS; // 16000 Hz * 2 bytes * 4s = 128KB
const WHISPER_MODEL_ID = process.env.WHISPER_MODEL_ID || 'Xenova/whisper-base';
const WHISPER_LANGUAGE = process.env.WHISPER_LANGUAGE || 'en';
const WHISPER_QUANTIZED = (process.env.WHISPER_QUANTIZED || 'true').toLowerCase() !== 'false';

let transcriberPromise = null;

function pcm16ToFloat32(pcmBuffer) {
  const int16 = new Int16Array(pcmBuffer.buffer, pcmBuffer.byteOffset, Math.floor(pcmBuffer.byteLength / 2));
  const float32 = new Float32Array(int16.length);
  for (let i = 0; i < int16.length; i++) {
    float32[i] = int16[i] / 32768;
  }
  return float32;
}

function calculateRMS(float32Array) {
  let sumSquares = 0;
  for (let i = 0; i < float32Array.length; i++) {
    sumSquares += float32Array[i] * float32Array[i];
  }
  return Math.sqrt(sumSquares / float32Array.length);
}

async function getTranscriber() {
  if (transcriberPromise) {
    return transcriberPromise;
  }

  env.allowLocalModels = true;
  env.allowRemoteModels = true;

  transcriberPromise = pipeline('automatic-speech-recognition', WHISPER_MODEL_ID, {
    quantized: WHISPER_QUANTIZED,
  });

  return transcriberPromise;
}

export class SpeechRecognitionSession {
  constructor(sessionId) {
    this.sessionId = sessionId;
    this.isActive = false;
    this.transcript = '';
    this.queue = Promise.resolve();
    this.onPartialResult = () => {};
    this.onFinalResult = () => {};
    this.onError = () => {};
    this.chunkIndex = 0;
    
    // Buffer for accumulating audio before transcribing (for live streaming)
    this.audioBuffer = [];
    this.audioBufferSize = 0;
    
    // Full recording buffer (for final accurate transcription)
    this.fullRecordingBuffer = [];
    this.fullRecordingSize = 0;
    
    // Speaker identification
    this.speakerName = null;
    this.userId = null;
  }

  startSession(onPartialResult, onFinalResult, onError) {
    this.isActive = true;
    this.transcript = '';
    this.chunkIndex = 0;
    this.audioBuffer = [];
    this.audioBufferSize = 0;
    this.fullRecordingBuffer = [];
    this.fullRecordingSize = 0;
    this.onPartialResult = onPartialResult || (() => {});
    this.onFinalResult = onFinalResult || (() => {});
    this.onError = onError || (() => {});
    console.log(`[Whisper] Session started: ${this.sessionId}`);
  }

  sendAudio(audioBuffer) {
    if (!this.isActive) {
      return;
    }

    const pcmBuffer = Buffer.isBuffer(audioBuffer) ? audioBuffer : Buffer.from(audioBuffer);
    if (pcmBuffer.length < CHUNK_MIN_BYTES) {
      return;
    }

    // Add to streaming buffer for live transcription
    this.audioBuffer.push(pcmBuffer);
    this.audioBufferSize += pcmBuffer.length;
    
    // Add to full recording buffer for final accurate transcription
    this.fullRecordingBuffer.push(pcmBuffer);
    this.fullRecordingSize += pcmBuffer.length;

    // If we've accumulated enough audio (3-5 seconds), transcribe it
    if (this.audioBufferSize >= TRANSCRIBE_BUFFER_BYTES) {
      const combinedBuffer = Buffer.concat(this.audioBuffer);
      this.audioBuffer = [];
      this.audioBufferSize = 0;
      
      this.chunkIndex += 1;
      this.queue = this.queue
        .then(() => this.transcribeChunk(combinedBuffer, this.chunkIndex))
        .catch((error) => {
          console.error(`[Whisper] Queue processing error (${this.sessionId}):`, error.message);
        });
    }
  }

  async transcribeChunk(pcmBuffer, chunkIndex) {
    if (!this.isActive) {
      return;
    }

    try {
      const audio = pcm16ToFloat32(pcmBuffer);
      const rms = calculateRMS(audio);
      
      // Skip if audio is too quiet (silence detection)
      if (rms < 0.003) {
        console.log(`[Whisper] Skipping silent chunk (RMS: ${rms.toFixed(4)})`);
        return;
      }

      this.onPartialResult('🎤 Transcribing...');

      const transcriber = await getTranscriber();
      const result = await transcriber(audio, {
        sampling_rate: SAMPLE_RATE_HZ,
        language: WHISPER_LANGUAGE,
        task: 'transcribe',
        return_timestamps: false,
        chunk_length_s: 30, // Process in 30s chunks internally
      });

      const text = (result?.text || '').trim();

      if (!text || text === '[BLANK_AUDIO]') {
        console.log(`[Whisper] No speech detected in chunk ${chunkIndex}`);
        return;
      }

      console.log(`[Whisper] Chunk ${chunkIndex} transcribed: "${text}"`);
      this.transcript += (this.transcript ? ' ' : '') + text;
      this.onFinalResult(text, []);
    } catch (error) {
      this.onError(error);
      console.error(`[Whisper] Transcription error (${this.sessionId}):`, error.message);
    }
  }

  async endSession() {
    this.isActive = false;
    
    // Transcribe any remaining buffered audio
    if (this.audioBufferSize > 0) {
      const combinedBuffer = Buffer.concat(this.audioBuffer);
      await this.transcribeChunk(combinedBuffer, this.chunkIndex + 1);
    }
    
    await this.queue;
    console.log(`[Whisper] Session ended: ${this.sessionId}`);
    return this.transcript;
  }

  async getFinalTranscription() {
    // Transcribe the entire recording for best accuracy
    if (this.fullRecordingSize === 0) {
      return this.transcript;
    }

    try {
      console.log(`[Whisper] Generating final accurate transcription for ${this.sessionId} (${(this.fullRecordingSize / 32000).toFixed(1)}s of audio)...`);
      
      const fullBuffer = Buffer.concat(this.fullRecordingBuffer);
      const audio = pcm16ToFloat32(fullBuffer);
      const rms = calculateRMS(audio);
      
      if (rms < 0.003) {
        console.log(`[Whisper] Full recording is silent (RMS: ${rms.toFixed(4)})`);
        return this.transcript || '[No speech detected]';
      }

      const transcriber = await getTranscriber();
      const result = await transcriber(audio, {
        sampling_rate: SAMPLE_RATE_HZ,
        language: WHISPER_LANGUAGE,
        task: 'transcribe',
        return_timestamps: true, // Get timestamps for the final transcription
        chunk_length_s: 30,
      });

      const finalText = (result?.text || '').trim();
      console.log(`[Whisper] Final transcription complete: "${finalText}"`);
      
      return finalText || this.transcript || '[No speech detected]';
    } catch (error) {
      console.error(`[Whisper] Final transcription error:`, error.message);
      return this.transcript;
    }
  }
}

const sessions = new Map();

export function getSession(sessionId) {
  if (!sessions.has(sessionId)) {
    sessions.set(sessionId, new SpeechRecognitionSession(sessionId));
  }
  return sessions.get(sessionId);
}

export function deleteSession(sessionId) {
  sessions.delete(sessionId);
}
