import React, { useState, useRef } from 'react';
import { 
  ZoomIn, 
  ZoomOut, 
  Maximize2, 
  RotateCcw, 
  Sparkles, 
  Layers, 
  Search,
  Move,
  Info
} from 'lucide-react';
import { PartsDiagramGroup, PartsPinHotspot } from '../../types';

interface PartsExplodedDiagramProps {
  diagram: PartsDiagramGroup;
  selectedRef: number | null;
  onSelectRef: (ref: number) => void;
  hoveredRef: number | null;
  onHoverRef: (ref: number | null) => void;
}

export const PartsExplodedDiagram: React.FC<PartsExplodedDiagramProps> = ({
  diagram,
  selectedRef,
  onSelectRef,
  hoveredRef,
  onHoverRef
}) => {
  const [zoom, setZoom] = useState<number>(1);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  const handleZoomIn = () => setZoom(prev => Math.min(prev + 0.25, 2.5));
  const handleZoomOut = () => setZoom(prev => Math.max(prev - 0.25, 0.75));
  const handleResetZoom = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setPan({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Render schematic SVG drawing based on diagramType
  const renderSchematicIllustration = () => {
    switch (diagram.diagramType) {
      case 'crankcase':
        return (
          <g className="text-neutral-700" stroke="currentColor" strokeWidth="1.5" fill="none">
            {/* Exploded Crankcase & Flywheel Housing Lines */}
            {/* Outer Crankcase Housing */}
            <path 
              d="M 280 140 C 350 140, 420 180, 430 250 C 440 320, 390 380, 310 390 C 230 400, 180 340, 170 270 C 160 200, 210 140, 280 140 Z" 
              fill="#27272a" 
              fillOpacity="0.4"
              stroke="#52525b" 
              strokeWidth="2.5"
            />
            {/* Inner Flywheel Chamber */}
            <circle cx="300" cy="265" r="75" stroke="#71717a" strokeWidth="2" fill="#18181b" />
            <circle cx="300" cy="265" r="40" stroke="#3b82f6" strokeWidth="1.5" strokeDasharray="4 2" />
            <circle cx="300" cy="265" r="16" fill="#71717a" stroke="#d4d4d8" />

            {/* Bolt Holes on Crankcase Perimeter (Refs 8, 10) */}
            <circle cx="210" cy="180" r="6" fill="#3f3f46" stroke="#a1a1aa" />
            <circle cx="370" cy="170" r="6" fill="#3f3f46" stroke="#a1a1aa" />
            <circle cx="410" cy="290" r="6" fill="#3f3f46" stroke="#a1a1aa" />
            <circle cx="230" cy="360" r="6" fill="#3f3f46" stroke="#a1a1aa" />
            <circle cx="340" cy="370" r="6" fill="#3f3f46" stroke="#a1a1aa" />

            {/* Exploded Flywheel Cover Ring & Gasket (Refs 7, 9, 11, 12) */}
            {/* Gasket line */}
            <path 
              d="M 200 170 C 250 160, 310 190, 320 250 C 330 300, 290 340, 240 345 C 190 350, 150 310, 140 260 C 130 210, 160 180, 200 170 Z" 
              stroke="#10b981" 
              strokeWidth="2" 
              strokeDasharray="6 3"
              fill="none"
            />

            {/* Exploded O-Ring (Ref 7) */}
            <ellipse cx="140" cy="275" rx="22" ry="45" stroke="#eab308" strokeWidth="2.5" fill="none" />

            {/* Exploded Cover / Housing Bracket (Ref 11 & 12) */}
            <path 
              d="M 120 180 L 70 240 L 80 320 L 130 350 L 145 320 L 105 295 L 95 245 L 135 200 Z" 
              fill="#27272a" 
              stroke="#94a3b8" 
              strokeWidth="2"
            />

            {/* Guide Exploded Alignment Centerlines (Trace lines) */}
            <line x1="60" y1="265" x2="440" y2="265" stroke="#3b82f6" strokeWidth="1" strokeDasharray="8 4" opacity="0.6" />
            <line x1="300" y1="90" x2="300" y2="430" stroke="#3b82f6" strokeWidth="1" strokeDasharray="8 4" opacity="0.4" />

            {/* Exploded Screws Floating on Centerline */}
            <g transform="translate(180, 220) rotate(-20)">
              <rect x="-15" y="-3" width="30" height="6" fill="#94a3b8" stroke="#f1f5f9" strokeWidth="1" />
              <rect x="15" y="-6" width="6" height="12" fill="#64748b" />
            </g>
            <g transform="translate(230, 250) rotate(-20)">
              <rect x="-15" y="-3" width="30" height="6" fill="#94a3b8" stroke="#f1f5f9" strokeWidth="1" />
              <rect x="15" y="-6" width="6" height="12" fill="#64748b" />
            </g>
          </g>
        );

      case 'engine_block':
        return (
          <g className="text-neutral-700" stroke="currentColor" strokeWidth="1.5" fill="none">
            {/* Cylinder Block Top View / Isometric */}
            <rect x="180" y="140" width="280" height="180" rx="16" fill="#27272a" stroke="#71717a" strokeWidth="2.5" />
            {/* 4 Cylinder Bores */}
            <circle cx="225" cy="230" r="28" fill="#18181b" stroke="#38bdf8" strokeWidth="2" />
            <circle cx="285" cy="230" r="28" fill="#18181b" stroke="#38bdf8" strokeWidth="2" />
            <circle cx="355" cy="230" r="28" fill="#18181b" stroke="#38bdf8" strokeWidth="2" />
            <circle cx="415" cy="230" r="28" fill="#18181b" stroke="#38bdf8" strokeWidth="2" />
            {/* Stud Bolts */}
            <circle cx="195" cy="165" r="5" fill="#eab308" />
            <circle cx="255" cy="165" r="5" fill="#eab308" />
            <circle cx="320" cy="165" r="5" fill="#eab308" />
            <circle cx="385" cy="165" r="5" fill="#eab308" />
            <circle cx="445" cy="165" r="5" fill="#eab308" />
            {/* Water Cooling Jacket Channels */}
            <path d="M 200 290 Q 320 310 440 290" stroke="#0284c7" strokeWidth="3" fill="none" />
          </g>
        );

      case 'cylinder_head':
        return (
          <g className="text-neutral-700" stroke="currentColor" strokeWidth="1.5" fill="none">
            {/* Head Gasket & Valves */}
            <rect x="160" y="160" width="300" height="80" rx="8" fill="#18181b" stroke="#10b981" strokeWidth="2" strokeDasharray="6 3" />
            {/* Valves floating above */}
            <g transform="translate(210, 110)">
              <polygon points="0,0 20,-30 20,-50 -20,-50 -20,-30" fill="#cbd5e1" stroke="#f8fafc" strokeWidth="1.5" />
              <line x1="0" y1="0" x2="0" y2="70" stroke="#f8fafc" strokeWidth="3" />
            </g>
            <g transform="translate(290, 110)">
              <polygon points="0,0 20,-30 20,-50 -20,-50 -20,-30" fill="#cbd5e1" stroke="#f8fafc" strokeWidth="1.5" />
              <line x1="0" y1="0" x2="0" y2="70" stroke="#f8fafc" strokeWidth="3" />
            </g>
            <g transform="translate(370, 110)">
              <polygon points="0,0 20,-30 20,-50 -20,-50 -20,-30" fill="#cbd5e1" stroke="#f8fafc" strokeWidth="1.5" />
              <line x1="0" y1="0" x2="0" y2="70" stroke="#f8fafc" strokeWidth="3" />
            </g>
            <rect x="180" y="270" width="260" height="90" rx="12" fill="#27272a" stroke="#71717a" strokeWidth="2" />
          </g>
        );

      case 'crankshaft_piston':
        return (
          <g className="text-neutral-700" stroke="currentColor" strokeWidth="1.5" fill="none">
            {/* Piston at Top */}
            <rect x="150" y="100" width="80" height="60" rx="4" fill="#334155" stroke="#94a3b8" strokeWidth="2" />
            <line x1="150" y1="115" x2="230" y2="115" stroke="#38bdf8" strokeWidth="1.5" />
            <line x1="150" y1="125" x2="230" y2="125" stroke="#38bdf8" strokeWidth="1.5" />
            <line x1="150" y1="135" x2="230" y2="135" stroke="#38bdf8" strokeWidth="1.5" />
            {/* Connecting Rod */}
            <path d="M 190 160 L 260 270 L 280 260 L 210 150 Z" fill="#475569" stroke="#cbd5e1" strokeWidth="1.5" />
            {/* Crankshaft Journal */}
            <circle cx="340" cy="300" r="50" fill="#1e293b" stroke="#94a3b8" strokeWidth="3" />
            <circle cx="340" cy="300" r="22" fill="#0f172a" stroke="#38bdf8" strokeWidth="2" />
          </g>
        );

      case 'clutch':
        return (
          <g className="text-neutral-700" stroke="currentColor" strokeWidth="1.5" fill="none">
            {/* Exploded Clutch Discs stack */}
            <ellipse cx="180" cy="240" rx="20" ry="70" fill="#27272a" stroke="#eab308" strokeWidth="2.5" />
            <ellipse cx="230" cy="240" rx="20" ry="70" fill="#3f3f46" stroke="#94a3b8" strokeWidth="2" />
            <ellipse cx="280" cy="240" rx="20" ry="70" fill="#27272a" stroke="#eab308" strokeWidth="2.5" />
            <ellipse cx="330" cy="240" rx="20" ry="70" fill="#3f3f46" stroke="#94a3b8" strokeWidth="2" />
            <ellipse cx="380" cy="240" rx="25" ry="75" fill="#18181b" stroke="#3b82f6" strokeWidth="3" />
            {/* Springs */}
            <circle cx="430" cy="200" r="14" fill="#64748b" stroke="#f1f5f9" strokeWidth="2" />
            <circle cx="430" cy="280" r="14" fill="#64748b" stroke="#f1f5f9" strokeWidth="2" />
          </g>
        );

      case 'front_brake':
      default:
        return (
          <g className="text-neutral-700" stroke="currentColor" strokeWidth="1.5" fill="none">
            {/* Floating Brake Disc 320mm */}
            <circle cx="280" cy="250" r="120" stroke="#94a3b8" strokeWidth="3" fill="#18181b" />
            <circle cx="280" cy="250" r="70" stroke="#64748b" strokeWidth="2" strokeDasharray="8 4" />
            <circle cx="280" cy="250" r="30" stroke="#cbd5e1" strokeWidth="2" fill="#334155" />
            {/* Caliper Floating to side */}
            <path d="M 370 170 L 460 160 L 470 290 L 380 280 Z" rx="10" fill="#dc2626" fillOpacity="0.8" stroke="#f87171" strokeWidth="2" />
            <circle cx="410" cy="200" r="16" fill="#18181b" stroke="#fff" strokeWidth="1.5" />
            <circle cx="410" cy="250" r="16" fill="#18181b" stroke="#fff" strokeWidth="1.5" />
            {/* Brake Pads */}
            <rect x="350" y="190" width="16" height="70" rx="3" fill="#eab308" stroke="#fef08a" />
          </g>
        );
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#111114] border border-[#27272a] rounded-2xl overflow-hidden shadow-inner relative select-none">
      
      {/* Top EPC Action Bar */}
      <div className="p-3 bg-[#18181b]/95 border-b border-[#27272a] flex flex-wrap items-center justify-between gap-2 z-10">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-neutral-900 border border-neutral-800 text-xs font-mono font-bold text-blue-400">
            <Layers className="w-3.5 h-3.5" />
            <span>ILUSTRAÇÃO: {diagram.illustrationCode}</span>
          </div>
          <span className="text-xs font-bold text-white hidden sm:inline truncate max-w-[240px]">
            {diagram.title}
          </span>
        </div>

        {/* Zoom & Pan Controls */}
        <div className="flex items-center gap-1 bg-neutral-900 p-1 rounded-xl border border-neutral-800 text-neutral-300">
          <button
            onClick={handleZoomIn}
            className="p-1.5 hover:bg-neutral-800 hover:text-white rounded-lg transition-colors"
            title="Aumentar Zoom (+)"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            onClick={handleZoomOut}
            className="p-1.5 hover:bg-neutral-800 hover:text-white rounded-lg transition-colors"
            title="Diminuir Zoom (-)"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <button
            onClick={handleResetZoom}
            className="p-1.5 hover:bg-neutral-800 hover:text-white rounded-lg transition-colors text-xs font-mono px-2"
            title="Redefinir Zoom 100%"
          >
            {Math.round(zoom * 100)}%
          </button>
          <button
            onClick={handleResetZoom}
            className="p-1.5 hover:bg-neutral-800 hover:text-white rounded-lg transition-colors"
            title="Centralizar Esquema"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main Interactive Diagram Canvas */}
      <div 
        ref={containerRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        className={`flex-1 relative overflow-hidden bg-radial-pattern bg-[#0d0d10] flex items-center justify-center p-4 min-h-[380px] md:min-h-[460px] ${
          isDragging ? 'cursor-grabbing' : 'cursor-grab'
        }`}
      >
        {/* Background Grid Pattern (Blueprint/EPC style) */}
        <div 
          className="absolute inset-0 opacity-[0.07] pointer-events-none"
          style={{
            backgroundImage: `radial-gradient(circle, #ffffff 1px, transparent 1px)`,
            backgroundSize: '24px 24px'
          }}
        />

        {/* Scalable & Draggable Canvas Content */}
        <div 
          style={{
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
            transformOrigin: 'center center',
            transition: isDragging ? 'none' : 'transform 0.15s ease-out'
          }}
          className="w-full max-w-[580px] aspect-square relative"
        >
          {/* SVG Technical Drawing */}
          <svg 
            viewBox="0 0 600 500" 
            className="w-full h-full drop-shadow-2xl"
          >
            {renderSchematicIllustration()}
          </svg>

          {/* Interactive Pin Hotspots (Ref Numbers: 1, 2, 3, 7, 8, 9, 10, 11, 12, etc.) */}
          {diagram.hotspots.map((hotspot) => {
            const isSelected = selectedRef === hotspot.ref;
            const isHovered = hoveredRef === hotspot.ref;
            const matchingPart = diagram.parts.find(p => p.ref === hotspot.ref);

            return (
              <div
                key={hotspot.ref}
                style={{
                  left: `${hotspot.x}%`,
                  top: `${hotspot.y}%`
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectRef(hotspot.ref);
                }}
                onMouseEnter={() => onHoverRef(hotspot.ref)}
                onMouseLeave={() => onHoverRef(null)}
                className="absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer group z-20"
              >
                {/* Pin Badge */}
                <div className={`
                  w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center font-bold text-xs sm:text-sm font-mono
                  transition-all duration-200 shadow-lg
                  ${isSelected
                    ? 'bg-amber-400 text-black scale-125 ring-4 ring-amber-400/40 shadow-amber-500/50 z-30'
                    : isHovered
                    ? 'bg-blue-500 text-white scale-115 ring-2 ring-blue-400/50 shadow-blue-500/50 z-20'
                    : 'bg-[#18181b] border-2 border-neutral-600 text-neutral-200 hover:border-amber-400 hover:text-amber-400 hover:bg-neutral-900'
                  }
                `}>
                  {hotspot.ref}
                </div>

                {/* Hotspot Hover Tooltip */}
                {(isHovered || isSelected) && matchingPart && (
                  <div className="absolute left-1/2 bottom-full mb-2 -translate-x-1/2 bg-neutral-900/95 border border-neutral-700 text-white text-xs rounded-xl py-1.5 px-3 whitespace-nowrap shadow-2xl z-40 pointer-events-none backdrop-blur-md animate-in fade-in zoom-in-95 duration-150">
                    <div className="flex items-center gap-1.5 font-bold font-mono text-amber-400">
                      <span>Ref #{matchingPart.ref}</span>
                      <span>•</span>
                      <span>{matchingPart.partNumber}</span>
                    </div>
                    <div className="text-[11px] text-neutral-300 max-w-[200px] truncate">
                      {matchingPart.description}
                    </div>
                    <div className="text-[10px] text-emerald-400 font-mono mt-0.5">
                      R$ {matchingPart.factoryPrice.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} (Fábrica)
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Floating Helper Notice */}
        <div className="absolute bottom-3 left-3 bg-neutral-900/80 border border-neutral-800/80 rounded-xl px-2.5 py-1 text-[10px] text-neutral-400 flex items-center gap-1.5 pointer-events-none backdrop-blur-sm">
          <Info className="w-3 h-3 text-blue-400" />
          <span>Clique nos números ou arraste para inspecionar</span>
        </div>
      </div>

    </div>
  );
};
