import React from 'react';
import { NodeData, NodeType } from '../types';
import { Scaling, Link as LinkIcon } from 'lucide-react';

interface IsoNodeProps {
  data: NodeData;
  selected: boolean;
  isConnectMode: boolean;
  isConnectStart: boolean;
  onMouseDown: (e: React.MouseEvent) => void;
  onResizeMouseDown: (e: React.MouseEvent) => void;
  onClick: (e: React.MouseEvent) => void;
  onContextMenu: (e: React.MouseEvent) => void;
  onLinkStart: () => void;
}

// Helper to adjust color brightness
const adjustColor = (color: string, amount: number) => {
  return '#' + color.replace(/^#/, '').replace(/../g, color => ('0' + Math.min(255, Math.max(0, parseInt(color, 16) + amount)).toString(16)).substr(-2));
};

// Helper to determine text color based on background
const getContrastYIQ = (hexcolor: string) => {
  hexcolor = hexcolor.replace("#", "");
  var r = parseInt(hexcolor.substr(0, 2), 16);
  var g = parseInt(hexcolor.substr(2, 2), 16);
  var b = parseInt(hexcolor.substr(4, 2), 16);
  var yiq = ((r * 299) + (g * 587) + (b * 114)) / 1000;
  return (yiq >= 128) ? 'black' : 'white';
};

export const IsoNode: React.FC<IsoNodeProps> = ({ 
  data, 
  selected, 
  isConnectMode, 
  isConnectStart,
  onMouseDown, 
  onResizeMouseDown,
  onClick,
  onContextMenu,
  onLinkStart
}) => {
  const { type, color, text, width = 140, height = 80, textColor } = data;
  
  // Chunky 3D look
  const THICKNESS = 60; 
  
  // Colors for faces
  const topColor = color;
  const frontColor = adjustColor(color, -40);
  const sideColor = adjustColor(color, -60);
  const isWhite = color.toLowerCase() === '#ffffff' || color.toLowerCase() === '#fff';
  const borderColor = isWhite ? 'border-slate-300' : 'border-white/40';

  // Determine final text color
  const finalTextColor = textColor ? textColor : getContrastYIQ(topColor);

  // Stacked Rendering: Used for shapes with curves (Cylinders, Pills)
  const renderStacked = (borderRadius: string) => {
    const layerCount = 12; 
    const layers = [];

    // 1. Shadow Layer (Bottom)
    layers.push(
       <div 
          key="shadow"
          className="absolute inset-0 bg-black/40 blur-xl"
          style={{
             transform: `translateZ(-10px) translate(15px, 20px)`,
             borderRadius: borderRadius,
             zIndex: -1,
             opacity: 0.6
          }}
       />
    );

    // 2. Side Layers (Extrusion)
    for (let i = 0; i < layerCount; i++) {
        const z = (i / layerCount) * THICKNESS;
        layers.push(
            <div
                key={`layer-${i}`}
                className={`absolute inset-0 border ${isWhite ? 'border-black/5' : 'border-white/5'}`}
                style={{
                    backgroundColor: sideColor,
                    borderRadius: borderRadius,
                    transform: `translateZ(${z}px)`,
                }}
            />
        );
    }

    // 3. Top Face
    layers.push(
        <div
          key="top"
          className={`absolute inset-0 flex items-center justify-center border-t ${borderColor}`}
          style={{
            backgroundColor: topColor,
            backgroundImage: `linear-gradient(135deg, ${adjustColor(topColor, 30)} 0%, ${topColor} 50%, ${adjustColor(topColor, -10)} 100%)`,
            transform: `translateZ(${THICKNESS}px)`,
            borderRadius: borderRadius,
            boxShadow: `inset 0 2px 0 rgba(255,255,255,0.4), inset 0 -2px 0 rgba(0,0,0,0.1)`
          }}
        >
          {/* Glossy Reflection */}
          <div 
            className="absolute inset-0 w-full h-1/2 bg-gradient-to-b from-white/20 to-transparent pointer-events-none"
            style={{ borderRadius: `${borderRadius} ${borderRadius} 0 0` }}
          />

          {isWhite && <div className="absolute inset-0 border-2 border-slate-200 rounded-[inherit] pointer-events-none opacity-50" />}

          <div 
            className="font-bold text-center text-sm p-3 select-none leading-tight drop-shadow-md z-10 w-full whitespace-pre-wrap break-words"
            style={{ 
               color: finalTextColor,
               textShadow: finalTextColor === 'white' ? '0 1px 2px rgba(0,0,0,0.3)' : '0 1px 0 rgba(255,255,255,0.4)'
            }} 
          >
            {text}
          </div>
        </div>
    );

    return (
        <div className="w-full h-full relative" style={{ transformStyle: 'preserve-3d' }}>
            {layers}
        </div>
    );
  };

  // Cuboid Rendering: Used for shapes with straight edges
  const renderCuboid = (isRotated: boolean = false, borderRadius: string = '8px', isSkewed: boolean = false) => {
    return (
      <div className="w-full h-full relative" style={{ transformStyle: 'preserve-3d' }}>
        
        {/* SHADOW */}
        <div 
          className="absolute inset-0 bg-black/40 blur-xl"
          style={{
             transform: `translateZ(-20px) translate(15px, 20px)`,
             borderRadius: borderRadius,
             zIndex: -1,
             opacity: 0.6
          }}
         />

        {/* FRONT FACE */}
        <div
          className="absolute bottom-0 left-0 w-full"
          style={{
            backgroundColor: frontColor,
            backgroundImage: `linear-gradient(to bottom, ${adjustColor(frontColor, 20)}, ${frontColor})`,
            transformOrigin: 'bottom',
            transform: `rotateX(-90deg)`,
            borderRadius: borderRadius,
            height: `${THICKNESS}px`,
            boxShadow: 'inset 0 2px 5px rgba(0,0,0,0.2)' 
          }}
        >
             <div className="w-full h-[1px] bg-white/30 absolute top-0 left-0" />
        </div>

        {/* RIGHT FACE */}
        <div
          className="absolute top-0 right-0 h-full"
          style={{
            backgroundColor: sideColor,
            backgroundImage: `linear-gradient(to bottom, ${adjustColor(sideColor, 20)}, ${sideColor})`,
            transformOrigin: 'right',
            transform: `rotateY(90deg)`,
            borderRadius: borderRadius,
            width: `${THICKNESS}px`,
            boxShadow: 'inset 2px 2px 5px rgba(0,0,0,0.2)'
          }}
        >
             <div className="w-[1px] h-full bg-white/30 absolute top-0 left-0" />
        </div>

        {/* TOP FACE */}
        <div
          className={`absolute inset-0 flex items-center justify-center border-t ${borderColor}`}
          style={{
            backgroundColor: topColor,
            backgroundImage: `linear-gradient(135deg, ${adjustColor(topColor, 30)} 0%, ${topColor} 50%, ${adjustColor(topColor, -10)} 100%)`,
            transform: `translateZ(${THICKNESS}px)`,
            borderRadius: borderRadius,
            boxShadow: `
                inset 0 2px 0 rgba(255,255,255,0.4), 
                inset 0 -2px 0 rgba(0,0,0,0.1),
                0 4px 4px rgba(0,0,0,0.1)
            `
          }}
        >
          <div 
            className="absolute inset-0 w-full h-1/2 bg-gradient-to-b from-white/20 to-transparent pointer-events-none"
            style={{ borderRadius: `${borderRadius} ${borderRadius} 0 0` }}
          />

          {isWhite && <div className="absolute inset-0 border-2 border-slate-200 rounded-[inherit] pointer-events-none opacity-50" />}

          <div 
            className="font-bold text-center text-sm p-4 select-none leading-tight drop-shadow-md z-10 w-full h-full flex items-center justify-center whitespace-pre-wrap break-words"
            style={{ 
               color: finalTextColor,
               transform: isRotated ? 'rotate(-45deg) scale(1.2)' : isSkewed ? 'skewX(15deg)' : 'none',
               textShadow: finalTextColor === 'white' ? '0 1px 2px rgba(0,0,0,0.3)' : '0 1px 0 rgba(255,255,255,0.4)'
            }} 
          >
            {text}
          </div>
        </div>
        
      </div>
    );
  };

  const renderShape = () => {
    switch (type) {
      case NodeType.DECISION:
        return (
           <div className="relative w-full h-full" style={{ transform: 'rotate(45deg) scale(0.7)' }}>
             {renderCuboid(true, '4px')}
           </div>
        );
      
      case NodeType.START_END: return renderStacked('999px');
      case NodeType.CIRCLE: return renderStacked('50%');
      case NodeType.PREPARATION: return renderStacked('16px'); 
      case NodeType.DATA:
        return (
            <div className="relative w-full h-full" style={{ transform: 'skewX(-15deg)', width: '90%', marginLeft: '5%' }}>
                {renderCuboid(false, '4px', true)}
            </div>
        );
      case NodeType.SQUARE: return renderCuboid(false, '0px');
      default: return renderCuboid(false, '6px');
    }
  };

  return (
    <div
      onMouseDown={onMouseDown}
      onClick={onClick}
      onContextMenu={onContextMenu}
      className="group"
      style={{
        position: 'absolute',
        left: data.x,
        top: data.y,
        width: width,
        height: height,
        zIndex: selected ? 50 : Math.floor(data.y), 
        transition: 'transform 0.15s cubic-bezier(0.34, 1.56, 0.64, 1), filter 0.2s ease',
        transform: selected ? 'scale(1.05) translateY(-5px)' : 'scale(1)',
        cursor: isConnectMode ? 'crosshair' : 'grab',
        filter: isConnectMode && !selected && !isConnectStart ? 'grayscale(0.5)' : 'none'
      }}
    >
        {renderShape()}
        
        {/* Selection Highlight */}
        {selected && !isConnectMode && (
            <div 
                className="absolute -inset-4 border-2 border-blue-400/50 rounded-xl pointer-events-none"
                style={{ 
                    transform: 'translateZ(-10px)',
                    animation: 'pulse 2s infinite'
                }} 
            />
        )}

        {/* Link Handle (Top-Right) */}
        {selected && !isConnectMode && (
          <div
            className="absolute -top-3 -right-3 w-7 h-7 bg-blue-500 text-white rounded-full shadow-lg border-2 border-white flex items-center justify-center cursor-pointer z-50 hover:bg-blue-600 hover:scale-110 transition-all"
            onClick={(e) => { e.stopPropagation(); onLinkStart(); }}
            title="Start Linking"
            style={{ transform: 'translateZ(20px)' }}
          >
             <LinkIcon className="w-3.5 h-3.5" />
          </div>
        )}

        {/* Resize Handle (Bottom-Right) */}
        {selected && !isConnectMode && (
          <div
            className="absolute -bottom-2 -right-2 w-6 h-6 bg-white border border-blue-500 rounded-full shadow-md flex items-center justify-center cursor-nwse-resize z-50 hover:bg-blue-50"
            onMouseDown={onResizeMouseDown}
            style={{ transform: 'translateZ(20px)' }} 
          >
             <Scaling className="w-3 h-3 text-blue-600" />
          </div>
        )}

        {isConnectStart && (
             <div 
                className="absolute -inset-4 border-4 border-green-400 rounded-xl pointer-events-none animate-pulse"
                style={{ transform: 'translateZ(-10px)' }} 
             />
        )}
    </div>
  );
};