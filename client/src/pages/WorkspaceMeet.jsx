import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { createInstantMeet } from "../slices/googleIntegrationSlice";
import { useGetVoiceChannelsQuery, useUpdateVoiceChannelMutation } from "../redux/slices/api/workspaceApiSlice";
import socketService from "../services/socket";
import { FaVideo, FaExternalLinkAlt, FaSpinner, FaExclamationTriangle, FaTimes } from "react-icons/fa";
import { toast } from "sonner";

const WorkspaceMeet = () => {
    const { workspaceId, channelId } = useParams();
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { user } = useSelector((state) => state.auth);

    // Auth & API
    const { loading: googleLoading } = useSelector((state) => state.googleIntegration);
    const { data: channelsResp, isLoading: channelsLoading } = useGetVoiceChannelsQuery(workspaceId);
    const [updateVoiceChannel] = useUpdateVoiceChannelMutation();

    // Find current active channel
    const channels = channelsResp?.data || [];
    const currentChannel = channels.find(c => c._id === channelId);

    // State
    const [activeMeetLink, setActiveMeetLink] = useState(null);
    const [isGenerating, setIsGenerating] = useState(false);
    const [transcript, setTranscript] = useState("");
    const [isProcessing, setIsProcessing] = useState(false);

    // Audio Capture State
    const [isRecordingAudio, setIsRecordingAudio] = useState(false);
    const mediaRecorderRef = useRef(null);
    const audioStreamRef = useRef(null);
    const audioChunkIntervalRef = useRef(null);
    const audioContextRef = useRef(null);
    const [sttStatus, setSttStatus] = useState('idle'); // idle, processing, ready

    const [intelligenceResult, setIntelligenceResult] = useState(null);
    const [liveTranscript, setLiveTranscript] = useState([]);
    const transcriptEndRef = useRef(null);
    const [activeParticipants, setActiveParticipants] = useState([]);

    const downsampleTo16k = (inputFloat32, inputSampleRate) => {
        const targetSampleRate = 16000;
        if (inputSampleRate === targetSampleRate) return inputFloat32;

        const ratio = inputSampleRate / targetSampleRate;
        const newLength = Math.round(inputFloat32.length / ratio);
        const output = new Float32Array(newLength);

        let offsetResult = 0;
        let offsetBuffer = 0;

        while (offsetResult < output.length) {
            const nextOffsetBuffer = Math.round((offsetResult + 1) * ratio);
            let accum = 0;
            let count = 0;

            for (let i = offsetBuffer; i < nextOffsetBuffer && i < inputFloat32.length; i++) {
                accum += inputFloat32[i];
                count++;
            }

            output[offsetResult] = count > 0 ? accum / count : 0;
            offsetResult++;
            offsetBuffer = nextOffsetBuffer;
        }

        return output;
    };

    const calculateRms = (float32Array) => {
        let sumSquares = 0;
        for (let i = 0; i < float32Array.length; i++) {
            sumSquares += float32Array[i] * float32Array[i];
        }
        return Math.sqrt(sumSquares / float32Array.length);
    };

    // Join & Leave Socket handling
    useEffect(() => {
        if (workspaceId && channelId) {
            socketService.joinVoiceChannel(workspaceId, channelId);
        }

        return () => {
            if (workspaceId) {
                socketService.leaveVoiceChannel(workspaceId);
            }
        };
    }, [workspaceId, channelId]);

    // Keep activeMeetLink synced with the current channel's data from server
    useEffect(() => {
        if (currentChannel && currentChannel.activeMeetLink) {
            setActiveMeetLink(currentChannel.activeMeetLink);
        } else {
            setActiveMeetLink(null);
        }
        // Initialize active participants from current channel
        if (currentChannel && currentChannel.activeParticipants) {
            setActiveParticipants(currentChannel.activeParticipants);
        }
    }, [currentChannel]);

    // Listen for real-time participant updates via Socket.IO
    useEffect(() => {
        const socket = socketService.socket;
        if (!socket) return;

        const handleVoiceUpdate = ({ channelId: updatedChannelId, activeParticipants: updatedParticipants, activeMeetLink: updatedLink }) => {
            // Only update if this is the current channel
            if (updatedChannelId === channelId) {
                if (updatedParticipants) {
                    setActiveParticipants(updatedParticipants);
                }
                if (updatedLink !== undefined) {
                    setActiveMeetLink(updatedLink);
                }
            }
        };

        socket.on('voice:channel_updated', handleVoiceUpdate);
        return () => socket.off('voice:channel_updated', handleVoiceUpdate);
    }, [channelId]);

    // Initialize streaming transcription (server-side, like YouTube)
    useEffect(() => {
        const socket = socketService.socket;
        if (!socket) return;

        // Listen for transcript chunks from the server
        const onTranscriptChunk = ({ channelId: incomingChannelId, text, timestamp, isFinal, speaker, userId }) => {
            if (incomingChannelId === channelId && text) {
                setLiveTranscript(prev => [...prev, { 
                    text, 
                    timestamp,
                    speaker: speaker || 'Unknown Speaker',
                    userId,
                    isError: false
                }]);
                setTimeout(() => transcriptEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 50);
                setSttStatus('ready');
            }
        };

        const onPartialTranscript = ({ channelId: incomingChannelId, text, speaker }) => {
            if (incomingChannelId === channelId) {
                setSttStatus('processing');
            }
        };

        const onFinalTranscript = ({ channelId: incomingChannelId, text, timestamp, speaker, userId }) => {
            if (incomingChannelId === channelId) {
                console.log('[Final Transcription]', speaker, ':', text);
                // Display the final accurate transcription with a special indicator
                setLiveTranscript(prev => [...prev, { 
                    text: `📋 FINAL TRANSCRIPTION: ${text}`, 
                    timestamp,
                    speaker: speaker || 'Unknown Speaker',
                    userId,
                    isFinal: true 
                }]);
                toast.success(`Final transcription complete for ${speaker}!`);
                setSttStatus('idle');
                setTimeout(() => transcriptEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 50);
            }
        };

        const onTranscriptError = ({ error, details }) => {
            console.error('Transcription error:', error, details);
            setSttStatus('error');
            toast.error(`Transcription Error: ${error}`);
            setLiveTranscript(prev => [...prev, { 
                text: `⚠️ ${error}. ${details || 'Please check your Whisper configuration.'}`, 
                timestamp: new Date().toISOString(),
                isError: true 
            }]);
        };

        socket.on('meeting:transcript_chunk', onTranscriptChunk);
        socket.on('meeting:transcript_partial', onPartialTranscript);
        socket.on('meeting:transcript_final', onFinalTranscript);
        socket.on('meeting:transcript_error', onTranscriptError);

        return () => {
            socket.off('meeting:transcript_chunk', onTranscriptChunk);
            socket.off('meeting:transcript_partial', onPartialTranscript);
            socket.off('meeting:transcript_final', onFinalTranscript);
            socket.off('meeting:transcript_error', onTranscriptError);
        };
    }, [channelId]);

    // Listen for intelligence results from the backend
    useEffect(() => {
        const socket = socketService.socket;
        if (!socket) return;

        const handler = ({ channelId: incomingChannelId, intelligence }) => {
            if (incomingChannelId === channelId) {
                setIntelligenceResult(intelligence);
                toast.success(`AIVA extracted ${intelligence.action_items?.length || 0} tasks from your meeting!`);
            }
        };

        socket.on('meeting:intelligence_ready', handler);
        return () => socket.off('meeting:intelligence_ready', handler);
    }, [channelId]);

    const handleCreateMeet = async () => {
        setIsGenerating(true);
        try {
            // 1. Generate the link from Google Integration
            const response = await dispatch(createInstantMeet(workspaceId)).unwrap();

            // 2. Save it to the current Voice Channel in DB so others see it
            await updateVoiceChannel({
                workspaceId,
                channelId,
                activeMeetLink: response.meetLink
            }).unwrap();

            // 3. Broadcast the new link via WebSocket to everyone else in the channel
            if (socketService.socket) {
                socketService.socket.emit("voice:update_link", {
                    workspaceId,
                    channelId,
                    activeMeetLink: response.meetLink
                });
            }

            setActiveMeetLink(response.meetLink);
            toast.success("Meeting generated and attached to Voice Channel!");
        } catch (error) {
            toast.error(error?.error || error?.data?.message || "Failed to create meeting link.");
        } finally {
            setIsGenerating(false);
        }
    };

    const openInNewTab = () => {
        if (activeMeetLink) {
            window.open(activeMeetLink, "_blank", "noopener,noreferrer");
        }
    };

    const disconnectCall = () => {
        stopAudioCapture();
        socketService.leaveVoiceChannel(workspaceId);
        navigate(`/workspace/${workspaceId}/dashboard`);
    };

    const handleProcessTranscript = async () => {
        if (!transcript.trim()) return;

        setIsProcessing(true);
        try {
            // TODO: Hook up to AIVA intelligence backend 
            await new Promise(resolve => setTimeout(resolve, 1500));
            toast.success("Transcript processed! Tasks added to workspace.");
            setTranscript("");
        } catch (err) {
            toast.error("Failed to process transcript");
        } finally {
            setIsProcessing(false);
        }
    };

    const startAudioCapture = async () => {
        try {
            // Capture user's own microphone for transcription
            const stream = await navigator.mediaDevices.getUserMedia({
                audio: {
                    echoCancellation: true,
                    noiseSuppression: true,
                    autoGainControl: true,
                    sampleRate: 16000 // Optimized for Whisper
                },
                video: false
            });

            audioStreamRef.current = stream;

            // Initialize AudioContext to decode audio for Whisper
            audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)({
                sampleRate: 16000
            });

            const mediaRecorder = new MediaRecorder(stream);
            mediaRecorderRef.current = mediaRecorder;

            mediaRecorder.ondataavailable = async (event) => {
                if (event.data.size > 0) {
                    try {
                        // 1. Convert Blob to ArrayBuffer
                        const arrayBuffer = await event.data.arrayBuffer();
                        // 2. Decode Audio from WebM/Opus to PCM 16kHz
                        const audioBuffer = await audioContextRef.current.decodeAudioData(arrayBuffer);

                        // 3. Extract mono channel and force true 16kHz for Whisper
                        const sourceFloat32 = audioBuffer.getChannelData(0);
                        const float32Array = downsampleTo16k(sourceFloat32, audioBuffer.sampleRate);

                        // Skip near-silent chunks (prevents false blank transcriptions)
                        const rms = calculateRms(float32Array);
                        if (rms < 0.005) {
                            return;
                        }

                        // 4. Convert to 16-bit PCM for Whisper backend
                        const pcm16Data = new Int16Array(float32Array.length);
                        for (let i = 0; i < float32Array.length; i++) {
                            // Clamp and convert to 16-bit signed integer
                            pcm16Data[i] = Math.max(-1, Math.min(1, float32Array[i])) * 0x7fff;
                        }

                        // 5. Convert to base64 for socket transmission (browser-compatible)
                        const uint8Array = new Uint8Array(pcm16Data.buffer);
                        let binaryString = '';
                        for (let i = 0; i < uint8Array.length; i++) {
                            binaryString += String.fromCharCode(uint8Array[i]);
                        }
                        const audioBase64 = btoa(binaryString);

                        // 6. Send to server for Whisper transcription WITH USER IDENTIFICATION
                        setSttStatus('processing');
                        socketService.socket.emit('meeting:stream_audio', {
                            workspaceId,
                            channelId,
                            audioBuffer: audioBase64,
                            timestamp: new Date().toISOString(),
                            // Include user information for speaker identification
                            userId: user?._id || user?.id,
                            username: user?.username || user?.email?.split('@')[0] || 'Unknown User'
                        });

                        console.log('[Audio] Sent', pcm16Data.length, 'samples from', user?.username || 'current user');
                    } catch (decodeErr) {
                        console.error("Failed to send audio to server:", decodeErr);
                    }
                }
            };

            // Start recording
            mediaRecorder.start();
            setIsRecordingAudio(true);
            toast.success(`🎤 Recording ${user?.username || 'your'} audio for transcription...`);

            // Capture audio chunks every 3 seconds for live transcription
            audioChunkIntervalRef.current = setInterval(() => {
                if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
                    mediaRecorderRef.current.stop();
                    mediaRecorderRef.current.start();  // Restart immediately
                }
            }, 3000);

            // Handle user stopping microphone
            stream.getAudioTracks()[0].onended = () => {
                stopAudioCapture();
            };

        } catch (err) {
            console.error("Microphone access failed:", err);
            toast.error("Failed to access microphone. Please grant permission and try again.");
            setIsRecordingAudio(false);
        }
    };

    const stopAudioCapture = () => {
        if (audioChunkIntervalRef.current) {
            clearInterval(audioChunkIntervalRef.current);
            audioChunkIntervalRef.current = null;
        }

        if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
            mediaRecorderRef.current.stop();
        }
        if (audioStreamRef.current) {
            audioStreamRef.current.getTracks().forEach(track => track.stop());
            audioStreamRef.current = null;
        }

        // End the transcription session on the server
        if (socketService.isConnected) {
            socketService.socket.emit('meeting:end_transcription', {
                workspaceId,
                channelId,
                userId: user?._id || user?.id,
                username: user?.username || user?.email?.split('@')[0] || 'Unknown User'
            });
        }

        setIsRecordingAudio(false);
        setSttStatus('idle');
    };

    const exportTranscriptToTxt = () => {
        if (liveTranscript.length === 0) return;
        const textContent = liveTranscript.map(chunk => {
            // Format timestamp as "2:07:24 AM" (12-hour with seconds)
            const time = new Date(chunk.timestamp).toLocaleTimeString('en-US', { 
                hour: '2-digit', 
                minute: '2-digit', 
                second: '2-digit',
                hour12: true
            });
            return `[${time}] ${chunk.text}`;
        }).join('\n');

        const blob = new Blob([textContent], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        const safeChanName = (currentChannel?.name || 'Room').replace(/[^a-z0-9]/gi, '_');
        a.download = `AIVA_Transcript_${safeChanName}_${new Date().toLocaleDateString().replace(/\//g, '-')}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    if (channelsLoading) {
        return (
            <div className="flex h-full items-center justify-center">
                <FaSpinner className="w-8 h-8 animate-spin text-blue-500" />
            </div>
        );
    }

    if (!currentChannel) {
        return (
            <div className="flex h-full items-center justify-center flex-col">
                <h3 className="text-xl font-bold text-gray-700 dark:text-gray-300">Channel Not Found</h3>
                <button onClick={() => navigate(`/workspace/${workspaceId}`)} className="mt-4 text-blue-500">
                    Return to Dashboard
                </button>
            </div>
        );
    }

    if (!activeMeetLink) {
        return (
            <div className="container mx-auto px-4 py-8 h-full flex flex-col items-center justify-center min-h-[60vh]">
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-8 max-w-md w-full text-center">
                    <div className="w-20 h-20 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
                        <FaVideo className="w-10 h-10 text-blue-600 dark:text-blue-400" />
                    </div>

                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                        {currentChannel.name}
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400 mb-8">
                        No active video server running for this channel. You can start one for everyone to join.
                    </p>

                    <button
                        onClick={handleCreateMeet}
                        disabled={isGenerating || googleLoading}
                        className={`w-full flex items-center justify-center space-x-2 px-6 py-3 rounded-lg font-medium text-white transition-all
              ${isGenerating || googleLoading
                                ? "bg-blue-400 cursor-not-allowed"
                                : "bg-blue-600 hover:bg-blue-700 active:bg-blue-800"
                            }`}
                    >
                        {isGenerating || googleLoading ? (
                            <>
                                <FaSpinner className="w-5 h-5 animate-spin" />
                                <span>Starting Video Server...</span>
                            </>
                        ) : (
                            <>
                                <FaVideo className="w-5 h-5" />
                                <span>Start Video Server</span>
                            </>
                        )}
                    </button>

                    <button
                        onClick={disconnectCall}
                        className="mt-4 text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                    >
                        Disconnect from Channel
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8 h-[calc(100vh-100px)] lg:h-[calc(100vh-64px)] overflow-y-auto">
            <div className="max-w-3xl mx-auto space-y-6">

                {/* Header Card */}
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center flex-shrink-0">
                            <FaVideo className="w-6 h-6 text-green-600 dark:text-green-400" />
                        </div>
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <div className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse" />
                                <span className="text-xs font-bold text-green-600 dark:text-green-400 uppercase tracking-wider">Live Room</span>
                            </div>
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white leading-tight">
                                {currentChannel.name}
                            </h2>
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                        <button
                            onClick={openInNewTab}
                            className="flex-1 sm:flex-none flex items-center justify-center px-6 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium shadow-sm transition-colors duration-200"
                        >
                            <span>Join Meeting</span>
                            <FaExternalLinkAlt className="ml-2 w-4 h-4 opacity-80" />
                        </button>

                        {!isRecordingAudio ? (
                            <button
                                onClick={startAudioCapture}
                                className="flex-1 sm:flex-none flex items-center justify-center px-6 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium shadow-sm transition-colors duration-200"
                            >
                                <span>Start Meeting Intelligence</span>
                            </button>
                        ) : (
                            <button
                                onClick={stopAudioCapture}
                                className="flex-1 sm:flex-none flex items-center justify-center px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium shadow-sm transition-colors duration-200 animate-pulse"
                            >
                                <span className="w-2 h-2 bg-white rounded-full mr-2"></span>
                                <span>Recording (Stop)</span>
                            </button>
                        )}

                        <button
                            onClick={disconnectCall}
                            className="flex-1 sm:flex-none px-4 py-2.5 bg-gray-100 dark:bg-gray-700 hover:bg-red-50 dark:hover:bg-red-900/20 text-gray-700 hover:text-red-600 dark:text-gray-300 dark:hover:text-red-400 rounded-lg font-medium transition-colors duration-200"
                        >
                            Disconnect
                        </button>
                    </div>
                </div>

                {/* Main Command Center Body */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Participants Card */}
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Active Participants</h3>
                        {activeParticipants?.length > 0 ? (
                            <div className="space-y-3">
                                {activeParticipants.map(participant => (
                                    <div key={participant._id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                                        <img
                                            src={participant.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(participant.name)}&background=random`}
                                            alt={participant.name}
                                            className="w-10 h-10 rounded-full border border-gray-200 dark:border-gray-600"
                                        />
                                        <div>
                                            <p className="font-medium text-gray-900 dark:text-white text-sm">{participant.name}</p>
                                            <p className="text-xs text-green-600 dark:text-green-400">In Voice Channel</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-sm text-gray-500 dark:text-gray-400 italic">No one else is here right now.</p>
                        )}
                    </div>

                    {/* Meeting Info Card */}
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 flex flex-col">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Meeting Details</h3>
                        <div className="flex-1 space-y-4">
                            <div>
                                <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Server</p>
                                <p className="text-sm text-gray-900 dark:text-gray-200 break-all bg-gray-50 dark:bg-gray-900/50 p-2 rounded border border-gray-100 dark:border-gray-700/50">
                                    {activeMeetLink}
                                </p>
                            </div>

                            <div className="bg-blue-50 dark:bg-blue-900/10 rounded-lg p-4 border border-blue-100 dark:border-blue-800/30">
                                <h4 className="text-sm font-semibold text-blue-800 dark:text-blue-300 mb-2">Command Center Mode</h4>
                                <p className="text-xs text-blue-600 dark:text-blue-400 leading-relaxed mb-3">
                                    AIVA runs in the background while you meet. To automate task extraction:
                                </p>
                                <ol className="text-xs text-blue-700 dark:text-blue-300 list-decimal list-inside space-y-1 ml-1 opacity-90">
                                    <li>Click <strong>Start Meeting Intelligence</strong> above.</li>
                                    <li>Select the Chrome Tab where your Google Meet is running.</li>
                                    <li>Ensure <strong>Share Tab Audio</strong> is checked.</li>
                                </ol>
                            </div>
                        </div>
                    </div>
                </div>


                {/* Live Transcript Feed — shown while recording */}
                {(isRecordingAudio || liveTranscript.length > 0) && (
                    <div className="bg-gray-900 dark:bg-black rounded-xl shadow-sm border border-gray-700 dark:border-gray-800 p-6">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-3">
                                {isRecordingAudio && <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>}
                                <h3 className="text-base font-semibold text-gray-100">Live Transcript</h3>

                                {/* Local STT Status Indicator with Enhanced Animation */}
                                <div className="flex items-center gap-2">
                                    {sttStatus === 'downloading' && (
                                        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-yellow-900/30 border border-yellow-600/50">
                                            <div className="flex gap-0.5">
                                                <span className="w-1 h-1 rounded-full bg-yellow-400 animate-bounce" style={{ animationDelay: '0ms' }}></span>
                                                <span className="w-1 h-1 rounded-full bg-yellow-400 animate-bounce" style={{ animationDelay: '150ms' }}></span>
                                                <span className="w-1 h-1 rounded-full bg-yellow-400 animate-bounce" style={{ animationDelay: '300ms' }}></span>
                                            </div>
                                            <span className="text-[10px] text-yellow-400 uppercase tracking-wider font-semibold">Downloading {downloadProgress}%</span>
                                        </div>
                                    )}
                                    {sttStatus === 'ready' && (
                                        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-900/30 border border-green-600/50">
                                            <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse"></span>
                                            <span className="text-[10px] text-green-400 uppercase tracking-wider font-semibold">AI Ready</span>
                                        </div>
                                    )}
                                    {sttStatus === 'processing' && (
                                        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-900/30 border border-blue-600/50">
                                            <svg className="w-3 h-3 text-blue-400 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            <span className="text-[10px] text-blue-400 uppercase tracking-wider font-semibold">Processing...</span>
                                        </div>
                                    )}
                                    {sttStatus === 'idle' && (
                                        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-gray-800 border border-gray-700">
                                            <span className="w-1.5 h-1.5 rounded-full bg-gray-500"></span>
                                            <span className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold">AI Waiting</span>
                                        </div>
                                    )}
                                    {sttStatus === 'error' && (
                                        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-900/30 border border-red-600/50">
                                            <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse"></span>
                                            <span className="text-[10px] text-red-400 uppercase tracking-wider font-semibold">API Error</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                            {liveTranscript.length > 0 && (
                                <div className="flex items-center gap-3">
                                    <button
                                        onClick={exportTranscriptToTxt}
                                        className="text-xs text-blue-500 hover:text-blue-400 transition-colors font-medium"
                                    >
                                        Export .txt
                                    </button>
                                    <button
                                        onClick={() => setLiveTranscript([])}
                                        className="text-xs text-gray-500 hover:text-gray-300 transition-colors"
                                    >
                                        Clear
                                    </button>
                                </div>
                            )}
                        </div>

                        <div className="h-48 overflow-y-auto space-y-2 pr-1 font-mono">
                            {liveTranscript.length === 0 ? (
                                <p className="text-sm text-gray-600 italic">Listening... transcript will appear here as you speak.</p>
                            ) : (
                                liveTranscript.map((chunk, idx) => (
                                    <div key={idx} className="flex gap-3 items-start">
                                        <div className="flex flex-col flex-shrink-0">
                                            <span className="text-xs text-gray-500 tabular-nums font-semibold">
                                                {new Date(chunk.timestamp).toLocaleTimeString('en-US', { 
                                                    hour: '2-digit', 
                                                    minute: '2-digit', 
                                                    second: '2-digit',
                                                    hour12: true
                                                })}
                                            </span>
                                            {chunk.speaker && (
                                                <span className="text-xs text-blue-400 font-bold mt-0.5">
                                                    {chunk.speaker}
                                                </span>
                                            )}
                                        </div>
                                        <p className={`text-sm leading-relaxed flex-1 ${
                                            chunk.isError ? 'text-red-400' : 
                                            chunk.isFinal ? 'text-blue-400 font-bold' : 
                                            'text-green-400'
                                        }`}>
                                            {chunk.text}
                                        </p>
                                    </div>
                                ))
                            )}
                            <div ref={transcriptEndRef} />
                        </div>
                    </div>
                )}

                {/* Intelligence Results Card — shown after meeting ends */}
                {intelligenceResult && (
                    <div className="bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 rounded-xl shadow-sm border border-purple-200 dark:border-purple-800/40 p-6">
                        <div className="flex items-center gap-2 mb-5">
                            <div className="w-2 h-2 rounded-full bg-purple-500 animate-pulse"></div>
                            <h3 className="text-lg font-bold text-purple-900 dark:text-purple-200">AIVA Meeting Intelligence</h3>
                        </div>

                        {intelligenceResult.summary && (
                            <div className="mb-5 p-4 bg-white dark:bg-gray-800 rounded-lg border border-purple-100 dark:border-purple-800/30">
                                <p className="text-xs font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400 mb-2">Summary</p>
                                <p className="text-sm text-gray-700 dark:text-gray-300">{intelligenceResult.summary}</p>
                            </div>
                        )}

                        {intelligenceResult.action_items?.length > 0 && (
                            <div className="mb-5">
                                <p className="text-xs font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400 mb-3">Action Items ({intelligenceResult.action_items.length} tasks auto-created)</p>
                                <div className="space-y-2">
                                    {intelligenceResult.action_items.map((item, idx) => (
                                        <div key={idx} className="flex items-start gap-3 p-3 bg-white dark:bg-gray-800 rounded-lg border border-green-100 dark:border-green-900/30">
                                            <div className="w-5 h-5 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                                                <span className="text-green-600 text-xs font-bold">{idx + 1}</span>
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium text-gray-800 dark:text-gray-200">{item.task_title}</p>
                                                <p className="text-xs text-gray-500 dark:text-gray-400">{item.assignee}{item.deadline ? ` · Due: ${item.deadline}` : ''}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {intelligenceResult.decisions?.length > 0 && (
                            <div>
                                <p className="text-xs font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400 mb-3">Key Decisions</p>
                                <ul className="space-y-1">
                                    {intelligenceResult.decisions.map((d, i) => (
                                        <li key={i} className="text-sm text-gray-700 dark:text-gray-300 flex gap-2"><span className="text-purple-400">›</span>{d}</li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default WorkspaceMeet;
