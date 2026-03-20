
import React, { useState } from 'react';
import { ShieldCheck, AlertTriangle, ExternalLink, Cpu, Globe, Scale, ArrowUpRight, CheckCircle2, Wand2, Loader2, MailCheck, ShieldAlert } from 'lucide-react';
import { AnalysisResult } from '../types';

interface AnalysisResultsProps {
  result: AnalysisResult;
  onRemediate: () => Promise<void>;
}

export const AnalysisResults: React.FC<AnalysisResultsProps> = ({ result, onRemediate }) => {
  const [isRemediating, setIsRemediating] = useState(false);
  
  const riskStyles = {
    Low: 'text-green-700 bg-green-50 border-green-200',
    Medium: 'text-orange-700 bg-orange-50 border-orange-200',
    High: 'text-red-700 bg-red-50 border-red-200'
  };

  const aiStyle = result.isAiGenerated 
    ? 'bg-orange-50 border-orange-200 text-orange-900' 
    : 'bg-green-50 border-green-200 text-green-900';

  const handleRemediate = async () => {
    setIsRemediating(true);
    await onRemediate();
    setIsRemediating(false);
  };

  return (
    <div className="mt-16 grid grid-cols-1 lg:grid-cols-12 gap-8 pb-32 animate-in fade-in slide-in-from-bottom-6 duration-700">
      {/* Visual Integrity Card - 8 Cols */}
      <div className="lg:col-span-8 space-y-6">
        <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-slate-50 -mr-16 -mt-16 rounded-full opacity-50" />
          
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
              <Cpu className="w-5 h-5 text-blue-600" />
            </div>
            <h3 className="text-xl font-bold tracking-tight">Forensic Vision Analysis</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-10">
            <div className={`p-6 rounded-2xl border ${aiStyle}`}>
              <span className="text-[10px] font-black uppercase tracking-widest opacity-60 block mb-2">Integrity Status</span>
              <div className="flex items-center gap-2.5">
                {result.isAiGenerated ? (
                  <>
                    <AlertTriangle className="w-5 h-5 text-orange-600 shrink-0" />
                    <span className="text-lg font-bold">Synthetic / Manipulated</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0" />
                    <span className="text-lg font-bold">Authentic Profile</span>
                  </>
                )}
              </div>
            </div>
            
            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-100">
              <div className="flex justify-between items-center mb-3">
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">AI Confidence Score</span>
                <span className="font-mono font-bold text-slate-700">{(result.aiConfidence * 100).toFixed(0)}%</span>
              </div>
              <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                <div 
                  className={`h-full transition-all duration-[1.5s] ease-out ${result.isAiGenerated ? 'bg-orange-500' : 'bg-green-500'}`}
                  style={{ width: `${result.aiConfidence * 100}%` }}
                ></div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
              Analyst Observations
              <div className="h-[1px] flex-1 bg-slate-100" />
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {result.manipulationNotes.map((note, idx) => (
                <div key={idx} className="flex gap-3 p-3 rounded-xl bg-slate-50/50 border border-slate-100/50 text-sm text-slate-600">
                  <div className="w-5 h-5 bg-white rounded flex items-center justify-center shrink-0 shadow-sm">
                    <span className="text-[10px] font-bold text-blue-500">{idx + 1}</span>
                  </div>
                  {note}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Web Matches - 8 Cols */}
        <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center">
                <Globe className="w-5 h-5 text-indigo-600" />
              </div>
              <h3 className="text-xl font-bold tracking-tight">Public Web Distribution</h3>
            </div>
            <span className="text-[10px] font-black bg-slate-100 px-3 py-1 rounded-full text-slate-500 uppercase tracking-widest">
              {result.foundSources.length} Matches Found
            </span>
          </div>

          {result.foundSources.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {result.foundSources.map((source, idx) => (
                <a
                  key={idx}
                  href={source.uri}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-4 rounded-2xl border border-slate-50 bg-slate-50/30 hover:bg-white hover:border-blue-100 hover:shadow-xl hover:shadow-blue-900/5 transition-all group"
                >
                  <div className="flex items-center gap-4 min-w-0">
                    <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shrink-0 border border-slate-100 group-hover:border-blue-50">
                      <Globe className="w-4 h-4 text-slate-300 group-hover:text-blue-500" />
                    </div>
                    <div className="flex flex-col truncate pr-4">
                      <span className="text-sm font-bold text-slate-900 truncate">{source.title}</span>
                      <span className="text-[10px] font-bold text-slate-400 truncate uppercase tracking-tight">{new URL(source.uri).hostname}</span>
                    </div>
                  </div>
                  <ArrowUpRight className="w-4 h-4 text-slate-300 group-hover:text-blue-500 shrink-0 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                </a>
              ))}
            </div>
          ) : (
            <div className="p-12 text-center bg-slate-50 rounded-[32px] border-2 border-dashed border-slate-200">
              <p className="text-slate-400 font-bold italic">No unauthorized distributions detected on public web nodes.</p>
            </div>
          )}
        </div>
      </div>

      {/* Brand Risk Sidebar - 4 Cols */}
      <div className="lg:col-span-4 space-y-6">
        <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm sticky top-24 overflow-hidden">
          {result.remediated && (
            <div className="absolute inset-0 bg-green-600/10 backdrop-blur-[2px] z-10 flex items-center justify-center p-6 text-center animate-in fade-in duration-500">
              <div className="bg-white p-6 rounded-2xl shadow-xl border border-green-100 flex flex-col items-center">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
                  <MailCheck className="w-6 h-6 text-green-600" />
                </div>
                <h4 className="text-lg font-bold text-green-900">Remediated</h4>
                <p className="text-xs text-green-600 font-medium mt-1">Takedown notices dispatched to all nodes.</p>
                <button 
                  onClick={() => setIsRemediating(false)} 
                  className="mt-4 text-[10px] font-black uppercase text-slate-400 hover:text-slate-900 transition-colors"
                >
                  View Details
                </button>
              </div>
            </div>
          )}

          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center shadow-lg shadow-slate-200">
              <ShieldCheck className="w-5 h-5 text-white" />
            </div>
            <h3 className="text-xl font-bold tracking-tight">Risk Profile</h3>
          </div>

          <div className={`p-8 rounded-3xl border mb-8 text-center shadow-inner ${riskStyles[result.fraudRisk]}`}>
            <span className="text-[10px] font-black uppercase tracking-[0.2em] block mb-2 opacity-60">Threat Classification</span>
            <span className="text-4xl font-black tracking-tighter">{result.fraudRisk} Risk</span>
          </div>

          <div className="space-y-8">
            <div>
              <div className="flex justify-between items-end mb-3">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Brand Authenticity</span>
                <span className="text-2xl font-black text-slate-900">{result.brandAuthenticityScore}%</span>
              </div>
              <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-blue-600 transition-all duration-[1.2s] ease-in-out"
                  style={{ width: `${result.brandAuthenticityScore}%` }}
                ></div>
              </div>
            </div>

            <div className="pt-6 border-t border-slate-100">
              <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Integrity Flags</h4>
              <div className="flex flex-wrap gap-2">
                {result.moderationFlags.length > 0 ? (
                  result.moderationFlags.map((flag, idx) => (
                    <span key={idx} className="px-3 py-1.5 rounded-lg bg-red-50 text-red-600 text-[10px] font-black uppercase tracking-widest border border-red-100">
                      {flag}
                    </span>
                  ))
                ) : (
                  <span className="px-3 py-1.5 rounded-lg bg-green-50 text-green-600 text-[10px] font-black uppercase tracking-widest border border-green-100 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3 h-3" /> Standard Compliance
                  </span>
                )}
              </div>
            </div>

            <div className="pt-8 mt-4">
               <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                <Scale className="w-3.5 h-3.5" />
                Contextual Summary
              </h4>
              <p className="text-sm font-medium text-slate-600 leading-relaxed italic bg-slate-50 p-4 rounded-2xl border border-slate-100">
                "{result.detectedContext}"
              </p>
            </div>

            <div className="space-y-3 pt-6">
              <button 
                disabled={isRemediating || result.remediated}
                onClick={handleRemediate}
                className={`w-full py-4 rounded-2xl font-bold text-sm shadow-xl transition-all active:scale-[0.98] flex items-center justify-center gap-2 ${
                  result.remediated 
                    ? 'bg-green-600 text-white cursor-default' 
                    : 'bg-blue-600 text-white hover:bg-blue-700 shadow-blue-100'
                }`}
              >
                {isRemediating ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Executing Auto-Fix...
                  </>
                ) : result.remediated ? (
                  <>
                    <ShieldCheck className="w-4 h-4" />
                    Assets Secured
                  </>
                ) : (
                  <>
                    <Wand2 className="w-4 h-4" />
                    One-Click Auto Fix
                  </>
                )}
              </button>
              
              <button className="w-full py-4 bg-slate-900 text-white rounded-2xl font-bold text-sm shadow-xl shadow-slate-200 hover:bg-slate-800 transition-all active:scale-[0.98] flex items-center justify-center gap-2">
                Export Forensic Report
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
