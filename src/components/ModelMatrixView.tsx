import React, { useState } from 'react';
import { PurchaseModel, BrandType } from '../types';
import { Layers, Check, X, Search, Filter, CheckCircle2, ShieldCheck, ToggleLeft, ToggleRight, Eye, EyeOff } from 'lucide-react';

interface ModelMatrixViewProps {
  purchaseModels: PurchaseModel[];
  enabledVariantsMap: Record<string, boolean>;
  onToggleVariantEnabled: (modelId: string, variantId?: string, forceState?: boolean) => void;
  onToggleAllInModel: (modelId: string, enable: boolean) => void;
}

export const ModelMatrixView: React.FC<ModelMatrixViewProps> = ({
  purchaseModels,
  enabledVariantsMap,
  onToggleVariantEnabled,
  onToggleAllInModel
}) => {
  const [selectedBrand, setSelectedBrand] = useState<BrandType>('Suzuki');
  const [searchTerm, setSearchTerm] = useState('');
  
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const filteredModels = purchaseModels.filter(m => {
    const matchBrand = m.brand === selectedBrand;
    const matchSearch = !searchTerm || m.modelName.toLowerCase().includes(searchTerm.toLowerCase());
    return matchBrand && matchSearch;
  });

  const isModelEnabled = (modelId: string) => {
    return enabledVariantsMap[modelId] !== false;
  };

  const isVariantEnabled = (modelId: string, variantId: string) => {
    if (enabledVariantsMap[modelId] === false) return false;
    const key = `${modelId}-${variantId}`;
    return enabledVariantsMap[key] !== false;
  };

  const handleToggleModel = (modelId: string) => {
    const current = isModelEnabled(modelId);
    onToggleVariantEnabled(modelId, undefined, !current);
    showToast(!current ? 'Modelo liberado na fábrica!' : 'Modelo bloqueado na fábrica (oculto no pedido).');
  };

  const handleToggleVariant = (modelId: string, variantId: string) => {
    const current = isVariantEnabled(modelId, variantId);
    onToggleVariantEnabled(modelId, variantId, !current);
    showToast(!current ? 'Cor liberada no catálogo!' : 'Cor desabilitada no catálogo.');
  };

  const handleToggleAll = (modelId: string, enable: boolean) => {
    onToggleAllInModel(modelId, enable);
    showToast(enable ? 'Todas as cores do modelo liberadas!' : 'Todas as cores do modelo desabilitadas.');
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-emerald-600 text-white px-5 py-3 rounded-xl shadow-2xl font-bold text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-white dark:bg-[#18181b] border border-neutral-200 dark:border-[#27272a] rounded-3xl p-6 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="p-3 bg-purple-500/10 text-purple-600 dark:text-purple-400 rounded-2xl border border-purple-500/20">
            <Layers className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-neutral-900 dark:text-white flex items-center gap-2">
              <span>Habilitação de Modelos, Anos & Cores de Fábrica</span>
              <span className="text-xs font-mono font-bold bg-purple-500/20 text-purple-700 dark:text-purple-300 px-2 py-0.5 rounded-full border border-purple-500/30">
                Matriz de Liberação Gravada
              </span>
            </h2>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
              Defina com precisão quais modelos e variações de cor estão autorizados para pedidos de fábrica pela rede de concessionárias.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {(['Suzuki', 'Haojue', 'Zontes', 'Kymco'] as BrandType[]).map(b => (
            <button
              key={b}
              onClick={() => setSelectedBrand(b)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                selectedBrand === b 
                  ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/20' 
                  : 'bg-white dark:bg-neutral-900 text-neutral-700 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white border border-neutral-200 dark:border-neutral-800'
              }`}
            >
              {b}
            </button>
          ))}
        </div>
      </div>

      {/* Search Input */}
      <div className="bg-white dark:bg-[#18181b] border border-neutral-200 dark:border-[#27272a] rounded-2xl p-4">
        <div className="relative">
          <Search className="w-4 h-4 text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar por modelo em linha..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 rounded-xl pl-9 pr-3 py-2 text-xs text-neutral-900 dark:text-white placeholder-neutral-400 dark:placeholder-neutral-500 focus:outline-none focus:border-purple-500"
          />
        </div>
      </div>

      {/* Matrix Cards per Model */}
      <div className="space-y-4">
        {filteredModels.map(model => {
          const modelEnabled = isModelEnabled(model.id);

          return (
            <div
              key={model.id}
              className={`bg-white dark:bg-[#18181b] border rounded-2xl p-5 shadow-xl space-y-4 transition-all ${
                modelEnabled ? 'border-neutral-200 dark:border-[#27272a]' : 'border-rose-200 dark:border-rose-950/60 opacity-60 bg-neutral-50 dark:bg-[#121215]'
              }`}
            >
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-neutral-200 dark:border-neutral-800 pb-3">
                <div className="flex items-center gap-3">
                  <img
                    src={model.image}
                    alt={model.modelName}
                    className="w-16 h-12 object-contain bg-white dark:bg-neutral-900 rounded-lg p-1 border border-neutral-200 dark:border-neutral-800"
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-bold text-neutral-900 dark:text-white">{model.modelName}</h3>
                      <span className="text-xs font-mono font-bold bg-neutral-100 dark:bg-neutral-900 text-purple-600 dark:text-purple-400 px-2 py-0.5 rounded border border-neutral-200 dark:border-neutral-700">
                        Ano {model.yearModel || '2026/2026'}
                      </span>
                    </div>
                    <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">{model.category} • Preço Tabela Base R$ {model.factoryCost.toLocaleString('pt-BR')}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleToggleModel(model.id)}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                      modelEnabled
                        ? 'bg-purple-100 dark:bg-purple-950 text-purple-800 dark:text-purple-300 border border-purple-300 dark:border-purple-800 hover:bg-purple-200 dark:hover:bg-purple-900'
                        : 'bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-300 border border-rose-300 dark:border-rose-800 hover:bg-rose-200 dark:hover:bg-rose-900'
                    }`}
                  >
                    {modelEnabled ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                    <span>{modelEnabled ? 'Modelo Visível' : 'Modelo Desabilitado (Oculto)'}</span>
                  </button>

                  <button
                    onClick={() => handleToggleAll(model.id, true)}
                    className="px-2.5 py-1 bg-emerald-100 dark:bg-emerald-950 hover:bg-emerald-200 dark:hover:bg-emerald-900 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 rounded-lg text-xs font-bold transition-colors"
                  >
                    Liberar Todas Cores
                  </button>
                  <button
                    onClick={() => handleToggleAll(model.id, false)}
                    className="px-2.5 py-1 bg-rose-100 dark:bg-rose-950 hover:bg-rose-200 dark:hover:bg-rose-900 text-rose-800 dark:text-rose-300 border border-rose-300 dark:border-rose-800 rounded-lg text-xs font-bold transition-colors"
                  >
                    Bloquear Todas Cores
                  </button>
                </div>
              </div>

              {/* Color Variants Matrix */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {model.variants.map(variant => {
                  const enabled = isVariantEnabled(model.id, variant.id);
                  return (
                    <div
                      key={variant.id}
                      className={`p-3.5 rounded-xl border transition-all flex items-center justify-between ${
                        enabled
                          ? 'bg-neutral-50 dark:bg-neutral-900/90 border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-white'
                          : 'bg-neutral-100 dark:bg-neutral-950/60 border-rose-200 dark:border-rose-950 text-neutral-400 opacity-50'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <span
                          className="w-5 h-5 rounded-full border border-neutral-300 dark:border-white/20 shrink-0 shadow-inner"
                          style={{ backgroundColor: variant.colorHex }}
                        />
                        <div>
                          <span className="text-xs font-bold block">{variant.colorName}</span>
                          <span className="text-[10px] font-mono text-neutral-500 dark:text-neutral-400">Cód: {variant.colorCode || 'STD'}</span>
                        </div>
                      </div>

                      <button
                        onClick={() => handleToggleVariant(model.id, variant.id)}
                        className={`px-3 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
                          enabled
                            ? 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-500/30'
                            : 'bg-rose-500/20 text-rose-700 dark:text-rose-300 hover:bg-rose-500/30'
                        }`}
                      >
                        {enabled ? (
                          <>
                            <Check className="w-3.5 h-3.5" />
                            <span>Habilitado</span>
                          </>
                        ) : (
                          <>
                            <X className="w-3.5 h-3.5" />
                            <span>Bloqueado</span>
                          </>
                        )}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
