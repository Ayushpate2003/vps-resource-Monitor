import React, { useState } from 'react';
import { Image as ImageIcon, Wand2, ScanEye, Upload, Download } from 'lucide-react';
import { GoogleGenAI } from "@google/genai";

type Tab = 'generate' | 'edit' | 'analyze';

export const ImageStudio: React.FC = () => {
  const [tab, setTab] = useState<Tab>('generate');
  const [prompt, setPrompt] = useState('');
  const [aspectRatio, setAspectRatio] = useState('1:1');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [outputImage, setOutputImage] = useState<string | null>(null);
  const [analysisText, setAnalysisText] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setSelectedImage(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const execute = async () => {
    setLoading(true);
    setAnalysisText(null);
    setOutputImage(null);
    
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      
      if (tab === 'generate') {
         // Generate Image (Pro)
         const response = await ai.models.generateContent({
             model: 'gemini-3-pro-image-preview',
             contents: { parts: [{ text: prompt }] },
             config: {
                 imageConfig: { aspectRatio: aspectRatio as any, imageSize: "1K" }
             }
         });
         // Extract image
         for (const part of response.candidates?.[0]?.content?.parts || []) {
             if (part.inlineData) {
                 setOutputImage(`data:image/png;base64,${part.inlineData.data}`);
                 break;
             }
         }

      } else if (tab === 'edit') {
        // Edit Image (Flash Image - Nano Banana)
        if (!selectedImage) return;
        const base64Data = selectedImage.split(',')[1];
        
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash-image',
            contents: {
                parts: [
                    { inlineData: { mimeType: 'image/png', data: base64Data } },
                    { text: prompt }
                ]
            }
        });

        for (const part of response.candidates?.[0]?.content?.parts || []) {
             if (part.inlineData) {
                 setOutputImage(`data:image/png;base64,${part.inlineData.data}`);
                 break;
             }
         }

      } else if (tab === 'analyze') {
        // Analyze Image (Pro)
        if (!selectedImage) return;
        const base64Data = selectedImage.split(',')[1];

        const response = await ai.models.generateContent({
            model: 'gemini-3-pro-preview',
            contents: {
                parts: [
                    { inlineData: { mimeType: 'image/png', data: base64Data } },
                    { text: prompt || "Analyze this image in detail." }
                ]
            }
        });
        setAnalysisText(response.text || "No analysis returned.");
      }

    } catch (e) {
      console.error(e);
      setAnalysisText("Error processing request. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-full p-6 max-w-6xl mx-auto w-full">
      <div className="flex items-center gap-4 mb-8">
        <h2 className="text-3xl font-bold text-white">Image Studio</h2>
        <div className="flex bg-slate-800 p-1 rounded-lg">
            <button onClick={() => setTab('generate')} className={`px-4 py-2 rounded-md text-sm font-medium transition ${tab === 'generate' ? 'bg-primary text-slate-900 shadow' : 'text-slate-400 hover:text-white'}`}>Generate</button>
            <button onClick={() => setTab('edit')} className={`px-4 py-2 rounded-md text-sm font-medium transition ${tab === 'edit' ? 'bg-primary text-slate-900 shadow' : 'text-slate-400 hover:text-white'}`}>Edit</button>
            <button onClick={() => setTab('analyze')} className={`px-4 py-2 rounded-md text-sm font-medium transition ${tab === 'analyze' ? 'bg-primary text-slate-900 shadow' : 'text-slate-400 hover:text-white'}`}>Analyze</button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 h-[calc(100%-80px)]">
        {/* Controls */}
        <div className="glass-panel p-6 rounded-xl space-y-6">
            <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">
                    {tab === 'generate' ? 'Description' : 'Instructions / Prompt'}
                </label>
                <textarea 
                    className="w-full bg-slate-900/50 border border-slate-700 rounded-lg p-3 text-white focus:border-primary outline-none h-32 resize-none"
                    placeholder={tab === 'edit' ? "e.g., Add a retro filter..." : "Describe the image..."}
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                />
            </div>

            {tab === 'generate' && (
                <div>
                    <label className="block text-sm font-medium text-slate-400 mb-2">Aspect Ratio</label>
                    <div className="grid grid-cols-4 gap-2">
                        {['1:1', '3:4', '4:3', '16:9', '9:16'].map(ratio => (
                            <button 
                                key={ratio}
                                onClick={() => setAspectRatio(ratio)}
                                className={`py-2 text-xs rounded border ${aspectRatio === ratio ? 'border-primary text-primary bg-primary/10' : 'border-slate-700 text-slate-500'}`}
                            >
                                {ratio}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {(tab === 'edit' || tab === 'analyze') && (
                <div>
                    <label className="block text-sm font-medium text-slate-400 mb-2">Source Image</label>
                    <div className="border-2 border-dashed border-slate-700 rounded-lg p-4 text-center hover:border-slate-500 transition cursor-pointer relative overflow-hidden group">
                        <input type="file" accept="image/*" onChange={handleImageUpload} className="absolute inset-0 opacity-0 cursor-pointer z-10" />
                        {selectedImage ? (
                            <img src={selectedImage} alt="Preview" className="h-32 mx-auto object-contain" />
                        ) : (
                            <div className="py-8 text-slate-500">
                                <Upload className="w-8 h-8 mx-auto mb-2 opacity-50" />
                                <span className="text-xs">Upload Image</span>
                            </div>
                        )}
                    </div>
                </div>
            )}

            <button 
                onClick={execute}
                disabled={loading || (!prompt && tab === 'generate') || (!selectedImage && tab !== 'generate')}
                className="w-full bg-gradient-to-r from-primary to-secondary py-3 rounded-lg font-bold text-slate-900 shadow-[0_0_20px_rgba(6,182,212,0.3)] hover:shadow-[0_0_30px_rgba(6,182,212,0.5)] transition disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2"
            >
                {loading ? <span className="animate-spin h-5 w-5 border-2 border-slate-900 border-t-transparent rounded-full"></span> : <Wand2 className="w-5 h-5" />}
                {tab === 'generate' ? 'Generate' : tab === 'edit' ? 'Transform' : 'Analyze'}
            </button>
        </div>

        {/* Output */}
        <div className="lg:col-span-2 glass-panel p-6 rounded-xl flex items-center justify-center bg-slate-900/50 relative overflow-hidden">
            {loading ? (
                <div className="text-center space-y-4">
                    <div className="animate-spin h-12 w-12 border-4 border-primary border-t-transparent rounded-full mx-auto"></div>
                    <p className="text-primary animate-pulse">Processing with Gemini...</p>
                </div>
            ) : outputImage ? (
                <div className="relative group max-h-full max-w-full">
                    <img src={outputImage} alt="Generated" className="max-h-[600px] max-w-full rounded-lg shadow-2xl" />
                    <a href={outputImage} download="gemini_art.png" className="absolute top-4 right-4 bg-slate-900/80 p-2 rounded-lg text-white opacity-0 group-hover:opacity-100 transition">
                        <Download className="w-5 h-5" />
                    </a>
                </div>
            ) : analysisText ? (
                <div className="prose prose-invert max-w-none w-full h-full overflow-y-auto">
                    <div className="flex items-center gap-2 text-primary mb-4">
                        <ScanEye className="w-6 h-6" />
                        <h3 className="text-xl font-bold m-0">Visual Analysis</h3>
                    </div>
                    <p className="whitespace-pre-wrap text-slate-300 leading-relaxed">{analysisText}</p>
                </div>
            ) : (
                <div className="text-slate-600 flex flex-col items-center">
                    <ImageIcon className="w-16 h-16 mb-4 opacity-20" />
                    <p>Result will appear here</p>
                </div>
            )}
        </div>
      </div>
    </div>
  );
};