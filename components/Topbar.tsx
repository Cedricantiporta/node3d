import React, { useRef } from 'react';
import { Undo2, Redo2, ZoomIn, ZoomOut, Moon, Sun, Save, FolderOpen, Download } from 'lucide-react';
import { FlowchartState } from '../types';

interface TopbarProps {
  zoom: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onUndo: () => void;
  onRedo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
  onSave: () => void;
  onLoad: (data: FlowchartState) => void;
  onDownloadImage: () => void;
}

export const Topbar: React.FC<TopbarProps> = ({
  zoom,
  onZoomIn,
  onZoomOut,
  onUndo,
  onRedo,
  canUndo,
  canRedo,
  isDarkMode,
  onToggleDarkMode,
  onSave,
  onLoad,
  onDownloadImage
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const btnClass = `flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
    isDarkMode 
      ? 'hover:bg-slate-700 text-slate-300' 
      : 'hover:bg-gray-100 text-slate-600'
  }`;
  
  const disabledClass = "opacity-40 cursor-not-allowed hover:bg-transparent";

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const fileReader = new FileReader();
    if (event.target.files && event.target.files[0]) {
        fileReader.readAsText(event.target.files[0], "UTF-8");
        fileReader.onload = e => {
            if (e.target?.result) {
                try {
                    const parsed = JSON.parse(e.target.result as string);
                    if (parsed.nodes && parsed.edges) {
                        onLoad(parsed);
                    } else {
                        alert("Invalid file format");
                    }
                } catch (err) {
                    console.error("Invalid JSON", err);
                    alert("Failed to parse JSON");
                }
            }
        };
    }
    // Reset input
    if (event.target) event.target.value = '';
  };

  return (
    <div className={`absolute top-0 left-0 w-full h-14 border-b flex items-center justify-between px-4 z-50 transition-colors duration-300 ${
      isDarkMode ? 'bg-slate-900 border-slate-700' : 'bg-white/80 backdrop-blur-md border-gray-200'
    }`}>
      {/* Hidden File Input */}
      <input 
        type="file" 
        accept=".json" 
        ref={fileInputRef} 
        style={{ display: 'none' }} 
        onChange={handleFileChange}
      />

      {/* Title */}
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center shadow-lg shadow-blue-500/20">
            <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5 text-white" stroke="currentColor" strokeWidth="2.5">
                <path d="M7 21a4 4 0 0 1-4-4V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v12a4 4 0 0 1-4 4zm0 0h12a4 4 0 0 0 4-4V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v12a4 4 0 0 0 4 4z" />
            </svg>
        </div>
        <h1 className={`font-bold text-lg tracking-tight select-none ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>
          Nodes <span className="text-blue-500">3D</span>
        </h1>
      </div>

      {/* Center Actions */}
      <div className={`hidden md:flex items-center gap-1 px-2 py-1 rounded-lg border shadow-sm ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'}`}>
        <button onClick={onUndo} disabled={!canUndo} className={`${btnClass} ${!canUndo ? disabledClass : ''}`}>
           <Undo2 className="w-3.5 h-3.5" /> Undo
        </button>
        <button onClick={onRedo} disabled={!canRedo} className={`${btnClass} ${!canRedo ? disabledClass : ''}`}>
           <Redo2 className="w-3.5 h-3.5" /> Redo
        </button>
        <div className={`w-[1px] h-4 mx-2 ${isDarkMode ? 'bg-slate-700' : 'bg-gray-200'}`} />
        <button onClick={onZoomOut} className={btnClass}>
           <ZoomOut className="w-3.5 h-3.5" /> Out
        </button>
        <span className={`text-xs font-mono w-12 text-center select-none ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
            {Math.round(zoom * 100)}%
        </span>
        <button onClick={onZoomIn} className={btnClass}>
           <ZoomIn className="w-3.5 h-3.5" /> In
        </button>
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-2">
         <button onClick={onToggleDarkMode} className={btnClass}>
            {isDarkMode ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
            {isDarkMode ? 'Light' : 'Dark'}
         </button>
         <div className={`w-[1px] h-4 mx-1 ${isDarkMode ? 'bg-slate-700' : 'bg-gray-300'}`} />
         
         <button onClick={() => fileInputRef.current?.click()} className={btnClass}>
            <FolderOpen className="w-3.5 h-3.5" /> Import
         </button>
         <button onClick={onSave} className={btnClass}>
            <Save className="w-3.5 h-3.5" /> Save
         </button>

         <button onClick={onDownloadImage} className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium transition-colors bg-blue-500 hover:bg-blue-600 text-white shadow-sm shadow-blue-500/20`}>
            <Download className="w-3.5 h-3.5" /> Download
         </button>
      </div>
    </div>
  );
};