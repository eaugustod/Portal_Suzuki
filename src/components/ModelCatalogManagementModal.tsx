import React, { useState } from 'react';
import { 
  X, 
  Plus, 
  Trash2, 
  Save, 
  Image as ImageIcon, 
  Layers, 
  Zap, 
  ShieldCheck, 
  Gauge, 
  ExternalLink,
  Upload,
  Info,
  Check
} from 'lucide-react';
import { PurchaseModel, VehicleVariant, TechnicalSpecs, BrandType } from '../types';

interface ModelCatalogManagementModalProps {
  isOpen?: boolean;
  modelToEdit?: PurchaseModel | null;
  onSave?: (savedModel: PurchaseModel) => void;
  onSaveModel?: (savedModel: PurchaseModel) => void;
  onDeleteModel?: (modelId: string) => void;
  onClose: () => void;
}

export const ModelCatalogManagementModal: React.FC<ModelCatalogManagementModalProps> = ({
  modelToEdit,
  onSave,
  onClose
}) => {
  const isEditing = !!modelToEdit;

  // Basic Information
  const [id] = useState(modelToEdit?.id || `model-${Date.now()}`);
  const [brand, setBrand] = useState<BrandType>(modelToEdit?.brand || 'Suzuki');
  const [modelName, setModelName] = useState(modelToEdit?.modelName || '');
  const [yearModel, setYearModel] = useState(modelToEdit?.yearModel || '2026/2026');
  const [category, setCategory] = useState(modelToEdit?.category || 'Sport Crossover');
  const [factoryCost, setFactoryCost] = useState<number>(modelToEdit?.factoryCost || 50000);
  const [ppsMSRP, setPpsMSRP] = useState<number>(modelToEdit?.ppsMSRP || 62500);
  const [officialWebUrl, setOfficialWebUrl] = useState(modelToEdit?.officialWebUrl || 'https://suzukimotos.com.br/');
  const [description, setDescription] = useState(modelToEdit?.description || '');
  const [performanceSummary, setPerformanceSummary] = useState(modelToEdit?.performanceSummary || '');
  const [featuresText, setFeaturesText] = useState(
    modelToEdit?.features ? modelToEdit.features.join('\n') : 'Suspensão Invertida\nQuickshifter Bi-direcional\nPainel TFT Colorido\nFreios ABS'
  );

  // Variants (Colors & Photos per Color)
  const [variants, setVariants] = useState<VehicleVariant[]>(
    modelToEdit?.variants && modelToEdit.variants.length > 0
      ? JSON.parse(JSON.stringify(modelToEdit.variants))
      : [
          {
            id: `var-${Date.now()}-1`,
            colorName: 'Azul Metálico (YSF)',
            colorCode: 'YSF',
            colorHex: '#1b3b6f',
            imageUrl: 'https://images.unsplash.com/photo-1558981806-ec527fa84c39?auto=format&fit=crop&w=1000&q=80',
            stockStatus: 'disponivel',
            quantity: 0
          },
          {
            id: `var-${Date.now()}-2`,
            colorName: 'Preto Glass Sparkle (YVB)',
            colorCode: 'YVB',
            colorHex: '#171717',
            imageUrl: 'https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?auto=format&fit=crop&w=1000&q=80',
            stockStatus: 'disponivel',
            quantity: 0
          }
        ]
  );

  // Technical Specs Form State
  const initialSpecs = modelToEdit?.technicalSpecs || {} as TechnicalSpecs;
  const [engineType, setEngineType] = useState(initialSpecs.engineType || '4 tempos, 4 cilindros em linha, DOHC, 16V, refrigeração líquida');
  const [displacement, setDisplacement] = useState(initialSpecs.displacement || '999 cm³');
  const [power, setPower] = useState(initialSpecs.power || '152 cv @ 11.000 rpm');
  const [torque, setTorque] = useState(initialSpecs.torque || '10,8 kgf.m @ 9.250 rpm');
  const [compressionRatio, setCompressionRatio] = useState(initialSpecs.compressionRatio || '12.2:1');
  const [fuelSystem, setFuelSystem] = useState(initialSpecs.fuelSystem || 'Injeção Eletrônica com Ride-by-Wire');
  const [transmission, setTransmission] = useState(initialSpecs.transmission || '6 marchas com Quickshifter Bi-direcional');
  const [clutch, setClutch] = useState(initialSpecs.clutch || 'Multidisco em banho de óleo assistida e deslizante (SCAS)');
  const [frontSuspension, setFrontSuspension] = useState(initialSpecs.frontSuspension || 'Garfo invertido telescópico de 43 mm ajustável');
  const [rearSuspension, setRearSuspension] = useState(initialSpecs.rearSuspension || 'Balança articulada tipo Link com monoamortecedor a gás');
  const [frontBrake, setFrontBrake] = useState(initialSpecs.frontBrake || 'Disco duplo de 310 mm com pinças radiais de 4 pistões e ABS');
  const [rearBrake, setRearBrake] = useState(initialSpecs.rearBrake || 'Disco simples de 250 mm com pinça de 1 pistão e ABS');
  const [absSystem, setAbsSystem] = useState(initialSpecs.absSystem || 'ABS de duplo canal independente com Cornering ABS');
  const [frontTire, setFrontTire] = useState(initialSpecs.frontTire || '120/70ZR17');
  const [rearTire, setRearTire] = useState(initialSpecs.rearTire || '190/50ZR17');
  const [fuelTank, setFuelTank] = useState(initialSpecs.fuelTank || '19,0 Litros');
  const [curbWeight, setCurbWeight] = useState(initialSpecs.curbWeight || '232 kg');
  const [seatHeight, setSeatHeight] = useState(initialSpecs.seatHeight || '845 mm');
  const [topSpeed, setTopSpeed] = useState(initialSpecs.topSpeed || '245 km/h');
  const [acceleration0to100, setAcceleration0to100] = useState(initialSpecs.acceleration0to100 || '3.2 segundos');
  const [avgConsumption, setAvgConsumption] = useState(initialSpecs.avgConsumption || '16.5 km/L');
  const [estimatedRange, setEstimatedRange] = useState(initialSpecs.estimatedRange || '310 km');

  // Active Tab
  const [activeFormTab, setActiveFormTab] = useState<'basic' | 'colors' | 'specs' | 'performance'>('basic');

  // Color variant handlers
  const handleAddVariant = () => {
    const newVariant: VehicleVariant = {
      id: `var-${Date.now()}`,
      colorName: 'Nova Cor (Ex: Vermelho Candy)',
      colorCode: 'STD',
      colorHex: '#dc2626',
      imageUrl: variants[0]?.imageUrl || 'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&w=1000&q=80',
      stockStatus: 'disponivel',
      quantity: 0
    };
    setVariants([...variants, newVariant]);
  };

  const handleUpdateVariant = (index: number, field: keyof VehicleVariant, value: any) => {
    const updated = [...variants];
    updated[index] = { ...updated[index], [field]: value };
    setVariants(updated);
  };

  const handleRemoveVariant = (index: number) => {
    if (variants.length <= 1) {
      alert('A moto deve ter ao menos uma cor cadastrada.');
      return;
    }
    setVariants(variants.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!modelName.trim()) {
      alert('Por favor, informe o nome do modelo.');
      return;
    }

    const compiledSpecs: TechnicalSpecs = {
      engineType,
      displacement,
      power,
      torque,
      compressionRatio,
      fuelSystem,
      transmission,
      clutch,
      frontSuspension,
      rearSuspension,
      frontBrake,
      rearBrake,
      absSystem,
      frontTire,
      rearTire,
      fuelTank,
      curbWeight,
      seatHeight,
      topSpeed,
      acceleration0to100,
      avgConsumption,
      estimatedRange
    };

    const featuresList = featuresText
      .split('\n')
      .map(s => s.trim())
      .filter(s => s.length > 0);

    const savedModel: PurchaseModel = {
      id,
      brand,
      modelName: modelName.trim(),
      yearModel: yearModel.trim() || '2026/2026',
      category: category.trim() || 'Motocicleta',
      storeStock: modelToEdit?.storeStock || 2,
      avgRegistration: modelToEdit?.avgRegistration || '3 / mês',
      monthlyPurchase: modelToEdit?.monthlyPurchase || 3,
      commitmentMonth3: modelToEdit?.commitmentMonth3 || 2,
      factoryCost: Number(factoryCost) || 50000,
      ppsMSRP: Number(ppsMSRP) || 62500,
      selectedOrderType: modelToEdit?.selectedOrderType || 'Compra',
      selectedPayment: modelToEdit?.selectedPayment || 'A Prazo',
      image: variants[0]?.imageUrl || modelToEdit?.image,
      officialWebUrl: officialWebUrl.trim(),
      description: description.trim(),
      performanceSummary: performanceSummary.trim(),
      features: featuresList,
      technicalSpecs: compiledSpecs,
      variants
    };

    onSave(savedModel);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 md:p-6 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-[#121215] border border-[#27272a] rounded-3xl max-w-4xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden relative">
        
        {/* Header */}
        <div className="p-4 sm:p-6 border-b border-[#27272a] flex items-center justify-between gap-4 bg-gradient-to-r from-neutral-900/90 via-[#18181b] to-neutral-900/90 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-600/20 text-blue-400 border border-blue-500/30 rounded-2xl">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-xl font-black text-white">
                {isEditing ? `Editar Cadastro: ${modelToEdit.modelName}` : 'Cadastrar Nova Motocicleta / Ficha Técnica'}
              </h2>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                Catálogo Oficial de Fábrica Grupo J. Toledo Suzuki / Haojue / Zontes
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-neutral-800/80 hover:bg-neutral-700 text-neutral-500 dark:text-neutral-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-1 px-4 sm:px-6 pt-3 border-b border-[#27272a] bg-[#141417] overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveFormTab('basic')}
            className={`px-4 py-2 text-xs font-bold rounded-t-xl border-b-2 transition-all whitespace-nowrap ${
              activeFormTab === 'basic' 
                ? 'border-blue-500 text-blue-400 bg-white dark:bg-neutral-900/80' 
                : 'border-transparent text-neutral-500 dark:text-neutral-400 hover:text-neutral-200'
            }`}
          >
            1. Dados Gerais & Preços
          </button>

          <button
            type="button"
            onClick={() => setActiveFormTab('colors')}
            className={`px-4 py-2 text-xs font-bold rounded-t-xl border-b-2 transition-all flex items-center gap-1.5 whitespace-nowrap ${
              activeFormTab === 'colors' 
                ? 'border-blue-500 text-blue-400 bg-white dark:bg-neutral-900/80' 
                : 'border-transparent text-neutral-500 dark:text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <ImageIcon className="w-3.5 h-3.5" />
            <span>2. Fotos por Cor ({variants.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveFormTab('specs')}
            className={`px-4 py-2 text-xs font-bold rounded-t-xl border-b-2 transition-all flex items-center gap-1.5 whitespace-nowrap ${
              activeFormTab === 'specs' 
                ? 'border-blue-500 text-blue-400 bg-white dark:bg-neutral-900/80' 
                : 'border-transparent text-neutral-500 dark:text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            <span>3. Ficha Técnica Oficial</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveFormTab('performance')}
            className={`px-4 py-2 text-xs font-bold rounded-t-xl border-b-2 transition-all flex items-center gap-1.5 whitespace-nowrap ${
              activeFormTab === 'performance' 
                ? 'border-blue-500 text-blue-400 bg-white dark:bg-neutral-900/80' 
                : 'border-transparent text-neutral-500 dark:text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <Gauge className="w-3.5 h-3.5" />
            <span>4. Desempenho & Destaques</span>
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="overflow-y-auto p-4 sm:p-6 space-y-5 flex-1">
          
          {/* TAB 1: BASIC INFO */}
          {activeFormTab === 'basic' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="text-[11px] font-bold text-neutral-700 dark:text-neutral-300 uppercase tracking-wider block mb-1.5">
                    Marca do Veículo *
                  </label>
                  <select
                    value={brand}
                    onChange={(e) => setBrand(e.target.value as BrandType)}
                    className="w-full bg-white dark:bg-neutral-900 border border-neutral-700 rounded-xl px-3 py-2 text-xs text-white focus:border-blue-500 focus:outline-none"
                  >
                    <option value="Suzuki">Suzuki</option>
                    <option value="Haojue">Haojue</option>
                    <option value="Zontes">Zontes</option>
                    <option value="Hisun">Hisun (Quadriciclos / ATV)</option>
                    <option value="Kymco">Kymco</option>
                    <option value="Quadriciclos">Quadriciclos Gerais</option>
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="text-[11px] font-bold text-neutral-700 dark:text-neutral-300 uppercase tracking-wider block mb-1.5">
                    Nome do Modelo *
                  </label>
                  <input
                    type="text"
                    value={modelName}
                    onChange={(e) => setModelName(e.target.value)}
                    placeholder="Ex: GSX-S1000GX, V-STROM 800DE, DR160..."
                    required
                    className="w-full bg-white dark:bg-neutral-900 border border-neutral-700 rounded-xl px-3 py-2 text-xs text-white focus:border-blue-500 focus:outline-none font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="text-[11px] font-bold text-neutral-700 dark:text-neutral-300 uppercase tracking-wider block mb-1.5">
                    Ano / Modelo
                  </label>
                  <input
                    type="text"
                    value={yearModel}
                    onChange={(e) => setYearModel(e.target.value)}
                    placeholder="2026/2026"
                    className="w-full bg-white dark:bg-neutral-900 border border-neutral-700 rounded-xl px-3 py-2 text-xs text-white focus:border-blue-500 focus:outline-none font-mono"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-neutral-700 dark:text-neutral-300 uppercase tracking-wider block mb-1.5">
                    Categoria Comercial
                  </label>
                  <input
                    type="text"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    placeholder="Ex: Sport Crossover, Trail, Naked..."
                    className="w-full bg-white dark:bg-neutral-900 border border-neutral-700 rounded-xl px-3 py-2 text-xs text-white focus:border-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-neutral-700 dark:text-neutral-300 uppercase tracking-wider block mb-1.5">
                    Link do Site Oficial
                  </label>
                  <input
                    type="url"
                    value={officialWebUrl}
                    onChange={(e) => setOfficialWebUrl(e.target.value)}
                    placeholder="https://suzukimotos.com.br/modelo/"
                    className="w-full bg-white dark:bg-neutral-900 border border-neutral-700 rounded-xl px-3 py-2 text-xs text-white focus:border-blue-500 focus:outline-none font-mono text-[11px]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 bg-white dark:bg-neutral-900/80 rounded-2xl border border-neutral-200 dark:border-neutral-800 space-y-1.5">
                  <label className="text-[11px] font-bold text-neutral-700 dark:text-neutral-300 uppercase tracking-wider block">
                    Custo de Faturamento Concessionária (R$) *
                  </label>
                  <input
                    type="number"
                    value={factoryCost}
                    onChange={(e) => setFactoryCost(parseFloat(e.target.value) || 0)}
                    step="100"
                    required
                    className="w-full bg-neutral-50 dark:bg-neutral-950 border border-neutral-700 rounded-xl px-3 py-2 text-sm text-white font-mono font-bold focus:border-blue-500 focus:outline-none"
                  />
                  <p className="text-[10px] text-neutral-500 dark:text-neutral-400">Preço cobrado pela montadora da rede autorizada.</p>
                </div>

                <div className="p-4 bg-white dark:bg-neutral-900/80 rounded-2xl border border-neutral-200 dark:border-neutral-800 space-y-1.5">
                  <label className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider block">
                    PPS Sugerido ao Consumidor Final (R$) *
                  </label>
                  <input
                    type="number"
                    value={ppsMSRP}
                    onChange={(e) => setPpsMSRP(parseFloat(e.target.value) || 0)}
                    step="100"
                    required
                    className="w-full bg-neutral-50 dark:bg-neutral-950 border border-neutral-700 rounded-xl px-3 py-2 text-sm text-emerald-400 font-mono font-bold focus:border-emerald-500 focus:outline-none"
                  />
                  <p className="text-[10px] text-neutral-500 dark:text-neutral-400">Preço Público Sugerido (Tabela Nacional).</p>
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-neutral-700 dark:text-neutral-300 uppercase tracking-wider block mb-1.5">
                  Breve Descritivo Comercial da Motocicleta
                </label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Resumo comercial, público-alvo, proposta de valor e ergonomia do modelo..."
                  className="w-full bg-white dark:bg-neutral-900 border border-neutral-700 rounded-xl p-3 text-xs text-white focus:border-blue-500 focus:outline-none leading-relaxed"
                />
              </div>
            </div>
          )}

          {/* TAB 2: COLORS & PHOTOS */}
          {activeFormTab === 'colors' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                    Grade de Cores Oficiais & Fotos Individuais
                  </h3>
                  <p className="text-[11px] text-neutral-500 dark:text-neutral-400">
                    Defina a foto exata exibida quando o comprador/concessionária selecionar cada cor.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleAddVariant}
                  className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md shadow-blue-500/20"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Adicionar Cor</span>
                </button>
              </div>

              <div className="space-y-3">
                {variants.map((v, idx) => (
                  <div 
                    key={v.id}
                    className="p-4 bg-white dark:bg-neutral-900/90 rounded-2xl border border-neutral-200 dark:border-neutral-800 space-y-3 hover:border-neutral-700 transition-colors"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2">
                          <input
                            type="color"
                            value={v.colorHex}
                            onChange={(e) => handleUpdateVariant(idx, 'colorHex', e.target.value)}
                            className="w-8 h-8 rounded-lg cursor-pointer bg-transparent border-0"
                            title="Escolher cor visual"
                          />
                          <span className="text-xs font-mono text-neutral-500 dark:text-neutral-400">{v.colorHex}</span>
                        </div>

                        <div className="w-16">
                          <input
                            type="text"
                            value={v.colorCode || ''}
                            onChange={(e) => handleUpdateVariant(idx, 'colorCode', e.target.value)}
                            placeholder="Cód."
                            className="w-full bg-neutral-50 dark:bg-neutral-950 border border-neutral-700 rounded-lg px-2 py-1 text-xs text-white font-mono text-center"
                            title="Código oficial da cor na Suzuki (Ex: YSF, YU1)"
                          />
                        </div>
                      </div>

                      <div className="flex-1 sm:px-2">
                        <input
                          type="text"
                          value={v.colorName}
                          onChange={(e) => handleUpdateVariant(idx, 'colorName', e.target.value)}
                          placeholder="Nome da cor (Ex: Azul Metálico Triton)"
                          className="w-full bg-neutral-50 dark:bg-neutral-950 border border-neutral-700 rounded-lg px-3 py-1.5 text-xs text-white font-bold"
                        />
                      </div>

                      <div className="flex items-center gap-2">
                        <select
                          value={v.stockStatus}
                          onChange={(e) => handleUpdateVariant(idx, 'stockStatus', e.target.value as any)}
                          className="bg-neutral-50 dark:bg-neutral-950 border border-neutral-700 rounded-lg px-2.5 py-1.5 text-xs text-white"
                        >
                          <option value="disponivel">Disponível</option>
                          <option value="poucas">Lote Limitado</option>
                          <option value="sem_estoque">Sem Estoque</option>
                        </select>

                        <button
                          type="button"
                          onClick={() => handleRemoveVariant(idx)}
                          className="p-1.5 bg-neutral-800 hover:bg-rose-900/60 text-neutral-500 dark:text-neutral-400 hover:text-rose-300 rounded-lg transition-colors"
                          title="Remover cor"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Image URL & Thumbnail Preview */}
                    <div className="flex items-center gap-3 pt-2 border-t border-neutral-200 dark:border-neutral-800/60">
                      <div className="w-16 h-12 rounded-lg bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 flex items-center justify-center shrink-0 overflow-hidden">
                        {v.imageUrl ? (
                          <img 
                            src={v.imageUrl} 
                            alt={v.colorName} 
                            className="w-full h-full object-contain p-1"
                            referrerPolicy="no-referrer"
                          />
                        ) : (
                          <ImageIcon className="w-5 h-5 text-neutral-600" />
                        )}
                      </div>

                      <div className="flex-1">
                        <label className="text-[10px] uppercase font-bold text-neutral-500 dark:text-neutral-400 block mb-0.5">
                          URL da Foto Oficial Desta Cor ({v.colorName}):
                        </label>
                        <input
                          type="url"
                          value={v.imageUrl || ''}
                          onChange={(e) => handleUpdateVariant(idx, 'imageUrl', e.target.value)}
                          placeholder="https://... foto da moto nesta cor"
                          className="w-full bg-neutral-50 dark:bg-neutral-950 border border-neutral-700 rounded-lg px-3 py-1.5 text-xs text-white font-mono text-[11px]"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: TECHNICAL SPECS */}
          {activeFormTab === 'specs' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              
              {/* Motor & Injeção */}
              <div className="p-4 bg-white dark:bg-neutral-900/60 rounded-2xl border border-neutral-200 dark:border-neutral-800 space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold text-blue-400 border-b border-neutral-200 dark:border-neutral-800 pb-2">
                  <Zap className="w-4 h-4" />
                  <span>Motorização, Câmbio & Injeção Eletrônica</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="sm:col-span-2">
                    <label className="text-[10px] text-neutral-500 dark:text-neutral-400 block mb-1">Tipo do Motor</label>
                    <input
                      type="text"
                      value={engineType}
                      onChange={(e) => setEngineType(e.target.value)}
                      placeholder="Ex: 4 tempos, DOHC, bicilíndrico paralelo 776cc, refrigeração líquida"
                      className="w-full bg-neutral-50 dark:bg-neutral-950 border border-neutral-700 rounded-lg px-3 py-1.5 text-xs text-white"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] text-neutral-500 dark:text-neutral-400 block mb-1">Cilindrada Real (cm³)</label>
                    <input
                      type="text"
                      value={displacement}
                      onChange={(e) => setDisplacement(e.target.value)}
                      placeholder="Ex: 776 cm³ / 999 cm³"
                      className="w-full bg-neutral-50 dark:bg-neutral-950 border border-neutral-700 rounded-lg px-3 py-1.5 text-xs text-white font-mono"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] text-neutral-500 dark:text-neutral-400 block mb-1">Taxa de Compressão</label>
                    <input
                      type="text"
                      value={compressionRatio}
                      onChange={(e) => setCompressionRatio(e.target.value)}
                      placeholder="Ex: 12.8:1"
                      className="w-full bg-neutral-50 dark:bg-neutral-950 border border-neutral-700 rounded-lg px-3 py-1.5 text-xs text-white font-mono"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] text-neutral-500 dark:text-neutral-400 block mb-1">Potência Máxima</label>
                    <input
                      type="text"
                      value={power}
                      onChange={(e) => setPower(e.target.value)}
                      placeholder="Ex: 84,3 cv @ 8.500 rpm"
                      className="w-full bg-neutral-50 dark:bg-neutral-950 border border-neutral-700 rounded-lg px-3 py-1.5 text-xs text-blue-400 font-bold font-mono"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] text-neutral-500 dark:text-neutral-400 block mb-1">Torque Máximo</label>
                    <input
                      type="text"
                      value={torque}
                      onChange={(e) => setTorque(e.target.value)}
                      placeholder="Ex: 7,95 kgf.m @ 6.800 rpm"
                      className="w-full bg-neutral-50 dark:bg-neutral-950 border border-neutral-700 rounded-lg px-3 py-1.5 text-xs text-blue-400 font-bold font-mono"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] text-neutral-500 dark:text-neutral-400 block mb-1">Sistema de Alimentação</label>
                    <input
                      type="text"
                      value={fuelSystem}
                      onChange={(e) => setFuelSystem(e.target.value)}
                      placeholder="Injeção Eletrônica Multiponto com Ride-by-Wire"
                      className="w-full bg-neutral-50 dark:bg-neutral-950 border border-neutral-700 rounded-lg px-3 py-1.5 text-xs text-white"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] text-neutral-500 dark:text-neutral-400 block mb-1">Câmbio & Embreagem</label>
                    <input
                      type="text"
                      value={transmission}
                      onChange={(e) => setTransmission(e.target.value)}
                      placeholder="6 velocidades com Quickshifter Bi-direcional"
                      className="w-full bg-neutral-50 dark:bg-neutral-950 border border-neutral-700 rounded-lg px-3 py-1.5 text-xs text-white"
                    />
                  </div>
                </div>
              </div>

              {/* Suspensão, Freios e Dimensões */}
              <div className="p-4 bg-white dark:bg-neutral-900/60 rounded-2xl border border-neutral-200 dark:border-neutral-800 space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold text-emerald-400 border-b border-neutral-200 dark:border-neutral-800 pb-2">
                  <ShieldCheck className="w-4 h-4" />
                  <span>Ciclística, Freios, Suspensão & Dimensões</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="text-[10px] text-neutral-500 dark:text-neutral-400 block mb-1">Suspensão Dianteira</label>
                    <input
                      type="text"
                      value={frontSuspension}
                      onChange={(e) => setFrontSuspension(e.target.value)}
                      placeholder="Garfo telescópico invertido Showa 220 mm"
                      className="w-full bg-neutral-50 dark:bg-neutral-950 border border-neutral-700 rounded-lg px-3 py-1.5 text-xs text-white"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] text-neutral-500 dark:text-neutral-400 block mb-1">Suspensão Traseira</label>
                    <input
                      type="text"
                      value={rearSuspension}
                      onChange={(e) => setRearSuspension(e.target.value)}
                      placeholder="Monoamortecedor Showa regulável Link"
                      className="w-full bg-neutral-50 dark:bg-neutral-950 border border-neutral-700 rounded-lg px-3 py-1.5 text-xs text-white"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] text-neutral-500 dark:text-neutral-400 block mb-1">Freio Dianteiro</label>
                    <input
                      type="text"
                      value={frontBrake}
                      onChange={(e) => setFrontBrake(e.target.value)}
                      placeholder="Disco duplo de 310 mm com pinças radiais"
                      className="w-full bg-neutral-50 dark:bg-neutral-950 border border-neutral-700 rounded-lg px-3 py-1.5 text-xs text-white"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] text-neutral-500 dark:text-neutral-400 block mb-1">Freio Traseiro / ABS</label>
                    <input
                      type="text"
                      value={absSystem}
                      onChange={(e) => setAbsSystem(e.target.value)}
                      placeholder="ABS de duplo canal com desligamento traseiro"
                      className="w-full bg-neutral-50 dark:bg-neutral-950 border border-neutral-700 rounded-lg px-3 py-1.5 text-xs text-white"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] text-neutral-500 dark:text-neutral-400 block mb-1">Pneu Dianteiro / Traseiro</label>
                    <input
                      type="text"
                      value={`${frontTire} / ${rearTire}`}
                      onChange={(e) => {
                        const parts = e.target.value.split('/');
                        setFrontTire(parts[0]?.trim() || '');
                        if (parts[1]) setRearTire(parts[1].trim());
                      }}
                      placeholder="90/90-21 / 150/70R17"
                      className="w-full bg-neutral-50 dark:bg-neutral-950 border border-neutral-700 rounded-lg px-3 py-1.5 text-xs text-white font-mono"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] text-neutral-500 dark:text-neutral-400 block mb-1">Tanque de Combustível</label>
                    <input
                      type="text"
                      value={fuelTank}
                      onChange={(e) => setFuelTank(e.target.value)}
                      placeholder="20,0 Litros"
                      className="w-full bg-neutral-50 dark:bg-neutral-950 border border-neutral-700 rounded-lg px-3 py-1.5 text-xs text-amber-400 font-bold font-mono"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] text-neutral-500 dark:text-neutral-400 block mb-1">Peso em Ordem de Marcha</label>
                    <input
                      type="text"
                      value={curbWeight}
                      onChange={(e) => setCurbWeight(e.target.value)}
                      placeholder="230 kg"
                      className="w-full bg-neutral-50 dark:bg-neutral-950 border border-neutral-700 rounded-lg px-3 py-1.5 text-xs text-white font-mono"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] text-neutral-500 dark:text-neutral-400 block mb-1">Altura do Assento</label>
                    <input
                      type="text"
                      value={seatHeight}
                      onChange={(e) => setSeatHeight(e.target.value)}
                      placeholder="855 mm"
                      className="w-full bg-neutral-50 dark:bg-neutral-950 border border-neutral-700 rounded-lg px-3 py-1.5 text-xs text-white font-mono"
                    />
                  </div>
                </div>
              </div>

            </div>
          )}

          {/* TAB 4: PERFORMANCE & HIGHLIGHTS */}
          {activeFormTab === 'performance' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              
              {/* Desempenho e Dinâmica */}
              <div className="p-4 bg-white dark:bg-neutral-900/60 rounded-2xl border border-neutral-200 dark:border-neutral-800 space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold text-amber-400 border-b border-neutral-200 dark:border-neutral-800 pb-2">
                  <Gauge className="w-4 h-4" />
                  <span>Desempenho, Aceleração & Consumo</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="text-[10px] text-neutral-500 dark:text-neutral-400 block mb-1">Velocidade Máxima Estimada</label>
                    <input
                      type="text"
                      value={topSpeed}
                      onChange={(e) => setTopSpeed(e.target.value)}
                      placeholder="Ex: 210 km/h"
                      className="w-full bg-neutral-50 dark:bg-neutral-950 border border-neutral-700 rounded-lg px-3 py-1.5 text-xs text-emerald-400 font-bold font-mono"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] text-neutral-500 dark:text-neutral-400 block mb-1">Aceleração 0 a 100 km/h</label>
                    <input
                      type="text"
                      value={acceleration0to100}
                      onChange={(e) => setAcceleration0to100(e.target.value)}
                      placeholder="Ex: 3.9 segundos"
                      className="w-full bg-neutral-50 dark:bg-neutral-950 border border-neutral-700 rounded-lg px-3 py-1.5 text-xs text-blue-400 font-bold font-mono"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] text-neutral-500 dark:text-neutral-400 block mb-1">Consumo Médio (km/L)</label>
                    <input
                      type="text"
                      value={avgConsumption}
                      onChange={(e) => setAvgConsumption(e.target.value)}
                      placeholder="Ex: 22.7 km/L"
                      className="w-full bg-neutral-50 dark:bg-neutral-950 border border-neutral-700 rounded-lg px-3 py-1.5 text-xs text-amber-400 font-mono font-bold"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] text-neutral-500 dark:text-neutral-400 block mb-1">Autonomia Estimada por Tanque</label>
                    <input
                      type="text"
                      value={estimatedRange}
                      onChange={(e) => setEstimatedRange(e.target.value)}
                      placeholder="Ex: 450 km"
                      className="w-full bg-neutral-50 dark:bg-neutral-950 border border-neutral-700 rounded-lg px-3 py-1.5 text-xs text-purple-400 font-mono font-bold"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="text-[10px] text-neutral-500 dark:text-neutral-400 block mb-1">Resumo Rápido de Performance</label>
                    <input
                      type="text"
                      value={performanceSummary}
                      onChange={(e) => setPerformanceSummary(e.target.value)}
                      placeholder="Ex: Potência brutal de 152 cv com 0-100 em 3.2s e suspensão semi-ativa."
                      className="w-full bg-neutral-50 dark:bg-neutral-950 border border-neutral-700 rounded-lg px-3 py-1.5 text-xs text-white"
                    />
                  </div>
                </div>
              </div>

              {/* Destaques / Features */}
              <div className="p-4 bg-white dark:bg-neutral-900/60 rounded-2xl border border-neutral-200 dark:border-neutral-800 space-y-2">
                <label className="text-[11px] font-bold text-neutral-700 dark:text-neutral-300 uppercase tracking-wider block">
                  Destaques & Equipamentos de Série (1 por linha)
                </label>
                <textarea
                  rows={5}
                  value={featuresText}
                  onChange={(e) => setFeaturesText(e.target.value)}
                  placeholder="Suspensão Eletrônica SAES&#10;Quickshifter Bi-direcional&#10;Painel TFT 6.5 polegadas..."
                  className="w-full bg-neutral-50 dark:bg-neutral-950 border border-neutral-700 rounded-xl p-3 text-xs text-white focus:border-blue-500 focus:outline-none font-mono"
                />
              </div>

            </div>
          )}

        </form>

        {/* Footer Actions */}
        <div className="p-4 border-t border-[#27272a] bg-neutral-50 dark:bg-neutral-950 flex items-center justify-between shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-700 dark:text-neutral-300 rounded-xl text-xs font-bold transition-colors"
          >
            Cancelar
          </button>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleSubmit}
              className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold flex items-center gap-2 transition-all shadow-lg shadow-blue-500/25 active:scale-95"
            >
              <Save className="w-4 h-4" />
              <span>Salvar Cadastro da Motocicleta</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
