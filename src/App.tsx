import { useState } from 'react';
import { AppView, ShoeItem } from './types';
import Home from './components/Home';
import CameraScanner from './components/CameraScanner';
import EditResult from './components/EditResult';
import ShoeList from './components/ShoeList';
import { extractShoeLabel } from './lib/gemini';
import { saveShoe } from './lib/storage';
import { Loader2 } from 'lucide-react';

export default function App() {
  const [view, setView] = useState<AppView>('home');
  const [capturedImage, setCapturedImage] = useState<string>('');
  const [extractedData, setExtractedData] = useState<Partial<ShoeItem>>({});
  const [isProcessing, setIsProcessing] = useState(false);

  const handleCapture = async (base64Img: string) => {
    setCapturedImage(base64Img);
    setIsProcessing(true);
    setView('edit'); // Transition immediately to show loading state on the edit screen

    try {
      const data = await extractShoeLabel(base64Img);
      if (!data || Object.keys(data).length === 0) {
        throw new Error("No data could be extracted from this image.");
      }
      setExtractedData(data);
    } catch (e: any) {
      console.error("Extraction error:", e);
      let errorMessage = "Problem extracting data.";
      
      // Check for character-heavy JSON or specific quota strings
      const errorString = JSON.stringify(e);
      if (errorString.includes("429") || errorString.includes("RESOURCE_EXHAUSTED")) {
        errorMessage = "The AI is currently busy (Rate Limit reached). Please wait 60 seconds or enter the details manually below.";
      } else if (errorString.includes("API_KEY") || errorString.includes("Unauthorized")) {
        errorMessage = "AI Service API Key is missing or invalid. Please check your Settings > Secrets.";
      } else {
        errorMessage = typeof e === 'string' ? e : (e.message || "Unknown error during extraction.");
      }

      alert(errorMessage);
      setExtractedData({});
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSaveScanned = (shoe: ShoeItem) => {
    saveShoe(shoe);
    setView('list'); // Show inventory after saving
  };

  const handleDiscard = () => {
    setView('home');
    setCapturedImage('');
    setExtractedData({});
  };

  return (
    <div className="w-full h-screen mx-auto max-w-md bg-[#0a0a0b] text-[#e0e0e0] shadow-xl relative overflow-hidden flex flex-col font-sans">
      {view === 'home' && <Home onNavigate={(v) => setView(v as AppView)} />}
      
      {view === 'scanner' && (
        <CameraScanner 
          onCapture={handleCapture} 
          onClose={() => setView('home')} 
        />
      )}
      
      {view === 'edit' && (
        isProcessing ? (
          <div className="flex flex-col items-center justify-center h-full space-y-4">
            <Loader2 className="animate-spin text-[#6366f1]" size={48} />
            <div className="text-gray-400 font-medium pb-20">Analyzing shoe label...</div>
          </div>
        ) : (
          <EditResult 
            imageUrl={capturedImage} 
            initialData={extractedData} 
            onSave={handleSaveScanned} 
            onDiscard={handleDiscard} 
          />
        )
      )}

      {view === 'list' && <ShoeList onBack={() => setView('home')} />}
    </div>
  );
}

