import React, { useState } from 'react';
import { 
  ShoppingCart, 
  Plus, 
  Minus, 
  Check, 
  Search, 
  Building2, 
  ShieldCheck, 
  AlertCircle, 
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { PartsItem, PartsDiagramGroup } from '../../types';

interface PartsTableProps {
  diagram: PartsDiagramGroup;
  selectedRef: number | null;
  onSelectRef: (ref: number) => void;
  hoveredRef: number | null;
  onHoverRef: (ref: number | null) => void;
  onAddToCart: (part: PartsItem, quantity: number) => void;
}

export const PartsTable: React.FC<PartsTableProps> = ({
  diagram,
  selectedRef,
  onSelectRef,
  hoveredRef,
  onHoverRef,
  onAddToCart
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [quantities, setQuantities] = useState<{ [partId: string]: number }>({});
  const [addedItemIds, setAddedItemIds] = useState<{ [partId: string]: boolean }>({});

  const handleQuantityChange = (partId: string, delta: number, min = 1) => {
    setQuantities(prev => {
      const current = prev[partId] || 1;
      const next = Math.max(min, current + delta);
      return { ...prev, [partId]: next };
    });
  };

  const handleAdd = (part: PartsItem) => {
    const qty = quantities[part.id] || 1;
    onAddToCart(part, qty);
    setAddedItemIds(prev => ({ ...prev, [part.id]: true }));
    setTimeout(() => {
      setAddedItemIds(prev => ({ ...prev, [part.id]: false }));
    }, 1500);
  };

  // Filter parts by search query (Ref, Part Number or Denominação)
  const filteredParts = (diagram?.parts || []).filter(part => {
    if (!part) return false;
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    const refStr = (part.ref ?? '').toString().toLowerCase();
    const partNum = (part.partNumber || (part as any).code || '').toLowerCase();
    const desc = (part.description || (part as any).name || '').toLowerCase();
    const obs = (part.observation || '').toLowerCase();
    return refStr.includes(q) || partNum.includes(q) || desc.includes(q) || obs.includes(q);
  });

  return (
    <div className="flex flex-col h-full bg-[#121215] border border-[#27272a] rounded-2xl overflow-hidden shadow-xl">
      
      {/* Table Header & Search Filter */}
      <div className="p-3.5 sm:p-4 bg-gradient-to-r from-neutral-900 via-[#18181b] to-neutral-900 border-b border-[#27272a] flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase font-bold tracking-widest text-amber-400 font-mono">
              Ilustração {diagram.illustrationCode}
            </span>
            <span className="text-xs text-neutral-400 font-bold">
              • {diagram.parts.length} Peças Genuínas
            </span>
          </div>
          <h3 className="text-sm sm:text-base font-bold text-white tracking-tight mt-0.5">
            {diagram.title}
          </h3>
        </div>

        {/* Quick Filter Search Input */}
        <div className="relative min-w-[200px] sm:min-w-[240px]">
          <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-neutral-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar por REF, Part Number ou nome..."
            className="w-full bg-neutral-950/80 border border-neutral-800 rounded-xl pl-9 pr-4 py-1.5 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-amber-400 transition-colors"
          />
          {searchQuery && (
            <button 
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-2 text-neutral-400 hover:text-white text-xs"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Parts List Table */}
      <div className="flex-1 overflow-x-auto overflow-y-auto max-h-[520px]">
        <table className="w-full text-left text-xs font-tabular border-collapse">
          <thead className="sticky top-0 z-10 bg-neutral-950/95 backdrop-blur-sm border-b border-neutral-800 text-[10px] uppercase font-bold text-neutral-400 tracking-wider">
            <tr>
              <th className="p-3 pl-4 text-center w-12">Ref</th>
              <th className="p-3 min-w-[140px]">Número da Peça</th>
              <th className="p-3 min-w-[200px]">Denominação</th>
              <th className="p-3 text-center hidden md:table-cell">Montagem</th>
              <th className="p-3 hidden lg:table-cell">Observação / Medida</th>
              <th className="p-3 text-center w-12">UN</th>
              <th className="p-3 text-center">CD Estoque</th>
              <th className="p-3 text-right min-w-[90px]">Custo Fábrica</th>
              <th className="p-3 text-right hidden sm:table-cell min-w-[80px]">PPS Varejo</th>
              <th className="p-3 pr-4 text-right min-w-[140px]">Comprar</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-800/60">
            {filteredParts.length === 0 ? (
              <tr>
                <td colSpan={10} className="text-center py-10 text-neutral-500 text-xs">
                  Nenhuma peça encontrada para "{searchQuery}"
                </td>
              </tr>
            ) : (
              filteredParts.map((part, index) => {
                const partId = part.id || `part-${diagram.id}-${part.ref || index}`;
                const partNumber = part.partNumber || (part as any).code || 'N/A';
                const description = part.description || (part as any).name || 'Peça Genuína';
                const factoryPrice = part.factoryPrice ?? (part as any).price ?? 0;
                const msrpPrice = part.msrpPrice ?? (factoryPrice * 1.5);
                const stockJundiai = part.stockJundiai ?? (part as any).stock ?? 10;
                const stockManaus = part.stockManaus ?? 5;
                const unitQuantity = part.unitQuantity ?? (part as any).qty ?? 1;

                const isSelected = selectedRef === part.ref;
                const isHovered = hoveredRef === part.ref;
                const isAdded = addedItemIds[partId];
                const qty = quantities[partId] || 1;

                // Standardized safe part object to pass to handleAdd
                const safePart: PartsItem = {
                  ...part,
                  id: partId,
                  ref: part.ref ?? 0,
                  partNumber,
                  description,
                  factoryPrice,
                  msrpPrice,
                  stockJundiai,
                  stockManaus,
                  unitQuantity: Number(unitQuantity) || 1,
                  inStock: stockJundiai > 0 || stockManaus > 0,
                  categoryGroup: part.categoryGroup || 'Genuíno'
                };

                return (
                  <tr
                    key={partId}
                    onClick={() => onSelectRef(part.ref)}
                    onMouseEnter={() => onHoverRef(part.ref)}
                    onMouseLeave={() => onHoverRef(null)}
                    className={`
                      transition-colors cursor-pointer group
                      ${isSelected
                        ? 'bg-amber-500/15 border-l-4 border-amber-400'
                        : isHovered
                        ? 'bg-blue-500/10'
                        : 'hover:bg-neutral-900/60'
                      }
                    `}
                  >
                    {/* REF */}
                    <td className="p-3 pl-4 text-center">
                      <span className={`
                        inline-flex items-center justify-center w-6 h-6 rounded-full font-mono font-bold text-xs
                        ${isSelected
                          ? 'bg-amber-400 text-black shadow-md shadow-amber-500/30'
                          : 'bg-neutral-800 text-neutral-300 group-hover:bg-neutral-700'
                        }
                      `}>
                        {part.ref ?? '—'}
                      </span>
                    </td>

                    {/* Part Number */}
                    <td className="p-3 font-mono font-bold text-white text-xs whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <span className="group-hover:text-amber-300 transition-colors">
                          {partNumber}
                        </span>
                        {part.isEssentialMaintenance && (
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" title="Item de Giro Essencial" />
                        )}
                      </div>
                    </td>

                    {/* Denominação / Descrição */}
                    <td className="p-3">
                      <div className="font-bold text-neutral-200 group-hover:text-white line-clamp-1">
                        {description}
                      </div>
                      {part.subDescription && (
                        <span className="text-[10px] text-neutral-400 block line-clamp-1">
                          {part.subDescription}
                        </span>
                      )}
                    </td>

                    {/* Tempo de Montagem */}
                    <td className="p-3 text-center hidden md:table-cell text-neutral-400 font-mono text-[11px]">
                      {part.assemblyTime || '—'}
                    </td>

                    {/* Observação / Medida */}
                    <td className="p-3 hidden lg:table-cell text-neutral-400 text-[11px] font-mono">
                      {part.observation || '—'}
                    </td>

                    {/* UN (Qtd no conjunto) */}
                    <td className="p-3 text-center text-neutral-300 font-bold">
                      {unitQuantity}
                    </td>

                    {/* CD Estoque */}
                    <td className="p-3 text-center">
                      <div className="flex flex-col items-center gap-0.5">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                          stockJundiai > 20
                            ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                            : stockJundiai > 0
                            ? 'bg-amber-500/15 text-amber-400 border-amber-500/30'
                            : 'bg-red-500/15 text-red-400 border-red-500/30'
                        }`}>
                          {stockJundiai > 0 ? `${stockJundiai} un. CD-SP` : 'Sob Pedido'}
                        </span>
                        <span className="text-[9px] text-neutral-400 font-mono">
                          +{stockManaus} Manaus
                        </span>
                      </div>
                    </td>

                    {/* Custo de Fábrica Concessionária */}
                    <td className="p-3 text-right font-mono font-bold text-white">
                      R$ {factoryPrice.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </td>

                    {/* PPS Varejo */}
                    <td className="p-3 text-right hidden sm:table-cell font-mono text-neutral-400 text-[11px]">
                      R$ {msrpPrice.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </td>

                    {/* Ação Comprar / Quantidade */}
                    <td className="p-3 pr-4 text-right">
                      <div className="flex items-center justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
                        {/* Qtd Controls */}
                        <div className="flex items-center bg-neutral-900 border border-neutral-700 rounded-lg p-0.5">
                          <button
                            onClick={() => handleQuantityChange(partId, -1)}
                            className="w-5 h-5 flex items-center justify-center text-neutral-400 hover:text-white rounded hover:bg-neutral-800"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="w-6 text-center text-xs font-mono font-bold text-white">
                            {qty}
                          </span>
                          <button
                            onClick={() => handleQuantityChange(partId, 1)}
                            className="w-5 h-5 flex items-center justify-center text-neutral-400 hover:text-white rounded hover:bg-neutral-800"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>

                        {/* Add to Cart Button */}
                        <button
                          onClick={() => handleAdd(safePart)}
                          className={`
                            px-2.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all duration-200 shadow-sm
                            ${isAdded
                              ? 'bg-emerald-600 text-white'
                              : 'bg-amber-500 hover:bg-amber-400 text-black font-extrabold shadow-amber-500/20'
                            }
                          `}
                          title="Adicionar ao Carrinho de Peças"
                        >
                          {isAdded ? (
                            <>
                              <Check className="w-3.5 h-3.5" />
                              <span className="hidden sm:inline">Adicionado</span>
                            </>
                          ) : (
                            <>
                              <ShoppingCart className="w-3.5 h-3.5" />
                              <span className="hidden sm:inline">Comprar</span>
                            </>
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

    </div>
  );
};
