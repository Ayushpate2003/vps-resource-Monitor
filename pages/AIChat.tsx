import React, { useState, useRef, useEffect } from 'react';
import { Send, Sparkles, MapPin, Search as SearchIcon, Bolt } from 'lucide-react';
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";

interface Message {
  role: 'user' | 'model';
  text: string;
  grounding?: any[];
}

export const AIChat: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [useLite, setUseLite] = useState(false);
  const [useSearch, setUseSearch] = useState(false);
  const [useMaps, setUseMaps] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMsg = { role: 'user' as const, text: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      
      let model = useLite ? 'gemini-flash-lite-latest' : 'gemini-3-pro-preview';
      let tools: any[] = [];
      
      if (useSearch) {
        model = 'gemini-flash-latest'; // Grounding usually works best with Flash or Pro 2.5 currently
        tools.push({ googleSearch: {} });
      }
      
      if (useMaps) {
        model = 'gemini-flash-latest';
        tools.push({ googleMaps: {} });
      }

      const response = await ai.models.generateContent({
        model,
        contents: input,
        config: {
            tools: tools.length > 0 ? tools : undefined
        }
      });

      const text = response.text || "I couldn't generate a response.";
      const grounding = response.candidates?.[0]?.groundingMetadata?.groundingChunks;

      setMessages(prev => [...prev, { role: 'model', text, grounding }]);

    } catch (error) {
      console.error(error);
      setMessages(prev => [...prev, { role: 'model', text: "Error: Failed to connect to Gemini." }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-full flex flex-col p-6 max-w-5xl mx-auto w-full">
      <div className="flex justify-between items-center mb-6">
        <div>
           <h2 className="text-3xl font-bold text-white mb-2">AI Assistant</h2>
           <p className="text-slate-400">Powered by Gemini 3 Pro & 2.5 Flash</p>
        </div>
        
        <div className="flex gap-4">
             <button 
                onClick={() => setUseLite(!useLite)}
                className={`p-2 rounded-lg border text-xs font-mono flex flex-col items-center gap-1 w-20 transition-all ${useLite ? 'bg-cyan-500/20 border-cyan-500 text-cyan-400' : 'border-slate-700 text-slate-500'}`}
             >
                <Bolt className="w-4 h-4" />
                {useLite ? 'LITE ON' : 'LITE OFF'}
             </button>
             <button 
                onClick={() => { setUseSearch(!useSearch); setUseMaps(false); }}
                className={`p-2 rounded-lg border text-xs font-mono flex flex-col items-center gap-1 w-20 transition-all ${useSearch ? 'bg-blue-500/20 border-blue-500 text-blue-400' : 'border-slate-700 text-slate-500'}`}
             >
                <SearchIcon className="w-4 h-4" />
                SEARCH
             </button>
             <button 
                onClick={() => { setUseMaps(!useMaps); setUseSearch(false); }}
                className={`p-2 rounded-lg border text-xs font-mono flex flex-col items-center gap-1 w-20 transition-all ${useMaps ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400' : 'border-slate-700 text-slate-500'}`}
             >
                <MapPin className="w-4 h-4" />
                MAPS
             </button>
        </div>
      </div>

      <div className="flex-1 glass-panel rounded-xl mb-4 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
            <div className="h-full flex flex-col items-center justify-center text-slate-600 opacity-50">
                <Sparkles className="w-16 h-16 mb-4" />
                <p>Start a conversation with Gemini</p>
            </div>
        )}
        {messages.map((msg, idx) => (
            <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] p-4 rounded-xl ${msg.role === 'user' ? 'bg-primary text-slate-900 rounded-br-none' : 'bg-slate-800 border border-slate-700 rounded-bl-none text-slate-200'}`}>
                    <div className="whitespace-pre-wrap">{msg.text}</div>
                    
                    {/* Grounding Chips */}
                    {msg.grounding && (
                        <div className="mt-3 pt-3 border-t border-white/10 flex flex-wrap gap-2">
                             {msg.grounding.map((chunk, i) => {
                                 if (chunk.web) {
                                     return (
                                         <a key={i} href={chunk.web.uri} target="_blank" rel="noreferrer" className="text-xs bg-black/20 hover:bg-black/40 px-2 py-1 rounded text-blue-300 truncate max-w-[200px] block">
                                             {chunk.web.title}
                                         </a>
                                     );
                                 }
                                 if (chunk.maps) {
                                     return (
                                         <div key={i} className="text-xs bg-black/20 px-2 py-1 rounded text-emerald-300">
                                             📍 {chunk.maps.title}
                                         </div>
                                     );
                                 }
                                 return null;
                             })}
                        </div>
                    )}
                </div>
            </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <div className="relative">
        <input 
            type="text" 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Type a message..."
            disabled={isLoading}
            className="w-full bg-surface border border-slate-700 rounded-xl p-4 pr-12 text-white focus:outline-none focus:border-primary transition-colors"
        />
        <button 
            onClick={handleSend}
            disabled={isLoading}
            className="absolute right-3 top-3 p-2 bg-primary rounded-lg text-slate-900 hover:bg-cyan-400 disabled:opacity-50 transition-colors"
        >
            <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
