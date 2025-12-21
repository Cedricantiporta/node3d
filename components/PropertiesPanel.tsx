import React from 'react';
import { NodeData, EdgeData, NODE_COLORS, NodeType } from '../types';
import { X, Octagon, Type } from 'lucide-react';

interface PropertiesPanelProps {
  node: NodeData | null;
  edge: EdgeData | null;
  onChange: (updates: Partial<NodeData>) => void;
  onEdgeChange: (updates: Partial<EdgeData>) => void;
  onClose: () => void;
  isDarkMode: boolean;
}

export const PropertiesPanel: React.FC<PropertiesPanelProps> = ({ node, edge, onChange, onEdgeChange, onClose, isDarkMode }) => {
  
  if (!node && !edge) return null;

  const shapes = [
    { type: NodeType.START_END, label: 'Start', icon: <div className="w-4 h-3 bg-current rounded-full"/> },
    { type: NodeType.PROCESS, label: 'Process', icon: <div className="w-4 h-3 bg-current rounded-sm"/> },
    { type: NodeType.DECISION, label: 'Decision', icon: <div className="w-3 h-3 bg-current rotate-45"/> },
    { type: NodeType.DATA, label: 'Data', icon: <div className="w-4 h-3 bg-current -skew-x-12"/> },
    { type: NodeType.PREPARATION, label: 'Prep', icon: <Octagon className="w-4 h-4" /> },
  ];

  const commonInputClass = `w-full px-3 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${isDarkMode ? 'bg-slate-800 border-slate-600 text-white' : 'bg-white border-slate-200 text-slate-800'}`;

  // Helper for Segmented Control Item Style (Light theme on Light theme)
  const getSegmentItemClass = (isActive: boolean) => 
    `flex-1 py-1.5 text-xs font-medium rounded-md transition-all ${
        isActive 
        ? 'bg-white text-slate-900 shadow-sm ring-1 ring-black/5 dark:bg-slate-600 dark:text-white dark:ring-0' 
        : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
    }`;

  const segmentContainerClass = `flex p-1 rounded-lg ${isDarkMode ? 'bg-slate-800' : 'bg-slate-100'}`;

  return (
    <div 
      className={`fixed right-6 top-24 w-64 rounded-2xl shadow-xl backdrop-blur-xl border p-4 z-40 transition-colors ${
        isDarkMode ? 'bg-slate-900/90 border-slate-700 text-slate-200' : 'bg-white/90 border-white/50 text-slate-800'
      }`}
    >
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-semibold text-sm uppercase tracking-wider opacity-70">
            {node ? 'Node Properties' : 'Line Properties'}
        </h3>
        <button onClick={onClose} className="p-1 hover:bg-black/10 rounded-full transition-colors">
            <X className="w-4 h-4" />
        </button>
      </div>

      <div className="space-y-5">
        
        {/* Node Editing */}
        {node && (
            <>
                <div>
                  <label className="block text-xs font-medium mb-1 opacity-60">Text</label>
                  <textarea 
                    value={node.text} 
                    onChange={(e) => onChange({ text: e.target.value })}
                    rows={3}
                    className={`${commonInputClass} resize-none`}
                    placeholder="Enter node text..."
                  />
                </div>

                {/* Text Color Toggle */}
                <div>
                   <label className="block text-xs font-medium mb-2 opacity-60">Text Color</label>
                   <div className={segmentContainerClass}>
                       <button
                           onClick={() => onChange({ textColor: undefined })}
                           className={getSegmentItemClass(node.textColor === undefined)}
                       >
                           Auto
                       </button>
                       <button
                           onClick={() => onChange({ textColor: 'black' })}
                           className={getSegmentItemClass(node.textColor === 'black')}
                       >
                           Black
                       </button>
                       <button
                           onClick={() => onChange({ textColor: 'white' })}
                           className={getSegmentItemClass(node.textColor === 'white')}
                       >
                           White
                       </button>
                   </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                    <div>
                        <label className="block text-xs font-medium mb-1 opacity-60">Width</label>
                        <input 
                            type="number" 
                            value={node.width || 140} 
                            onChange={(e) => onChange({ width: parseInt(e.target.value) || 140 })}
                            className={commonInputClass}
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-medium mb-1 opacity-60">Height</label>
                        <input 
                            type="number" 
                            value={node.height || 80} 
                            onChange={(e) => onChange({ height: parseInt(e.target.value) || 80 })}
                            className={commonInputClass}
                        />
                    </div>
                </div>

                <div>
                   <label className="block text-xs font-medium mb-2 opacity-60">Shape</label>
                   <div className="grid grid-cols-5 gap-2">
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

                <div>
                   <label className="block text-xs font-medium mb-2 opacity-60">Color</label>
                   <div className="grid grid-cols-5 gap-2">
                      {Object.values(NODE_COLORS).map(color => (
                          <button
                            key={color}
                            onClick={() => onChange({ color })}
                            className={`w-8 h-8 rounded-full transition-transform hover:scale-110 shadow-sm ${node.color === color ? 'ring-2 ring-offset-2 ring-blue-500' : ''} ${color.toLowerCase() === '#ffffff' ? 'border border-slate-300' : ''}`}
                            style={{ backgroundColor: color }}
                          />
                      ))}
                   </div>
                </div>
            </>
        )}

        {/* Edge Editing */}
        {edge && (
             <div className="space-y-4">
                <div>
                   <label className="block text-xs font-medium mb-1 opacity-60">Label</label>
                   <input 
                     type="text" 
                     value={edge.label || ''} 
                     onChange={(e) => onEdgeChange({ label: e.target.value })}
                     className={commonInputClass}
                     placeholder="e.g. Yes, No"
                   />
                </div>

                {/* Edge Color */}
                <div>
                    <label className="block text-xs font-medium mb-2 opacity-60">Line Color</label>
                    <div className="flex gap-3">
                        <button 
                            onClick={() => onEdgeChange({ color: 'black' })}
                            className={`w-8 h-8 rounded-full border-2 ${edge.color === 'black' || !edge.color ? 'border-blue-500 ring-2 ring-blue-500/20' : 'border-transparent'} bg-black`}
                            title="Black"
                        />
                        <button 
                            onClick={() => onEdgeChange({ color: 'grey' })}
                            className={`w-8 h-8 rounded-full border-2 ${edge.color === 'grey' ? 'border-blue-500 ring-2 ring-blue-500/20' : 'border-transparent'} bg-gray-500`}
                            title="Grey"
                        />
                        <button 
                            onClick={() => onEdgeChange({ color: 'red' })}
                            className={`w-8 h-8 rounded-full border-2 ${edge.color === 'red' ? 'border-blue-500 ring-2 ring-blue-500/20' : 'border-transparent'} bg-red-500`}
                            title="Red"
                        />
                    </div>
                </div>

                 {/* Edge Shadow */}
                <div className="flex items-center justify-between">
                    <label className="block text-xs font-medium opacity-60">3D Shadow</label>
                    <button 
                        onClick={() => onEdgeChange({ hasShadow: !edge.hasShadow })}
                        className={`w-10 h-6 rounded-full p-1 transition-colors ${edge.hasShadow ? 'bg-blue-500' : isDarkMode ? 'bg-slate-700' : 'bg-slate-300'}`}
                    >
                        <div className={`w-4 h-4 bg-white rounded-full shadow-sm transition-transform ${edge.hasShadow ? 'translate-x-4' : 'translate-x-0'}`} />
                    </button>
                </div>

                {/* Edge Thickness */}
                <div>
                    <label className="block text-xs font-medium mb-2 opacity-60">Thickness</label>
                    <div className={segmentContainerClass}>
                        <button 
                            onClick={() => onEdgeChange({ thickness: 'thin' })}
                            className={getSegmentItemClass(edge.thickness === 'thin')}
                        >
                            Thin
                        </button>
                        <button 
                            onClick={() => onEdgeChange({ thickness: 'thick' })}
                            className={getSegmentItemClass(edge.thickness === 'thick')}
                        >
                            Thick
                        </button>
                    </div>
                </div>

                {/* Edge Style */}
                <div>
                    <label className="block text-xs font-medium mb-2 opacity-60">Style</label>
                    <div className={segmentContainerClass}>
                        <button 
                            onClick={() => onEdgeChange({ lineStyle: 'solid' })}
                            className={getSegmentItemClass(edge.lineStyle !== 'dashed')}
                        >
                            Solid
                        </button>
                        <button 
                            onClick={() => onEdgeChange({ lineStyle: 'dashed' })}
                            className={getSegmentItemClass(edge.lineStyle === 'dashed')}
                        >
                            Dashed
                        </button>
                    </div>
                </div>
             </div>
        )}

      </div>
    </div>
  );
};