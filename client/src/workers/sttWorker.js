// Polyfill window for WebWorker compatibility before importing Xenova
if (typeof self !== 'undefined') {
    self.window = self;
    self.document = {
        createElement: () => ({}),
        addEventListener: () => { },
        removeEventListener: () => { }
    };
}

import { pipeline, env } from '@xenova/transformers';

// Skip local model check since we are pulling from the Hugging Face Hub
env.allowLocalModels = false;
env.useBrowserCache = true;
env.allowRemoteModels = true;

// Suppress ONNX Runtime warnings about unused initializers (harmless model optimization messages)
if (typeof self !== 'undefined' && self.console) {
    const originalWarn = console.warn;
    console.warn = function(...args) {
        // Filter out ONNX RemovingInitializer warnings
        if (args[0]?.toString().includes('CleanUnusedInitializersAndNodeArgs')) {
            return;
        }
        originalWarn.apply(console, args);
    };
}

// Model selection: Use reliable Whisper Base for better accuracy
// Base model provides ~95% accuracy vs tiny's ~85%, worth the extra time
const USE_RELIABLE_MODEL = true;

class PipelineFactory {
    static task = 'automatic-speech-recognition';
    static model = USE_RELIABLE_MODEL ? 'Xenova/whisper-base.en' : 'Xenova/whisper-tiny.en';
    static instance = null;
    static modelLoadTime = 0;

    static async getInstance(progress_callback = null) {
        if (this.instance === null) {
            const startTime = performance.now();
            this.instance = await pipeline(this.task, this.model, {
                progress_callback,
                device: 'webgpu' // Attempt WebGPU acceleration if available, degrades gracefully to WASM
            });
            this.modelLoadTime = performance.now() - startTime;
            console.log(`[STT] Model loaded in ${this.modelLoadTime.toFixed(0)}ms`);
        }
        return this.instance;
    }
}

// Listen for messages from the main thread
self.addEventListener('message', async (event) => {
    const { action, audio, channelId, timestamp } = event.data;

    if (action === 'transcribe') {
        try {
            const startTime = performance.now();
            
            // First time this runs it will download the model weights (~70MB for base model)
            // Progress callback sends real-time download percentage
            const transcriber = await PipelineFactory.getInstance((progressData) => {
                // Forward progress data from Hugging Face Hub
                self.postMessage({ 
                    status: 'progress', 
                    progress: progressData
                });
            });

            // Quick silence check: if RMS (root mean square) is very low, skip processing
            // This prevents wasting time transcribing silent chunks
            const rms = Math.sqrt(audio.reduce((sum, val) => sum + val * val, 0) / audio.length);
            if (rms < 0.001) {  // Threshold for silence
                console.log(`[STT] Skipped silent chunk (RMS: ${rms.toFixed(5)}) - no processing needed`);
                self.postMessage({ status: 'complete', text: '', channelId, timestamp });
                return;
            }

            // Transcribe the 16kHz float32 audio array
            // Optimized for faster processing: smaller chunks for quicker turnaround
            self.postMessage({ status: 'processing' });

            const result = await transcriber(audio, {
                chunk_length_s: 5,     // Reduced from 10 for much faster processing (~2-3s per chunk)
                stride_length_s: 1,    // Reduced from 2 for tighter alignment
                language: 'english',
                task: 'transcribe',
            });

            const processingTime = performance.now() - startTime;
            
            let text = result.text.trim();

            // Filter out common Whisper hallucinations for silence/noise
            // E.g., [INAUDIBLE], [unintelligible], [Music], [silence], etc.
            text = text.replace(/\[.*?\]/g, '').trim();
            text = text.replace(/\(.*?\)/g, '').trim();

            // Only emit if there is actual spoken text left
            if (text.length > 0) {
                self.postMessage({
                    status: 'complete',
                    text: text,
                    channelId,
                    timestamp,
                    processingTime: processingTime.toFixed(0)
                });
            } else {
                // If it was just silence/noise after filtering, very rare
                console.log(`[STT] Filtered out noise chunk (recognized as non-speech) - ${processingTime.toFixed(0)}ms`);
            }

        } catch (error) {
            self.postMessage({ status: 'error', error: error.message });
        }
    }
});
