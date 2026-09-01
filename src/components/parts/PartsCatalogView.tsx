import React, { useState, useMemo, useEffect } from 'react';
import { 
  Bike, 
  ShoppingCart, 
  Search, 
  Layers, 
  Filter, 
  ChevronRight, 
  ArrowLeft, 
  CheckCircle2, 
  Clock, 
  Building2, 
  ShieldCheck, 
  Truck, 
  FileText, 
  Sparkles, 
  Flame, 
  Wrench, 
  Package, 
  Database,
  Eye,
  Plus,
  RefreshCw,
  SlidersHorizontal,
  ChevronDown,
  ChevronUp,
  Upload
} from 'lucide-react';
import { 
  PartsBrand, 
  PartsModelSummary, 
  PartsDiagramGroup, 
  PartsItem, 
  PartsCartItem, 
  PartsOrder, 
  PartsOrderType,
  DealershipScope,
  DealershipFullProfile
} from '../../types';
import { 
  MOCK_PARTS_MODELS, 
  MOCK_HAYABUSA_DIAGRAMS,
  ALL_CATALOG_DIAGRAMS_MAP,
  INITIAL_MOCK_PARTS_ORDERS 
} from '../../data/mockPartsData';
import { PartsExplodedDiagram } from './PartsExplodedDiagram';
import { PartsTable } from './PartsTable';
import { PartsDiagramCarousel } from './PartsDiagramCarousel';
import { PartsCartDrawer } from './PartsCartDrawer';
import { PartsOrderMirrorModal } from './PartsOrderMirrorModal';
import { PartsCatalogUploadModal } from './PartsCatalogUploadModal';

interface PartsCatalogViewProps {
  currentScope: DealershipScope;
  dealerships: DealershipFullProfile[];
  partsOrders: PartsOrder[];
  onPlacePartsOrder: (order: PartsOrder) => void;
  onUpdatePartsOrder: (order: PartsOrder) => void;
}

export const PartsCatalogView: React.FC<PartsCatalogViewProps> = ({
  currentScope,
  dealerships,
  partsOrders,
  onPlacePartsOrder,
  onUpdatePartsOrder
}) => {
  const isMontadora = currentScope === 'jtoledo';
  const currentDealer = dealerships.find(d => d.id === currentScope);

  // Main Navigation Tabs within the module
  const [activeModuleTab, setActiveModuleTab] = useState<'catalog' | 'orders'>('catalog');

  // Custom Catalogs & Upload Modal State
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [customModels, setCustomModels] = useState<PartsModelSummary[]>([]);
  const [customDiagramsMap, setCustomDiagramsMap] = useState<{ [modelId: string]: PartsDiagramGroup[] }>({});

  const allModels = useMemo(() => {
    return [...customModels, ...MOCK_PARTS_MODELS];
  }, [customModels]);

  // Dynamic brand counts calculation
  const brandCounts = useMemo(() => {
    const counts: Record<string, number> = {
      Suzuki: 0,
      Haojue: 0,
      Zontes: 0,
      Hisun: 0,
      Kymco: 0,
      ALL: allModels.length,
    };
    allModels.forEach((m) => {
      counts[m.brand] = (counts[m.brand] || 0) + 1;
    });
    return counts;
  }, [allModels]);

  // E-commerce Brand & Model Selection State
  const [selectedBrand, setSelectedBrand] = useState<PartsBrand | 'ALL'>('ALL');
  const [modelSearchQuery, setModelSearchQuery] = useState('');
  const [selectedModel, setSelectedModel] = useState<PartsModelSummary | null>(MOCK_PARTS_MODELS[0]); // Default to Hayabusa
  const [isModelsSectionExpanded, setIsModelsSectionExpanded] = useState<boolean>(true);

  // EPC Diagram & Selection State
  const activeDiagrams = useMemo(() => {
    if (!selectedModel) return MOCK_HAYABUSA_DIAGRAMS;
    if (customDiagramsMap[selectedModel.id]) {
      return customDiagramsMap[selectedModel.id];
    }
    if (ALL_CATALOG_DIAGRAMS_MAP[selectedModel.id]) {
      return ALL_CATALOG_DIAGRAMS_MAP[selectedModel.id];
    }
    return MOCK_HAYABUSA_DIAGRAMS;
  }, [selectedModel, customDiagramsMap]);

  const [selectedDiagram, setSelectedDiagram] = useState<PartsDiagramGroup>(MOCK_HAYABUSA_DIAGRAMS[0]);

  useEffect(() => {
    if (activeDiagrams && activeDiagrams.length > 0) {
      setSelectedDiagram(activeDiagrams[0]);
    }
  }, [selectedModel, activeDiagrams]);

  const [selectedRef, setSelectedRef] = useState<number | null>(null);
  const [hoveredRef, setHoveredRef] = useState<number | null>(null);

  const handleCatalogImportSuccess = (newModel: PartsModelSummary, diagrams: PartsDiagramGroup[]) => {
    setCustomModels(prev => [newModel, ...prev]);
    setCustomDiagramsMap(prev => ({ ...prev, [newModel.id]: diagrams }));
    setSelectedModel(newModel);
    if (diagrams.length > 0) {
      setSelectedDiagram(diagrams[0]);
    }
  };

  // Cart State
  const [cartItems, setCartItems] = useState<PartsCartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Order Details Modal State
  const [viewingOrder, setViewingOrder] = useState<PartsOrder | null>(null);

  // Order List Filter State
  const [orderStatusFilter, setOrderStatusFilter] = useState<'ALL' | 'aguardando_analise' | 'em_separacao_cd' | 'integrado_protheus' | 'faturado_despachado'>('ALL');
  const [orderSearchQuery, setOrderSearchQuery] = useState('');

  // Handle Add To Cart
  const handleAddToCart = (part: PartsItem, quantity: number) => {
    if (!selectedModel) return;

    setCartItems(prev => {
      const existingIdx = prev.findIndex(item => item.part.id === part.id && item.modelId === selectedModel.id);
      if (existingIdx >= 0) {
        const updated = [...prev];
        const newQty = updated[existingIdx].quantity + quantity;
        updated[existingIdx] = {
          ...updated[existingIdx],
          quantity: newQty,
          totalPrice: newQty * updated[existingIdx].unitPrice
        };
        return updated;
      } else {
        const newItem: PartsCartItem = {
          id: `cart-${Date.now()}-${part.id}`,
          modelId: selectedModel.id,
          modelName: selectedModel.name,
          brand: selectedModel.brand,
          illustrationCode: selectedDiagram.illustrationCode,
          diagramTitle: selectedDiagram.title,
          part,
          quantity,
          unitPrice: part.factoryPrice,
          totalPrice: part.factoryPrice * quantity
        };
        return [...prev, newItem];
      }
    });
  };

  const handleUpdateCartQuantity = (itemId: string, delta: number) => {
    setCartItems(prev => {
      return prev.map(item => {
        if (item.id === itemId) {
          const newQty = Math.max(1, item.quantity + delta);
          return {
            ...item,
            quantity: newQty,
            totalPrice: newQty * item.unitPrice
          };
        }
        return item;
      });
    });
  };

  const handleRemoveCartItem = (itemId: string) => {
    setCartItems(prev => prev.filter(item => item.id !== itemId));
  };

  const handleClearCart = () => {
    setCartItems([]);
  };

  // Submit Order to Factory
  const handleSubmitOrder = (details: {
    orderType: PartsOrderType;
    freightMode: 'CIF' | 'FOB';
    paymentMethod: string;
    notes: string;
    vinApplication?: string;
  }) => {
    const totalUnits = cartItems.reduce((acc, i) => acc + i.quantity, 0);
    const subtotal = cartItems.reduce((acc, i) => acc + i.totalPrice, 0);
    const freightCost = details.freightMode === 'FOB' ? 0 : (details.orderType === 'urgente_vor' ? 120 : (subtotal >= 3000 ? 0 : 95));
    const totalAmount = subtotal + freightCost;

    const orderNumber = `PED-PEC-2024-${Math.floor(1000 + Math.random() * 9000)}`;

    const newOrder: PartsOrder = {
      id: `ord-pec-${Date.now()}`,
      orderNumber,
      dealershipId: currentScope === 'jtoledo' ? 'novamotor' : currentScope,
      dealershipName: currentDealer?.name || 'Nova Motor Suzuki Moema',
      dealershipCnpj: currentDealer?.cnpj || '14.281.992/0001-88',
      dealershipCity: currentDealer?.city || 'São Paulo',
      dealershipState: currentDealer?.state || 'SP',
      dealershipRegion: currentDealer?.region || 'Sudeste',
      dealershipTier: currentDealer?.tier || 'Diamante',
      orderType: details.orderType,
      status: 'aguardando_analise',
      createdAt: new Date().toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' }),
      items: [...cartItems],
      totalPartsCount: totalUnits,
      totalUniqueItems: cartItems.length,
      subtotalAmount: subtotal,
      freightAmount: freightCost,
      freightMode: details.freightMode,
      totalAmount,
      paymentMethod: details.paymentMethod,
      notes: details.notes,
      vinApplication: details.vinApplication,
      creditApproved: false,
      commercialApproved: false,
      protheusIntegrated: false
    };

    onPlacePartsOrder(newOrder);
    setCartItems([]);
    setViewingOrder(newOrder);
    setActiveModuleTab('orders');
  };

  // Factory Workflow Handlers
  const handleApproveStock = (orderId: string) => {
    const order = partsOrders.find(o => o.id === orderId);
    if (!order) return;
    const updated: PartsOrder = {
      ...order,
      stockVerified: true,
      stockVerifiedAt: new Date().toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' }),
      stockAnalyst: 'Rodrigo Pires (CD Jundiaí)',
      allocatedWarehouse: 'CD Jundiaí (SP)',
      status: 'em_separacao_cd'
    };
    onUpdatePartsOrder(updated);
    if (viewingOrder?.id === orderId) setViewingOrder(updated);
  };

  const handleApproveCredit = (orderId: string) => {
    const order = partsOrders.find(o => o.id === orderId);
    if (!order) return;
    const updated: PartsOrder = {
      ...order,
      creditApproved: true,
      creditApprovedAt: new Date().toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' }),
      creditAnalyst: 'Fábio Mesquita (Financeiro JTA)',
      commercialApproved: true,
      commercialApprovedAt: new Date().toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' }),
      commercialManager: 'Carlos Drummond (Gerência JTZ)',
      status: order.protheusIntegrated ? 'integrado_protheus' : 'aprovado_fabrica'
    };
    onUpdatePartsOrder(updated);
    if (viewingOrder?.id === orderId) setViewingOrder(updated);
  };

  const handleIntegrateProtheus = (orderId: string) => {
    const order = partsOrders.find(o => o.id === orderId);
    if (!order) return;
    const protheusNum = `SC5-PEC-${Math.floor(90000 + Math.random() * 9999)}`;
    const nfeNum = `NF-e 000.${Math.floor(400 + Math.random() * 500)}.${Math.floor(100 + Math.random() * 899)}-Série 1`;

    const updated: PartsOrder = {
      ...order,
      protheusIntegrated: true,
      protheusOrderNumber: protheusNum,
      protheusIntegratedAt: new Date().toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' }),
      protheusNFeNumber: nfeNum,
      protheusCarrierName: 'Braspress Transportes Rápidos',
      protheusTrackingCode: `BP-${Math.floor(10000000 + Math.random() * 90000000)}BR`,
      status: 'integrado_protheus'
    };
    onUpdatePartsOrder(updated);
    if (viewingOrder?.id === orderId) setViewingOrder(updated);
  };

  const handleDispatchOrder = (orderId: string) => {
    const order = partsOrders.find(o => o.id === orderId);
    if (!order) return;
    const updated: PartsOrder = {
      ...order,
      status: 'faturado_despachado'
    };
    onUpdatePartsOrder(updated);
    if (viewingOrder?.id === orderId) setViewingOrder(updated);
  };

  // Filtered Models for E-Commerce Catalog
  const filteredModels = useMemo(() => {
    return allModels.filter(model => {
      const matchBrand = selectedBrand === 'ALL' || model.brand === selectedBrand;
      const matchSearch = !modelSearchQuery.trim() || 
        model.name.toLowerCase().includes(modelSearchQuery.toLowerCase()) ||
        model.displacement.toLowerCase().includes(modelSearchQuery.toLowerCase()) ||
        model.chassisPrefix.toLowerCase().includes(modelSearchQuery.toLowerCase()) ||
        model.category.toLowerCase().includes(modelSearchQuery.toLowerCase());
      return matchBrand && matchSearch;
    });
  }, [allModels, selectedBrand, modelSearchQuery]);

  // Filtered Orders for the Orders Tab
  const scopedOrders = useMemo(() => {
    return partsOrders.filter(order => {
      const matchScope = isMontadora || order.dealershipId === currentScope;
      const matchStatus = orderStatusFilter === 'ALL' || order.status === orderStatusFilter;
      const matchSearch = !orderSearchQuery.trim() ||
        order.orderNumber.toLowerCase().includes(orderSearchQuery.toLowerCase()) ||
        order.dealershipName.toLowerCase().includes(orderSearchQuery.toLowerCase()) ||
        (order.vinApplication && order.vinApplication.toLowerCase().includes(orderSearchQuery.toLowerCase())) ||
        order.items.some(i => i.part.partNumber.toLowerCase().includes(orderSearchQuery.toLowerCase()));
      return matchScope && matchStatus && matchSearch;
    });
  }, [partsOrders, isMontadora, currentScope, orderStatusFilter, orderSearchQuery]);

  const totalCartUnits = cartItems.reduce((acc, i) => acc + i.quantity, 0);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Top Banner & Module Navigation Header */}
      <div className="bg-gradient-to-r from-neutral-900 via-[#18181b] to-neutral-900 border border-[#27272a] rounded-3xl p-5 sm:p-6 shadow-2xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xs uppercase font-bold tracking-widest text-amber-400 font-mono flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5" />
                Catálogo Eletrônico de Peças Genuínas (EPC)
              </span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 font-bold">
                J. Toledo Suzuki • JTZ Motors
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-black text-white tracking-tight">
              {isMontadora ? 'Gestão de Pedidos de Peças da Rede & ERP' : 'Catálogo Técnico & Pedido de Peças'}
            </h1>
            <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400 max-w-2xl">
              Selecione o modelo da moto, consulte as vistas explodidas interativas e monte seu carrinho de peças genuínas com transmissão direta para faturamento e integração ERP.
            </p>
          </div>

          {/* Action Tabs & Shopping Cart Button */}
          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <div className="bg-neutral-50 dark:bg-neutral-950/80 p-1 rounded-2xl border border-neutral-200 dark:border-neutral-800 flex items-center">
              <button
                onClick={() => setActiveModuleTab('catalog')}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                  activeModuleTab === 'catalog'
                    ? 'bg-amber-500 text-black shadow-md shadow-amber-500/20'
                    : 'text-neutral-500 dark:text-neutral-400 hover:text-white'
                }`}
              >
                <Bike className="w-4 h-4" />
                <span>Catálogo & Compra EPC</span>
              </button>

              <button
                onClick={() => setActiveModuleTab('orders')}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                  activeModuleTab === 'orders'
                    ? 'bg-amber-500 text-black shadow-md shadow-amber-500/20'
                    : 'text-neutral-500 dark:text-neutral-400 hover:text-white'
                }`}
              >
                <FileText className="w-4 h-4" />
                <span>{isMontadora ? 'Pedidos da Rede' : 'Meus Pedidos'}</span>
                {scopedOrders.length > 0 && (
                  <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono font-bold ${
                    activeModuleTab === 'orders' ? 'bg-black text-white' : 'bg-neutral-800 text-amber-400'
                  }`}>
                    {scopedOrders.length}
                  </span>
                )}
              </button>
            </div>

            {/* Upload New Catalog Modal Trigger */}
            <button
              onClick={() => setIsUploadModalOpen(true)}
              className="px-3.5 py-2.5 bg-white dark:bg-neutral-900 border border-neutral-700 hover:border-red-500 hover:bg-neutral-800 text-white font-bold text-xs rounded-2xl flex items-center gap-2 transition-all shadow-md"
            >
              <Upload className="w-4 h-4 text-red-500" />
              <span>Subir Novo Catálogo</span>
            </button>

            {/* Shopping Cart Floating Drawer Trigger */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="px-4 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-black text-xs rounded-2xl flex items-center gap-2 shadow-lg shadow-amber-500/25 transition-all transform hover:scale-105"
            >
              <ShoppingCart className="w-4 h-4" />
              <span>Carrinho de Peças</span>
              {totalCartUnits > 0 && (
                <span className="w-5 h-5 rounded-full bg-black text-amber-400 text-xs font-mono font-bold flex items-center justify-center">
                  {totalCartUnits}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* MODULE TAB 1: E-COMMERCE EPC PARTS CATALOG & EXPLODED DIAGRAM EXPLORER */}
      {/* ========================================================================= */}
      {activeModuleTab === 'catalog' && (
        <div className="space-y-6">
          
          {/* STEP 1: BRAND SELECTOR & MOTORCYCLE MODELS GALLERY */}
          <div className="bg-[#121215] border border-[#27272a] rounded-3xl p-5 sm:p-6 shadow-xl space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center justify-between w-full sm:w-auto">
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-white tracking-tight flex items-center gap-2">
                    <Bike className="w-5 h-5 text-amber-400" />
                    1. Escolha a Marca & Modelo da Motocicleta
                  </h3>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400">
                    Clique na moto para carregar os diagramas técnicos e vistas explodidas oficiais (EPC).
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                {/* Expand / Collapse Section Button */}
                <button
                  onClick={() => setIsModelsSectionExpanded(!isModelsSectionExpanded)}
                  className="px-3 py-1.5 bg-white dark:bg-neutral-900 border border-neutral-700 hover:border-amber-400 text-amber-400 font-bold text-xs rounded-xl flex items-center gap-1.5 transition-all shadow-sm shrink-0"
                  title={isModelsSectionExpanded ? "Comprimir galeria de modelos" : "Expandir galeria de modelos"}
                >
                  {isModelsSectionExpanded ? (
                    <>
                      <ChevronUp className="w-4 h-4" />
                      <span className="hidden md:inline">Recolher Modelos</span>
                    </>
                  ) : (
                    <>
                      <ChevronDown className="w-4 h-4" />
                      <span className="hidden md:inline">Expandir Modelos</span>
                    </>
                  )}
                </button>

                {/* Search by Model Name or Chassis VIN */}
                <div className="relative min-w-[200px] sm:min-w-[260px]">
                  <Search className="w-4 h-4 absolute left-3.5 top-3 text-neutral-500 dark:text-neutral-400" />
                  <input
                    type="text"
                    value={modelSearchQuery}
                    onChange={(e) => setModelSearchQuery(e.target.value)}
                    placeholder="Buscar modelo ou prefixo de chassi..."
                    className="w-full bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl pl-10 pr-4 py-2 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-amber-400"
                  />
                  {modelSearchQuery && (
                    <button 
                      onClick={() => setModelSearchQuery('')}
                      className="absolute right-3 top-2.5 text-neutral-500 dark:text-neutral-400 hover:text-white text-xs"
                    >
                      ✕
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Brand Filter Tabs matching official Suzuki & JTZ Motors layout */}
            {isModelsSectionExpanded && (
              <div className="flex flex-col lg:flex-row gap-6 animate-in fade-in duration-200">
              
              {/* Left Brand Selector Bar (Matching the 5 uploaded images) */}
              <div className="w-full lg:w-52 shrink-0 bg-white dark:bg-neutral-900/90 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-3 flex lg:flex-col gap-1 overflow-x-auto">
                <button
                  onClick={() => setSelectedBrand('Suzuki')}
                  className={`px-4 py-2.5 rounded-xl text-xs font-black tracking-wider uppercase transition-all text-left flex items-center justify-between ${
                    selectedBrand === 'Suzuki'
                      ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/40 font-black'
                      : 'text-neutral-700 dark:text-neutral-300 hover:bg-neutral-800 hover:text-white'
                  }`}
                >
                  <span>SUZUKI</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-black/30 text-blue-200">
                    {brandCounts['Suzuki'] || 0}
                  </span>
                </button>

                <div className="hidden lg:block pt-3 pb-1 px-3">
                  <span className="text-[10px] font-black uppercase tracking-widest text-neutral-500 underline decoration-neutral-700">
                    + MARCAS DO GRUPO
                  </span>
                </div>

                <button
                  onClick={() => setSelectedBrand('Haojue')}
                  className={`px-4 py-2.5 rounded-xl text-xs font-black tracking-wider uppercase transition-all text-left flex items-center justify-between ${
                    selectedBrand === 'Haojue'
                      ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/40 font-black'
                      : 'text-neutral-700 dark:text-neutral-300 hover:bg-neutral-800 hover:text-white'
                  }`}
                >
                  <span>HAOJUE</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-black/30 text-blue-200">
                    {brandCounts['Haojue'] || 0}
                  </span>
                </button>

                <button
                  onClick={() => setSelectedBrand('Zontes')}
                  className={`px-4 py-2.5 rounded-xl text-xs font-black tracking-wider uppercase transition-all text-left flex items-center justify-between ${
                    selectedBrand === 'Zontes'
                      ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/40 font-black'
                      : 'text-neutral-700 dark:text-neutral-300 hover:bg-neutral-800 hover:text-white'
                  }`}
                >
                  <span>ZONTES</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-black/30 text-blue-200">
                    {brandCounts['Zontes'] || 0}
                  </span>
                </button>

                <button
                  onClick={() => setSelectedBrand('Hisun')}
                  className={`px-4 py-2.5 rounded-xl text-xs font-black tracking-wider uppercase transition-all text-left flex items-center justify-between ${
                    selectedBrand === 'Hisun'
                      ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/40 font-black'
                      : 'text-neutral-700 dark:text-neutral-300 hover:bg-neutral-800 hover:text-white'
                  }`}
                >
                  <span>HISUN</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-black/30 text-blue-200">
                    {brandCounts['Hisun'] || 0}
                  </span>
                </button>

                <button
                  onClick={() => setSelectedBrand('Kymco')}
                  className={`px-4 py-2.5 rounded-xl text-xs font-black tracking-wider uppercase transition-all text-left flex items-center justify-between ${
                    selectedBrand === 'Kymco'
                      ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/40 font-black'
                      : 'text-neutral-700 dark:text-neutral-300 hover:bg-neutral-800 hover:text-white'
                  }`}
                >
                  <span>KYMCO</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-black/30 text-blue-200">
                    {brandCounts['Kymco'] || 0}
                  </span>
                </button>

                <div className="lg:pt-2 pt-0">
                  <div className="h-px bg-neutral-800 my-1 hidden lg:block" />
                </div>

                <button
                  onClick={() => setSelectedBrand('ALL')}
                  className={`px-4 py-2 rounded-xl text-[11px] font-bold transition-all text-left flex items-center justify-between ${
                    selectedBrand === 'ALL'
                      ? 'bg-amber-400 text-black font-extrabold shadow-md'
                      : 'text-neutral-500 dark:text-neutral-400 hover:bg-neutral-800 hover:text-white'
                  }`}
                >
                  <span>Todas as Marcas</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-neutral-800 text-neutral-700 dark:text-neutral-300">
                    {brandCounts['ALL'] || 0}
                  </span>
                </button>
              </div>

              {/* Models Cards Grid (E-commerce Style matching the 5 uploaded images) */}
              <div className="flex-1">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-6 gap-4">
                  {filteredModels.map((model) => {
                    const isSelected = selectedModel?.id === model.id;

                    return (
                      <div
                        key={model.id}
                        onClick={() => {
                          setSelectedModel(model);
                          const diags = ALL_CATALOG_DIAGRAMS_MAP[model.id] || MOCK_HAYABUSA_DIAGRAMS;
                          setSelectedDiagram(diags[0]);
                          setSelectedRef(null);
                          setIsModelsSectionExpanded(false);
                        }}
                        className={`
                          rounded-2xl border p-4 cursor-pointer transition-all duration-200 group flex flex-col justify-between relative
                          ${isSelected
                            ? 'bg-gradient-to-b from-amber-500/10 via-neutral-900 to-[#18181b] border-amber-400 ring-2 ring-amber-400/40 shadow-xl shadow-amber-950/30'
                            : 'bg-[#18181b] border-neutral-200 dark:border-neutral-800 hover:border-neutral-600 hover:bg-white dark:bg-neutral-900/90 shadow-md'
                          }
                        `}
                      >
                        <div>
                          {/* Model Header Title (Uppercase, prominent) */}
                          <div className="min-h-[2.5rem] flex items-center justify-center text-center mb-1">
                            <h4 className="font-black text-white text-xs sm:text-sm tracking-tight group-hover:text-amber-400 transition-colors line-clamp-2">
                              {model.name}
                            </h4>
                          </div>

                          {/* "NOVAS CORES!" Badge or Brand Tag */}
                          <div className="h-5 flex items-center justify-center mb-2">
                            {model.badge ? (
                              <span className="px-2 py-0.5 rounded-md bg-[#002f6c] text-white text-[10px] font-black tracking-wider uppercase shadow-sm">
                                {model.badge}
                              </span>
                            ) : (
                              <span className="text-[10px] text-neutral-500 font-semibold uppercase tracking-wider">
                                {model.brand} • {model.displacement}
                              </span>
                            )}
                          </div>

                          {/* Photo Banner with Studio look */}
                          <div className="aspect-[16/11] rounded-xl overflow-hidden bg-gradient-to-b from-neutral-900 to-neutral-950 relative mb-3 border border-neutral-200 dark:border-neutral-800 group-hover:border-neutral-700 flex items-center justify-center p-2">
                            <img
                              src={model.image}
                              alt={model.name}
                              className="w-full h-full object-cover rounded-lg group-hover:scale-105 transition-transform duration-300"
                              referrerPolicy="no-referrer"
                            />
                            {isSelected && (
                              <span className="absolute top-1.5 right-1.5 px-2 py-0.5 rounded-full bg-amber-400 text-black text-[9px] font-black shadow-md flex items-center gap-1">
                                <CheckCircle2 className="w-3 h-3" />
                                Selecionado
                              </span>
                            )}
                          </div>

                          {/* Price Display Section (Exact format from uploaded images: "A PARTIR DE: R$ xx.xxx,00") */}
                          <div className="text-center space-y-0.5 mb-2">
                            <span className="text-[10px] font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider block">
                              A PARTIR DE:
                            </span>
                            <div className="text-sm sm:text-base font-black text-white tracking-tight">
                              {model.startingPrice
                                ? `R$ ${model.startingPrice.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                                : 'Consulte Valor'}
                            </div>
                          </div>
                        </div>

                        {/* Bottom Action: "SAIBA MAIS / VER CATÁLOGO" Link in blue */}
                        <div className="pt-2 border-t border-neutral-200 dark:border-neutral-800/80 flex items-center justify-center">
                          <span className={`text-[11px] font-black underline tracking-wide uppercase transition-colors ${
                            isSelected ? 'text-amber-400' : 'text-blue-400 hover:text-blue-300'
                          }`}>
                            {isSelected ? 'Diagramas Ativos ↓' : 'Saiba Mais / Peças'}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
            )}
          </div>

          {/* STEP 2: INTERACTIVE EPC EXPLODED PARTS CATALOG VIEW (MATCHING USER SCREENSHOT) */}
          {selectedModel && (
            <div className="space-y-4">
              
              {/* Selected Model Bar with Groups and Technical Details */}
              <div className="bg-[#121215] border border-[#27272a] rounded-2xl p-4 flex flex-wrap items-center justify-between gap-3 shadow-lg">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl overflow-hidden bg-white dark:bg-neutral-900 border border-neutral-700 shrink-0">
                    <img
                      src={selectedModel.image}
                      alt={selectedModel.name}
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-black text-white text-base sm:text-lg">
                        {selectedModel.name}
                      </h3>
                      <span className="px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-mono font-bold">
                        {selectedModel.displacement}
                      </span>
                    </div>
                    <span className="text-xs text-neutral-500 dark:text-neutral-400">
                      Chassi Prefixo: <span className="font-mono text-neutral-200">{selectedModel.chassisPrefix}</span> • Motor: {selectedModel.engineType}
                    </span>
                  </div>
                </div>

                {/* Quick Illustration Selector */}
                <div className="flex items-center gap-2">
                  <span className="text-xs text-neutral-500 dark:text-neutral-400 hidden sm:inline">Sistema:</span>
                  <select
                    value={selectedDiagram.id}
                    onChange={(e) => {
                      const found = activeDiagrams.find(d => d.id === e.target.value);
                      if (found) {
                        setSelectedDiagram(found);
                        setSelectedRef(null);
                      }
                    }}
                    className="bg-white dark:bg-neutral-900 border border-neutral-700 rounded-xl px-3 py-1.5 text-xs text-white font-bold focus:outline-none focus:border-amber-400"
                  >
                    {activeDiagrams.map(diag => (
                      <option key={diag.id} value={diag.id}>
                        {diag.illustrationCode} - {diag.title}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Main Dual-Pane EPC Workspace (Diagram on Left, Table on Right) */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch">
                
                {/* Left Pane: Interactive Exploded Schematic SVG Diagram */}
                <div className="lg:col-span-6 h-full min-h-[460px]">
                  <PartsExplodedDiagram
                    diagram={selectedDiagram}
                    selectedRef={selectedRef}
                    onSelectRef={(ref) => setSelectedRef(ref)}
                    hoveredRef={hoveredRef}
                    onHoverRef={(ref) => setHoveredRef(ref)}
                    modelName={selectedModel.name}
                    onAddToCart={(partId, qty = 1) => {
                      const found = selectedDiagram.parts.find(p => p.id === partId);
                      if (found) {
                        handleAddToCart(found, qty);
                      }
                    }}
                  />
                </div>

                {/* Right Pane: Parts Table (Matching Right side of User's Screenshot) */}
                <div className="lg:col-span-6 h-full min-h-[460px]">
                  <PartsTable
                    diagram={selectedDiagram}
                    selectedRef={selectedRef}
                    onSelectRef={(ref) => setSelectedRef(ref)}
                    hoveredRef={hoveredRef}
                    onHoverRef={(ref) => setHoveredRef(ref)}
                    onAddToCart={handleAddToCart}
                  />
                </div>
              </div>

              {/* Bottom Filmstrip Carousel (Matching bottom of User's Screenshot) */}
              <PartsDiagramCarousel
                diagrams={activeDiagrams}
                selectedDiagramId={selectedDiagram.id}
                onSelectDiagram={(diag) => {
                  setSelectedDiagram(diag);
                  setSelectedRef(null);
                }}
              />
            </div>
          )}

        </div>
      )}

      {/* ========================================================================= */}
      {/* MODULE TAB 2: SPARE PARTS FACTORY ORDERS & TOTVS PROTHEUS ERP WORKFLOW  */}
      {/* ========================================================================= */}
      {activeModuleTab === 'orders' && (
        <div className="space-y-4">
          
          {/* Filter Bar */}
          <div className="bg-[#121215] border border-[#27272a] rounded-2xl p-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 shadow-lg">
            <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
              <button
                onClick={() => setOrderStatusFilter('ALL')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                  orderStatusFilter === 'ALL'
                    ? 'bg-amber-400 text-black font-extrabold'
                    : 'bg-white dark:bg-neutral-900 text-neutral-500 dark:text-neutral-400 hover:text-white border border-neutral-200 dark:border-neutral-800'
                }`}
              >
                Todos ({partsOrders.length})
              </button>
              <button
                onClick={() => setOrderStatusFilter('aguardando_analise')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                  orderStatusFilter === 'aguardando_analise'
                    ? 'bg-amber-400 text-black font-extrabold'
                    : 'bg-white dark:bg-neutral-900 text-neutral-500 dark:text-neutral-400 hover:text-white border border-neutral-200 dark:border-neutral-800'
                }`}
              >
                Em Análise Fábrica
              </button>
              <button
                onClick={() => setOrderStatusFilter('em_separacao_cd')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                  orderStatusFilter === 'em_separacao_cd'
                    ? 'bg-amber-400 text-black font-extrabold'
                    : 'bg-white dark:bg-neutral-900 text-neutral-500 dark:text-neutral-400 hover:text-white border border-neutral-200 dark:border-neutral-800'
                }`}
              >
                Separando nos CDs
              </button>
              <button
                onClick={() => setOrderStatusFilter('integrado_protheus')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                  orderStatusFilter === 'integrado_protheus'
                    ? 'bg-amber-400 text-black font-extrabold'
                    : 'bg-white dark:bg-neutral-900 text-neutral-500 dark:text-neutral-400 hover:text-white border border-neutral-200 dark:border-neutral-800'
                }`}
              >
                Integrados Protheus ERP
              </button>
            </div>

            {/* Order Search */}
            <div className="relative min-w-[220px]">
              <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-neutral-500 dark:text-neutral-400" />
              <input
                type="text"
                value={orderSearchQuery}
                onChange={(e) => setOrderSearchQuery(e.target.value)}
                placeholder="Buscar pedido, concessionária ou peça..."
                className="w-full bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-xl pl-9 pr-4 py-1.5 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-amber-400"
              />
            </div>
          </div>

          {/* Orders Cards Grid / Table */}
          {scopedOrders.length === 0 ? (
            <div className="bg-[#121215] border border-[#27272a] rounded-3xl p-12 text-center space-y-3">
              <div className="w-14 h-14 rounded-full bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 flex items-center justify-center mx-auto text-neutral-500">
                <FileText className="w-7 h-7" />
              </div>
              <h4 className="font-bold text-white text-base">Nenhum pedido de peças encontrado</h4>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 max-w-sm mx-auto">
                Utilize o Catálogo de Peças (EPC) para navegar pelas peças e transmitir pedidos oficiais à fábrica.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {scopedOrders.map((order) => {
                return (
                  <div
                    key={order.id}
                    className="bg-[#121215] border border-[#27272a] hover:border-neutral-700 rounded-2xl p-4 sm:p-5 transition-all shadow-lg space-y-4"
                  >
                    {/* Top Row: Order ID, Type, Date, Status */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-neutral-200 dark:border-neutral-800 pb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 font-mono font-bold text-xs">
                          PEC
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-black text-white text-sm sm:text-base">
                              {order.orderNumber}
                            </span>
                            <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase font-mono ${
                              order.orderType === 'urgente_vor' 
                                ? 'bg-red-500/20 text-red-400 border border-red-500/30' 
                                : order.orderType === 'garantia_pos_venda'
                                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                            }`}>
                              {order.orderType === 'urgente_vor' ? 'URGENTE VOR' : order.orderType === 'garantia_pos_venda' ? 'GARANTIA' : 'REPOSIÇÃO'}
                            </span>
                          </div>
                          <span className="text-[11px] text-neutral-500 dark:text-neutral-400">
                            {order.dealershipName} • Emitido em {order.createdAt}
                          </span>
                        </div>
                      </div>

                      {/* Status Badge & Actions */}
                      <div className="flex items-center gap-2">
                        {order.protheusIntegrated ? (
                          <span className="px-2.5 py-1 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-bold flex items-center gap-1.5 font-mono">
                            <Database className="w-3.5 h-3.5" />
                            {order.protheusOrderNumber}
                          </span>
                        ) : order.status === 'em_separacao_cd' ? (
                          <span className="px-2.5 py-1 rounded-xl bg-blue-500/15 border border-blue-500/30 text-blue-400 text-xs font-bold flex items-center gap-1.5">
                            <Package className="w-3.5 h-3.5" />
                            Separação CD
                          </span>
                        ) : (
                          <span className="px-2.5 py-1 rounded-xl bg-purple-500/15 border border-purple-500/30 text-purple-400 text-xs font-bold flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5" />
                            Em Análise Fábrica
                          </span>
                        )}

                        <button
                          onClick={() => setViewingOrder(order)}
                          className="px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors border border-neutral-700"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Ver Espelho Completo</span>
                        </button>
                      </div>
                    </div>

                    {/* Middle Row: Items Summary Chips & Financials */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
                      <div className="flex-1 space-y-1.5">
                        <div className="text-[11px] text-neutral-500 dark:text-neutral-400 font-bold uppercase tracking-wider">
                          Itens do Pedido ({order.totalPartsCount} peças):
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {order.items.slice(0, 4).map((item) => (
                            <span
                              key={item.id}
                              className="px-2.5 py-1 rounded-lg bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-[11px] text-neutral-700 dark:text-neutral-300 font-mono flex items-center gap-1.5"
                            >
                              <span className="text-amber-400 font-bold">{item.quantity}x</span>
                              <span>{item.part.partNumber}</span>
                              <span className="text-neutral-500 max-w-[120px] truncate hidden sm:inline">({item.part.description})</span>
                            </span>
                          ))}
                          {order.items.length > 4 && (
                            <span className="px-2 py-1 rounded-lg bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-[11px] text-neutral-500 dark:text-neutral-400 font-bold">
                              +{order.items.length - 4} outros itens
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Total & Warehouse */}
                      <div className="text-right space-y-0.5 shrink-0 font-tabular bg-neutral-50 dark:bg-neutral-950 p-2.5 rounded-xl border border-neutral-200 dark:border-neutral-800/80">
                        <div className="text-[10px] text-neutral-500 dark:text-neutral-400 uppercase font-bold">Total Faturado Fábrica</div>
                        <div className="text-base font-mono font-black text-amber-400">
                          R$ {order.totalAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </div>
                        <div className="text-[10px] text-neutral-500 dark:text-neutral-400 font-mono">
                          {order.allocatedWarehouse || 'CD Jundiaí (SP)'} • Frete {order.freightMode}
                        </div>
                      </div>
                    </div>

                    {/* Montadora Inline Quick Approval Tools */}
                    {isMontadora && (
                      <div className="pt-2 border-t border-neutral-200 dark:border-neutral-800/80 flex flex-wrap items-center justify-between gap-2">
                        <div className="text-[11px] text-neutral-500 dark:text-neutral-400 flex items-center gap-2">
                          <span className="font-bold text-neutral-700 dark:text-neutral-300">Ações Montadora J. Toledo:</span>
                          {order.stockVerified && <span className="text-emerald-400 font-bold">✓ Estoque CD Confirmado</span>}
                          {order.creditApproved && <span className="text-emerald-400 font-bold">✓ Crédito Aprovado</span>}
                        </div>

                        <div className="flex items-center gap-2">
                          {!order.stockVerified && (
                            <button
                              onClick={() => handleApproveStock(order.id)}
                              className="px-2.5 py-1 bg-blue-600/20 hover:bg-blue-600 text-blue-300 hover:text-white border border-blue-500/30 text-xs font-bold rounded-lg transition-colors"
                            >
                              Verificar CD
                            </button>
                          )}

                          {!order.creditApproved && (
                            <button
                              onClick={() => handleApproveCredit(order.id)}
                              className="px-2.5 py-1 bg-emerald-600/20 hover:bg-emerald-600 text-emerald-300 hover:text-white border border-emerald-500/30 text-xs font-bold rounded-lg transition-colors"
                            >
                              Aprovar Crédito
                            </button>
                          )}

                          {order.creditApproved && !order.protheusIntegrated && (
                            <button
                              onClick={() => handleIntegrateProtheus(order.id)}
                              className="px-3 py-1 bg-amber-500 hover:bg-amber-400 text-black text-xs font-black rounded-lg transition-colors shadow-md shadow-amber-500/20 flex items-center gap-1.5"
                            >
                              <Database className="w-3 h-3" />
                              Integrar TOTVS Protheus ERP
                            </button>
                          )}
                        </div>
                      </div>
                    )}

                  </div>
                );
              })}
            </div>
          )}

        </div>
      )}

      {/* Shopping Cart Drawer */}
      <PartsCartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        items={cartItems}
        onUpdateQuantity={handleUpdateCartQuantity}
        onRemoveItem={handleRemoveCartItem}
        onClearCart={handleClearCart}
        onSubmitOrder={handleSubmitOrder}
        dealershipProfile={currentDealer}
      />

      {/* Official Order Mirror & Printable Modal */}
      {viewingOrder && (
        <PartsOrderMirrorModal
          isOpen={!!viewingOrder}
          onClose={() => setViewingOrder(null)}
          order={viewingOrder}
          dealershipProfile={dealerships.find(d => d.id === viewingOrder.dealershipId)}
          isMontadora={isMontadora}
          onApproveStock={handleApproveStock}
          onApproveCredit={handleApproveCredit}
          onIntegrateProtheus={handleIntegrateProtheus}
          onDispatchOrder={handleDispatchOrder}
        />
      )}

      {/* EPC Catalog Excel & Images Upload Modal */}
      <PartsCatalogUploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onImportSuccess={handleCatalogImportSuccess}
      />

    </div>
  );
};
