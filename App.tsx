import React, { useState, useRef, useCallback, useEffect, useReducer } from 'react';
import { toPng, toBlob } from 'html-to-image';
import { IsoNode } from './components/IsoNode';
import { Toolbar } from './components/Toolbar';
import { PropertiesPanel } from './components/PropertiesPanel';
import { NodeData, EdgeData, NodeType, EdgeStyle, INITIAL_NODES, INITIAL_EDGES, NODE_COLORS, FlowchartState } from './types';

const GRID_SIZE = 24;

// --- History Reducer ---
type Action = 
  | { type: 'SET_STATE'; payload: FlowchartState }
  | { type: 'UNDO' }
  | { type: 'REDO' }
  | { type: 'ADD_NODE'; payload: NodeData }
  | { type: 'UPDATE_NODES'; payload: NodeData[] }
  | { type: 'UPDATE_NODE'; payload: { id: string, updates: Partial<NodeData> } }
  | { type: 'DELETE_NODE'; payload: string }
  | { type: 'ADD_EDGE'; payload: EdgeData }
  | { type: 'UPDATE_EDGES'; payload: EdgeData[] }
  | { type: 'LOAD'; payload: FlowchartState };

interface HistoryState {
    past: FlowchartState[];
    present: FlowchartState;
    future: FlowchartState[];
}

const historyReducer = (state: HistoryState, action: Action): HistoryState => {
    switch (action.type) {
        case 'UNDO':
            if (state.past.length === 0) return state;
            const previous = state.past[state.past.length - 1];
            const newPast = state.past.slice(0, state.past.length - 1);
            return {
                past: newPast,
                present: previous,
                future: [state.present, ...state.future]
            };
        case 'REDO':
            if (state.future.length === 0) return state;
            const next = state.future[0];
            const newFuture = state.future.slice(1);
            return {
                past: [...state.past, state.present],
                present: next,
                future: newFuture
            };
        case 'SET_STATE': // General update wrapper
            if (JSON.stringify(state.present) === JSON.stringify(action.payload)) return state;
            return {
                past: [...state.past, state.present],
                present: action.payload,
                future: []
            };
        case 'LOAD':
            return {
                past: [],
                present: action.payload,
                future: []
            };
        default:
            return state;
    }
};

export default function App() {
  // History State Wrapper
  const [history, dispatch] = useReducer(historyReducer, {
      past: [],
      present: { nodes: INITIAL_NODES, edges: INITIAL_EDGES },
      future: []
  });

  const { nodes, edges } = history.present;

  // Helpers to dispatch updates cleanly
  const setNodes = (newNodes: NodeData[]) => {
      dispatch({ type: 'SET_STATE', payload: { nodes: newNodes, edges } });
  };
  const setEdges = (newEdges: EdgeData[]) => {
      dispatch({ type: 'SET_STATE', payload: { nodes, edges: newEdges } });
  };

  // Viewport & Settings
  const [zoom, setZoom] = useState(1);
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Selection & Tools
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  
  // Connecting
  const [isConnectMode, setIsConnectMode] = useState(false);
  const [connectStartId, setConnectStartId] = useState<string | null>(null);
  
  // Global Tool Defaults
  const [defaultEdgeStyle, setDefaultEdgeStyle] = useState<EdgeStyle>(EdgeStyle.CURVED);
  const [defaultShowArrow, setDefaultShowArrow] = useState(true);

  const [isShiftPressed, setIsShiftPressed] = useState(false);

  const canvasRef = useRef<HTMLDivElement>(null);
  const exportRef = useRef<HTMLDivElement>(null);

  // Load from LocalStorage
  useEffect(() => {
      const saved = localStorage.getItem('isoFlowState');
      if (saved) {
          try {
              const parsed = JSON.parse(saved);
              if (parsed.nodes && parsed.edges) {
                  dispatch({ type: 'LOAD', payload: parsed });
              }
          } catch (e) {
              console.error("Failed to load state", e);
          }
      }
      
      const savedTheme = localStorage.getItem('isoFlowTheme');
      if (savedTheme === 'dark') setIsDarkMode(true);
  }, []);

  // Save to LocalStorage
  useEffect(() => {
      localStorage.setItem('isoFlowState', JSON.stringify({ nodes, edges }));
  }, [nodes, edges]);

  useEffect(() => {
      localStorage.setItem('isoFlowTheme', isDarkMode ? 'dark' : 'light');
  }, [isDarkMode]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Shift') setIsShiftPressed(true);
        if ((e.key === 'Delete' || e.key === 'Backspace') && selectedNodeId) handleDelete();
        if (e.key === 'Escape') {
            setIsConnectMode(false);
            setConnectStartId(null);
            setSelectedNodeId(null);
        }
        // Undo/Redo Shortcuts
        if ((e.metaKey || e.ctrlKey) && e.key === 'z') {
            if (e.shiftKey) dispatch({ type: 'REDO' });
            else dispatch({ type: 'UNDO' });
            e.preventDefault();
        }
    };
    const handleKeyUp = (e: KeyboardEvent) => {
        if (e.key === 'Shift') setIsShiftPressed(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
        window.removeEventListener('keydown', handleKeyDown);
        window.removeEventListener('keyup', handleKeyUp);
    };
  }, [selectedNodeId, nodes, edges]);

  // --- Node Interactions ---

  const handleMouseDown = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();

    // Connection Logic
    if (isConnectMode) {
        if (connectStartId === null) {
            setConnectStartId(id);
        } else if (connectStartId !== id) {
            // Create Edge
            const newEdge: EdgeData = {
                id: `e-${connectStartId}-${id}-${Date.now()}`,
                from: connectStartId,
                to: id,
                style: defaultEdgeStyle,
                hasArrow: defaultShowArrow
            };
            setEdges([...edges, newEdge]);
            setConnectStartId(null);
        }
        return;
    }

    // Selection & Dragging
    setSelectedNodeId(id);
    const node = nodes.find((n) => n.id === id);
    if (node) {
      setIsDragging(true);
      setDragOffset({
        x: e.clientX,
        y: e.clientY,
      });
    }
  };

  const handleCanvasMouseMove = (e: React.MouseEvent) => {
    if (isDragging && selectedNodeId && !isConnectMode) {
      const node = nodes.find(n => n.id === selectedNodeId);
      if (!node) return;

      const deltaX = (e.clientX - dragOffset.x) / zoom;
      const deltaY = (e.clientY - dragOffset.y) / zoom;

      const rawNewX = node.x + deltaX;
      const rawNewY = node.y + deltaY;

      // Snap to Grid
      const newX = Math.round(rawNewX / GRID_SIZE) * GRID_SIZE;
      const newY = Math.round(rawNewY / GRID_SIZE) * GRID_SIZE;

      if (newX !== node.x || newY !== node.y) {
            // We use setNodes but we need to reference the latest nodes state properly.
            // Since `nodes` in closure might be stale if we didn't use updated deps, 
            // but we are in a functional component.
            const updatedNodes = nodes.map(n => n.id === selectedNodeId ? { ...n, x: newX, y: newY } : n);
            setNodes(updatedNodes);
            setDragOffset({ x: e.clientX, y: e.clientY });
      }
    }
  };

  const handleCanvasMouseUp = () => {
    setIsDragging(false);
  };

  const handleCanvasClick = () => {
    if (!isDragging) {
        setSelectedNodeId(null);
    }
  };

  // --- Actions ---

  const addNode = (type: NodeType) => {
    const id = Date.now().toString();
    // Start near center of view
    const centerX = 500;
    const centerY = 300;

    let defaultColor = NODE_COLORS.PROCESS_BLUE;
    let width = 140;
    let height = 80;

    switch (type) {
        case NodeType.START_END:
            defaultColor = NODE_COLORS.START_GREEN;
            break;
        case NodeType.DECISION:
            defaultColor = NODE_COLORS.DECISION_ORANGE;
            width = 100;
            height = 100;
            break;
        case NodeType.DATA:
            defaultColor = NODE_COLORS.DATA_TEAL;
            break;
        case NodeType.PREPARATION:
            defaultColor = NODE_COLORS.PREP_YELLOW;
            break;
        case NodeType.SQUARE:
            defaultColor = NODE_COLORS.PURPLE_ACCENT;
            width = 100;
            height = 100;
            break;
        case NodeType.CIRCLE:
            defaultColor = NODE_COLORS.TERMINAL_RED;
            width = 100;
            height = 100;
            break;
        default:
            defaultColor = NODE_COLORS.PROCESS_BLUE;
    }

    const newNode: NodeData = {
      id,
      type,
      text: type === NodeType.DECISION ? 'Decision?' : 'New Node',
      x: Math.round((centerX + Math.random() * 50) / GRID_SIZE) * GRID_SIZE,
      y: Math.round((centerY + Math.random() * 50) / GRID_SIZE) * GRID_SIZE,
      color: defaultColor,
      width,
      height
    };
    setNodes([...nodes, newNode]);
    setSelectedNodeId(id);
    setIsConnectMode(false); 
  };

  const handleDelete = () => {
      if (!selectedNodeId) return;
      // Wrap in single update for history
      const newNodes = nodes.filter(n => n.id !== selectedNodeId);
      const newEdges = edges.filter(e => e.from !== selectedNodeId && e.to !== selectedNodeId);
      dispatch({ type: 'SET_STATE', payload: { nodes: newNodes, edges: newEdges } });
      setSelectedNodeId(null);
  };

  const toggleConnectMode = () => {
      setIsConnectMode(!isConnectMode);
      setConnectStartId(null);
      setSelectedNodeId(null);
  };

  const cycleEdgeStyle = () => {
      const styles = [EdgeStyle.CURVED, EdgeStyle.STEP, EdgeStyle.STRAIGHT];
      const nextIndex = (styles.indexOf(defaultEdgeStyle) + 1) % styles.length;
      setDefaultEdgeStyle(styles[nextIndex]);
      setEdges(edges.map(e => ({ ...e, style: styles[nextIndex] })));
  };

  const toggleArrows = () => {
      const newVal = !defaultShowArrow;
      setDefaultShowArrow(newVal);
      setEdges(edges.map(e => ({ ...e, hasArrow: newVal })));
  };

  const handleZoomIn = () => setZoom(z => Math.min(z + 0.1, 2.0));
  const handleZoomOut = () => setZoom(z => Math.max(z - 0.1, 0.5));

  const updateSelectedNode = (updates: Partial<NodeData>) => {
      if (!selectedNodeId) return;
      const updatedNodes = nodes.map(n => n.id === selectedNodeId ? { ...n, ...updates } : n);
      setNodes(updatedNodes);
  };

  // --- Export Logic ---

  const getFlowchartBounds = () => {
      if (nodes.length === 0) return { x: 0, y: 0, w: 800, h: 600 };
      
      let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
      
      nodes.forEach(n => {
          minX = Math.min(minX, n.x);
          minY = Math.min(minY, n.y);
          maxX = Math.max(maxX, n.x + (n.width || 140));
          maxY = Math.max(maxY, n.y + (n.height || 80));
      });
      
      const padding = 50;
      return {
          x: minX - padding,
          y: minY - padding,
          w: maxX - minX + padding * 2,
          h: maxY - minY + padding * 2
      };
  };

  const handleExport = async (method: 'clipboard' | 'download') => {
      if (!exportRef.current) return;
      const currentSelection = selectedNodeId;
      setSelectedNodeId(null);
      setConnectStartId(null);

      setTimeout(async () => {
        if (!exportRef.current) return;
        
        const bounds = getFlowchartBounds();
        
        const options = {
            backgroundColor: null as any,
            pixelRatio: 3,
            width: bounds.w,
            height: bounds.h,
            style: {
                transform: `scale(1) translate(${-bounds.x}px, ${-bounds.y}px)`,
                transformOrigin: 'top left',
                backgroundImage: 'none'
            },
            skipFonts: true // Prevents CORS errors with Google Fonts / Tailwind
        };

        try {
            if (method === 'clipboard') {
                const blob = await toBlob(exportRef.current, options);
                if (blob) {
                    await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
                    alert("Transparent flowchart copied to clipboard!");
                }
            } else {
                const dataUrl = await toPng(exportRef.current, options);
                const link = document.createElement('a');
                link.download = `flowchart-${isDarkMode ? 'dark' : 'light'}.png`;
                link.href = dataUrl;
                link.click();
            }
        } catch (err) {
            console.error('Export failed', err);
        } finally {
            setSelectedNodeId(currentSelection);
        }
      }, 100);
  };

  // --- Rendering Edges ---

  const renderEdges = () => {
      return edges.map(edge => {
          const from = nodes.find(n => n.id === edge.from);
          const to = nodes.find(n => n.id === edge.to);
          if (!from || !to) return null;

          // Dynamic Anchoring
          // Determine relative position to choose the best side (Top, Bottom, Left, Right)
          
          const getAnchorPoint = (n: NodeData, other: NodeData) => {
             const cx = n.x + (n.width || 140) / 2;
             const cy = n.y + (n.height || 80) / 2;
             const ocx = other.x + (other.width || 140) / 2;
             const ocy = other.y + (other.height || 80) / 2;
             const dx = ocx - cx;
             const dy = ocy - cy;
             const angle = Math.atan2(dy, dx) * 180 / Math.PI; // -180 to 180

             const w = n.width || 140;
             const h = n.height || 80;

             // Right (-45 to 45)
             if (angle >= -45 && angle < 45) return { x: n.x + w, y: cy, dir: 'right' };
             // Bottom (45 to 135)
             if (angle >= 45 && angle < 135) return { x: cx, y: n.y + h, dir: 'bottom' };
             // Top (-135 to -45)
             if (angle >= -135 && angle < -45) return { x: cx, y: n.y, dir: 'top' };
             // Left
             return { x: n.x, y: cy, dir: 'left' };
          };

          const start = getAnchorPoint(from, to);
          const end = getAnchorPoint(to, from);
          
          const x1 = start.x;
          const y1 = start.y;
          const x2 = end.x;
          const y2 = end.y;

          let path = '';

          if (edge.style === EdgeStyle.STRAIGHT) {
              path = `M ${x1} ${y1} L ${x2} ${y2}`;
          } else if (edge.style === EdgeStyle.STEP) {
               // Smart step routing
               const midX = (x1 + x2) / 2;
               const midY = (y1 + y2) / 2;

               if (Math.abs(x2 - x1) > Math.abs(y2 - y1)) {
                   // Horizontal dominance
                   path = `M ${x1} ${y1} L ${midX} ${y1} L ${midX} ${y2} L ${x2} ${y2}`;
               } else {
                   // Vertical dominance
                   path = `M ${x1} ${y1} L ${x1} ${midY} L ${x2} ${midY} L ${x2} ${y2}`;
               }
          } else {
              // CURVED
              // Control points based on direction
              const dist = Math.hypot(x2 - x1, y2 - y1) * 0.5;
              let cp1x = x1, cp1y = y1, cp2x = x2, cp2y = y2;
              
              if (start.dir === 'right') cp1x += dist;
              if (start.dir === 'left') cp1x -= dist;
              if (start.dir === 'bottom') cp1y += dist;
              if (start.dir === 'top') cp1y -= dist;

              if (end.dir === 'right') cp2x += dist;
              if (end.dir === 'left') cp2x -= dist;
              if (end.dir === 'bottom') cp2y += dist;
              if (end.dir === 'top') cp2y -= dist;
              
              path = `M ${x1} ${y1} C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${x2} ${y2}`;
          }

          const strokeColor = isDarkMode ? '#94a3b8' : '#8E8E93';

          return (
              <g key={edge.id}>
                  {/* Removed the outline stroke to prevent white halo on PNG export */}
                  <path 
                    d={path} 
                    stroke={strokeColor} 
                    strokeWidth="5" 
                    fill="none" 
                    markerEnd={edge.hasArrow ? `url(#arrowhead-${isDarkMode ? 'dark' : 'light'})` : undefined} 
                  />
              </g>
          );
      });
  };

  return (
    <div className={`w-screen h-screen overflow-hidden relative flex flex-col transition-colors duration-300 ${isDarkMode ? 'bg-slate-900' : 'bg-gray-50'}`}>
      
      {/* Header */}
      <div className="absolute top-0 left-0 w-full p-6 flex justify-between items-center pointer-events-none z-50">
          <div className={`backdrop-blur-xl px-6 py-3 rounded-2xl shadow-lg border pointer-events-auto flex items-center gap-4 ${isDarkMode ? 'bg-slate-800/80 border-slate-700' : 'bg-white/80 border-white/50'}`}>
             <h1 className={`font-bold text-xl tracking-tight ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>IsoFlow <span className="text-blue-500 font-extrabold">3D</span></h1>
             <div className={`h-6 w-[1px] mx-2 ${isDarkMode ? 'bg-slate-600' : 'bg-gray-300'}`}></div>
             <div className={`text-xs font-mono ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                Zoom: {Math.round(zoom * 100)}%
             </div>
          </div>
          <div className={`backdrop-blur-xl px-4 py-2 rounded-xl shadow-sm border text-xs font-medium pointer-events-auto ${isDarkMode ? 'bg-slate-800/80 border-slate-700 text-slate-300' : 'bg-white/80 border-white/50 text-slate-500'}`}>
             {isConnectMode ? 'Select a node to connect...' : 'Editor Mode'}
          </div>
      </div>

      <div 
        ref={canvasRef}
        className={`flex-1 w-full h-full relative overflow-auto ${isConnectMode ? 'cursor-crosshair' : 'cursor-move'}`}
        onMouseMove={handleCanvasMouseMove}
        onMouseUp={handleCanvasMouseUp}
        onClick={handleCanvasClick}
      >
        <div 
            ref={exportRef} 
            className="w-[3000px] h-[3000px] relative transform-gpu origin-top-left transition-transform duration-100 ease-out"
            style={{ 
                transform: `scale(${zoom})`,
                backgroundImage: isDarkMode 
                    ? `radial-gradient(#334155 1px, transparent 1px)` 
                    : `radial-gradient(#e5e7eb 1px, transparent 1px)`,
                backgroundSize: '24px 24px'
            }}
        >
            
            <svg className="absolute inset-0 w-full h-full pointer-events-none z-0">
                <defs>
                    <marker id="arrowhead-light" markerWidth="6" markerHeight="4" refX="5" refY="2" orient="auto">
                        <polygon points="0 0, 6 2, 0 4" fill="#8E8E93" />
                    </marker>
                    <marker id="arrowhead-dark" markerWidth="6" markerHeight="4" refX="5" refY="2" orient="auto">
                        <polygon points="0 0, 6 2, 0 4" fill="#94a3b8" />
                    </marker>
                </defs>
                {renderEdges()}
            </svg>

            {nodes.map(node => (
                <IsoNode 
                    key={node.id} 
                    data={node} 
                    selected={selectedNodeId === node.id}
                    isConnectMode={isConnectMode}
                    isConnectStart={connectStartId === node.id}
                    onMouseDown={(e) => handleMouseDown(e, node.id)}
                    onClick={(e) => e.stopPropagation()}
                />
            ))}
        </div>
      </div>

      {selectedNodeId && nodes.find(n => n.id === selectedNodeId) && !isConnectMode && (
          <PropertiesPanel 
            node={nodes.find(n => n.id === selectedNodeId)!}
            onChange={updateSelectedNode}
            onClose={() => setSelectedNodeId(null)}
            isDarkMode={isDarkMode}
          />
      )}

      <Toolbar 
        onAddNode={addNode} 
        onExport={() => handleExport('download')}
        onClipboard={() => handleExport('clipboard')}
        onToggleConnect={toggleConnectMode}
        onChangeEdgeStyle={cycleEdgeStyle}
        onToggleArrow={toggleArrows}
        onDelete={handleDelete}
        onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
        onUndo={() => dispatch({ type: 'UNDO' })}
        onRedo={() => dispatch({ type: 'REDO' })}
        onToggleDarkMode={() => setIsDarkMode(!isDarkMode)}
        hasSelection={!!selectedNodeId}
        isConnectMode={isConnectMode}
        edgeStyle={defaultEdgeStyle}
        showArrows={defaultShowArrow}
        canUndo={history.past.length > 0}
        canRedo={history.future.length > 0}
        isDarkMode={isDarkMode}
      />

    </div>
  );
}