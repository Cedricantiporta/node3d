import React from 'react';
import { NodeData, NODE_COLORS, NodeType } from '../types';
import { X, Square, Circle, Octagon, Diamond, Type } from 'lucide-react';

interface PropertiesPanelProps {
  node: NodeData;
  onChange: (updates: Partial<NodeData>) => void;
  onClose: () => void;
  isDarkMode: boolean;
}

export const PropertiesPanel: React.FC<PropertiesPanelProps> = ({ node, onChange, onClose, isDarkMode }) => {
  
  const shapes = [
    { type: NodeType.START_END, label: 'Start', icon: <div className="w-4 h-3 bg-current rounded-full"/> },
    { type: NodeType.PROCESS, label: 'Process', icon: <div className="w-4 h-3 bg-current rounded-sm"/> },
    { type: NodeType.DECISION, label: 'Decision', icon: <div className="w-3 h-3 bg-current rotate-45"/> },
    { type: NodeType.DATA, label: 'Data', icon: <div className="w-4 h-3 bg-current -skew-x-12"/> },
    { type: NodeType.PREPARATION, label: 'Prep', icon: <Octagon className="w-4 h-4" /> },
    { type: NodeType.SQUARE, label: 'Square', icon: <Square className="w-4 h-4" /> },
    { type: NodeType.CIRCLE, label: 'Circle', icon: <Circle className="w-4 h-4" /> },
  ];

  return (
    <div 
      className={`fixed right-6 top-24 w-64 rounded-2xl shadow-xl backdrop-blur-xl border p-4 z-40 transition-colors ${
        isDarkMode ? 'bg-slate-900/90 border-slate-700 text-slate-200' : 'bg-white/90 border-white/50 text-slate-800'
      }`}
    >
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-semibold text-sm uppercase tracking-wider opacity-70">Properties</h3>
        <button onClick={onClose} className="p-1 hover:bg-black/10 rounded-full transition-colors">
            <X className="w-4 h-4" />
        </button>
      </div>

      <div className="space-y-5">
        
        {/* Label Input */}
        <div>
          <label className="block text-xs font-medium mb-1 opacity-60">Label</label>
          <input 
            type="text" 
            value={node.text} 
            onChange={(e) => onChange({ text: e.target.value })}
            className={`w-full px-3 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                isDarkMode ? 'bg-slate-800 border-slate-600 text-white' : 'bg-white border-slate-200 text-slate-800'
            }`}
          />
        </div>

        {/* Shape Selector */}
        <div>
           <label className="block text-xs font-medium mb-2 opacity-60">Shape</label>
           <div className="grid grid-cols-4 gap-2">
             {shapes.map((shape) => (
               <button
                 key={shape.type}
                 onClick={() => onChange({ type: shape.type })}
                 className={`flex items-center justify-center p-2 rounded-lg border transition-colors ${
                   node.type === shape.type 
                     ? 'bg-blue-500 border-blue-600 text-white' 
                     : isDarkMode ? 'bg-slate-800 border-slate-700 hover:bg-slate-700' : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                 }`}
                 title={shape.label}
               >
                 {shape.icon}
               </button>
             ))}
           </div>
        </div>

        {/* Colors Grid */}
        <div>
           <label className="block text-xs font-medium mb-2 opacity-60">Color</label>
           <div className="grid grid-cols-5 gap-2">
              {Object.values(NODE_COLORS).map(color => (
                  <button
                    key={color}
                    onClick={() => onChange({ color })}
                    className={`w-8 h-8 rounded-full transition-transform hover:scale-110 shadow-sm ${node.color === color ? 'ring-2 ring-offset-2 ring-blue-500' : ''}`}
                    style={{ backgroundColor: color }}
                  />
              ))}
           </div>
        </div>

        {/* Dimensions */}
        <div className="grid grid-cols-2 gap-3">
             <div>
                <label className="block text-xs font-medium mb-1 opacity-60">Width</label>
                <input 
                    type="number" 
                    value={node.width || 140}
                    onChange={(e) => onChange({ width: parseInt(e.target.value) })}
                    className={`w-full px-3 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        isDarkMode ? 'bg-slate-800 border-slate-600 text-white' : 'bg-white border-slate-200 text-slate-800'
                    }`}
                />
             </div>
             <div>
                <label className="block text-xs font-medium mb-1 opacity-60">Height</label>
                <input 
                    type="number" 
                    value={node.height || 80}
                    onChange={(e) => onChange({ height: parseInt(e.target.value) })}
                    className={`w-full px-3 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        isDarkMode ? 'bg-slate-800 border-slate-600 text-white' : 'bg-white border-slate-200 text-slate-800'
                    }`}
                />
             </div>
        </div>

      </div>
    </div>
  );
};