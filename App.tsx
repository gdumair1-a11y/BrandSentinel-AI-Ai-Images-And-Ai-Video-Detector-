
import React, { useState, useEffect } from 'react';
import { ImageUpload } from './components/ImageUpload';
import { AnalysisResults } from './components/AnalysisResults';
import { sentinelService } from './services/gemini';
import { AnalysisResult, ScanRecord } from './types';
import { Shield, History as HistoryIcon, Activity, Clock, Trash2, ArrowRight, LayoutGrid, CheckCircle2 } from 'lucide-react';

const App: React.FC = () => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [currentResult, setCurrentResult] = useState<AnalysisResult | null>(null);
  const [history, setHistory] = useState<ScanRecord[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [showHistory, setShowHistory] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('sentinel_history');
    if (saved) {
      try {
        setHistory(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to load history", e);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('sentinel_history', JSON.stringify(history));
  }, [history]);

  const handleImageSelected = async (base64: string, mimeType: string) => {
    setIsAnalyzing(true);
    setError(null);
    setCurrentResult(null);

    try {
      const result = await sentinelService.analyzeImage(base64, mimeType);
      setCurrentResult(result);
      
      const newRecord: ScanRecord = {
        id: Date.now().toString(),
        timestamp: Date.now(),
        imageUrl: `data:${mimeType};base64,${base64}`,
        result
      };
      setHistory(prev => [newRecord, ...prev].slice(0, 15));
    } catch (err) {
      setError("Analysis engine timeout. Please verify your assets and network connection.");
      console.error(err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleRemediate = async () => {
    if (!currentResult) return;
    
    // Simulate API delay for remediation
    await new Promise(resolve => setTimeout(resolve, 2500));
    
    const updatedResult = { ...currentResult, remediated: true };
    setCurrentResult(updatedResult);
    
    // Update the record in history as well
    setHistory(prev => prev.map(record => {
      // Find the record that matches current result's content (rough heuristic since result object is what we compare)
      if (record.result === currentResult) {
        return { ...record, result: updatedResult };
      }
      return record;
    }));
  };

  const clearHistory = () => {
    if (confirm("Permanently delete all scan records?")) {
      setHistory([]);
      localStorage.removeItem('sentinel_history');
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#f8fafc] selection:bg-blue-100 selection:text-blue-900">
      {/* Background decoration */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
        <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-blue-100/30 blur-[120px] rounded-full" />
        <div className="absolute top-[20%] -right-[5%] w-[30%] h-[30%] bg-indigo-100/20 blur-[100px] rounded-full" />
      </div>

      <header className="sticky top-0 z-50 w-full bg-white/70 backdrop-blur-xl border-b border-slate-200/60">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5 cursor-pointer group" onClick={() => { setCurrentResult(null); setShowHistory(false); }}>
            <div className="w-9 h-9 bg-slate-900 rounded-lg flex items-center justify-center shadow-lg shadow-slate-200 group-hover:bg-blue-600 transition-colors">
              <Shield className="text-white w-5 h-5" />
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-bold tracking-tight text-slate-900 leading-none">BrandSentinel</span>
              <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest mt-0.5">Image Integrity</span>
            </div>
          </div>
          
          <div className="flex items-center gap-2 sm:gap-6">
            <button 
              onClick={() => setShowHistory(!showHistory)}
              className={`px-3 py-1.5 rounded-full transition-all flex items-center gap-2 text-xs font-bold ${showHistory ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'}`}
            >
              {showHistory ? <LayoutGrid className="w-4 h-4" /> : <HistoryIcon className="w-4 h-4" />}
              <span className="hidden sm:inline">{showHistory ? 'Dashboard' : 'Recent Scans'}</span>
            </button>
            <div className="h-5 w-[1px] bg-slate-200 hidden sm:block"></div>
            <button className="px-5 py-2 bg-blue-600 text-white rounded-full text-xs font-bold hover:bg-blue-700 transition-all shadow-md shadow-blue-100 active:scale-95">
              Secure Portal
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 w-full max-w-7xl mx-auto px-6 py-10">
        {showHistory ? (
          <div className="max-w-5xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-end justify-between mb-10 border-b border-slate-200 pb-6">
              <div>
                <h2 className="text-3xl font-black text-slate-900 flex items-center gap-3 tracking-tight">
                  <HistoryIcon className="w-8 h-8 text-blue-600" />
                  Audit History
                </h2>
                <p className="text-slate-500 text-sm mt-1 font-medium">Tracking and managing your visual integrity records.</p>
              </div>
              <button 
                onClick={clearHistory}
                className="px-4 py-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg flex items-center gap-2 text-xs font-bold transition-all"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Purge All Records
              </button>
            </div>
            
            {history.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {history.map(record => (
                  <div 
                    key={record.id} 
                    className="bg-white p-5 rounded-2xl border border-slate-200/80 flex flex-col hover:shadow-xl hover:shadow-slate-200/50 transition-all cursor-pointer group relative overflow-hidden"
                    onClick={() => { setCurrentResult(record.result); setShowHistory(false); }}
                  >
                    <div className="absolute top-4 right-4 z-10 flex gap-2">
                       {record.result.remediated && (
                         <span className="bg-green-600 text-white text-[8px] font-black uppercase px-2 py-1 rounded shadow-sm flex items-center gap-1">
                           <CheckCircle2 className="w-2.5 h-2.5" /> Fixed
                         </span>
                       )}
                       <span className={`text-[9px] font-black uppercase px-2 py-1 rounded-md border backdrop-blur-sm ${
                        record.result.fraudRisk === 'Low' ? 'bg-green-500/10 text-green-700 border-green-200' :
                        record.result.fraudRisk === 'Medium' ? 'bg-orange-500/10 text-orange-700 border-orange-200' :
                        'bg-red-500/10 text-red-700 border-red-200'
                      }`}>
                        {record.result.fraudRisk}
                      </span>
                    </div>
                    <div className="aspect-[4/3] w-full bg-slate-50 rounded-xl overflow-hidden mb-4 border border-slate-100">
                      <img src={record.imageUrl} alt="Scan" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    </div>
                    <div>
                      <div className="flex justify-between items-center mb-1 text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                        <span>Analysis ID #{record.id.slice(-6)}</span>
                        <span>{new Date(record.timestamp).toLocaleDateString()}</span>
                      </div>
                      <p className="text-sm font-bold text-slate-900 line-clamp-1 mb-3">{record.result.detectedContext || 'Proprietary Visual Scan'}</p>
                      <div className="flex items-center gap-1 text-blue-600 text-[11px] font-black uppercase tracking-tighter group-hover:gap-2 transition-all">
                        Review Report <ArrowRight className="w-3.5 h-3.5" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-24 text-center border-2 border-dashed border-slate-200 rounded-[32px] bg-white/40">
                <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Clock className="w-8 h-8 text-slate-300" />
                </div>
                <h3 className="text-slate-900 font-bold text-lg">No audit records yet</h3>
                <p className="text-slate-400 font-medium max-w-xs mx-auto mt-2">Start scanning your brand assets to build a visual footprint history.</p>
                <button 
                  onClick={() => setShowHistory(false)}
                  className="mt-6 px-10 py-3 bg-slate-900 text-white rounded-full font-bold text-sm hover:shadow-xl transition-all active:scale-95"
                >
                  Return to Dashboard
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="animate-in fade-in duration-700">
            <div className="max-w-4xl mb-12">
              <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-white border border-slate-200 text-blue-700 text-[10px] font-bold uppercase tracking-[0.2em] mb-6 shadow-sm">
                <div className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
                Active Integrity Monitoring
              </div>
              <h1 className="text-5xl md:text-7xl font-black text-slate-900 mb-8 tracking-tighter leading-[0.95] drop-shadow-sm">
                Validate Your <br/>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">Visual Identity.</span>
              </h1>
              <p className="text-lg md:text-xl text-slate-500 leading-relaxed max-w-2xl font-medium">
                Detect synthetic content, spot brand misuse, and track your proprietary assets across the global web with forensic AI.
              </p>
            </div>

            <div className="mb-20">
              <ImageUpload 
                onImageSelected={handleImageSelected} 
                isLoading={isAnalyzing} 
              />
            </div>

            {error && (
              <div className="mb-12 p-5 bg-white border-l-4 border-l-red-500 border-slate-200 rounded-r-2xl shadow-lg flex gap-4 text-slate-900 max-w-2xl mx-auto items-center animate-in slide-in-from-top-2">
                <div className="w-10 h-10 bg-red-50 rounded-full flex items-center justify-center shrink-0">
                  <Trash2 className="w-5 h-5 text-red-500" />
                </div>
                <div>
                  <p className="text-sm font-black text-red-600 uppercase tracking-widest leading-none mb-1">System Error</p>
                  <p className="text-sm font-medium text-slate-600">{error}</p>
                </div>
              </div>
            )}

            {currentResult && <AnalysisResults result={currentResult} onRemediate={handleRemediate} />}

            {!currentResult && !isAnalyzing && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-10 border-t border-slate-200/60">
                <FeatureCard 
                  icon={<Shield className="text-blue-600" />}
                  title="Asset Forensics"
                  description="Verify if visual assets have been altered, deepfaked, or synthetically generated by non-human actors."
                />
                <FeatureCard 
                  icon={<Activity className="text-indigo-600" />}
                  title="Web Grounding"
                  description="Scan the public internet for duplicate or modified versions of your logos and proprietary photography."
                />
                <FeatureCard 
                  icon={<HistoryIcon className="text-slate-600" />}
                  title="Risk Scoring"
                  description="Automated threat assessment for impersonation attempts, phishing sites, and trademark violations."
                />
              </div>
            )}
          </div>
        )}
      </main>

      <footer className="bg-white border-t border-slate-200/60 py-10 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-2.5 opacity-40 grayscale hover:grayscale-0 hover:opacity-100 transition-all duration-500">
            <div className="w-7 h-7 bg-slate-900 rounded flex items-center justify-center">
              <Shield className="text-white w-4 h-4" />
            </div>
            <span className="text-sm font-black text-slate-900 tracking-tighter">BrandSentinel AI</span>
          </div>
          <div className="flex gap-10 text-[10px] text-slate-400 font-bold uppercase tracking-widest">
            <a href="#" className="hover:text-blue-600 transition-colors">Forensic Standards</a>
            <a href="#" className="hover:text-blue-600 transition-colors">Privacy Charter</a>
            <a href="#" className="hover:text-blue-600 transition-colors">API Status</a>
          </div>
          <div className="text-[10px] text-slate-300 font-bold uppercase tracking-[0.3em]">
            Nodes Active: 4,102
          </div>
        </div>
      </footer>
    </div>
  );
};

const FeatureCard = ({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) => (
  <div className="p-8 rounded-3xl bg-white border border-slate-200/80 hover:border-blue-200 hover:shadow-2xl hover:shadow-blue-900/5 transition-all duration-500 group">
    <div className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-blue-50 transition-all duration-500">
      {React.cloneElement(icon as React.ReactElement, { className: 'w-6 h-6' })}
    </div>
    <h3 className="text-lg font-bold text-slate-900 mb-2 tracking-tight">{title}</h3>
    <p className="text-slate-500 text-xs leading-relaxed font-medium">{description}</p>
  </div>
);

export default App;
