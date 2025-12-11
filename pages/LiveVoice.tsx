import React, { useState, useRef, useEffect } from 'react';
import { Mic, MicOff, Activity, Volume2 } from 'lucide-react';
import { GoogleGenAI, LiveServerMessage, Modality } from '@google/genai';

export const LiveVoice: React.FC = () => {
  const [connected, setConnected] = useState(false);
  const [visualizerData, setVisualizerData] = useState<number[]>(new Array(20).fill(10));
  const audioContextRef = useRef<AudioContext | null>(null);
  const sessionRef = useRef<any>(null); // LiveSession
  const nextStartTimeRef = useRef<number>(0);
  
  // Audio helpers
  const encodeAudio = (data: Float32Array) => {
     const l = data.length;
     const int16 = new Int16Array(l);
     for (let i = 0; i < l; i++) {
        int16[i] = data[i] * 32768;
     }
     let binary = '';
     const len = int16.byteLength;
     const bytes = new Uint8Array(int16.buffer);
     for (let i = 0; i < len; i++) {
        binary += String.fromCharCode(bytes[i]);
     }
     return btoa(binary);
  };

  const decodeAudio = (base64: string) => {
      const binaryString = atob(base64);
      const len = binaryString.length;
      const bytes = new Uint8Array(len);
      for (let i = 0; i < len; i++) {
          bytes[i] = binaryString.charCodeAt(i);
      }
      return bytes;
  };

  const connect = async () => {
    try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const inputCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
        const outputCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
        audioContextRef.current = outputCtx;

        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        
        // Setup Live Session
        const sessionPromise = ai.live.connect({
            model: 'gemini-2.5-flash-native-audio-preview-09-2025',
            callbacks: {
                onopen: () => {
                    console.log("Live Session Open");
                    setConnected(true);

                    // Input Stream Setup
                    const source = inputCtx.createMediaStreamSource(stream);
                    const processor = inputCtx.createScriptProcessor(4096, 1, 1);
                    
                    processor.onaudioprocess = (e) => {
                        const inputData = e.inputBuffer.getChannelData(0);
                        // Visualize volume
                        const vol = inputData.reduce((a, b) => a + Math.abs(b), 0) / inputData.length;
                        setVisualizerData(prev => [...prev.slice(1), 10 + vol * 500]);

                        const b64 = encodeAudio(inputData);
                        sessionPromise.then(session => {
                            session.sendRealtimeInput({
                                media: {
                                    mimeType: 'audio/pcm;rate=16000',
                                    data: b64
                                }
                            });
                        });
                    };
                    source.connect(processor);
                    processor.connect(inputCtx.destination);
                },
                onmessage: async (msg: LiveServerMessage) => {
                    const audioData = msg.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
                    if (audioData) {
                        const bytes = decodeAudio(audioData);
                        const dataInt16 = new Int16Array(bytes.buffer);
                        const float32 = new Float32Array(dataInt16.length);
                        for(let i=0; i<dataInt16.length; i++) float32[i] = dataInt16[i] / 32768.0;

                        const buffer = outputCtx.createBuffer(1, float32.length, 24000);
                        buffer.copyToChannel(float32, 0);

                        const source = outputCtx.createBufferSource();
                        source.buffer = buffer;
                        source.connect(outputCtx.destination);
                        
                        const now = outputCtx.currentTime;
                        const start = Math.max(nextStartTimeRef.current, now);
                        source.start(start);
                        nextStartTimeRef.current = start + buffer.duration;
                    }
                },
                onclose: () => setConnected(false),
                onerror: (e) => console.error(e)
            },
            config: {
                responseModalities: [Modality.AUDIO],
                speechConfig: {
                    voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Zephyr' } }
                }
            }
        });
        
        sessionRef.current = sessionPromise;

    } catch (e) {
        console.error("Failed to connect live", e);
    }
  };

  const disconnect = () => {
    // Basic cleanup - in a real app would store session reference and call .close()
    window.location.reload(); // Quick reset for demo purposes to clear audio contexts
  };

  return (
    <div className="h-full flex flex-col items-center justify-center p-6">
        <div className="max-w-md w-full glass-panel p-8 rounded-2xl flex flex-col items-center gap-8 relative overflow-hidden">
            {/* Ambient Background */}
            <div className={`absolute inset-0 bg-gradient-to-b from-primary/10 to-transparent transition-opacity duration-1000 ${connected ? 'opacity-100' : 'opacity-0'}`}></div>

            <div className="text-center relative z-10">
                <h2 className="text-3xl font-bold text-white mb-2">Live Voice</h2>
                <p className="text-slate-400">Gemini 2.5 Native Audio Preview</p>
            </div>

            <div className={`w-40 h-40 rounded-full flex items-center justify-center transition-all duration-500 relative ${connected ? 'bg-primary/20 shadow-[0_0_50px_rgba(6,182,212,0.4)]' : 'bg-slate-800'}`}>
                 <div className="absolute inset-0 flex items-center justify-center gap-1">
                     {connected && visualizerData.map((h, i) => (
                         <div key={i} className="w-1 bg-primary/60 rounded-full transition-all duration-75" style={{ height: `${Math.min(h, 60)}%` }}></div>
                     ))}
                 </div>
                 {!connected && <MicOff className="w-12 h-12 text-slate-500" />}
            </div>

            <button 
                onClick={connected ? disconnect : connect}
                className={`w-full py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 transition-all shadow-lg
                    ${connected 
                        ? 'bg-rose-500/20 text-rose-400 border border-rose-500/50 hover:bg-rose-500/30' 
                        : 'bg-gradient-to-r from-primary to-secondary text-slate-900 hover:scale-105'
                    }`}
            >
                {connected ? (
                    <>
                        <Activity className="w-5 h-5 animate-pulse" />
                        End Session
                    </>
                ) : (
                    <>
                        <Mic className="w-5 h-5" />
                        Start Conversation
                    </>
                )}
            </button>
            
            <div className="flex items-center gap-2 text-xs text-slate-500">
                <Volume2 className="w-3 h-3" />
                <span>Requires Microphone & Speaker</span>
            </div>
        </div>
    </div>
  );
};