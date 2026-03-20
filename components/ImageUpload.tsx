
import React, { useState, useRef, useEffect } from 'react';
import { Upload, Camera, ImageIcon, X, RefreshCw, FileImage, ShieldAlert } from 'lucide-react';

interface ImageUploadProps {
  onImageSelected: (base64: string, mimeType: string) => void;
  isLoading: boolean;
}

export const ImageUpload: React.FC<ImageUploadProps> = ({ onImageSelected, isLoading }) => {
  const [dragActive, setDragActive] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const handleFiles = (files: FileList) => {
    const file = files[0];
    if (file && (file.type.startsWith('image/') || file.type.startsWith('video/'))) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        const base64 = result.split(',')[1];
        setPreview(result);
        onImageSelected(base64, file.type);
      };
      reader.readAsDataURL(file);
    }
  };

  const onDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(e.type === "dragenter" || e.type === "dragover");
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const startCamera = async () => {
    setIsCameraOpen(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error("Error accessing camera:", err);
      setIsCameraOpen(false);
      alert("Access Denied: Camera hardware not detected or permissions restricted.");
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
    }
    setIsCameraOpen(false);
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const context = canvasRef.current.getContext('2d');
      if (context) {
        canvasRef.current.width = videoRef.current.videoWidth;
        canvasRef.current.height = videoRef.current.videoHeight;
        context.drawImage(videoRef.current, 0, 0);
        const dataUrl = canvasRef.current.toDataURL('image/jpeg');
        const base64 = dataUrl.split(',')[1];
        setPreview(dataUrl);
        onImageSelected(base64, 'image/jpeg');
        stopCamera();
      }
    }
  };

  const reset = () => {
    setPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      {isCameraOpen && (
        <div className="fixed inset-0 z-[100] bg-slate-900/95 backdrop-blur-2xl flex flex-col items-center justify-center animate-in fade-in duration-300">
          <div className="relative w-full max-w-lg aspect-[3/4] sm:aspect-square bg-black overflow-hidden rounded-[40px] shadow-2xl border-4 border-white/10 mx-6">
            <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
            <canvas ref={canvasRef} className="hidden" />
            
            {/* Camera Overlay UI */}
            <div className="absolute inset-0 border-[2px] border-white/20 m-8 rounded-3xl pointer-events-none" />
            <div className="absolute top-1/2 left-0 w-full h-[1px] bg-white/10 pointer-events-none" />
            <div className="absolute top-0 left-1/2 w-[1px] h-full bg-white/10 pointer-events-none" />
          </div>

          <div className="mt-12 flex items-center gap-10">
            <button
              onClick={stopCamera}
              className="p-5 bg-white/10 text-white rounded-full hover:bg-white/20 transition-all active:scale-90"
            >
              <X className="w-8 h-8" />
            </button>
            <button
              onClick={capturePhoto}
              className="group relative w-24 h-24 flex items-center justify-center"
            >
              <div className="absolute inset-0 rounded-full border-4 border-white/30 scale-110 group-active:scale-95 transition-transform" />
              <div className="w-20 h-20 bg-white rounded-full shadow-lg group-active:scale-90 transition-transform" />
            </button>
            <div className="w-16 h-16 invisible" />
          </div>
        </div>
      )}

      {!preview ? (
        <div
          className={`relative border-2 border-dashed rounded-[40px] p-20 transition-all duration-500 text-center group ${
            dragActive ? 'border-blue-500 bg-blue-50/40 scale-[1.02] shadow-2xl shadow-blue-900/10' : 'border-slate-200 bg-white/50 hover:border-slate-300 hover:bg-white'
          } ${isLoading ? 'opacity-50 pointer-events-none' : ''}`}
          onDragEnter={onDrag}
          onDragLeave={onDrag}
          onDragOver={onDrag}
          onDrop={onDrop}
        >
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            accept="image/*,video/*"
            onChange={(e) => e.target.files && handleFiles(e.target.files)}
          />
          
          <div className="flex flex-col items-center">
            <div className={`w-24 h-24 rounded-[32px] flex items-center justify-center mb-8 transition-all duration-500 ${dragActive ? 'bg-blue-600 shadow-xl shadow-blue-200' : 'bg-slate-100 group-hover:bg-slate-200 shadow-sm'}`}>
              <Upload className={`w-10 h-10 transition-colors duration-500 ${dragActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-600'}`} />
            </div>
            <h3 className="text-3xl font-black text-slate-900 mb-3 tracking-tight">Audit Assets</h3>
            <p className="text-slate-500 mb-10 max-w-sm mx-auto font-medium text-sm leading-relaxed">Securely upload a brand visual or use your camera to initiate forensic web tracking.</p>
            
            <div className="flex flex-wrap justify-center gap-4">
              <button
                onClick={() => fileInputRef.current?.click()}
                className="px-10 py-4 bg-slate-900 text-white rounded-full font-bold text-sm hover:shadow-2xl hover:shadow-slate-300 transition-all hover:-translate-y-0.5 active:scale-95"
              >
                Browse Files
              </button>
              <button
                onClick={startCamera}
                className="px-10 py-4 bg-white border border-slate-200 text-slate-900 rounded-full font-bold text-sm hover:bg-slate-50 transition-all flex items-center gap-3 shadow-sm active:scale-95"
              >
                <Camera className="w-5 h-5 text-blue-600" />
                Live Integrity Scan
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="relative rounded-[40px] overflow-hidden bg-white border border-slate-200 shadow-2xl animate-in zoom-in duration-500">
          <div className="aspect-video bg-slate-950 flex items-center justify-center relative group">
            {preview.startsWith('data:video/') ? (
               <video src={preview} controls className="max-w-full max-h-[460px] relative z-10" />
            ) : (
               <img src={preview} alt="Preview" className="max-w-full max-h-[460px] object-contain relative z-10" />
            )}
            
            {/* Visual scan animation effect */}
            {!isLoading && <div className="absolute inset-0 bg-gradient-to-t from-blue-600/5 to-transparent pointer-events-none" />}
          </div>

          <div className="p-4 bg-white border-t border-slate-100 flex justify-between items-center px-8">
            <div className="flex items-center gap-3">
               <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center">
                  <FileImage className="w-4 h-4 text-slate-500" />
               </div>
               <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Selected Component</span>
            </div>
            <button
              onClick={reset}
              className="px-4 py-2 bg-slate-100 hover:bg-red-50 hover:text-red-600 text-slate-500 rounded-full text-[10px] font-black uppercase tracking-widest transition-all"
              disabled={isLoading}
            >
              Remove Asset
            </button>
          </div>

          {isLoading && (
            <div className="absolute inset-0 bg-white/80 backdrop-blur-xl flex flex-col items-center justify-center z-50 animate-in fade-in duration-500">
              <div className="relative w-24 h-24 flex items-center justify-center">
                <div className="absolute inset-0 border-[6px] border-blue-100 rounded-full"></div>
                <div className="absolute inset-0 border-[6px] border-blue-600 rounded-full border-t-transparent animate-spin"></div>
                <ShieldAlert className="w-8 h-8 text-blue-600 animate-pulse" />
              </div>
              <p className="mt-8 text-slate-900 font-black text-2xl tracking-tighter">Forensic Syncing</p>
              <div className="flex items-center gap-1.5 mt-2">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-bounce [animation-delay:-0.3s]"></div>
                <div className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-bounce [animation-delay:-0.15s]"></div>
                <div className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-bounce"></div>
              </div>
              <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-6">Searching global web nodes...</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
