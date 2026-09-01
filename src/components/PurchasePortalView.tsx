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
  DealerTier,
  ApprovalWorkflowStep,
  PaymentConditionCampaign
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
  Zap,
  UserCheck,
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
  ArrowLeft,
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
import { INITIAL_PAYMENT_CONDITIONS } from '../data/mockPaymentConditions';
import { calculateAutomaticFreight, getAutomaticWarehouseOrigin } from '../data/mockFreightTable';
import { INITIAL_RESERVE_FUND_TRANSACTIONS } from '../data/mockReserveFundData';
import { OrderApprovalDocument, DealershipFullProfile } from '../types';
import { INITIAL_ORDER_APPROVAL_PROPOSALS } from '../data/orderApprovalData';
import { OrderApprovalDocumentView } from './OrderApprovalDocumentView';
import { ModelTechnicalSpecsModal } from './ModelTechnicalSpecsModal';
import { ModelCatalogManagementModal } from './ModelCatalogManagementModal';
import { DealershipOrderDetailModal } from './DealershipOrderDetailModal';

interface PurchasePortalViewProps {
  currentScope: DealershipScope;
  purchaseModels: PurchaseModel[];
  enabledVariantsMap?: Record<string, boolean>;
  paymentConditions?: PaymentConditionCampaign[];
  workflowSteps?: ApprovalWorkflowStep[];
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
  enabledVariantsMap = {},
  paymentConditions = [],
  workflowSteps = [],
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
  const activeProfile = dealerships.find(d => d.id === currentScope) || DEALERSHIP_PROFILES[currentScope];

  // Active Main Tab for Montadora: 'orders' (Gestão & Aprovação ERP), 'approval_sheet' (Ficha JTA+JTZ), 'catalog' (Catálogo de Fábrica)
  const [montadoraTab, setMontadoraTab] = useState<'orders' | 'approval_sheet' | 'catalog'>('orders');

  // Filtered Models for Concessionária (Requirement a & b)
  const visiblePurchaseModels = useMemo(() => {
    if (isMontadora) return purchaseModels;
    return purchaseModels
      .filter(model => {
        // Hide if whole model is disabled
        if (enabledVariantsMap[model.id] === false) return false;
        // Hide if all variants are disabled
        const hasEnabledVariant = model.variants.some(v => enabledVariantsMap[`${model.id}-${v.id}`] !== false);
        return hasEnabledVariant;
      })
      .map(model => ({
        ...model,
        variants: model.variants.filter(v => enabledVariantsMap[`${model.id}-${v.id}`] !== false)
      }));
  }, [purchaseModels, enabledVariantsMap, isMontadora]);

  // Active Payment Conditions
  const activePaymentConditions = useMemo(() => {
    return paymentConditions.length > 0 ? paymentConditions : INITIAL_PAYMENT_CONDITIONS;
  }, [paymentConditions]);

  // Filters for Montadora Orders Table
  const [orderSearchQuery, setOrderSearchQuery] = useState('');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>('todos');
  const [selectedDealerFilter, setSelectedDealerFilter] = useState<string>('todas');

  // Catalog State
  const [selectedBrand, setSelectedBrand] = useState<BrandType>('Suzuki');
  const [freightMode, setFreightMode] = useState<'CIF' | 'FOB'>('CIF');
  const [catalogSearchQuery, setCatalogSearchQuery] = useState('');
  // Payment Condition & Campaign Selection per Model Card
  const [cardPaymentCondition, setCardPaymentCondition] = useState<Record<string, string>>({});
  const [cardUseReserveFund, setCardUseReserveFund] = useState<Record<string, boolean>>({});
  const [cardActiveColorIndex, setCardActiveColorIndex] = useState<Record<string, number>>({});
  const [activeCostMemorial, setActiveCostMemorial] = useState<PurchaseModel | null>(null);
  const [orderObservations, setOrderObservations] = useState<string>('');

  // Automatic Freight Calculation
  const dealerState = activeProfile?.state || 'SP';
  const autoFreightUnit = calculateAutomaticFreight(dealerState);
  const autoOrigin = getAutomaticWarehouseOrigin(dealerState);

  // Reserve Fund Available Balance
  const reserveFundAvailableBalance = useMemo(() => {
    const cred = INITIAL_RESERVE_FUND_TRANSACTIONS.filter(t => t.type === 'credito' && t.financialApproved).reduce((s, t) => s + t.amount, 0);
    const deb = INITIAL_RESERVE_FUND_TRANSACTIONS.filter(t => t.type === 'debito' && t.financialApproved).reduce((s, t) => s + t.amount, 0);
    return cred - deb;
  }, []);
  const [selectedSpecModal, setSelectedSpecModal] = useState<PurchaseModel | null>(null);
  const [modelToEditModal, setModelToEditModal] = useState<PurchaseModel | null>(null);
  const [isModelFormOpen, setIsModelFormOpen] = useState(false);

  // Viewing Order Details Modal (Dealership View)
  const [viewingDealerOrder, setViewingDealerOrder] = useState<FactoryOrder | null>(null);
  const [dealerOrdersFilter, setDealerOrdersFilter] = useState<'todos' | 'analise' | 'aprovados' | 'integrados'>('todos');
  const [dealerOrdersSearch, setDealerOrdersSearch] = useState('');

  // Order Confirmation & Resumo Modal (Concessionária)
  const [isOrderConfirmationModalOpen, setIsOrderConfirmationModalOpen] = useState(false);

  // Repactuation Modal (Concessionária Aceite / Rejeição)
  const [repactuationOrder, setRepactuationOrder] = useState<FactoryOrder | null>(null);

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
    { id: 'Haojue', name: 'Haojue Motos' },
    { id: 'Zontes', name: 'Zontes Motos' },
    { id: 'Hisun', name: 'Hisun (ATVs)' },
    { id: 'Kymco', name: 'Kymco Scooters' }
  ];

  const filteredCatalogModels = visiblePurchaseModels.filter(m => m.brand === selectedBrand);

  const searchedCatalogModels = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];

    return filteredCatalogModels.filter(m => {
      // Display ONLY models that have at least one active, valid & authorized payment condition in line
      if (!isMontadora) {
        const hasValidPaymentCondition = activePaymentConditions.some(p => {
          const isBrandMatch = p.brand === m.brand;
          const isModelMatch = !p.modelCode || p.modelCode === m.modelName || m.modelName.includes(p.modelCode);
          const isActive = p.active !== false && p.inLine;
          const isValidDate = (!p.startDate || p.startDate <= today) && (!p.endDate || today <= p.endDate);
          const authIds = activeProfile?.authorizedPaymentConditionIds;
          const isAuthorized = authIds === undefined ? true : authIds.includes(p.id);
          return isBrandMatch && isModelMatch && isActive && isValidDate && isAuthorized;
        });
        if (!hasValidPaymentCondition) return false;
      }

      if (!catalogSearchQuery.trim()) return true;
      const q = catalogSearchQuery.toLowerCase();
      return (
        m.modelName.toLowerCase().includes(q) ||
        m.category.toLowerCase().includes(q) ||
        m.brand.toLowerCase().includes(q) ||
        m.variants.some(v => v.colorName.toLowerCase().includes(q))
      );
    });
  }, [filteredCatalogModels, catalogSearchQuery, isMontadora]);

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
      const selectedPayId = cardPaymentCondition[m.id] || activePaymentConditions[0]?.id;
      const selectedPayCond = activePaymentConditions.find(p => p.id === selectedPayId) || activePaymentConditions[0];
      const useReserve = cardUseReserveFund[m.id] || false;
      const discountPct = selectedPayCond ? selectedPayCond.discountPercentage : 0;
      const unitCostAfterDiscount = Math.round(m.factoryCost * (1 - discountPct / 100));

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
            unitFactoryCost: unitCostAfterDiscount,
            unitMSRP: m.ppsMSRP,
            totalItemCost: unitCostAfterDiscount * v.quantity,
            paymentConditionId: selectedPayCond?.id,
            paymentConditionName: selectedPayCond?.paymentMethodName || 'À Vista',
            freightMode: freightMode,
            freightCost: freightMode === 'CIF' ? autoFreightUnit : 0,
            usedReserveFund: useReserve,
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
  }, [purchaseModels, cardPaymentCondition, activePaymentConditions, cardUseReserveFund, freightMode, autoFreightUnit]);

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
    const expandedItems: FactoryOrderItem[] = [];
    order.items.forEach(item => {
      if (item.brand !== 'Haojue' && item.quantity > 1) {
        for (let i = 0; i < item.quantity; i++) {
          expandedItems.push({
            ...item,
            id: `${item.id}-${i + 1}`,
            quantity: 1,
            totalItemCost: item.unitFactoryCost,
            childOrderNumber: item.childOrderNumber ? `${item.childOrderNumber.slice(0, Math.max(0, item.childOrderNumber.length - 2))}${String(expandedItems.length + 1).padStart(2, '0')}` : undefined
          });
        }
      } else {
        expandedItems.push(item);
      }
    });

    setManagedOrder({
      ...order,
      items: expandedItems
    });
    setTemporaryItems(JSON.parse(JSON.stringify(expandedItems)));
  };

  // Color change handler inside manage modal
  const handleChangeItemColor = (itemIndex: number, newColorName: string, newColorHex: string) => {
    if (!managedOrder) return;
    const item = temporaryItems[itemIndex];
    const updatedItems = [...temporaryItems];
    updatedItems[itemIndex] = {
      ...item,
      originalColorName: item.originalColorName || item.colorName,
      originalQuantity: item.originalQuantity || item.quantity,
      originalPaymentConditionName: item.originalPaymentConditionName || item.paymentConditionName,
      colorName: newColorName,
      colorHex: newColorHex,
      modifiedByMontadora: true,
      itemApprovalStatus: 'alterado_montadora',
      dealerAcceptanceStatus: 'pendente_aceite'
    };
    setTemporaryItems(updatedItems);
  };

  // Quantity change handler inside manage modal
  const handleChangeItemQuantity = (itemIndex: number, delta: number) => {
    if (!managedOrder) return;
    const item = temporaryItems[itemIndex];
    const updatedItems = [...temporaryItems];
    const newQty = Math.max(1, item.quantity + delta);
    updatedItems[itemIndex] = {
      ...item,
      originalQuantity: item.originalQuantity || item.quantity,
      originalColorName: item.originalColorName || item.colorName,
      originalPaymentConditionName: item.originalPaymentConditionName || item.paymentConditionName,
      quantity: newQty,
      totalItemCost: newQty * item.unitFactoryCost,
      modifiedByMontadora: true,
      itemApprovalStatus: 'alterado_montadora',
      dealerAcceptanceStatus: 'pendente_aceite'
    };
    setTemporaryItems(updatedItems);
  };

  // Payment condition change handler inside manage modal
  const handleChangeItemPaymentCondition = (itemIndex: number, newPayId: string, newPayName: string) => {
    if (!managedOrder) return;
    const item = temporaryItems[itemIndex];
    const updatedItems = [...temporaryItems];
    updatedItems[itemIndex] = {
      ...item,
      originalPaymentConditionName: item.originalPaymentConditionName || item.paymentConditionName,
      originalQuantity: item.originalQuantity || item.quantity,
      originalColorName: item.originalColorName || item.colorName,
      paymentConditionId: newPayId,
      paymentConditionName: newPayName,
      modifiedByMontadora: true,
      itemApprovalStatus: 'alterado_montadora',
      dealerAcceptanceStatus: 'pendente_aceite'
    };
    setTemporaryItems(updatedItems);
  };

  // Item Approval by Montadora
  const handleApproveSingleItem = (itemIndex: number) => {
    if (!managedOrder) return;
    const item = temporaryItems[itemIndex];
    const updatedItems = [...temporaryItems];
    updatedItems[itemIndex] = {
      ...item,
      itemApprovalStatus: 'aprovado_montadora'
    };
    setTemporaryItems(updatedItems);
    showToast(`Item ${item.modelName} aprovado pela Montadora.`);
  };

  const handleRejectSingleItem = (itemIndex: number) => {
    if (!managedOrder) return;
    const item = temporaryItems[itemIndex];
    const updatedItems = [...temporaryItems];
    updatedItems[itemIndex] = {
      ...item,
      itemApprovalStatus: 'rejeitado_rede'
    };
    setTemporaryItems(updatedItems);
    showToast(`Item ${item.modelName} rejeitado.`);
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
      childOrderNumber: `${managedOrder?.orderNumber?.replace('PED-', '') || '0000'}${String(temporaryItems.length + 1).padStart(2, '0')}`,
      itemApprovalStatus: 'pendente',
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
    const hasModifications = temporaryItems.some(i => i.modifiedByMontadora || i.dealerAcceptanceStatus === 'pendente_aceite');

    const updatedOrder: FactoryOrder = {
      ...managedOrder,
      items: temporaryItems,
      totalUnits: newTotalUnits,
      totalAmount: newTotalAmount,
      hasPendingDealerAcceptance: hasModifications,
      notes: hasModifications
        ? 'Ajuste de itens/condições realizado pela Montadora. Aguardando aceite da Concessionária.'
        : managedOrder.notes
    };

    setManagedOrder(updatedOrder);
    onUpdateFactoryOrder(updatedOrder);
    setEditItemsModalOpen(false);
    showToast(hasModifications ? 'Alterações salvas! Pedido enviado para aceite da Concessionária.' : 'Alterações dos itens salvas com sucesso!');
  };

  // Dealer Accept/Reject Handlers for Repactuation
  const handleDealerAcceptItem = (orderId: string, itemId: string) => {
    const targetOrder = factoryOrders.find(o => o.id === orderId);
    if (!targetOrder) return;

    const updatedItems = targetOrder.items.map(item => {
      if (item.id !== itemId) return item;
      return {
        ...item,
        dealerAcceptanceStatus: 'aprovado' as const,
        itemApprovalStatus: 'aprovado_rede' as const
      };
    });

    const stillPending = updatedItems.some(i => i.dealerAcceptanceStatus === 'pendente_aceite');

    const updatedOrder: FactoryOrder = {
      ...targetOrder,
      items: updatedItems,
      hasPendingDealerAcceptance: stillPending
    };

    onUpdateFactoryOrder(updatedOrder);
    if (repactuationOrder?.id === orderId) {
      setRepactuationOrder(updatedOrder);
    }
    showToast('Proposta da fábrica aceita pela concessionária!');
  };

  const handleDealerRejectItem = (orderId: string, itemId: string) => {
    const targetOrder = factoryOrders.find(o => o.id === orderId);
    if (!targetOrder) return;

    const updatedItems = targetOrder.items.map(item => {
      if (item.id !== itemId) return item;
      return {
        ...item,
        dealerAcceptanceStatus: 'rejeitado' as const,
        itemApprovalStatus: 'rejeitado_rede' as const
      };
    });

    const stillPending = updatedItems.some(i => i.dealerAcceptanceStatus === 'pendente_aceite');

    const updatedOrder: FactoryOrder = {
      ...targetOrder,
      items: updatedItems,
      hasPendingDealerAcceptance: stillPending
    };

    onUpdateFactoryOrder(updatedOrder);
    if (repactuationOrder?.id === orderId) {
      setRepactuationOrder(updatedOrder);
    }
    showToast('Item repactuado rejeitado pela concessionária.');
  };

  // Approval & Rejection Handlers
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

  const handleRejectCredit = () => {
    if (!managedOrder) return;
    const reason = prompt('Informe o motivo da rejeição do crédito financeiro:');
    if (!reason || !reason.trim()) return;

    const newLog = {
      id: `rej-${Date.now()}`,
      date: new Date().toLocaleString('pt-BR'),
      stage: 'Crédito' as const,
      author: 'Fabio Mesquita (Financeiro JTA)',
      reason: reason.trim()
    };

    const updatedLogs = [newLog, ...(managedOrder.rejectionLogs || [])];

    const updatedOrder: FactoryOrder = {
      ...managedOrder,
      creditApproved: false,
      creditNotes: `REPROVADO DE CRÉDITO: ${reason.trim()}`,
      status: 'credito_reprovado',
      overallApprovalStatus: 'rejeitado_credito',
      canDealerEdit: true,
      rejectionLogs: updatedLogs
    };

    setManagedOrder(updatedOrder);
    onUpdateFactoryOrder(updatedOrder);
    showToast(`Crédito reprovado para o pedido ${managedOrder.orderNumber}. O pedido ficou aberto na Concessionária para alteração.`);
  };

  const handleApproveItemLevel = (itemIdx: number, level: 'supervisor' | 'manager' | 'director') => {
    if (!managedOrder) return;
    const updatedItems = [...temporaryItems];
    const targetItem = updatedItems[itemIdx];
    if (!targetItem) return;

    if (level === 'supervisor') {
      targetItem.supervisorStatus = 'aprovado';
    } else if (level === 'manager') {
      targetItem.managerStatus = 'aprovado';
    } else if (level === 'director') {
      targetItem.directorStatus = 'aprovado';
      targetItem.approvedQuantity = targetItem.quantity;
      targetItem.itemApprovalStatus = 'aprovado_montadora';
    }

    setTemporaryItems(updatedItems);

    const allApproved = updatedItems.every(i => i.directorStatus === 'aprovado');
    const someApproved = updatedItems.some(i => i.directorStatus === 'aprovado');
    const overall: FactoryOrder['overallApprovalStatus'] = allApproved ? 'aprovado_total' : someApproved ? 'aprovado_parcial' : 'em_analise';

    const updatedOrder: FactoryOrder = {
      ...managedOrder,
      items: updatedItems,
      commercialApproved: allApproved || someApproved,
      overallApprovalStatus: overall
    };

    setManagedOrder(updatedOrder);
    onUpdateFactoryOrder(updatedOrder);
    showToast(`Item ${targetItem.modelName} (ERP #${targetItem.childOrderNumber}) aprovado na alçada ${level.toUpperCase()}!`);
  };

  const handleRejectItemLevel = (itemIdx: number, level: 'supervisor' | 'manager' | 'director') => {
    if (!managedOrder) return;
    const targetItem = temporaryItems[itemIdx];
    if (!targetItem) return;

    const levelName = level === 'supervisor' ? 'Supervisora' : level === 'manager' ? 'Gerente' : 'Diretoria';
    const reason = prompt(`Informe o motivo da rejeição do item (${targetItem.modelName}) na alçada ${levelName}:`);
    if (!reason || !reason.trim()) return;

    const newLog = {
      id: `rej-${Date.now()}`,
      date: new Date().toLocaleString('pt-BR'),
      stage: levelName as 'Supervisora' | 'Gerente' | 'Diretoria',
      author: `${levelName} Comercial J. Toledo`,
      reason: reason.trim()
    };

    const updatedItems = [...temporaryItems];
    const itemToUpdate = updatedItems[itemIdx];

    if (level === 'supervisor') {
      itemToUpdate.supervisorStatus = 'rejeitado';
      itemToUpdate.supervisorNote = reason.trim();
    } else if (level === 'manager') {
      itemToUpdate.managerStatus = 'rejeitado';
      itemToUpdate.managerNote = reason.trim();
    } else if (level === 'director') {
      itemToUpdate.directorStatus = 'rejeitado';
      itemToUpdate.directorNote = reason.trim();
    }

    itemToUpdate.rejectionReason = reason.trim();
    itemToUpdate.rejectionAuthor = levelName;
    itemToUpdate.itemApprovalStatus = 'rejeitado_rede';

    setTemporaryItems(updatedItems);

    const updatedLogs = [newLog, ...(managedOrder.rejectionLogs || [])];
    const canEdit = level !== 'director';

    const updatedOrder: FactoryOrder = {
      ...managedOrder,
      items: updatedItems,
      canDealerEdit: canEdit,
      overallApprovalStatus: level === 'director' ? 'rejeitado_diretoria' : 'rejeitado_comercial',
      rejectionLogs: updatedLogs
    };

    setManagedOrder(updatedOrder);
    onUpdateFactoryOrder(updatedOrder);
    showToast(`Item ${targetItem.modelName} rejeitado na alçada ${levelName}. Motivo registrado.`);
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
          <p className="text-[13px] text-neutral-500 dark:text-neutral-400">
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
                  : 'text-neutral-500 dark:text-neutral-400 hover:text-white'
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
                  : 'text-neutral-500 dark:text-neutral-400 hover:text-white'
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
                  : 'text-neutral-500 dark:text-neutral-400 hover:text-white'
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
            <div className="bg-white dark:bg-[#18181b] border border-neutral-200 dark:border-[#27272a] rounded-3xl p-4 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] uppercase font-bold text-neutral-500 dark:text-neutral-400">Total Pedidos Rede</span>
                <div className="p-1.5 bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-lg">
                  <FileSpreadsheet className="w-4 h-4" />
                </div>
              </div>
              <p className="text-[20px] font-bold text-neutral-900 dark:text-white font-tabular">{factoryOrders.length}</p>
              <p className="text-[10px] text-neutral-500 dark:text-neutral-400 mt-1 font-tabular">
                Volume: R$ {(statsTotalNetworkAmount / 1000).toLocaleString('pt-BR')}k
              </p>
            </div>

            {/* KPI 2: Aguardando Análise */}
            <div className="bg-white dark:bg-[#18181b] border border-neutral-200 dark:border-[#27272a] rounded-3xl p-4 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] uppercase font-bold text-amber-600 dark:text-amber-400">Aguardando Análise</span>
                <div className="p-1.5 bg-amber-500/10 text-amber-600 dark:text-amber-400 rounded-lg">
                  <Clock className="w-4 h-4" />
                </div>
              </div>
              <p className="text-[20px] font-bold text-amber-600 dark:text-amber-300 font-tabular">{statsPendingAnalysis}</p>
              <p className="text-[10px] text-neutral-500 dark:text-neutral-400 mt-1">Novos pedidos recebidos</p>
            </div>

            {/* KPI 3: Em Análise de Crédito */}
            <div className="bg-white dark:bg-[#18181b] border border-neutral-200 dark:border-[#27272a] rounded-3xl p-4 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] uppercase font-bold text-blue-600 dark:text-blue-400">Análise de Crédito</span>
                <div className="p-1.5 bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-lg">
                  <CreditCard className="w-4 h-4" />
                </div>
              </div>
              <p className="text-[20px] font-bold text-blue-600 dark:text-blue-300 font-tabular">{statsCreditReview}</p>
              <p className="text-[10px] text-neutral-500 dark:text-neutral-400 mt-1">J. Toledo Finance</p>
            </div>

            {/* KPI 4: Prontos para Protheus */}
            <div className="bg-white dark:bg-[#18181b] border border-neutral-200 dark:border-[#27272a] rounded-3xl p-4 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] uppercase font-bold text-purple-600 dark:text-purple-400">Prontos p/ Protheus</span>
                <div className="p-1.5 bg-purple-500/10 text-purple-600 dark:text-purple-400 rounded-lg">
                  <Database className="w-4 h-4" />
                </div>
              </div>
              <p className="text-[20px] font-bold text-purple-600 dark:text-purple-300 font-tabular">{statsReadyProtheus}</p>
              <p className="text-[10px] text-neutral-500 dark:text-neutral-400 mt-1">Aprovados Crédito + Comercial</p>
            </div>

            {/* KPI 5: Integrados no Protheus */}
            <div className="bg-white dark:bg-[#18181b] border border-neutral-200 dark:border-[#27272a] rounded-3xl p-4 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] uppercase font-bold text-emerald-600 dark:text-emerald-400">Integrados no ERP</span>
                <div className="p-1.5 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-lg">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
              </div>
              <p className="text-[20px] font-bold text-emerald-600 dark:text-emerald-400 font-tabular">{statsIntegratedProtheus}</p>
              <p className="text-[10px] text-neutral-500 dark:text-neutral-400 mt-1">Gerado SC5 Manaus</p>
            </div>
          </div>

          {/* Search, Filter Bar and Orders Table */}
          <div className="bg-white dark:bg-[#18181b] border border-neutral-200 dark:border-[#27272a] rounded-3xl p-5 md:p-6 shadow-md space-y-4">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-3 border-b border-neutral-200 dark:border-[#27272a]">
              <div>
                <h3 className="text-[16px] font-bold text-neutral-900 dark:text-white flex items-center gap-2">
                  <FileSpreadsheet className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  Lista Geral de Pedidos de Concessionárias ({filteredOrders.length})
                </h3>
                <p className="text-[11px] text-neutral-500 dark:text-neutral-400">
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
                    className="w-full bg-white dark:bg-neutral-900 text-[12px] text-neutral-900 dark:text-neutral-200 pl-8 pr-3 py-1.5 rounded-xl border border-neutral-300 dark:border-[#27272a] focus:outline-none focus:border-blue-500 placeholder:text-neutral-400 dark:placeholder:text-neutral-500"
                  />
                </div>

                {/* Status Filter */}
                <select
                  value={selectedStatusFilter}
                  onChange={(e) => setSelectedStatusFilter(e.target.value)}
                  className="bg-white dark:bg-neutral-900 text-[12px] text-neutral-900 dark:text-neutral-200 font-medium border border-neutral-300 dark:border-[#27272a] rounded-xl px-3 py-1.5 focus:outline-none focus:border-blue-500"
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
                  className="bg-white dark:bg-neutral-900 text-[12px] text-neutral-900 dark:text-neutral-200 font-medium border border-neutral-300 dark:border-[#27272a] rounded-xl px-3 py-1.5 focus:outline-none focus:border-blue-500"
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
                  <tr className="bg-neutral-100 dark:bg-neutral-900/80 border-b border-neutral-200 dark:border-[#27272a] text-[10px] font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
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
                <tbody className="divide-y divide-neutral-200 dark:divide-[#27272a] font-tabular">
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
                          className="hover:bg-neutral-50 dark:hover:bg-neutral-900/50 transition-colors group"
                        >
                          {/* Order Number & Date */}
                          <td className="py-3.5 px-4 font-medium">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-neutral-900 dark:text-white text-[13px]">{order.orderNumber}</span>
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
                              <span className="text-[9px] bg-neutral-800 text-neutral-700 dark:text-neutral-300 px-1 py-0.2 rounded font-bold">
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
                                  <span className="text-[10px] text-neutral-500 dark:text-neutral-400 truncate max-w-[90px]">{item.colorName}</span>
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
                                <span className="text-[9px] font-mono text-neutral-500 dark:text-neutral-400 mt-0.5 font-bold">
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
            <div className="bg-white dark:bg-[#18181b] border border-neutral-200 dark:border-[#27272a] rounded-3xl p-5 md:p-6 shadow-sm space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-neutral-200 dark:border-neutral-800/80 pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <Truck className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    <h3 className="text-base sm:text-lg font-bold text-neutral-900 dark:text-white">
                      Meus Pedidos de Fábrica ({filteredOrders.length})
                    </h3>
                  </div>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
                    Acompanhamento de aprovação de crédito, comercial e status ERP Manaus
                  </p>
                </div>

                {/* Filter tabs & Search */}
                <div className="flex flex-wrap items-center gap-2">
                  <div className="flex items-center bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-1 text-xs">
                    <button
                      onClick={() => setDealerOrdersFilter('todos')}
                      className={`px-3 py-1 rounded-lg font-bold transition-colors ${
                        dealerOrdersFilter === 'todos' ? 'bg-blue-600 text-white' : 'text-neutral-500 dark:text-neutral-400 hover:text-white'
                      }`}
                    >
                      Todos ({filteredOrders.length})
                    </button>
                    <button
                      onClick={() => setDealerOrdersFilter('analise')}
                      className={`px-3 py-1 rounded-lg font-bold transition-colors ${
                        dealerOrdersFilter === 'analise' ? 'bg-amber-600 text-white' : 'text-neutral-500 dark:text-neutral-400 hover:text-white'
                      }`}
                    >
                      Em Análise ({filteredOrders.filter(o => !o.creditApproved || !o.commercialApproved).length})
                    </button>
                    <button
                      onClick={() => setDealerOrdersFilter('aprovados')}
                      className={`px-3 py-1 rounded-lg font-bold transition-colors ${
                        dealerOrdersFilter === 'aprovados' ? 'bg-purple-600 text-white' : 'text-neutral-500 dark:text-neutral-400 hover:text-white'
                      }`}
                    >
                      Aprovados ({filteredOrders.filter(o => o.creditApproved && o.commercialApproved && !o.protheusIntegrated).length})
                    </button>
                    <button
                      onClick={() => setDealerOrdersFilter('integrados')}
                      className={`px-3 py-1 rounded-lg font-bold transition-colors ${
                        dealerOrdersFilter === 'integrados' ? 'bg-emerald-600 text-white' : 'text-neutral-500 dark:text-neutral-400 hover:text-white'
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
                    className="w-full bg-white dark:bg-neutral-900/90 border border-neutral-200 dark:border-neutral-800 rounded-xl px-4 py-2 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-blue-500"
                  />
                  {dealerOrdersSearch && (
                    <button
                      onClick={() => setDealerOrdersSearch('')}
                      className="absolute right-3 top-2.5 text-xs text-neutral-500 dark:text-neutral-400 hover:text-white"
                    >
                      ✕
                    </button>
                  )}
                </div>
              )}

              {filteredOrders.length === 0 ? (
                <div className="text-center py-6 bg-white dark:bg-neutral-900/40 rounded-2xl border border-dashed border-neutral-200 dark:border-neutral-800">
                  <Truck className="w-8 h-8 text-neutral-600 mx-auto mb-2" />
                  <p className="text-xs text-neutral-500 dark:text-neutral-400 font-bold">
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
                      className="p-4 bg-white dark:bg-neutral-900/80 hover:bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 hover:border-blue-500/50 rounded-2xl flex flex-col justify-between gap-3 cursor-pointer transition-all duration-200 group shadow-sm hover:shadow-md"
                    >
                      {ord.hasPendingDealerAcceptance && (
                        <div className="p-2.5 bg-amber-950/80 border border-amber-500/50 rounded-xl flex items-center justify-between gap-3 text-xs">
                          <div className="flex items-center gap-2">
                            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                            <span className="text-amber-200 font-bold">A Montadora propôs alterações em itens deste pedido. Clique para analisar a repactuação.</span>
                          </div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setRepactuationOrder(ord);
                            }}
                            className="px-3 py-1 bg-amber-500 hover:bg-amber-400 text-black font-bold rounded-lg text-[11px] shrink-0"
                          >
                            Analisar Alterações
                          </button>
                        </div>
                      )}

                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="space-y-2 flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="font-mono font-bold text-white text-sm group-hover:text-blue-400 transition-colors">
                              {ord.orderNumber}
                            </span>
                          <span className="text-[11px] text-neutral-500 dark:text-neutral-400 font-mono flex items-center gap-1">
                            <Clock className="w-3 h-3 text-neutral-500" />
                            {ord.createdAt}
                          </span>
                          <span className="text-[10px] bg-neutral-800 text-neutral-700 dark:text-neutral-300 px-2 py-0.5 rounded font-bold border border-neutral-700">
                            {ord.freightMode === 'CIF' ? 'Frete CIF (Incluso)' : 'Frete FOB'}
                          </span>
                          <span className="text-[10px] bg-neutral-800 text-neutral-700 dark:text-neutral-300 px-2 py-0.5 rounded font-bold border border-neutral-700">
                            {ord.paymentMethod}
                          </span>
                        </div>

                        {/* Items list with color indicators */}
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 text-xs text-neutral-700 dark:text-neutral-300">
                          {ord.items.map((item, iIdx) => (
                            <div key={item.id || iIdx} className="flex items-center gap-1.5 bg-neutral-50 dark:bg-neutral-950/60 px-2.5 py-1 rounded-lg border border-neutral-200 dark:border-neutral-800">
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
                      <div className="flex flex-wrap sm:flex-nowrap items-center justify-between sm:justify-end gap-3 text-xs shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-neutral-200 dark:border-neutral-800">
                        <div className="text-left sm:text-right font-tabular">
                          <span className="text-white font-black text-sm block">
                            R$ {ord.totalAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          </span>
                          <span className="text-[11px] text-neutral-500 dark:text-neutral-400">
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
                  </div>
                ))}
                </div>
              )}
            </div>
          )}

          {/* Freight Mode Selector & Credit Limits */}
          {!isMontadora && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white dark:bg-[#18181b] rounded-3xl p-5 md:p-6 border border-neutral-200 dark:border-[#27272a] shadow-md flex flex-col justify-between">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-neutral-500 dark:text-neutral-400 text-[10px] font-bold uppercase tracking-widest block mb-1">
                      Limite Homologado de Crédito
                    </span>
                    <p className="text-[24px] font-bold text-neutral-900 dark:text-[#fafafa] font-tabular">
                      R$ {creditLimitTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                  <div className="p-2 bg-blue-50 dark:bg-neutral-800 rounded-xl text-blue-600 dark:text-[#3b82f6] border border-blue-200 dark:border-[#27272a]">
                    <Building2 className="w-5 h-5" />
                  </div>
                </div>
                <p className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-2">Concessionária: {activeProfile?.name}</p>
              </div>

              <div className="bg-white dark:bg-[#18181b] rounded-3xl p-5 md:p-6 border border-neutral-200 dark:border-[#27272a] shadow-md flex flex-col justify-between">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-neutral-500 dark:text-neutral-400 text-[10px] font-bold uppercase tracking-widest block mb-1">
                      Crédito Disponível Líquido
                    </span>
                    <p className={`text-[24px] font-bold font-tabular ${
                      simulatedCreditRemaining >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
                    }`}>
                      R$ {simulatedCreditRemaining.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                  <div className="p-2 bg-emerald-50 dark:bg-neutral-800 rounded-xl text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-[#27272a]">
                    <CreditCard className="w-5 h-5" />
                  </div>
                </div>
                <div className="w-full bg-neutral-100 dark:bg-neutral-800 h-1.5 rounded-full overflow-hidden mt-3">
                  <div 
                    style={{ width: `${Math.min(100, ((creditLimitTotal - simulatedCreditRemaining) / creditLimitTotal) * 100)}%` }} 
                    className="bg-blue-600 dark:bg-[#3b82f6] h-full transition-all duration-500 rounded-full"
                  />
                </div>
              </div>

              <div className="bg-white dark:bg-[#18181b] rounded-3xl p-5 md:p-6 border border-neutral-200 dark:border-[#27272a] shadow-md flex flex-col justify-between">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-neutral-500 dark:text-neutral-400 text-[10px] font-bold uppercase tracking-widest block mb-1">
                      Total do Pedido Atual
                    </span>
                    <p className="text-[24px] font-bold text-blue-600 dark:text-[#60a5fa] font-tabular">
                      R$ {totalOrderAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                  <div className="p-2 bg-blue-50 dark:bg-neutral-800 rounded-xl text-blue-600 dark:text-[#60a5fa] border border-blue-200 dark:border-[#27272a]">
                    <ShoppingCart className="w-5 h-5" />
                  </div>
                </div>
                <div className="flex items-center justify-between text-[11px] text-neutral-500 dark:text-neutral-400 mt-2 font-tabular">
                  <span>{totalOrderUnits} unidades selecionadas</span>
                  <span className="text-neutral-500 dark:text-neutral-400">Condição: 30/60/90</span>
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
                        : 'text-neutral-500 dark:text-neutral-400 hover:text-white hover:bg-neutral-800'
                    }`}
                  >
                    <span className={`w-2 h-2 rounded-full ${
                      b.id === 'Suzuki' ? 'bg-red-500' :
                      b.id === 'Haojue' ? 'bg-sky-400' :
                      b.id === 'Zontes' ? 'bg-amber-400' :
                      b.id === 'Hisun' ? 'bg-emerald-500' : 'bg-purple-400'
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
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-neutral-700 dark:text-neutral-300"
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
                        : 'text-neutral-500 dark:text-neutral-400 hover:text-white'
                    }`}
                  >
                    Frete CIF
                  </button>
                  <button 
                    onClick={() => setFreightMode('FOB')}
                    className={`px-3 py-1 rounded-lg transition-all ${
                      freightMode === 'FOB' 
                        ? 'bg-[#3b82f6] text-white shadow-sm' 
                        : 'text-neutral-500 dark:text-neutral-400 hover:text-white'
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
            <div className="flex items-center justify-between text-xs text-neutral-500 dark:text-neutral-400 font-medium">
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
                  <div className="relative aspect-[16/10] bg-neutral-50 dark:bg-neutral-950/90 border-b border-neutral-200 dark:border-neutral-800/80 overflow-hidden flex items-center justify-center">
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
                        <span className="text-[10px] bg-black/70 backdrop-blur-sm text-neutral-700 dark:text-neutral-300 px-2 py-0.5 rounded-md font-mono border border-neutral-700">
                          {model.yearModel}
                        </span>
                      )}
                    </div>

                    {/* Active Color Preview Badge */}
                    <div className="absolute bottom-3 left-3 bg-white dark:bg-neutral-900/90 backdrop-blur-md px-2.5 py-1 rounded-xl border border-neutral-700/80 flex items-center gap-2 shadow-lg">
                      <span 
                        className="w-3 h-3 rounded-full border border-white/30"
                        style={{ backgroundColor: activeVariant?.colorHex || '#3b82f6' }}
                      />
                      <span className="text-[11px] font-bold text-white max-w-[130px] truncate">
                        {activeVariant?.colorName}
                      </span>
                      {activeVariant?.colorCode && (
                        <span className="text-[9px] text-neutral-500 dark:text-neutral-400 font-mono">
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
                      <span className="text-[10px] uppercase font-bold text-neutral-500 dark:text-neutral-400 tracking-wider block">
                        {model.category}
                      </span>
                      <div className="flex items-center justify-between gap-2">
                        <h3 className="text-[18px] font-black text-[#fafafa] tracking-tight">
                          {model.modelName}
                        </h3>
                      </div>
                    </div>



                    {/* Historical Indicators Block (Requirement 8) */}
                    <div className="grid grid-cols-4 gap-1 text-center bg-white dark:bg-neutral-900/90 p-2 rounded-2xl border border-neutral-200 dark:border-neutral-800 text-[10px]">
                      <div>
                        <span className="text-neutral-500 block font-semibold text-[9px]">Estoque Loja</span>
                        <strong className="text-blue-400 font-bold">{model.storeStock} un</strong>
                      </div>
                      <div>
                        <span className="text-neutral-500 block font-semibold text-[9px]">Média 3M</span>
                        <strong className="text-emerald-400 font-bold">{model.avgRegistration}</strong>
                      </div>
                      <div>
                        <span className="text-neutral-500 block font-semibold text-[9px]">Compras Mês</span>
                        <strong className="text-purple-400 font-bold">{model.monthlyPurchase} un</strong>
                      </div>
                      <div>
                        <span className="text-neutral-500 block font-semibold text-[9px]">Compromisso</span>
                        <strong className="text-amber-400 font-bold">{model.commitmentMonth3} un</strong>
                      </div>
                    </div>

                    {/* Pricing with Memorial de Cálculo ? (Requirement 2 & 3) */}
                    {(() => {
                      const selectedPayId = cardPaymentCondition[model.id] || activePaymentConditions[0]?.id;
                      const selectedPayCond = activePaymentConditions.find(p => p.id === selectedPayId) || activePaymentConditions[0];
                      const discountPct = selectedPayCond ? selectedPayCond.discountPercentage : 0;
                      const finalUnitCost = Math.round(model.factoryCost * (1 - discountPct / 100));

                      return (
                        <div className="p-3 bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 font-tabular space-y-2">
                          <div className="flex items-center justify-between text-[11px]">
                            <div className="flex items-center gap-1">
                              <span className="text-neutral-500 dark:text-neutral-400">Custo Fábrica:</span>
                              <button
                                type="button"
                                onClick={() => setActiveCostMemorial(model)}
                                className="w-4 h-4 rounded-full bg-blue-500/20 text-blue-400 hover:bg-blue-500 hover:text-white flex items-center justify-center font-bold text-[10px] transition-colors"
                                title="Clique para ver o Memorial de Cálculo de Custo"
                              >
                                ?
                              </button>
                            </div>
                            <div className="text-right">
                              {discountPct > 0 ? (
                                <div>
                                  <span className="line-through text-neutral-500 text-[10px] mr-1.5">
                                    R$ {model.factoryCost.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                  </span>
                                  <strong className="text-emerald-400 font-bold">
                                    R$ {finalUnitCost.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                  </strong>
                                </div>
                              ) : (
                                <strong className="text-white font-bold">
                                  R$ {model.factoryCost.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                </strong>
                              )}
                            </div>
                          </div>

                          {/* Payment Condition Selector per Card (Requirement 3 & 3.1 & 5) */}
                          <div>
                            <label className="text-[9px] uppercase font-bold text-amber-400 block mb-1">Forma de Pagamento (Campanha)</label>
                            {(() => {
                              const availableConds = activePaymentConditions.filter(p => {
                                if (!p.inLine) return false;
                                if (!isMontadora) {
                                  const authIds = activeProfile?.authorizedPaymentConditionIds;
                                  if (authIds !== undefined) {
                                    return authIds.includes(p.id);
                                  }
                                }
                                return true;
                              });

                              if (availableConds.length === 0) {
                                return (
                                  <div className="w-full bg-rose-950/80 border border-rose-800 rounded-xl px-2.5 py-1.5 text-[11px] text-rose-300 font-bold text-center">
                                    Nenhuma Condição Autorizada
                                  </div>
                                );
                              }

                              return (
                                <select
                                  value={selectedPayId}
                                  onChange={(e) => setCardPaymentCondition(prev => ({ ...prev, [model.id]: e.target.value }))}
                                  className="w-full bg-neutral-50 dark:bg-neutral-950 border border-amber-500/40 rounded-xl px-2 py-1.5 text-xs text-white font-semibold focus:outline-none focus:border-amber-400"
                                >
                                  {availableConds.map(p => (
                                    <option key={p.id} value={p.id}>
                                      {p.paymentMethodName} {p.discountPercentage > 0 ? `(-${p.discountPercentage}%)` : ''}
                                    </option>
                                  ))}
                                </select>
                              );
                            })()}
                          </div>

                          {/* Reserve Fund Option Toggle (Requirement 7) */}
                          <div className="flex items-center justify-between pt-1 border-t border-neutral-200 dark:border-neutral-800 text-[10px]">
                            <span className="text-neutral-500 dark:text-neutral-400">Usar Fundo de Reserva?</span>
                            <label className="flex items-center gap-1.5 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={cardUseReserveFund[model.id] || false}
                                onChange={(e) => setCardUseReserveFund(prev => ({ ...prev, [model.id]: e.target.checked }))}
                                disabled={reserveFundAvailableBalance <= 0}
                                className="rounded border-neutral-700 text-amber-500 focus:ring-amber-500"
                              />
                              <span className={cardUseReserveFund[model.id] ? 'text-amber-400 font-bold' : 'text-neutral-500'}>
                                {cardUseReserveFund[model.id] ? 'Sim (Aplicar Abatimento)' : 'Não'}
                              </span>
                            </label>
                          </div>
                        </div>
                      );
                    })()}

                    {/* Interactive Color Swatches with Availability Badges (Requirement 4) */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-[10px] uppercase font-bold text-neutral-500 dark:text-neutral-400 tracking-wider">
                        <span>Cores & Quantidades por Lote</span>
                        <span className="text-neutral-500 normal-case">{model.variants.length} cores</span>
                      </div>

                      <div className="space-y-1.5">
                        {model.variants.map((v, vIdx) => {
                          const isVariantActive = activeVariantIdx === vIdx;
                          const isUnavailable = v.stockStatus === 'sem_estoque' || (v as any).stockStatus === 'indisponivel';

                          return (
                            <div 
                              key={v.id}
                              className={`flex items-center justify-between p-2 rounded-xl border transition-all ${
                                isVariantActive 
                                  ? 'bg-blue-600/10 border-blue-500/40 shadow-sm' 
                                  : 'bg-white dark:bg-neutral-900/60 border-neutral-200 dark:border-neutral-800/60 hover:border-neutral-700'
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
                                  <div className="flex items-center gap-1.5">
                                    <span className={`text-[11px] font-medium truncate max-w-[110px] ${
                                      isVariantActive ? 'text-blue-300 font-bold' : 'text-white'
                                    }`}>
                                      {v.colorName}
                                    </span>

                                    {/* Color Availability Badge (Requirement 4) */}
                                    {isUnavailable ? (
                                      <span className="text-[9px] bg-red-950 text-red-400 px-1.5 py-0.2 rounded font-bold border border-red-800">
                                        Indisponível
                                      </span>
                                    ) : v.stockStatus === 'poucas' ? (
                                      <span className="text-[9px] bg-amber-950 text-amber-400 px-1.5 py-0.2 rounded font-bold border border-amber-800">
                                        Poucas un.
                                      </span>
                                    ) : (
                                      <span className="text-[9px] bg-emerald-950 text-emerald-400 px-1.5 py-0.2 rounded font-bold border border-emerald-800">
                                        Disponível
                                      </span>
                                    )}
                                  </div>
                                  {v.colorCode && (
                                    <span className="text-[9px] text-neutral-500 font-mono">
                                      Cód. {v.colorCode}
                                    </span>
                                  )}
                                </div>
                              </button>

                              {/* Quantity Controls (Lock + if indisponivel - Requirement 4) */}
                              <div className="flex items-center gap-1.5 shrink-0 ml-2">
                                  <button
                                    onClick={() => onUpdateVariantQuantity(model.id, v.id, -1)}
                                    disabled={v.quantity === 0}
                                    className="w-6 h-6 rounded-lg bg-neutral-800 hover:bg-neutral-700 disabled:opacity-30 disabled:hover:bg-neutral-800 text-white flex items-center justify-center font-bold text-xs transition-colors"
                                  >
                                    <Minus className="w-3 h-3" />
                                  </button>
                                  <span className="w-5 text-center font-mono font-bold text-xs text-white">
                                    {v.quantity}
                                  </span>
                                  <button
                                    onClick={() => onUpdateVariantQuantity(model.id, v.id, 1)}
                                    disabled={isUnavailable}
                                    title={isUnavailable ? 'Cor indisponível no estoque da fábrica' : 'Adicionar unidade ao pedido'}
                                    className="w-6 h-6 rounded-lg bg-blue-600 hover:bg-blue-500 disabled:opacity-30 disabled:hover:bg-blue-600 text-white flex items-center justify-center font-bold text-xs transition-colors"
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
                    <div className={`grid gap-2 pt-1 ${isMontadora ? 'grid-cols-2' : 'grid-cols-1'}`}>
                      <button
                        type="button"
                        onClick={() => setSelectedSpecModal(model)}
                        className="p-2 bg-blue-600/15 hover:bg-blue-600/25 text-blue-400 hover:text-blue-300 border border-blue-500/30 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors shadow-sm"
                        title="Ver Ficha Técnica e Desempenho Completo"
                      >
                        <Gauge className="w-3.5 h-3.5" />
                        <span>Ficha Técnica Completa</span>
                      </button>

                      {isMontadora && (
                        <button
                          type="button"
                          onClick={() => {
                            setModelToEditModal(model);
                            setIsModelFormOpen(true);
                          }}
                          className="p-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-700 dark:text-neutral-300 hover:text-white border border-neutral-700 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
                          title="Editar cadastro técnico e fotos"
                        >
                          <Settings2 className="w-3.5 h-3.5" />
                          <span>Editar Moto</span>
                        </button>
                      )}
                    </div>

                  </div>

                  {/* Card Footer */}
                  <div className="p-4 bg-white dark:bg-neutral-900/40 border-t border-neutral-200 dark:border-neutral-800 flex items-center justify-between text-[11px]">
                    <span className="text-neutral-500 dark:text-neutral-400">
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
                    <p className="text-[11px] text-neutral-500 dark:text-neutral-400 font-tabular">
                      {totalOrderUnits} motocicletas selecionadas para {activeProfile?.name}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => {
                    if (totalOrderUnits === 0) {
                      showToast('Selecione ao menos 1 motocicleta para transmitir o pedido.');
                      return;
                    }
                    setIsOrderConfirmationModalOpen(true);
                  }}
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
                    <span className="text-[9px] bg-neutral-800 text-neutral-700 dark:text-neutral-300 px-1.5 py-0.2 rounded font-bold">
                      {managedOrder.orderNumber}
                    </span>
                  </div>
                  <h3 className="text-[20px] font-bold text-white">
                    {managedOrder.dealershipName} ({managedOrder.dealershipState})
                  </h3>
                  <p className="text-[11px] text-neutral-500 dark:text-neutral-400">
                    CNPJ: {managedOrder.dealershipCnpj} • Criado em {managedOrder.createdAt} • Frete {managedOrder.freightMode}
                  </p>
                </div>
              </div>

              <button 
                onClick={() => setManagedOrder(null)}
                className="p-2 text-neutral-500 dark:text-neutral-400 hover:text-white hover:bg-neutral-800 rounded-xl"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* SEÇÃO 1: ITENS DO PEDIDO & ALTERAÇÃO DE CORES E MODELOS */}
            <div className="bg-white dark:bg-neutral-900/80 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-5 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Palette className="w-4 h-4 text-blue-400" />
                  <h4 className="text-[14px] font-bold text-white">
                    Itens do Pedido & Ajuste de Cores / Modelos
                  </h4>
                </div>
                <span className="text-[11px] text-neutral-500 dark:text-neutral-400">
                  A montadora pode alterar cores ou substituir modelos antes do faturamento.
                </span>
              </div>

              {/* Items Table inside Modal (Reorganizada Enxuta Sem Scroll Horizontal) */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-[12px] border-collapse font-tabular">
                  <thead>
                    <tr className="border-b border-neutral-200 dark:border-neutral-800 text-[10px] font-bold text-neutral-500 dark:text-neutral-400 uppercase">
                      <th className="py-2 px-2.5">Modelo & Pedido ERP Filho</th>
                      <th className="py-2 px-2.5">Cor & Forma de Pagamento</th>
                      <th className="py-2 px-2 text-center">Qtd</th>
                      <th className="py-2 px-2.5 text-right">Total Item</th>
                      <th className="py-2 px-3 text-center">Aprovações Sequenciais (Sup → Ger → Dir)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800/80">
                    {temporaryItems.map((item, idx) => (
                      <tr key={idx} className="hover:bg-neutral-800/40">
                        {/* Model & ERP Child Order Number */}
                        <td className="py-2.5 px-2.5">
                          <div className="flex items-center gap-1.5 mb-0.5">
                            <p className="font-bold text-white text-xs">{item.modelName}</p>
                            <span className="text-[9px] bg-purple-950 text-purple-300 border border-purple-800 px-1.5 py-0.2 rounded font-mono font-bold">
                              ERP #{item.childOrderNumber || `${managedOrder.orderNumber.replace('PED-', '')}${String(idx + 1).padStart(2, '0')}`}
                            </span>
                          </div>
                          <span className="text-[10px] text-neutral-500 dark:text-neutral-400">{item.brand} • {item.category}</span>
                        </td>

                        {/* Color Selector Dropdown + Payment Condition Dropdown Stacked Below */}
                        <td className="py-2.5 px-2.5 space-y-1.5">
                          {/* Color Dropdown */}
                          <div className="flex items-center gap-1.5">
                            <span 
                              className="w-3.5 h-3.5 rounded-full border border-neutral-700 shrink-0" 
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
                              className="bg-neutral-800 border border-neutral-700 text-white text-[10px] rounded-lg px-1.5 py-0.5 focus:outline-none focus:border-blue-500 font-medium max-w-[140px] truncate"
                            >
                              {item.availableColors && item.availableColors.length > 0 ? (
                                item.availableColors.map((col, cIdx) => (
                                  <option key={cIdx} value={col.colorName}>
                                    {col.colorName} {col.inStock ? '(Estoque)' : '(Demanda)'}
                                  </option>
                                ))
                              ) : (
                                <option value={item.colorName}>{item.colorName}</option>
                              )}
                            </select>
                          </div>

                          {/* Payment Condition Dropdown Below Color */}
                          <div className="flex items-center gap-1">
                            <select
                              value={item.paymentConditionId || activePaymentConditions[0]?.id}
                              onChange={(e) => {
                                const foundCond = activePaymentConditions.find(p => p.id === e.target.value);
                                if (foundCond) {
                                  handleChangeItemPaymentCondition(idx, foundCond.id, foundCond.paymentMethodName);
                                }
                              }}
                              className="bg-neutral-50 dark:bg-neutral-950 border border-neutral-700 text-amber-400 text-[10px] font-bold rounded-lg px-1.5 py-0.5 focus:outline-none focus:border-amber-500 max-w-[160px] truncate"
                            >
                              {activePaymentConditions.map(p => (
                                <option key={p.id} value={p.id}>{p.paymentMethodName}</option>
                              ))}
                            </select>
                          </div>
                        </td>

                        {/* Quantity Adjuster */}
                        <td className="py-2.5 px-2 text-center font-mono font-bold text-xs text-white">
                          {item.brand !== 'Haojue' ? (
                            <span className="px-2 py-0.5 bg-neutral-800 rounded border border-neutral-700 text-white">
                              1 un.
                            </span>
                          ) : (
                            <div className="flex items-center justify-center gap-1">
                              <button
                                onClick={() => handleChangeItemQuantity(idx, -1)}
                                className="w-4 h-4 rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-700 dark:text-neutral-300 flex items-center justify-center text-[10px]"
                              >
                                -
                              </button>
                              <span className="w-4 text-center font-bold text-white text-[11px]">{item.quantity}</span>
                              <button
                                onClick={() => handleChangeItemQuantity(idx, 1)}
                                className="w-4 h-4 rounded bg-blue-600 hover:bg-blue-500 text-white flex items-center justify-center text-[10px]"
                              >
                                +
                              </button>
                            </div>
                          )}
                        </td>

                        {/* Total Cost */}
                        <td className="py-2.5 px-2.5 text-right font-bold text-white font-tabular text-xs">
                          R$ {item.totalItemCost.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </td>

                        {/* Sequential 3-Level Approval Gate: Supervisora -> Gerente -> Diretor */}
                        <td className="py-2.5 px-3 text-center">
                          <div className="flex flex-col items-center justify-center gap-1 min-w-[200px]">
                            
                            {/* Level 1: Supervisora (Sempre liberado) */}
                            <div className="flex items-center justify-between gap-1 w-full bg-neutral-50 dark:bg-neutral-950 p-1 rounded-lg border border-neutral-200 dark:border-neutral-800 text-[10px]">
                              <span className="text-neutral-500 dark:text-neutral-400 font-bold">1. Supervisão:</span>
                              {item.supervisorStatus === 'aprovado' ? (
                                <span className="text-emerald-400 font-bold">✓ Aprovado</span>
                              ) : item.supervisorStatus === 'rejeitado' ? (
                                <span className="text-rose-400 font-bold" title={item.supervisorNote}>✕ Rejeitado</span>
                              ) : (
                                <div className="flex items-center gap-1">
                                  <button
                                    onClick={() => handleApproveItemLevel(idx, 'supervisor')}
                                    className="px-1.5 py-0.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded text-[9px]"
                                    title="Aprovar Supervisora"
                                  >
                                    Aprovar
                                  </button>
                                  <button
                                    onClick={() => handleRejectItemLevel(idx, 'supervisor')}
                                    className="px-1.5 py-0.5 bg-neutral-800 hover:bg-rose-900 text-rose-300 font-bold rounded text-[9px]"
                                    title="Rejeitar Supervisora"
                                  >
                                    Rejeitar
                                  </button>
                                </div>
                              )}
                            </div>

                            {/* Level 2: Gerente (Só libera se Supervisora Aprovou) */}
                            <div className="flex items-center justify-between gap-1 w-full bg-neutral-50 dark:bg-neutral-950 p-1 rounded-lg border border-neutral-200 dark:border-neutral-800 text-[10px]">
                              <span className="text-neutral-500 dark:text-neutral-400 font-bold">2. Gerência:</span>
                              {item.managerStatus === 'aprovado' ? (
                                <span className="text-emerald-400 font-bold">✓ Aprovado</span>
                              ) : item.managerStatus === 'rejeitado' ? (
                                <span className="text-rose-400 font-bold" title={item.managerNote}>✕ Rejeitado</span>
                              ) : item.supervisorStatus === 'aprovado' ? (
                                <div className="flex items-center gap-1">
                                  <button
                                    onClick={() => handleApproveItemLevel(idx, 'manager')}
                                    className="px-1.5 py-0.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded text-[9px]"
                                    title="Aprovar Gerente"
                                  >
                                    Aprovar
                                  </button>
                                  <button
                                    onClick={() => handleRejectItemLevel(idx, 'manager')}
                                    className="px-1.5 py-0.5 bg-neutral-800 hover:bg-rose-900 text-rose-300 font-bold rounded text-[9px]"
                                    title="Rejeitar Gerente"
                                  >
                                    Rejeitar
                                  </button>
                                </div>
                              ) : item.supervisorStatus === 'rejeitado' ? (
                                <span className="text-neutral-600 text-[9px]">Supervisão Rejeitou</span>
                              ) : (
                                <span className="text-neutral-500 italic text-[9px]">Aguardando Supervisão</span>
                              )}
                            </div>

                            {/* Level 3: Diretoria (Só libera se Gerente Aprovou) */}
                            <div className="flex items-center justify-between gap-1 w-full bg-neutral-50 dark:bg-neutral-950 p-1 rounded-lg border border-neutral-200 dark:border-neutral-800 text-[10px]">
                              <span className="text-neutral-500 dark:text-neutral-400 font-bold">3. Diretoria:</span>
                              {item.directorStatus === 'aprovado' ? (
                                <span className="text-emerald-400 font-bold">✓ Aprovado Final</span>
                              ) : item.directorStatus === 'rejeitado' ? (
                                <span className="text-rose-400 font-bold" title={item.directorNote}>✕ Rejeitado Final</span>
                              ) : item.managerStatus === 'aprovado' ? (
                                <div className="flex items-center gap-1">
                                  <button
                                    onClick={() => handleApproveItemLevel(idx, 'director')}
                                    className="px-1.5 py-0.5 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded text-[9px]"
                                    title="Aprovação Final Diretoria"
                                  >
                                    Aprovar
                                  </button>
                                  <button
                                    onClick={() => handleRejectItemLevel(idx, 'director')}
                                    className="px-1.5 py-0.5 bg-neutral-800 hover:bg-rose-900 text-rose-300 font-bold rounded text-[9px]"
                                    title="Rejeitar Diretoria"
                                  >
                                    Rejeitar
                                  </button>
                                </div>
                              ) : item.managerStatus === 'rejeitado' ? (
                                <span className="text-neutral-600 text-[9px]">Gerência Rejeitou</span>
                              ) : (
                                <span className="text-neutral-500 italic text-[9px]">Aguardando Gerência</span>
                              )}
                            </div>

                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Add Model Control & Recalculation Bar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-neutral-200 dark:border-neutral-800">
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
                        className="px-2 py-1.5 bg-neutral-800 text-neutral-500 dark:text-neutral-400 rounded-xl text-[11px]"
                      >
                        Cancelar
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setShowAddModelSelect(true)}
                      className="px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-700 dark:text-neutral-300 font-bold rounded-xl text-[11px] flex items-center gap-1.5"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Adicionar/Substituir Modelo</span>
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-4 text-[12px] font-tabular">
                  <span className="text-neutral-500 dark:text-neutral-400">
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

            {/* SEÇÃO 2: RÉGUA DINÂMICA DE FLUXO DE APROVAÇÃO WORKFLOW (Requisito d) */}
            {(() => {
              const orderUsesReserveFund = managedOrder.items.some(i => i.usedReserveFund);
              const activeWfType = orderUsesReserveFund ? 'fundo_reserva' : 'pedido';
              const activeWfSteps = workflowSteps
                .filter(s => (s.workflowType || 'pedido') === activeWfType && (!s.targetDealershipId || s.targetDealershipId === 'todos' || s.targetDealershipId === managedOrder.dealershipId))
                .sort((a, b) => a.stepOrder - b.stepOrder);
              
              const displaySteps = activeWfSteps.length > 0 ? activeWfSteps : workflowSteps.filter(s => (s.workflowType || 'pedido') === 'pedido');

              return (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
                      <Zap className="w-4 h-4 text-emerald-400" />
                      <span className="text-white">
                        {orderUsesReserveFund
                          ? `Workflow Específico: Fundo de Reserva (${displaySteps.length} Etapas)`
                          : `Workflow Padrão de Pedidos B2B (${displaySteps.length} Etapas)`}
                      </span>
                      {orderUsesReserveFund && (
                        <span className="text-[10px] bg-purple-950 text-purple-300 border border-purple-800 px-2 py-0.5 rounded-full font-bold ml-2">
                          Contempla Fundo de Reserva
                        </span>
                      )}
                    </h4>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Card 1: Análise de Crédito */}
                    <div className="bg-white dark:bg-neutral-900/80 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-5 space-y-3 flex flex-col justify-between">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="w-6 h-6 bg-blue-500/20 border border-blue-500/40 text-blue-300 rounded-full text-xs font-mono font-bold flex items-center justify-center">
                              1
                            </span>
                            <h4 className="text-sm font-bold text-white truncate">1. Avaliação de Crédito</h4>
                          </div>
                          {managedOrder.creditApproved ? (
                            <span className="text-[10px] bg-emerald-950 text-emerald-300 border border-emerald-800 px-2 py-0.5 rounded-full font-bold">
                              Crédito Aprovado
                            </span>
                          ) : managedOrder.status === 'credito_reprovado' ? (
                            <span className="text-[10px] bg-rose-950 text-rose-300 border border-rose-800 px-2 py-0.5 rounded-full font-bold">
                              Reprovado Crédito
                            </span>
                          ) : (
                            <span className="text-[10px] bg-amber-950 text-amber-300 border border-amber-800 px-2 py-0.5 rounded-full font-bold">
                              Pendente Crédito
                            </span>
                          )}
                        </div>

                        <div className="p-3 bg-neutral-50 dark:bg-neutral-950 rounded-xl border border-neutral-200 dark:border-neutral-800 text-[11px] space-y-1 text-neutral-700 dark:text-neutral-300 font-tabular">
                          <div className="flex justify-between text-neutral-500 dark:text-neutral-400">
                            <span>Departamento:</span>
                            <strong className="text-white">Crédito & Riscos JTA</strong>
                          </div>
                          <div className="flex justify-between text-neutral-500 dark:text-neutral-400">
                            <span>Responsável:</span>
                            <span className="text-blue-400 font-semibold">{managedOrder.creditAnalyst || 'Fabio Mesquita'}</span>
                          </div>
                        </div>
                      </div>

                      <div>
                        {managedOrder.creditApproved ? (
                          <div className="text-[11px] text-neutral-500 dark:text-neutral-400 space-y-0.5 pt-1">
                            <p className="text-emerald-400 font-bold">✓ Homologado por {managedOrder.creditAnalyst || 'Financeiro'}</p>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <button
                              onClick={handleApproveCredit}
                              className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2 rounded-xl text-xs flex items-center justify-center gap-1 transition-colors shadow-md"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>Aprovar Crédito</span>
                            </button>
                            <button
                              onClick={handleRejectCredit}
                              className="px-3 py-2 bg-neutral-800 hover:bg-rose-900 text-rose-300 font-bold rounded-xl text-xs transition-colors"
                              title="Rejeitar crédito e devolver para alteração da rede"
                            >
                              <X className="w-3.5 h-3.5" />
                              <span>Rejeitar</span>
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Card 2: Aprovação Comercial Regional (Status calculado) */}
                    <div className="bg-white dark:bg-neutral-900/80 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-5 space-y-3 flex flex-col justify-between">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="w-6 h-6 bg-purple-500/20 border border-purple-500/40 text-purple-300 rounded-full text-xs font-mono font-bold flex items-center justify-center">
                              2
                            </span>
                            <h4 className="text-sm font-bold text-white truncate">2. Aprovação Comercial Regional</h4>
                          </div>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            temporaryItems.some(i => i.supervisorStatus === 'aprovado' || i.managerStatus === 'aprovado')
                              ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                              : temporaryItems.some(i => i.supervisorStatus === 'rejeitado' || i.managerStatus === 'rejeitado')
                              ? 'bg-rose-950 text-rose-300 border border-rose-800'
                              : 'bg-amber-950 text-amber-300 border border-amber-800'
                          }`}>
                            {temporaryItems.every(i => i.supervisorStatus === 'aprovado' && i.managerStatus === 'aprovado') ? 'Aprovado Total' :
                             temporaryItems.some(i => i.supervisorStatus === 'aprovado' || i.managerStatus === 'aprovado') ? 'Aprovado Parcial' :
                             temporaryItems.some(i => i.supervisorStatus === 'rejeitado' || i.managerStatus === 'rejeitado') ? 'Rejeitado Comercial' : 'Em Validação'}
                          </span>
                        </div>

                        <div className="p-3 bg-neutral-50 dark:bg-neutral-950 rounded-xl border border-neutral-200 dark:border-neutral-800 text-[11px] space-y-1 text-neutral-700 dark:text-neutral-300 font-tabular">
                          <div className="flex justify-between text-neutral-500 dark:text-neutral-400">
                            <span>Alçadas:</span>
                            <strong className="text-white">Supervisão & Gerência</strong>
                          </div>
                          <div className="flex justify-between text-neutral-500 dark:text-neutral-400">
                            <span>Status Itens:</span>
                            <span className="text-purple-400 font-semibold">Avaliado Item a Item</span>
                          </div>
                        </div>
                      </div>

                      <div className="text-[11px] text-neutral-500 dark:text-neutral-400 pt-1">
                        <p className="text-neutral-500 dark:text-neutral-400 italic">
                          A aprovação comercial ocorre item a item na tabela acima nas alçadas de Supervisão e Gerência.
                        </p>
                      </div>
                    </div>

                    {/* Card 3: Aprovação Final Diretoria (Status calculado) */}
                    <div className="bg-white dark:bg-neutral-900/80 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-5 space-y-3 flex flex-col justify-between">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="w-6 h-6 bg-indigo-500/20 border border-indigo-500/40 text-indigo-300 rounded-full text-xs font-mono font-bold flex items-center justify-center">
                              3
                            </span>
                            <h4 className="text-sm font-bold text-white truncate">3. Aprovação Final Diretoria</h4>
                          </div>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            managedOrder.overallApprovalStatus === 'aprovado_total' ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' :
                            managedOrder.overallApprovalStatus === 'aprovado_parcial' ? 'bg-blue-950 text-blue-300 border border-blue-800' :
                            managedOrder.overallApprovalStatus === 'rejeitado_diretoria' ? 'bg-rose-950 text-rose-300 border border-rose-800' : 'bg-amber-950 text-amber-300 border border-amber-800'
                          }`}>
                            {managedOrder.overallApprovalStatus === 'aprovado_total' ? 'Aprovado Total' :
                             managedOrder.overallApprovalStatus === 'aprovado_parcial' ? 'Aprovado Parcial' :
                             managedOrder.overallApprovalStatus === 'rejeitado_diretoria' ? 'Rejeitado Diretoria' : 'Pendente Diretoria'}
                          </span>
                        </div>

                        <div className="p-3 bg-neutral-50 dark:bg-neutral-950 rounded-xl border border-neutral-200 dark:border-neutral-800 text-[11px] space-y-1 text-neutral-700 dark:text-neutral-300 font-tabular">
                          <div className="flex justify-between text-neutral-500 dark:text-neutral-400">
                            <span>Alçada:</span>
                            <strong className="text-white">Diretoria Comercial</strong>
                          </div>
                          <div className="flex justify-between text-neutral-500 dark:text-neutral-400">
                            <span>Liberação ERP:</span>
                            <span className="text-emerald-400 font-semibold">
                              {managedOrder.overallApprovalStatus?.startsWith('aprovado') ? 'Liberado para ERP' : 'Aguardando Aprovações'}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="text-[11px] text-neutral-500 dark:text-neutral-400 pt-1">
                        <p className="text-neutral-500 dark:text-neutral-400 italic">
                          A aprovação da Diretoria define a cota final liberada para integração no ERP Protheus.
                        </p>
                      </div>
                    </div>
                  </div>
              </div>
            );
          })()}

            {/* SEÇÃO 4: CONFIRMAÇÃO & INTEGRAÇÃO ERP TOTVS PROTHEUS */}
            <div className={`p-5 rounded-2xl border transition-all ${
              managedOrder.protheusIntegrated 
                ? 'bg-emerald-950/40 border-emerald-700/60' 
                : managedOrder.creditApproved && managedOrder.commercialApproved
                ? 'bg-purple-950/40 border-purple-600 ring-1 ring-purple-500'
                : 'bg-white dark:bg-neutral-900/40 border-neutral-200 dark:border-neutral-800 opacity-60'
            }`}>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Database className="w-5 h-5 text-purple-400" />
                    <h4 className="text-[16px] font-bold text-white">
                      3. Confirmação & Integração no ERP TOTVS Protheus
                    </h4>
                  </div>
                  <p className="text-[12px] text-neutral-700 dark:text-neutral-300">
                    {managedOrder.protheusIntegrated
                      ? `Pedido faturado e integrado com sucesso na tabela SC5 do ERP Protheus Manaus (${managedOrder.protheusOrderNumber}).`
                      : managedOrder.creditApproved && managedOrder.commercialApproved
                      ? 'Todas as aprovações concluídas. Clique abaixo para emitir o pedido de venda no Protheus e alocar os chassis na fábrica.'
                      : 'O pedido requer aprovação prévia de Crédito e Comercial para liberação de integração no ERP.'}
                  </p>

                  {managedOrder.protheusIntegrated && (
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mt-3 p-3 bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 text-[11px] font-mono">
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

      {/* =========================================================================
          MODAL DE CONFIRMAÇÃO & RESUMO DO PEDIDO DE FÁBRICA (REDE)
         ========================================================================= */}
      {isOrderConfirmationModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-[#18181b] border border-[#27272a] rounded-3xl max-w-4xl w-full p-6 md:p-8 shadow-2xl relative overflow-hidden max-h-[90vh] overflow-y-auto space-y-6">
            {/* Header */}
            <div className="flex items-start justify-between pb-4 border-b border-[#27272a]">
              <div className="flex items-center gap-3.5">
                <div className="p-3 bg-blue-600/20 text-blue-400 border border-blue-500/30 rounded-2xl">
                  <ShoppingCart className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white flex items-center gap-2">
                    <span>Confirmação & Resumo do Pedido de Fábrica</span>
                    <span className="text-xs font-mono bg-blue-500/20 text-blue-300 px-2 py-0.5 rounded-full border border-blue-500/30 font-bold">
                      Pedido Pai B2B
                    </span>
                  </h3>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
                    Concessionária: <strong className="text-white">{activeProfile?.name}</strong> ({activeProfile?.city}/{activeProfile?.state}) • CNPJ: {activeProfile?.cnpj}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsOrderConfirmationModalOpen(false)}
                className="p-2 text-neutral-500 dark:text-neutral-400 hover:text-white hover:bg-neutral-800 rounded-xl"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Items Summary Table */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider flex items-center gap-2">
                <Palette className="w-4 h-4 text-blue-400" />
                <span>Composição dos Itens do Lote ({activeSelectedOrderItems.reduce((acc, i) => acc + i.quantity, 0)} Unidades)</span>
              </h4>

              <div className="overflow-x-auto rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900/60">
                <table className="w-full text-left text-xs border-collapse font-tabular">
                  <thead>
                    <tr className="border-b border-neutral-200 dark:border-neutral-800 text-[10px] font-bold text-neutral-500 dark:text-neutral-400 uppercase bg-white dark:bg-neutral-900/90">
                      <th className="py-3 px-4">Modelo & Cor</th>
                      <th className="py-3 px-3 text-center">Quantidade</th>
                      <th className="py-3 px-4">Forma de Pagamento (Modelo)</th>
                      <th className="py-3 px-3 text-center">Fundo Reserva</th>
                      <th className="py-3 px-4 text-right">Custo Unitário</th>
                      <th className="py-3 px-4 text-right">Subtotal</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800/80">
                    {activeSelectedOrderItems.map((item, idx) => (
                      <tr key={idx} className="hover:bg-neutral-800/40">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <span className="w-3 h-3 rounded-full border border-neutral-700 shrink-0" style={{ backgroundColor: item.colorHex }} />
                            <div>
                              <strong className="text-white block font-bold">{item.modelName}</strong>
                              <span className="text-[10px] text-neutral-500 dark:text-neutral-400">{item.colorName}</span>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-3 text-center">
                          <span className="font-bold text-white bg-neutral-800 px-2 py-1 rounded-lg border border-neutral-700 font-mono">
                            {item.quantity} un.
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span className="text-amber-400 font-bold text-[11px]">
                            {item.paymentConditionName || 'À Vista'}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-center">
                          {item.usedReserveFund ? (
                            <span className="text-[10px] bg-purple-950 text-purple-300 border border-purple-800 px-2 py-0.5 rounded-full font-bold">
                              Sim
                            </span>
                          ) : (
                            <span className="text-[10px] text-neutral-500">Não</span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-right text-neutral-700 dark:text-neutral-300">
                          R$ {item.unitFactoryCost.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </td>
                        <td className="py-3 px-4 text-right font-bold text-white">
                          R$ {item.totalItemCost.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Logistics & Freight Rules */}
            <div className="bg-white dark:bg-neutral-900 p-4 rounded-2xl border border-neutral-200 dark:border-neutral-800 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <Truck className="w-4 h-4 text-blue-400" />
                  <span className="text-white font-bold">Regra Logística de Frete ({freightMode})</span>
                </div>
                <span className="text-neutral-500 dark:text-neutral-400">
                  Destino: <strong className="text-white">{activeProfile?.city} - {activeProfile?.state}</strong>
                </span>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-2 text-[11px]">
                <div className="bg-neutral-50 dark:bg-neutral-950 p-2.5 rounded-xl border border-neutral-200 dark:border-neutral-800">
                  <span className="text-neutral-500 block text-[9px]">Localidade</span>
                  <strong className="text-white font-bold">{activeProfile?.state === 'SP' || activeProfile?.state === 'RJ' ? 'Capital' : 'Interior'}</strong>
                </div>
                <div className="bg-neutral-50 dark:bg-neutral-950 p-2.5 rounded-xl border border-neutral-200 dark:border-neutral-800">
                  <span className="text-neutral-500 block text-[9px]">Modalidade</span>
                  <strong className="text-blue-400 font-bold">Frete {freightMode}</strong>
                </div>
                <div className="bg-neutral-50 dark:bg-neutral-950 p-2.5 rounded-xl border border-neutral-200 dark:border-neutral-800">
                  <span className="text-neutral-500 block text-[9px]">Frete por Moto</span>
                  <strong className="text-white font-bold">R$ {autoFreightUnit.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</strong>
                </div>
                <div className="bg-neutral-50 dark:bg-neutral-950 p-2.5 rounded-xl border border-neutral-200 dark:border-neutral-800">
                  <span className="text-neutral-500 block text-[9px]">Total Frete Lote</span>
                  <strong className="text-emerald-400 font-bold">
                    R$ {(autoFreightUnit * totalOrderUnits).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </strong>
                </div>
              </div>
            </div>

            {/* Financial Totals Display */}
            <div className="bg-neutral-50 dark:bg-neutral-950 p-5 rounded-2xl border border-neutral-200 dark:border-neutral-800 space-y-3 font-tabular">
              <div className="flex items-center justify-between text-xs">
                <span className="text-neutral-500 dark:text-neutral-400">Total de Motocicletas no Pedido Pai:</span>
                <strong className="text-white text-sm">{totalOrderUnits} unidades</strong>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-neutral-500 dark:text-neutral-400">Valor Total dos Produtos (Sem Incidência do Frete):</span>
                <strong className="text-white text-base">R$ {totalOrderAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</strong>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-neutral-500 dark:text-neutral-400">Incidência do Frete ({freightMode}):</span>
                <strong className="text-blue-400 text-sm">
                  {freightMode === 'CIF' ? 'Incluso na Operação (R$ 0,00)' : `+ R$ ${(autoFreightUnit * totalOrderUnits).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
                </strong>
              </div>
              <div className="pt-3 border-t border-neutral-200 dark:border-neutral-800 flex items-center justify-between">
                <div>
                  <span className="text-xs uppercase font-bold text-emerald-400 block tracking-wider">Valor Total do Pedido (Com Frete)</span>
                  <span className="text-[11px] text-neutral-500">Cada item gerará um pedido filho individual no ERP Protheus</span>
                </div>
                <strong className="text-2xl font-black text-emerald-400">
                  R$ {(totalOrderAmount + (freightMode === 'FOB' ? autoFreightUnit * totalOrderUnits : 0)).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </strong>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-between gap-4 pt-2">
              <button
                type="button"
                onClick={() => setIsOrderConfirmationModalOpen(false)}
                className="px-5 py-3 bg-neutral-800 hover:bg-neutral-700 text-neutral-700 dark:text-neutral-300 font-bold rounded-2xl text-xs transition-colors flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Voltar e Ajustar</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  onPlaceOrder(freightMode, totalOrderAmount, totalOrderUnits, activeSelectedOrderItems);
                  setIsOrderConfirmationModalOpen(false);
                }}
                className="px-6 py-3.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-2xl text-xs transition-all shadow-lg shadow-blue-500/30 flex items-center gap-2 active:scale-[0.98]"
              >
                <Send className="w-4 h-4" />
                <span>Confirmar e Transmitir Pedido à Montadora</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL DE REPACTUAÇÃO / ALTERAÇÕES PROPOSTAS PELA MONTADORA (REDE)
         ========================================================================= */}
      {repactuationOrder && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#18181b] border border-amber-500/40 rounded-3xl max-w-3xl w-full p-6 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between pb-3 border-b border-neutral-200 dark:border-neutral-800">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-amber-500/20 text-amber-400 rounded-xl border border-amber-500/30">
                  <AlertTriangle className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <span>Análise de Repactuação do Pedido {repactuationOrder.orderNumber}</span>
                  </h3>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400">
                    A Montadora J. Toledo propôs ajustes em um ou mais itens deste lote. Analise e aprove/rejeite cada item abaixo.
                  </p>
                </div>
              </div>
              <button onClick={() => setRepactuationOrder(null)} className="text-neutral-500 dark:text-neutral-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              {repactuationOrder.items.map((item, idx) => (
                <div key={item.id || idx} className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <strong className="text-white text-sm block font-bold">{item.modelName}</strong>
                      <span className="text-[10px] text-neutral-500 dark:text-neutral-400">Item ERP #{item.childOrderNumber || `${repactuationOrder.orderNumber.replace('PED-', '')}${String(idx + 1).padStart(2, '0')}`}</span>
                    </div>
                    {item.dealerAcceptanceStatus === 'aprovado' ? (
                      <span className="text-[10px] bg-emerald-950 text-emerald-300 border border-emerald-800 px-2.5 py-0.5 rounded-full font-bold flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" />
                        Aceito pela Concessionária
                      </span>
                    ) : item.dealerAcceptanceStatus === 'rejeitado' ? (
                      <span className="text-[10px] bg-rose-950 text-rose-300 border border-rose-800 px-2.5 py-0.5 rounded-full font-bold">
                        Item Rejeitado pela Concessionária
                      </span>
                    ) : (
                      <span className="text-[10px] bg-amber-950 text-amber-300 border border-amber-800 px-2 py-0.5 rounded-full font-bold">
                        Aguardando Seu Aceite
                      </span>
                    )}
                  </div>

                  {item.modifiedByMontadora && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs bg-neutral-50 dark:bg-neutral-950 p-3 rounded-xl border border-neutral-200 dark:border-neutral-800">
                      <div className="space-y-1">
                        <span className="text-[10px] uppercase font-bold text-neutral-500 block">Solicitado Originalmente pela Loja</span>
                        <p className="text-neutral-700 dark:text-neutral-300">
                          Cor: <strong className="text-white">{item.originalColorName || item.colorName}</strong>
                        </p>
                        <p className="text-neutral-700 dark:text-neutral-300">
                          Quantidade: <strong className="text-white">{item.originalQuantity || item.quantity} un.</strong>
                        </p>
                        <p className="text-neutral-700 dark:text-neutral-300">
                          Condição: <strong className="text-white">{item.originalPaymentConditionName || item.paymentConditionName || 'À Vista'}</strong>
                        </p>
                      </div>
                      <div className="space-y-1 bg-amber-500/10 p-2.5 rounded-lg border border-amber-500/20">
                        <span className="text-[10px] uppercase font-bold text-amber-400 block">Proposto pela Montadora Fábrica</span>
                        <p className="text-amber-200">
                          Cor: <strong className="text-white">{item.colorName}</strong>
                        </p>
                        <p className="text-amber-200">
                          Quantidade: <strong className="text-white">{item.quantity} un.</strong>
                        </p>
                        <p className="text-amber-200">
                          Condição: <strong className="text-white">{item.paymentConditionName || 'À Vista'}</strong>
                        </p>
                      </div>
                    </div>
                  )}

                  {item.dealerAcceptanceStatus === 'pendente_aceite' && (
                    <div className="flex items-center justify-end gap-2 pt-2 border-t border-neutral-200 dark:border-neutral-800">
                      <button
                        onClick={() => handleDealerRejectItem(repactuationOrder.id, item.id)}
                        className="px-3 py-1.5 bg-neutral-800 hover:bg-rose-950 text-neutral-700 dark:text-neutral-300 hover:text-rose-300 rounded-xl text-xs font-bold transition-colors"
                      >
                        Rejeitar Item Alterado
                      </button>
                      <button
                        onClick={() => handleDealerAcceptItem(repactuationOrder.id, item.id)}
                        className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow-md transition-all flex items-center gap-1.5"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Aceitar Proposta da Fábrica</span>
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="flex justify-end pt-2 border-t border-neutral-200 dark:border-neutral-800">
              <button
                onClick={() => setRepactuationOrder(null)}
                className="px-5 py-2 bg-neutral-800 text-neutral-700 dark:text-neutral-300 font-bold rounded-xl text-xs"
              >
                Concluir Análise
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

      {/* Memorial de Cálculo de Composição do Custo Modal (Requirement 4) */}
      {activeCostMemorial && (() => {
        const selectedPayId = cardPaymentCondition[activeCostMemorial.id] || activePaymentConditions[0]?.id;
        const selectedPayCond = activePaymentConditions.find(p => p.id === selectedPayId) || activePaymentConditions[0];
        const discountPct = selectedPayCond ? selectedPayCond.discountPercentage : 0;
        const discountAmount = Math.round(activeCostMemorial.factoryCost * (discountPct / 100));
        const useReserve = cardUseReserveFund[activeCostMemorial.id] || false;
        const reserveFundDeduction = useReserve ? Math.min(500, reserveFundAvailableBalance) : 0;
        const freightCost = freightMode === 'CIF' ? autoFreightUnit : 0;
        const finalCalculatedUnitCost = activeCostMemorial.factoryCost - discountAmount + freightCost - reserveFundDeduction;

        return (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-[#18181b] border border-neutral-700 rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-neutral-200 dark:border-neutral-800">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-blue-500/20 text-blue-400 font-bold flex items-center justify-center text-sm">
                    ?
                  </div>
                  <span>Memorial de Cálculo de Custo ({activeCostMemorial.modelName})</span>
                </h3>
                <button
                  onClick={() => setActiveCostMemorial(null)}
                  className="text-neutral-500 dark:text-neutral-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-3 text-xs">
                <p className="text-neutral-500 dark:text-neutral-400">
                  Composição detalhada do custo faturado pela montadora para a concessionária <strong className="text-white">{activeProfile?.name || 'Autorizada'}</strong>:
                </p>

                <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-4 space-y-2 font-mono">
                  <div className="flex justify-between text-neutral-700 dark:text-neutral-300">
                    <span>Valor Base da Moto (Fábrica):</span>
                    <span className="font-bold text-white">R$ {activeCostMemorial.factoryCost.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                  </div>

                  {discountPct > 0 && (
                    <div className="flex justify-between text-emerald-400">
                      <span>(-) Desconto {selectedPayCond.paymentMethodName}:</span>
                      <span className="font-bold">- R$ {discountAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                    </div>
                  )}

                  <div className="flex justify-between text-amber-400 border-t border-neutral-200 dark:border-neutral-800 pt-2 font-bold">
                    <span>(+) Frete ({freightMode} - {autoOrigin.label}):</span>
                    <span>R$ {freightCost.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                  </div>

                  {useReserve && (
                    <div className="flex justify-between text-amber-300 border-t border-neutral-200 dark:border-neutral-800 pt-1">
                      <span>(-) Abatimento Fundo de Reserva:</span>
                      <span className="font-bold">- R$ {reserveFundDeduction.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                    </div>
                  )}

                  <div className="flex justify-between text-emerald-400 border-t border-neutral-700 pt-2 text-sm font-black">
                    <span>(=) CUSTO UNITÁRIO FINAL:</span>
                    <span>R$ {finalCalculatedUnitCost.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                  </div>
                </div>

                <div className="bg-blue-950/40 border border-blue-800/50 rounded-xl p-3 text-[11px] text-blue-300">
                  💡 <strong>Parâmetro Oficial:</strong> Os valores de frete e bônus aplicados dependem da vigência ativa da tabela de pagamentos e região de entrega da loja.
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  onClick={() => setActiveCostMemorial(null)}
                  className="bg-blue-600 hover:bg-blue-500 text-white px-5 py-2 rounded-xl text-xs font-bold shadow-md"
                >
                  Entendido
                </button>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
};
