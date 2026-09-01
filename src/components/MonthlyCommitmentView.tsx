import React, { useState, useMemo } from 'react';
import { 
  MonthlyCommitmentPlan, 
  MonthlyCommitmentItem, 
  DealershipFullProfile, 
  DealershipScope, 
  BrandType, 
  OrderApprovalDocument,
  StockScheduleItem,
  ProposalPricingItem
} from '../types';
import { 
  CalendarCheck, 
  Plus, 
  Search, 
  Filter, 
  Send, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  FileText, 
  ArrowRight, 
  Trash2, 
  Edit3, 
  Building2, 
  TrendingUp, 
  Coins, 
  Layers, 
  Printer, 
  Sparkles, 
  ShieldCheck, 
  ChevronRight, 
  Check, 
  X, 
  RefreshCw, 
  Download,
  Lock,
  Boxes,
  HelpCircle,
  ArrowUpRight
} from 'lucide-react';

interface MonthlyCommitmentViewProps {
  currentScope: DealershipScope;
  commitments: MonthlyCommitmentPlan[];
  dealerships: DealershipFullProfile[];
  orderProposals: OrderApprovalDocument[];
  onSaveCommitment: (commitment: MonthlyCommitmentPlan) => void;
  onDeleteCommitment: (id: string) => void;
  onGenerateApprovalProposal: (commitment: MonthlyCommitmentPlan) => void;
  onNavigateToApprovalDoc?: (proposalId?: string) => void;
  onSelectDealershipScope?: (scope: DealershipScope) => void;
}

export const MonthlyCommitmentView: React.FC<MonthlyCommitmentViewProps> = ({
  currentScope,
  commitments,
  dealerships,
  orderProposals,
  onSaveCommitment,
  onDeleteCommitment,
  onGenerateApprovalProposal,
  onNavigateToApprovalDoc,
  onSelectDealershipScope
}) => {
  const isMontadora = currentScope === 'jtoledo';

  // Active Dealership Profile (if dealer scope)
  const currentDealerProfile = useMemo(() => {
    return dealerships.find(d => d.id === currentScope) || null;
  }, [dealerships, currentScope]);

  // Selected Commitment for Detail / Edit / Review
  const [selectedCommitmentId, setSelectedCommitmentId] = useState<string | null>(null);

  // Search and Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [filterBrand, setFilterBrand] = useState<string>('todas');
  const [filterStatus, setFilterStatus] = useState<string>('todos');
  const [filterDealer, setFilterDealer] = useState<string>('todos');

  // Modal States
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingCommitment, setEditingCommitment] = useState<MonthlyCommitmentPlan | null>(null);

  // Toast feedback
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Filtered Commitments based on Scope (Exclusive Access for Dealerships!)
  const scopedCommitments = useMemo(() => {
    if (isMontadora) {
      return commitments;
    }
    // Strict exclusive access for each dealership
    return commitments.filter(c => c.dealershipId === currentScope);
  }, [commitments, isMontadora, currentScope]);

  const displayedCommitments = useMemo(() => {
    return scopedCommitments.filter(c => {
      const matchSearch = 
        c.dealershipName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.period.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.dealerCode.includes(searchQuery) ||
        c.brand.toLowerCase().includes(searchQuery.toLowerCase());
      const matchBrand = filterBrand === 'todas' || c.brand === filterBrand;
      const matchStatus = filterStatus === 'todos' || c.status === filterStatus;
      const matchDealer = filterDealer === 'todos' || c.dealershipId === filterDealer;
      return matchSearch && matchBrand && matchStatus && matchDealer;
    });
  }, [scopedCommitments, searchQuery, filterBrand, filterStatus, filterDealer]);

  // Active Selected Commitment object
  const activeCommitment = useMemo(() => {
    if (!selectedCommitmentId) {
      return displayedCommitments[0] || null;
    }
    return commitments.find(c => c.id === selectedCommitmentId) || displayedCommitments[0] || null;
  }, [commitments, selectedCommitmentId, displayedCommitments]);

  // KPI Calculations
  const kpis = useMemo(() => {
    const totalPlans = scopedCommitments.length;
    const totalUnitsM1 = scopedCommitments.reduce((sum, c) => sum + c.totalUnitsMonth1, 0);
    const totalUnitsTrimestre = scopedCommitments.reduce((sum, c) => {
      const m1 = c.items.reduce((s, i) => s + i.month1Purchase, 0);
      const m2 = c.items.reduce((s, i) => s + i.month2Commitment, 0);
      const m3 = c.items.reduce((s, i) => s + i.month3Commitment, 0);
      return sum + m1 + m2 + m3;
    }, 0);
    const totalFinancial = scopedCommitments.reduce((sum, c) => sum + c.totalEstimatedAmount, 0);
    const pendingReviewCount = scopedCommitments.filter(c => c.status === 'enviado' || c.status === 'em_analise').length;
    const approvedCount = scopedCommitments.filter(c => c.status === 'aprovado_fabrica').length;

    return {
      totalPlans,
      totalUnitsM1,
      totalUnitsTrimestre,
      totalFinancial,
      pendingReviewCount,
      approvedCount
    };
  }, [scopedCommitments]);

  // Calculation helpers for active plan
  const activePlanTotals = useMemo(() => {
    if (!activeCommitment) return { ownStock: 0, binBloq: 0, binLib: 0, m1Comp: 0, m1Pur: 0, m2Comp: 0, m2Pur: 0, m3Comp: 0, m3Pur: 0, totalGeneralStock: 0, totalAmount: 0 };
    return activeCommitment.items.reduce((acc, item) => {
      const own = acc.ownStock + item.currentStockOwn;
      const binBloq = acc.binBloq + item.currentStockBinBlocked;
      const binLib = acc.binLib + item.currentStockBinLiberated;
      const m1Comp = acc.m1Comp + item.month1Commitment;
      const m1Pur = acc.m1Pur + item.month1Purchase;
      const m2Comp = acc.m2Comp + item.month2Commitment;
      const m2Pur = acc.m2Pur + item.month2Purchase;
      const m3Comp = acc.m3Comp + item.month3Commitment;
      const m3Pur = acc.m3Pur + item.month3Purchase;
      const amount = acc.totalAmount + (item.month1Purchase * item.factoryCostUnit);
      return {
        ownStock: own,
        binBloq,
        binLib,
        m1Comp,
        m1Pur,
        m2Comp,
        m2Pur,
        m3Comp,
        m3Pur,
        totalGeneralStock: own + binBloq + binLib,
        totalAmount: amount
      };
    }, { ownStock: 0, binBloq: 0, binLib: 0, m1Comp: 0, m1Pur: 0, m2Comp: 0, m2Pur: 0, m3Comp: 0, m3Pur: 0, totalGeneralStock: 0, totalAmount: 0 });
  }, [activeCommitment]);

  // Format currency
  const fmt = (val: number) => {
    return val.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  // Start new commitment modal
  const handleOpenCreateModal = () => {
    const targetDealer = currentDealerProfile || dealerships[0];
    const defaultBrand = (targetDealer?.brandsAuthorized?.[0] as BrandType) || 'Haojue';

    const defaultItems: MonthlyCommitmentItem[] = defaultBrand === 'Haojue' ? [
      {
        id: `cmi-${Date.now()}-1`,
        model: 'DR160',
        brand: 'Haojue',
        category: 'Street / Sport',
        currentStockOwn: 6,
        currentStockBinBlocked: 0,
        currentStockBinLiberated: 0,
        month1Commitment: 8,
        month1Purchase: 6,
        month2Commitment: 8,
        month2Purchase: 0,
        month3Commitment: 8,
        month3Purchase: 0,
        suggestedMSRPUnit: 20900.00,
        factoryCostUnit: 16333.00,
        notes: 'Cores: ZV 4A'
      },
      {
        id: `cmi-${Date.now()}-2`,
        model: 'DK160',
        brand: 'Haojue',
        category: 'Street Utilitária',
        currentStockOwn: 12,
        currentStockBinBlocked: 0,
        currentStockBinLiberated: 0,
        month1Commitment: 15,
        month1Purchase: 6,
        month2Commitment: 15,
        month2Purchase: 0,
        month3Commitment: 15,
        month3Purchase: 0,
        suggestedMSRPUnit: 16960.00,
        factoryCostUnit: 13055.00,
        notes: 'Preta e Vermelha'
      },
      {
        id: `cmi-${Date.now()}-3`,
        model: 'MASTER',
        brand: 'Haojue',
        category: 'Custom Classic',
        currentStockOwn: 4,
        currentStockBinBlocked: 0,
        currentStockBinLiberated: 0,
        month1Commitment: 4,
        month1Purchase: 4,
        month2Commitment: 4,
        month2Purchase: 0,
        month3Commitment: 4,
        month3Purchase: 0,
        suggestedMSRPUnit: 18900.00,
        factoryCostUnit: 14800.00,
        notes: 'Forte saída no salão'
      },
      {
        id: `cmi-${Date.now()}-4`,
        model: 'DL160',
        brand: 'Haojue',
        category: 'Crossover Adventure',
        currentStockOwn: 8,
        currentStockBinBlocked: 1,
        currentStockBinLiberated: 0,
        month1Commitment: 8,
        month1Purchase: 6,
        month2Commitment: 8,
        month2Purchase: 0,
        month3Commitment: 10,
        month3Purchase: 0,
        suggestedMSRPUnit: 21500.00,
        factoryCostUnit: 16900.00,
        notes: 'Lançamento com lista de espera'
      }
    ] : [
      {
        id: `cmi-${Date.now()}-1`,
        model: 'GSX-S1000GX',
        brand: 'Suzuki',
        category: 'Grand Tourer 1000cc',
        currentStockOwn: 2,
        currentStockBinBlocked: 0,
        currentStockBinLiberated: 0,
        month1Commitment: 4,
        month1Purchase: 2,
        month2Commitment: 4,
        month2Purchase: 0,
        month3Commitment: 4,
        month3Purchase: 0,
        suggestedMSRPUnit: 98800.00,
        factoryCostUnit: 77040.00,
        notes: 'Azul YSF'
      },
      {
        id: `cmi-${Date.now()}-2`,
        model: 'V-STROM 800DE',
        brand: 'Suzuki',
        category: 'Big Trail 800cc',
        currentStockOwn: 4,
        currentStockBinBlocked: 1,
        currentStockBinLiberated: 0,
        month1Commitment: 6,
        month1Purchase: 4,
        month2Commitment: 6,
        month2Purchase: 0,
        month3Commitment: 6,
        month3Purchase: 0,
        suggestedMSRPUnit: 67500.00,
        factoryCostUnit: 52500.00,
        notes: 'Amarela YU1'
      }
    ];

    const totalM1 = defaultItems.reduce((s, i) => s + i.month1Purchase, 0);
    const totalEst = defaultItems.reduce((s, i) => s + (i.month1Purchase * i.factoryCostUnit), 0);

    const newPlan: MonthlyCommitmentPlan = {
      id: `cmt-${Date.now()}-${targetDealer.id}`,
      dealershipId: targetDealer.id,
      dealershipName: targetDealer.name,
      legalName: targetDealer.legalName,
      dealerCode: targetDealer.dealerCode,
      brand: defaultBrand,
      period: 'Junho / 2026',
      month1Label: 'MAIO',
      month2Label: 'JUNHO',
      month3Label: 'JULHO',
      regionalComercial: 'KEREN',
      regionalFinanceira: 'LIZA',
      avgMonthlyRegistration: targetDealer.quotaAllocated || 30,
      dealerTier: targetDealer.tier || 'Prata',
      bikesPerInvoice: 4,
      transporterCode: '163',
      originCode: targetDealer.state === 'SP' ? 'A4' : 'S3',
      items: defaultItems,
      status: 'rascunho',
      createdAt: new Date().toLocaleDateString('pt-BR'),
      dealerNotes: 'Planejamento mensal elaborado pela equipe comercial da concessionária.',
      totalUnitsMonth1: totalM1,
      totalUnitsMonth2: 0,
      totalUnitsMonth3: 0,
      totalEstimatedAmount: totalEst
    };

    setEditingCommitment(newPlan);
    setIsCreateModalOpen(true);
  };

  // Submit commitment from Dealership to Factory
  const handleSubmitToFactory = (plan: MonthlyCommitmentPlan) => {
    const updated: MonthlyCommitmentPlan = {
      ...plan,
      status: 'enviado',
      submittedAt: new Date().toLocaleString('pt-BR'),
      submittedBy: currentDealerProfile ? `${currentDealerProfile.manager || 'Diretoria'} (${currentDealerProfile.shortName})` : 'Concessionária'
    };
    onSaveCommitment(updated);
    showToast('Compromisso mensal enviado com sucesso para a Fábrica J. Toledo!');
  };

  // Factory approves commitment
  const handleFactoryApprove = (plan: MonthlyCommitmentPlan) => {
    const updated: MonthlyCommitmentPlan = {
      ...plan,
      status: 'aprovado_fabrica',
      reviewedAt: new Date().toLocaleString('pt-BR'),
      reviewedBy: 'Comitê Comercial & Demanda Grupo J. Toledo',
      factoryNotes: plan.factoryNotes || 'Compromisso mensal aprovado pela fábrica. Base pronta para geração da Ficha de Aprovação JTA+JTZ.'
    };
    onSaveCommitment(updated);
    showToast('Compromisso mensal aprovado pela Montadora!');
  };

  // Lock check helper
  const isCommitmentLocked = useMemo(() => {
    return !isMontadora && activeCommitment?.status === 'aprovado_fabrica';
  }, [isMontadora, activeCommitment?.status]);

  // Update item in active commitment
  const handleUpdateItem = (itemId: string, field: keyof MonthlyCommitmentItem, value: any) => {
    if (!activeCommitment || isCommitmentLocked) return;
    const updatedItems = activeCommitment.items.map(item => {
      if (item.id === itemId) {
        return { ...item, [field]: value };
      }
      return item;
    });

    const totalM1 = updatedItems.reduce((s, i) => s + (Number(i.month1Purchase) || 0), 0);
    const totalEst = updatedItems.reduce((s, i) => s + ((Number(i.month1Purchase) || 0) * i.factoryCostUnit), 0);

    const updatedPlan: MonthlyCommitmentPlan = {
      ...activeCommitment,
      items: updatedItems,
      totalUnitsMonth1: totalM1,
      totalEstimatedAmount: totalEst
    };

    onSaveCommitment(updatedPlan);
  };

  // Add new item row to active commitment
  const handleAddItemToActive = () => {
    if (!activeCommitment || isCommitmentLocked) return;
    const newItem: MonthlyCommitmentItem = {
      id: `cmi-new-${Date.now()}`,
      model: 'NOVO MODELO',
      brand: activeCommitment.brand,
      category: 'Street',
      currentStockOwn: 0,
      currentStockBinBlocked: 0,
      currentStockBinLiberated: 0,
      month1Commitment: 4,
      month1Purchase: 2,
      month2Commitment: 4,
      month2Purchase: 0,
      month3Commitment: 4,
      month3Purchase: 0,
      suggestedMSRPUnit: 20000.00,
      factoryCostUnit: 15000.00,
      notes: ''
    };

    const updatedItems = [...activeCommitment.items, newItem];
    const totalM1 = updatedItems.reduce((s, i) => s + i.month1Purchase, 0);
    const totalEst = updatedItems.reduce((s, i) => s + (i.month1Purchase * i.factoryCostUnit), 0);

    const updatedPlan: MonthlyCommitmentPlan = {
      ...activeCommitment,
      items: updatedItems,
      totalUnitsMonth1: totalM1,
      totalEstimatedAmount: totalEst
    };

    onSaveCommitment(updatedPlan);
    showToast('Novo modelo adicionado à grade de compromisso!');
  };

  // Remove item row
  const handleDeleteItem = (itemId: string) => {
    if (!activeCommitment || isCommitmentLocked) return;
    const updatedItems = activeCommitment.items.filter(i => i.id !== itemId);
    const totalM1 = updatedItems.reduce((s, i) => s + i.month1Purchase, 0);
    const totalEst = updatedItems.reduce((s, i) => s + (i.month1Purchase * i.factoryCostUnit), 0);

    const updatedPlan: MonthlyCommitmentPlan = {
      ...activeCommitment,
      items: updatedItems,
      totalUnitsMonth1: totalM1,
      totalEstimatedAmount: totalEst
    };

    onSaveCommitment(updatedPlan);
    showToast('Modelo removido da grade.');
  };

  // Generate Approval Sheet (Ficha de Aprovação JTA+JTZ) from Commitment
  const handleTriggerGenerateApproval = (plan: MonthlyCommitmentPlan) => {
    onGenerateApprovalProposal(plan);
    showToast(`Ficha de Aprovação JTA+JTZ gerada com sucesso para ${plan.dealershipName}!`);
    if (onNavigateToApprovalDoc) {
      setTimeout(() => {
        onNavigateToApprovalDoc(plan.linkedApprovalProposalId);
      }, 600);
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-emerald-600 text-white px-5 py-3.5 rounded-xl shadow-2xl font-bold text-sm flex items-center gap-3 border border-emerald-400/30 animate-bounce">
          <CheckCircle2 className="w-5 h-5 text-white" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Scope Exclusive Access Banner */}
      {!isMontadora && currentDealerProfile && (
        <div className="bg-gradient-to-r from-blue-50 via-white to-white dark:from-blue-950/80 dark:via-neutral-900 dark:to-neutral-900 border-2 border-blue-300 dark:border-blue-500/40 rounded-2xl p-5 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="p-3 bg-blue-500/20 text-blue-600 dark:text-blue-400 rounded-xl border border-blue-500/30">
              <Lock className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-700 dark:text-blue-300 border border-blue-500/30">
                  Acesso Exclusivo Concessionária
                </span>
                <span className="text-xs text-neutral-500 dark:text-neutral-400">Código Dealer: <strong className="text-neutral-900 dark:text-white">{currentDealerProfile.dealerCode}</strong></span>
              </div>
              <h2 className="text-lg font-bold text-neutral-900 dark:text-white mt-1">
                {currentDealerProfile.name}
              </h2>
              <p className="text-xs text-neutral-600 dark:text-neutral-300 mt-0.5">
                Você está visualizando e editando exclusivamente a base de compromisso mensal de compra da sua loja. Seus dados abastecem diretamente a análise de crédito e a Ficha de Aprovação da Montadora.
              </p>
            </div>
          </div>

          <button
            onClick={handleOpenCreateModal}
            className="w-full md:w-auto px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Criar Novo Compromisso Mensal</span>
          </button>
        </div>
      )}

      {/* Montadora National Overview Header */}
      {isMontadora && (
        <div className="bg-white dark:bg-[#18181b] border border-neutral-200 dark:border-[#27272a] rounded-2xl p-6 shadow-xl flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="p-2.5 bg-amber-500/10 text-amber-600 dark:text-amber-400 rounded-xl border border-amber-500/20">
                <CalendarCheck className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
                  Gestão Nacional de Compromissos de Compra
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-700 dark:text-amber-300 font-bold border border-amber-500/30">
                    Rede Autorizada J. Toledo
                  </span>
                </h2>
                <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                  Central da Montadora para recebimento de compromissos mensais/trimestrais das concessionárias. Base de dados oficial que gera as Fichas de Aprovação JTA+JTZ.
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 w-full lg:w-auto">
            <button
              onClick={handleOpenCreateModal}
              className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-xs flex items-center gap-2 shadow-lg shadow-blue-500/20 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Registrar Compromisso para Dealer</span>
            </button>
          </div>
        </div>
      )}

      {/* KPI Cards Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-[#18181b] border border-neutral-200 dark:border-[#27272a] rounded-2xl p-4 shadow-lg">
          <div className="flex items-center justify-between text-neutral-500 dark:text-neutral-400 mb-2">
            <span className="text-xs font-semibold">Planos de Compromisso</span>
            <CalendarCheck className="w-4 h-4 text-blue-500 dark:text-blue-400" />
          </div>
          <div className="text-2xl font-bold text-neutral-900 dark:text-white">{kpis.totalPlans}</div>
          <div className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-1 flex items-center gap-1">
            <span className="text-emerald-600 dark:text-emerald-400 font-bold">{kpis.approvedCount} aprovados</span> • {kpis.pendingReviewCount} pendentes
          </div>
        </div>

        <div className="bg-white dark:bg-[#18181b] border border-neutral-200 dark:border-[#27272a] rounded-2xl p-4 shadow-lg">
          <div className="flex items-center justify-between text-neutral-500 dark:text-neutral-400 mb-2">
            <span className="text-xs font-semibold">Compra Solicitada (Mês 1)</span>
            <Boxes className="w-4 h-4 text-amber-500 dark:text-amber-400" />
          </div>
          <div className="text-2xl font-bold text-amber-600 dark:text-amber-400">{kpis.totalUnitsM1} <span className="text-sm font-normal text-neutral-500 dark:text-neutral-400">motos</span></div>
          <div className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-1">Faturamento imediato solicitado</div>
        </div>

        <div className="bg-white dark:bg-[#18181b] border border-neutral-200 dark:border-[#27272a] rounded-2xl p-4 shadow-lg">
          <div className="flex items-center justify-between text-neutral-500 dark:text-neutral-400 mb-2">
            <span className="text-xs font-semibold">Projeção Trimestral Total</span>
            <TrendingUp className="w-4 h-4 text-purple-500 dark:text-purple-400" />
          </div>
          <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">{kpis.totalUnitsTrimestre} <span className="text-sm font-normal text-neutral-500 dark:text-neutral-400">motos</span></div>
          <div className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-1">Planejamento fabril (Mês 1+2+3)</div>
        </div>

        <div className="bg-white dark:bg-[#18181b] border border-neutral-200 dark:border-[#27272a] rounded-2xl p-4 shadow-lg">
          <div className="flex items-center justify-between text-neutral-500 dark:text-neutral-400 mb-2">
            <span className="text-xs font-semibold">Volume Financeiro Estimado</span>
            <Coins className="w-4 h-4 text-emerald-500 dark:text-emerald-400" />
          </div>
          <div className="text-xl font-bold text-emerald-600 dark:text-emerald-400">R$ {fmt(kpis.totalFinancial)}</div>
          <div className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-1">Total faturamento fábrica (Custo)</div>
        </div>
      </div>

      {/* Main Grid: Plans Selector + Detail / Editor View */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Side: Plans List & Filtering (4 Cols) */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-white dark:bg-[#18181b] border border-neutral-200 dark:border-[#27272a] rounded-2xl p-4 shadow-xl space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-neutral-900 dark:text-neutral-200 flex items-center gap-2">
                <FileText className="w-4 h-4 text-blue-500 dark:text-blue-400" />
                <span>Compromissos ({displayedCommitments.length})</span>
              </h3>
              {!isMontadora && (
                <button
                  onClick={handleOpenCreateModal}
                  className="p-1.5 bg-blue-500/20 hover:bg-blue-600 text-blue-600 dark:text-blue-400 hover:text-white rounded-lg text-xs font-bold transition-all"
                  title="Novo Compromisso"
                >
                  <Plus className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Search Input */}
            <div className="relative">
              <Search className="w-4 h-4 text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder={isMontadora ? "Buscar concessionária, período..." : "Buscar por período, modelo..."}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 rounded-xl pl-9 pr-3 py-2 text-xs text-neutral-900 dark:text-white placeholder-neutral-400 dark:placeholder-neutral-500 focus:outline-none focus:border-blue-500"
              />
            </div>

            {/* Filters (Brand and Status) */}
            <div className="grid grid-cols-2 gap-2">
              <select
                value={filterBrand}
                onChange={(e) => setFilterBrand(e.target.value)}
                className="bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 rounded-xl px-2.5 py-1.5 text-xs text-neutral-900 dark:text-neutral-300 focus:outline-none"
              >
                <option value="todas">Todas as Marcas</option>
                <option value="Suzuki">Suzuki</option>
                <option value="Haojue">Haojue</option>
                <option value="Zontes">Zontes</option>
              </select>

              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 rounded-xl px-2.5 py-1.5 text-xs text-neutral-900 dark:text-neutral-300 focus:outline-none"
              >
                <option value="todos">Todos os Status</option>
                <option value="rascunho">Rascunho</option>
                <option value="enviado">Enviado Fábrica</option>
                <option value="aprovado_fabrica">Aprovado Fábrica</option>
              </select>
            </div>

            {/* If Montadora, Dealership Filter */}
            {isMontadora && (
              <select
                value={filterDealer}
                onChange={(e) => setFilterDealer(e.target.value)}
                className="w-full bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 rounded-xl px-2.5 py-1.5 text-xs text-neutral-900 dark:text-neutral-300 focus:outline-none"
              >
                <option value="todos">Todas as Concessionárias ({dealerships.length})</option>
                {dealerships.map(d => (
                  <option key={d.id} value={d.id}>{d.name} ({d.dealerCode})</option>
                ))}
              </select>
            )}

            {/* List of Commitment Cards */}
            <div className="space-y-2.5 max-h-[600px] overflow-y-auto pr-1">
              {displayedCommitments.length === 0 ? (
                <div className="text-center py-8 text-neutral-500 text-xs">
                  Nenhum compromisso encontrado com os filtros atuais.
                </div>
              ) : (
                displayedCommitments.map(plan => {
                  const isSelected = activeCommitment?.id === plan.id;
                  return (
                    <div
                      key={plan.id}
                      onClick={() => setSelectedCommitmentId(plan.id)}
                      className={`p-3.5 rounded-xl border transition-all cursor-pointer text-xs space-y-2 ${
                        isSelected
                          ? 'bg-blue-50 dark:bg-blue-950/40 border-blue-500 shadow-md shadow-blue-500/10'
                          : 'bg-neutral-50 dark:bg-neutral-900/80 hover:bg-neutral-100 dark:hover:bg-neutral-800 border-neutral-200 dark:border-neutral-800'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className={`w-2 h-2 rounded-full ${
                            plan.brand === 'Suzuki' ? 'bg-blue-500' : plan.brand === 'Haojue' ? 'bg-amber-500' : 'bg-emerald-500'
                          }`} />
                          <span className="font-bold text-neutral-900 dark:text-white">{plan.period}</span>
                        </div>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                          plan.status === 'aprovado_fabrica'
                            ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30'
                            : plan.status === 'enviado'
                            ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/30'
                            : 'bg-neutral-500/10 text-neutral-600 dark:text-neutral-400 border-neutral-300 dark:border-neutral-700'
                        }`}>
                          {plan.status === 'aprovado_fabrica' ? 'Aprovado Fábrica' : plan.status === 'enviado' ? 'Enviado Fábrica' : 'Rascunho'}
                        </span>
                      </div>

                      <div className="text-neutral-700 dark:text-neutral-300 font-semibold truncate">
                        {plan.dealershipName}
                      </div>

                      <div className="flex items-center justify-between text-[11px] text-neutral-500 dark:text-neutral-400 border-t border-neutral-200 dark:border-neutral-800/80 pt-2">
                        <span>Marca: <strong className="text-neutral-900 dark:text-neutral-200">{plan.brand}</strong></span>
                        <span>Compra Mês 1: <strong className="text-amber-600 dark:text-amber-300">{plan.totalUnitsMonth1} un.</strong></span>
                      </div>

                      {plan.linkedApprovalProposalId && (
                        <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                          <ShieldCheck className="w-3.5 h-3.5" />
                          <span>Ficha JTA/JTZ Gerada</span>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Right Side: Active Commitment Full Working Sheet (8 Cols) */}
        <div className="lg:col-span-8 space-y-6">
          {activeCommitment ? (
            <div className="bg-white dark:bg-[#18181b] border border-neutral-200 dark:border-[#27272a] rounded-2xl p-6 shadow-xl space-y-6">
              
              {/* Top Details & Action Bar */}
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-4 border-b border-neutral-200 dark:border-neutral-800">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-extrabold uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-600 dark:text-blue-300 border border-blue-500/30">
                      {activeCommitment.brand}
                    </span>
                    <span className="text-xs text-neutral-500 dark:text-neutral-400">
                      Período: <strong className="text-neutral-900 dark:text-white">{activeCommitment.period}</strong>
                    </span>
                    <span className="text-xs text-neutral-500 dark:text-neutral-400">
                      Cód.: <strong className="text-neutral-900 dark:text-white">{activeCommitment.dealerCode}</strong>
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-neutral-900 dark:text-white mt-1">
                    {activeCommitment.dealershipName}
                  </h3>
                  <div className="flex flex-wrap items-center gap-3 text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                    <span>Regional Com.: <strong className="text-neutral-800 dark:text-neutral-200">{activeCommitment.regionalComercial}</strong></span>
                    <span>Regional Fin.: <strong className="text-neutral-800 dark:text-neutral-200">{activeCommitment.regionalFinanceira}</strong></span>
                    <span>Média Emplacamento: <strong className="text-neutral-800 dark:text-neutral-200">{activeCommitment.avgMonthlyRegistration} un/mês</strong></span>
                    <span>Bikes/Nota: <strong className="text-neutral-800 dark:text-neutral-200">{activeCommitment.bikesPerInvoice}</strong></span>
                  </div>
                </div>

                {/* Main Action Buttons */}
                <div className="flex flex-wrap items-center gap-2 w-full md:w-auto justify-end">
                  {/* Status Badge */}
                  <div className="flex items-center gap-2">
                    {activeCommitment.status === 'aprovado_fabrica' ? (
                      <span className="px-3 py-1 bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/40 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm">
                        <Lock className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                        <span>Aprovado pela Montadora</span>
                      </span>
                    ) : activeCommitment.status === 'enviado' || activeCommitment.status === 'em_analise' ? (
                      <span className="px-3 py-1 bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/40 rounded-xl text-xs font-bold flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                        <span>Em Análise pela Montadora</span>
                      </span>
                    ) : (
                      <span className="px-3 py-1 bg-neutral-100 dark:bg-neutral-800 text-neutral-500 dark:text-neutral-400 border border-neutral-200 dark:border-neutral-700 rounded-xl text-xs font-bold">
                        Rascunho
                      </span>
                    )}
                  </div>

                  {/* Concessionaria Action: Submit to Factory */}
                  {!isMontadora && activeCommitment.status === 'rascunho' && (
                    <button
                      onClick={() => handleSubmitToFactory(activeCommitment)}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-lg shadow-blue-500/20 transition-all"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Enviar para Fábrica J. Toledo</span>
                    </button>
                  )}

                  {/* Factory Actions: Approve & Generate Approval Document */}
                  {isMontadora && (
                    <>
                      {activeCommitment.status !== 'aprovado_fabrica' && (
                        <button
                          onClick={() => handleFactoryApprove(activeCommitment)}
                          className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-lg shadow-emerald-600/20 transition-all"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Aprovar Compromisso</span>
                        </button>
                      )}

                      <button
                        onClick={() => handleTriggerGenerateApproval(activeCommitment)}
                        className="px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-neutral-950 font-black rounded-xl text-xs flex items-center gap-1.5 shadow-lg shadow-amber-500/20 transition-all"
                        title="Transfere automaticamente estes dados para a Ficha Oficial de Aprovação JTA+JTZ"
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>⚡ Gerar / Sincronizar Ficha JTA+JTZ</span>
                      </button>
                    </>
                  )}

                  {/* Link to Approval Document if already generated */}
                  {activeCommitment.linkedApprovalProposalId && onNavigateToApprovalDoc && (
                    <button
                      onClick={() => onNavigateToApprovalDoc(activeCommitment.linkedApprovalProposalId)}
                      className="px-3 py-2 bg-purple-500/10 hover:bg-purple-500/20 text-purple-700 dark:text-purple-300 border border-purple-500/30 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors"
                    >
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>Ver Ficha Oficial</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Matrix Table: Estoque Atual & Cronograma Trimestral */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Boxes className="w-4 h-4 text-blue-500 dark:text-blue-400" />
                    <h4 className="text-sm font-bold text-neutral-900 dark:text-neutral-200">
                      Grade de Estoque & Compromisso de Compra Trimestral
                    </h4>
                  </div>

                  {isCommitmentLocked ? (
                    <div className="px-3 py-1 bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-600/40 rounded-lg text-xs font-bold flex items-center gap-1.5">
                      <Lock className="w-3.5 h-3.5" />
                      <span>Edição Bloqueada (Aprovado pela Montadora)</span>
                    </div>
                  ) : (
                    <button
                      onClick={handleAddItemToActive}
                      className="px-2.5 py-1 bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-neutral-800 dark:text-neutral-300 rounded-lg text-xs font-semibold border border-neutral-300 dark:border-neutral-700 flex items-center gap-1 transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Adicionar Modelo</span>
                    </button>
                  )}
                </div>

                <div className="overflow-x-auto border border-neutral-200 dark:border-neutral-700 rounded-xl bg-white dark:bg-neutral-900/60">
                  <table className="w-full text-xs text-center border-collapse">
                    <thead>
                      <tr className="bg-neutral-100 dark:bg-neutral-800/90 text-neutral-900 dark:text-neutral-200 font-bold border-b border-neutral-200 dark:border-neutral-700">
                        <th rowSpan={2} className="p-2.5 text-left border-r border-neutral-200 dark:border-neutral-700 min-w-[140px]">MODELO</th>
                        <th colSpan={3} className="p-1.5 border-r border-neutral-200 dark:border-neutral-700 bg-neutral-200/60 dark:bg-neutral-850">ESTOQUE ATUAL</th>
                        <th colSpan={2} className="p-1.5 border-r border-neutral-200 dark:border-neutral-700 bg-blue-100 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300">{activeCommitment.month1Label} (IMEDIATO)</th>
                        <th colSpan={2} className="p-1.5 border-r border-neutral-200 dark:border-neutral-700 bg-neutral-200/60 dark:bg-neutral-850">{activeCommitment.month2Label}</th>
                        <th colSpan={2} className="p-1.5 border-r border-neutral-200 dark:border-neutral-700 bg-neutral-200/60 dark:bg-neutral-850">{activeCommitment.month3Label}</th>
                        <th rowSpan={2} className="p-2 text-right border-r border-neutral-200 dark:border-neutral-700 min-w-[100px]">CUSTO UNIT.</th>
                        <th rowSpan={2} className="p-2 text-center w-10"></th>
                      </tr>
                      <tr className="bg-neutral-50 dark:bg-neutral-850 text-[11px] text-neutral-500 dark:text-neutral-400 font-semibold border-b border-neutral-200 dark:border-neutral-700">
                        <th className="p-1 border-r border-neutral-200 dark:border-neutral-700">Próprio</th>
                        <th className="p-1 border-r border-neutral-200 dark:border-neutral-700">BIN Bloq</th>
                        <th className="p-1 border-r border-neutral-200 dark:border-neutral-700">BIN Lib</th>
                        <th className="p-1 border-r border-neutral-200 dark:border-neutral-700 text-blue-600 dark:text-blue-400">Comprom.</th>
                        <th className="p-1 border-r border-neutral-200 dark:border-neutral-700 text-amber-600 dark:text-amber-300 font-bold">Compra</th>
                        <th className="p-1 border-r border-neutral-200 dark:border-neutral-700">Comprom.</th>
                        <th className="p-1 border-r border-neutral-200 dark:border-neutral-700">Compra</th>
                        <th className="p-1 border-r border-neutral-200 dark:border-neutral-700">Comprom.</th>
                        <th className="p-1 border-r border-neutral-200 dark:border-neutral-700">Compra</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800">
                      {activeCommitment.items.map((item) => (
                        <tr key={item.id} className="hover:bg-neutral-50 dark:hover:bg-neutral-800/40 transition-colors">
                          {/* Model name */}
                          <td className="p-2 text-left font-bold text-neutral-900 dark:text-white border-r border-neutral-200 dark:border-neutral-700">
                            <input
                              type="text"
                              disabled={isCommitmentLocked}
                              value={item.model}
                              onChange={(e) => handleUpdateItem(item.id, 'model', e.target.value)}
                              className="bg-transparent border-b border-transparent hover:border-neutral-400 dark:hover:border-neutral-600 focus:border-blue-500 text-neutral-900 dark:text-white font-bold w-full focus:outline-none disabled:opacity-75 disabled:cursor-not-allowed"
                            />
                            {item.notes && (
                              <div className="text-[10px] text-neutral-500 font-normal truncate">{item.notes}</div>
                            )}
                          </td>

                          {/* Estoque Atual: Próprio */}
                          <td className="p-1 border-r border-neutral-200 dark:border-neutral-700">
                            <input
                              type="number"
                              disabled={isCommitmentLocked}
                              value={item.currentStockOwn}
                              onChange={(e) => handleUpdateItem(item.id, 'currentStockOwn', Number(e.target.value))}
                              className="w-12 bg-neutral-50 dark:bg-neutral-950/70 border border-neutral-300 dark:border-neutral-700 rounded px-1.5 py-1 text-center text-neutral-900 dark:text-white focus:outline-none focus:border-blue-500 disabled:opacity-60 disabled:cursor-not-allowed"
                            />
                          </td>

                          {/* Estoque Atual: BIN Bloq */}
                          <td className="p-1 border-r border-neutral-200 dark:border-neutral-700">
                            <input
                              type="number"
                              disabled={isCommitmentLocked}
                              value={item.currentStockBinBlocked}
                              onChange={(e) => handleUpdateItem(item.id, 'currentStockBinBlocked', Number(e.target.value))}
                              className="w-12 bg-neutral-50 dark:bg-neutral-950/70 border border-neutral-300 dark:border-neutral-700 rounded px-1.5 py-1 text-center text-amber-600 dark:text-amber-300 focus:outline-none focus:border-blue-500 disabled:opacity-60 disabled:cursor-not-allowed"
                            />
                          </td>

                          {/* Estoque Atual: BIN Lib */}
                          <td className="p-1 border-r border-neutral-200 dark:border-neutral-700">
                            <input
                              type="number"
                              disabled={isCommitmentLocked}
                              value={item.currentStockBinLiberated}
                              onChange={(e) => handleUpdateItem(item.id, 'currentStockBinLiberated', Number(e.target.value))}
                              className="w-12 bg-neutral-50 dark:bg-neutral-950/70 border border-neutral-300 dark:border-neutral-700 rounded px-1.5 py-1 text-center text-emerald-600 dark:text-emerald-300 focus:outline-none focus:border-blue-500 disabled:opacity-60 disabled:cursor-not-allowed"
                            />
                          </td>

                          {/* Mês 1: Compromisso */}
                          <td className="p-1 border-r border-neutral-200 dark:border-neutral-700 bg-blue-50/50 dark:bg-blue-950/20">
                            <input
                              type="number"
                              disabled={isCommitmentLocked}
                              value={item.month1Commitment}
                              onChange={(e) => handleUpdateItem(item.id, 'month1Commitment', Number(e.target.value))}
                              className="w-12 bg-neutral-50 dark:bg-neutral-950/70 border border-blue-300 dark:border-blue-800/60 rounded px-1.5 py-1 text-center text-blue-700 dark:text-blue-200 font-semibold focus:outline-none focus:border-blue-500 disabled:opacity-60 disabled:cursor-not-allowed"
                            />
                          </td>

                          {/* Mês 1: Compra Solicitada (Imediata) */}
                          <td className="p-1 border-r border-neutral-200 dark:border-neutral-700 bg-blue-50/50 dark:bg-blue-950/20">
                            <input
                              type="number"
                              disabled={isCommitmentLocked}
                              value={item.month1Purchase}
                              onChange={(e) => handleUpdateItem(item.id, 'month1Purchase', Number(e.target.value))}
                              className="w-12 bg-amber-100 dark:bg-amber-500/20 border border-amber-400 dark:border-amber-500/60 rounded px-1.5 py-1 text-center text-amber-800 dark:text-amber-300 font-extrabold focus:outline-none focus:border-amber-400 disabled:opacity-60 disabled:cursor-not-allowed"
                            />
                          </td>

                          {/* Mês 2: Compromisso */}
                          <td className="p-1 border-r border-neutral-200 dark:border-neutral-700">
                            <input
                              type="number"
                              disabled={isCommitmentLocked}
                              value={item.month2Commitment}
                              onChange={(e) => handleUpdateItem(item.id, 'month2Commitment', Number(e.target.value))}
                              className="w-12 bg-neutral-50 dark:bg-neutral-950/70 border border-neutral-300 dark:border-neutral-700 rounded px-1.5 py-1 text-center text-neutral-900 dark:text-neutral-300 focus:outline-none focus:border-blue-500 disabled:opacity-60 disabled:cursor-not-allowed"
                            />
                          </td>

                          {/* Mês 2: Compra */}
                          <td className="p-1 border-r border-neutral-200 dark:border-neutral-700">
                            <input
                              type="number"
                              disabled={isCommitmentLocked}
                              value={item.month2Purchase}
                              onChange={(e) => handleUpdateItem(item.id, 'month2Purchase', Number(e.target.value))}
                              className="w-12 bg-neutral-50 dark:bg-neutral-950/70 border border-neutral-300 dark:border-neutral-700 rounded px-1.5 py-1 text-center text-neutral-900 dark:text-neutral-300 focus:outline-none focus:border-blue-500 disabled:opacity-60 disabled:cursor-not-allowed"
                            />
                          </td>

                          {/* Mês 3: Compromisso */}
                          <td className="p-1 border-r border-neutral-200 dark:border-neutral-700">
                            <input
                              type="number"
                              disabled={isCommitmentLocked}
                              value={item.month3Commitment}
                              onChange={(e) => handleUpdateItem(item.id, 'month3Commitment', Number(e.target.value))}
                              className="w-12 bg-neutral-50 dark:bg-neutral-950/70 border border-neutral-300 dark:border-neutral-700 rounded px-1.5 py-1 text-center text-neutral-900 dark:text-neutral-300 focus:outline-none focus:border-blue-500 disabled:opacity-60 disabled:cursor-not-allowed"
                            />
                          </td>

                          {/* Mês 3: Compra */}
                          <td className="p-1 border-r border-neutral-200 dark:border-neutral-700">
                            <input
                              type="number"
                              disabled={isCommitmentLocked}
                              value={item.month3Purchase}
                              onChange={(e) => handleUpdateItem(item.id, 'month3Purchase', Number(e.target.value))}
                              className="w-12 bg-neutral-50 dark:bg-neutral-950/70 border border-neutral-300 dark:border-neutral-700 rounded px-1.5 py-1 text-center text-neutral-900 dark:text-neutral-300 focus:outline-none focus:border-blue-500 disabled:opacity-60 disabled:cursor-not-allowed"
                            />
                          </td>

                          {/* Custo Unitário */}
                          <td className="p-2 text-right border-r border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-neutral-300 font-semibold">
                            R$ {fmt(item.factoryCostUnit)}
                          </td>

                          {/* Delete Item */}
                          <td className="p-1 text-center">
                            {!isCommitmentLocked && (
                              <button
                                onClick={() => handleDeleteItem(item.id)}
                                className="p-1 text-neutral-500 hover:text-red-500 transition-colors"
                                title="Remover modelo"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}

                      {/* TOTAL ROW */}
                      <tr className="bg-neutral-100 dark:bg-neutral-800/90 font-extrabold text-neutral-900 dark:text-white border-t-2 border-neutral-300 dark:border-neutral-600">
                        <td className="p-2.5 text-left border-r border-neutral-200 dark:border-neutral-700">TOTAL:</td>
                        <td className="p-2 border-r border-neutral-200 dark:border-neutral-700">{activePlanTotals.ownStock}</td>
                        <td className="p-2 border-r border-neutral-200 dark:border-neutral-700 text-amber-600 dark:text-amber-300">{activePlanTotals.binBloq}</td>
                        <td className="p-2 border-r border-neutral-200 dark:border-neutral-700 text-emerald-600 dark:text-emerald-300">{activePlanTotals.binLib}</td>
                        <td className="p-2 border-r border-neutral-200 dark:border-neutral-700 text-blue-600 dark:text-blue-300">{activePlanTotals.m1Comp}</td>
                        <td className="p-2 border-r border-neutral-200 dark:border-neutral-700 text-amber-600 dark:text-amber-400 text-sm font-black">{activePlanTotals.m1Pur}</td>
                        <td className="p-2 border-r border-neutral-200 dark:border-neutral-700">{activePlanTotals.m2Comp}</td>
                        <td className="p-2 border-r border-neutral-200 dark:border-neutral-700">{activePlanTotals.m3Comp}</td>
                        <td className="p-2 border-r border-neutral-200 dark:border-neutral-700">{activePlanTotals.m3Pur}</td>
                        <td className="p-2 text-right border-r border-neutral-700 text-emerald-400 font-black">
                          R$ {fmt(activePlanTotals.totalAmount)}
                        </td>
                        <td></td>
                      </tr>

                      {/* TOTAL GERAL ESTOQUE ROW */}
                      <tr className="bg-neutral-850 font-bold text-neutral-700 dark:text-neutral-300 border-t border-neutral-700">
                        <td className="p-2 text-left border-r border-neutral-700">TOTAL GERAL ESTOQUE:</td>
                        <td colSpan={3} className="p-2 text-left pl-3 border-r border-neutral-700 text-blue-400 font-extrabold">
                          {activePlanTotals.totalGeneralStock} unidades
                        </td>
                        <td colSpan={8} className="p-2 text-right text-xs text-neutral-500 dark:text-neutral-400 pr-3">
                          Total Projetado Mês 1: <strong className="text-white">{activePlanTotals.m1Pur} motos</strong> | Valor Estimado: <strong className="text-emerald-400">R$ {fmt(activePlanTotals.totalAmount)}</strong>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Notes & Workflow Section */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                {/* Concessionaria Notes */}
                <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-3.5 space-y-2">
                  <span className="font-bold text-neutral-700 dark:text-neutral-300 flex items-center gap-1.5">
                    <Edit3 className="w-3.5 h-3.5 text-blue-400" />
                    <span>Observações da Concessionária</span>
                  </span>
                  <textarea
                    rows={3}
                    disabled={isCommitmentLocked}
                    value={activeCommitment.dealerNotes || ''}
                    onChange={(e) => {
                      onSaveCommitment({
                        ...activeCommitment,
                        dealerNotes: e.target.value
                      });
                    }}
                    placeholder="Informações adicionais sobre demanda regional, cores ou prazos..."
                    className="w-full bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-lg p-2 text-neutral-200 focus:outline-none focus:border-blue-500 text-xs disabled:opacity-70 disabled:cursor-not-allowed"
                  />
                  {activeCommitment.submittedAt && (
                    <div className="text-[10px] text-neutral-500">
                      Submetido em {activeCommitment.submittedAt} por {activeCommitment.submittedBy || 'Concessionária'}
                    </div>
                  )}
                </div>

                {/* Factory Notes & Review */}
                <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-3.5 space-y-2">
                  <span className="font-bold text-neutral-700 dark:text-neutral-300 flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                    <span>Parecer da Fábrica Grupo J. Toledo</span>
                  </span>
                  <textarea
                    rows={3}
                    disabled={!isMontadora}
                    value={activeCommitment.factoryNotes || ''}
                    onChange={(e) => {
                      onSaveCommitment({
                        ...activeCommitment,
                        factoryNotes: e.target.value
                      });
                    }}
                    placeholder={isMontadora ? "Inserir parecer da Regional Comercial ou Comitê de Demanda..." : "Aguardando avaliação da montadora."}
                    className="w-full bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-lg p-2 text-neutral-200 focus:outline-none focus:border-amber-500 text-xs disabled:opacity-70"
                  />
                  {activeCommitment.reviewedAt && (
                    <div className="text-[10px] text-emerald-400 font-semibold">
                      ✓ Avaliado em {activeCommitment.reviewedAt} por {activeCommitment.reviewedBy}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-[#18181b] border border-[#27272a] rounded-2xl p-12 text-center text-neutral-500 text-sm">
              Selecione um plano de compromisso na lista ao lado ou crie um novo.
            </div>
          )}
        </div>
      </div>

      {/* Modal: Criar Novo Compromisso Mensal */}
      {isCreateModalOpen && editingCommitment && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-[#18181b] border border-[#27272a] rounded-2xl p-6 max-w-2xl w-full space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-neutral-200 dark:border-neutral-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <CalendarCheck className="w-5 h-5 text-blue-400" />
                <span>Novo Compromisso de Compra Mensal</span>
              </h3>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="text-neutral-500 dark:text-neutral-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              {/* Concessionaria Selector if Montadora */}
              {isMontadora ? (
                <div className="md:col-span-2">
                  <label className="text-neutral-500 dark:text-neutral-400 font-semibold block mb-1">Concessionária Titular</label>
                  <select
                    value={editingCommitment.dealershipId}
                    onChange={(e) => {
                      const selDealer = dealerships.find(d => d.id === e.target.value);
                      if (selDealer) {
                        setEditingCommitment({
                          ...editingCommitment,
                          dealershipId: selDealer.id,
                          dealershipName: selDealer.name,
                          legalName: selDealer.legalName,
                          dealerCode: selDealer.dealerCode,
                          dealerTier: selDealer.tier || 'Prata',
                          avgMonthlyRegistration: selDealer.quotaAllocated || 30
                        });
                      }
                    }}
                    className="w-full bg-white dark:bg-neutral-900 border border-neutral-700 rounded-xl px-3 py-2 text-white font-bold"
                  >
                    {dealerships.map(d => (
                      <option key={d.id} value={d.id}>{d.name} ({d.dealerCode})</option>
                    ))}
                  </select>
                </div>
              ) : (
                <div className="md:col-span-2 bg-white dark:bg-neutral-900/80 p-3 rounded-xl border border-neutral-200 dark:border-neutral-800">
                  <span className="text-neutral-500 dark:text-neutral-400 block text-[11px]">Concessionária:</span>
                  <span className="font-bold text-white text-sm">{editingCommitment.dealershipName}</span>
                </div>
              )}

              <div>
                <label className="text-neutral-500 dark:text-neutral-400 font-semibold block mb-1">Marca</label>
                <select
                  value={editingCommitment.brand}
                  onChange={(e) => setEditingCommitment({ ...editingCommitment, brand: e.target.value as BrandType })}
                  className="w-full bg-white dark:bg-neutral-900 border border-neutral-700 rounded-xl px-3 py-2 text-white font-bold"
                >
                  <option value="Suzuki">Suzuki</option>
                  <option value="Haojue">Haojue</option>
                  <option value="Zontes">Zontes</option>
                </select>
              </div>

              <div>
                <label className="text-neutral-500 dark:text-neutral-400 font-semibold block mb-1">Período / Trimestre de Referência</label>
                <select
                  value={editingCommitment.period}
                  onChange={(e) => {
                    const selectedQ = e.target.value;
                    let m1 = 'JANEIRO', m2 = 'FEVEREIRO', m3 = 'MARÇO';
                    if (selectedQ.includes('2º Trimestre')) {
                      m1 = 'ABRIL'; m2 = 'MAIO'; m3 = 'JUNHO';
                    } else if (selectedQ.includes('3º Trimestre')) {
                      m1 = 'JULHO'; m2 = 'AGOSTO'; m3 = 'SETEMBRO';
                    } else if (selectedQ.includes('4º Trimestre')) {
                      m1 = 'OUTUBRO'; m2 = 'NOVEMBRO'; m3 = 'DEZEMBRO';
                    }
                    setEditingCommitment({
                      ...editingCommitment,
                      period: selectedQ,
                      month1Label: m1,
                      month2Label: m2,
                      month3Label: m3
                    });
                  }}
                  className="w-full bg-white dark:bg-neutral-900 border border-neutral-700 rounded-xl px-3 py-2 text-white font-bold"
                >
                  <option value="1º Trimestre (Jan / Fev / Mar)">1º Trimestre (Janeiro, Fevereiro, Março)</option>
                  <option value="2º Trimestre (Abr / Mai / Jun)">2º Trimestre (Abril, Maio, Junho)</option>
                  <option value="3º Trimestre (Jul / Ago / Set)">3º Trimestre (Julho, Agosto, Setembro)</option>
                  <option value="4º Trimestre (Out / Nov / Dez)">4º Trimestre (Outubro, Novembro, Dezembro)</option>
                </select>
              </div>

              <div>
                <label className="text-neutral-500 dark:text-neutral-400 font-semibold block mb-1">Meses do Trimestre</label>
                <div className="grid grid-cols-3 gap-2">
                  <div className="bg-white dark:bg-neutral-900 border border-neutral-700 rounded-xl px-2 py-1.5 text-center text-xs font-bold text-blue-400">
                    1º Mês: {editingCommitment.month1Label}
                  </div>
                  <div className="bg-white dark:bg-neutral-900 border border-neutral-700 rounded-xl px-2 py-1.5 text-center text-xs font-bold text-amber-400">
                    2º Mês: {editingCommitment.month2Label}
                  </div>
                  <div className="bg-white dark:bg-neutral-900 border border-neutral-700 rounded-xl px-2 py-1.5 text-center text-xs font-bold text-purple-400">
                    3º Mês: {editingCommitment.month3Label}
                  </div>
                </div>
              </div>

              <div className="md:col-span-2">
                <label className="text-neutral-500 dark:text-neutral-400 font-semibold block mb-1">Observações Iniciais</label>
                <textarea
                  rows={2}
                  value={editingCommitment.dealerNotes || ''}
                  onChange={(e) => setEditingCommitment({ ...editingCommitment, dealerNotes: e.target.value })}
                  className="w-full bg-white dark:bg-neutral-900 border border-neutral-700 rounded-xl p-2 text-white"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-neutral-200 dark:border-neutral-800">
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-700 dark:text-neutral-300 font-bold rounded-xl text-xs"
              >
                Cancelar
              </button>
              <button
                onClick={() => {
                  onSaveCommitment(editingCommitment);
                  setSelectedCommitmentId(editingCommitment.id);
                  setIsCreateModalOpen(false);
                  showToast('Plano de compromisso criado! Agora configure os modelos e quantidades na grade.');
                }}
                className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-xs shadow-lg shadow-blue-500/20"
              >
                Criar Grade de Compromisso
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
