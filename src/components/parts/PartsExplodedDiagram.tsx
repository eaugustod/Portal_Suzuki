import React, { useState, useRef, useEffect } from 'react';
import { 
  ZoomIn, 
  ZoomOut, 
  Maximize2, 
  RotateCcw, 
  Layers, 
  Info,
  X,
  Sun,
  Moon,
  Crosshair,
  ShoppingCart,
  Check,
  Upload,
  Image as ImageIcon,
  CheckSquare,
  Square,
  Sparkles,
  Eye,
  Sliders,
  AlertCircle,
  Pin,
  Save,
  Trash2
} from 'lucide-react';
import { PartsDiagramGroup, PartsPinHotspot, PartsItem } from '../../types';
import { saveDiagramImage, getDiagramImage, deleteDiagramImage } from '../../utils/imageStorage';
import { autoDetectHotspotsFromImage } from '../../utils/autoNumberDetector';

interface PartsExplodedDiagramProps {
  diagram: PartsDiagramGroup;
  selectedRef: number | null;
  onSelectRef: (ref: number) => void;
  hoveredRef: number | null;
  onHoverRef: (ref: number | null) => void;
  modelName?: string;
  onAddToCart?: (partId: string, quantity?: number) => void;
}

export const PartsExplodedDiagram: React.FC<PartsExplodedDiagramProps> = ({
  diagram,
  selectedRef,
  onSelectRef,
  hoveredRef,
  onHoverRef,
  modelName = 'V-STROM 800 M4',
  onAddToCart
}) => {
  // Diagram Interactive Zoom & Drag State (Default 50% zoom to fit standard container box without scroll)
  const [zoom, setZoom] = useState<number>(0.5);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isFullscreenModalOpen, setIsFullscreenModalOpen] = useState<boolean>(false);
  
  // Custom uploaded PNG for the current diagram session (persisted in IndexedDB/Storage)
  const [customImageSrc, setCustomImageSrc] = useState<string | null>(null);
  const [isPersistedImage, setIsPersistedImage] = useState<boolean>(false);
  const [isSavingImage, setIsSavingImage] = useState<boolean>(false);
  const [imageSaveSuccess, setImageSaveSuccess] = useState<boolean>(false);
  const [isDragOver, setIsDragOver] = useState<boolean>(false);
  
  // Hotspot visual style: 'ring' (subtle ring over original PNG number), 'badge' (solid circular pin), 'stealth' (invisible until hover)
  const [hotspotStyle, setHotspotStyle] = useState<'ring' | 'badge' | 'stealth'>('ring');
  
  // Quick quantity selector in popover
  const [popoverQty, setPopoverQty] = useState<number>(1);
  const [addedPartId, setAddedPartId] = useState<string | null>(null);
  
  // Multi-selection / marked items for quick bulk purchase
  const [markedRefs, setMarkedRefs] = useState<Set<number>>(new Set());

  // Track the EXACT hotspot id being hovered to avoid rendering multiple popovers
  // when the same ref appears in multiple hotspot positions on the diagram
  const [hoveredHotspotId, setHoveredHotspotId] = useState<string | null>(null);

  // Hotspot Pin Calibration System
  const [isCalibratingPins, setIsCalibratingPins] = useState<boolean>(false);
  const [activeHotspots, setActiveHotspots] = useState<PartsPinHotspot[]>(diagram.hotspots);
  const [selectedHotspotIdForCalibration, setSelectedHotspotIdForCalibration] = useState<string | null>(null);
  const [copiedFeedback, setCopiedFeedback] = useState<boolean>(false);
  const [savedFeedback, setSavedFeedback] = useState<boolean>(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync active hotspots with localStorage or default diagram hotspots
  useEffect(() => {
    const key = `epc_hotspots_${diagram.id}`;
    const saved = localStorage.getItem(key);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setActiveHotspots(parsed);
          return;
        }
      } catch (e) {}
    }
    setActiveHotspots(diagram.hotspots);
  }, [diagram.id, diagram.hotspots]);

  // Keep selectedHotspotIdForCalibration valid when hotspots change
  useEffect(() => {
    if (isCalibratingPins && activeHotspots.length > 0) {
      const exists = activeHotspots.some((h, i) => (h.id || `hs-${h.ref}-${i}`) === selectedHotspotIdForCalibration);
      if (!exists) {
        setSelectedHotspotIdForCalibration(activeHotspots[0].id || `hs-${activeHotspots[0].ref}-0`);
      }
    }
  }, [isCalibratingPins, activeHotspots, selectedHotspotIdForCalibration]);

  // Click on diagram to position the currently selected hotspot pin
  const handleDiagramClickForCalibration = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isCalibratingPins || !containerRef.current || activeHotspots.length === 0) return;

    const rect = containerRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;
    const pctX = Number(((clickX / rect.width) * 100).toFixed(1));
    const pctY = Number(((clickY / rect.height) * 100).toFixed(1));

    setActiveHotspots(prev => {
      if (prev.length === 0) return prev;
      const targetId = selectedHotspotIdForCalibration || (prev[0].id || `hs-${prev[0].ref}-0`);
      const idx = prev.findIndex((h, i) => (h.id || `hs-${h.ref}-${i}`) === targetId);

      if (idx >= 0) {
        const updated = [...prev];
        updated[idx] = { ...updated[idx], x: pctX, y: pctY };
        return updated;
      }
      return prev;
    });
  };

  // Add an extra hotspot pin for the current Ref
  const handleAddDuplicatePin = () => {
    if (!selectedHotspotIdForCalibration && activeHotspots.length > 0) {
      setSelectedHotspotIdForCalibration(activeHotspots[0].id || `hs-${activeHotspots[0].ref}-0`);
    }
    const currentHs = activeHotspots.find((h, i) => (h.id || `hs-${h.ref}-${i}`) === selectedHotspotIdForCalibration) || activeHotspots[0];
    if (!currentHs) return;

    const ref = currentHs.ref;
    const sameRefHotspots = activeHotspots.filter(h => h.ref === ref);
    const instNum = sameRefHotspots.length + 1;
    const newId = `hs-${diagram.id}-${ref}-${Date.now()}`;
    const matchingPart = diagram.parts.find(p => p.ref === ref);

    const newHs: PartsPinHotspot = {
      id: newId,
      ref: ref,
      x: Math.min(90, (currentHs.x || 30) + 3),
      y: Math.min(90, (currentHs.y || 30) + 3),
      label: `${ref} - ${matchingPart?.description || ''} (Pino ${instNum})`
    };

    setActiveHotspots(prev => [...prev, newHs]);
    setSelectedHotspotIdForCalibration(newId);
  };

  // Delete current selected hotspot pin
  const handleDeleteHotspotPin = () => {
    if (!selectedHotspotIdForCalibration || activeHotspots.length <= 1) return;
    setActiveHotspots(prev => {
      const next = prev.filter((h, i) => (h.id || `hs-${h.ref}-${i}`) !== selectedHotspotIdForCalibration);
      if (next.length > 0) {
        setSelectedHotspotIdForCalibration(next[0].id || `hs-${next[0].ref}-0`);
      }
      return next;
    });
  };

  const handleSaveHotspots = () => {
    localStorage.setItem(`epc_hotspots_${diagram.id}`, JSON.stringify(activeHotspots));
    setSavedFeedback(true);
    setTimeout(() => setSavedFeedback(false), 2000);
  };

  const handleCopyHotspotsJSON = () => {
    navigator.clipboard.writeText(JSON.stringify(activeHotspots, null, 2));
    setCopiedFeedback(true);
    setTimeout(() => setCopiedFeedback(false), 2000);
  };

  const handleResetHotspots = () => {
    localStorage.removeItem(`epc_hotspots_${diagram.id}`);
    setActiveHotspots(diagram.hotspots);
  };

  const [isDetecting, setIsDetecting] = useState<boolean>(false);

  const handleAutoDetectHotspots = async () => {
    setIsDetecting(true);
    const imageSrc = customImageSrc || diagram.customImageUrl || diagram.thumbnailUrl;
    const detected = await autoDetectHotspotsFromImage(imageSrc, diagram.parts);
    setActiveHotspots(detected);
    localStorage.setItem(`epc_hotspots_${diagram.id}`, JSON.stringify(detected));
    setIsDetecting(false);
  };

  // Load persisted custom image whenever diagram changes or on mount
  useEffect(() => {
    let isMounted = true;

    async function loadStoredImage() {
      try {
        const stored = await getDiagramImage(diagram.id, diagram.illustrationCode);
        if (isMounted) {
          if (stored) {
            setCustomImageSrc(stored);
            setIsPersistedImage(true);
          } else if (diagram.customImageUrl) {
            setCustomImageSrc(diagram.customImageUrl);
            setIsPersistedImage(false);
          } else {
            setCustomImageSrc(null);
            setIsPersistedImage(false);
          }
        }
      } catch (e) {
        if (isMounted) {
          setCustomImageSrc(diagram.customImageUrl || null);
          setIsPersistedImage(false);
        }
      }
    }

    loadStoredImage();
    setPopoverQty(1);

    return () => {
      isMounted = false;
    };
  }, [diagram.id, diagram.illustrationCode, diagram.customImageUrl]);

  const handleZoomIn = () => setZoom(prev => Math.min(Number((prev + 0.25).toFixed(2)), 3.5));
  const handleZoomOut = () => setZoom(prev => Math.max(Number((prev - 0.25).toFixed(2)), 0.6));
  const handleSetZoom = (val: number) => {
    setZoom(val);
  };
  const handleResetZoom = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    // Only drag if left click and not clicking directly on interactive buttons
    if (e.button !== 0) return;
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

  const handleQuickAdd = (partId: string, qty = 1, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (onAddToCart) {
      onAddToCart(partId, qty);
      setAddedPartId(partId);
      setTimeout(() => setAddedPartId(null), 1600);
    }
  };

  // Toggle mark ref for purchase
  const toggleMarkRef = (ref: number, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setMarkedRefs(prev => {
      const next = new Set(prev);
      if (next.has(ref)) {
        next.delete(ref);
      } else {
        next.add(ref);
      }
      return next;
    });
  };

  // Handle PNG image upload and save permanently in browser database
  const handleFileUpload = (file: File) => {
    if (file && file.type.startsWith('image/')) {
      setIsSavingImage(true);
      const reader = new FileReader();
      reader.onload = async (e) => {
        if (e.target?.result) {
          const dataUrl = e.target.result as string;
          setCustomImageSrc(dataUrl);
          setIsPersistedImage(true);
          await saveDiagramImage(diagram.id, dataUrl, diagram.illustrationCode);
          setIsSavingImage(false);
          setImageSaveSuccess(true);
          setTimeout(() => setImageSaveSuccess(false), 3000);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Remove saved custom PNG
  const handleRemoveCustomImage = async (e: React.MouseEvent) => {
    e.stopPropagation();
    await deleteDiagramImage(diagram.id, diagram.illustrationCode);
    setCustomImageSrc(diagram.customImageUrl || null);
    setIsPersistedImage(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  // Buy all marked items
  const handleBuyMarkedItems = () => {
    if (!onAddToCart || markedRefs.size === 0) return;
    markedRefs.forEach(ref => {
      const part = diagram.parts.find(p => p.ref === ref);
      if (part) {
        onAddToCart(part.id, 1);
      }
    });
    setMarkedRefs(new Set());
  };

  // Authentic high-resolution official Suzuki PNG illustration renderers
  // matching exactly the user's uploaded PNG catalog pages (FIG.401A and FIG.406A)
  const renderDiagramImage = () => {
    if (customImageSrc) {
      return (
        <img 
          src={customImageSrc} 
          alt={`Diagrama ${diagram.illustrationCode}`} 
          className="w-full h-full object-contain pointer-events-none select-none"
          referrerPolicy="no-referrer"
        />
      );
    }

    if (diagram.diagramType === 'vstrom_holders_406' || diagram.illustrationCode === 'FIG.406A') {
      return renderFig406AOfficialIllustration();
    }

    if (diagram.diagramType === 'vstrom_chassis_401' || diagram.illustrationCode === 'FIG.401A') {
      return renderFig401AOfficialIllustration();
    }

    if (diagram.diagramType === 'vstrom_stand_407') {
      return renderFig407AOfficialIllustration();
    }

    if (diagram.diagramType === 'vstrom_carrier_412') {
      return renderFig412AOfficialIllustration();
    }

    if (diagram.diagramType === 'vstrom_fuel_tank_420') {
      return renderFig420AOfficialIllustration();
    }

    // Default authentic technical illustration
    return renderFig401AOfficialIllustration();
  };

  // Authentic FIG.406A HOLDER Illustration (matching User's 2nd screenshot)
  const renderFig406AOfficialIllustration = () => (
    <svg viewBox="0 0 1000 800" className="w-full h-full select-none bg-white">
      {/* Background Watermarks as seen in screenshot */}
      <g opacity="0.04" fill="#000" fontSize="14" fontWeight="bold" fontFamily="sans-serif">
        <text x="50" y="80" transform="rotate(-18, 50, 80)">EDUARDO AUGUSTO DONATO</text>
        <text x="600" y="240" transform="rotate(-18, 600, 240)">EDUARDO AUGUSTO DONATO</text>
        <text x="180" y="440" transform="rotate(-18, 180, 440)">EDUARDO AUGUSTO DONATO</text>
        <text x="620" y="660" transform="rotate(-18, 620, 660)">EDUARDO AUGUSTO DONATO</text>
      </g>

      {/* Top Title: FIG.406A */}
      <text x="275" y="65" fill="#111827" fontSize="28" fontFamily="sans-serif" fontWeight="900" letterSpacing="0.5">
        FIG.406A
      </text>

      {/* Technical Line Artwork */}
      <g stroke="#111827" strokeWidth="1.6" fill="none" strokeLinecap="round" strokeLinejoin="round">
        
        {/* ======================================================== */}
        {/* PART 6 & 7: UPPER TANK / RELAY BRACKET (Topo Direito)    */}
        {/* ======================================================== */}
        {/* Upper Bracket Shell */}
        <path 
          d="M 575 250 Q 590 200 620 185 Q 650 170 675 190 Q 710 230 725 280 L 690 300 Q 660 260 635 250 L 590 270 Z" 
          fill="#f8fafc" 
          stroke="#111827" 
          strokeWidth="2.0" 
        />
        <circle cx="635" cy="225" r="18" stroke="#111827" strokeWidth="1.8" fill="none" />
        <circle cx="635" cy="225" r="8" stroke="#4b5563" strokeWidth="1.3" fill="none" />
        <ellipse cx="585" cy="255" rx="5" ry="3" fill="#111827" />
        <ellipse cx="700" cy="280" rx="5" ry="3" fill="#111827" />

        {/* Bolt 7 (Left) */}
        <path d="M 585 185 L 585 240" stroke="#4b5563" strokeWidth="1.2" strokeDasharray="3 2" />
        <rect x="580" y="170" width="10" height="12" rx="1" fill="#fff" stroke="#111827" strokeWidth="1.4" />
        <text x="586" y="152" fill="#111827" fontSize="16" fontFamily="sans-serif" fontWeight="900" textAnchor="middle">7</text>

        {/* Bolt 7 (Center) */}
        <path d="M 634 135 L 634 180" stroke="#4b5563" strokeWidth="1.2" strokeDasharray="3 2" />
        <rect x="629" y="125" width="10" height="12" rx="1" fill="#fff" stroke="#111827" strokeWidth="1.4" />
        <text x="634" y="112" fill="#111827" fontSize="16" fontFamily="sans-serif" fontWeight="900" textAnchor="middle">7</text>

        {/* Bolt 7 (Right) */}
        <path d="M 688 190 L 688 270" stroke="#4b5563" strokeWidth="1.2" strokeDasharray="3 2" />
        <rect x="683" y="180" width="10" height="12" rx="1" fill="#fff" stroke="#111827" strokeWidth="1.4" />
        <text x="688" y="165" fill="#111827" fontSize="16" fontFamily="sans-serif" fontWeight="900" textAnchor="middle">7</text>

        {/* Leader line to Item 6 */}
        <line x1="694" y1="315" x2="694" y2="285" stroke="#111827" strokeWidth="1.3" />
        <circle cx="694" cy="285" r="2" fill="#111827" />
        <text x="694" y="335" fill="#111827" fontSize="16" fontFamily="sans-serif" fontWeight="900" textAnchor="middle">6</text>


        {/* ======================================================== */}
        {/* PART 4 & 5 & 8: ELECTRICAL TRAY / HOLDER (Centro)         */}
        {/* ======================================================== */}
        {/* Main Center Plate */}
        <path 
          d="M 405 420 L 465 310 L 550 340 L 590 410 L 520 595 L 485 580 L 475 510 L 400 550 L 380 500 Z" 
          fill="#f8fafc" 
          stroke="#111827" 
          strokeWidth="2.2" 
        />
        {/* Inner ribbing & contours */}
        <path d="M 435 440 Q 480 430 520 460" stroke="#374151" strokeWidth="1.4" />
        <path d="M 450 400 L 480 390 L 490 420 L 460 430 Z" stroke="#374151" strokeWidth="1.3" />
        <circle cx="405" cy="535" r="6" stroke="#111827" strokeWidth="1.4" fill="none" />
        <circle cx="505" cy="570" r="6" stroke="#111827" strokeWidth="1.4" fill="none" />

        {/* Bolt 5 (Left) */}
        <path d="M 405 375 L 405 410" stroke="#4b5563" strokeWidth="1.2" strokeDasharray="3 2" />
        <rect x="400" y="370" width="10" height="12" rx="1" fill="#fff" stroke="#111827" strokeWidth="1.4" />
        <text x="405" y="358" fill="#111827" fontSize="16" fontFamily="sans-serif" fontWeight="900" textAnchor="middle">5</text>

        {/* Bolt 5 (Top) */}
        <path d="M 504 270 L 504 320" stroke="#4b5563" strokeWidth="1.2" strokeDasharray="3 2" />
        <rect x="499" y="265" width="10" height="12" rx="1" fill="#fff" stroke="#111827" strokeWidth="1.4" />
        <text x="504" y="252" fill="#111827" fontSize="16" fontFamily="sans-serif" fontWeight="900" textAnchor="middle">5</text>

        {/* Bolt 5 (Right) */}
        <path d="M 572 325 L 572 360" stroke="#4b5563" strokeWidth="1.2" strokeDasharray="3 2" />
        <rect x="567" y="320" width="10" height="12" rx="1" fill="#fff" stroke="#111827" strokeWidth="1.4" />
        <text x="572" y="308" fill="#111827" fontSize="16" fontFamily="sans-serif" fontWeight="900" textAnchor="middle">5</text>

        {/* Leader line to Item 4 */}
        <line x1="465" y1="290" x2="465" y2="310" stroke="#111827" strokeWidth="1.3" />
        <circle cx="465" cy="310" r="2" fill="#111827" />
        <text x="465" y="282" fill="#111827" fontSize="16" fontFamily="sans-serif" fontWeight="900" textAnchor="middle">4</text>

        {/* Bolt 8 (Middle pointing into bracket) */}
        <g transform="translate(605, 440)">
          <rect x="-6" y="-4" width="14" height="8" rx="1" fill="#fff" stroke="#111827" strokeWidth="1.3" />
          <line x1="8" y1="0" x2="22" y2="0" stroke="#4b5563" strokeWidth="1.2" />
          <text x="9" y="-20" fill="#111827" fontSize="16" fontFamily="sans-serif" fontWeight="900" stroke="none">8</text>
        </g>

        {/* VIEW A Pointer Arrow */}
        <g transform="translate(630, 480)">
          <polygon points="0,0 20,-10 14,0 20,10" fill="#111827" stroke="none" />
          <rect x="0" y="10" width="46" height="16" fill="#fff" stroke="#111827" strokeWidth="1.2" />
          <text x="23" y="22" fill="#111827" fontSize="10" fontFamily="sans-serif" fontWeight="900" textAnchor="middle" stroke="none">
            VIEW A
          </text>
        </g>


        {/* ======================================================== */}
        {/* PART 1, 2, 3: BATTERY TRAY & CUSHION (Base)               */}
        {/* ======================================================== */}
        {/* Battery Tray Housing */}
        <path 
          d="M 285 700 L 330 655 L 390 660 L 460 740 L 380 840 L 290 770 Z" 
          fill="#f8fafc" 
          stroke="#111827" 
          strokeWidth="2.2" 
        />
        {/* Inner ribs */}
        <path d="M 330 670 L 330 740" stroke="#374151" strokeWidth="1.4" />
        <path d="M 360 670 L 360 760" stroke="#374151" strokeWidth="1.4" />
        <path d="M 390 680 L 390 780" stroke="#374151" strokeWidth="1.4" />
        <path d="M 420 700 L 420 800" stroke="#374151" strokeWidth="1.4" />

        {/* Bolt 3 (Left) */}
        <path d="M 332 590 L 332 650" stroke="#4b5563" strokeWidth="1.2" strokeDasharray="3 2" />
        <circle cx="332" cy="605" r="7" fill="#fff" stroke="#111827" strokeWidth="1.4" />
        <text x="332" y="578" fill="#111827" fontSize="16" fontFamily="sans-serif" fontWeight="900" textAnchor="middle">3</text>

        {/* Bolt 3 (Right) */}
        <path d="M 460 660 L 460 720" stroke="#4b5563" strokeWidth="1.2" strokeDasharray="3 2" />
        <circle cx="460" cy="670" r="7" fill="#fff" stroke="#111827" strokeWidth="1.4" />
        <text x="460" y="648" fill="#111827" fontSize="16" fontFamily="sans-serif" fontWeight="900" textAnchor="middle">3</text>

        {/* Cushion 2 (Borracha / Amortecedor) */}
        <g transform="translate(288, 795)">
          <line x1="0" y1="0" x2="35" y2="-20" stroke="#4b5563" strokeWidth="1.2" strokeDasharray="3 2" />
          <polygon points="-12,-8 6,-14 12,4 -6,10" fill="#fff" stroke="#111827" strokeWidth="1.5" />
          <text x="0" y="32" fill="#111827" fontSize="16" fontFamily="sans-serif" fontWeight="900" textAnchor="middle" stroke="none">2</text>
        </g>

        {/* Leader line to Item 1 */}
        <line x1="452" y1="718" x2="452" y2="738" stroke="#111827" strokeWidth="1.3" />
        <circle cx="452" cy="738" r="2" fill="#111827" />
        <text x="452" y="708" fill="#111827" fontSize="16" fontFamily="sans-serif" fontWeight="900" textAnchor="middle">1</text>


        {/* ======================================================== */}
        {/* INSET BOX: VIEW A (Canto Inferior Direito)                */}
        {/* ======================================================== */}
        <g transform="translate(540, 690)">
          <rect x="0" y="0" width="180" height="150" fill="#fff" stroke="#111827" strokeWidth="1.4" />
          <path d="M 20 120 L 70 80 L 130 90 L 150 40 L 90 25 L 30 70 Z" fill="#f8fafc" stroke="#111827" strokeWidth="1.5" />
          <circle cx="140" cy="75" r="5" stroke="#111827" strokeWidth="1.3" fill="#fff" />
          <text x="142" y="105" fill="#111827" fontSize="14" fontFamily="sans-serif" fontWeight="900" stroke="none">8</text>
          
          <rect x="65" y="156" width="50" height="16" fill="#fff" stroke="#111827" strokeWidth="1.2" />
          <text x="90" y="168" fill="#111827" fontSize="11" fontFamily="sans-serif" fontWeight="900" textAnchor="middle" stroke="none">
            VIEW A
          </text>
        </g>


        {/* ======================================================== */}
        {/* FWD COMPASS & FOOTER CODES                               */}
        {/* ======================================================== */}
        <g transform="translate(305, 860)">
          <polygon points="0,0 36,-16 28,14 -8,30" fill="#111827" stroke="none" />
          <text x="14" y="10" fill="#fff" fontSize="12" fontFamily="sans-serif" fontWeight="900" transform="rotate(-24, 14, 10)" stroke="none">
            FWD
          </text>
        </g>

        <text x="275" y="945" fill="#111827" fontSize="12" fontFamily="monospace" fontWeight="bold" stroke="none">
          DL800M5_P37_406A
        </text>
        <text x="275" y="965" fill="#111827" fontSize="13" fontFamily="monospace" fontWeight="900" stroke="none">
          HOLDER
        </text>

      </g>
    </svg>
  );

  // Authentic FIG.401A FRAME Illustration (matching User's 1st screenshot)
  const renderFig401AOfficialIllustration = () => (
    <svg viewBox="0 0 1000 800" className="w-full h-full select-none bg-white">
      {/* Background Watermarks */}
      <g opacity="0.04" fill="#000" fontSize="14" fontWeight="bold" fontFamily="sans-serif">
        <text x="80" y="90" transform="rotate(-18, 80, 90)">EDUARDO AUGUSTO DONATO</text>
        <text x="640" y="220" transform="rotate(-18, 640, 220)">EDUARDO AUGUSTO DONATO</text>
        <text x="200" y="470" transform="rotate(-18, 200, 470)">EDUARDO AUGUSTO DONATO</text>
        <text x="620" y="710" transform="rotate(-18, 620, 710)">EDUARDO AUGUSTO DONATO</text>
      </g>

      {/* Top Title: FIG.401A */}
      <text x="280" y="65" fill="#111827" fontSize="28" fontFamily="sans-serif" fontWeight="900" letterSpacing="0.5">
        FIG.401A
      </text>

      <g stroke="#111827" strokeWidth="1.6" fill="none" strokeLinecap="round" strokeLinejoin="round">
        
        {/* ========================================================= */}
        {/* 1. FRONT MAIN FRAME COMP (Quadro Principal Dianteiro)     */}
        {/* ========================================================= */}
        {/* Steering Head Tube */}
        <g>
          <path d="M 320 540 L 345 575 L 335 585 L 310 550 Z" fill="#f8fafc" stroke="#111827" strokeWidth="2.2" />
          <ellipse cx="315" cy="545" rx="14" ry="7" fill="none" stroke="#111827" strokeWidth="1.8" />
          <ellipse cx="340" cy="580" rx="12" ry="6" fill="none" stroke="#4b5563" strokeWidth="1.4" />
        </g>

        {/* Upper Trellis Backbone Tubes */}
        <path 
          d="M 340 550 Q 410 535 490 575 L 495 595 Q 415 555 335 570 Z" 
          fill="#f8fafc" 
          stroke="#111827" 
          strokeWidth="2.2" 
        />
        {/* Lower Trellis Bridge Tubes */}
        <path 
          d="M 345 575 Q 420 570 495 610 L 490 625 Q 410 585 335 590 Z" 
          fill="none" 
          stroke="#111827" 
          strokeWidth="2.0" 
        />
        {/* Diagonal Trellis Truss Braces */}
        <path d="M 380 545 L 415 615 L 430 610 L 395 540 Z" fill="#f8fafc" stroke="#4b5563" strokeWidth="1.5" />
        <path d="M 435 553 L 465 625 L 480 620 L 450 557 Z" fill="#f8fafc" stroke="#4b5563" strokeWidth="1.5" />

        {/* Lower Engine Cradle / Downtubes */}
        <path 
          d="M 340 585 Q 365 650 400 700 Q 445 740 505 750 L 510 735 Q 455 725 415 690 Q 380 645 355 580 Z" 
          fill="#f8fafc" 
          stroke="#111827" 
          strokeWidth="2.2" 
        />
        <circle cx="400" cy="700" r="5" stroke="#4b5563" strokeWidth="1.5" fill="none" />

        {/* Center Pivot Plate */}
        <path 
          d="M 490 575 L 555 600 L 545 755 L 505 765 L 485 675 Z" 
          fill="#f8fafc" 
          stroke="#111827" 
          strokeWidth="2.2" 
        />
        {/* Swingarm Pivot */}
        <circle cx="515" cy="670" r="16" stroke="#111827" strokeWidth="2" fill="none" />
        <circle cx="515" cy="670" r="7" stroke="#4b5563" strokeWidth="1.5" fill="none" />
        <circle cx="525" cy="730" r="10" stroke="#111827" strokeWidth="1.8" fill="none" />
        <circle cx="535" cy="620" r="7" stroke="#111827" strokeWidth="1.6" fill="none" />

        {/* Leader line for #1 */}
        <line x1="395" y1="518" x2="395" y2="550" stroke="#111827" strokeWidth="1.4" />
        <circle cx="395" cy="550" r="2" fill="#111827" />
        <text x="395" y="508" fill="#111827" fontSize="17" fontFamily="sans-serif" fontWeight="900" textAnchor="middle" stroke="none">1</text>

        {/* ========================================================= */}
        {/* 2. REAR SUBFRAME (Subchassi Traseiro Treliçado)           */}
        {/* ========================================================= */}
        {/* Upper Subframe Rail */}
        <path 
          d="M 465 435 L 675 270 L 710 280 L 720 300 L 490 465 Z" 
          fill="#f8fafc" 
          stroke="#111827" 
          strokeWidth="2.2" 
        />
        {/* Lower Subframe Rail */}
        <path 
          d="M 450 525 L 690 310 L 675 295 L 435 510 Z" 
          fill="#f8fafc" 
          stroke="#111827" 
          strokeWidth="2.0" 
        />
        {/* Crossmember Braces */}
        <path d="M 545 370 L 565 430" stroke="#4b5563" strokeWidth="2.0" />
        <path d="M 610 320 L 630 380" stroke="#4b5563" strokeWidth="2.0" />
        <path d="M 660 280 L 690 320" stroke="#4b5563" strokeWidth="2.0" />
        
        {/* Subframe Mount Eyes */}
        <circle cx="465" cy="435" r="6" stroke="#111827" strokeWidth="2" fill="none" />
        <circle cx="450" cy="525" r="6" stroke="#111827" strokeWidth="2" fill="none" />
        <circle cx="510" cy="535" r="5" stroke="#4b5563" strokeWidth="1.5" fill="none" />

        {/* Leader line for #2 */}
        <line x1="522" y1="335" x2="522" y2="395" stroke="#111827" strokeWidth="1.4" />
        <circle cx="522" cy="395" r="2" fill="#111827" />
        <text x="522" y="325" fill="#111827" fontSize="17" fontFamily="sans-serif" fontWeight="900" textAnchor="middle" stroke="none">2</text>

        {/* ========================================================= */}
        {/* 3. SUBFRAME BOLTS (Parafusos de Fixação)                   */}
        {/* ========================================================= */}
        {/* Bolt 3 (Upper Left) */}
        <g transform="translate(440, 418)">
          <line x1="-15" y1="0" x2="35" y2="25" stroke="#6b7280" strokeWidth="1" strokeDasharray="3 2" />
          <rect x="-8" y="-4" width="16" height="8" rx="1" fill="#fff" stroke="#111827" strokeWidth="1.3" />
          <rect x="8" y="-2" width="10" height="4" fill="#111827" stroke="none" />
          <text x="-4" y="-8" fill="#111827" fontSize="16" fontFamily="sans-serif" fontWeight="900" stroke="none">3</text>
        </g>

        {/* Bolt 3 (Lower Left) */}
        <g transform="translate(442, 468)">
          <line x1="-15" y1="0" x2="35" y2="25" stroke="#6b7280" strokeWidth="1" strokeDasharray="3 2" />
          <rect x="-8" y="-4" width="16" height="8" rx="1" fill="#fff" stroke="#111827" strokeWidth="1.3" />
          <rect x="8" y="-2" width="10" height="4" fill="#111827" stroke="none" />
          <text x="-4" y="-8" fill="#111827" fontSize="16" fontFamily="sans-serif" fontWeight="900" stroke="none">3</text>
        </g>

        {/* Bolt 3 (Upper Right) */}
        <g transform="translate(522, 530)">
          <line x1="-10" y1="0" x2="30" y2="20" stroke="#6b7280" strokeWidth="1" strokeDasharray="3 2" />
          <rect x="-6" y="-3" width="14" height="6" rx="1" fill="#fff" stroke="#111827" strokeWidth="1.3" />
          <text x="0" y="20" fill="#111827" fontSize="16" fontFamily="sans-serif" fontWeight="900" stroke="none">3</text>
        </g>

        {/* Bolt 3 (Lower Right) */}
        <g transform="translate(564, 555)">
          <line x1="-10" y1="0" x2="30" y2="20" stroke="#6b7280" strokeWidth="1" strokeDasharray="3 2" />
          <rect x="-6" y="-3" width="14" height="6" rx="1" fill="#fff" stroke="#111827" strokeWidth="1.3" />
          <text x="0" y="20" fill="#111827" fontSize="16" fontFamily="sans-serif" fontWeight="900" stroke="none">3</text>
        </g>

        {/* ========================================================= */}
        {/* 4 & 5. SUBFRAME PLATES & 6. NUTS                          */}
        {/* ========================================================= */}
        {/* Left Plate (Ref 4) */}
        <g transform="translate(345, 478)">
          <polygon points="0,-12 18,6 -8,14" fill="#fff" stroke="#111827" strokeWidth="1.6" />
          <circle cx="2" cy="0" r="3" stroke="#111827" strokeWidth="1.2" fill="none" />
          <text x="0" y="-16" fill="#111827" fontSize="16" fontFamily="sans-serif" fontWeight="900" stroke="none">4</text>
        </g>

        {/* Left Nuts (Ref 6 & 6) */}
        <g transform="translate(310, 460)">
          <circle cx="0" cy="0" r="5" stroke="#111827" strokeWidth="1.5" fill="#fff" />
          <circle cx="0" cy="0" r="2.5" fill="#111827" stroke="none" />
          <text x="-4" y="-12" fill="#111827" fontSize="16" fontFamily="sans-serif" fontWeight="900" stroke="none">6</text>
        </g>
        <g transform="translate(320, 480)">
          <circle cx="0" cy="0" r="5" stroke="#111827" strokeWidth="1.5" fill="#fff" />
          <circle cx="0" cy="0" r="2.5" fill="#111827" stroke="none" />
          <text x="-2" y="-12" fill="#111827" fontSize="16" fontFamily="sans-serif" fontWeight="900" stroke="none">6</text>
        </g>

        {/* Right Plate (Ref 5) */}
        <g transform="translate(575, 655)">
          <polygon points="-12,-10 12,2 -4,14" fill="#fff" stroke="#111827" strokeWidth="1.6" />
          <circle cx="-1" cy="2" r="3" stroke="#111827" strokeWidth="1.2" fill="none" />
          <text x="0" y="-14" fill="#111827" fontSize="16" fontFamily="sans-serif" fontWeight="900" stroke="none">5</text>
        </g>

        {/* Right Nuts (Ref 6 & 6) */}
        <g transform="translate(608, 690)">
          <circle cx="0" cy="0" r="5" stroke="#111827" strokeWidth="1.5" fill="#fff" />
          <text x="10" y="4" fill="#111827" fontSize="16" fontFamily="sans-serif" fontWeight="900" stroke="none">6</text>
        </g>
        <g transform="translate(585, 725)">
          <circle cx="0" cy="0" r="5" stroke="#111827" strokeWidth="1.5" fill="#fff" />
          <text x="10" y="4" fill="#111827" fontSize="16" fontFamily="sans-serif" fontWeight="900" stroke="none">6</text>
        </g>

        {/* ========================================================= */}
        {/* 7, 8, 9. CHAIN GUIDE ROLLER ASSEMBLY                      */}
        {/* ========================================================= */}
        <line x1="390" y1="685" x2="480" y2="735" stroke="#6b7280" strokeWidth="1" strokeDasharray="3 2" />

        {/* Bolt 8 */}
        <g transform="translate(418, 735)">
          <rect x="-10" y="-3" width="18" height="6" fill="#fff" stroke="#111827" strokeWidth="1.2" />
          <rect x="-14" y="-5" width="4" height="10" rx="1" fill="#111827" stroke="none" />
          <text x="-5" y="20" fill="#111827" fontSize="16" fontFamily="sans-serif" fontWeight="900" stroke="none">8</text>
        </g>

        {/* Outer Spacer 9 */}
        <g transform="translate(432, 748)">
          <rect x="-4" y="-4" width="8" height="8" rx="1" fill="#fff" stroke="#111827" strokeWidth="1.2" />
          <text x="-4" y="22" fill="#111827" fontSize="16" fontFamily="sans-serif" fontWeight="900" stroke="none">9</text>
        </g>

        {/* Roller Cushion 7 */}
        <g transform="translate(446, 760)">
          <circle cx="0" cy="0" r="9" fill="#fff" stroke="#111827" strokeWidth="1.8" />
          <circle cx="0" cy="0" r="4" stroke="#4b5563" strokeWidth="1.2" fill="none" />
          <text x="-4" y="24" fill="#111827" fontSize="16" fontFamily="sans-serif" fontWeight="900" stroke="none">7</text>
        </g>

        {/* Inner Spacer 9 */}
        <g transform="translate(458, 772)">
          <rect x="-4" y="-4" width="8" height="8" rx="1" fill="#fff" stroke="#111827" strokeWidth="1.2" />
          <text x="0" y="24" fill="#111827" fontSize="16" fontFamily="sans-serif" fontWeight="900" stroke="none">9</text>
        </g>

        {/* ========================================================= */}
        {/* POINTER TO FIG. 496                                       */}
        {/* ========================================================= */}
        <g transform="translate(495, 535)">
          <polygon points="-8,0 8,0 8,8 14,8 0,22 -14,8 -8,8" fill="none" stroke="#111827" strokeWidth="1.5" />
          <text x="0" y="36" fill="#111827" fontSize="13" fontFamily="sans-serif" fontWeight="900" textAnchor="middle" stroke="none">
            FIG.496
          </text>
        </g>

        {/* ========================================================= */}
        {/* FWD COMPASS                                               */}
        {/* ========================================================= */}
        <g transform="translate(315, 865)">
          <polygon points="0,0 36,-16 28,14 -8,30" fill="#111827" stroke="none" />
          <text x="14" y="10" fill="#ffffff" fontSize="12" fontFamily="sans-serif" fontWeight="900" transform="rotate(-24, 14, 10)" stroke="none">
            FWD
          </text>
        </g>

        {/* ========================================================= */}
        {/* BOTTOM TITLE LEGEND                                       */}
        {/* ========================================================= */}
        <text x="280" y="945" fill="#111827" fontSize="12" fontFamily="monospace" fontWeight="bold" stroke="none">
          DL800M5_P37_401A
        </text>
        <text x="280" y="965" fill="#111827" fontSize="13" fontFamily="monospace" fontWeight="900" stroke="none">
          FRAME
        </text>

      </g>
    </svg>
  );

  const renderFig407AOfficialIllustration = () => (
    <svg viewBox="0 0 1000 800" className="w-full h-full select-none bg-white">
      <text x="280" y="65" fill="#111827" fontSize="28" fontFamily="sans-serif" fontWeight="900">FIG.407A</text>
      <g stroke="#111827" strokeWidth="1.6" fill="none" strokeLinecap="round" strokeLinejoin="round">
        <path d="M 450 320 L 380 600 L 340 615 L 325 635 L 400 620 L 475 330 Z" fill="#f8fafc" stroke="#111827" strokeWidth="2.2" />
        <circle cx="460" cy="325" r="18" stroke="#111827" strokeWidth="2.2" fill="#f8fafc" />
        <circle cx="460" cy="325" r="7" stroke="#4b5563" strokeWidth="1.5" fill="none" />
        <text x="280" y="770" fill="#111827" fontSize="12" fontFamily="monospace" fontWeight="bold" stroke="none">DL800M5_P37_407A</text>
        <text x="280" y="788" fill="#111827" fontSize="13" fontFamily="monospace" fontWeight="900" stroke="none">STAND</text>
      </g>
    </svg>
  );

  const renderFig412AOfficialIllustration = () => (
    <svg viewBox="0 0 1000 800" className="w-full h-full select-none bg-white">
      <text x="280" y="65" fill="#111827" fontSize="28" fontFamily="sans-serif" fontWeight="900">FIG.412A</text>
      <g stroke="#111827" strokeWidth="1.6" fill="none" strokeLinecap="round" strokeLinejoin="round">
        <path d="M 320 350 L 650 350 L 610 470 L 360 470 Z" fill="#f8fafc" stroke="#111827" strokeWidth="2.2" />
        <text x="280" y="770" fill="#111827" fontSize="12" fontFamily="monospace" fontWeight="bold" stroke="none">DL800M5_P37_412A</text>
        <text x="280" y="788" fill="#111827" fontSize="13" fontFamily="monospace" fontWeight="900" stroke="none">CARRIER</text>
      </g>
    </svg>
  );

  const renderFig420AOfficialIllustration = () => (
    <svg viewBox="0 0 1000 800" className="w-full h-full select-none bg-white">
      <text x="280" y="65" fill="#111827" fontSize="28" fontFamily="sans-serif" fontWeight="900">FIG.420A</text>
      <g stroke="#111827" strokeWidth="1.6" fill="none" strokeLinecap="round" strokeLinejoin="round">
        <path d="M 300 420 Q 360 260 520 280 Q 670 330 650 470 Q 580 570 390 530 Q 310 520 300 420 Z" fill="#f8fafc" stroke="#111827" strokeWidth="2.2" />
        <text x="280" y="770" fill="#111827" fontSize="12" fontFamily="monospace" fontWeight="bold" stroke="none">DL800M5_P37_420A</text>
        <text x="280" y="788" fill="#111827" fontSize="13" fontFamily="monospace" fontWeight="900" stroke="none">FUEL TANK</text>
      </g>
    </svg>
  );

  // Render clickable hotspot links directly positioned over the original numbers in the PNG
  const renderHotspots = () => {
    // Track which refs have already rendered a popover in selected state
    // so we only show 1 popover per ref even if multiple hotspots share the same ref
    const selectedPopoverRendered = new Set<number>();

    return (
    <>
      {activeHotspots.map((hotspot, idx) => {
        const hotspotKey = hotspot.id || `hs-${hotspot.ref}-${idx}`;
        const isSelected = selectedRef === hotspot.ref;
        const isHovered = hoveredRef === hotspot.ref;
        const isCalibrationTarget = isCalibratingPins && selectedHotspotIdForCalibration === hotspotKey;
        // Only THIS specific hotspot is considered actively hovered for the popover
        const isThisHotspotHovered = hoveredHotspotId === hotspotKey;
        const isMarked = markedRefs.has(hotspot.ref);
        const matchingPart = diagram.parts.find(p => p.ref === hotspot.ref);

        // For selection, only render popover on the FIRST hotspot with this ref
        const canShowSelectedPopover = isSelected && !selectedPopoverRendered.has(hotspot.ref);
        if (canShowSelectedPopover) selectedPopoverRendered.add(hotspot.ref);

        // Popover shows ONLY when THIS exact hotspot is hovered, or for the first occurrence of a selected ref
        const shouldShowPopover = !isCalibratingPins && (isThisHotspotHovered || canShowSelectedPopover) && !!matchingPart;

        return (
          <div
            key={hotspotKey}
            style={{
              left: `${hotspot.x}%`,
              top: `${hotspot.y}%`
            }}
            onClick={(e) => {
              e.stopPropagation();
              if (isCalibratingPins) {
                setSelectedHotspotIdForCalibration(hotspotKey);
              } else {
                if (selectedRef === hotspot.ref) {
                  onSelectRef(null);
                } else {
                  onSelectRef(hotspot.ref);
                }
              }
            }}
            onMouseEnter={() => {
              onHoverRef(hotspot.ref);
              setHoveredHotspotId(hotspotKey);
            }}
            onMouseLeave={() => {
              onHoverRef(null);
              setHoveredHotspotId(null);
            }}
            className={`absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer select-none group ${
              isCalibrationTarget ? 'z-40' : 'z-20'
            }`}
          >
            {/* Interactive Target positioned directly over the PNG Number */}
            {hotspotStyle === 'ring' ? (
              // Subtle semi-transparent ring that lights up on hover/selection
              <div className={`
                w-6 h-6 sm:w-7 sm:h-7 rounded-full flex items-center justify-center font-bold text-xs font-mono
                transition-all duration-150 relative
                ${isCalibrationTarget
                  ? 'bg-red-600 text-white font-black scale-135 ring-4 ring-amber-300 shadow-xl shadow-red-600/60 animate-pulse'
                  : isSelected
                  ? 'bg-amber-400 text-black font-black scale-125 shadow-lg shadow-amber-400/50 ring-4 ring-amber-400/40 z-30'
                  : isMarked
                  ? 'bg-emerald-500 text-white font-bold scale-115 ring-2 ring-emerald-400 shadow-md'
                  : isHovered
                  ? 'bg-blue-600 text-white font-bold scale-120 ring-3 ring-blue-400/60 shadow-md z-20'
                  : 'bg-amber-400/25 border-2 border-amber-500/80 text-neutral-900 hover:bg-amber-400 hover:text-black hover:scale-115'
                }
              `}>
                <span>{hotspot.ref}</span>
                {isSelected && (
                  <span className="absolute -inset-1 rounded-full border-2 border-amber-400 animate-ping opacity-60 pointer-events-none" />
                )}
              </div>
            ) : hotspotStyle === 'badge' ? (
              // Solid high-contrast EPC Pin Badge
              <div className={`
                w-6 h-6 sm:w-7 sm:h-7 rounded-full flex items-center justify-center font-black text-xs font-mono
                transition-all duration-150 shadow-md relative
                ${isCalibrationTarget
                  ? 'bg-red-600 text-white font-black scale-135 ring-4 ring-amber-300 shadow-xl shadow-red-600/60 animate-pulse'
                  : isSelected
                  ? 'bg-amber-400 text-black scale-130 ring-4 ring-amber-400/60 shadow-amber-500/50 z-30'
                  : isMarked
                  ? 'bg-emerald-500 text-white scale-115 ring-2 ring-emerald-400'
                  : isHovered
                  ? 'bg-blue-600 text-white scale-125 ring-3 ring-blue-400/60 z-20'
                  : 'bg-neutral-900 border-2 border-white text-white hover:bg-amber-400 hover:text-black hover:border-amber-500 hover:scale-115'
                }
              `}>
                <span>{hotspot.ref}</span>
              </div>
            ) : (
              // Stealth Mode: Invisible click target over the PNG number, highlights on hover
              <div className={`
                w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs font-mono transition-all
                ${isCalibrationTarget
                  ? 'bg-red-600 text-white font-black scale-135 ring-4 ring-amber-300 shadow-xl shadow-red-600/60 animate-pulse'
                  : isSelected
                  ? 'bg-amber-400/90 text-black font-black scale-125 ring-3 ring-amber-400'
                  : isMarked
                  ? 'bg-emerald-500/90 text-white ring-2 ring-emerald-400'
                  : isHovered
                  ? 'bg-blue-600/85 text-white scale-120'
                  : 'bg-transparent hover:bg-amber-400/50 text-transparent hover:text-black border border-transparent hover:border-amber-500'
                }
              `}>
                {(isCalibrationTarget || isSelected || isHovered || isMarked) && <span>{hotspot.ref}</span>}
              </div>
            )}

            {/* Rich Hover / Selection Details Popover with direct Purchase Action */}
            {/* shouldShowPopover ensures only 1 card appears per ref, even with multiple hotspot positions */}
            {shouldShowPopover && (
              <div 
                onClick={(e) => e.stopPropagation()}
                className="absolute left-1/2 bottom-full mb-2 -translate-x-1/2 bg-neutral-950/95 border border-neutral-700 text-white text-xs rounded-2xl p-4 whitespace-nowrap shadow-2xl z-40 pointer-events-auto backdrop-blur-md animate-in fade-in zoom-in-95 duration-150 min-w-[280px]"
              >
                {/* Popover Header */}
                <div className="flex items-center justify-between gap-2 border-b border-neutral-800 pb-2 mb-2">
                  <div className="flex items-center gap-1.5 font-bold font-mono text-amber-400">
                    <span className="bg-amber-400 text-black px-1.5 py-0.5 rounded text-[11px] font-black">
                      Ref #{matchingPart.ref}
                    </span>
                    <span className="text-neutral-400">•</span>
                    <span className="tracking-wide text-white">{matchingPart.partNumber}</span>
                  </div>
                  <span className="text-[10px] text-neutral-400 font-mono bg-neutral-900 px-2 py-0.5 rounded">
                    UN: {matchingPart.unitQuantity} un.
                  </span>
                </div>

                {/* Part Description */}
                <div className="text-xs font-bold text-white truncate max-w-[260px] mb-0.5">
                  {matchingPart.description}
                </div>
                {matchingPart.subDescription && (
                  <div className="text-[11px] text-neutral-400 truncate max-w-[260px] mb-2.5">
                    {matchingPart.subDescription}
                  </div>
                )}

                {/* Pricing & Stock Card */}
                <div className="bg-neutral-900/90 rounded-xl p-2.5 border border-neutral-800 mb-3 space-y-1">
                  <div className="flex items-center justify-between text-[11px] font-mono">
                    <span className="text-neutral-400">Custo Fábrica:</span>
                    <span className="text-emerald-400 font-bold text-xs">
                      R$ {matchingPart.factoryPrice.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[10px] font-mono text-neutral-400">
                    <span>Preço Público (PPS):</span>
                    <span>R$ {matchingPart.msrpPrice.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                  </div>
                  <div className="flex items-center justify-between text-[10px] font-mono pt-1 border-t border-neutral-800 mt-1">
                    <span className="text-neutral-400">Estoque Disponível:</span>
                    <span className="text-emerald-400 font-bold">
                      {matchingPart.stockJundiai} un. CD-SP / {matchingPart.stockManaus} un. Manaus
                    </span>
                  </div>
                </div>

                {/* Actions: Mark for Purchase or Instant Add */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={(e) => toggleMarkRef(matchingPart.ref, e)}
                    className={`px-2.5 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-1 transition-colors ${
                      isMarked 
                        ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400'
                        : 'bg-neutral-900 border-neutral-700 text-neutral-300 hover:bg-neutral-800'
                    }`}
                    title="Marcar para compra em lote"
                  >
                    {isMarked ? <CheckSquare className="w-3.5 h-3.5 text-emerald-400" /> : <Square className="w-3.5 h-3.5" />}
                    <span>Marcar</span>
                  </button>

                  <button
                    onClick={(e) => handleQuickAdd(matchingPart.id, 1, e)}
                    className={`flex-1 py-1.5 px-3 rounded-xl font-black text-xs flex items-center justify-center gap-1.5 transition-all shadow-md ${
                      addedPartId === matchingPart.id
                        ? 'bg-emerald-500 text-white'
                        : 'bg-amber-400 hover:bg-amber-300 text-black font-extrabold shadow-amber-500/20'
                    }`}
                  >
                    {addedPartId === matchingPart.id ? (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>Adicionado!</span>
                      </>
                    ) : (
                      <>
                        <ShoppingCart className="w-3.5 h-3.5" />
                        <span>+ Comprar Peça</span>
                      </>
                    )}
                  </button>
                </div>

              </div>
            )}
          </div>
        );
      })}
    </>
    );
  };

  return (
    <>
      <div 
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={`flex flex-col h-full bg-white rounded-2xl overflow-hidden shadow-inner relative select-none border border-neutral-300 transition-colors ${
          isDragOver ? 'ring-4 ring-amber-400 ring-offset-2' : ''
        }`}
      >
        
        {/* Hidden File Input for Custom PNG */}
        <input 
          type="file" 
          ref={fileInputRef} 
          accept="image/png,image/jpeg,image/webp" 
          className="hidden" 
          onChange={(e) => {
            if (e.target.files && e.target.files.length > 0) {
              handleFileUpload(e.target.files[0]);
            }
          }}
        />

        {/* Top EPC Action Bar */}
        <div className="p-3 bg-neutral-100/90 border-b border-neutral-200 flex flex-wrap items-center justify-between gap-2 z-10 text-neutral-900">
          
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-mono font-bold bg-white border border-neutral-300 text-blue-700 shadow-sm">
              <Layers className="w-3.5 h-3.5" />
              <span>{diagram.illustrationCode}</span>
            </div>
            <span className="text-xs font-bold text-neutral-800 hidden sm:inline truncate max-w-[260px]">
              {diagram.title}
            </span>
          </div>

          {/* Controls: Hotspot Style, Custom PNG, Zoom Presets, Reset, Fullscreen */}
          <div className="flex items-center gap-1.5">
            
            {/* Custom PNG Upload Action with Persistence indicator */}
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={isSavingImage}
              className={`p-1.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-all shadow-sm ${
                isPersistedImage
                  ? 'border-emerald-300 bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
                  : 'border-neutral-300 bg-white text-neutral-700 hover:bg-neutral-50'
              }`}
              title="Carregar / Fixar arquivo PNG do Catálogo permanentemente neste diagrama"
            >
              {isSavingImage ? (
                <>
                  <Save className="w-3.5 h-3.5 animate-spin text-amber-600" />
                  <span className="text-[11px]">Salvando...</span>
                </>
              ) : isPersistedImage ? (
                <>
                  <Pin className="w-3.5 h-3.5 text-emerald-600 fill-emerald-600" />
                  <span className="text-[11px] font-bold hidden sm:inline text-emerald-700">PNG Fixo Salvo</span>
                </>
              ) : (
                <>
                  <Upload className="w-3.5 h-3.5 text-blue-600" />
                  <span className="text-[11px] hidden md:inline">Inserir PNG Fixo</span>
                </>
              )}
            </button>

            {isPersistedImage && (
              <button
                onClick={handleRemoveCustomImage}
                className="p-1.5 rounded-xl border border-neutral-300 bg-white text-neutral-500 hover:text-rose-600 hover:bg-rose-50 text-xs transition-colors"
                title="Remover PNG salvo e restaurar padrão"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}

            {/* Hotspot Style Selector */}
            <div className="flex items-center p-0.5 rounded-xl border border-neutral-300 bg-white text-xs font-mono text-neutral-700 shadow-sm">
              <button
                onClick={() => setHotspotStyle('ring')}
                className={`px-2 py-1 rounded-lg transition-colors font-bold ${
                  hotspotStyle === 'ring' ? 'bg-amber-400 text-black shadow-sm' : 'hover:bg-neutral-100 text-neutral-600'
                }`}
                title="Modo Anéis sobre os Números"
              >
                Anéis
              </button>
              <button
                onClick={() => setHotspotStyle('badge')}
                className={`px-2 py-1 rounded-lg transition-colors font-bold ${
                  hotspotStyle === 'badge' ? 'bg-amber-400 text-black shadow-sm' : 'hover:bg-neutral-100 text-neutral-600'
                }`}
                title="Modo Badges Cheios"
              >
                Badges
              </button>
              <button
                onClick={() => setHotspotStyle('stealth')}
                className={`px-2 py-1 rounded-lg transition-colors font-bold ${
                  hotspotStyle === 'stealth' ? 'bg-amber-400 text-black shadow-sm' : 'hover:bg-neutral-100 text-neutral-600'
                }`}
                title="Modo Alvo Direto no PNG"
              >
                Alvo
              </button>
            </div>

            {/* Zoom Presets: 50%, 100%, 150%, 200% */}
            <div className="flex items-center p-0.5 rounded-xl border border-neutral-300 bg-white text-xs font-mono text-neutral-700 shadow-sm">
              <button
                onClick={() => handleSetZoom(0.5)}
                className={`px-2 py-1 rounded-lg transition-colors font-bold ${
                  zoom === 0.5 ? 'bg-amber-400 text-black shadow-sm' : 'hover:bg-neutral-100 text-neutral-600'
                }`}
                title="Zoom 50% (Ajustar à Caixa)"
              >
                50%
              </button>
              <button
                onClick={() => handleSetZoom(1.0)}
                className={`px-2 py-1 rounded-lg transition-colors font-bold ${
                  zoom === 1.0 ? 'bg-amber-400 text-black shadow-sm' : 'hover:bg-neutral-100 text-neutral-600'
                }`}
                title="Zoom 100%"
              >
                100%
              </button>
              <button
                onClick={() => handleSetZoom(1.5)}
                className={`px-2 py-1 rounded-lg transition-colors font-bold ${
                  zoom === 1.5 ? 'bg-amber-400 text-black shadow-sm' : 'hover:bg-neutral-100 text-neutral-600'
                }`}
                title="Zoom 150%"
              >
                150%
              </button>
              <button
                onClick={() => handleSetZoom(2.0)}
                className={`px-2 py-1 rounded-lg transition-colors font-bold ${
                  zoom === 2.0 ? 'bg-amber-400 text-black shadow-sm' : 'hover:bg-neutral-100 text-neutral-600'
                }`}
                title="Zoom 200%"
              >
                200%
              </button>
            </div>

            {/* Fine Step Zoom & Fullscreen */}
            <div className="flex items-center gap-0.5 p-0.5 rounded-xl border border-neutral-300 bg-white text-neutral-700 shadow-sm">
              <button
                onClick={handleZoomIn}
                className="p-1.5 hover:bg-neutral-100 rounded-lg transition-colors"
                title="Aumentar Zoom (+)"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={handleZoomOut}
                className="p-1.5 hover:bg-neutral-100 rounded-lg transition-colors"
                title="Diminuir Zoom (-)"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={handleResetZoom}
                className="p-1.5 hover:bg-neutral-100 rounded-lg transition-colors"
                title="Centralizar Esquema"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setIsFullscreenModalOpen(true)}
                className="p-1.5 bg-amber-400 hover:bg-amber-300 text-black rounded-lg transition-colors shadow-sm ml-0.5"
                title="Expandir Diagrama em Tela Cheia"
              >
                <Maximize2 className="w-3.5 h-3.5" />
              </button>

              {/* Pin Calibrator Action Button */}
              <button
                onClick={() => setIsCalibratingPins(!isCalibratingPins)}
                className={`p-1.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-all shadow-sm ${
                  isCalibratingPins
                    ? 'border-red-500 bg-red-600 text-white font-bold shadow-red-600/30'
                    : 'border-neutral-300 bg-white text-neutral-800 hover:bg-neutral-50'
                }`}
                title="Ajustar e posicionar pinos de numeração sobre os números originais da figura"
              >
                <Crosshair className="w-3.5 h-3.5" />
                <span className="text-[11px] hidden lg:inline">Ajustar Pinos</span>
              </button>
            </div>

          </div>
        </div>

        {/* Hotspot Pin Calibration Bar */}
        {isCalibratingPins && (
          <div className="p-3 bg-red-600 text-white border-b border-red-700 flex flex-wrap items-center justify-between gap-3 text-xs z-10 shadow-md">
            <div className="flex items-center gap-2">
              <Crosshair className="w-4 h-4 animate-pulse shrink-0 text-amber-300" />
              <span className="font-bold">Modo Ajuste de Pinos Ativo:</span>
              <span className="hidden sm:inline">Clique no local da imagem para posicionar a Ref:</span>
              <select
                value={selectedHotspotIdForCalibration || (activeHotspots[0]?.id || '')}
                onChange={(e) => setSelectedHotspotIdForCalibration(e.target.value)}
                className="bg-neutral-900 text-amber-400 font-bold font-mono px-2.5 py-1 rounded-lg border border-neutral-700 outline-none cursor-pointer text-xs"
              >
                {activeHotspots.map((h, i) => {
                  const hKey = h.id || `hs-${h.ref}-${i}`;
                  const sameRefHotspots = activeHotspots.filter(item => item.ref === h.ref);
                  const instIndex = sameRefHotspots.findIndex((item, idx) => (item.id || `hs-${item.ref}-${idx}`) === hKey) + 1;
                  const multiTag = sameRefHotspots.length > 1 ? ` (Pino ${instIndex}/${sameRefHotspots.length})` : '';
                  const partDesc = diagram.parts.find(p => p.ref === h.ref)?.description || '';

                  return (
                    <option key={hKey} value={hKey}>
                      Ref #{h.ref}{multiTag} - {partDesc.substring(0, 24)} [{h.x}%, {h.y}%]
                    </option>
                  );
                })}
              </select>

              <button
                onClick={handleAddDuplicatePin}
                className="px-2.5 py-1 bg-neutral-900 hover:bg-neutral-800 text-amber-400 font-bold rounded-lg transition border border-neutral-700 text-xs flex items-center gap-1"
                title="Adicionar outro pino para o mesmo número nesta figura"
              >
                <Pin className="w-3.5 h-3.5" />
                <span>+ Duplicar Pino</span>
              </button>

              <button
                onClick={handleDeleteHotspotPin}
                className="px-2 py-1 bg-red-900 hover:bg-red-950 text-white rounded-lg transition text-xs flex items-center gap-1 border border-red-700"
                title="Excluir este pino selecionado"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Excluir</span>
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleAutoDetectHotspots}
                disabled={isDetecting}
                className="px-3 py-1 bg-amber-400 hover:bg-amber-300 text-black font-bold rounded-lg transition shadow flex items-center gap-1.5 disabled:opacity-50"
                title="Analisar pixels da figura e posicionar pinos sobre as numerações automaticamente"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>{isDetecting ? 'Analisando Imagem...' : 'Auto-Detectar (Visão)'}</span>
              </button>

              <button
                onClick={handleSaveHotspots}
                className="px-3 py-1 bg-emerald-500 hover:bg-emerald-400 text-black font-bold rounded-lg transition shadow flex items-center gap-1"
              >
                <Save className="w-3.5 h-3.5" />
                {savedFeedback ? 'Salvo!' : 'Salvar Posições'}
              </button>

              <button
                onClick={handleCopyHotspotsJSON}
                className="px-3 py-1 bg-neutral-900 hover:bg-neutral-800 text-white font-bold rounded-lg transition shadow flex items-center gap-1"
              >
                <Eye className="w-3.5 h-3.5 text-amber-400" />
                {copiedFeedback ? 'Copiado!' : 'Copiar JSON'}
              </button>

              <button
                onClick={handleResetHotspots}
                className="px-2.5 py-1 bg-red-800 hover:bg-red-900 text-white rounded-lg transition text-[11px]"
                title="Restaurar posições originais"
              >
                Restaurar Padrão
              </button>
            </div>
          </div>
        )}

        {/* Bulk marked items bar if any item marked */}
        {markedRefs.size > 0 && (
          <div className="bg-amber-400 text-black px-4 py-2 flex items-center justify-between text-xs font-bold z-10 shadow-md">
            <div className="flex items-center gap-2">
              <CheckSquare className="w-4 h-4" />
              <span>{markedRefs.size} peça(s) marcada(s) no diagrama</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setMarkedRefs(new Set())}
                className="px-2 py-1 bg-black/10 hover:bg-black/20 rounded-lg transition-colors text-[11px]"
              >
                Desmarcar Todas
              </button>
              <button
                onClick={handleBuyMarkedItems}
                className="px-3 py-1 bg-black text-white hover:bg-neutral-800 rounded-lg transition-colors flex items-center gap-1.5 shadow-sm"
              >
                <ShoppingCart className="w-3.5 h-3.5 text-amber-400" />
                <span>Adicionar ao Pedido</span>
              </button>
            </div>
          </div>
        )}

        {/* Main Diagram Canvas with Image & Hotspots */}
        <div 
          ref={containerRef}
          onClick={handleDiagramClickForCalibration}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          className={`flex-1 relative overflow-hidden flex items-center justify-center p-2 max-h-[68vh] min-h-[420px] bg-white ${
            isCalibratingPins ? 'cursor-crosshair ring-2 ring-red-500 ring-inset' : isDragging ? 'cursor-grabbing' : 'cursor-grab'
          }`}
        >
          {/* Scalable & Draggable Canvas Content */}
          <div 
            style={{
              transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
              transformOrigin: 'center center',
              transition: isDragging ? 'none' : 'transform 0.15s ease-out'
            }}
            className="w-full max-w-[850px] aspect-[480/797] relative bg-white"
          >
            {/* The Direct PNG / Technical Diagram Image */}
            <div className="w-full h-full relative">
              {renderDiagramImage()}
            </div>

            {/* Clickable Hotspots Placed Right on Top of the Diagram Numbers */}
            {renderHotspots()}
          </div>

          {/* Floating Instructions Pill and Success Notice */}
          <div className="absolute bottom-3 left-3 flex flex-col gap-1.5 pointer-events-none z-30">
            {imageSaveSuccess && (
              <div className="rounded-xl px-3.5 py-2 text-xs flex items-center gap-2 bg-emerald-600 text-white shadow-xl font-bold animate-in fade-in slide-in-from-bottom-2">
                <Check className="w-4 h-4 text-emerald-200" />
                <span>Imagem PNG salva e fixada com sucesso para {diagram.illustrationCode}!</span>
              </div>
            )}

            <div className="rounded-xl px-3 py-1.5 text-[11px] flex items-center gap-2 backdrop-blur-sm shadow-md border bg-white/95 border-neutral-300 text-neutral-800">
              <Crosshair className="w-3.5 h-3.5 text-amber-500 shrink-0" />
              <span>Clique nos números sobre a figura para ver dados técnicos e marcar para compra</span>
            </div>
          </div>

          {isDragOver && (
            <div className="absolute inset-0 bg-amber-400/20 backdrop-blur-xs border-2 border-dashed border-amber-500 flex items-center justify-center rounded-2xl z-30 pointer-events-none">
              <div className="bg-white/95 text-neutral-900 px-6 py-3 rounded-2xl shadow-xl font-bold flex items-center gap-2">
                <Upload className="w-5 h-5 text-amber-500" />
                <span>Solte a imagem PNG do diagrama aqui</span>
              </div>
            </div>
          )}
        </div>

      </div>

      {/* FULLSCREEN EXPANDED MODAL (Matching User's Screenshot FIG.401A / FIG.406A) */}
      {isFullscreenModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex flex-col p-3 sm:p-5 animate-in fade-in duration-200">
          
          {/* Modal Header */}
          <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
            <div>
              <span className="text-xs font-mono font-bold text-amber-400 uppercase tracking-widest">
                EPC SUZUKI • {modelName}
              </span>
              <h2 className="text-base sm:text-lg font-bold text-white">
                Diagrama explodido {modelName} - {diagram.illustrationCode.toLowerCase().replace('.', '')}
              </h2>
            </div>

            <div className="flex items-center gap-2">
              {/* Zoom Buttons in Modal */}
              <div className="flex items-center bg-neutral-900 p-0.5 rounded-xl border border-neutral-800 text-neutral-300 text-xs font-mono">
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
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white hover:bg-neutral-100 text-black font-bold text-xs transition-colors shadow-lg"
              >
                <X className="w-4 h-4" />
                <span>✕ Fechar</span>
              </button>
            </div>
          </div>

          {/* Modal Canvas */}
          <div className="flex-1 relative overflow-hidden border border-neutral-300 rounded-2xl mt-3 flex items-center justify-center p-4 bg-white">
            <div 
              style={{
                transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
                transformOrigin: 'center center',
                transition: isDragging ? 'none' : 'transform 0.15s ease-out'
              }}
              className="w-full max-w-[900px] aspect-[480/797] relative bg-white rounded-xl overflow-hidden shadow-2xl"
            >
              <div className="w-full h-full relative">
                {renderDiagramImage()}
              </div>
              {renderHotspots()}
            </div>
          </div>

        </div>
      )}
    </>
  );
};
