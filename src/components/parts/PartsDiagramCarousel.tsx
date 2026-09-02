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
    <div className="bg-white dark:bg-[#121215] border border-neutral-200 dark:border-[#27272a] rounded-2xl p-3 sm:p-4 shadow-lg select-none">
      <div className="flex items-center justify-between mb-2.5 px-1">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-amber-600 dark:text-amber-400" />
          <span className="text-xs uppercase font-bold text-neutral-700 dark:text-neutral-300 tracking-wider">
            Galeria de Ilustrações Técnicas do Modelo (EPC)
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => handleScroll('left')}
            className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-neutral-900 hover:bg-slate-200 dark:hover:bg-neutral-800 border border-slate-200 dark:border-neutral-700 text-slate-700 dark:text-neutral-300 hover:text-slate-900 dark:hover:text-white flex items-center justify-center transition-colors"
            title="Anterior"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleScroll('right')}
            className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-neutral-900 hover:bg-slate-200 dark:hover:bg-neutral-800 border border-slate-200 dark:border-neutral-700 text-slate-700 dark:text-neutral-300 hover:text-slate-900 dark:hover:text-white flex items-center justify-center transition-colors"
            title="Próximo"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Horizontal Filmstrip / Strip of Technical Illustrations */}
      <div 
        ref={scrollRef}
        className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-neutral-300 dark:scrollbar-thumb-neutral-800 scrollbar-track-transparent"
      >
        {diagrams.map((diagram) => {
          const isSelected = selectedDiagramId === diagram.id;

          return (
            <div
              key={diagram.id}
              onClick={() => onSelectDiagram(diagram)}
              className={`
                min-w-[150px] sm:min-w-[170px] max-w-[170px] rounded-xl border p-2.5 flex flex-col cursor-pointer transition-all duration-200 group shrink-0
                ${isSelected
                  ? 'border-amber-400 bg-amber-500/10 dark:bg-amber-950/20 ring-2 ring-amber-400/30 scale-[1.02] shadow-lg shadow-amber-500/10'
                  : 'bg-slate-50 dark:bg-[#18181b] border-neutral-200 dark:border-neutral-800 hover:border-neutral-400 dark:hover:border-neutral-600 hover:bg-slate-100 dark:hover:bg-neutral-900/80'
                }
              `}
            >
              {/* Real Technical Drawing Thumbnail */}
              <div className="aspect-[4/3] rounded-lg bg-slate-100 dark:bg-[#0d0d10] border border-neutral-200 dark:border-neutral-800 overflow-hidden flex items-center justify-center relative mb-2 group-hover:border-neutral-400 dark:group-hover:border-neutral-700">
                <img
                  src={diagram.thumbnailUrl}
                  alt={diagram.title}
                  className="w-full h-full object-contain"
                  loading="lazy"
                  onError={(e) => {
                    // Fallback to SVG sketch if image fails to load
                    const parent = (e.currentTarget as HTMLImageElement).parentElement;
                    if (parent) {
                      e.currentTarget.style.display = 'none';
                      const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
                      svg.setAttribute('viewBox', '0 0 100 80');
                      svg.classList.add('w-full', 'h-full', 'text-neutral-600');
                      svg.innerHTML = `
                        <ellipse cx="40" cy="40" rx="20" ry="25" fill="none" stroke="currentColor" stroke-width="2"/>
                        <ellipse cx="60" cy="40" rx="15" ry="20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-dasharray="3 2"/>
                        <line x1="20" y1="40" x2="80" y2="40" stroke="#eab308" stroke-width="1" stroke-dasharray="2 2"/>
                        <circle cx="35" cy="30" r="3" fill="#eab308"/>
                        <circle cx="65" cy="48" r="3" fill="#eab308"/>
                      `;
                      parent.appendChild(svg);
                    }
                  }}
                />

                {/* Illustration Code Badge */}
                <span className={`
                  absolute bottom-1 right-1 text-[10px] font-mono font-bold px-1.5 py-0.5 rounded
                  ${isSelected ? 'bg-amber-400 text-black' : 'bg-slate-200 dark:bg-black/70 text-slate-800 dark:text-neutral-300 border border-slate-300 dark:border-neutral-700'}
                `}>
                  {diagram.illustrationCode}
                </span>
              </div>

              {/* Title & Stats */}
              <div className="min-w-0">
                <span className="text-[11px] font-bold text-neutral-900 dark:text-white block truncate group-hover:text-amber-600 dark:group-hover:text-amber-300 transition-colors">
                  {diagram.title}
                </span>
                <span className="text-[10px] text-neutral-500 dark:text-neutral-400 block truncate">
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
