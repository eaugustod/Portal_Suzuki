import React, { useRef } from 'react';
import { ChevronLeft, ChevronRight, Layers, FileText } from 'lucide-react';
import { PartsDiagramGroup } from '../../types';

interface PartsDiagramCarouselProps {
  diagrams: PartsDiagramGroup[];
  selectedDiagramId: string;
  onSelectDiagram: (diagram: PartsDiagramGroup) => void;
}

export const PartsDiagramCarousel: React.FC<PartsDiagramCarouselProps> = ({
  diagrams,
  selectedDiagramId,
  onSelectDiagram
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  const handleScroll = (direction: 'left' | 'right') => {
    if (!scrollRef.current) return;
    const offset = direction === 'left' ? -260 : 260;
    scrollRef.current.scrollBy({ left: offset, behavior: 'smooth' });
  };

  return (
    <div className="bg-[#121215] border border-[#27272a] rounded-2xl p-3 sm:p-4 shadow-lg select-none">
      <div className="flex items-center justify-between mb-2.5 px-1">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-amber-400" />
          <span className="text-xs uppercase font-bold text-neutral-300 tracking-wider">
            Galeria de Ilustrações Técnicas do Modelo (EPC)
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => handleScroll('left')}
            className="w-7 h-7 rounded-lg bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 text-neutral-300 hover:text-white flex items-center justify-center transition-colors"
            title="Anterior"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleScroll('right')}
            className="w-7 h-7 rounded-lg bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 text-neutral-300 hover:text-white flex items-center justify-center transition-colors"
            title="Próximo"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Horizontal Filmstrip / Strip of Technical Illustrations */}
      <div 
        ref={scrollRef}
        className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-neutral-800 scrollbar-track-transparent"
      >
        {diagrams.map((diagram) => {
          const isSelected = selectedDiagramId === diagram.id;

          return (
            <div
              key={diagram.id}
              onClick={() => onSelectDiagram(diagram)}
              className={`
                min-w-[150px] sm:min-w-[170px] max-w-[170px] bg-[#18181b] rounded-xl border p-2.5 flex flex-col cursor-pointer transition-all duration-200 group shrink-0
                ${isSelected
                  ? 'border-amber-400 bg-amber-950/20 ring-2 ring-amber-400/30 scale-[1.02] shadow-lg shadow-amber-950/40'
                  : 'border-neutral-800 hover:border-neutral-600 hover:bg-neutral-900/80'
                }
              `}
            >
              {/* Technical Drawing Thumbnail Mockup */}
              <div className="aspect-[4/3] rounded-lg bg-[#0d0d10] border border-neutral-800 overflow-hidden flex items-center justify-center relative p-2 mb-2 group-hover:border-neutral-700">
                {/* SVG Mini exploded sketch */}
                <svg viewBox="0 0 100 80" className="w-full h-full text-neutral-600 group-hover:text-neutral-400 transition-colors">
                  <ellipse cx="40" cy="40" rx="20" ry="25" fill="none" stroke="currentColor" strokeWidth="2" />
                  <ellipse cx="60" cy="40" rx="15" ry="20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeDasharray="3 2" />
                  <line x1="20" y1="40" x2="80" y2="40" stroke="#eab308" strokeWidth="1" strokeDasharray="2 2" />
                  <circle cx="35" cy="30" r="3" fill="#eab308" />
                  <circle cx="65" cy="48" r="3" fill="#eab308" />
                </svg>

                {/* Illustration Code Badge */}
                <span className={`
                  absolute bottom-1 right-1 text-[10px] font-mono font-bold px-1.5 py-0.5 rounded
                  ${isSelected ? 'bg-amber-400 text-black' : 'bg-neutral-900 text-neutral-300 border border-neutral-700'}
                `}>
                  {diagram.illustrationCode}
                </span>
              </div>

              {/* Title & Stats */}
              <div className="min-w-0">
                <span className="text-[11px] font-bold text-white block truncate group-hover:text-amber-300 transition-colors">
                  {diagram.title}
                </span>
                <span className="text-[10px] text-neutral-400 block truncate">
                  {diagram.parts.length} peças catalogadas
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
