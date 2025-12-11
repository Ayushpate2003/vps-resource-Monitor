import React, { useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { Scanner } from './pages/Scanner';
import { AIChat } from './pages/AIChat';
import { ImageStudio } from './pages/ImageStudio';
import { VideoStudio } from './pages/VideoStudio';
import { LiveVoice } from './pages/LiveVoice';
import { ViewType } from './types';

function App() {
  const [currentView, setCurrentView] = useState<ViewType>('scanner');

  const renderView = () => {
    switch (currentView) {
      case 'scanner': return <Scanner />;
      case 'chat': return <AIChat />;
      case 'image': return <ImageStudio />;
      case 'video': return <VideoStudio />;
      case 'live': return <LiveVoice />;
      default: return <Scanner />;
    }
  };

  return (
    <div className="flex h-screen bg-slate-950 text-slate-200 font-sans overflow-hidden">
      <Sidebar currentView={currentView} onNavigate={setCurrentView} />
      <div className="flex-1 h-full overflow-auto relative">
        {renderView()}
      </div>
    </div>
  );
}

export default App;
