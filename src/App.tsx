import React, { useState } from 'react';
import { 
  NavTab, 
  PurchaseModel, 
  InventoryItem, 
  PipelineCard, 
  ServiceOrder, 
  InteractionLog, 
  TransitOrder, 
  RecentSale, 
  DealershipScope,
  DealershipFullProfile,
  FactoryOrder,
  FactoryOrderItem,
  OrderApprovalDocument,
  MonthlyCommitmentPlan,
  StockScheduleItem,
  ProposalPricingItem,
  PartsOrder,
  ReserveFundTransaction,
  ApprovalWorkflowStep,
  PaymentConditionCampaign
} from './types';
import { 
  INITIAL_PURCHASE_MODELS, 
  INITIAL_INVENTORY, 
  INITIAL_PIPELINE, 
  INITIAL_SERVICE_ORDERS, 
  INITIAL_INTERACTIONS, 
  INITIAL_TRANSIT_ORDERS, 
  INITIAL_SALES,
  INITIAL_FACTORY_ORDERS,
  INITIAL_DEALERSHIPS_LIST,
  DEALERSHIP_PROFILES 
} from './data/mockData';
import { INITIAL_ORDER_APPROVAL_PROPOSALS } from './data/orderApprovalData';
import { INITIAL_MONTHLY_COMMITMENTS } from './data/monthlyCommitmentsData';
import { INITIAL_MOCK_PARTS_ORDERS } from './data/mockPartsData';
import { INITIAL_RESERVE_FUND_TRANSACTIONS } from './data/mockReserveFundData';
import { INITIAL_PAYMENT_CONDITIONS } from './data/mockPaymentConditions';
import { INITIAL_WORKFLOW_STEPS } from './data/workflowStepsData';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { OrderConfirmationModal } from './components/OrderConfirmationModal';
import { ViewSkeleton } from './components/ViewSkeleton';
import { LoginModal } from './components/LoginModal';
import api from './services/api';

const DashboardView = React.lazy(() => import('./components/DashboardView').then(m => ({ default: m.DashboardView })));
const MontadoraDashboardView = React.lazy(() => import('./components/MontadoraDashboardView').then(m => ({ default: m.MontadoraDashboardView })));
const DealershipManagementView = React.lazy(() => import('./components/DealershipManagementView').then(m => ({ default: m.DealershipManagementView })));
const UserManagementView = React.lazy(() => import('./components/UserManagementView').then(m => ({ default: m.UserManagementView })));
const MonthlyCommitmentView = React.lazy(() => import('./components/MonthlyCommitmentView').then(m => ({ default: m.MonthlyCommitmentView })));
const PurchasePortalView = React.lazy(() => import('./components/PurchasePortalView').then(m => ({ default: m.PurchasePortalView })));
const ReserveFundView = React.lazy(() => import('./components/ReserveFundView').then(m => ({ default: m.ReserveFundView })));
const FreightManagementView = React.lazy(() => import('./components/FreightManagementView').then(m => ({ default: m.FreightManagementView })));
const PaymentConditionsView = React.lazy(() => import('./components/PaymentConditionsView').then(m => ({ default: m.PaymentConditionsView })));
const ModelMatrixView = React.lazy(() => import('./components/ModelMatrixView').then(m => ({ default: m.ModelMatrixView })));
const NationalPriceMatrixView = React.lazy(() => import('./components/NationalPriceMatrixView').then(m => ({ default: m.NationalPriceMatrixView })));
const OrderWorkflowView = React.lazy(() => import('./components/OrderWorkflowView').then(m => ({ default: m.OrderWorkflowView })));
const PartsCatalogView = React.lazy(() => import('./components/parts/PartsCatalogView').then(m => ({ default: m.PartsCatalogView })));
const InventoryView = React.lazy(() => import('./components/InventoryView').then(m => ({ default: m.InventoryView })));
const SalesCrmView = React.lazy(() => import('./components/SalesCrmView').then(m => ({ default: m.SalesCrmView })));
const ServiceOrderView = React.lazy(() => import('./components/ServiceOrderView').then(m => ({ default: m.ServiceOrderView })));
const SettingsView = React.lazy(() => import('./components/SettingsView').then(m => ({ default: m.SettingsView })));
const SupportView = React.lazy(() => import('./components/SupportView').then(m => ({ default: m.SupportView })));

export default function App() {
  // Theme State ('dark' | 'light')
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    return (localStorage.getItem('portal_theme') as 'dark' | 'light') || 'dark';
  });

  React.useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
      root.classList.remove('light');
    } else {
      root.classList.add('light');
      root.classList.remove('dark');
    }
    localStorage.setItem('portal_theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
  };

  // Authentication & Session State
  const [currentUser, setCurrentUser] = useState<any>(() => {
    const saved = localStorage.getItem('portal_suzuki_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [loginModalOpen, setLoginModalOpen] = useState(!currentUser);

  // Dealership / Montadora Scope ('jtoledo' = Montadora, 'motosul' = MotoSul RS, 'novamotor' = Nova Motor SP)
  const [currentScope, setCurrentScope] = useState<DealershipScope>(() => {
    return currentUser?.scopeType === 'concessionaria' && currentUser?.dealershipId 
      ? currentUser.dealershipId 
      : 'jtoledo';
  });

  const handleLoginSuccess = (user: any, token: string) => {
    setCurrentUser(user);
    setLoginModalOpen(false);
    if (user.scopeType === 'concessionaria' && user.dealershipId) {
      setCurrentScope(user.dealershipId);
    } else {
      setCurrentScope('jtoledo');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('portal_suzuki_token');
    localStorage.removeItem('portal_suzuki_user');
    setCurrentUser(null);
    setLoginModalOpen(true);
  };

  // Carregamento dinâmico de dados do SQL Server via API
  React.useEffect(() => {
    if (!currentUser) return;

    // 1. Carrega Concessionárias do SQL Server
    api.getDealerships()
      .then(data => {
        if (Array.isArray(data) && data.length > 0) setDealerships(data);
      })
      .catch(err => console.warn('[SQL Server] Fallback mock dealerships:', err.message));

    // 2. Carrega Modelos do SQL Server
    api.getPurchaseModels()
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          const sanitizedModels = data.map((m: PurchaseModel) => ({
            ...m,
            variants: (m.variants || []).map(v => ({
              ...v,
              quantity: 0
            }))
          }));
          setPurchaseModels(sanitizedModels);
        }
      })
      .catch(err => console.warn('[SQL Server] Fallback mock models:', err.message));

    // 3. Carrega Condições de Pagamento do SQL Server
    api.getPaymentConditions()
      .then(data => {
        if (Array.isArray(data) && data.length > 0) setPaymentConditions(data);
      })
      .catch(err => console.warn('[SQL Server] Fallback mock payment conditions:', err.message));

    // 4. Carrega Pedidos do SQL Server
    api.getFactoryOrders()
      .then(data => {
        if (Array.isArray(data) && data.length > 0) setFactoryOrders(data);
      })
      .catch(err => console.warn('[SQL Server] Fallback mock orders:', err.message));

    // 5. Carrega Extrato do Fundo de Reserva do SQL Server
    api.getReserveFundStatement()
      .then(data => {
        if (Array.isArray(data) && data.length > 0) setReserveFundTransactions(data);
      })
      .catch(err => console.warn('[SQL Server] Fallback mock reserve fund:', err.message));

    // 6. Carrega Compromissos Trimestrais do SQL Server
    api.getCommitments()
      .then(data => {
        if (Array.isArray(data)) setMonthlyCommitments(data);
      })
      .catch(err => console.warn('[SQL Server] Fallback mock commitments:', err.message));

    // 7. Carrega Estoque de Veículos do SQL Server
    api.getInventory()
      .then(data => {
        if (Array.isArray(data)) setInventory(data);
      })
      .catch(err => console.warn('[SQL Server] Fallback mock inventory:', err.message));

    // 8. Carrega Pipeline de Vendas do SQL Server
    api.getPipeline()
      .then(data => {
        if (Array.isArray(data)) setPipelineCards(data);
      })
      .catch(err => console.warn('[SQL Server] Fallback mock pipeline:', err.message));

    // 9. Carrega Interações do CRM do SQL Server
    api.getInteractions()
      .then(data => {
        if (Array.isArray(data)) setInteractions(data);
      })
      .catch(err => console.warn('[SQL Server] Fallback mock interactions:', err.message));

    // 10. Carrega Ordens de Serviço do SQL Server
    api.getServiceOrders()
      .then(data => {
        if (Array.isArray(data)) setServiceOrders(data);
      })
      .catch(err => console.warn('[SQL Server] Fallback mock service orders:', err.message));

    // 11. Carrega Lotes em Trânsito do SQL Server
    api.getTransitOrders()
      .then(data => {
        if (Array.isArray(data)) setTransitOrders(data);
      })
      .catch(err => console.warn('[SQL Server] Fallback mock transit:', err.message));

    // 12. Carrega Pedidos de Peças do SQL Server
    api.getPartsOrders()
      .then(data => {
        if (Array.isArray(data)) setPartsOrders(data);
      })
      .catch(err => console.warn('[SQL Server] Fallback mock parts orders:', err.message));

    // 13. Carrega Workflow de Aprovações do SQL Server
    api.getWorkflowSteps()
      .then(data => {
        if (Array.isArray(data)) setWorkflowSteps(data);
      })
      .catch(err => console.warn('[SQL Server] Fallback mock workflow steps:', err.message));

    // 14. Carrega Matriz de Habilitação de Modelos do SQL Server
    api.getModelMatrix()
      .then(data => {
        if (data && typeof data.enabledMap === 'object') setEnabledVariantsMap(data.enabledMap);
      })
      .catch(err => console.warn('[SQL Server] Fallback mock model matrix:', err.message));

    // 15. Carrega Propostas de Aprovação do SQL Server
    api.getProposals()
      .then(data => {
        if (Array.isArray(data)) setOrderProposals(data);
      })
      .catch(err => console.warn('[SQL Server] Fallback mock proposals:', err.message));
  }, [currentUser, currentScope]);

  // Navigation State
  const [currentTab, setCurrentTab] = useState<NavTab>('dashboard');
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Core Application Data States
  const [purchaseModels, setPurchaseModels] = useState<PurchaseModel[]>(INITIAL_PURCHASE_MODELS);
  const [inventory, setInventory] = useState<InventoryItem[]>(INITIAL_INVENTORY);
  const [pipelineCards, setPipelineCards] = useState<PipelineCard[]>(INITIAL_PIPELINE);
  const [serviceOrders, setServiceOrders] = useState<ServiceOrder[]>(INITIAL_SERVICE_ORDERS);
  const [interactions, setInteractions] = useState<InteractionLog[]>(INITIAL_INTERACTIONS);
  const [transitOrders, setTransitOrders] = useState<TransitOrder[]>(INITIAL_TRANSIT_ORDERS);
  const [recentSales, setRecentSales] = useState<RecentSale[]>(INITIAL_SALES);
  const [factoryOrders, setFactoryOrders] = useState<FactoryOrder[]>(INITIAL_FACTORY_ORDERS);
  const [dealerships, setDealerships] = useState<DealershipFullProfile[]>(INITIAL_DEALERSHIPS_LIST);
  const [orderProposals, setOrderProposals] = useState<OrderApprovalDocument[]>(INITIAL_ORDER_APPROVAL_PROPOSALS);
  const [monthlyCommitments, setMonthlyCommitments] = useState<MonthlyCommitmentPlan[]>(INITIAL_MONTHLY_COMMITMENTS);
  const [partsOrders, setPartsOrders] = useState<PartsOrder[]>(INITIAL_MOCK_PARTS_ORDERS);
  const [reserveFundTransactions, setReserveFundTransactions] = useState<ReserveFundTransaction[]>(INITIAL_RESERVE_FUND_TRANSACTIONS);

  // Persistence States for Matrix, Payment Conditions and Workflow
  const [enabledVariantsMap, setEnabledVariantsMap] = useState<Record<string, boolean>>({});
  const [paymentConditions, setPaymentConditions] = useState<PaymentConditionCampaign[]>(INITIAL_PAYMENT_CONDITIONS);
  const [workflowSteps, setWorkflowSteps] = useState<ApprovalWorkflowStep[]>(INITIAL_WORKFLOW_STEPS);

  // Model & Color Variant Enablement Handler (persistencia na MatrizHabilitacaoModelos)
  const handleToggleVariantEnabled = (modelId: string, variantId?: string, forceState?: boolean) => {
    const key = variantId ? `${modelId}-${variantId}` : modelId;
    setEnabledVariantsMap(prev => {
      const nextState = forceState !== undefined ? forceState : !(prev[key] !== false);
      const nextMap = { ...prev, [key]: nextState };
      api.saveModelMatrix({ dealershipId: currentScope === 'jtoledo' ? undefined : currentScope, enabledMap: nextMap })
        .catch(err => console.warn('[SQL Server] Erro ao salvar matriz:', err.message));
      return nextMap;
    });
  };

  const handleToggleAllInModel = (modelId: string, enable: boolean) => {
    const model = purchaseModels.find(m => m.id === modelId);
    if (!model) return;
    const updates: Record<string, boolean> = { [modelId]: enable };
    model.variants.forEach(v => {
      updates[`${modelId}-${v.id}`] = enable;
    });
    setEnabledVariantsMap(prev => {
      const nextMap = { ...prev, ...updates };
      api.saveModelMatrix({ dealershipId: currentScope === 'jtoledo' ? undefined : currentScope, enabledMap: nextMap })
        .catch(err => console.warn('[SQL Server] Erro ao salvar matriz:', err.message));
      return nextMap;
    });
  };

  // Payment Conditions Handlers (CRUD via SQL Server)
  const handleSavePaymentCondition = (condition: PaymentConditionCampaign) => {
    setPaymentConditions(prev => {
      const exists = prev.some(c => c.id === condition.id);
      if (exists) {
        api.updatePaymentCondition(condition.id, condition)
          .catch(err => console.warn('[SQL Server] Erro ao atualizar condição:', err.message));
        return prev.map(c => c.id === condition.id ? condition : c);
      }
      api.createPaymentCondition(condition)
        .then((res: any) => {
          if (res?.id && res.id !== condition.id) {
            setPaymentConditions(p => p.map(c => c.id === condition.id ? { ...condition, id: res.id } : c));
          }
        })
        .catch(err => console.warn('[SQL Server] Erro ao criar condição:', err.message));
      return [condition, ...prev];
    });
  };

  const handleDeletePaymentCondition = (id: string) => {
    setPaymentConditions(prev => prev.filter(c => c.id !== id));
    api.deletePaymentCondition(id)
      .catch(err => console.warn('[SQL Server] Erro ao excluir condição:', err.message));
  };

  // Approval Workflow Handlers (CRUD via SQL Server)
  const handleSaveWorkflowStep = (step: ApprovalWorkflowStep) => {
    setWorkflowSteps(prev => {
      const exists = prev.some(s => s.id === step.id);
      if (exists) {
        api.updateWorkflowStep(step.id, step)
          .catch(err => console.warn('[SQL Server] Erro ao atualizar etapa:', err.message));
        return prev.map(s => s.id === step.id ? step : s);
      }
      api.createWorkflowStep(step)
        .catch(err => console.warn('[SQL Server] Erro ao criar etapa:', err.message));
      return [...prev, step];
    });
  };

  const handleDeleteWorkflowStep = (id: string) => {
    setWorkflowSteps(prev => prev.filter(s => s.id !== id));
    api.deleteWorkflowStep(id)
      .catch(err => console.warn('[SQL Server] Erro ao excluir etapa:', err.message));
  };

  // Reserve Fund handlers
  const handleAddReserveFundTransaction = (tx: ReserveFundTransaction) => {
    setReserveFundTransactions(prev => [tx, ...prev]);
    api.createReserveFundCredit({
      dealershipId: tx.dealershipId,
      amount: tx.amount,
      brand: tx.brand,
      reference: tx.reference,
      origin: tx.origin || 'montadora_credito',
      observation: tx.observation
    }).catch(err => console.warn('[SQL Server] Erro ao lançar crédito:', err.message));
  };

  const handleApproveReserveFundTransaction = (id: string) => {
    setReserveFundTransactions(prev => prev.map(tx => {
      if (tx.id === id) {
        const updated = !tx.financialApproved;
        api.approveReserveFundTransaction(id)
          .catch(err => console.warn('[SQL Server] Erro ao aprovar lançamento:', err.message));
        return {
          ...tx,
          financialApproved: updated,
          status: updated ? 'aprovado' : 'pendente_financeiro'
        };
      }
      return tx;
    }));
  };

  // Spare Parts Orders handlers (Persistencia via SQL Server)
  const handlePlacePartsOrder = (newOrder: PartsOrder) => {
    setPartsOrders(prev => [newOrder, ...prev]);
    api.createPartsOrder(newOrder)
      .catch(err => console.warn('[SQL Server] Erro ao transmitir pedido de peças:', err.message));
  };

  const handleUpdatePartsOrder = (updatedOrder: PartsOrder) => {
    setPartsOrders(prev => prev.map(o => o.id === updatedOrder.id ? updatedOrder : o));
    api.updatePartsOrder(updatedOrder.id, updatedOrder)
      .catch(err => console.warn('[SQL Server] Erro ao atualizar pedido de peças:', err.message));
  };

  // Dealerships CRUD handlers
  const handleUpdateDealership = (updated: DealershipFullProfile) => {
    setDealerships(prev => prev.map(d => d.id === updated.id ? updated : d));
    api.updateDealership(updated.id, updated)
      .catch(err => console.warn('[SQL Server] Erro ao atualizar concessionária:', err.message));
  };

  const handleAddDealership = (newDealer: DealershipFullProfile) => {
    setDealerships(prev => [newDealer, ...prev]);
  };

  const handleDeleteDealership = (dealerId: string) => {
    setDealerships(prev => prev.filter(d => d.id !== dealerId));
  };

  // Order Approval Proposals handlers (Persistencia via SQL Server)
  const handleUpdateOrderProposal = (updated: OrderApprovalDocument) => {
    setOrderProposals(prev => prev.map(p => p.id === updated.id ? updated : p));
    api.updateProposal(updated.id, updated)
      .catch(err => console.warn('[SQL Server] Erro ao atualizar proposta:', err.message));
  };

  const handleCreateOrderProposal = (newProposal: OrderApprovalDocument) => {
    setOrderProposals(prev => [newProposal, ...prev]);
    api.createProposal(newProposal)
      .catch(err => console.warn('[SQL Server] Erro ao criar proposta:', err.message));
  };

  // Monthly Purchase Commitments handlers (CRUD via SQL Server)
  const handleSaveCommitment = (commitment: MonthlyCommitmentPlan) => {
    setMonthlyCommitments(prev => {
      const exists = prev.some(c => c.id === commitment.id);
      if (exists) {
        api.updateCommitment(commitment.id, commitment)
          .catch(err => console.warn('[SQL Server] Erro ao atualizar compromisso:', err.message));
        return prev.map(c => c.id === commitment.id ? commitment : c);
      }
      api.createCommitment(commitment)
        .catch(err => console.warn('[SQL Server] Erro ao criar compromisso:', err.message));
      return [commitment, ...prev];
    });
  };

  const handleDeleteCommitment = (id: string) => {
    setMonthlyCommitments(prev => prev.filter(c => c.id !== id));
    api.deleteCommitment(id)
      .catch(err => console.warn('[SQL Server] Erro ao excluir compromisso:', err.message));
  };

  // Generate / Sync Order Approval Document (Ficha JTA+JTZ) from Monthly Commitment
  const handleGenerateApprovalProposalFromCommitment = (commitment: MonthlyCommitmentPlan) => {
    const existingIndex = orderProposals.findIndex(
      p => p.id === commitment.linkedApprovalProposalId || (p.dealershipId === commitment.dealershipId && p.brand === commitment.brand)
    );

    // Build stock schedule from commitment items
    const stockSchedule: StockScheduleItem[] = commitment.items.map(item => ({
      model: item.model,
      currentStockOwn: item.currentStockOwn,
      currentStockBinBlocked: item.currentStockBinBlocked,
      currentStockBinLiberated: item.currentStockBinLiberated,
      month1Commitment: item.month1Commitment,
      month1Purchase: item.month1Purchase,
      month2Commitment: item.month2Commitment,
      month2Purchase: item.month2Purchase,
      month3Commitment: item.month3Commitment,
      month3Purchase: item.month3Purchase
    }));

    // Build pricing items for models that have month1Purchase > 0 (or first items)
    const itemsToBill = commitment.items.filter(i => i.month1Purchase > 0);
    const activeItems = itemsToBill.length > 0 ? itemsToBill : commitment.items.slice(0, 3);

    const pricingItems: ProposalPricingItem[] = activeItems.map((item, idx) => {
      const qty = item.month1Purchase > 0 ? item.month1Purchase : 2;
      const baseUnit = item.suggestedMSRPUnit;
      const descUnit = Math.round(baseUnit * 0.08);
      const prodUnit = baseUnit - descUnit;
      const icms = Math.round(prodUnit * 0.12);
      const pisCof = Math.round(prodUnit * 0.0925);
      const finalUnit = prodUnit;
      const totalFinal = finalUnit * qty;

      return {
        id: `pi-gen-${Date.now()}-${idx}`,
        quantity: qty,
        modelName: item.model,
        modelYear: '2026/2026',
        colorCode: item.notes?.includes('ZV') ? 'ZV 4A' : 'STD',
        paymentCondition: '30/60/90 DDL',
        interestRatePercent: 0.00,
        freightType: 'CIF',
        reserveFundUnit: 0,
        suggestedMSRPUnit: baseUnit,
        productsBaseUnit: baseUnit,
        discountUnit: descUnit,
        freightUnit: 0,
        totalProductsUnit: prodUnit,
        icmsUnit: icms,
        pisCofinsUnit: pisCof,
        finalUnitValue: finalUnit,
        totalProductsSubtotal: prodUnit * qty,
        totalFinalAmount: totalFinal
      };
    });

    const totalProposalAmount = pricingItems.reduce((s, p) => s + p.totalFinalAmount, 0);
    const proposalId = commitment.linkedApprovalProposalId || `prop-${commitment.dealerCode}-${Date.now().toString().slice(-4)}`;
    const propNum = `PROP-${commitment.dealerCode}-2026/05`;

    const newApprovalDoc: OrderApprovalDocument = {
      id: proposalId,
      proposalNumber: propNum,
      date: new Date().toLocaleDateString('pt-BR'),
      brand: commitment.brand,
      dealershipId: commitment.dealershipId,
      dealershipName: commitment.dealershipName,
      legalName: commitment.legalName,
      dealerCode: commitment.dealerCode,
      originCode: commitment.originCode,
      dealerTier: commitment.dealerTier,
      regionalComercial: commitment.regionalComercial,
      regionalFinanceira: commitment.regionalFinanceira,
      avgMonthlyRegistration: commitment.avgMonthlyRegistration,
      transporterCode: commitment.transporterCode,
      bikesPerInvoice: commitment.bikesPerInvoice,
      month1Label: commitment.month1Label,
      month2Label: commitment.month2Label,
      month3Label: commitment.month3Label,
      stockSchedule,
      pricingItems,
      creditAnalysis: {
        unifiedWarrantyTotal: 1200000.00,
        jtaLimit: 600000.00,
        jtaWithinLimit: 180000.00,
        jtaTestRide: 45000.00,
        jtaOutsideLimitBinBloq: 0.00,
        jtaProposalAmount: commitment.brand === 'Suzuki' ? totalProposalAmount : 0,
        jtzLimit: 600000.00,
        jtzWithinLimit: 220000.00,
        jtzTestRide: 35000.00,
        jtzOutsideLimitBinBloq: 33800.00,
        jtzProposalAmount: commitment.brand !== 'Suzuki' ? totalProposalAmount : 0,
        paymentHistory: 'BOM',
        committeeDecisionNotes: `Ficha de aprovação gerada automaticamente a partir do compromisso mensal de compra aprovado (${commitment.period}). Base de estoque e cotas trimestrais sincronizadas.`
      },
      status: 'em_analise',
      financialApproved: false,
      commercialApproved: true,
      commercialApprovedBy: `${commitment.regionalComercial} (Regional)`,
      commercialApprovedAt: new Date().toLocaleString('pt-BR'),
      commercialNotes: 'Validado conforme grade de compromisso mensal submetida pela concessionária.',
      protheusIntegrated: false,
      handwrittenNotes: [
        `Consulta financeira gerada via Compromisso ${commitment.period}`,
        `Regional Comercial: ${commitment.regionalComercial} - Cota OK`,
        'Histórico de pgto: BOM'
      ]
    };

    // Update commitment with linkedApprovalProposalId
    const updatedCommitment: MonthlyCommitmentPlan = {
      ...commitment,
      status: 'aprovado_fabrica',
      linkedApprovalProposalId: proposalId
    };

    setMonthlyCommitments(prev => prev.map(c => c.id === commitment.id ? updatedCommitment : c));

    if (existingIndex >= 0) {
      setOrderProposals(prev => prev.map((p, idx) => idx === existingIndex ? newApprovalDoc : p));
    } else {
      setOrderProposals(prev => [newApprovalDoc, ...prev]);
    }
  };

  // Modals
  const [orderModalOpen, setOrderModalOpen] = useState(false);
  const [selectedFreightMode, setSelectedFreightMode] = useState('Frete CIF (Incluso)');
  const [checkoutTotalAmount, setCheckoutTotalAmount] = useState(0);
  const [checkoutTotalUnits, setCheckoutTotalUnits] = useState(0);
  const [pendingOrderItems, setPendingOrderItems] = useState<FactoryOrderItem[]>([]);

  // Filtered dataset according to active dealership (or all if Montadora)
  const scopedInventory = currentScope === 'jtoledo' 
    ? inventory 
    : inventory.filter(item => item.dealershipId === currentScope);

  const scopedPipeline = currentScope === 'jtoledo'
    ? pipelineCards
    : pipelineCards.filter(card => card.dealershipId === currentScope);

  const scopedServiceOrders = currentScope === 'jtoledo'
    ? serviceOrders
    : serviceOrders.filter(os => os.dealershipId === currentScope);

  const scopedRecentSales = currentScope === 'jtoledo'
    ? recentSales
    : recentSales.filter(sale => sale.dealershipId === currentScope);

  const scopedTransitOrders = currentScope === 'jtoledo'
    ? transitOrders
    : transitOrders.filter(to => to.dealershipId === currentScope);

  const scopedInteractions = currentScope === 'jtoledo'
    ? interactions
    : interactions.filter(int => !int.dealershipId || int.dealershipId === currentScope || int.dealershipId === 'jtoledo');

  // Purchase Portal Handlers
  const handleSavePurchaseModel = async (savedModel: PurchaseModel) => {
    setPurchaseModels(prev => {
      const idx = prev.findIndex(m => m.id === savedModel.id);
      if (idx >= 0) {
        return prev.map(m => m.id === savedModel.id ? savedModel : m);
      } else {
        return [savedModel, ...prev];
      }
    });

    try {
      await api.updatePurchaseModel(savedModel.id, savedModel);
    } catch (err) {
      console.warn('[Purchase] Erro ao sincronizar modelo com o backend SQL:', err);
    }
  };

  const handleDeletePurchaseModel = (modelId: string) => {
    setPurchaseModels(prev => prev.filter(m => m.id !== modelId));
  };

  const handleUpdateVariantQuantity = (modelId: string, variantId: string, delta: number) => {
    setPurchaseModels(prev => prev.map(m => {
      if (m.id !== modelId) return m;
      return {
        ...m,
        variants: m.variants.map(v => {
          if (v.id !== variantId) return v;
          const newQty = Math.max(0, v.quantity + delta);
          return { ...v, quantity: newQty };
        })
      };
    }));
  };

  const handleUpdateModelSetting = (modelId: string, field: 'selectedOrderType' | 'selectedPayment', value: any) => {
    setPurchaseModels(prev => prev.map(m => {
      if (m.id !== modelId) return m;
      return { ...m, [field]: value };
    }));
  };

  const handlePlaceOrder = (freightMode: string, totalAmount: number, totalUnits: number, items: FactoryOrderItem[]) => {
    setSelectedFreightMode(freightMode);
    setCheckoutTotalAmount(totalAmount);
    setCheckoutTotalUnits(totalUnits);
    setPendingOrderItems(items || []);
    setOrderModalOpen(true);
  };

  const handleUpdateFactoryOrder = (updatedOrder: FactoryOrder) => {
    setFactoryOrders(prev => prev.map(o => o.id === updatedOrder.id ? updatedOrder : o));

    // Persiste decisões da montadora e aceite da concessionária no SQL Server
    api.updateFactoryOrder(updatedOrder.id, {
      status: updatedOrder.status !== 'aguardando_analise' ? updatedOrder.status : undefined,
      creditApproved: updatedOrder.creditApproved,
      commercialApproved: updatedOrder.commercialApproved,
      protheusIntegrated: updatedOrder.protheusIntegrated,
      protheusOrderNumber: updatedOrder.protheusOrderNumber,
      notes: updatedOrder.notes,
      items: updatedOrder.items?.map(it => ({
        id: it.id,
        dealerAcceptanceStatus: it.dealerAcceptanceStatus,
        itemApprovalStatus: it.itemApprovalStatus
      }))
    }).catch(err => console.warn('[SQL Server] Erro ao atualizar pedido de fábrica:', err.message));

    // If order was just integrated into Protheus, automatically create an in-transit dispatch entry
    if (updatedOrder.protheusIntegrated) {
      const existingTransit = transitOrders.find(t => t.id === `to-${updatedOrder.id}`);
      if (!existingTransit) {
        const newTransit: TransitOrder = {
          id: `to-${updatedOrder.id}`,
          dealershipId: updatedOrder.dealershipId,
          batchName: `Lote Fábrica ${updatedOrder.totalUnits} Motos (${updatedOrder.dealershipName})`,
          eta: 'Previsão: 4 dias úteis',
          status: 'No Prazo',
          location: 'Armazém 01 Manaus / Transporte Rodoviário',
          unitsCount: updatedOrder.totalUnits,
          value: updatedOrder.totalAmount
        };
        setTransitOrders(prev => [newTransit, ...prev]);
        api.createTransitOrder(newTransit)
          .catch(err => console.warn('[SQL Server] Erro ao registrar lote em trânsito:', err.message));

        const newInteraction = {
          id: `log-${Date.now()}`,
          dealershipId: updatedOrder.dealershipId,
          type: 'lead' as const,
          title: `Pedido ${updatedOrder.orderNumber} Integrado no ERP Protheus (${updatedOrder.protheusOrderNumber})`,
          time: 'Agora',
          description: `Aprovado Crédito e Comercial. Chassi e faturamento gerados no Armazém 01 Manaus.`
        };
        setInteractions(prev => [newInteraction, ...prev]);
        api.createInteraction(newInteraction)
          .catch(err => console.warn('[SQL Server] Erro ao registrar interação:', err.message));
      }
    }
  };

  const handleOrderConfirmed = () => {
    // Reset selected quantities
    setPurchaseModels(prev => prev.map(m => ({
      ...m,
      variants: m.variants.map(v => ({ ...v, quantity: 0 }))
    })));

    const activeDealer = DEALERSHIP_PROFILES[currentScope] || DEALERSHIP_PROFILES['motosul'];
    const newOrderId = `fo-${Date.now()}`;
    const seqNum = Math.floor(10000 + Math.random() * 89999);
    const newOrderNumber = `PED-${seqNum}`;

    const rawItems = pendingOrderItems.length > 0 ? pendingOrderItems : [
      {
        id: `foi-${Date.now()}-1`,
        modelId: 'gsx-s1000gx',
        modelName: 'GSX-S1000GX',
        brand: 'Suzuki' as const,
        category: 'Sport Crossover',
        colorName: 'Azul Metálico (YSF)',
        colorHex: '#1b3b6f',
        quantity: checkoutTotalUnits,
        unitFactoryCost: checkoutTotalAmount / Math.max(1, checkoutTotalUnits),
        unitMSRP: 98800.00,
        totalItemCost: checkoutTotalAmount
      }
    ];

    const expandedItems: FactoryOrderItem[] = [];
    rawItems.forEach(item => {
      if (item.brand !== 'Haojue' && item.quantity > 1) {
        for (let i = 0; i < item.quantity; i++) {
          expandedItems.push({
            ...item,
            id: `${item.id}-${i + 1}`,
            quantity: 1,
            totalItemCost: item.unitFactoryCost,
            supervisorStatus: 'pendente',
            managerStatus: 'pendente',
            directorStatus: 'pendente',
            itemApprovalStatus: 'pendente'
          });
        }
      } else {
        expandedItems.push({
          ...item,
          supervisorStatus: 'pendente',
          managerStatus: 'pendente',
          directorStatus: 'pendente',
          itemApprovalStatus: 'pendente'
        });
      }
    });

    const mappedItems: FactoryOrderItem[] = expandedItems.map((item, idx) => ({
      ...item,
      childOrderNumber: `${seqNum}${String(idx + 1).padStart(2, '0')}`
    }));

    const newFactoryOrder: FactoryOrder = {
      id: newOrderId,
      orderNumber: newOrderNumber,
      parentOrderNumber: newOrderNumber,
      dealershipId: currentScope === 'jtoledo' ? 'motosul' : currentScope,
      dealershipName: activeDealer.name,
      dealershipCity: activeDealer.city,
      dealershipState: activeDealer.state,
      dealershipRegion: activeDealer.region,
      dealershipTier: activeDealer.tier || 'Diamante',
      dealershipCnpj: activeDealer.cnpj,
      createdAt: new Date().toLocaleDateString('pt-BR') + ' ' + new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      freightMode: selectedFreightMode.includes('CIF') ? 'CIF' : 'FOB',
      paymentMethod: 'A Prazo (30/60/90)',
      status: 'aguardando_analise',
      notes: 'Pedido transmitido via Portal B2B Concessionária.',
      creditApproved: false,
      dealerCreditLimit: activeDealer.creditLimit || 3000000,
      dealerCreditUsed: activeDealer.creditUsed || 1890000,
      commercialApproved: false,
      protheusIntegrated: false,
      totalUnits: checkoutTotalUnits,
      totalAmount: checkoutTotalAmount,
      items: mappedItems
    };

    setFactoryOrders(prev => [newFactoryOrder, ...prev]);

    // Persistência em tempo real no banco SQL Server
    api.createFactoryOrder({
      id: newOrderId,
      orderNumber: newOrderNumber,
      dealershipId: currentScope === 'jtoledo' ? 'motosul' : currentScope,
      freightMode: selectedFreightMode.includes('CIF') ? 'CIF' : 'FOB',
      paymentMethod: 'A Prazo (30/60/90)',
      totalUnits: checkoutTotalUnits,
      totalAmount: checkoutTotalAmount,
      notes: 'Pedido transmitido via Portal B2B Concessionária.',
      usedReserveFund: false,
      reserveFundAmount: 0,
      items: mappedItems
    }).catch(err => console.warn('[SQL Server] Erro ao gravar pedido no banco:', err.message));

    // Add interaction log
    setInteractions(prev => [
      {
        id: `log-${Date.now()}`,
        dealershipId: currentScope,
        type: 'lead',
        title: `Pedido ${newOrderNumber} Transmitido à Montadora (${activeDealer.name})`,
        time: 'Agora',
        description: `Transmitido lote de ${checkoutTotalUnits} motocicletas no valor de R$ ${checkoutTotalAmount.toLocaleString('pt-BR')}. Aguardando análise de crédito e comercial.`
      },
      ...prev
    ]);
  };

  // Inventory Handlers
  const handleAddVehicle = (vehicle: Omit<InventoryItem, 'id'>) => {
    const newItem: InventoryItem = {
      ...vehicle,
      id: `inv-${Date.now()}`,
      dealershipId: vehicle.dealershipId || (currentScope === 'jtoledo' ? 'motosul' : currentScope)
    };
    setInventory(prev => [newItem, ...prev]);
    api.createInventoryItem(newItem)
      .catch(err => console.warn('[SQL Server] Erro ao adicionar veículo ao estoque:', err.message));
  };

  const handleUpdateVehicle = (vehicle: InventoryItem) => {
    setInventory(prev => prev.map(item => item.id === vehicle.id ? vehicle : item));
    api.updateInventoryItem(vehicle.id, vehicle)
      .catch(err => console.warn('[SQL Server] Erro ao atualizar veículo:', err.message));
  };

  const handleDeleteVehicle = (id: string) => {
    setInventory(prev => prev.filter(item => item.id !== id));
    api.deleteInventoryItem(id)
      .catch(err => console.warn('[SQL Server] Erro ao excluir veículo:', err.message));
  };

  // Sales CRM Handlers
  const handleAddLead = (lead: Omit<PipelineCard, 'id'>) => {
    const newCard: PipelineCard = {
      ...lead,
      id: `lead-${Date.now()}`,
      dealershipId: lead.dealershipId || (currentScope === 'jtoledo' ? 'motosul' : currentScope)
    };
    setPipelineCards(prev => [newCard, ...prev]);
    api.createPipelineLead(newCard)
      .catch(err => console.warn('[SQL Server] Erro ao cadastrar lead:', err.message));

    // Log interaction
    const newLog = {
      id: `log-${Date.now()}`,
      dealershipId: currentScope,
      type: 'whatsapp' as const,
      title: `Novo Lead: ${lead.customerName}`,
      time: 'Agora',
      description: `Lead cadastrado com interesse em ${lead.vehicleInterest} (R$ ${lead.value.toLocaleString('pt-BR')}).`
    };
    setInteractions(prev => [newLog, ...prev]);
    api.createInteraction(newLog)
      .catch(err => console.warn('[SQL Server] Erro ao registrar interação:', err.message));
  };

  const handleMoveCard = (cardId: string, targetType: PipelineCard['type']) => {
    setPipelineCards(prev => prev.map(c => {
      if (c.id !== cardId) return c;
      return { ...c, type: targetType };
    }));
    api.movePipelineLead(cardId, targetType)
      .catch(err => console.warn('[SQL Server] Erro ao mover lead:', err.message));
  };

  const handleAddInteraction = (interaction: Omit<InteractionLog, 'id'>) => {
    const newLog: InteractionLog = {
      ...interaction,
      id: `log-${Date.now()}`,
      dealershipId: interaction.dealershipId || currentScope
    };
    setInteractions(prev => [newLog, ...prev]);
    api.createInteraction(newLog)
      .catch(err => console.warn('[SQL Server] Erro ao registrar interação:', err.message));
  };

  // Service Order Handlers
  const handleAddServiceOrder = (os: Omit<ServiceOrder, 'id'>) => {
    const newOS: ServiceOrder = {
      ...os,
      id: `os-${Date.now()}`,
      dealershipId: os.dealershipId || (currentScope === 'jtoledo' ? 'motosul' : currentScope)
    };
    setServiceOrders(prev => [newOS, ...prev]);
    api.createServiceOrder(newOS)
      .catch(err => console.warn('[SQL Server] Erro ao criar ordem de serviço:', err.message));
  };

  const handleUpdateServiceOrder = (os: ServiceOrder) => {
    setServiceOrders(prev => prev.map(item => item.id === os.id ? os : item));
    api.updateServiceOrder(os.id, os)
      .catch(err => console.warn('[SQL Server] Erro ao atualizar OS:', err.message));
  };

  const handleDeleteServiceOrder = (id: string) => {
    setServiceOrders(prev => prev.filter(item => item.id !== id));
    api.deleteServiceOrder(id)
      .catch(err => console.warn('[SQL Server] Erro ao excluir OS:', err.message));
  };

  return (
    <div className={`min-h-screen flex font-sans antialiased selection:bg-blue-600 selection:text-white transition-colors duration-200 ${
      theme === 'dark' ? 'dark bg-neutral-950 text-slate-100' : 'bg-slate-50 text-slate-900'
    }`}>
      {/* Sidebar Navigation */}
      <Sidebar
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        currentScope={currentScope}
        onChangeScope={(scope) => {
          setCurrentScope(scope);
        }}
        mobileOpen={mobileNavOpen}
        setMobileOpen={setMobileNavOpen}
        onOpenNewOrder={() => {
          setCurrentTab('purchase');
        }}
        activeOSCount={scopedServiceOrders.filter(o => o.status !== 'finalizado').length}
        theme={theme}
        onToggleTheme={toggleTheme}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-[270px]">
        {/* Top Header */}
        <Header
          currentTab={currentTab}
          currentScope={currentScope}
          onChangeScope={(scope) => {
            setCurrentScope(scope);
          }}
          onOpenMobileNav={() => setMobileNavOpen(true)}
          onOpenNewOrder={() => {
            setCurrentTab('purchase');
          }}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          theme={theme}
          onToggleTheme={toggleTheme}
          currentUser={currentUser}
          onLogout={handleLogout}
        />

        {/* Dynamic View Body */}
        <main className="flex-1 p-4 md:p-6 lg:p-8 overflow-y-auto">
          <React.Suspense fallback={<ViewSkeleton />}>
            {/* Dashboard Rendering: Montadora vs Specific Dealership */}
            {currentTab === 'dashboard' && currentScope === 'jtoledo' && (
              <MontadoraDashboardView
                inventory={inventory}
                recentSales={recentSales}
                serviceOrders={serviceOrders}
                pipelineCards={pipelineCards}
                transitOrders={transitOrders}
                factoryOrders={factoryOrders}
                onSelectDealership={(scope) => {
                  setCurrentScope(scope);
                }}
                onNavigate={(tab) => setCurrentTab(tab)}
              />
            )}

            {currentTab === 'dashboard' && currentScope !== 'jtoledo' && (
              <DashboardView
                onNavigate={(tab) => setCurrentTab(tab)}
                onOpenNewVehicleModal={() => setCurrentTab('inventory')}
                onOpenNewLeadModal={() => setCurrentTab('sales')}
                inventory={scopedInventory}
                transitOrders={scopedTransitOrders}
                serviceOrders={scopedServiceOrders}
                pipelineCards={scopedPipeline}
                recentSales={scopedRecentSales}
              />
            )}

            {currentTab === 'dealers_network' && (
              <DealershipManagementView
                dealerships={dealerships}
                paymentConditions={paymentConditions}
                onUpdateDealership={handleUpdateDealership}
                onAddDealership={handleAddDealership}
                onDeleteDealership={handleDeleteDealership}
                onSelectDealership={(scope) => {
                  setCurrentScope(scope);
                }}
                onNavigate={(tab) => setCurrentTab(tab)}
              />
            )}

            {currentTab === 'user_management' && (
              <UserManagementView 
                currentScope={currentScope}
                activeDealership={dealerships.find(d => d.id === currentScope) || DEALERSHIP_PROFILES[currentScope]}
              />
            )}

            {currentTab === 'commitments' && (
              <MonthlyCommitmentView
                currentScope={currentScope}
                commitments={monthlyCommitments}
                dealerships={dealerships}
                orderProposals={orderProposals}
                onSaveCommitment={handleSaveCommitment}
                onDeleteCommitment={handleDeleteCommitment}
                onGenerateApprovalProposal={handleGenerateApprovalProposalFromCommitment}
                onNavigateToApprovalDoc={(proposalId) => {
                  setCurrentTab('purchase');
                }}
                onSelectDealershipScope={(scope) => {
                  setCurrentScope(scope);
                }}
              />
            )}

            {currentTab === 'purchase' && (
              <PurchasePortalView
                currentScope={currentScope}
                purchaseModels={purchaseModels}
                enabledVariantsMap={enabledVariantsMap}
                paymentConditions={paymentConditions}
                workflowSteps={workflowSteps}
                factoryOrders={factoryOrders}
                orderProposals={orderProposals}
                reserveFundTransactions={reserveFundTransactions}
                onUpdateOrderProposal={handleUpdateOrderProposal}
                onCreateOrderProposal={handleCreateOrderProposal}
                dealerships={dealerships}
                onUpdateVariantQuantity={handleUpdateVariantQuantity}
                onUpdateModelSetting={handleUpdateModelSetting}
                onSavePurchaseModel={handleSavePurchaseModel}
                onDeletePurchaseModel={handleDeletePurchaseModel}
                onPlaceOrder={handlePlaceOrder}
                onUpdateFactoryOrder={handleUpdateFactoryOrder}
                onNavigateToCommitments={() => setCurrentTab('commitments')}
              />
            )}

            {currentTab === 'national_price_matrix' && (
              <NationalPriceMatrixView
                purchaseModels={purchaseModels}
                onSavePurchaseModel={handleSavePurchaseModel}
                onDeletePurchaseModel={handleDeletePurchaseModel}
              />
            )}

            {currentTab === 'reserve_fund' && (
              <ReserveFundView
                currentScope={currentScope}
                transactions={reserveFundTransactions}
                onAddTransaction={handleAddReserveFundTransaction}
                onApproveTransaction={handleApproveReserveFundTransaction}
              />
            )}

            {currentTab === 'freight_table' && <FreightManagementView />}

            {currentTab === 'payment_conditions' && (
              <PaymentConditionsView
                conditions={paymentConditions}
                onSaveCondition={handleSavePaymentCondition}
                onDeleteCondition={handleDeletePaymentCondition}
              />
            )}

            {currentTab === 'model_matrix' && (
              <ModelMatrixView
                purchaseModels={purchaseModels}
                enabledVariantsMap={enabledVariantsMap}
                onToggleVariantEnabled={handleToggleVariantEnabled}
                onToggleAllInModel={handleToggleAllInModel}
              />
            )}

            {currentTab === 'approval_workflow' && (
              <OrderWorkflowView
                workflowSteps={workflowSteps}
                onSaveWorkflowStep={handleSaveWorkflowStep}
                onDeleteWorkflowStep={handleDeleteWorkflowStep}
              />
            )}

            {currentTab === 'parts_catalog' && (
              <PartsCatalogView
                currentScope={currentScope}
                dealerships={dealerships}
                partsOrders={partsOrders}
                onPlacePartsOrder={handlePlacePartsOrder}
                onUpdatePartsOrder={handleUpdatePartsOrder}
              />
            )}

            {currentTab === 'inventory' && (
              <InventoryView
                inventory={scopedInventory}
                onAddVehicle={handleAddVehicle}
                onUpdateVehicle={handleUpdateVehicle}
                onDeleteVehicle={handleDeleteVehicle}
                searchQuery={searchQuery}
                currentScope={currentScope}
              />
            )}

            {currentTab === 'sales' && (
              <SalesCrmView
                pipelineCards={scopedPipeline}
                onAddLead={handleAddLead}
                onMoveCard={handleMoveCard}
                interactions={scopedInteractions}
                onAddInteraction={handleAddInteraction}
                recentSales={scopedRecentSales}
              />
            )}

            {currentTab === 'service_order' && (
              <ServiceOrderView
                serviceOrders={scopedServiceOrders}
                onAddServiceOrder={handleAddServiceOrder}
                onUpdateServiceOrder={handleUpdateServiceOrder}
                onDeleteServiceOrder={handleDeleteServiceOrder}
                searchQuery={searchQuery}
              />
            )}

            {currentTab === 'settings' && <SettingsView />}

            {currentTab === 'support' && <SupportView />}
          </React.Suspense>
        </main>
      </div>

      {/* Order Confirmation Modal */}
      <OrderConfirmationModal
        isOpen={orderModalOpen}
        onClose={() => setOrderModalOpen(false)}
        purchaseModels={purchaseModels}
        freightMode={selectedFreightMode}
        totalAmount={checkoutTotalAmount}
        totalUnits={checkoutTotalUnits}
        onConfirmSuccess={handleOrderConfirmed}
      />

      {/* Login Modal & First Access Password Reset */}
      <LoginModal
        isOpen={loginModalOpen}
        onLoginSuccess={handleLoginSuccess}
      />
    </div>
  );
}
