import React, { useState, useRef, useCallback, useEffect, useReducer } from 'react';
import { toPng, toBlob } from 'html-to-image';
import { IsoNode } from './components/IsoNode';
import { Toolbar } from './components/Toolbar';
import { Topbar } from './components/Topbar';
import { PropertiesPanel } from './components/PropertiesPanel';
import { NodeData, EdgeData, NodeType, EdgeStyle, INITIAL_NODES, INITIAL_EDGES, NODE_COLORS, FlowchartState } from './types';
import { Link, Copy, Trash2, X } from 'lucide-react';

const GRID_SIZE = 24;
const DOUBLE_GRID = GRID_SIZE * 2; // 48

// --- Helper: Dynamic Node Sizing ---
const calculateNodeDimensions = (text: string, type: NodeType) => {
    // Specific defaults for types as requested
    if (type === NodeType.DECISION) return { width: 144, height: 144 };
    
    // Circle/Square removed, fallback or keep just in case for older files
    if (type === NodeType.CIRCLE) return { width: 122, height: 122 };

    const lines = text.split('\n');
    const longestLineLen = Math.max(...lines.map(l => l.length));
    const lineCount = lines.length;
    
    // Approximate character dimensions
    const charWidth = 9; 
    const lineHeight = 20;
    
    const estimatedTextWidth = longestLineLen * charWidth;
    const estimatedTextHeight = lineCount * lineHeight;
    
    let paddingX = 48;
    let paddingY = 40;
    
    if (type === NodeType.START_END) {
        paddingX = 72; // More padding for pill shape ends
    }

    let width = Math.max(144, estimatedTextWidth + paddingX);
    let height = Math.max(80, estimatedTextHeight + paddingY);

    // Snap to grid
    width = Math.ceil(width / DOUBLE_GRID) * DOUBLE_GRID;
    height = Math.ceil(height / DOUBLE_GRID) * DOUBLE_GRID;

    return { width, height };
};

// --- History Reducer ---
type Action = 
  | { type: 'SET_STATE'; payload: FlowchartState }
  | { type: 'UNDO' }
  | { type: 'REDO' }
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
        case 'SET_STATE': 
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
  const [history, dispatch] = useReducer(historyReducer, {
      past: [],
      present: { nodes: INITIAL_NODES, edges: INITIAL_EDGES },
      future: []
  });

  const { nodes, edges } = history.present;

  const setNodes = (newNodes: NodeData[]) => {
      dispatch({ type: 'SET_STATE', payload: { nodes: newNodes, edges } });
  };
  const setEdges = (newEdges: EdgeData[]) => {
      dispatch({ type: 'SET_STATE', payload: { nodes, edges: newEdges } });
  };

  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDarkMode, setIsDarkMode] = useState(false);
  
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [selectedEdgeId, setSelectedEdgeId] = useState<string | null>(null);
  
  const [isDragging, setIsDragging] = useState(false);
  const [isPanning, setIsPanning] = useState(false);
  const [resizeState, setResizeState] = useState<{nodeId: string, startX: number, startY: number, startW: number, startH: number} | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [lastMousePos, setLastMousePos] = useState({ x: 0, y: 0 });
  
  const [isConnectMode, setIsConnectMode] = useState(false);
  const [connectStartId, setConnectStartId] = useState<string | null>(null);
  const [defaultEdgeStyle, setDefaultEdgeStyle] = useState<EdgeStyle>(EdgeStyle.CURVED);
  const [defaultShowArrow, setDefaultShowArrow] = useState(true);
  
  // Context Menu State
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; nodeId: string } | null>(null);

  const canvasRef = useRef<HTMLDivElement>(null);
  const exportRef = useRef<HTMLDivElement>(null);

  // Initialize Pan to Center
  useEffect(() => {
    setPan({ x: window.innerWidth / 2, y: window.innerHeight / 2 });
  }, []);

  useEffect(() => {
      const saved = localStorage.getItem('isoFlowState');
      if (saved) {
          try {
              const parsed = JSON.parse(saved);
              if (parsed.nodes && parsed.edges) {
                  dispatch({ type: 'LOAD', payload: parsed });
              }
          } catch (e) { console.error("Failed to load state", e); }
      }
      const savedTheme = localStorage.getItem('isoFlowTheme');
      if (savedTheme === 'dark') setIsDarkMode(true);
  }, []);

  useEffect(() => {
      localStorage.setItem('isoFlowState', JSON.stringify({ nodes, edges }));
  }, [nodes, edges]);

  useEffect(() => {
      localStorage.setItem('isoFlowTheme', isDarkMode ? 'dark' : 'light');
  }, [isDarkMode]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
        // Prevent deletion if user is typing in a text field
        const target = e.target as HTMLElement;
        if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') return;

        if ((e.key === 'Delete' || e.key === 'Backspace')) {
             handleDelete(); // Call the unified delete function
        }
        if (e.key === 'Escape') {
            setIsConnectMode(false);
            setConnectStartId(null);
            setSelectedNodeId(null);
            setSelectedEdgeId(null);
            setContextMenu(null);
        }
        if ((e.metaKey || e.ctrlKey) && e.key === 'z') {
            if (e.shiftKey) dispatch({ type: 'REDO' });
            else dispatch({ type: 'UNDO' });
            e.preventDefault();
        }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedNodeId, selectedEdgeId, nodes, edges]);

  const handleWheel = useCallback((e: React.WheelEvent) => {
    // Zoom on wheel
    const zoomFactor = 0.001;
    const newZoom = Math.min(Math.max(zoom - e.deltaY * zoomFactor, 0.2), 3);
    setZoom(newZoom);
  }, [zoom]);

  // Context Menu Handlers
  const handleContextMenu = (e: React.MouseEvent, nodeId: string) => {
      e.preventDefault();
      e.stopPropagation();
      setContextMenu({ x: e.clientX, y: e.clientY, nodeId });
  };

  const handleDuplicateNode = () => {
      if (!contextMenu) return;
      const original = nodes.find(n => n.id === contextMenu.nodeId);
      if (original) {
          const newNode = {
              ...original,
              id: Date.now().toString(),
              x: original.x + 48,
              y: original.y + 48,
          };
          setNodes([...nodes, newNode]);
      }
      setContextMenu(null);
  };

  const handleLinkNode = () => {
      if (!contextMenu) return;
      setConnectStartId(contextMenu.nodeId);
      setIsConnectMode(true);
      setContextMenu(null);
  };
  
  const handleLinkStart = (nodeId: string) => {
      setConnectStartId(nodeId);
      setIsConnectMode(true);
      setContextMenu(null);
  };

  const handleDeleteNodeFromMenu = () => {
      if (!contextMenu) return;
      const id = contextMenu.nodeId;
      const newNodes = nodes.filter(n => n.id !== id);
      const newEdges = edges.filter(e => e.from !== id && e.to !== id);
      dispatch({ type: 'SET_STATE', payload: { nodes: newNodes, edges: newEdges } });
      setContextMenu(null);
      if (selectedNodeId === id) setSelectedNodeId(null);
  };

  const handleCanvasMouseDown = (e: React.MouseEvent) => {
    // Allow panning even in Connect Mode (User Requirement)
    
    // Start Panning
    setIsPanning(true);
    setLastMousePos({ x: e.clientX, y: e.clientY });

    // Deselect if clicking empty space
    setSelectedNodeId(null);
    setSelectedEdgeId(null);
    setContextMenu(null);
  };

  const handleNodeMouseDown = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (isConnectMode) {
        if (connectStartId === null) {
            setConnectStartId(id);
        } else if (connectStartId !== id) {
            const newEdge: EdgeData = {
                id: `e-${connectStartId}-${id}-${Date.now()}`,
                from: connectStartId,
                to: id,
                style: defaultEdgeStyle,
                hasArrow: defaultShowArrow,
                color: 'grey',     // DEFAULT: Grey
                thickness: 'thin', // DEFAULT: Thin
                lineStyle: 'solid' // DEFAULT: Solid
            };
            setEdges([...edges, newEdge]);
            setConnectStartId(null);
        }
        return;
    }
    // Close context menu if dragging
    setContextMenu(null);
    setSelectedNodeId(id);
    setSelectedEdgeId(null);
    const node = nodes.find((n) => n.id === id);
    if (node) {
      setIsDragging(true);
      setDragOffset({ x: e.clientX, y: e.clientY });
    }
  };

  const handleResizeMouseDown = (e: React.MouseEvent, id: string) => {
      e.stopPropagation();
      const node = nodes.find(n => n.id === id);
      if (!node) return;
      setResizeState({
          nodeId: id,
          startX: e.clientX,
          startY: e.clientY,
          startW: node.width || 140,
          startH: node.height || 80
      });
  };

  const handleEdgeClick = (e: React.MouseEvent, id: string) => {
      e.stopPropagation();
      setSelectedEdgeId(id);
      setSelectedNodeId(null);
      setContextMenu(null);
  };

  const handleCanvasMouseMove = (e: React.MouseEvent) => {
    if (resizeState) {
        const dx = (e.clientX - resizeState.startX) / zoom;
        const dy = (e.clientY - resizeState.startY) / zoom;
        const newW = Math.max(80, Math.round((resizeState.startW + dx) / GRID_SIZE) * GRID_SIZE);
        const newH = Math.max(60, Math.round((resizeState.startH + dy) / GRID_SIZE) * GRID_SIZE);
        
        const updatedNodes = nodes.map(n => n.id === resizeState.nodeId ? { ...n, width: newW, height: newH } : n);
        setNodes(updatedNodes);
        return;
    }

    if (isDragging && selectedNodeId && !isConnectMode) {
      const node = nodes.find(n => n.id === selectedNodeId);
      if (!node) return;

      const deltaX = (e.clientX - dragOffset.x) / zoom;
      const deltaY = (e.clientY - dragOffset.y) / zoom;
      const rawNewX = node.x + deltaX;
      const rawNewY = node.y + deltaY;
      const newX = Math.round(rawNewX / GRID_SIZE) * GRID_SIZE;
      const newY = Math.round(rawNewY / GRID_SIZE) * GRID_SIZE;

      if (newX !== node.x || newY !== node.y) {
            const updatedNodes = nodes.map(n => n.id === selectedNodeId ? { ...n, x: newX, y: newY } : n);
            setNodes(updatedNodes);
            setDragOffset({ x: e.clientX, y: e.clientY });
      }
    } else if (isPanning) {
        const dx = e.clientX - lastMousePos.x;
        const dy = e.clientY - lastMousePos.y;
        setPan(prev => ({ x: prev.x + dx, y: prev.y + dy }));
        setLastMousePos({ x: e.clientX, y: e.clientY });
    }
  };

  const handleCanvasMouseUp = () => {
      setIsDragging(false);
      setIsPanning(false);
      setResizeState(null);
  };

  const handleCanvasClick = () => {
      // Background click logic if needed
  };

  const addNode = (type: NodeType) => {
    const id = Date.now().toString();
    const centerX = (-pan.x + window.innerWidth / 2) / zoom;
    const centerY = (-pan.y + window.innerHeight / 2) / zoom;
    
    let defaultColor = NODE_COLORS.PROCESS_BLUE;
    
    switch (type) {
        case NodeType.START_END: defaultColor = NODE_COLORS.START_GREEN; break;
        case NodeType.DECISION: defaultColor = NODE_COLORS.DECISION_ORANGE; break;
        case NodeType.DATA: defaultColor = NODE_COLORS.DATA_TEAL; break;
        case NodeType.PREPARATION: defaultColor = NODE_COLORS.PREP_YELLOW; break;
        case NodeType.SQUARE: defaultColor = NODE_COLORS.PURPLE_ACCENT; break;
        case NodeType.CIRCLE: defaultColor = NODE_COLORS.TERMINAL_RED; break;
        default: defaultColor = NODE_COLORS.PROCESS_BLUE;
    }

    const defaultText = type === NodeType.DECISION ? 'Decision?' : 'New Node';
    const { width, height } = calculateNodeDimensions(defaultText, type);

    const newNode: NodeData = {
      id, type, text: defaultText,
      x: Math.round(centerX / GRID_SIZE) * GRID_SIZE - (width / 2),
      y: Math.round(centerY / GRID_SIZE) * GRID_SIZE - (height / 2),
      color: defaultColor,
      width, height
    };
    setNodes([...nodes, newNode]);
    setSelectedNodeId(id);
    setIsConnectMode(false); 
  };

  const handleDelete = () => {
      // Delete selected node
      if (selectedNodeId) {
          const newNodes = nodes.filter(n => n.id !== selectedNodeId);
          const newEdges = edges.filter(e => e.from !== selectedNodeId && e.to !== selectedNodeId);
          dispatch({ type: 'SET_STATE', payload: { nodes: newNodes, edges: newEdges } });
          setSelectedNodeId(null);
      } 
      // Delete selected edge
      else if (selectedEdgeId) {
          setEdges(edges.filter(e => e.id !== selectedEdgeId));
          setSelectedEdgeId(null);
      }
  };

  const toggleConnectMode = () => {
      setIsConnectMode(!isConnectMode);
      setConnectStartId(null);
      setSelectedNodeId(null);
      setSelectedEdgeId(null);
      setContextMenu(null);
  };

  const updateSelectedNode = (updates: Partial<NodeData>) => {
      if (!selectedNodeId) return;
      const node = nodes.find(n => n.id === selectedNodeId);
      if (node) {
        const updatedNodes = nodes.map(n => n.id === selectedNodeId ? { ...n, ...updates } : n);
        setNodes(updatedNodes);
      }
  };

  const updateSelectedEdge = (updates: Partial<EdgeData>) => {
      if (!selectedEdgeId) return;
      const updatedEdges = edges.map(e => e.id === selectedEdgeId ? { ...e, ...updates } : e);
      setEdges(updatedEdges);
  };

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
      return { x: minX - padding, y: minY - padding, w: maxX - minX + padding * 2, h: maxY - minY + padding * 2 };
  };

  const handleDownloadImage = async () => {
      if (!exportRef.current) return;
      const currentSelection = selectedNodeId;
      setSelectedNodeId(null);
      setSelectedEdgeId(null);
      setConnectStartId(null);
      setContextMenu(null);

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
            skipFonts: true
        };

        try {
            const dataUrl = await toPng(exportRef.current, options);
            const link = document.createElement('a');
            link.download = `Nodes3D-${isDarkMode ? 'dark' : 'light'}.png`;
            link.href = dataUrl;
            link.click();
        } catch (err) { console.error('Export failed', err); } 
        finally { setSelectedNodeId(currentSelection); }
      }, 100);
  };

  const handleSaveJSON = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify({ nodes, edges }));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", "flowchart.json");
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  const renderEdges = () => {
      return edges.map(edge => {
          const from = nodes.find(n => n.id === edge.from);
          const to = nodes.find(n => n.id === edge.to);
          if (!from || !to) return null;

          const getAnchorPoint = (n: NodeData, other: NodeData) => {
             const cx = n.x + (n.width || 140) / 2;
             const cy = n.y + (n.height || 80) / 2;
             const ocx = other.x + (other.width || 140) / 2;
             const ocy = other.y + (other.height || 80) / 2;
             const dx = ocx - cx;
             const dy = ocy - cy;
             const angle = Math.atan2(dy, dx) * 180 / Math.PI;

             const w = n.width || 140;
             const h = n.height || 80;

             if (angle >= -45 && angle < 45) return { x: n.x + w, y: cy, dir: 'right' };
             if (angle >= 45 && angle < 135) return { x: cx, y: n.y + h, dir: 'bottom' };
             if (angle >= -135 && angle < -45) return { x: cx, y: n.y, dir: 'top' };
             return { x: n.x, y: cy, dir: 'left' };
          };

          const start = getAnchorPoint(from, to);
          const end = getAnchorPoint(to, from);
          
          const x1 = start.x;
          const y1 = start.y;
          const x2 = end.x;
          const y2 = end.y;

          let path = '';
          let midX = (x1 + x2) / 2;
          let midY = (y1 + y2) / 2;

          if (edge.style === EdgeStyle.STRAIGHT) {
              path = `M ${x1} ${y1} L ${x2} ${y2}`;
          } else if (edge.style === EdgeStyle.STEP) {
               if (Math.abs(x2 - x1) > Math.abs(y2 - y1)) {
                   midX = (x1 + x2) / 2;
                   midY = y1; 
                   path = `M ${x1} ${y1} L ${midX} ${y1} L ${midX} ${y2} L ${x2} ${y2}`;
                   midY = (y1 + y2) / 2; 
               } else {
                   path = `M ${x1} ${y1} L ${x1} ${midY} L ${x2} ${midY} L ${x2} ${y2}`;
               }
          } else {
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
              midX = 0.125 * x1 + 0.375 * cp1x + 0.375 * cp2x + 0.125 * x2;
              midY = 0.125 * y1 + 0.375 * cp1y + 0.375 * cp2y + 0.125 * y2;
          }

          // Edge Properties
          const baseColor = edge.color === 'red' ? '#EF4444' : edge.color === 'grey' ? '#9CA3AF' : (isDarkMode ? '#94a3b8' : '#000000');
          const strokeColor = selectedEdgeId === edge.id ? '#3B82F6' : baseColor;
          const thicknessValue = edge.thickness === 'thin' ? 2 : 5;
          const strokeWidth = selectedEdgeId === edge.id ? (thicknessValue + 2) : thicknessValue;
          const dashArray = edge.lineStyle === 'dashed' ? '8, 8' : undefined;
          const arrowId = `arrowhead-${edge.color || (isDarkMode ? 'dark' : 'light')}`;

          // Mask ID for text gap
          const maskId = `mask-${edge.id}`;
          
          // Calculate Label Dimensions for Masking
          const labelWidth = edge.label ? edge.label.length * 8 + 12 : 0;
          const labelHeight = 20;

          return (
              <g 
                key={edge.id} 
                onClick={(e) => handleEdgeClick(e, edge.id)} 
                className="cursor-pointer pointer-events-auto"
              >
                  {/* Shadow Layer (3D Effect) */}
                  {edge.hasShadow && (
                    <path 
                      d={path} 
                      stroke="black" 
                      strokeWidth={strokeWidth} 
                      strokeOpacity="0.15"
                      fill="none" 
                      transform="translate(4, 8)"
                      style={{ filter: 'blur(3px)' }}
                    />
                  )}

                  {/* Define Mask for Invisible Cut */}
                  {edge.label && (
                      <defs>
                          <mask 
                            id={maskId} 
                            maskUnits="userSpaceOnUse"
                            x="-50000" 
                            y="-50000" 
                            width="100000" 
                            height="100000"
                          >
                              {/* Reveal Everything (White) */}
                              <rect x="-50000" y="-50000" width="100000" height="100000" fill="white" />
                              {/* Hide Line behind Text (Black) */}
                              <rect 
                                  x={midX - labelWidth/2} 
                                  y={midY - 10} 
                                  width={labelWidth} 
                                  height={labelHeight} 
                                  fill="black" 
                              />
                          </mask>
                      </defs>
                  )}

                  {/* Marker Defs (Dynamic based on color) */}
                  <defs>
                      <marker id={arrowId} markerWidth="6" markerHeight="4" refX="5" refY="2" orient="auto">
                          <polygon points="0 0, 6 2, 0 4" fill={strokeColor} />
                      </marker>
                  </defs>

                  {/* Hit area (Transparent, Thick) */}
                  <path d={path} stroke="transparent" strokeWidth="20" fill="none" />

                  {/* Visible Line with Mask */}
                  <path 
                    d={path} 
                    stroke={strokeColor} 
                    strokeWidth={strokeWidth} 
                    strokeDasharray={dashArray}
                    fill="none" 
                    markerEnd={edge.hasArrow ? `url(#${arrowId})` : undefined}
                    mask={edge.label ? `url(#${maskId})` : undefined}
                  />

                  {/* Label Text (No Background Rect, sits in the masked gap) */}
                  {edge.label && (
                      <g transform={`translate(${midX}, ${midY})`}>
                          <text
                            dy="0.3em"
                            textAnchor="middle"
                            className="text-[11px] font-bold font-sans pointer-events-none select-none"
                            style={{ 
                                fill: isDarkMode ? 'white' : 'black',
                            }}
                          >
                              {edge.label}
                          </text>
                      </g>
                  )}
              </g>
          );
      });
  };

  return (
    <div className={`w-screen h-screen overflow-hidden relative flex flex-col transition-colors duration-300 ${isDarkMode ? 'bg-slate-900' : 'bg-[#f5f5f7]'}`}>
      
      <Topbar 
        zoom={zoom}
        onZoomIn={() => setZoom(z => Math.min(z + 0.1, 2.0))}
        onZoomOut={() => setZoom(z => Math.max(z - 0.1, 0.5))}
        onUndo={() => dispatch({ type: 'UNDO' })}
        onRedo={() => dispatch({ type: 'REDO' })}
        canUndo={history.past.length > 0}
        canRedo={history.future.length > 0}
        isDarkMode={isDarkMode}
        onToggleDarkMode={() => setIsDarkMode(!isDarkMode)}
        onSave={handleSaveJSON}
        onLoad={(data) => dispatch({ type: 'LOAD', payload: data })}
        onDownloadImage={handleDownloadImage}
      />

      {/* Link Mode Indicator */}
      {isConnectMode && (
          <div className="fixed left-6 top-20 z-50 flex flex-col items-start animate-in fade-in slide-in-from-left-4 duration-300">
            <div className={`font-bold text-lg mb-2 animate-pulse drop-shadow-sm px-2 rounded ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`}>
              Link Mode
            </div>
            <button 
              onClick={() => { setIsConnectMode(false); setConnectStartId(null); }}
              className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-full font-medium shadow-lg hover:shadow-red-500/25 transition-all text-sm flex items-center gap-2"
            >
              <X className="w-4 h-4" /> Close
            </button>
          </div>
      )}

      {/* Canvas */}
      <div 
        ref={canvasRef}
        className={`flex-1 w-full h-full relative overflow-hidden mt-14 ${isConnectMode ? 'cursor-crosshair' : isPanning ? 'cursor-grabbing' : 'cursor-grab'}`}
        style={{
            backgroundImage: isDarkMode 
                ? `radial-gradient(#334155 1px, transparent 1px)` 
                : `radial-gradient(#d1d1d6 1px, transparent 1px)`,
            backgroundSize: `${24 * zoom}px ${24 * zoom}px`,
            backgroundPosition: `${pan.x}px ${pan.y}px`
        }}
        onMouseDown={handleCanvasMouseDown}
        onMouseMove={handleCanvasMouseMove}
        onMouseUp={handleCanvasMouseUp}
        onClick={handleCanvasClick}
        onWheel={handleWheel}
      >
        <div 
            ref={exportRef} 
            className="absolute top-0 left-0 w-0 h-0 overflow-visible transform-gpu origin-top-left transition-transform duration-75 ease-out"
            style={{ 
                transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`
            }}
        >
            <svg className="absolute top-0 left-0 overflow-visible pointer-events-none z-0">
                {renderEdges()}
            </svg>

            {nodes.map(node => (
                <IsoNode 
                    key={node.id} 
                    data={node} 
                    selected={selectedNodeId === node.id}
                    isConnectMode={isConnectMode}
                    isConnectStart={connectStartId === node.id}
                    onMouseDown={(e) => handleNodeMouseDown(e, node.id)}
                    onResizeMouseDown={(e) => handleResizeMouseDown(e, node.id)}
                    onClick={(e) => e.stopPropagation()}
                    onContextMenu={(e) => handleContextMenu(e, node.id)}
                    onLinkStart={() => handleLinkStart(node.id)}
                />
            ))}
        </div>
      </div>

      {/* Context Menu */}
      {contextMenu && (
          <div 
            className={`fixed z-[60] shadow-xl rounded-lg border overflow-hidden p-1 min-w-[150px] ${isDarkMode ? 'bg-slate-800 border-slate-600 text-slate-200' : 'bg-white border-gray-200 text-slate-800'}`}
            style={{ top: contextMenu.y, left: contextMenu.x }}
          >
             <button onClick={handleLinkNode} className={`flex items-center gap-2 w-full px-3 py-2 text-sm text-left rounded-md transition-colors ${isDarkMode ? 'hover:bg-slate-700' : 'hover:bg-gray-100'}`}>
                <Link className="w-4 h-4" /> Link
             </button>
             <button onClick={handleDuplicateNode} className={`flex items-center gap-2 w-full px-3 py-2 text-sm text-left rounded-md transition-colors ${isDarkMode ? 'hover:bg-slate-700' : 'hover:bg-gray-100'}`}>
                <Copy className="w-4 h-4" /> Duplicate
             </button>
             <div className={`h-[1px] my-1 ${isDarkMode ? 'bg-slate-600' : 'bg-gray-200'}`} />
             <button onClick={handleDeleteNodeFromMenu} className={`flex items-center gap-2 w-full px-3 py-2 text-sm text-left rounded-md transition-colors text-red-500 ${isDarkMode ? 'hover:bg-red-900/20' : 'hover:bg-red-50'}`}>
                <Trash2 className="w-4 h-4" /> Delete
             </button>
          </div>
      )}

      <PropertiesPanel 
        node={nodes.find(n => n.id === selectedNodeId) || null}
        edge={edges.find(e => e.id === selectedEdgeId) || null}
        onChange={updateSelectedNode}
        onEdgeChange={updateSelectedEdge}
        onClose={() => { setSelectedNodeId(null); setSelectedEdgeId(null); }}
        isDarkMode={isDarkMode}
      />

      <Toolbar 
        onAddNode={addNode} 
        onDelete={handleDelete}
        onToggleConnect={toggleConnectMode}
        onChangeEdgeStyle={() => {
            const styles = [EdgeStyle.CURVED, EdgeStyle.STEP, EdgeStyle.STRAIGHT];
            const next = styles[(styles.indexOf(defaultEdgeStyle) + 1) % styles.length];
            setDefaultEdgeStyle(next);
            setEdges(edges.map(e => ({ ...e, style: next })));
        }}
        onToggleArrow={() => {
            const next = !defaultShowArrow;
            setDefaultShowArrow(next);
            setEdges(edges.map(e => ({ ...e, hasArrow: next })));
        }}
        hasSelection={!!selectedNodeId || !!selectedEdgeId}
        isConnectMode={isConnectMode}
        edgeStyle={defaultEdgeStyle}
        showArrows={defaultShowArrow}
        isDarkMode={isDarkMode}
      />

    </div>
  );
}