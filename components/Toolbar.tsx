import React from 'react';
import { NodeType, EdgeStyle } from '../types';
import { Octagon, Download, Trash2, Copy, Link as LinkIcon, Spline, ZoomIn, ZoomOut, ArrowRight, Undo2, Redo2, Moon, Sun, Square, Circle } from 'lucide-react';

interface ToolbarProps {
  onAddNode: (type: NodeType) => void;
  onExport: () => void;
  onDelete: () => void;
  onClipboard: () => void;
  onToggleConnect: () => void;
  onChangeEdgeStyle: () => void;
  onToggleArrow: () => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onUndo: () => void;
  onRedo: () => void;
  onToggleDarkMode: () => void;
  hasSelection: boolean;
  isConnectMode: boolean;
  edgeStyle: EdgeStyle;
  showArrows: boolean;
  canUndo: boolean;
  canRedo: boolean;
  isDarkMode: boolean;
}

export const Toolbar: React.FC<ToolbarProps> = ({ 
  onAddNode, 
  onExport, 
  onDelete, 
  onClipboard,
  onToggleConnect,
  onChangeEdgeStyle,
  onToggleArrow,
  onZoomIn,
  onZoomOut,
  onUndo,
  onRedo,
  onToggleDarkMode,
  hasSelection,
  isConnectMode,
  edgeStyle,
  showArrows,
  canUndo,
  canRedo,
  isDarkMode
}) => {
  return (
    <div className={`fixed bottom-8 left-1/2 -translate-x-1/2 ${isDarkMode ? 'bg-slate-900/80 border-slate-700' : 'bg-white/80 border-white/20'} backdrop-blur-xl border shadow-2xl rounded-full px-6 py-3 flex items-center gap-6 z-50 transition-colors duration-300`}>
      
      {/* Node Shapes */}
      <div className={`flex gap-2 border-r pr-4 ${isDarkMode ? 'border-slate-700' : 'border-gray-300'}`}>
        <ToolButton 
            onClick={() => onAddNode(NodeType.START_END)} 
            icon={<div className="w-5 h-3 bg-green-500 rounded-full" />} 
            label="Start" 
            darkMode={isDarkMode}
        />
        <ToolButton 
            onClick={() => onAddNode(NodeType.PROCESS)} 
            icon={<div className="w-5 h-3 bg-blue-500 rounded-sm" />} 
            label="Process" 
            darkMode={isDarkMode}
        />
        <ToolButton 
            onClick={() => onAddNode(NodeType.DECISION)} 
            icon={<div className="w-4 h-4 bg-orange-400 rotate-45" />} 
            label="Decision" 
            darkMode={isDarkMode}
        />
        <ToolButton 
            onClick={() => onAddNode(NodeType.DATA)} 
            icon={<div className="w-5 h-4 bg-teal-500 -skew-x-12 rounded-sm" />} 
            label="Data" 
            darkMode={isDarkMode}
        />
        <ToolButton 
            onClick={() => onAddNode(NodeType.SQUARE)} 
            icon={<Square className="w-4 h-4 text-purple-500 fill-purple-500" />} 
            label="Square" 
            darkMode={isDarkMode}
        />
        <ToolButton 
            onClick={() => onAddNode(NodeType.CIRCLE)} 
            icon={<Circle className="w-4 h-4 text-red-400 fill-red-400" />} 
            label="Circle" 
            darkMode={isDarkMode}
        />
      </div>

      {/* Connection Tools */}
      <div className={`flex gap-3 items-center border-r pr-4 ${isDarkMode ? 'border-slate-700' : 'border-gray-300'}`}>
          <ToolButton
            onClick={onToggleConnect}
            icon={<LinkIcon className={`w-5 h-5 ${isConnectMode ? 'text-blue-500' : isDarkMode ? 'text-slate-400' : 'text-gray-500'}`} />}
            label={isConnectMode ? 'Linking...' : 'Link'}
            isActive={isConnectMode}
            darkMode={isDarkMode}
          />
          <ToolButton
            onClick={onChangeEdgeStyle}
            icon={<Spline className={`w-5 h-5 ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`} />}
            label={edgeStyle === EdgeStyle.CURVED ? 'Curved' : edgeStyle === EdgeStyle.STEP ? 'Step' : 'Straight'}
            darkMode={isDarkMode}
          />
          <ToolButton
            onClick={onToggleArrow}
            icon={<ArrowRight className={`w-5 h-5 ${showArrows ? 'text-blue-500' : isDarkMode ? 'text-slate-400' : 'text-gray-400'}`} />}
            label={showArrows ? 'Arrow' : 'Line'}
            isActive={showArrows}
            darkMode={isDarkMode}
          />
      </div>

      {/* Zoom & History */}
      <div className={`flex gap-2 items-center border-r pr-4 ${isDarkMode ? 'border-slate-700' : 'border-gray-300'}`}>
          <button onClick={onUndo} disabled={!canUndo} className={`p-2 transition-colors rounded-full ${!canUndo ? 'opacity-30 cursor-not-allowed' : 'hover:bg-blue-500/10 hover:text-blue-500'} ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}>
            <Undo2 className="w-5 h-5" />
          </button>
          <button onClick={onRedo} disabled={!canRedo} className={`p-2 transition-colors rounded-full ${!canRedo ? 'opacity-30 cursor-not-allowed' : 'hover:bg-blue-500/10 hover:text-blue-500'} ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}>
            <Redo2 className="w-5 h-5" />
          </button>
          <div className={`w-[1px] h-4 mx-1 ${isDarkMode ? 'bg-slate-700' : 'bg-gray-300'}`} />
          <button onClick={onZoomOut} className={`p-2 hover:text-blue-500 transition-colors ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}>
            <ZoomOut className="w-5 h-5" />
          </button>
          <button onClick={onZoomIn} className={`p-2 hover:text-blue-500 transition-colors ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}>
            <ZoomIn className="w-5 h-5" />
          </button>
      </div>

      {/* Actions */}
      <div className={`flex gap-3 items-center border-r pr-4 ${isDarkMode ? 'border-slate-700' : 'border-gray-300'}`}>
          <button onClick={onToggleDarkMode} className={`p-2 hover:text-yellow-500 transition-colors rounded-full hover:bg-yellow-500/10 ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}>
            {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>
        {hasSelection && (
            <button
                onClick={onDelete}
                className="p-2 text-gray-500 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
                title="Delete Selected"
            >
                <Trash2 className="w-5 h-5" />
            </button>
        )}
      </div>

      {/* Export */}
      <div className="flex gap-2 pl-2">
        <button
          onClick={onClipboard}
          className={`p-2 hover:text-blue-500 hover:bg-blue-500/10 rounded-full transition-colors ${isDarkMode ? 'text-slate-400' : 'text-gray-600'}`}
          title="Copy Image to Clipboard"
        >
          <Copy className="w-5 h-5" />
        </button>
        <button
          onClick={onExport}
          className={`p-2 hover:text-blue-500 hover:bg-blue-500/10 rounded-full transition-colors ${isDarkMode ? 'text-slate-400' : 'text-gray-600'}`}
          title="Download PNG"
        >
          <Download className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

interface ToolButtonProps {
    onClick: () => void;
    icon: React.ReactNode;
    label: string;
    isActive?: boolean;
    darkMode?: boolean;
}

const ToolButton: React.FC<ToolButtonProps> = ({ onClick, icon, label, isActive, darkMode }) => (
  <button 
    onClick={onClick}
    className={`flex flex-col items-center justify-center gap-1 group w-12 rounded-lg py-1 transition-colors ${isActive ? 'bg-blue-500/10' : darkMode ? 'hover:bg-slate-800' : 'hover:bg-gray-50'}`}
  >
    <div className="p-1 group-hover:scale-110 transition-transform">
        {icon}
    </div>
    <span className={`text-[10px] font-medium ${isActive ? 'text-blue-500' : darkMode ? 'text-slate-400' : 'text-gray-500'}`}>{label}</span>
  </button>
);