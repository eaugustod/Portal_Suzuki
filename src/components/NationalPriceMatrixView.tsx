import React, { useState } from 'react';
import { PurchaseModel, BrandType } from '../types';
import { Bike, SlidersHorizontal, Edit3, Search, Filter } from 'lucide-react';
import { ModelCatalogManagementModal } from './ModelCatalogManagementModal';

interface NationalPriceMatrixViewProps {
  purchaseModels: PurchaseModel[];
  onSavePurchaseModel?: (model: PurchaseModel) => void;
  onDeletePurchaseModel?: (modelId: string) => void;
}

export const NationalPriceMatrixView: React.FC<NationalPriceMatrixViewProps> = ({
  purchaseModels,
  onSavePurchaseModel,
  onDeletePurchaseModel
}) => {
  const [selectedBrand, setSelectedBrand] = useState<BrandType | 'Todas'>('Todas');
  const [searchQuery, setSearchQuery] = useState('');
  const [modelToEditModal, setModelToEditModal] = useState<PurchaseModel | null>(null);
  const [isModelFormOpen, setIsModelFormOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const filteredModels = purchaseModels.filter(m => {
    const matchBrand = selectedBrand === 'Todas' || m.brand === selectedBrand;
    const matchSearch = !searchQuery || 
      m.modelName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchBrand && matchSearch;
  });

  const brands: (BrandType | 'Todas')[] = ['Todas', 'Suzuki', 'Haojue', 'Zontes', 'Kymco', 'Hisun'];

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-emerald-600 text-white px-5 py-3 rounded-xl shadow-2xl font-bold text-xs flex items-center gap-2 animate-in fade-in">
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main Matriz Card */}
      <div className="bg-white dark:bg-[#18181b] border border-neutral-200 dark:border-[#27272a] rounded-3xl p-6 shadow-md space-y-6">
        
        {/* Header Banner */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-neutral-200 dark:border-[#27272a] pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider bg-blue-500/10 text-blue-600 dark:text-blue-400 px-2.5 py-0.5 rounded-full border border-blue-500/20">
                Gestão Montadora J. Toledo
              </span>
              <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
                Tabela Oficial Ativa
              </span>
            </div>
            <h3 className="text-xl font-bold text-neutral-900 dark:text-white flex items-center gap-2 mt-1.5">
              <Bike className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              Matriz Nacional de Preços & Cores de Fábrica
            </h3>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
              Gerencie catálogo oficial, fotos em alta resolução, disponibilize novas cores, ajuste preços PPS (Preço Público Sugerido) e de faturamento da concessionária.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                setModelToEditModal(purchaseModels[0] || null);
                setIsModelFormOpen(true);
              }}
              className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-xs flex items-center gap-2 shadow-md shadow-blue-500/20 active:scale-95 transition-all"
              title="Abrir formulário para gerenciar modelos e vigência"
            >
              <SlidersHorizontal className="w-4 h-4" />
              <span>Gerenciar Modelos & Vigência</span>
            </button>
          </div>
        </div>

        {/* Filters Bar: Brand Tabs & Search */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            {brands.map((b) => (
              <button
                key={b}
                onClick={() => setSelectedBrand(b)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                  selectedBrand === b
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                    : 'bg-neutral-100 dark:bg-neutral-900 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white border border-neutral-200 dark:border-neutral-800'
                }`}
              >
                {b}
              </button>
            ))}
          </div>

          <div className="relative min-w-[240px]">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar modelo ou categoria..."
              className="w-full bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl pl-8 pr-3 py-1.5 text-xs text-neutral-900 dark:text-white placeholder-neutral-400 focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>

        {/* Model Count Info */}
        <div className="text-xs text-neutral-500 dark:text-neutral-400 font-medium flex items-center justify-between">
          <span>Exibindo <strong>{filteredModels.length}</strong> modelo(s) cadastrados na Matriz Nacional</span>
          <span>Clique em <strong>Editar Dados do Card</strong> para alterar foto, preços ou dados técnicos</span>
        </div>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {filteredModels.map(model => (
            <div 
              key={model.id} 
              className="bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-4 space-y-3 hover:border-blue-500/50 transition-colors flex flex-col justify-between group shadow-2xs hover:shadow-md"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase font-bold bg-blue-500/10 text-blue-600 dark:text-blue-400 px-2 py-0.5 rounded-full border border-blue-500/20">
                    {model.brand}
                  </span>
                  <span className="text-[10px] text-neutral-500 font-bold">{model.category}</span>
                </div>
                
                <div className="aspect-video bg-white dark:bg-neutral-950 rounded-xl overflow-hidden flex items-center justify-center p-2 border border-neutral-200 dark:border-neutral-800 relative group-hover:border-blue-500/30 transition-colors">
                  <img 
                    src={model.image} 
                    alt={model.modelName} 
                    className="h-full object-contain transition-transform duration-300 group-hover:scale-105" 
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setModelToEditModal(model);
                      setIsModelFormOpen(true);
                    }}
                    className="absolute inset-0 bg-black/55 opacity-0 group-hover:opacity-100 flex items-center justify-center gap-2 text-white font-bold text-xs backdrop-blur-[2px] transition-opacity"
                  >
                    <Edit3 className="w-4 h-4 text-blue-400" />
                    <span>Alterar Dados & Foto</span>
                  </button>
                </div>

                <div>
                  <h4 className="font-bold text-neutral-900 dark:text-white text-sm">{model.modelName}</h4>
                  <p className="text-[11px] text-neutral-500">Modelo {model.yearModel || '2026/2026'}</p>
                </div>
              </div>

              <div className="space-y-3 pt-2">
                <div className="pt-2 border-t border-neutral-200 dark:border-neutral-800 flex items-center justify-between text-xs font-tabular">
                  <div>
                    <span className="text-[10px] text-neutral-500 block">Preço Fábrica:</span>
                    <span className="font-bold text-neutral-900 dark:text-white">R$ {model.factoryCost?.toLocaleString('pt-BR')}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-neutral-500 block">PPS Sugerido:</span>
                    <span className="font-bold text-emerald-600 dark:text-emerald-400">R$ {model.ppsMSRP?.toLocaleString('pt-BR')}</span>
                  </div>
                </div>

                {/* Botão de Edição do Card */}
                <button
                  type="button"
                  onClick={() => {
                    setModelToEditModal(model);
                    setIsModelFormOpen(true);
                  }}
                  className="w-full py-2 px-3 bg-white dark:bg-neutral-800 hover:bg-blue-50 dark:hover:bg-blue-950/40 text-neutral-700 dark:text-neutral-200 hover:text-blue-600 dark:hover:text-blue-400 border border-neutral-200 dark:border-neutral-700 hover:border-blue-300 dark:hover:border-blue-800 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-2xs"
                  title="Editar foto, preços, variantes de cores e ficha técnica"
                >
                  <Edit3 className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                  <span>Editar Dados do Card</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Model Catalog & Technical Specs Registration/Editing Modal */}
      {isModelFormOpen && (
        <ModelCatalogManagementModal
          isOpen={isModelFormOpen}
          onClose={() => {
            setIsModelFormOpen(false);
            setModelToEditModal(null);
          }}
          modelToEdit={modelToEditModal}
          onSaveModel={(savedModel) => {
            if (onSavePurchaseModel) {
              onSavePurchaseModel(savedModel);
            }
            showToast(`Modelo ${savedModel.modelName} salvo com sucesso!`);
            setIsModelFormOpen(false);
            setModelToEditModal(null);
          }}
          onDeleteModel={(modelId) => {
            if (onDeletePurchaseModel) {
              onDeletePurchaseModel(modelId);
            }
            showToast('Modelo removido do catálogo com sucesso.');
            setIsModelFormOpen(false);
            setModelToEditModal(null);
          }}
        />
      )}
    </div>
  );
};
