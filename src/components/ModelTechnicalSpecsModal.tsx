import React, { useState } from 'react';
import { 
  X, 
  ExternalLink, 
  Zap, 
  Gauge, 
  Fuel, 
  Weight, 
  ShieldCheck, 
  Cpu, 
  Settings2, 
  Info, 
  CheckCircle2, 
  Layers, 
  Calendar,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { PurchaseModel, VehicleVariant } from '../types';

interface ModelTechnicalSpecsModalProps {
  model: PurchaseModel;
  onClose: () => void;
  onEditModel?: (model: PurchaseModel) => void;
  canEdit?: boolean;
}

export const ModelTechnicalSpecsModal: React.FC<ModelTechnicalSpecsModalProps> = ({
  model,
  onClose,
  onEditModel,
  canEdit = true
}) => {
  const [selectedVariantIndex, setSelectedVariantIndex] = useState<number>(0);
  const activeVariant: VehicleVariant | undefined = model.variants[selectedVariantIndex] || model.variants[0];

  // Resolve active image (variant image if available, else model fallback image)
  const currentPhoto = activeVariant?.imageUrl || model.image || 'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&w=1000&q=80';

  const specs = model.technicalSpecs;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 md:p-6 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-[#121215] border border-[#27272a] rounded-3xl max-w-5xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden relative">
        
        {/* Modal Header */}
        <div className="p-4 sm:p-6 border-b border-[#27272a] flex items-center justify-between gap-4 bg-gradient-to-r from-neutral-900/90 via-[#18181b] to-neutral-900/90 shrink-0">
          <div className="flex items-center gap-3">
            <span className={`px-3 py-1 rounded-xl text-xs font-black uppercase tracking-wider ${
              model.brand === 'Suzuki' ? 'bg-red-600 text-white shadow-sm shadow-red-600/30' :
              model.brand === 'Zontes' ? 'bg-amber-600 text-white' :
              model.brand === 'Haojue' ? 'bg-blue-600 text-white' : 'bg-neutral-800 text-neutral-200'
            }`}>
              {model.brand}
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-2xl font-black text-white tracking-tight">
                  {model.modelName}
                </h2>
                {model.yearModel && (
                  <span className="text-xs bg-neutral-800/80 text-neutral-300 px-2 py-0.5 rounded-md font-mono border border-neutral-700">
                    {model.yearModel}
                  </span>
                )}
              </div>
              <p className="text-xs text-neutral-400 font-medium">
                {model.category}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {canEdit && onEditModel && (
              <button
                onClick={() => onEditModel(model)}
                className="px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 hover:text-white rounded-xl text-xs font-bold border border-neutral-700 flex items-center gap-1.5 transition-colors"
                title="Editar dados técnicos e fotos"
              >
                <Settings2 className="w-3.5 h-3.5 text-blue-400" />
                <span className="hidden sm:inline">Editar Cadastro</span>
              </button>
            )}

            {model.officialWebUrl && (
              <a
                href={model.officialWebUrl}
                target="_blank"
                rel="noreferrer"
                className="px-3 py-1.5 bg-blue-600/10 hover:bg-blue-600/20 text-blue-400 hover:text-blue-300 rounded-xl text-xs font-bold border border-blue-500/30 flex items-center gap-1.5 transition-colors"
                title="Abrir página oficial do fabricante"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Site Oficial</span>
              </a>
            )}

            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-neutral-800/80 hover:bg-neutral-700 text-neutral-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Content Body */}
        <div className="overflow-y-auto p-4 sm:p-6 space-y-6">
          
          {/* Top Section: Interactive Color Photo & Quick Highlights */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            {/* Left: Photo with Color Switcher */}
            <div className="lg:col-span-7 bg-neutral-900/80 rounded-2xl border border-neutral-800 p-4 space-y-4">
              <div className="relative aspect-video rounded-xl overflow-hidden bg-neutral-950/80 border border-neutral-800/80 flex items-center justify-center group">
                <img
                  src={currentPhoto}
                  alt={`${model.modelName} - ${activeVariant?.colorName || 'Foto'}`}
                  className="w-full h-full object-contain p-2 transition-all duration-300 group-hover:scale-105"
                  referrerPolicy="no-referrer"
                />
                
                {/* Active Color Overlay Badge */}
                <div className="absolute top-3 left-3 bg-neutral-900/90 backdrop-blur-md px-3 py-1.5 rounded-xl border border-neutral-700/80 flex items-center gap-2 shadow-lg">
                  <span 
                    className="w-3.5 h-3.5 rounded-full border border-white/30 shadow-inner" 
                    style={{ backgroundColor: activeVariant?.colorHex || '#3b82f6' }}
                  />
                  <div className="leading-tight">
                    <span className="text-xs font-bold text-white block">
                      {activeVariant?.colorName}
                    </span>
                    {activeVariant?.colorCode && (
                      <span className="text-[10px] text-neutral-400 font-mono">
                        Cód. Fábrica: {activeVariant.colorCode}
                      </span>
                    )}
                  </div>
                </div>

                {/* Stock Status Tag */}
                <div className="absolute bottom-3 right-3 bg-neutral-900/90 backdrop-blur-md px-2.5 py-1 rounded-lg border border-neutral-700/80 text-[11px] font-bold">
                  {activeVariant?.stockStatus === 'disponivel' ? (
                    <span className="text-emerald-400 flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                      Disponível para Faturamento
                    </span>
                  ) : activeVariant?.stockStatus === 'poucas' ? (
                    <span className="text-amber-400 flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-amber-400" />
                      Lote Limitado de Fábrica
                    </span>
                  ) : (
                    <span className="text-rose-400 flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-rose-400" />
                      Sob Encomenda / Indisponível
                    </span>
                  )}
                </div>
              </div>

              {/* Color Swatches / Selector */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-neutral-400">
                  <span className="uppercase tracking-wider">Cores Oficiais Disponíveis (Clique para alternar foto):</span>
                  <span className="text-neutral-500 font-normal">{model.variants.length} opções</span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {model.variants.map((v, idx) => {
                    const isSelected = selectedVariantIndex === idx;
                    return (
                      <button
                        key={v.id}
                        onClick={() => setSelectedVariantIndex(idx)}
                        className={`p-2 rounded-xl border text-left flex items-center gap-2.5 transition-all ${
                          isSelected 
                            ? 'bg-blue-600/15 border-blue-500 text-white shadow-sm shadow-blue-500/20' 
                            : 'bg-neutral-900/60 border-neutral-800/80 hover:border-neutral-700 text-neutral-300'
                        }`}
                      >
                        <span 
                          className={`w-4 h-4 rounded-full border shrink-0 transition-transform ${
                            isSelected ? 'scale-110 ring-2 ring-blue-400 border-white' : 'border-neutral-600'
                          }`}
                          style={{ backgroundColor: v.colorHex }}
                        />
                        <div className="min-w-0 flex-1">
                          <p className="text-[11px] font-bold truncate leading-tight">
                            {v.colorName}
                          </p>
                          {v.colorCode && (
                            <span className="text-[9px] text-neutral-400 font-mono block">
                              {v.colorCode}
                            </span>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Right: Commercial Description, Performance Cards & Pricing */}
            <div className="lg:col-span-5 space-y-4">
              
              {/* Pricing Cards */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3.5 bg-neutral-900/90 rounded-2xl border border-neutral-800">
                  <span className="text-[10px] uppercase font-bold text-neutral-400 tracking-wider block mb-0.5">
                    Custo Concessionária (Fábrica)
                  </span>
                  <p className="text-lg sm:text-xl font-bold text-white font-tabular">
                    R$ {model.factoryCost.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </p>
                  <span className="text-[10px] text-blue-400 font-medium">Faturamento Direto</span>
                </div>

                <div className="p-3.5 bg-neutral-900/90 rounded-2xl border border-neutral-800">
                  <span className="text-[10px] uppercase font-bold text-neutral-400 tracking-wider block mb-0.5">
                    PPS Sugerido (Público)
                  </span>
                  <p className="text-lg sm:text-xl font-bold text-emerald-400 font-tabular">
                    R$ {model.ppsMSRP.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </p>
                  <span className="text-[10px] text-neutral-400">Margem Bruta Estimada</span>
                </div>
              </div>

              {/* Commercial Description */}
              {model.description && (
                <div className="p-4 bg-neutral-900/60 rounded-2xl border border-neutral-800 space-y-1.5">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-blue-400">
                    <Info className="w-3.5 h-3.5" />
                    <span>Posicionamento & Apresentação</span>
                  </div>
                  <p className="text-xs text-neutral-300 leading-relaxed">
                    {model.description}
                  </p>
                </div>
              )}

              {/* Performance Metrics Quick Grid */}
              <div className="p-4 bg-gradient-to-br from-blue-950/30 to-neutral-900/90 rounded-2xl border border-blue-900/30 space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold text-blue-300">
                  <Gauge className="w-4 h-4 text-blue-400" />
                  <span>Métricas de Desempenho & Autonomia</span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="bg-neutral-900/80 p-2.5 rounded-xl border border-neutral-800">
                    <span className="text-[10px] text-neutral-400 block">Potência Máxima</span>
                    <strong className="text-white font-mono text-sm">{specs?.power || 'Consulte'}</strong>
                  </div>
                  <div className="bg-neutral-900/80 p-2.5 rounded-xl border border-neutral-800">
                    <span className="text-[10px] text-neutral-400 block">Torque Máximo</span>
                    <strong className="text-white font-mono text-sm">{specs?.torque || 'Consulte'}</strong>
                  </div>
                  <div className="bg-neutral-900/80 p-2.5 rounded-xl border border-neutral-800">
                    <span className="text-[10px] text-neutral-400 block">Velocidade Máxima</span>
                    <strong className="text-emerald-400 font-mono text-sm">{specs?.topSpeed || 'N/D'}</strong>
                  </div>
                  <div className="bg-neutral-900/80 p-2.5 rounded-xl border border-neutral-800">
                    <span className="text-[10px] text-neutral-400 block">Aceleração 0-100 km/h</span>
                    <strong className="text-blue-400 font-mono text-sm">{specs?.acceleration0to100 || 'N/D'}</strong>
                  </div>
                  <div className="bg-neutral-900/80 p-2.5 rounded-xl border border-neutral-800">
                    <span className="text-[10px] text-neutral-400 block">Consumo Médio</span>
                    <strong className="text-amber-400 font-mono text-sm">{specs?.avgConsumption || 'N/D'}</strong>
                  </div>
                  <div className="bg-neutral-900/80 p-2.5 rounded-xl border border-neutral-800">
                    <span className="text-[10px] text-neutral-400 block">Autonomia Estimada</span>
                    <strong className="text-purple-400 font-mono text-sm">{specs?.estimatedRange || 'N/D'}</strong>
                  </div>
                </div>

                {model.performanceSummary && (
                  <p className="text-[11px] text-neutral-300 italic bg-neutral-950/60 p-2.5 rounded-xl border border-neutral-800/80">
                    "{model.performanceSummary}"
                  </p>
                )}
              </div>

            </div>
          </div>

          {/* Key Technologies & Features List */}
          {model.features && model.features.length > 0 && (
            <div className="p-4 bg-neutral-900/60 rounded-2xl border border-neutral-800 space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-white uppercase tracking-wider">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>Principais Tecnologias & Equipamentos de Série</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                {model.features.map((feat, i) => (
                  <div key={i} className="flex items-start gap-2 p-2.5 bg-neutral-900 rounded-xl border border-neutral-800/80">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span className="text-xs text-neutral-200">{feat}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Full Technical Specifications Grid */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Layers className="w-4 h-4 text-blue-400" />
                <span>Ficha Técnica Oficial Completa</span>
              </h3>
              <span className="text-xs text-neutral-500">Homologação Grupo J. Toledo</span>
            </div>

            {specs ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* Motorização & Transmissão */}
                <div className="bg-neutral-900/70 rounded-2xl border border-neutral-800 p-4 space-y-3">
                  <div className="flex items-center gap-2 text-xs font-bold text-blue-400 border-b border-neutral-800 pb-2">
                    <Zap className="w-4 h-4" />
                    <span>Motorização, Injeção & Câmbio</span>
                  </div>

                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between py-1 border-b border-neutral-800/50">
                      <span className="text-neutral-400">Tipo do Motor:</span>
                      <strong className="text-white text-right max-w-[65%]">{specs.engineType}</strong>
                    </div>
                    <div className="flex justify-between py-1 border-b border-neutral-800/50">
                      <span className="text-neutral-400">Cilindrada:</span>
                      <strong className="text-white font-mono">{specs.displacement}</strong>
                    </div>
                    <div className="flex justify-between py-1 border-b border-neutral-800/50">
                      <span className="text-neutral-400">Potência Máxima:</span>
                      <strong className="text-blue-400 font-mono">{specs.power}</strong>
                    </div>
                    <div className="flex justify-between py-1 border-b border-neutral-800/50">
                      <span className="text-neutral-400">Torque Máximo:</span>
                      <strong className="text-blue-400 font-mono">{specs.torque}</strong>
                    </div>
                    {specs.compressionRatio && (
                      <div className="flex justify-between py-1 border-b border-neutral-800/50">
                        <span className="text-neutral-400">Taxa de Compressão:</span>
                        <strong className="text-white font-mono">{specs.compressionRatio}</strong>
                      </div>
                    )}
                    <div className="flex justify-between py-1 border-b border-neutral-800/50">
                      <span className="text-neutral-400">Sistema de Alimentação:</span>
                      <strong className="text-white text-right max-w-[65%]">{specs.fuelSystem}</strong>
                    </div>
                    <div className="flex justify-between py-1 border-b border-neutral-800/50">
                      <span className="text-neutral-400">Câmbio & Transmissão:</span>
                      <strong className="text-white text-right max-w-[65%]">{specs.transmission}</strong>
                    </div>
                    {specs.clutch && (
                      <div className="flex justify-between py-1">
                        <span className="text-neutral-400">Embreagem:</span>
                        <strong className="text-white text-right max-w-[65%]">{specs.clutch}</strong>
                      </div>
                    )}
                  </div>
                </div>

                {/* Ciclística, Freios, Suspensão & Dimensões */}
                <div className="bg-neutral-900/70 rounded-2xl border border-neutral-800 p-4 space-y-3">
                  <div className="flex items-center gap-2 text-xs font-bold text-emerald-400 border-b border-neutral-800 pb-2">
                    <ShieldCheck className="w-4 h-4" />
                    <span>Ciclística, Suspensão, Freios & Dimensões</span>
                  </div>

                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between py-1 border-b border-neutral-800/50">
                      <span className="text-neutral-400">Suspensão Dianteira:</span>
                      <strong className="text-white text-right max-w-[65%]">{specs.frontSuspension}</strong>
                    </div>
                    <div className="flex justify-between py-1 border-b border-neutral-800/50">
                      <span className="text-neutral-400">Suspensão Traseira:</span>
                      <strong className="text-white text-right max-w-[65%]">{specs.rearSuspension}</strong>
                    </div>
                    <div className="flex justify-between py-1 border-b border-neutral-800/50">
                      <span className="text-neutral-400">Freio Dianteiro:</span>
                      <strong className="text-white text-right max-w-[65%]">{specs.frontBrake}</strong>
                    </div>
                    <div className="flex justify-between py-1 border-b border-neutral-800/50">
                      <span className="text-neutral-400">Freio Traseiro:</span>
                      <strong className="text-white text-right max-w-[65%]">{specs.rearBrake}</strong>
                    </div>
                    {specs.absSystem && (
                      <div className="flex justify-between py-1 border-b border-neutral-800/50">
                        <span className="text-neutral-400">Sistema ABS:</span>
                        <strong className="text-emerald-400 text-right max-w-[65%]">{specs.absSystem}</strong>
                      </div>
                    )}
                    <div className="flex justify-between py-1 border-b border-neutral-800/50">
                      <span className="text-neutral-400">Pneu Dianteiro / Traseiro:</span>
                      <strong className="text-white font-mono text-right">{specs.frontTire} / {specs.rearTire}</strong>
                    </div>
                    <div className="flex justify-between py-1 border-b border-neutral-800/50">
                      <span className="text-neutral-400">Capacidade do Tanque:</span>
                      <strong className="text-amber-400 font-mono">{specs.fuelTank}</strong>
                    </div>
                    <div className="flex justify-between py-1">
                      <span className="text-neutral-400">Peso em Ordem de Marcha / Assento:</span>
                      <strong className="text-white font-mono">{specs.curbWeight} / {specs.seatHeight}</strong>
                    </div>
                  </div>
                </div>

              </div>
            ) : (
              <div className="p-6 bg-neutral-900/40 rounded-2xl border border-neutral-800 text-center space-y-2">
                <p className="text-xs text-neutral-400">Ficha técnica detalhada em homologação.</p>
                {canEdit && onEditModel && (
                  <button
                    onClick={() => onEditModel(model)}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl"
                  >
                    Cadastrar Dados Técnicos Deste Modelo
                  </button>
                )}
              </div>
            )}
          </div>

        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-[#27272a] bg-neutral-950 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2 text-xs text-neutral-400">
            <Calendar className="w-3.5 h-3.5" />
            <span>Ano Modelo {model.yearModel || '2026'} • Base J. Toledo</span>
          </div>

          <div className="flex items-center gap-3">
            {canEdit && onEditModel && (
              <button
                onClick={() => onEditModel(model)}
                className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 rounded-xl text-xs font-bold transition-colors"
              >
                Editar Ficha Técnica
              </button>
            )}
            <button
              onClick={onClose}
              className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition-colors shadow-md shadow-blue-500/20"
            >
              Fechar
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
