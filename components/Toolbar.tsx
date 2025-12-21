import React from 'react';
import { NodeType, EdgeStyle } from '../types';
import { Octagon, Link as LinkIcon, Spline, ArrowRight, Trash2 } from 'lucide-react';

interface ToolbarProps {
  onAddNode: (type: NodeType) => void;
  onDelete: () => void;
  onToggleConnect: () => void;
  onChangeEdgeStyle: () => void;
  onToggleArrow: () => void;
  hasSelection: boolean;
  isConnectMode: boolean;
  edgeStyle: EdgeStyle;
  showArrows: boolean;
  isDarkMode: boolean;
}

export const Toolbar: React.FC<ToolbarProps> = ({ 
  onAddNode, 
  onDelete, 
  onToggleConnect,
  onChangeEdgeStyle,
  onToggleArrow,
  hasSelection,
  isConnectMode,
  edgeStyle,
  showArrows,
  isDarkMode
}) => {
  return (
    <div className={`fixed bottom-8 left-1/2 -translate-x-1/2 ${isDarkMode ? 'bg-slate-900/80 border-slate-700' : 'bg-white/80 border-white/20'} backdrop-blur-xl border shadow-2xl rounded-2xl px-4 py-2 flex items-center gap-4 z-50 transition-colors duration-300`}>
      
      {/* Node Shapes */}
      <div className={`flex gap-2 border-r pr-4 ${isDarkMode ? 'border-slate-700' : 'border-gray-200'}`}>
        <ToolButton 
            onClick={() => onAddNode(NodeType.START_END)} 
            icon={<div className="w-5 h-3 bg-green-500 rounded-full shadow-sm" />} 
            label="Start" 
            darkMode={isDarkMode}
        />
        <ToolButton 
            onClick={() => onAddNode(NodeType.PROCESS)} 
            icon={<div className="w-5 h-3 bg-blue-500 rounded-sm shadow-sm" />} 
            label="Process" 
            darkMode={isDarkMode}
        />
        <ToolButton 
            onClick={() => onAddNode(NodeType.DECISION)} 
            icon={<div className="w-4 h-4 bg-orange-400 rotate-45 shadow-sm" />} 
            label="Decision" 
            darkMode={isDarkMode}
        />
        <ToolButton 
            onClick={() => onAddNode(NodeType.DATA)} 
            icon={<div className="w-5 h-4 bg-teal-500 -skew-x-12 rounded-sm shadow-sm" />} 
            label="Data" 
            darkMode={isDarkMode}
        />
      </div>

      {/* Connection Tools */}
      <div className={`flex gap-3 items-center ${hasSelection ? 'border-r pr-4' : ''} ${isDarkMode ? 'border-slate-700' : 'border-gray-200'}`}>
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

      {/* Delete Action (only if selection) */}
      {hasSelection && (
          <div className="flex gap-2">
            <button
                onClick={onDelete}
                className="group flex flex-col items-center justify-center gap-1 w-12 rounded-lg py-1 hover:bg-red-50 transition-colors"
                title="Delete Selected"
            >
                <div className="p-1 group-hover:scale-110 transition-transform">
                    <Trash2 className="w-5 h-5 text-gray-500 group-hover:text-red-500" />
                </div>
                <span className="text-[10px] font-medium text-gray-500 group-hover:text-red-500">Delete</span>
            </button>
          </div>
      )}
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