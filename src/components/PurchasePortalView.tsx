import React, { useState, useMemo } from 'react';
import { 
  PurchaseModel, 
  BrandType, 
  VehicleVariant, 
  FactoryOrder, 
  FactoryOrderItem, 
  FactoryOrderStatus,
  DealershipScope,
  DealershipProfile,
  DealerTier
} from '../types';
import { DEALERSHIP_PROFILES } from '../data/mockData';
import { 
  Building2, 
  CreditCard, 
  HelpCircle, 
  Plus, 
  Minus, 
  ShoppingCart, 
  CheckCircle2, 
  Truck, 
  ShieldCheck, 
  TrendingUp, 
  X, 
  Info, 
  Calendar,
  Factory,
  Layers,
  Search,
  Filter,
  Check,
  AlertTriangle,
  ArrowRight,
  Sparkles,
  SlidersHorizontal,
  FileSpreadsheet,
  Database,
  ArrowUpRight,
  Palette,
  Bike,
  Clock,
  DollarSign,
  Send,
  Eye,
  Edit3,
  Trash2,
  RefreshCw,
  Tag,
  FileText,
  Gauge,
  Settings2,
  ExternalLink
} from 'lucide-react';
import { OrderApprovalDocument, DealershipFullProfile } from '../types';
import { INITIAL_ORDER_APPROVAL_PROPOSALS } from '../data/orderApprovalData';
import { OrderApprovalDocumentView } from './OrderApprovalDocumentView';
import { ModelTechnicalSpecsModal } from './ModelTechnicalSpecsModal';
import { ModelCatalogManagementModal } from './ModelCatalogManagementModal';
import { DealershipOrderDetailModal } from './DealershipOrderDetailModal';

interface PurchasePortalViewProps {
  currentScope: DealershipScope;
  purchaseModels: PurchaseModel[];
  factoryOrders: FactoryOrder[];
  orderProposals?: OrderApprovalDocument[];
  onUpdateOrderProposal?: (updated: OrderApprovalDocument) => void;
  onCreateOrderProposal?: (newProposal: OrderApprovalDocument) => void;
  dealerships?: DealershipFullProfile[];
  onUpdateVariantQuantity: (modelId: string, variantId: string, delta: number) => void;
  onUpdateModelSetting: (modelId: string, field: 'selectedOrderType' | 'selectedPayment', value: any) => void;
  onSavePurchaseModel?: (model: PurchaseModel) => void;
  onDeletePurchaseModel?: (modelId: string) => void;
  onPlaceOrder: (freightMode: string, totalAmount: number, totalUnits: number, items: FactoryOrderItem[]) => void;
  onUpdateFactoryOrder: (updatedOrder: FactoryOrder) => void;
  onNavigateToCommitments?: () => void;
}

export const PurchasePortalView: React.FC<PurchasePortalViewProps> = ({
  currentScope,
  purchaseModels,
  factoryOrders,
  orderProposals = INITIAL_ORDER_APPROVAL_PROPOSALS,
  onUpdateOrderProposal,
  onCreateOrderProposal,
  dealerships = [],
  onUpdateVariantQuantity,
  onUpdateModelSetting,
  onSavePurchaseModel,
  onDeletePurchaseModel,
  onPlaceOrder,
  onUpdateFactoryOrder,
  onNavigateToCommitments
}) => {
  const isMontadora = currentScope === 'jtoledo';
  const activeProfile = DEALERSHIP_PROFILES[currentScope];

  // Active Main Tab for Montadora: 'orders' (Gestão & Aprovação ERP), 'approval_sheet' (Ficha JTA+JTZ), 'catalog' (Catálogo de Fábrica)
  const [montadoraTab, setMontadoraTab] = useState<'orders' | 'approval_sheet' | 'catalog'>('orders');

  // Filters for Montadora Orders Table
  const [orderSearchQuery, setOrderSearchQuery] = useState('');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>('todos');
  const [selectedDealerFilter, setSelectedDealerFilter] = useState<string>('todas');

  // Catalog State
  const [selectedBrand, setSelectedBrand] = useState<BrandType>('Suzuki');
  const [freightMode, setFreightMode] = useState<'CIF' | 'FOB'>('CIF');
  const [catalogSearchQuery, setCatalogSearchQuery] = useState('');
  const [cardActiveColorIndex, setCardActiveColorIndex] = useState<{ [modelId: string]: number }>({});

  // Modals for Technical Specs & Model Catalog Management
  const [selectedSpecModal, setSelectedSpecModal] = useState<PurchaseModel | null>(null);
  const [modelToEditModal, setModelToEditModal] = useState<PurchaseModel | null>(null);
  const [isModelFormOpen, setIsModelFormOpen] = useState(false);

  // Viewing Order Details Modal (Dealership View)
  const [viewingDealerOrder, setViewingDealerOrder] = useState<FactoryOrder | null>(null);
  const [dealerOrdersFilter, setDealerOrdersFilter] = useState<'todos' | 'analise' | 'aprovados' | 'integrados'>('todos');
  const [dealerOrdersSearch, setDealerOrdersSearch] = useState('');

  // Order Management Modal for Montadora (Audit, Color/Model Edit, Credit & Commercial Approval, Protheus Integration)
  const [managedOrder, setManagedOrder] = useState<FactoryOrder | null>(null);
  const [editItemsModalOpen, setEditItemsModalOpen] = useState(false);
  const [temporaryItems, setTemporaryItems] = useState<FactoryOrderItem[]>([]);
  
  // Model add selector inside edit items modal
  const [showAddModelSelect, setShowAddModelSelect] = useState(false);
  const [selectedModelToAdd, setSelectedModelToAdd] = useState<string>('gsx-s1000gx');

  // ERP Protheus Simulation State
  const [isIntegratingProtheus, setIsIntegratingProtheus] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const brands: { id: BrandType; name: string }[] = [
    { id: 'Suzuki', name: 'Suzuki Motos' },
    { id: 'Zontes', name: 'Zontes' },
    { id: 'Haojue', name: 'Haojue' },
    { id: 'Quadriciclos', name: 'Quadriciclos' }
  ];

  const filteredCatalogModels = purchaseModels.filter(m => m.brand === selectedBrand);

  const searchedCatalogModels = useMemo(() => {
    return filteredCatalogModels.filter(m => {
      if (!catalogSearchQuery.trim()) return true;
      const q = catalogSearchQuery.toLowerCase();
      return (
        m.modelName.toLowerCase().includes(q) ||
        m.category.toLowerCase().includes(q) ||
        m.brand.toLowerCase().includes(q) ||
        m.variants.some(v => v.colorName.toLowerCase().includes(q))
      );
    });
  }, [filteredCatalogModels, catalogSearchQuery]);

  // Concessionária Order Total Calculation
  const totalOrderUnits = purchaseModels.reduce((acc, m) => {
    return acc + m.variants.reduce((vAcc, v) => vAcc + v.quantity, 0);
  }, 0);

  const totalOrderAmount = purchaseModels.reduce((acc, m) => {
    const modelUnits = m.variants.reduce((vAcc, v) => vAcc + v.quantity, 0);
    return acc + (modelUnits * m.factoryCost);
  }, 0);

  // Active items selected by concessionária for new order
  const activeSelectedOrderItems: FactoryOrderItem[] = useMemo(() => {
    const items: FactoryOrderItem[] = [];
    purchaseModels.forEach(m => {
      m.variants.forEach(v => {
        if (v.quantity > 0) {
          items.push({
            id: `item-${m.id}-${v.id}`,
            modelId: m.id,
            modelName: m.modelName,
            brand: m.brand,
            category: m.category,
            colorName: v.colorName,
            colorHex: v.colorHex,
            quantity: v.quantity,
            unitFactoryCost: m.factoryCost,
            unitMSRP: m.ppsMSRP,
            totalItemCost: m.factoryCost * v.quantity,
            availableColors: m.variants.map(varItem => ({
              colorName: varItem.colorName,
              colorHex: varItem.colorHex,
              inStock: varItem.stockStatus !== 'sem_estoque'
            }))
          });
        }
      });
    });
    return items;
  }, [purchaseModels]);

  // Credit limits for current dealer
  const creditLimitTotal = activeProfile?.creditLimit || 3000000;
  const currentCreditUsed = activeProfile?.creditUsed || 1890000;
  const simulatedCreditRemaining = creditLimitTotal - currentCreditUsed - totalOrderAmount;

  // Filtered Orders for Montadora
  const filteredOrders = useMemo(() => {
    return factoryOrders.filter(order => {
      // Scope filter: if Concessionária, show only their orders; if Montadora, show all
      if (!isMontadora && order.dealershipId !== currentScope) {
        return false;
      }

      const matchesSearch = 
        order.orderNumber.toLowerCase().includes(orderSearchQuery.toLowerCase()) ||
        order.dealershipName.toLowerCase().includes(orderSearchQuery.toLowerCase()) ||
        order.dealershipCity.toLowerCase().includes(orderSearchQuery.toLowerCase()) ||
        order.dealershipCnpj.includes(orderSearchQuery) ||
        order.items.some(i => i.modelName.toLowerCase().includes(orderSearchQuery.toLowerCase()));

      const matchesStatus = 
        selectedStatusFilter === 'todos' ||
        order.status === selectedStatusFilter ||
        (selectedStatusFilter === 'pendentes' && (order.status === 'aguardando_analise' || order.status === 'em_analise_credito' || order.status === 'em_analise_comercial')) ||
        (selectedStatusFilter === 'pronto_protheus' && order.status === 'aprovado_comercial');

      const matchesDealer = selectedDealerFilter === 'todas' || order.dealershipId === selectedDealerFilter;

      return matchesSearch && matchesStatus && matchesDealer;
    });
  }, [factoryOrders, isMontadora, currentScope, orderSearchQuery, selectedStatusFilter, selectedDealerFilter]);

  // Filtered orders for Dealership View "Meus Pedidos de Fábrica"
  const filteredDealerOrders = useMemo(() => {
    return filteredOrders.filter(ord => {
      if (dealerOrdersFilter === 'analise') {
        if (ord.status !== 'aguardando_analise' && ord.status !== 'em_analise_credito' && ord.status !== 'em_analise_comercial') return false;
      } else if (dealerOrdersFilter === 'aprovados') {
        if (!ord.creditApproved || !ord.commercialApproved || ord.protheusIntegrated) return false;
      } else if (dealerOrdersFilter === 'integrados') {
        if (!ord.protheusIntegrated) return false;
      }

      if (dealerOrdersSearch.trim()) {
        const q = dealerOrdersSearch.toLowerCase();
        const matchesQuery = 
          ord.orderNumber.toLowerCase().includes(q) ||
          (ord.protheusOrderNumber && ord.protheusOrderNumber.toLowerCase().includes(q)) ||
          ord.paymentMethod.toLowerCase().includes(q) ||
          ord.items.some(i => i.modelName.toLowerCase().includes(q) || i.colorName.toLowerCase().includes(q));
        if (!matchesQuery) return false;
      }
      return true;
    });
  }, [filteredOrders, dealerOrdersFilter, dealerOrdersSearch]);

  // Statistics for Montadora KPI Bar
  const statsPendingAnalysis = factoryOrders.filter(o => o.status === 'aguardando_analise').length;
  const statsCreditReview = factoryOrders.filter(o => o.status === 'em_analise_credito').length;
  const statsCommercialReview = factoryOrders.filter(o => o.status === 'em_analise_comercial').length;
  const statsReadyProtheus = factoryOrders.filter(o => o.status === 'aprovado_comercial' || (o.creditApproved && o.commercialApproved && !o.protheusIntegrated)).length;
  const statsIntegratedProtheus = factoryOrders.filter(o => o.protheusIntegrated).length;
  const statsTotalNetworkAmount = factoryOrders.reduce((acc, o) => acc + o.totalAmount, 0);

  // Open Managed Order Modal
  const handleOpenManageOrder = (order: FactoryOrder) => {
    setManagedOrder(order);
    setTemporaryItems(JSON.parse(JSON.stringify(order.items)));
  };

  // Color change handler inside manage modal
  const handleChangeItemColor = (itemIndex: number, newColorName: string, newColorHex: string) => {
    if (!managedOrder) return;
    const updatedItems = [...temporaryItems];
    updatedItems[itemIndex] = {
      ...updatedItems[itemIndex],
      colorName: newColorName,
      colorHex: newColorHex
    };
    setTemporaryItems(updatedItems);
  };

  // Quantity change handler inside manage modal
  const handleChangeItemQuantity = (itemIndex: number, delta: number) => {
    if (!managedOrder) return;
    const updatedItems = [...temporaryItems];
    const newQty = Math.max(1, updatedItems[itemIndex].quantity + delta);
    updatedItems[itemIndex] = {
      ...updatedItems[itemIndex],
      quantity: newQty,
      totalItemCost: newQty * updatedItems[itemIndex].unitFactoryCost
    };
    setTemporaryItems(updatedItems);
  };

  // Remove item handler inside manage modal
  const handleRemoveItem = (itemIndex: number) => {
    if (temporaryItems.length <= 1) {
      showToast('O pedido deve conter ao menos 1 item.');
      return;
    }
    const updatedItems = temporaryItems.filter((_, idx) => idx !== itemIndex);
    setTemporaryItems(updatedItems);
  };

  // Add new model item to order
  const handleAddModelToOrder = () => {
    const modelObj = purchaseModels.find(m => m.id === selectedModelToAdd);
    if (!modelObj) return;

    const firstVariant = modelObj.variants[0];
    const newItem: FactoryOrderItem = {
      id: `foi-added-${Date.now()}`,
      modelId: modelObj.id,
      modelName: modelObj.modelName,
      brand: modelObj.brand,
      category: modelObj.category,
      colorName: firstVariant ? firstVariant.colorName : 'Cor Padrão',
      colorHex: firstVariant ? firstVariant.colorHex : '#18181b',
      quantity: 1,
      unitFactoryCost: modelObj.factoryCost,
      unitMSRP: modelObj.ppsMSRP,
      totalItemCost: modelObj.factoryCost,
      availableColors: modelObj.variants.map(v => ({
        colorName: v.colorName,
        colorHex: v.colorHex,
        inStock: v.stockStatus !== 'sem_estoque'
      }))
    };

    setTemporaryItems(prev => [...prev, newItem]);
    setShowAddModelSelect(false);
    showToast(`Modelo ${modelObj.modelName} adicionado ao pedido.`);
  };

  // Save modified items back to managed order
  const handleSaveItemsChanges = () => {
    if (!managedOrder) return;
    const newTotalUnits = temporaryItems.reduce((acc, i) => acc + i.quantity, 0);
    const newTotalAmount = temporaryItems.reduce((acc, i) => acc + i.totalItemCost, 0);

    const updatedOrder: FactoryOrder = {
      ...managedOrder,
      items: temporaryItems,
      totalUnits: newTotalUnits,
      totalAmount: newTotalAmount
    };

    setManagedOrder(updatedOrder);
    onUpdateFactoryOrder(updatedOrder);
    setEditItemsModalOpen(false);
    showToast('Alterações de modelos e cores salvas com sucesso no pedido!');
  };

  // Approval Handlers
  const handleApproveCredit = () => {
    if (!managedOrder) return;
    const updatedOrder: FactoryOrder = {
      ...managedOrder,
      creditApproved: true,
      creditAnalyst: 'Fabio Mesquita (J. Toledo Finance)',
      creditApprovedAt: new Date().toLocaleString('pt-BR'),
      creditNotes: 'Crédito aprovado conforme limite financeiro homologado.',
      status: managedOrder.commercialApproved ? 'aprovado_comercial' : 'em_analise_comercial'
    };
    setManagedOrder(updatedOrder);
    onUpdateFactoryOrder(updatedOrder);
    showToast(`Crédito aprovado para o pedido ${managedOrder.orderNumber}!`);
  };

  const handleApproveCommercial = () => {
    if (!managedOrder) return;
    const updatedOrder: FactoryOrder = {
      ...managedOrder,
      commercialApproved: true,
      commercialManager: 'Carlos Drummond (Diretoria Comercial J. Toledo)',
      commercialApprovedAt: new Date().toLocaleString('pt-BR'),
      commercialNotes: 'Mix de produtos e cota autorizados para atendimento fábrica.',
      status: 'aprovado_comercial'
    };
    setManagedOrder(updatedOrder);
    onUpdateFactoryOrder(updatedOrder);
    showToast(`Aprovação comercial confirmada para ${managedOrder.orderNumber}!`);
  };

  // Final Action: Confirm and Integrate with TOTVS Protheus ERP
  const handleConfirmAndIntegrateProtheus = () => {
    if (!managedOrder) return;
    if (!managedOrder.creditApproved || !managedOrder.commercialApproved) {
      showToast('O pedido requer aprovação de Crédito e Comercial antes de integrar no Protheus.');
      return;
    }

    setIsIntegratingProtheus(true);

    setTimeout(() => {
      const generatedProtheusId = `PROTH-SC5-2024-${Math.floor(10000 + Math.random() * 90000)}`;
      const updatedOrder: FactoryOrder = {
        ...managedOrder,
        status: 'integrado_protheus',
        protheusIntegrated: true,
        protheusOrderNumber: generatedProtheusId,
        protheusIntegratedAt: new Date().toLocaleString('pt-BR'),
        protheusWarehouse: 'Armazém 01 - Manaus Polo Industrial',
        protheusPaymentCondition: managedOrder.paymentMethod.includes('Prazo') ? 'Condição: 030 (30/60/90 DDL)' : 'Condição: 001 (À Vista TED)'
      };

      setManagedOrder(updatedOrder);
      onUpdateFactoryOrder(updatedOrder);
      setIsIntegratingProtheus(false);
      showToast(`Pedido ${managedOrder.orderNumber} confirmado e INTEGRADO NO ERP PROTHEUS (${generatedProtheusId})!`);
    }, 900);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-28">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-6 right-6 z-50 bg-blue-600 text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3 border border-blue-400 font-bold text-[13px] animate-in slide-in-from-top duration-200">
          <CheckCircle2 className="w-5 h-5 text-white" />
          {toastMessage}
        </div>
      )}

      {/* Main Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] uppercase font-bold tracking-widest text-[#3b82f6] bg-[#3b82f6]/10 px-2.5 py-0.5 rounded-full border border-[#3b82f6]/20 flex items-center gap-1">
              <Factory className="w-3 h-3" />
              {isMontadora ? 'Gestão Montadora • Grupo J. Toledo' : 'Portal de Pedidos B2B Suzuki'}
            </span>
            <span className="text-[10px] uppercase font-bold tracking-widest text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
              {isMontadora ? 'Integração TOTVS Protheus' : `${activeProfile?.shortName}`}
            </span>
          </div>
          <h2 className="text-[26px] md:text-[30px] font-bold text-[#fafafa] tracking-tight">
            {isMontadora ? 'Central de Pedidos da Rede & Integração Protheus' : 'Portal de Pedidos de Fábrica'}
          </h2>
          <p className="text-[13px] text-neutral-400">
            {isMontadora 
              ? 'Receba, altere cores/modelos, avalie crédito e aprove pedidos para integração no ERP TOTVS Protheus.'
              : 'Faturamento direto de Manaus/CD J. Toledo para concessionárias autorizadas.'}
          </p>
        </div>

        {/* Tab Switcher for Montadora */}
        {isMontadora && (
          <div className="flex items-center bg-[#18181b] border border-[#27272a] p-1 rounded-2xl text-[12px] font-bold">
            <button
              onClick={() => setMontadoraTab('orders')}
              className={`px-4 py-2 rounded-xl transition-all flex items-center gap-2 ${
                montadoraTab === 'orders'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>Pedidos da Rede ({factoryOrders.length})</span>
            </button>
            <button
              onClick={() => setMontadoraTab('approval_sheet')}
              className={`px-4 py-2 rounded-xl transition-all flex items-center gap-2 relative ${
                montadoraTab === 'approval_sheet'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              <FileText className="w-4 h-4 text-amber-400" />
              <span>Ficha de Aprovação JTA/JTZ</span>
              <span className="text-[9px] bg-amber-400/20 text-amber-300 font-bold px-1.5 py-0.2 rounded-full border border-amber-400/30">
                Doc Anexo
              </span>
            </button>
            <button
              onClick={() => setMontadoraTab('catalog')}
              className={`px-4 py-2 rounded-xl transition-all flex items-center gap-2 ${
                montadoraTab === 'catalog'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              <Bike className="w-4 h-4" />
              <span>Catálogo & Preços Fábrica</span>
            </button>
          </div>
        )}
      </div>

      {/* =========================================================================
          VIEW MODE 1: FICHA OFICIAL DE APROVAÇÃO JTA + JTZ (DOCUMENTO ANEXO)
         ========================================================================= */}
      {isMontadora && montadoraTab === 'approval_sheet' && (
        <OrderApprovalDocumentView
          proposals={orderProposals}
          dealerships={dealerships}
          currentScope={currentScope}
          onUpdateProposal={onUpdateOrderProposal || (() => {})}
          onCreateProposal={onCreateOrderProposal}
          onBackToOrders={() => setMontadoraTab('orders')}
          onNavigateToCommitments={onNavigateToCommitments}
        />
      )}

      {/* =========================================================================
          VIEW MODE 1: MONTADORA SCOPE - CENTRAL DE GESTÃO DE PEDIDOS B2B
         ========================================================================= */}
      {isMontadora && montadoraTab === 'orders' && (
        <div className="space-y-6">
          {/* Top 5 KPI Metrics for Factory Orders Pipeline */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
            {/* KPI 1 */}
            <div className="bg-[#18181b] border border-[#27272a] rounded-3xl p-4 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] uppercase font-bold text-neutral-400">Total Pedidos Rede</span>
                <div className="p-1.5 bg-blue-500/10 text-blue-400 rounded-lg">
                  <FileSpreadsheet className="w-4 h-4" />
                </div>
              </div>
              <p className="text-[20px] font-bold text-white font-tabular">{factoryOrders.length}</p>
              <p className="text-[10px] text-neutral-400 mt-1 font-tabular">
                Volume: R$ {(statsTotalNetworkAmount / 1000).toLocaleString('pt-BR')}k
              </p>
            </div>

            {/* KPI 2: Aguardando Análise */}
            <div className="bg-[#18181b] border border-[#27272a] rounded-3xl p-4 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] uppercase font-bold text-amber-400">Aguardando Análise</span>
                <div className="p-1.5 bg-amber-500/10 text-amber-400 rounded-lg">
                  <Clock className="w-4 h-4" />
                </div>
              </div>
              <p className="text-[20px] font-bold text-amber-300 font-tabular">{statsPendingAnalysis}</p>
              <p className="text-[10px] text-neutral-400 mt-1">Novos pedidos recebidos</p>
            </div>

            {/* KPI 3: Em Análise de Crédito */}
            <div className="bg-[#18181b] border border-[#27272a] rounded-3xl p-4 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] uppercase font-bold text-blue-400">Análise de Crédito</span>
                <div className="p-1.5 bg-blue-500/10 text-blue-400 rounded-lg">
                  <CreditCard className="w-4 h-4" />
                </div>
              </div>
              <p className="text-[20px] font-bold text-blue-300 font-tabular">{statsCreditReview}</p>
              <p className="text-[10px] text-neutral-400 mt-1">J. Toledo Finance</p>
            </div>

            {/* KPI 4: Prontos para Protheus */}
            <div className="bg-[#18181b] border border-[#27272a] rounded-3xl p-4 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] uppercase font-bold text-purple-400">Prontos p/ Protheus</span>
                <div className="p-1.5 bg-purple-500/10 text-purple-400 rounded-lg">
                  <Database className="w-4 h-4" />
                </div>
              </div>
              <p className="text-[20px] font-bold text-purple-300 font-tabular">{statsReadyProtheus}</p>
              <p className="text-[10px] text-neutral-400 mt-1">Aprovados Crédito + Comercial</p>
            </div>

            {/* KPI 5: Integrados no Protheus */}
            <div className="bg-[#18181b] border border-[#27272a] rounded-3xl p-4 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] uppercase font-bold text-emerald-400">Integrados no ERP</span>
                <div className="p-1.5 bg-emerald-500/10 text-emerald-400 rounded-lg">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
              </div>
              <p className="text-[20px] font-bold text-emerald-400 font-tabular">{statsIntegratedProtheus}</p>
              <p className="text-[10px] text-neutral-400 mt-1">Gerado SC5 Manaus</p>
            </div>
          </div>

          {/* Search, Filter Bar and Orders Table */}
          <div className="bg-[#18181b] border border-[#27272a] rounded-3xl p-5 md:p-6 shadow-md space-y-4">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-3 border-b border-[#27272a]">
              <div>
                <h3 className="text-[16px] font-bold text-white flex items-center gap-2">
                  <FileSpreadsheet className="w-4 h-4 text-blue-400" />
                  Lista Geral de Pedidos de Concessionárias ({filteredOrders.length})
                </h3>
                <p className="text-[11px] text-neutral-400">
                  Clique em <strong>Gerenciar & Aprovar</strong> para alterar cores, modelos, validar crédito e integrar no Protheus.
                </p>
              </div>

              {/* Controls */}
              <div className="flex flex-wrap items-center gap-2.5">
                {/* Search */}
                <div className="relative min-w-[220px]">
                  <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Buscar pedido, loja, modelo..."
                    value={orderSearchQuery}
                    onChange={(e) => setOrderSearchQuery(e.target.value)}
                    className="w-full bg-neutral-900 text-[12px] text-neutral-200 pl-8 pr-3 py-1.5 rounded-xl border border-[#27272a] focus:outline-none focus:border-blue-500 placeholder:text-neutral-500"
                  />
                </div>

                {/* Status Filter */}
                <select
                  value={selectedStatusFilter}
                  onChange={(e) => setSelectedStatusFilter(e.target.value)}
                  className="bg-neutral-900 text-[12px] text-neutral-200 font-medium border border-[#27272a] rounded-xl px-3 py-1.5 focus:outline-none focus:border-blue-500"
                >
                  <option value="todos">Todos os Status</option>
                  <option value="pendentes">Em Análise (Crédito / Comercial)</option>
                  <option value="pronto_protheus">Prontos p/ Integração ERP</option>
                  <option value="integrado_protheus">Integrados no Protheus</option>
                  <option value="aguardando_analise">Aguardando Análise Inicial</option>
                </select>

                {/* Dealership Filter */}
                <select
                  value={selectedDealerFilter}
                  onChange={(e) => setSelectedDealerFilter(e.target.value)}
                  className="bg-neutral-900 text-[12px] text-neutral-200 font-medium border border-[#27272a] rounded-xl px-3 py-1.5 focus:outline-none focus:border-blue-500"
                >
                  <option value="todas">Todas as Concessionárias</option>
                  {Object.values(DEALERSHIP_PROFILES)
                    .filter(p => p.type === 'concessionaria')
                    .map(p => (
                      <option key={p.id} value={p.id}>{p.name} ({p.state})</option>
                    ))}
                </select>
              </div>
            </div>

            {/* Orders Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-[13px]">
                <thead>
                  <tr className="bg-neutral-900/80 border-b border-[#27272a] text-[10px] font-bold text-neutral-400 uppercase tracking-wider">
                    <th className="py-3 px-4">Pedido / Data</th>
                    <th className="py-3 px-4">Concessionária</th>
                    <th className="py-3 px-4">Itens & Cores Solicitadas</th>
                    <th className="py-3 px-4 text-right">Valor Total (Fábrica)</th>
                    <th className="py-3 px-4 text-center">Crédito</th>
                    <th className="py-3 px-4 text-center">Comercial</th>
                    <th className="py-3 px-4 text-center">ERP Protheus</th>
                    <th className="py-3 px-4 text-center">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#27272a] font-tabular">
                  {filteredOrders.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-12 text-center text-neutral-500">
                        Nenhum pedido encontrado para os filtros selecionados.
                      </td>
                    </tr>
                  ) : (
                    filteredOrders.map((order) => {
                      const isReadyToIntegrate = order.creditApproved && order.commercialApproved && !order.protheusIntegrated;

                      return (
                        <tr 
                          key={order.id}
                          className="hover:bg-neutral-900/50 transition-colors group"
                        >
                          {/* Order Number & Date */}
                          <td className="py-3.5 px-4 font-medium">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-white text-[13px]">{order.orderNumber}</span>
                              {order.freightMode === 'CIF' ? (
                                <span className="text-[9px] bg-blue-950 text-blue-300 border border-blue-800/40 px-1 py-0.2 rounded font-bold">
                                  CIF
                                </span>
                              ) : (
                                <span className="text-[9px] bg-amber-950 text-amber-300 border border-amber-800/40 px-1 py-0.2 rounded font-bold">
                                  FOB
                                </span>
                              )}
                            </div>
                            <span className="text-[11px] text-neutral-500 block mt-0.5">{order.createdAt}</span>
                          </td>

                          {/* Dealership */}
                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-1.5">
                              <span className="font-bold text-white text-[12px]">{order.dealershipName}</span>
                              <span className="text-[9px] bg-neutral-800 text-neutral-300 px-1 py-0.2 rounded font-bold">
                                {order.dealershipState}
                              </span>
                            </div>
                            <span className="text-[10px] text-neutral-500">
                              {order.dealershipCity} • Região {order.dealershipRegion}
                            </span>
                          </td>

                          {/* Items & Colors */}
                          <td className="py-3.5 px-4 max-w-xs">
                            <div className="space-y-1">
                              {order.items.map((item, idx) => (
                                <div key={idx} className="flex items-center gap-1.5 text-[11px]">
                                  <span className="font-bold text-neutral-200">{item.quantity}x</span>
                                  <span className="text-white truncate max-w-[120px]">{item.modelName}</span>
                                  <span 
                                    className="w-2.5 h-2.5 rounded-full border border-neutral-700 shrink-0" 
                                    style={{ backgroundColor: item.colorHex }} 
                                    title={item.colorName}
                                  />
                                  <span className="text-[10px] text-neutral-400 truncate max-w-[90px]">{item.colorName}</span>
                                </div>
                              ))}
                            </div>
                          </td>

                          {/* Value Total */}
                          <td className="py-3.5 px-4 text-right">
                            <p className="font-bold text-white text-[13px]">
                              R$ {order.totalAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                            </p>
                            <span className="text-[11px] text-neutral-500">{order.totalUnits} motocicletas</span>
                          </td>

                          {/* Credit Status */}
                          <td className="py-3.5 px-4 text-center">
                            {order.creditApproved ? (
                              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-950/70 border border-emerald-800/50 px-2 py-0.5 rounded-full">
                                <Check className="w-3 h-3" /> Aprovado
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-400 bg-amber-950/70 border border-amber-800/50 px-2 py-0.5 rounded-full">
                                <Clock className="w-3 h-3" /> Em Análise
                              </span>
                            )}
                          </td>

                          {/* Commercial Status */}
                          <td className="py-3.5 px-4 text-center">
                            {order.commercialApproved ? (
                              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-950/70 border border-emerald-800/50 px-2 py-0.5 rounded-full">
                                <Check className="w-3 h-3" /> Aprovado
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-blue-400 bg-blue-950/70 border border-blue-800/50 px-2 py-0.5 rounded-full">
                                <Clock className="w-3 h-3" /> Pendente
                              </span>
                            )}
                          </td>

                          {/* ERP Protheus Status */}
                          <td className="py-3.5 px-4 text-center">
                            {order.protheusIntegrated ? (
                              <div className="flex flex-col items-center">
                                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-300 bg-emerald-950 border border-emerald-700/60 px-2 py-0.5 rounded-full">
                                  <Database className="w-3 h-3" /> Integrado
                                </span>
                                <span className="text-[9px] font-mono text-neutral-400 mt-0.5 font-bold">
                                  {order.protheusOrderNumber}
                                </span>
                              </div>
                            ) : isReadyToIntegrate ? (
                              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-purple-300 bg-purple-950 border border-purple-800/60 px-2 py-0.5 rounded-full animate-pulse">
                                Pronto p/ ERP
                              </span>
                            ) : (
                              <span className="text-[10px] text-neutral-500">
                                Aguardando Aprovações
                              </span>
                            )}
                          </td>

                          {/* Actions */}
                          <td className="py-3.5 px-4 text-center">
                            <div className="flex items-center justify-center gap-1.5">
                              <button
                                onClick={() => handleOpenManageOrder(order)}
                                className={`px-2.5 py-1.5 rounded-xl font-bold text-[11px] flex items-center justify-center gap-1 transition-all ${
                                  isReadyToIntegrate
                                    ? 'bg-purple-600 hover:bg-purple-500 text-white shadow-md shadow-purple-500/20'
                                    : 'bg-blue-600/20 hover:bg-blue-600 text-blue-400 hover:text-white border border-blue-500/30'
                                }`}
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                                <span>{isReadyToIntegrate ? 'Integrar ERP' : 'Gerenciar'}</span>
                              </button>

                              <button
                                onClick={() => setMontadoraTab('approval_sheet')}
                                className="px-2.5 py-1.5 rounded-xl font-bold text-[11px] flex items-center justify-center gap-1 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 transition-all"
                                title="Abrir Ficha de Aprovação e Análise de Crédito JTA+JTZ (Documento Anexo)"
                              >
                                <FileText className="w-3.5 h-3.5" />
                                <span>Ficha JTA</span>
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
        </div>
      )}

      {/* =========================================================================
          VIEW MODE 2: CONCESSIONÁRIA VIEW OR MONTADORA CATALOG TAB
         ========================================================================= */}
      {(!isMontadora || montadoraTab === 'catalog') && (
        <div className="space-y-6">
          {/* Concessionária Active Orders Tracker Banner (When in Dealer Scope) */}
          {!isMontadora && (
            <div className="bg-[#18181b] border border-[#27272a] rounded-3xl p-5 md:p-6 shadow-sm space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-neutral-800/80 pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <Truck className="w-5 h-5 text-blue-400" />
                    <h3 className="text-base sm:text-lg font-bold text-white">
                      Meus Pedidos de Fábrica ({filteredOrders.length})
                    </h3>
                  </div>
                  <p className="text-xs text-neutral-400 mt-0.5">
                    Acompanhamento de aprovação de crédito, comercial e status ERP Manaus
                  </p>
                </div>

                {/* Filter tabs & Search */}
                <div className="flex flex-wrap items-center gap-2">
                  <div className="flex items-center bg-neutral-900 border border-neutral-800 rounded-xl p-1 text-xs">
                    <button
                      onClick={() => setDealerOrdersFilter('todos')}
                      className={`px-3 py-1 rounded-lg font-bold transition-colors ${
                        dealerOrdersFilter === 'todos' ? 'bg-blue-600 text-white' : 'text-neutral-400 hover:text-white'
                      }`}
                    >
                      Todos ({filteredOrders.length})
                    </button>
                    <button
                      onClick={() => setDealerOrdersFilter('analise')}
                      className={`px-3 py-1 rounded-lg font-bold transition-colors ${
                        dealerOrdersFilter === 'analise' ? 'bg-amber-600 text-white' : 'text-neutral-400 hover:text-white'
                      }`}
                    >
                      Em Análise ({filteredOrders.filter(o => !o.creditApproved || !o.commercialApproved).length})
                    </button>
                    <button
                      onClick={() => setDealerOrdersFilter('aprovados')}
                      className={`px-3 py-1 rounded-lg font-bold transition-colors ${
                        dealerOrdersFilter === 'aprovados' ? 'bg-purple-600 text-white' : 'text-neutral-400 hover:text-white'
                      }`}
                    >
                      Aprovados ({filteredOrders.filter(o => o.creditApproved && o.commercialApproved && !o.protheusIntegrated).length})
                    </button>
                    <button
                      onClick={() => setDealerOrdersFilter('integrados')}
                      className={`px-3 py-1 rounded-lg font-bold transition-colors ${
                        dealerOrdersFilter === 'integrados' ? 'bg-emerald-600 text-white' : 'text-neutral-400 hover:text-white'
                      }`}
                    >
                      ERP ({filteredOrders.filter(o => o.protheusIntegrated).length})
                    </button>
                  </div>
                </div>
              </div>

              {/* Search bar if multiple orders */}
              {filteredOrders.length > 0 && (
                <div className="relative">
                  <input
                    type="text"
                    value={dealerOrdersSearch}
                    onChange={(e) => setDealerOrdersSearch(e.target.value)}
                    placeholder="Filtrar meus pedidos por número (ex: PED-2024), modelo (ex: Hayabusa) ou cor..."
                    className="w-full bg-neutral-900/90 border border-neutral-800 rounded-xl px-4 py-2 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-blue-500"
                  />
                  {dealerOrdersSearch && (
                    <button
                      onClick={() => setDealerOrdersSearch('')}
                      className="absolute right-3 top-2.5 text-xs text-neutral-400 hover:text-white"
                    >
                      ✕
                    </button>
                  )}
                </div>
              )}

              {filteredOrders.length === 0 ? (
                <div className="text-center py-6 bg-neutral-900/40 rounded-2xl border border-dashed border-neutral-800">
                  <Truck className="w-8 h-8 text-neutral-600 mx-auto mb-2" />
                  <p className="text-xs text-neutral-400 font-bold">
                    Nenhum pedido de fábrica transmitido até o momento.
                  </p>
                  <p className="text-[11px] text-neutral-500 mt-1">
                    Selecione as motocicletas no catálogo abaixo para montar e enviar um novo lote para a montadora.
                  </p>
                </div>
              ) : filteredDealerOrders.length === 0 ? (
                <p className="text-xs text-neutral-500 text-center py-4">
                  Nenhum pedido encontrado com os filtros e busca selecionados.
                </p>
              ) : (
                <div className="space-y-3">
                  {filteredDealerOrders.map(ord => (
                    <div 
                      key={ord.id}
                      onClick={() => setViewingDealerOrder(ord)}
                      className="p-4 bg-neutral-900/80 hover:bg-neutral-900 border border-neutral-800 hover:border-blue-500/50 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4 cursor-pointer transition-all duration-200 group shadow-sm hover:shadow-md"
                    >
                      <div className="space-y-2 flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-mono font-bold text-white text-sm group-hover:text-blue-400 transition-colors">
                            {ord.orderNumber}
                          </span>
                          <span className="text-[11px] text-neutral-400 font-mono flex items-center gap-1">
                            <Clock className="w-3 h-3 text-neutral-500" />
                            {ord.createdAt}
                          </span>
                          <span className="text-[10px] bg-neutral-800 text-neutral-300 px-2 py-0.5 rounded font-bold border border-neutral-700">
                            {ord.freightMode === 'CIF' ? 'Frete CIF (Incluso)' : 'Frete FOB'}
                          </span>
                          <span className="text-[10px] bg-neutral-800 text-neutral-300 px-2 py-0.5 rounded font-bold border border-neutral-700">
                            {ord.paymentMethod}
                          </span>
                        </div>

                        {/* Items list with color indicators */}
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 text-xs text-neutral-300">
                          {ord.items.map((item, iIdx) => (
                            <div key={item.id || iIdx} className="flex items-center gap-1.5 bg-neutral-950/60 px-2.5 py-1 rounded-lg border border-neutral-800">
                              <span 
                                className="w-2.5 h-2.5 rounded-full border border-white/20 shrink-0" 
                                style={{ backgroundColor: item.colorHex || '#3b82f6' }}
                              />
                              <span className="font-bold text-white">{item.quantity}x</span>
                              <span>{item.modelName}</span>
                              <span className="text-neutral-500 text-[10px]">({item.colorName})</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Right side: Amount and Status + Action Button */}
                      <div className="flex flex-wrap sm:flex-nowrap items-center justify-between sm:justify-end gap-3 text-xs shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-neutral-800">
                        <div className="text-left sm:text-right font-tabular">
                          <span className="text-white font-black text-sm block">
                            R$ {ord.totalAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          </span>
                          <span className="text-[11px] text-neutral-400">
                            {ord.totalUnits} {ord.totalUnits === 1 ? 'motocicleta' : 'motocicletas'}
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          {ord.protheusIntegrated ? (
                            <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-emerald-300 bg-emerald-950/80 border border-emerald-800/80 px-3 py-1.5 rounded-xl">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              ERP: {ord.protheusOrderNumber}
                            </span>
                          ) : ord.creditApproved && ord.commercialApproved ? (
                            <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-purple-300 bg-purple-950/80 border border-purple-800/80 px-3 py-1.5 rounded-xl">
                              <Database className="w-3.5 h-3.5" />
                              Aprovado Fábrica
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-amber-300 bg-amber-950/80 border border-amber-800/80 px-3 py-1.5 rounded-xl">
                              <Clock className="w-3.5 h-3.5" />
                              Em Análise Fábrica
                            </span>
                          )}

                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setViewingDealerOrder(ord);
                            }}
                            className="px-3 py-1.5 bg-blue-600/20 hover:bg-blue-600 text-blue-400 hover:text-white rounded-xl text-xs font-bold border border-blue-500/30 hover:border-blue-600 flex items-center gap-1.5 transition-all shadow-sm"
                            title="Visualizar espelho completo do pedido"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span className="hidden sm:inline">Visualizar Pedido</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Freight Mode Selector & Credit Limits */}
          {!isMontadora && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-[#18181b] rounded-3xl p-5 md:p-6 border border-[#27272a] shadow-md flex flex-col justify-between">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-neutral-500 text-[10px] font-bold uppercase tracking-widest block mb-1">
                      Limite Homologado de Crédito
                    </span>
                    <p className="text-[24px] font-bold text-[#fafafa] font-tabular">
                      R$ {creditLimitTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                  <div className="p-2 bg-neutral-800 rounded-xl text-[#3b82f6] border border-[#27272a]">
                    <Building2 className="w-5 h-5" />
                  </div>
                </div>
                <p className="text-[11px] text-neutral-400 mt-2">Concessionária: {activeProfile?.name}</p>
              </div>

              <div className="bg-[#18181b] rounded-3xl p-5 md:p-6 border border-[#27272a] shadow-md flex flex-col justify-between">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-neutral-500 text-[10px] font-bold uppercase tracking-widest block mb-1">
                      Crédito Disponível Líquido
                    </span>
                    <p className={`text-[24px] font-bold font-tabular ${
                      simulatedCreditRemaining >= 0 ? 'text-emerald-400' : 'text-rose-400'
                    }`}>
                      R$ {simulatedCreditRemaining.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                  <div className="p-2 bg-neutral-800 rounded-xl text-emerald-400 border border-[#27272a]">
                    <CreditCard className="w-5 h-5" />
                  </div>
                </div>
                <div className="w-full bg-neutral-800 h-1.5 rounded-full overflow-hidden mt-3">
                  <div 
                    style={{ width: `${Math.min(100, ((creditLimitTotal - simulatedCreditRemaining) / creditLimitTotal) * 100)}%` }} 
                    className="bg-[#3b82f6] h-full transition-all duration-500 rounded-full"
                  />
                </div>
              </div>

              <div className="bg-[#18181b] rounded-3xl p-5 md:p-6 border border-[#27272a] shadow-md flex flex-col justify-between">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-neutral-500 text-[10px] font-bold uppercase tracking-widest block mb-1">
                      Total do Pedido Atual
                    </span>
                    <p className="text-[24px] font-bold text-[#60a5fa] font-tabular">
                      R$ {totalOrderAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                  <div className="p-2 bg-neutral-800 rounded-xl text-[#60a5fa] border border-[#27272a]">
                    <ShoppingCart className="w-5 h-5" />
                  </div>
                </div>
                <div className="flex items-center justify-between text-[11px] text-neutral-400 mt-2 font-tabular">
                  <span>{totalOrderUnits} unidades selecionadas</span>
                  <span className="text-neutral-500">Condição: 30/60/90</span>
                </div>
              </div>
            </div>
          )}

          {/* Brands Tabs, Search & Actions Toolbar */}
          <div className="space-y-4 border-b border-[#27272a] pb-4">
            <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
              
              {/* Brand Tabs */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 lg:pb-0">
                {brands.map((b) => (
                  <button
                    key={b.id}
                    onClick={() => {
                      setSelectedBrand(b.id);
                      setCatalogSearchQuery('');
                    }}
                    className={`px-4 py-2 rounded-xl text-[12px] font-bold whitespace-nowrap transition-all flex items-center gap-2 ${
                      selectedBrand === b.id 
                        ? 'bg-[#3b82f6] text-white shadow-md shadow-blue-500/20' 
                        : 'text-neutral-400 hover:text-white hover:bg-neutral-800'
                    }`}
                  >
                    <span className={`w-2 h-2 rounded-full ${
                      b.id === 'Suzuki' ? 'bg-red-500' :
                      b.id === 'Zontes' ? 'bg-amber-500' :
                      b.id === 'Haojue' ? 'bg-blue-400' : 'bg-emerald-400'
                    }`} />
                    <span>{b.name}</span>
                  </button>
                ))}
              </div>

              {/* Action Buttons & Frete */}
              <div className="flex flex-wrap items-center gap-2.5">
                
                {/* Search in Catalog */}
                <div className="relative min-w-[200px] flex-1 sm:flex-initial">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" />
                  <input
                    type="text"
                    value={catalogSearchQuery}
                    onChange={(e) => setCatalogSearchQuery(e.target.value)}
                    placeholder="Buscar modelo, cc, categoria..."
                    className="w-full bg-[#18181b] border border-[#27272a] rounded-xl pl-8 pr-3 py-1.5 text-xs text-white placeholder-neutral-500 focus:border-blue-500 focus:outline-none"
                  />
                  {catalogSearchQuery && (
                    <button
                      onClick={() => setCatalogSearchQuery('')}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-neutral-300"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </div>

                {/* Frete Mode Toggle */}
                <div className="flex bg-[#18181b] border border-[#27272a] rounded-xl p-1 text-[11px] font-bold">
                  <button 
                    onClick={() => setFreightMode('CIF')}
                    className={`px-3 py-1 rounded-lg transition-all ${
                      freightMode === 'CIF' 
                        ? 'bg-[#3b82f6] text-white shadow-sm' 
                        : 'text-neutral-400 hover:text-white'
                    }`}
                  >
                    Frete CIF
                  </button>
                  <button 
                    onClick={() => setFreightMode('FOB')}
                    className={`px-3 py-1 rounded-lg transition-all ${
                      freightMode === 'FOB' 
                        ? 'bg-[#3b82f6] text-white shadow-sm' 
                        : 'text-neutral-400 hover:text-white'
                    }`}
                  >
                    Frete FOB
                  </button>
                </div>

                {/* Cadastrar Nova Motocicleta */}
                <button
                  onClick={() => {
                    setModelToEditModal(null);
                    setIsModelFormOpen(true);
                  }}
                  className="px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-white rounded-xl text-xs font-bold border border-neutral-700 flex items-center gap-1.5 transition-colors shadow-sm"
                  title="Cadastrar novo modelo de moto ou ficha técnica"
                >
                  <Plus className="w-3.5 h-3.5 text-blue-400" />
                  <span>Cadastrar Moto</span>
                </button>

                {/* Link Suzuki Oficial */}
                <a
                  href="https://suzukimotos.com.br/"
                  target="_blank"
                  rel="noreferrer"
                  className="px-3 py-1.5 bg-red-600/15 hover:bg-red-600/25 text-red-400 rounded-xl text-xs font-bold border border-red-500/30 flex items-center gap-1.5 transition-colors"
                  title="Abrir site oficial da Suzuki Motos Brasil"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">suzukimotos.com.br</span>
                </a>
              </div>
            </div>

            {/* Quick Filter Info Tag */}
            <div className="flex items-center justify-between text-xs text-neutral-400 font-medium">
              <span>
                Exibindo <strong>{searchedCatalogModels.length}</strong> modelo(s) da marca <strong>{selectedBrand}</strong> com fotos por cor e ficha técnica completa
              </span>
              <span className="text-[11px] text-neutral-500">
                Passe o mouse ou clique nas cores para alternar as fotos oficiais
              </span>
            </div>
          </div>

          {/* Motorcycle Products Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {searchedCatalogModels.map((model) => {
              const selectedCount = model.variants.reduce((acc, v) => acc + v.quantity, 0);
              const activeVariantIdx = cardActiveColorIndex[model.id] ?? 0;
              const activeVariant = model.variants[activeVariantIdx] || model.variants[0];
              const displayImage = activeVariant?.imageUrl || model.image || 'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&w=1000&q=80';
              const specs = model.technicalSpecs;

              return (
                <div 
                  key={model.id}
                  className="bg-[#18181b] border border-[#27272a] rounded-3xl overflow-hidden shadow-md flex flex-col justify-between group hover:border-[#3b82f6]/40 transition-all relative"
                >
                  {/* Photo with Interactive Color Swatches & Badges */}
                  <div className="relative aspect-[16/10] bg-neutral-950/90 border-b border-neutral-800/80 overflow-hidden flex items-center justify-center">
                    <img
                      src={displayImage}
                      alt={`${model.modelName} - ${activeVariant?.colorName}`}
                      className="w-full h-full object-contain p-3 transition-all duration-300 group-hover:scale-105"
                      referrerPolicy="no-referrer"
                    />

                    {/* Brand & Category Badge */}
                    <div className="absolute top-3 left-3 flex items-center gap-1.5">
                      <span className={`px-2.5 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-wider ${
                        model.brand === 'Suzuki' ? 'bg-red-600 text-white' :
                        model.brand === 'Zontes' ? 'bg-amber-600 text-white' :
                        model.brand === 'Haojue' ? 'bg-blue-600 text-white' : 'bg-neutral-800 text-white'
                      }`}>
                        {model.brand}
                      </span>
                      {model.yearModel && (
                        <span className="text-[10px] bg-black/70 backdrop-blur-sm text-neutral-300 px-2 py-0.5 rounded-md font-mono border border-neutral-700">
                          {model.yearModel}
                        </span>
                      )}
                    </div>

                    {/* Active Color Preview Badge */}
                    <div className="absolute bottom-3 left-3 bg-neutral-900/90 backdrop-blur-md px-2.5 py-1 rounded-xl border border-neutral-700/80 flex items-center gap-2 shadow-lg">
                      <span 
                        className="w-3 h-3 rounded-full border border-white/30"
                        style={{ backgroundColor: activeVariant?.colorHex || '#3b82f6' }}
                      />
                      <span className="text-[11px] font-bold text-white max-w-[130px] truncate">
                        {activeVariant?.colorName}
                      </span>
                      {activeVariant?.colorCode && (
                        <span className="text-[9px] text-neutral-400 font-mono">
                          {activeVariant.colorCode}
                        </span>
                      )}
                    </div>

                    {/* Stock Status Tag */}
                    <div className="absolute top-3 right-3">
                      {activeVariant?.stockStatus === 'disponivel' ? (
                        <span className="bg-emerald-950/80 backdrop-blur-md border border-emerald-500/30 text-emerald-400 text-[10px] font-bold px-2 py-0.5 rounded-lg flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                          Fábrica Disponível
                        </span>
                      ) : activeVariant?.stockStatus === 'poucas' ? (
                        <span className="bg-amber-950/80 backdrop-blur-md border border-amber-500/30 text-amber-400 text-[10px] font-bold px-2 py-0.5 rounded-lg flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                          Lote Limitado
                        </span>
                      ) : (
                        <span className="bg-rose-950/80 backdrop-blur-md border border-rose-500/30 text-rose-400 text-[10px] font-bold px-2 py-0.5 rounded-lg">
                          Sob Encomenda
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="p-5 space-y-4 flex-1">
                    {/* Model Title & Category */}
                    <div>
                      <span className="text-[10px] uppercase font-bold text-neutral-400 tracking-wider block">
                        {model.category}
                      </span>
                      <div className="flex items-center justify-between gap-2">
                        <h3 className="text-[18px] font-black text-[#fafafa] tracking-tight">
                          {model.modelName}
                        </h3>
                      </div>
                    </div>

                    {/* Quick Specs Chips */}
                    {specs && (
                      <div className="grid grid-cols-3 gap-1.5 text-center">
                        <div className="bg-neutral-900/80 p-1.5 rounded-xl border border-neutral-800/80">
                          <span className="text-[9px] uppercase font-bold text-neutral-500 block">Potência</span>
                          <span className="text-[11px] font-bold text-blue-400 font-mono truncate block">
                            {specs.power ? specs.power.split('@')[0].trim() : 'N/D'}
                          </span>
                        </div>
                        <div className="bg-neutral-900/80 p-1.5 rounded-xl border border-neutral-800/80">
                          <span className="text-[9px] uppercase font-bold text-neutral-500 block">Cilindrada</span>
                          <span className="text-[11px] font-bold text-white font-mono truncate block">
                            {specs.displacement || 'N/D'}
                          </span>
                        </div>
                        <div className="bg-neutral-900/80 p-1.5 rounded-xl border border-neutral-800/80">
                          <span className="text-[9px] uppercase font-bold text-neutral-500 block">0-100 / Vel.</span>
                          <span className="text-[11px] font-bold text-emerald-400 font-mono truncate block">
                            {specs.acceleration0to100 || specs.topSpeed || 'N/D'}
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Pricing */}
                    <div className="p-3 bg-neutral-900 rounded-2xl border border-neutral-800/80 font-tabular space-y-1">
                      <div className="flex justify-between text-[11px]">
                        <span className="text-neutral-400">Custo Concessionária (Fábrica):</span>
                        <strong className="text-white">R$ {model.factoryCost.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</strong>
                      </div>
                      <div className="flex justify-between text-[11px]">
                        <span className="text-neutral-400">PPS Sugerido (Venda):</span>
                        <span className="text-emerald-400 font-bold">R$ {model.ppsMSRP.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                      </div>
                    </div>

                    {/* Interactive Color Swatches with Quick Thumbnail Selector */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-[10px] uppercase font-bold text-neutral-400 tracking-wider">
                        <span>Cores & Quantidades por Lote</span>
                        <span className="text-neutral-500 normal-case">{model.variants.length} cores</span>
                      </div>

                      <div className="space-y-1.5">
                        {model.variants.map((v, vIdx) => {
                          const isVariantActive = activeVariantIdx === vIdx;

                          return (
                            <div 
                              key={v.id}
                              className={`flex items-center justify-between p-2 rounded-xl border transition-all ${
                                isVariantActive 
                                  ? 'bg-blue-600/10 border-blue-500/40 shadow-sm' 
                                  : 'bg-neutral-900/60 border-neutral-800/60 hover:border-neutral-700'
                              }`}
                            >
                              {/* Color Click to change Active Photo */}
                              <button
                                type="button"
                                onClick={() => setCardActiveColorIndex(prev => ({ ...prev, [model.id]: vIdx }))}
                                className="flex items-center gap-2 min-w-0 text-left flex-1 group/btn"
                                title="Clique para ver a foto desta cor"
                              >
                                <span 
                                  className={`w-4 h-4 rounded-full border shrink-0 transition-transform ${
                                    isVariantActive ? 'scale-110 ring-2 ring-blue-400 border-white' : 'border-neutral-600'
                                  }`} 
                                  style={{ backgroundColor: v.colorHex }}
                                />
                                <div className="min-w-0">
                                  <span className={`text-[11px] font-medium block truncate max-w-[130px] ${
                                    isVariantActive ? 'text-blue-300 font-bold' : 'text-white'
                                  }`}>
                                    {v.colorName}
                                  </span>
                                  {v.colorCode && (
                                    <span className="text-[9px] text-neutral-500 font-mono">
                                      Cód. {v.colorCode}
                                    </span>
                                  )}
                                </div>
                              </button>

                              {/* Quantity Controls */}
                              <div className="flex items-center gap-1.5 shrink-0">
                                <button
                                  type="button"
                                  onClick={() => onUpdateVariantQuantity(model.id, v.id, -1)}
                                  disabled={v.quantity === 0}
                                  className="w-6 h-6 rounded-lg bg-neutral-800 text-neutral-300 hover:bg-neutral-700 disabled:opacity-30 flex items-center justify-center transition-colors"
                                >
                                  <Minus className="w-3 h-3" />
                                </button>
                                <span className="text-[12px] font-bold text-white w-5 text-center font-tabular">
                                  {v.quantity}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => onUpdateVariantQuantity(model.id, v.id, 1)}
                                  className="w-6 h-6 rounded-lg bg-blue-600 text-white hover:bg-blue-500 flex items-center justify-center transition-colors shadow-sm"
                                >
                                  <Plus className="w-3 h-3" />
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Action Buttons: Ficha Técnica & Editar */}
                    <div className="grid grid-cols-2 gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => setSelectedSpecModal(model)}
                        className="p-2 bg-blue-600/15 hover:bg-blue-600/25 text-blue-400 hover:text-blue-300 border border-blue-500/30 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors shadow-sm"
                        title="Ver Ficha Técnica e Desempenho Completo"
                      >
                        <Gauge className="w-3.5 h-3.5" />
                        <span>Ficha Técnica</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setModelToEditModal(model);
                          setIsModelFormOpen(true);
                        }}
                        className="p-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white border border-neutral-700 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
                        title="Editar cadastro técnico e fotos"
                      >
                        <Settings2 className="w-3.5 h-3.5" />
                        <span>Editar Moto</span>
                      </button>
                    </div>

                  </div>

                  {/* Card Footer */}
                  <div className="p-4 bg-neutral-900/40 border-t border-neutral-800 flex items-center justify-between text-[11px]">
                    <span className="text-neutral-400">
                      Selecionado: <strong className="text-white">{selectedCount} un.</strong>
                    </span>
                    <span className="font-bold text-blue-400 font-tabular text-xs">
                      R$ {(selectedCount * model.factoryCost).toLocaleString('pt-BR')}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Concessionária Transmit Order Sticky Bar */}
          {!isMontadora && totalOrderUnits > 0 && (
            <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-full max-w-4xl px-4 z-40 animate-in slide-in-from-bottom duration-200">
              <div className="bg-[#18181b]/95 backdrop-blur-md border border-blue-500/50 rounded-3xl p-4 md:p-5 shadow-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-blue-600 rounded-2xl text-white shadow-lg shadow-blue-500/30">
                    <ShoppingCart className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-blue-400 tracking-wider">
                      Resumo do Lote de Fábrica • Frete {freightMode}
                    </span>
                    <h4 className="text-[18px] font-bold text-white font-tabular">
                      R$ {totalOrderAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </h4>
                    <p className="text-[11px] text-neutral-400 font-tabular">
                      {totalOrderUnits} motocicletas selecionadas para {activeProfile?.name}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => onPlaceOrder(freightMode, totalOrderAmount, totalOrderUnits, activeSelectedOrderItems)}
                  className="bg-blue-600 hover:bg-blue-500 text-white font-bold px-6 py-3.5 rounded-2xl text-[13px] flex items-center justify-center gap-2 transition-all shadow-lg shadow-blue-500/30 active:scale-[0.98]"
                >
                  <Send className="w-4 h-4" />
                  <span>Transmitir Pedido à Montadora</span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* =========================================================================
          MONTADORA ORDER MANAGEMENT MODAL (COLORS, MODELS, CREDIT, ERP PROTHEUS)
         ========================================================================= */}
      {managedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-[#18181b] border border-[#27272a] rounded-3xl max-w-4xl w-full p-6 md:p-8 shadow-2xl relative overflow-hidden max-h-[90vh] overflow-y-auto space-y-6">
            {/* Modal Header */}
            <div className="flex items-start justify-between gap-4 pb-4 border-b border-[#27272a]">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-blue-600/20 text-blue-400 border border-blue-500/30 rounded-2xl">
                  <Factory className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] uppercase font-bold text-blue-400 tracking-wider">
                      Gestão de Pedido B2B • Montadora J. Toledo
                    </span>
                    <span className="text-[9px] bg-neutral-800 text-neutral-300 px-1.5 py-0.2 rounded font-bold">
                      {managedOrder.orderNumber}
                    </span>
                  </div>
                  <h3 className="text-[20px] font-bold text-white">
                    {managedOrder.dealershipName} ({managedOrder.dealershipState})
                  </h3>
                  <p className="text-[11px] text-neutral-400">
                    CNPJ: {managedOrder.dealershipCnpj} • Criado em {managedOrder.createdAt} • Frete {managedOrder.freightMode}
                  </p>
                </div>
              </div>

              <button 
                onClick={() => setManagedOrder(null)}
                className="p-2 text-neutral-400 hover:text-white hover:bg-neutral-800 rounded-xl"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* SEÇÃO 1: ITENS DO PEDIDO & ALTERAÇÃO DE CORES E MODELOS */}
            <div className="bg-neutral-900/80 border border-neutral-800 rounded-2xl p-5 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Palette className="w-4 h-4 text-blue-400" />
                  <h4 className="text-[14px] font-bold text-white">
                    Itens do Pedido & Ajuste de Cores / Modelos
                  </h4>
                </div>
                <span className="text-[11px] text-neutral-400">
                  A montadora pode alterar cores ou substituir modelos antes do faturamento.
                </span>
              </div>

              {/* Items Table inside Modal */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-[12px] border-collapse font-tabular">
                  <thead>
                    <tr className="border-b border-neutral-800 text-[10px] font-bold text-neutral-400 uppercase">
                      <th className="py-2 px-3">Modelo</th>
                      <th className="py-2 px-3">Cor Selecionada (Fábrica)</th>
                      <th className="py-2 px-3 text-center">Quantidade</th>
                      <th className="py-2 px-3 text-right">Custo Unitário</th>
                      <th className="py-2 px-3 text-right">Total Item</th>
                      <th className="py-2 px-3 text-center">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-800/80">
                    {temporaryItems.map((item, idx) => (
                      <tr key={idx} className="hover:bg-neutral-800/40">
                        {/* Model */}
                        <td className="py-2.5 px-3">
                          <p className="font-bold text-white">{item.modelName}</p>
                          <span className="text-[10px] text-neutral-400">{item.brand} • {item.category}</span>
                        </td>

                        {/* Color Selector Dropdown (Montadora Color Adjustment) */}
                        <td className="py-2.5 px-3">
                          <div className="flex items-center gap-2">
                            <span 
                              className="w-4 h-4 rounded-full border border-neutral-700 shrink-0" 
                              style={{ backgroundColor: item.colorHex }}
                            />
                            <select
                              value={item.colorName}
                              onChange={(e) => {
                                const found = item.availableColors?.find(c => c.colorName === e.target.value);
                                if (found) {
                                  handleChangeItemColor(idx, found.colorName, found.colorHex);
                                }
                              }}
                              className="bg-neutral-800 border border-neutral-700 text-white text-[11px] rounded-lg px-2 py-1 focus:outline-none focus:border-blue-500 font-medium"
                            >
                              {item.availableColors && item.availableColors.length > 0 ? (
                                item.availableColors.map((col, cIdx) => (
                                  <option key={cIdx} value={col.colorName}>
                                    {col.colorName} {col.inStock ? '(Em Estoque)' : '(Sob Demanda)'}
                                  </option>
                                ))
                              ) : (
                                <option value={item.colorName}>{item.colorName}</option>
                              )}
                            </select>
                          </div>
                        </td>

                        {/* Quantity Adjuster */}
                        <td className="py-2.5 px-3 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              onClick={() => handleChangeItemQuantity(idx, -1)}
                              className="w-5 h-5 rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-300 flex items-center justify-center"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="font-bold text-white w-6 text-center">{item.quantity}</span>
                            <button
                              onClick={() => handleChangeItemQuantity(idx, 1)}
                              className="w-5 h-5 rounded bg-blue-600 hover:bg-blue-500 text-white flex items-center justify-center"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>
                        </td>

                        {/* Unit Cost */}
                        <td className="py-2.5 px-3 text-right text-neutral-300">
                          R$ {item.unitFactoryCost.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </td>

                        {/* Total Cost */}
                        <td className="py-2.5 px-3 text-right font-bold text-white">
                          R$ {item.totalItemCost.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </td>

                        {/* Delete Item */}
                        <td className="py-2.5 px-3 text-center">
                          <button
                            onClick={() => handleRemoveItem(idx)}
                            className="p-1 text-neutral-400 hover:text-rose-400 hover:bg-neutral-800 rounded"
                            title="Remover modelo do pedido"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Add Model Control & Recalculation Bar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-neutral-800">
                <div className="flex items-center gap-2">
                  {showAddModelSelect ? (
                    <div className="flex items-center gap-2">
                      <select
                        value={selectedModelToAdd}
                        onChange={(e) => setSelectedModelToAdd(e.target.value)}
                        className="bg-neutral-800 border border-neutral-700 text-white text-[11px] rounded-xl px-3 py-1.5 focus:outline-none focus:border-blue-500"
                      >
                        {purchaseModels.map(m => (
                          <option key={m.id} value={m.id}>{m.modelName} (R$ {m.factoryCost.toLocaleString('pt-BR')})</option>
                        ))}
                      </select>
                      <button
                        onClick={handleAddModelToOrder}
                        className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-[11px]"
                      >
                        Adicionar
                      </button>
                      <button
                        onClick={() => setShowAddModelSelect(false)}
                        className="px-2 py-1.5 bg-neutral-800 text-neutral-400 rounded-xl text-[11px]"
                      >
                        Cancelar
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setShowAddModelSelect(true)}
                      className="px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 font-bold rounded-xl text-[11px] flex items-center gap-1.5"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Adicionar/Substituir Modelo</span>
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-4 text-[12px] font-tabular">
                  <span className="text-neutral-400">
                    Total Recalculado: <strong className="text-white">{temporaryItems.reduce((acc, i) => acc + i.quantity, 0)} unidades</strong>
                  </span>
                  <span className="text-blue-400 font-bold text-[14px]">
                    R$ {temporaryItems.reduce((acc, i) => acc + i.totalItemCost, 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </span>
                  <button
                    onClick={handleSaveItemsChanges}
                    className="px-4 py-1.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-[11px] transition-colors"
                  >
                    Salvar Ajuste de Itens
                  </button>
                </div>
              </div>
            </div>

            {/* SEÇÃO 2 & 3: AVALIAÇÃO DE CRÉDITO & APROVAÇÃO COMERCIAL */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Gate 1: Avaliação de Crédito (J. Toledo Finance) */}
              <div className="bg-neutral-900/80 border border-neutral-800 rounded-2xl p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CreditCard className="w-4 h-4 text-blue-400" />
                    <h4 className="text-[14px] font-bold text-white">1. Avaliação de Crédito</h4>
                  </div>
                  {managedOrder.creditApproved ? (
                    <span className="text-[10px] bg-emerald-950 text-emerald-300 border border-emerald-800 px-2 py-0.5 rounded-full font-bold">
                      Aprovado
                    </span>
                  ) : (
                    <span className="text-[10px] bg-amber-950 text-amber-300 border border-amber-800 px-2 py-0.5 rounded-full font-bold">
                      Pendente
                    </span>
                  )}
                </div>

                <div className="p-3 bg-neutral-950 rounded-xl border border-neutral-800 text-[11px] font-tabular space-y-1">
                  <div className="flex justify-between">
                    <span className="text-neutral-400">Limite Homologado:</span>
                    <strong className="text-white">R$ {(managedOrder.dealerCreditLimit || 3000000).toLocaleString('pt-BR')}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-400">Utilizado Atual:</span>
                    <span className="text-neutral-300">R$ {(managedOrder.dealerCreditUsed || 1890000).toLocaleString('pt-BR')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-400">Valor deste Pedido:</span>
                    <strong className="text-blue-400">R$ {managedOrder.totalAmount.toLocaleString('pt-BR')}</strong>
                  </div>
                  <div className="flex justify-between pt-1 border-t border-neutral-800">
                    <span className="text-neutral-400">Margem Pós-Pedido:</span>
                    <strong className="text-emerald-400">
                      R$ {((managedOrder.dealerCreditLimit || 3000000) - (managedOrder.dealerCreditUsed || 1890000) - managedOrder.totalAmount).toLocaleString('pt-BR')}
                    </strong>
                  </div>
                </div>

                {managedOrder.creditApproved ? (
                  <div className="text-[11px] text-neutral-400 space-y-0.5">
                    <p className="text-emerald-400 font-bold">✓ Analisado por {managedOrder.creditAnalyst}</p>
                    <p className="text-[10px] text-neutral-500">Data/Hora: {managedOrder.creditApprovedAt}</p>
                  </div>
                ) : (
                  <button
                    onClick={handleApproveCredit}
                    className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 rounded-xl text-[12px] flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Aprovar Crédito Financeiro (J. Toledo Finance)</span>
                  </button>
                )}
              </div>

              {/* Gate 2: Avaliação Comercial da Montadora */}
              <div className="bg-neutral-900/80 border border-neutral-800 rounded-2xl p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    <h4 className="text-[14px] font-bold text-white">2. Avaliação Comercial</h4>
                  </div>
                  {managedOrder.commercialApproved ? (
                    <span className="text-[10px] bg-emerald-950 text-emerald-300 border border-emerald-800 px-2 py-0.5 rounded-full font-bold">
                      Aprovado
                    </span>
                  ) : (
                    <span className="text-[10px] bg-blue-950 text-blue-300 border border-blue-800 px-2 py-0.5 rounded-full font-bold">
                      Pendente
                    </span>
                  )}
                </div>

                <div className="p-3 bg-neutral-950 rounded-xl border border-neutral-800 text-[11px] space-y-1">
                  <div className="flex justify-between">
                    <span className="text-neutral-400">Classificação da Loja:</span>
                    <strong className="text-white">{managedOrder.dealershipTier || 'Diamante'}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-400">Condição Comercial:</span>
                    <span className="text-neutral-300">{managedOrder.paymentMethod}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-400">Mix & Cota Mensal:</span>
                    <strong className="text-emerald-400">Conforme Planejamento Regional</strong>
                  </div>
                </div>

                {managedOrder.commercialApproved ? (
                  <div className="text-[11px] text-neutral-400 space-y-0.5">
                    <p className="text-emerald-400 font-bold">✓ Homologado por {managedOrder.commercialManager}</p>
                    <p className="text-[10px] text-neutral-500">Data/Hora: {managedOrder.commercialApprovedAt}</p>
                  </div>
                ) : (
                  <button
                    onClick={handleApproveCommercial}
                    className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2 rounded-xl text-[12px] flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Aprovar Mix Comercial (Diretoria de Rede)</span>
                  </button>
                )}
              </div>
            </div>

            {/* SEÇÃO 4: CONFIRMAÇÃO & INTEGRAÇÃO ERP TOTVS PROTHEUS */}
            <div className={`p-5 rounded-2xl border transition-all ${
              managedOrder.protheusIntegrated 
                ? 'bg-emerald-950/40 border-emerald-700/60' 
                : managedOrder.creditApproved && managedOrder.commercialApproved
                ? 'bg-purple-950/40 border-purple-600 ring-1 ring-purple-500'
                : 'bg-neutral-900/40 border-neutral-800 opacity-60'
            }`}>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Database className="w-5 h-5 text-purple-400" />
                    <h4 className="text-[16px] font-bold text-white">
                      3. Confirmação & Integração no ERP TOTVS Protheus
                    </h4>
                  </div>
                  <p className="text-[12px] text-neutral-300">
                    {managedOrder.protheusIntegrated
                      ? `Pedido faturado e integrado com sucesso na tabela SC5 do ERP Protheus Manaus (${managedOrder.protheusOrderNumber}).`
                      : managedOrder.creditApproved && managedOrder.commercialApproved
                      ? 'Todas as aprovações concluídas. Clique abaixo para emitir o pedido de venda no Protheus e alocar os chassis na fábrica.'
                      : 'O pedido requer aprovação prévia de Crédito e Comercial para liberação de integração no ERP.'}
                  </p>

                  {managedOrder.protheusIntegrated && (
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mt-3 p-3 bg-neutral-900 rounded-xl border border-neutral-800 text-[11px] font-mono">
                      <div>
                        <span className="text-neutral-500 uppercase block text-[9px]">ID Protheus (SC5)</span>
                        <strong className="text-emerald-400">{managedOrder.protheusOrderNumber}</strong>
                      </div>
                      <div>
                        <span className="text-neutral-500 uppercase block text-[9px]">Armazém de Faturamento</span>
                        <strong className="text-white">{managedOrder.protheusWarehouse}</strong>
                      </div>
                      <div>
                        <span className="text-neutral-500 uppercase block text-[9px]">Data de Integração</span>
                        <strong className="text-white">{managedOrder.protheusIntegratedAt}</strong>
                      </div>
                    </div>
                  )}
                </div>

                {!managedOrder.protheusIntegrated && (
                  <button
                    disabled={!managedOrder.creditApproved || !managedOrder.commercialApproved || isIntegratingProtheus}
                    onClick={handleConfirmAndIntegrateProtheus}
                    className="px-6 py-3.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold rounded-2xl text-[13px] flex items-center justify-center gap-2 transition-all shadow-xl shadow-purple-500/25 shrink-0"
                  >
                    {isIntegratingProtheus ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>Integrando com Protheus...</span>
                      </>
                    ) : (
                      <>
                        <Database className="w-4 h-4" />
                        <span>Confirmar & Integrar no Protheus</span>
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-between gap-3 pt-3 border-t border-[#27272a]">
              <button
                onClick={() => {
                  setManagedOrder(null);
                  setMontadoraTab('approval_sheet');
                }}
                className="px-4 py-2.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 font-bold rounded-xl text-[12px] flex items-center gap-2 transition-colors"
              >
                <FileText className="w-4 h-4" />
                <span>Ver Ficha Oficial de Aprovação JTA+JTZ</span>
              </button>

              <button
                onClick={() => setManagedOrder(null)}
                className="px-6 py-2.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 font-bold rounded-xl text-[12px] transition-colors"
              >
                Fechar Janela
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Model Technical Specs & Performance Modal */}
      {selectedSpecModal && (
        <ModelTechnicalSpecsModal
          isOpen={!!selectedSpecModal}
          onClose={() => setSelectedSpecModal(null)}
          model={selectedSpecModal}
          onOpenEdit={(m) => {
            setSelectedSpecModal(null);
            setModelToEditModal(m);
            setIsModelFormOpen(true);
          }}
        />
      )}

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

      {/* Dealership Full Order View & Printable Mirror Modal */}
      {viewingDealerOrder && (
        <DealershipOrderDetailModal
          isOpen={!!viewingDealerOrder}
          onClose={() => setViewingDealerOrder(null)}
          order={viewingDealerOrder}
          dealershipProfile={dealerships.find(d => d.id === currentScope)}
          onNavigateToTransit={onNavigateToCommitments}
        />
      )}
    </div>
  );
};
