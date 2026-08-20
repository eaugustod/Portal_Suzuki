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
  Info,
  Compass,
  ArrowUpRight,
  Eye,
  X
} from 'lucide-react';
import { PartsDiagramGroup, PartsPinHotspot } from '../../types';

interface PartsExplodedDiagramProps {
  diagram: PartsDiagramGroup;
  selectedRef: number | null;
  onSelectRef: (ref: number) => void;
  hoveredRef: number | null;
  onHoverRef: (ref: number | null) => void;
  modelName?: string;
}

export const PartsExplodedDiagram: React.FC<PartsExplodedDiagramProps> = ({
  diagram,
  selectedRef,
  onSelectRef,
  hoveredRef,
  onHoverRef,
  modelName = 'V-STROM 800 M5'
}) => {
  const [zoom, setZoom] = useState<number>(1);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isFullscreenModalOpen, setIsFullscreenModalOpen] = useState<boolean>(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleZoomIn = () => setZoom(prev => Math.min(Number((prev + 0.25).toFixed(2)), 3.0));
  const handleZoomOut = () => setZoom(prev => Math.max(Number((prev - 0.25).toFixed(2)), 0.75));
  const handleSetZoom = (val: number) => {
    setZoom(val);
  };
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

  // Render stylized technical CAD/EPC vector illustration based on diagramType
  const renderSchematicIllustration = () => {
    switch (diagram.diagramType) {
      case 'vstrom_chassis_401':
        return (
          <g className="text-neutral-700" stroke="currentColor" strokeWidth="1.5" fill="none">
            {/* Background EPC CAD Blueprint Grid & Axes */}
            <rect x="10" y="10" width="580" height="480" rx="8" fill="#0f1117" stroke="#27272a" strokeWidth="1.5" />
            
            {/* Top-Left Figure Code Indicator */}
            <text x="30" y="45" fill="#f8fafc" fontSize="24" fontFamily="monospace" fontWeight="900" letterSpacing="1">
              FIG.401A
            </text>
            
            {/* FWD Compass Indicator (Forward Direction) */}
            <g transform="translate(48, 85)">
              <circle cx="0" cy="0" r="14" fill="#18181b" stroke="#60a5fa" strokeWidth="1.5" />
              <line x1="0" y1="10" x2="0" y2="-10" stroke="#60a5fa" strokeWidth="2" />
              <polygon points="0,-12 -4,-4 4,-4" fill="#60a5fa" />
              <text x="18" y="4" fill="#93c5fd" fontSize="11" fontFamily="monospace" fontWeight="bold">FWD</text>
            </g>

            {/* Pointer to FIG. 496 */}
            <g transform="translate(520, 110)">
              <rect x="-40" y="-12" width="70" height="22" rx="4" fill="#18181b" stroke="#eab308" strokeWidth="1" />
              <text x="-34" y="3" fill="#facc15" fontSize="10" fontFamily="monospace" fontWeight="bold">FIG. 496</text>
              <line x1="-40" y1="0" x2="-65" y2="25" stroke="#eab308" strokeWidth="1.5" strokeDasharray="3 2" />
              <polygon points="-65,25 -58,20 -60,28" fill="#eab308" />
            </g>

            {/* MAIN FRAME COMP (Ref 1 - Front Trellis Chassis) */}
            {/* Steering Head Tube */}
            <path 
              d="M 120 120 L 145 160 L 135 170 L 110 130 Z" 
              fill="#27272a" 
              stroke="#e2e8f0" 
              strokeWidth="2.5" 
            />
            <ellipse cx="115" cy="125" rx="14" ry="7" fill="#334155" stroke="#94a3b8" strokeWidth="1.5" />

            {/* Upper Trellis Tubes */}
            <path 
              d="M 140 150 Q 210 180 270 200 L 275 220 Q 210 195 135 165 Z" 
              fill="#1e293b" 
              stroke="#f1f5f9" 
              strokeWidth="2.5" 
            />
            {/* Diagonal Trellis Bridge Truss Tubes */}
            <path 
              d="M 180 170 L 195 245 L 210 240 L 195 175 Z" 
              fill="#334155" 
              stroke="#cbd5e1" 
              strokeWidth="2" 
            />
            <path 
              d="M 230 185 L 245 255 L 260 250 L 245 190 Z" 
              fill="#334155" 
              stroke="#cbd5e1" 
              strokeWidth="2" 
            />

            {/* Lower Engine Cradle Spine Tube */}
            <path 
              d="M 145 175 Q 165 240 185 290 Q 230 330 280 340 L 285 320 Q 240 310 200 275 Q 185 230 165 170 Z" 
              fill="#1e293b" 
              stroke="#f8fafc" 
              strokeWidth="2.5" 
            />

            {/* Center Pivot Pivot Plate & Engine Hangers (Ref 1 Central Structure) */}
            <path 
              d="M 270 200 L 310 220 L 305 330 L 275 340 L 265 280 Z" 
              fill="#334155" 
              stroke="#f8fafc" 
              strokeWidth="2.5" 
            />
            <circle cx="285" cy="280" r="14" fill="#0f172a" stroke="#38bdf8" strokeWidth="2" />
            <circle cx="285" cy="280" r="6" fill="#38bdf8" />

            {/* REAR SUBFRAME (Ref 2 - Subchassi Traseiro Tubular) */}
            {/* Upper Tail Rail */}
            <path 
              d="M 310 220 L 460 170 L 485 175 L 495 190 L 330 245 Z" 
              fill="#1e293b" 
              stroke="#38bdf8" 
              strokeWidth="2.5" 
            />
            {/* Lower Diagonal Subframe Brace */}
            <path 
              d="M 295 300 L 470 190 L 455 180 L 285 285 Z" 
              fill="#334155" 
              stroke="#38bdf8" 
              strokeWidth="2.5" 
            />
            {/* Subframe Cross Gussets & Mount Tabs */}
            <path d="M 380 200 L 390 235" stroke="#94a3b8" strokeWidth="3" />
            <path d="M 430 185 L 440 210" stroke="#94a3b8" strokeWidth="3" />
            <circle cx="485" cy="180" r="5" fill="#38bdf8" stroke="#fff" />

            {/* SUBFRAME MOUNTING BOLTS & BRACKETS (Ref 3, Ref 4, Ref 5, Ref 6) */}
            {/* Upper Left/Right Joint Plates (Ref 4 & 5) */}
            <g transform="translate(305, 215)">
              <rect x="-18" y="-12" width="36" height="24" rx="4" fill="#475569" stroke="#facc15" strokeWidth="1.5" />
              <circle cx="-8" cy="0" r="4" fill="#18181b" stroke="#facc15" />
              <circle cx="8" cy="0" r="4" fill="#18181b" stroke="#facc15" />
            </g>

            {/* Exploded Subframe Flange Bolts (Ref 3) */}
            <g transform="translate(290, 195) rotate(-35)">
              <line x1="-30" y1="0" x2="20" y2="0" stroke="#60a5fa" strokeWidth="1" strokeDasharray="3 2" />
              <rect x="-25" y="-5" width="20" height="10" rx="2" fill="#cbd5e1" stroke="#f8fafc" strokeWidth="1" />
              <rect x="-5" y="-8" width="6" height="16" rx="2" fill="#94a3b8" stroke="#f8fafc" strokeWidth="1" />
            </g>
            <g transform="translate(280, 315) rotate(25)">
              <line x1="-30" y1="0" x2="20" y2="0" stroke="#60a5fa" strokeWidth="1" strokeDasharray="3 2" />
              <rect x="-25" y="-5" width="20" height="10" rx="2" fill="#cbd5e1" stroke="#f8fafc" strokeWidth="1" />
              <rect x="-5" y="-8" width="6" height="16" rx="2" fill="#94a3b8" stroke="#f8fafc" strokeWidth="1" />
            </g>

            {/* CHAIN GUIDE ROLLER & MOUNT (Ref 7, Ref 8, Ref 9) */}
            <g transform="translate(280, 385)">
              {/* Centerline trace */}
              <line x1="-60" y1="0" x2="50" y2="0" stroke="#eab308" strokeWidth="1" strokeDasharray="4 2" />
              {/* Roller Cushion (Ref 7) */}
              <ellipse cx="-5" cy="0" rx="16" ry="16" fill="#18181b" stroke="#10b981" strokeWidth="2.5" />
              <circle cx="-5" cy="0" r="7" fill="#334155" stroke="#10b981" />
              {/* Spacer Sleeve (Ref 9) */}
              <rect x="15" y="-6" width="12" height="12" rx="2" fill="#64748b" stroke="#cbd5e1" strokeWidth="1.5" />
              {/* Long Hex Flange Bolt (Ref 8) */}
              <g transform="translate(-45, 0)">
                <rect x="0" y="-3" width="26" height="6" fill="#cbd5e1" stroke="#f8fafc" />
                <rect x="-8" y="-6" width="8" height="12" rx="2" fill="#94a3b8" stroke="#f8fafc" />
              </g>
            </g>

            {/* Bottom Title Legend (DL800M5_P37_401A FRAME) */}
            <line x1="20" y1="440" x2="580" y2="440" stroke="#3f3f46" strokeWidth="1" />
            <text x="30" y="465" fill="#94a3b8" fontSize="13" fontFamily="monospace" fontWeight="bold">
              DL800M5_P37_401A
            </text>
            <text x="550" y="465" fill="#f8fafc" fontSize="14" fontFamily="monospace" fontWeight="900" textAnchor="end">
              FRAME
            </text>
          </g>
        );

      case 'vstrom_holders_406':
        return (
          <g className="text-neutral-700" stroke="currentColor" strokeWidth="1.5" fill="none">
            {/* CAD Blueprint Frame */}
            <rect x="10" y="10" width="580" height="480" rx="8" fill="#0f1117" stroke="#27272a" strokeWidth="1.5" />
            
            {/* Top-Left Figure Code Indicator */}
            <text x="30" y="45" fill="#f8fafc" fontSize="24" fontFamily="monospace" fontWeight="900" letterSpacing="1">
              FIG.406A
            </text>

            {/* FWD Compass Indicator */}
            <g transform="translate(48, 85)">
              <circle cx="0" cy="0" r="14" fill="#18181b" stroke="#60a5fa" strokeWidth="1.5" />
              <line x1="0" y1="10" x2="0" y2="-10" stroke="#60a5fa" strokeWidth="2" />
              <polygon points="0,-12 -4,-4 4,-4" fill="#60a5fa" />
              <text x="18" y="4" fill="#93c5fd" fontSize="11" fontFamily="monospace" fontWeight="bold">FWD</text>
            </g>

            {/* Inset Box Detail: VIEW A (Upper Right) */}
            <g transform="translate(380, 35)">
              <rect x="0" y="0" width="180" height="120" rx="6" fill="#18181b" stroke="#64748b" strokeWidth="1.5" />
              <rect x="6" y="6" width="60" height="18" rx="3" fill="#27272a" />
              <text x="12" y="19" fill="#facc15" fontSize="11" fontFamily="monospace" fontWeight="bold">VIEW A</text>
              
              {/* Perspective 3D holder latch and screw */}
              <path d="M 80 40 L 140 30 L 160 70 L 100 80 Z" fill="#334155" stroke="#cbd5e1" strokeWidth="1.5" />
              <circle cx="120" cy="55" r="5" fill="#18181b" stroke="#facc15" strokeWidth="1.5" />
              <line x1="120" y1="55" x2="155" y2="40" stroke="#60a5fa" strokeWidth="1" strokeDasharray="3 2" />
              <circle cx="155" cy="40" r="4" fill="#facc15" />
            </g>

            {/* UPPER TANK HOLDER / REAR SUPPORT (Ref 6 - Suporte Superior) */}
            <g transform="translate(350, 150)">
              <path 
                d="M 10 20 L 70 0 L 130 15 L 140 45 L 80 55 L 20 40 Z" 
                fill="#1e293b" 
                stroke="#38bdf8" 
                strokeWidth="2.5" 
              />
              <circle cx="45" cy="25" r="6" fill="#0f172a" stroke="#cbd5e1" strokeWidth="1.5" />
              <circle cx="105" cy="30" r="6" fill="#0f172a" stroke="#cbd5e1" strokeWidth="1.5" />
              
              {/* Exploded Flange Bolts (Ref 7) */}
              <g transform="translate(45, -20)">
                <line x1="0" y1="0" x2="0" y2="40" stroke="#60a5fa" strokeWidth="1" strokeDasharray="3 2" />
                <rect x="-3" y="-5" width="6" height="16" fill="#cbd5e1" stroke="#fff" />
                <rect x="-6" y="-12" width="12" height="7" rx="1" fill="#94a3b8" stroke="#fff" />
              </g>
              <g transform="translate(105, -15)">
                <line x1="0" y1="0" x2="0" y2="40" stroke="#60a5fa" strokeWidth="1" strokeDasharray="3 2" />
                <rect x="-3" y="-5" width="6" height="16" fill="#cbd5e1" stroke="#fff" />
                <rect x="-6" y="-12" width="12" height="7" rx="1" fill="#94a3b8" stroke="#fff" />
              </g>
            </g>

            {/* ELECTRICAL PARTS HOLDER (Ref 4 - Caixa Central Elétrica/Relés) */}
            <g transform="translate(220, 210)">
              <path 
                d="M 20 20 L 120 10 L 140 70 L 120 110 L 30 115 L 10 65 Z" 
                fill="#27272a" 
                stroke="#e2e8f0" 
                strokeWidth="2.5" 
              />
              {/* Internal Compartments / Relay Slots */}
              <rect x="35" y="35" width="30" height="25" rx="2" fill="#0f172a" stroke="#64748b" />
              <rect x="75" y="30" width="40" height="30" rx="2" fill="#0f172a" stroke="#64748b" />
              <rect x="40" y="70" width="70" height="30" rx="2" fill="#18181b" stroke="#3b82f6" strokeDasharray="3 2" />
              
              {/* Holder Bolts (Ref 5) */}
              <circle cx="22" cy="30" r="5" fill="#334155" stroke="#facc15" strokeWidth="1.5" />
              <circle cx="125" cy="20" r="5" fill="#334155" stroke="#facc15" strokeWidth="1.5" />
              <circle cx="115" cy="95" r="5" fill="#334155" stroke="#facc15" strokeWidth="1.5" />
            </g>

            {/* BATTERY HOLDER TRAY & CUSHION (Ref 1, Ref 2, Ref 3) */}
            <g transform="translate(180, 320)">
              {/* Battery Tray Housing (Ref 1) */}
              <path 
                d="M 30 30 L 130 15 L 160 75 L 140 120 L 40 125 L 10 70 Z" 
                fill="#1e293b" 
                stroke="#f8fafc" 
                strokeWidth="2.5" 
              />
              {/* Rubber Cushion Pad (Ref 2) */}
              <path 
                d="M 45 45 L 115 35 L 135 75 L 120 105 L 50 110 L 30 70 Z" 
                fill="#09090b" 
                stroke="#10b981" 
                strokeWidth="2" 
                strokeDasharray="4 2" 
              />
              {/* Battery Terminal Clamping Recess */}
              <rect x="60" y="55" width="22" height="14" rx="2" fill="#dc2626" fillOpacity="0.6" stroke="#f87171" />
              <rect x="90" y="52" width="22" height="14" rx="2" fill="#2563eb" fillOpacity="0.6" stroke="#60a5fa" />
              
              {/* Battery Tray Mounting Screws (Ref 3) */}
              <g transform="translate(15, 60)">
                <line x1="-30" y1="0" x2="15" y2="0" stroke="#facc15" strokeWidth="1" strokeDasharray="3 2" />
                <rect x="-25" y="-3" width="16" height="6" fill="#cbd5e1" stroke="#fff" />
                <rect x="-30" y="-6" width="6" height="12" rx="1" fill="#94a3b8" stroke="#fff" />
              </g>
              <g transform="translate(145, 110)">
                <line x1="0" y1="0" x2="35" y2="0" stroke="#facc15" strokeWidth="1" strokeDasharray="3 2" />
                <rect x="15" y="-3" width="16" height="6" fill="#cbd5e1" stroke="#fff" />
                <rect x="10" y="-6" width="6" height="12" rx="1" fill="#94a3b8" stroke="#fff" />
              </g>
            </g>

            {/* Bottom Title Legend */}
            <line x1="20" y1="440" x2="580" y2="440" stroke="#3f3f46" strokeWidth="1" />
            <text x="30" y="465" fill="#94a3b8" fontSize="13" fontFamily="monospace" fontWeight="bold">
              DL800M5_P37_406A
            </text>
            <text x="550" y="465" fill="#f8fafc" fontSize="14" fontFamily="monospace" fontWeight="900" textAnchor="end">
              HOLDER
            </text>
          </g>
        );

      case 'vstrom_stand_407':
        return (
          <g className="text-neutral-700" stroke="currentColor" strokeWidth="1.5" fill="none">
            <rect x="10" y="10" width="580" height="480" rx="8" fill="#0f1117" stroke="#27272a" strokeWidth="1.5" />
            <text x="30" y="45" fill="#f8fafc" fontSize="24" fontFamily="monospace" fontWeight="900">FIG.407A</text>
            {/* Side Stand Forged Arm */}
            <path d="M 280 180 L 220 370 L 190 380 L 180 395 L 230 385 L 295 190 Z" fill="#1e293b" stroke="#f8fafc" strokeWidth="2.5" />
            {/* Pivot Joint & Bolt */}
            <circle cx="288" cy="185" r="16" fill="#334155" stroke="#38bdf8" strokeWidth="2" />
            <circle cx="288" cy="185" r="6" fill="#38bdf8" />
            {/* Dual Springs */}
            <path d="M 250 220 Q 240 260 230 300" stroke="#10b981" strokeWidth="3" strokeDasharray="4 2" />
            <path d="M 260 220 Q 250 260 240 300" stroke="#facc15" strokeWidth="2" strokeDasharray="3 2" />
            {/* Switch Sensor */}
            <rect x="220" y="150" width="35" height="28" rx="4" fill="#27272a" stroke="#cbd5e1" strokeWidth="1.5" />
            <line x1="20" y1="440" x2="580" y2="440" stroke="#3f3f46" strokeWidth="1" />
            <text x="30" y="465" fill="#94a3b8" fontSize="13" fontFamily="monospace" fontWeight="bold">DL800M5_P37_407A</text>
            <text x="550" y="465" fill="#f8fafc" fontSize="14" fontFamily="monospace" fontWeight="900" textAnchor="end">STAND</text>
          </g>
        );

      case 'vstrom_carrier_412':
        return (
          <g className="text-neutral-700" stroke="currentColor" strokeWidth="1.5" fill="none">
            <rect x="10" y="10" width="580" height="480" rx="8" fill="#0f1117" stroke="#27272a" strokeWidth="1.5" />
            <text x="30" y="45" fill="#f8fafc" fontSize="24" fontFamily="monospace" fontWeight="900">FIG.412A</text>
            {/* Top Plate Carrier */}
            <path d="M 180 200 L 420 200 L 390 280 L 210 280 Z" fill="#1e293b" stroke="#f8fafc" strokeWidth="2.5" />
            <circle cx="250" cy="240" r="10" fill="#0f172a" stroke="#cbd5e1" />
            <circle cx="350" cy="240" r="10" fill="#0f172a" stroke="#cbd5e1" />
            {/* Side Passenger Handles */}
            <path d="M 170 210 L 130 250 L 150 290 L 200 270" stroke="#38bdf8" strokeWidth="4" fill="none" />
            <path d="M 430 210 L 470 250 L 450 290 L 400 270" stroke="#38bdf8" strokeWidth="4" fill="none" />
            <line x1="20" y1="440" x2="580" y2="440" stroke="#3f3f46" strokeWidth="1" />
            <text x="30" y="465" fill="#94a3b8" fontSize="13" fontFamily="monospace" fontWeight="bold">DL800M5_P37_412A</text>
            <text x="550" y="465" fill="#f8fafc" fontSize="14" fontFamily="monospace" fontWeight="900" textAnchor="end">CARRIER</text>
          </g>
        );

      case 'vstrom_fuel_tank_420':
        return (
          <g className="text-neutral-700" stroke="currentColor" strokeWidth="1.5" fill="none">
            <rect x="10" y="10" width="580" height="480" rx="8" fill="#0f1117" stroke="#27272a" strokeWidth="1.5" />
            <text x="30" y="45" fill="#f8fafc" fontSize="24" fontFamily="monospace" fontWeight="900">FIG.420A</text>
            {/* 20L Fuel Tank Body */}
            <path d="M 170 240 Q 210 140 330 150 Q 440 180 430 280 Q 380 340 240 320 Q 180 310 170 240 Z" fill="#1e293b" stroke="#f8fafc" strokeWidth="2.5" />
            {/* Cap Recess */}
            <circle cx="310" cy="190" r="28" fill="#0f172a" stroke="#eab308" strokeWidth="2" />
            <circle cx="310" cy="190" r="16" fill="#334155" stroke="#cbd5e1" />
            {/* Bottom Fuel Pump Mount Flange */}
            <ellipse cx="290" cy="315" rx="35" ry="12" fill="#0f172a" stroke="#38bdf8" strokeWidth="2" />
            <line x1="20" y1="440" x2="580" y2="440" stroke="#3f3f46" strokeWidth="1" />
            <text x="30" y="465" fill="#94a3b8" fontSize="13" fontFamily="monospace" fontWeight="bold">DL800M5_P37_420A</text>
            <text x="550" y="465" fill="#f8fafc" fontSize="14" fontFamily="monospace" fontWeight="900" textAnchor="end">FUEL TANK</text>
          </g>
        );

      case 'crankcase':
      default:
        return (
          <g className="text-neutral-700" stroke="currentColor" strokeWidth="1.5" fill="none">
            <rect x="10" y="10" width="580" height="480" rx="8" fill="#0f1117" stroke="#27272a" strokeWidth="1.5" />
            <text x="30" y="45" fill="#f8fafc" fontSize="22" fontFamily="monospace" fontWeight="900">
              {diagram.illustrationCode || 'SCHEMATIC'}
            </text>
            <path 
              d="M 280 140 C 350 140, 420 180, 430 250 C 440 320, 390 380, 310 390 C 230 400, 180 340, 170 270 C 160 200, 210 140, 280 140 Z" 
              fill="#27272a" 
              fillOpacity="0.4"
              stroke="#52525b" 
              strokeWidth="2.5" 
            />
            <circle cx="300" cy="265" r="75" stroke="#71717a" strokeWidth="2" fill="#18181b" />
            <circle cx="300" cy="265" r="40" stroke="#3b82f6" strokeWidth="1.5" strokeDasharray="4 2" />
            <circle cx="300" cy="265" r="16" fill="#71717a" stroke="#d4d4d8" />
            <ellipse cx="140" cy="275" rx="22" ry="45" stroke="#eab308" strokeWidth="2.5" fill="none" />
            <line x1="20" y1="440" x2="580" y2="440" stroke="#3f3f46" strokeWidth="1" />
            <text x="30" y="465" fill="#94a3b8" fontSize="13" fontFamily="monospace" fontWeight="bold">{diagram.subTitle || 'TECHNICAL EPC'}</text>
            <text x="550" y="465" fill="#f8fafc" fontSize="14" fontFamily="monospace" fontWeight="900" textAnchor="end">{diagram.illustrationCode}</text>
          </g>
        );
    }
  };

  const renderHotspots = () => (
    <>
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
            {/* Pin Badge with EPC Blueprint Styling */}
            <div className={`
              w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center font-bold text-xs sm:text-sm font-mono
              transition-all duration-200 shadow-xl select-none
              ${isSelected
                ? 'bg-amber-400 text-black scale-125 ring-4 ring-amber-400/40 shadow-amber-500/50 z-30'
                : isHovered
                ? 'bg-blue-500 text-white scale-115 ring-2 ring-blue-400/50 shadow-blue-500/50 z-20'
                : 'bg-[#18181b] border-2 border-neutral-600 text-neutral-100 hover:border-amber-400 hover:text-amber-400 hover:bg-neutral-900'
              }
            `}>
              {hotspot.ref}
            </div>

            {/* Hotspot Hover Tooltip */}
            {(isHovered || isSelected) && matchingPart && (
              <div className="absolute left-1/2 bottom-full mb-2 -translate-x-1/2 bg-neutral-900/95 border border-neutral-700 text-white text-xs rounded-xl py-2 px-3.5 whitespace-nowrap shadow-2xl z-40 pointer-events-none backdrop-blur-md animate-in fade-in zoom-in-95 duration-150">
                <div className="flex items-center gap-1.5 font-bold font-mono text-amber-400">
                  <span>Ref #{matchingPart.ref}</span>
                  <span>•</span>
                  <span>{matchingPart.partNumber}</span>
                </div>
                <div className="text-xs font-semibold text-white max-w-[240px] truncate mt-0.5">
                  {matchingPart.description}
                </div>
                <div className="flex items-center justify-between gap-3 text-[11px] font-mono mt-1 text-neutral-300">
                  <span className="text-emerald-400 font-bold">
                    R$ {matchingPart.factoryPrice.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} (Fábrica)
                  </span>
                  <span className="text-neutral-400 text-[10px]">
                    Estoque: {matchingPart.stockManaus + matchingPart.stockJundiai} un.
                  </span>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </>
  );

  return (
    <>
      <div className="flex flex-col h-full bg-[#111114] border border-[#27272a] rounded-2xl overflow-hidden shadow-inner relative select-none">
        
        {/* Top EPC Action Bar with Zoom Presets & Fullscreen */}
        <div className="p-3 bg-[#18181b]/95 border-b border-[#27272a] flex flex-wrap items-center justify-between gap-2 z-10">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-neutral-900 border border-neutral-800 text-xs font-mono font-bold text-blue-400">
              <Layers className="w-3.5 h-3.5" />
              <span>ILUSTRAÇÃO: {diagram.illustrationCode}</span>
            </div>
            <span className="text-xs font-bold text-white hidden sm:inline truncate max-w-[260px]">
              {diagram.title}
            </span>
          </div>

          {/* Zoom Presets: 100%, 150%, 200% (Matching Fig 3) & Fullscreen Modal */}
          <div className="flex items-center gap-1.5">
            <div className="flex items-center bg-neutral-900 p-0.5 rounded-xl border border-neutral-800 text-neutral-300 text-xs font-mono">
              <button
                onClick={() => handleSetZoom(1.0)}
                className={`px-2.5 py-1 rounded-lg transition-colors font-bold ${
                  zoom === 1.0 ? 'bg-amber-400 text-black' : 'hover:bg-neutral-800 hover:text-white text-neutral-400'
                }`}
                title="Zoom 100%"
              >
                100%
              </button>
              <button
                onClick={() => handleSetZoom(1.5)}
                className={`px-2.5 py-1 rounded-lg transition-colors font-bold ${
                  zoom === 1.5 ? 'bg-amber-400 text-black' : 'hover:bg-neutral-800 hover:text-white text-neutral-400'
                }`}
                title="Zoom 150%"
              >
                150%
              </button>
              <button
                onClick={() => handleSetZoom(2.0)}
                className={`px-2.5 py-1 rounded-lg transition-colors font-bold ${
                  zoom === 2.0 ? 'bg-amber-400 text-black' : 'hover:bg-neutral-800 hover:text-white text-neutral-400'
                }`}
                title="Zoom 200%"
              >
                200%
              </button>
            </div>

            {/* Fine Step Zoom & Reset */}
            <div className="flex items-center gap-1 bg-neutral-900 p-1 rounded-xl border border-neutral-800 text-neutral-300">
              <button
                onClick={handleZoomIn}
                className="p-1 hover:bg-neutral-800 hover:text-white rounded-lg transition-colors"
                title="Aumentar Zoom (+)"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={handleZoomOut}
                className="p-1 hover:bg-neutral-800 hover:text-white rounded-lg transition-colors"
                title="Diminuir Zoom (-)"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={handleResetZoom}
                className="p-1 hover:bg-neutral-800 hover:text-white rounded-lg transition-colors"
                title="Centralizar Esquema"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setIsFullscreenModalOpen(true)}
                className="p-1 hover:bg-amber-400 hover:text-black rounded-lg transition-colors ml-0.5"
                title="Expandir Diagrama em Tela Cheia"
              >
                <Maximize2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Main Interactive Diagram Canvas */}
        <div 
          ref={containerRef}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          className={`flex-1 relative overflow-hidden bg-[#0a0a0d] flex items-center justify-center p-4 min-h-[420px] md:min-h-[500px] ${
            isDragging ? 'cursor-grabbing' : 'cursor-grab'
          }`}
        >
          {/* Blueprint Background Grid */}
          <div 
            className="absolute inset-0 opacity-[0.06] pointer-events-none"
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
            className="w-full max-w-[620px] aspect-[6/5] relative"
          >
            {/* SVG Technical CAD Drawing */}
            <svg 
              viewBox="0 0 600 500" 
              className="w-full h-full drop-shadow-2xl"
            >
              {renderSchematicIllustration()}
            </svg>

            {/* Interactive Pin Hotspots */}
            {renderHotspots()}
          </div>

          {/* Floating Helper Notice */}
          <div className="absolute bottom-3 left-3 bg-neutral-900/90 border border-neutral-800 rounded-xl px-3 py-1.5 text-[11px] text-neutral-300 flex items-center gap-2 pointer-events-none backdrop-blur-sm shadow-lg">
            <Info className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span>Clique nos números para destacar a peça ou arraste para navegar</span>
          </div>
        </div>

      </div>

      {/* FULLSCREEN EXPANDED EPC MODAL (Fig 4 & Fig 6) */}
      {isFullscreenModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex flex-col p-4 sm:p-6 animate-in fade-in duration-200">
          
          {/* Modal Header */}
          <div className="flex items-center justify-between pb-4 border-b border-neutral-800">
            <div>
              <span className="text-xs font-mono font-bold text-amber-400 uppercase tracking-widest">
                EPC SUZUKI • {modelName}
              </span>
              <h2 className="text-lg sm:text-xl font-bold text-white">
                Diagrama explodido {modelName} - {diagram.illustrationCode.toLowerCase().replace('.', '')} ({diagram.title})
              </h2>
            </div>

            <div className="flex items-center gap-3">
              {/* Zoom Buttons in Modal */}
              <div className="flex items-center bg-neutral-900 p-1 rounded-xl border border-neutral-800 text-neutral-300 text-xs font-mono">
                <button
                  onClick={() => handleSetZoom(1.0)}
                  className={`px-3 py-1.5 rounded-lg transition-colors font-bold ${zoom === 1.0 ? 'bg-amber-400 text-black' : 'hover:bg-neutral-800'}`}
                >
                  100%
                </button>
                <button
                  onClick={() => handleSetZoom(1.5)}
                  className={`px-3 py-1.5 rounded-lg transition-colors font-bold ${zoom === 1.5 ? 'bg-amber-400 text-black' : 'hover:bg-neutral-800'}`}
                >
                  150%
                </button>
                <button
                  onClick={() => handleSetZoom(2.0)}
                  className={`px-3 py-1.5 rounded-lg transition-colors font-bold ${zoom === 2.0 ? 'bg-amber-400 text-black' : 'hover:bg-neutral-800'}`}
                >
                  200%
                </button>
              </div>

              <button
                onClick={() => setIsFullscreenModalOpen(false)}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-white font-bold text-xs transition-colors border border-neutral-700"
              >
                <X className="w-4 h-4" />
                <span>✕ Fechar</span>
              </button>
            </div>
          </div>

          {/* Modal Canvas */}
          <div className="flex-1 relative overflow-hidden bg-[#0a0a0d] border border-neutral-800 rounded-2xl mt-4 flex items-center justify-center p-4">
            <div 
              style={{
                transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
                transformOrigin: 'center center',
                transition: isDragging ? 'none' : 'transform 0.15s ease-out'
              }}
              className="w-full max-w-[850px] aspect-[6/5] relative"
            >
              <svg viewBox="0 0 600 500" className="w-full h-full drop-shadow-2xl">
                {renderSchematicIllustration()}
              </svg>
              {renderHotspots()}
            </div>
          </div>

        </div>
      )}
    </>
  );
};
