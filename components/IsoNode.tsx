import React from 'react';
import { NodeData, NodeType } from '../types';

interface IsoNodeProps {
  data: NodeData;
  selected: boolean;
  isConnectMode: boolean;
  isConnectStart: boolean;
  onMouseDown: (e: React.MouseEvent) => void;
  onClick: (e: React.MouseEvent) => void;
}

// Helper to adjust color brightness
const adjustColor = (color: string, amount: number) => {
  return '#' + color.replace(/^#/, '').replace(/../g, color => ('0' + Math.min(255, Math.max(0, parseInt(color, 16) + amount)).toString(16)).substr(-2));
};

export const IsoNode: React.FC<IsoNodeProps> = ({ 
  data, 
  selected, 
  isConnectMode, 
  isConnectStart,
  onMouseDown, 
  onClick 
}) => {
  const { type, color, text, width = 140, height = 80 } = data;
  
  // significantly thicker for that chunky 3D look
  const THICKNESS = 60; 
  
  // Colors for faces
  const topColor = color;
  const frontColor = adjustColor(color, -40);
  const sideColor = adjustColor(color, -60);

  // Render different shapes based on NodeType
  const renderShape = () => {
    switch (type) {
      case NodeType.DECISION:
        // Diamond - Use Cuboid for sharp edges
        return (
           <div className="relative w-full h-full" style={{ transform: 'rotate(45deg) scale(0.7)' }}>
             {renderCuboid(true, '4px')}
           </div>
        );
      
      case NodeType.START_END:
        // Pill shape - Use Stack for smooth curves
        return renderStacked('999px');

      case NodeType.CIRCLE:
        // Cylinder - Use Stack for smooth curves
        return renderStacked('50%');

      case NodeType.PREPARATION:
         // Rounded box - Use Stack
         return renderStacked('16px'); 
         
      case NodeType.DATA:
        // Parallelogram (Skewed) - Use Cuboid
        return (
            <div className="relative w-full h-full" style={{ transform: 'skewX(-15deg)', width: '90%', marginLeft: '5%' }}>
                {renderCuboid(false, '4px', true)}
            </div>
        );

      case NodeType.SQUARE:
        // Sharp Box - Use Cuboid
        return renderCuboid(false, '0px');

      default:
        // Standard Process Box - Use Cuboid for efficiency on rectangles
        return renderCuboid(false, '6px');
    }
  };

  // Stacked Rendering: Used for shapes with curves (Cylinders, Pills) to avoid corner artifacts
  // Simulates solid 3D by stacking layers
  const renderStacked = (borderRadius: string) => {
    const textColor = getContrastYIQ(topColor);
    const layerCount = 12; // Number of layers for the side (balance performance vs smoothness)
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
                className="absolute inset-0 border border-white/5" // slight border to reduce banding
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
          className="absolute inset-0 flex items-center justify-center border-t border-white/40"
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

          <div 
            className="font-bold text-center text-sm p-3 select-none leading-tight drop-shadow-md z-10"
            style={{ 
               color: textColor,
               textShadow: textColor === 'white' ? '0 1px 2px rgba(0,0,0,0.3)' : '0 1px 0 rgba(255,255,255,0.4)'
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

  // Cuboid Rendering: Used for shapes with straight edges (Box, Diamond)
  const renderCuboid = (isRotated: boolean = false, borderRadius: string = '8px', isSkewed: boolean = false) => {
    const textColor = getContrastYIQ(topColor);

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
          className="absolute inset-0 flex items-center justify-center border-t border-white/40"
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

          <div 
            className="font-bold text-center text-sm p-3 select-none leading-tight drop-shadow-md z-10"
            style={{ 
               color: textColor,
               transform: isRotated ? 'rotate(-45deg) scale(1.3)' : isSkewed ? 'skewX(15deg)' : 'none',
               textShadow: textColor === 'white' ? '0 1px 2px rgba(0,0,0,0.3)' : '0 1px 0 rgba(255,255,255,0.4)'
            }} 
          >
            {text}
          </div>
        </div>
        
      </div>
    );
  };

  const getContrastYIQ = (hexcolor: string) => {
        hexcolor = hexcolor.replace("#", "");
        var r = parseInt(hexcolor.substr(0, 2), 16);
        var g = parseInt(hexcolor.substr(2, 2), 16);
        var b = parseInt(hexcolor.substr(4, 2), 16);
        var yiq = ((r * 299) + (g * 587) + (b * 114)) / 1000;
        return (yiq >= 128) ? 'black' : 'white';
  }

  return (
    <div
      onMouseDown={onMouseDown}
      onClick={onClick}
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
        
        {selected && !isConnectMode && (
            <div 
                className="absolute -inset-4 border-2 border-blue-400/50 rounded-xl pointer-events-none"
                style={{ 
                    transform: 'translateZ(-10px)',
                    animation: 'pulse 2s infinite'
                }} 
            />
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