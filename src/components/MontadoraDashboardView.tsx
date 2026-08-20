import React, { useState, useMemo } from 'react';
import { 
  InventoryItem, 
  RecentSale, 
  ServiceOrder, 
  PipelineCard, 
  TransitOrder, 
  DealershipProfile,
  DealershipScope,
  NavTab,
  BrazilRegion,
  DealerTier,
  FactoryOrder
} from '../types';
import { DEALERSHIP_PROFILES } from '../data/mockData';
import { 
  Factory, 
  Building2, 
  TrendingUp, 
  Truck, 
  Bike, 
  Wrench, 
  CreditCard, 
  Users, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  ChevronRight, 
  ExternalLink,
  ShieldCheck,
  Zap,
  DollarSign,
  Layers,
  ArrowUpRight,
  Filter,
  BarChart3,
  PieChart,
  Boxes,
  Compass,
  Search,
  SlidersHorizontal,
  LayoutGrid,
  TableProperties,
  Award,
  Globe2,
  Phone,
  Mail,
  X,
  Plus,
  Check,
  FileSpreadsheet
} from 'lucide-react';

interface MontadoraDashboardViewProps {
  inventory: InventoryItem[];
  recentSales: RecentSale[];
  serviceOrders: ServiceOrder[];
  pipelineCards: PipelineCard[];
  transitOrders: TransitOrder[];
  factoryOrders?: FactoryOrder[];
  onSelectDealership: (scope: DealershipScope) => void;
  onNavigate: (tab: NavTab) => void;
}

export const MontadoraDashboardView: React.FC<MontadoraDashboardViewProps> = ({
  inventory,
  recentSales,
  serviceOrders,
  pipelineCards,
  transitOrders,
  factoryOrders = [],
  onSelectDealership,
  onNavigate
}) => {
  // Filters & State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRegion, setSelectedRegion] = useState<string>('todas');
  const [selectedTier, setSelectedTier] = useState<string>('todos');
  const [selectedPerformance, setSelectedPerformance] = useState<string>('todos');
  const [sortBy, setSortBy] = useState<'sales' | 'targetPercent' | 'stock' | 'credit' | 'leads'>('sales');
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');

  // Modals & Details
  const [auditDealer, setAuditDealer] = useState<DealershipProfile | null>(null);
  const [selectedBatchModal, setSelectedBatchModal] = useState<TransitOrder | null>(null);
  const [creditAdjustmentDealer, setCreditAdjustmentDealer] = useState<DealershipProfile | null>(null);
  const [newCreditAmount, setNewCreditAmount] = useState('');
  const [quotaDealer, setQuotaDealer] = useState<DealershipProfile | null>(null);
  const [extraQuotaUnits, setExtraQuotaUnits] = useState('5');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Get all registered authorized dealerships (excluding Montadora itself)
  const dealershipsList = useMemo(() => {
    return Object.values(DEALERSHIP_PROFILES).filter(p => p.type === 'concessionaria');
  }, []);

  // Compute stats for every dealership dynamically
  const computedDealers = useMemo(() => {
    return dealershipsList.map(profile => {
      const dealerSales = recentSales.filter(s => s.dealershipId === profile.id);
      const salesRevenue = dealerSales.reduce((acc, s) => acc + s.price, 0);
      const unitsSold = dealerSales.length;
      
      const dealerStock = inventory.filter(i => i.dealershipId === profile.id && i.status !== 'vendido');
      const stockCount = dealerStock.length;
      const stockValue = dealerStock.reduce((acc, i) => acc + i.retailPrice, 0);
      const stockCostValue = dealerStock.reduce((acc, i) => acc + i.costPrice, 0);

      const dealerPipeline = pipelineCards.filter(p => p.dealershipId === profile.id);
      const leadsCount = dealerPipeline.length;
      const pipelineValue = dealerPipeline.reduce((acc, p) => acc + p.value, 0);

      const dealerOS = serviceOrders.filter(o => o.dealershipId === profile.id);
      const osCount = dealerOS.length;
      const osCompleted = dealerOS.filter(o => o.status === 'finalizado').length;
      const waitingParts = dealerOS.filter(o => o.status === 'aguardando_pecas').length;

      const target = profile.monthlyTarget || 1000000;
      const targetPercent = Math.min(150, Math.round((salesRevenue / target) * 100));

      const creditLimit = profile.creditLimit || 2000000;
      const creditUsed = profile.creditUsed || 1000000;
      const creditUsagePercent = Math.round((creditUsed / creditLimit) * 100);

      const quotaAllocated = profile.quotaAllocated || 20;
      const quotaOrdered = profile.quotaOrdered || 15;

      return {
        profile,
        salesRevenue,
        unitsSold,
        stockCount,
        stockValue,
        stockCostValue,
        leadsCount,
        pipelineValue,
        osCount,
        osCompleted,
        waitingParts,
        targetPercent,
        creditLimit,
        creditUsed,
        creditUsagePercent,
        quotaAllocated,
        quotaOrdered
      };
    });
  }, [dealershipsList, recentSales, inventory, pipelineCards, serviceOrders]);

  // Consolidated National Metrics
  const totalNationalSalesRevenue = computedDealers.reduce((acc, d) => acc + d.salesRevenue, 0);
  const totalNationalSalesTarget = computedDealers.reduce((acc, d) => acc + d.profile.monthlyTarget, 0);
  const totalNationalTargetPercent = Math.round((totalNationalSalesRevenue / (totalNationalSalesTarget || 1)) * 100);

  const totalNationalStockCount = computedDealers.reduce((acc, d) => acc + d.stockCount, 0);
  const totalNationalStockValue = computedDealers.reduce((acc, d) => acc + d.stockValue, 0);

  const totalNationalPipelineValue = computedDealers.reduce((acc, d) => acc + d.pipelineValue, 0);
  const totalNationalLeads = computedDealers.reduce((acc, d) => acc + d.leadsCount, 0);

  const totalNationalOS = computedDealers.reduce((acc, d) => acc + d.osCount, 0);
  const totalWaitingPartsOS = computedDealers.reduce((acc, d) => acc + d.waitingParts, 0);

  const totalTransitUnits = transitOrders.reduce((acc, t) => acc + (t.unitsCount || 3), 0);
  const totalTransitValue = transitOrders.reduce((acc, t) => acc + (t.value || 150000), 0);

  // Regional breakdown statistics
  const regions: BrazilRegion[] = ['Sudeste', 'Sul', 'Centro-Oeste', 'Nordeste', 'Norte'];
  
  const regionalSummary = useMemo(() => {
    return regions.map(reg => {
      const dealersInRegion = computedDealers.filter(d => d.profile.region === reg);
      const storeCount = dealersInRegion.length;
      const sales = dealersInRegion.reduce((acc, d) => acc + d.salesRevenue, 0);
      const target = dealersInRegion.reduce((acc, d) => acc + d.profile.monthlyTarget, 0);
      const targetPercent = target > 0 ? Math.round((sales / target) * 100) : 0;
      const stock = dealersInRegion.reduce((acc, d) => acc + d.stockCount, 0);
      const leads = dealersInRegion.reduce((acc, d) => acc + d.leadsCount, 0);

      return {
        region: reg,
        storeCount,
        sales,
        target,
        targetPercent,
        stock,
        leads
      };
    });
  }, [computedDealers]);

  // Filtered & Sorted Dealers
  const filteredDealers = useMemo(() => {
    return computedDealers.filter(d => {
      const p = d.profile;
      const matchesSearch = 
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.state.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.cnpj.includes(searchQuery) ||
        p.manager.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesRegion = selectedRegion === 'todas' || p.region === selectedRegion;
      const matchesTier = selectedTier === 'todos' || p.tier === selectedTier;

      let matchesPerf = true;
      if (selectedPerformance === 'batida') matchesPerf = d.targetPercent >= 100;
      if (selectedPerformance === 'ritmo') matchesPerf = d.targetPercent >= 75 && d.targetPercent < 100;
      if (selectedPerformance === 'atencao') matchesPerf = d.targetPercent < 75;

      return matchesSearch && matchesRegion && matchesTier && matchesPerf;
    }).sort((a, b) => {
      if (sortBy === 'sales') return b.salesRevenue - a.salesRevenue;
      if (sortBy === 'targetPercent') return b.targetPercent - a.targetPercent;
      if (sortBy === 'stock') return b.stockCount - a.stockCount;
      if (sortBy === 'credit') return b.creditUsagePercent - a.creditUsagePercent;
      if (sortBy === 'leads') return b.leadsCount - a.leadsCount;
      return 0;
    });
  }, [computedDealers, searchQuery, selectedRegion, selectedTier, selectedPerformance, sortBy]);

  // Top performers & Attention alert lists
  const topPerformers = useMemo(() => {
    return [...computedDealers].sort((a, b) => b.targetPercent - a.targetPercent).slice(0, 3);
  }, [computedDealers]);

  const attentionDealers = useMemo(() => {
    return computedDealers.filter(d => d.targetPercent < 75 || d.creditUsagePercent > 80);
  }, [computedDealers]);

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-16">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-6 right-6 z-50 bg-blue-600 text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3 border border-blue-400 font-bold text-[13px] animate-in slide-in-from-top duration-200">
          <CheckCircle2 className="w-5 h-5 text-white" />
          {toastMessage}
        </div>
      )}

      {/* Montadora Cockpit Executive Hero Banner */}
      <div className="bg-gradient-to-r from-blue-950/90 via-[#18181b] to-indigo-950/80 border border-blue-900/50 rounded-3xl p-6 md:p-8 shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="bg-blue-500/20 text-blue-400 border border-blue-500/30 text-[10px] uppercase font-bold tracking-widest px-3 py-1 rounded-full flex items-center gap-1.5">
                <Factory className="w-3.5 h-3.5" />
                Montadora Oficial • J. Toledo da Amazônia
              </span>
              <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] uppercase font-bold tracking-widest px-3 py-1 rounded-full flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5" />
                {dealershipsList.length} Concessionárias Conectadas
              </span>
            </div>

            <h2 className="text-[26px] md:text-[34px] font-bold text-[#fafafa] tracking-tight">
              Cockpit Geral da Montadora
            </h2>
            <p className="text-[13px] text-neutral-300 max-w-2xl mt-1">
              Visão macro-executiva escalável para gestão de rede nacional autorizada <strong>Suzuki</strong>, <strong>Haojue</strong>, <strong>Zontes</strong>, <strong>Hisun</strong> e <strong>Kymco</strong> no Brasil com controle de faturamento, cotas, risco de crédito e pós-venda.
            </p>
          </div>

          {/* Quick Filter Info & Direct Store Jumper */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <div className="bg-neutral-900/80 border border-neutral-800 p-3 rounded-2xl flex items-center gap-3">
              <div className="p-2 bg-blue-600/20 text-blue-400 rounded-xl">
                <Globe2 className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] text-neutral-400 uppercase font-bold block">Rede Autorizada</span>
                <span className="text-[14px] font-bold text-white font-tabular">{dealershipsList.length} Unidades (5 Regiões)</span>
              </div>
            </div>

            <button
              onClick={() => onNavigate('dealers_network')}
              className="bg-neutral-900/90 hover:bg-neutral-800 text-neutral-200 hover:text-white border border-neutral-700 hover:border-blue-500 font-bold px-4 py-3 rounded-2xl text-[12px] flex items-center justify-center gap-2 transition-all shadow-md"
            >
              <Building2 className="w-4 h-4 text-blue-400" />
              <span>Gestão de Concessionárias</span>
            </button>

            <button
              onClick={() => onNavigate('purchase')}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold px-4 py-3 rounded-2xl text-[12px] flex items-center justify-center gap-2 transition-all shadow-lg shadow-blue-500/20"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>Pedidos da Rede & ERP</span>
              {factoryOrders.filter(o => !o.protheusIntegrated).length > 0 && (
                <span className="bg-amber-400 text-neutral-950 text-[10px] font-extrabold px-1.5 py-0.2 rounded-full">
                  {factoryOrders.filter(o => !o.protheusIntegrated).length}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* 5 Macro Executive KPI Cards (Bento Grid) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* KPI 1: Faturamento Nacional */}
        <div className="bg-[#18181b] border border-[#27272a] rounded-3xl p-5 shadow-sm hover:border-blue-500/40 transition-colors">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] uppercase font-bold text-neutral-400 tracking-wider">Faturamento Nacional</span>
            <div className="p-2 bg-blue-500/10 text-blue-400 rounded-xl border border-blue-500/20">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <p className="text-[20px] font-bold text-[#fafafa] font-tabular tracking-tight">
            R$ {totalNationalSalesRevenue.toLocaleString('pt-BR')}
          </p>
          <div className="mt-2 space-y-1">
            <div className="flex justify-between text-[11px] text-neutral-400 font-tabular">
              <span>Meta: R$ {(totalNationalSalesTarget / 1000000).toFixed(1)}M</span>
              <span className="font-bold text-blue-400">{totalNationalTargetPercent}%</span>
            </div>
            <div className="w-full h-1.5 bg-neutral-800 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-blue-600 to-cyan-400 rounded-full" 
                style={{ width: `${Math.min(100, totalNationalTargetPercent)}%` }}
              />
            </div>
          </div>
        </div>

        {/* KPI 2: Estoque Consolidado na Rede */}
        <div className="bg-[#18181b] border border-[#27272a] rounded-3xl p-5 shadow-sm hover:border-blue-500/40 transition-colors">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] uppercase font-bold text-neutral-400 tracking-wider">Estoque no Pátio (Rede)</span>
            <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-xl border border-emerald-500/20">
              <Bike className="w-4 h-4" />
            </div>
          </div>
          <p className="text-[20px] font-bold text-[#fafafa] font-tabular tracking-tight">
            {totalNationalStockCount} <span className="text-[13px] font-normal text-neutral-400">motos</span>
          </p>
          <p className="text-[11px] text-neutral-400 mt-2 font-tabular">
            Imobilizado: <strong className="text-white">R$ {(totalNationalStockValue / 1000).toLocaleString('pt-BR')}k</strong>
          </p>
        </div>

        {/* KPI 3: Pipeline Comercial Nacional */}
        <div className="bg-[#18181b] border border-[#27272a] rounded-3xl p-5 shadow-sm hover:border-blue-500/40 transition-colors">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] uppercase font-bold text-neutral-400 tracking-wider">Pipeline de Vendas</span>
            <div className="p-2 bg-purple-500/10 text-purple-400 rounded-xl border border-purple-500/20">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <p className="text-[20px] font-bold text-[#fafafa] font-tabular tracking-tight">
            R$ {(totalNationalPipelineValue / 1000).toLocaleString('pt-BR')}k
          </p>
          <p className="text-[11px] text-neutral-400 mt-2 font-tabular">
            {totalNationalLeads} oportunidades quentes em negociação
          </p>
        </div>

        {/* KPI 4: Garantias & Oficina Nacional */}
        <div className="bg-[#18181b] border border-[#27272a] rounded-3xl p-5 shadow-sm hover:border-blue-500/40 transition-colors">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] uppercase font-bold text-neutral-400 tracking-wider">Oficina & Garantias</span>
            <div className="p-2 bg-amber-500/10 text-amber-400 rounded-xl border border-amber-500/20">
              <Wrench className="w-4 h-4" />
            </div>
          </div>
          <p className="text-[20px] font-bold text-[#fafafa] font-tabular tracking-tight">
            {totalNationalOS} <span className="text-[13px] font-normal text-neutral-400">O.S. ativas</span>
          </p>
          <p className="text-[11px] text-amber-400 mt-2 font-tabular flex items-center gap-1">
            <AlertTriangle className="w-3.5 h-3.5" />
            {totalWaitingPartsOS} aguardando peças de fábrica
          </p>
        </div>

        {/* KPI 5: Logística de Lotes de Fábrica */}
        <div className="bg-[#18181b] border border-[#27272a] rounded-3xl p-5 shadow-sm hover:border-blue-500/40 transition-colors">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] uppercase font-bold text-neutral-400 tracking-wider">Lotes em Transporte</span>
            <div className="p-2 bg-indigo-500/10 text-indigo-400 rounded-xl border border-indigo-500/20">
              <Truck className="w-4 h-4" />
            </div>
          </div>
          <p className="text-[20px] font-bold text-[#fafafa] font-tabular tracking-tight">
            {totalTransitUnits} <span className="text-[13px] font-normal text-neutral-400">em trânsito</span>
          </p>
          <p className="text-[11px] text-indigo-300 mt-2 font-tabular">
            {transitOrders.length} carretas em deslocamento rodoviário
          </p>
        </div>
      </div>

      {/* Regional Performance Cards (5 Brazilian Regions - Interactive Filter) */}
      <div className="bg-[#18181b] border border-[#27272a] rounded-3xl p-5 md:p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <h3 className="text-[15px] font-bold text-white flex items-center gap-2">
              <Compass className="w-4 h-4 text-blue-400" />
              Desempenho por Região Geográfica
            </h3>
            <p className="text-[11px] text-neutral-400">
              Clique em uma região para filtrar instantaneamente as concessionárias abaixo.
            </p>
          </div>

          {selectedRegion !== 'todas' && (
            <button
              onClick={() => setSelectedRegion('todas')}
              className="text-[11px] text-blue-400 hover:text-blue-300 font-bold flex items-center gap-1 self-start"
            >
              <X className="w-3.5 h-3.5" />
              Limpar filtro de região
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
          {regionalSummary.map((reg) => {
            const isSelected = selectedRegion === reg.region;
            return (
              <button
                key={reg.region}
                onClick={() => setSelectedRegion(isSelected ? 'todas' : reg.region)}
                className={`p-4 rounded-2xl border text-left transition-all relative overflow-hidden group ${
                  isSelected
                    ? 'bg-blue-950/70 border-blue-500 shadow-md shadow-blue-500/10 ring-1 ring-blue-500'
                    : 'bg-neutral-900/60 border-neutral-800 hover:bg-neutral-900 hover:border-neutral-700'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-[13px] text-white">{reg.region}</span>
                  <span className="text-[10px] bg-neutral-800 text-neutral-300 px-2 py-0.5 rounded-full font-bold">
                    {reg.storeCount} {reg.storeCount === 1 ? 'loja' : 'lojas'}
                  </span>
                </div>

                <p className="text-[15px] font-bold text-[#fafafa] font-tabular">
                  R$ {(reg.sales / 1000).toLocaleString('pt-BR')}k
                </p>

                <div className="mt-2 space-y-1">
                  <div className="flex justify-between text-[10px] text-neutral-400 font-tabular">
                    <span>Atingimento</span>
                    <span className={`font-bold ${reg.targetPercent >= 100 ? 'text-emerald-400' : reg.targetPercent >= 75 ? 'text-blue-400' : 'text-amber-400'}`}>
                      {reg.targetPercent}%
                    </span>
                  </div>
                  <div className="w-full h-1 bg-neutral-800 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full ${
                        reg.targetPercent >= 100 ? 'bg-emerald-500' : reg.targetPercent >= 75 ? 'bg-blue-500' : 'bg-amber-500'
                      }`}
                      style={{ width: `${Math.min(100, reg.targetPercent)}%` }}
                    />
                  </div>
                </div>

                <div className="mt-2 flex items-center justify-between text-[10px] text-neutral-400 pt-2 border-t border-neutral-800/80">
                  <span>Pátio: {reg.stock} motos</span>
                  <span>{reg.leads} leads</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Network Alert & Ranking Bento (Top Performers & Action Required) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Top 3 Performers */}
        <div className="bg-[#18181b] border border-[#27272a] rounded-3xl p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <Award className="w-4 h-4 text-amber-400" />
            <h3 className="text-[14px] font-bold text-white">Top 3 Concessionárias do Mês</h3>
          </div>
          <div className="space-y-3">
            {topPerformers.map((dealer, idx) => (
              <div 
                key={dealer.profile.id}
                className="p-3 bg-neutral-900/70 border border-neutral-800 rounded-2xl flex items-center justify-between hover:border-blue-500/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-7 h-7 rounded-xl flex items-center justify-center font-bold text-[12px] ${
                    idx === 0 ? 'bg-amber-500 text-black shadow-md shadow-amber-500/20' :
                    idx === 1 ? 'bg-slate-300 text-black' :
                    'bg-amber-800 text-white'
                  }`}>
                    {idx + 1}º
                  </div>
                  <div>
                    <p className="font-bold text-[12px] text-white">{dealer.profile.name}</p>
                    <span className="text-[10px] text-neutral-400">{dealer.profile.city} ({dealer.profile.state})</span>
                  </div>
                </div>
                <div className="text-right font-tabular">
                  <span className="text-[12px] font-bold text-emerald-400">{dealer.targetPercent}% da meta</span>
                  <p className="text-[10px] text-neutral-400">R$ {(dealer.salesRevenue / 1000).toFixed(0)}k</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Attention Alerts / Credit Risk */}
        <div className="bg-[#18181b] border border-[#27272a] rounded-3xl p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle className="w-4 h-4 text-amber-400" />
            <h3 className="text-[14px] font-bold text-white">Lojas em Atenção da Montadora</h3>
          </div>
          {attentionDealers.length === 0 ? (
            <div className="py-8 text-center text-neutral-500 text-[12px]">
              <CheckCircle2 className="w-6 h-6 text-emerald-500 mx-auto mb-2" />
              Todas as concessionárias estão operando dentro das margens normais.
            </div>
          ) : (
            <div className="space-y-3">
              {attentionDealers.slice(0, 3).map((dealer) => (
                <div 
                  key={dealer.profile.id}
                  className="p-3 bg-amber-950/20 border border-amber-900/40 rounded-2xl flex items-center justify-between"
                >
                  <div>
                    <p className="font-bold text-[12px] text-amber-200">{dealer.profile.name}</p>
                    <p className="text-[10px] text-amber-400/80">
                      {dealer.creditUsagePercent > 80 
                        ? `Crédito em ${dealer.creditUsagePercent}% do limite`
                        : `Meta em ${dealer.targetPercent}% (Abaixo do ritmo)`}
                    </p>
                  </div>
                  <button
                    onClick={() => setCreditAdjustmentDealer(dealer.profile)}
                    className="text-[10px] bg-amber-900/50 hover:bg-amber-800 text-amber-200 font-bold px-2.5 py-1.5 rounded-lg transition-colors"
                  >
                    Ajustar Risco
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Active Logistics Deliveries */}
        <div className="bg-[#18181b] border border-[#27272a] rounded-3xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Truck className="w-4 h-4 text-indigo-400" />
              <h3 className="text-[14px] font-bold text-white">Carretas de Fábrica em Rota</h3>
            </div>
            <span className="text-[10px] bg-indigo-950 text-indigo-300 border border-indigo-800/40 px-2 py-0.5 rounded-full font-bold">
              {transitOrders.length} Lotes
            </span>
          </div>
          <div className="space-y-2.5">
            {transitOrders.slice(0, 3).map((order) => (
              <div
                key={order.id}
                onClick={() => setSelectedBatchModal(order)}
                className="p-3 bg-neutral-900/70 border border-neutral-800 hover:border-indigo-500/50 rounded-2xl cursor-pointer transition-colors"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[12px] text-white truncate max-w-[180px]">
                    {order.batchName}
                  </span>
                  <span className="text-[10px] bg-emerald-950 text-emerald-300 border border-emerald-800/40 px-2 py-0.5 rounded font-bold">
                    {order.status}
                  </span>
                </div>
                <div className="flex items-center justify-between text-[10px] text-neutral-400 mt-1.5 font-tabular">
                  <span>{order.location}</span>
                  <span className="text-white font-bold">{order.unitsCount} unidades</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Network Operations Directory & Detailed Matrix */}
      <div className="bg-[#18181b] border border-[#27272a] rounded-3xl p-5 md:p-6 shadow-md space-y-4">
        {/* Controls & Filter Bar */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-[#27272a]">
          <div>
            <h3 className="text-[16px] font-bold text-[#fafafa] flex items-center gap-2">
              <Building2 className="w-4 h-4 text-blue-400" />
              Matriz Operacional da Rede Concessionária ({filteredDealers.length} Lojas)
            </h3>
            <p className="text-[11px] text-neutral-400 mt-0.5">
              Acompanhamento minucioso de cada loja com acesso direto aos cockpits individuais.
            </p>
          </div>

          {/* Search and Filters */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Search Input */}
            <div className="relative min-w-[220px]">
              <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Buscar por loja, cidade, UF ou CNPJ..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-neutral-900 text-[12px] text-neutral-200 pl-8 pr-3 py-1.5 rounded-xl border border-[#27272a] focus:outline-none focus:border-blue-500 placeholder:text-neutral-500"
              />
            </div>

            {/* Region Filter */}
            <select
              value={selectedRegion}
              onChange={(e) => setSelectedRegion(e.target.value)}
              className="bg-neutral-900 text-[12px] text-neutral-200 font-medium border border-[#27272a] rounded-xl px-3 py-1.5 focus:outline-none focus:border-blue-500"
            >
              <option value="todas">Todas as Regiões</option>
              <option value="Sudeste">Sudeste</option>
              <option value="Sul">Sul</option>
              <option value="Centro-Oeste">Centro-Oeste</option>
              <option value="Nordeste">Nordeste</option>
              <option value="Norte">Norte</option>
            </select>

            {/* Tier Filter */}
            <select
              value={selectedTier}
              onChange={(e) => setSelectedTier(e.target.value)}
              className="bg-neutral-900 text-[12px] text-neutral-200 font-medium border border-[#27272a] rounded-xl px-3 py-1.5 focus:outline-none focus:border-blue-500"
            >
              <option value="todos">Todos os Tiers</option>
              <option value="Diamante">Tier Diamante</option>
              <option value="Ouro">Tier Ouro</option>
              <option value="Prata">Tier Prata</option>
              <option value="Bronze">Tier Bronze</option>
            </select>

            {/* Performance Filter */}
            <select
              value={selectedPerformance}
              onChange={(e) => setSelectedPerformance(e.target.value)}
              className="bg-neutral-900 text-[12px] text-neutral-200 font-medium border border-[#27272a] rounded-xl px-3 py-1.5 focus:outline-none focus:border-blue-500"
            >
              <option value="todos">Todos os Ritmos</option>
              <option value="batida">Meta Atingida (≥ 100%)</option>
              <option value="ritmo">Em Ritmo (75% a 99%)</option>
              <option value="atencao">Em Atenção (&lt; 75%)</option>
            </select>

            {/* Sort Filter */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-neutral-900 text-[12px] text-neutral-200 font-medium border border-[#27272a] rounded-xl px-3 py-1.5 focus:outline-none focus:border-blue-500"
            >
              <option value="sales">Ordenar por Faturamento</option>
              <option value="targetPercent">Ordenar por % da Meta</option>
              <option value="stock">Ordenar por Estoque</option>
              <option value="credit">Ordenar por Uso de Crédito</option>
              <option value="leads">Ordenar por Leads Ativos</option>
            </select>

            {/* View Mode Switcher */}
            <div className="flex items-center bg-neutral-900 p-0.5 rounded-xl border border-[#27272a]">
              <button
                onClick={() => setViewMode('table')}
                className={`p-1.5 rounded-lg transition-colors ${viewMode === 'table' ? 'bg-neutral-800 text-white' : 'text-neutral-400 hover:text-white'}`}
                title="Visualização em Tabela Detalhada"
              >
                <TableProperties className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('cards')}
                className={`p-1.5 rounded-lg transition-colors ${viewMode === 'cards' ? 'bg-neutral-800 text-white' : 'text-neutral-400 hover:text-white'}`}
                title="Visualização em Cards Bento"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* View Mode 1: Detailed Table Matrix */}
        {viewMode === 'table' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-[13px]">
              <thead>
                <tr className="bg-neutral-900/80 border-b border-[#27272a] text-[10px] font-bold text-neutral-400 uppercase tracking-wider">
                  <th className="py-3 px-4">Concessionária & UF</th>
                  <th className="py-3 px-4">Região / Tier</th>
                  <th className="py-3 px-4 text-right">Faturamento / Meta</th>
                  <th className="py-3 px-4 text-center">Progresso</th>
                  <th className="py-3 px-4 text-center">Pátio (Motos)</th>
                  <th className="py-3 px-4 text-center">Cota Mensal</th>
                  <th className="py-3 px-4 text-right">Crédito Utilizado</th>
                  <th className="py-3 px-4 text-center">Ações Rápidas</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#27272a] font-tabular">
                {filteredDealers.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-neutral-500">
                      Nenhuma concessionária encontrada com os filtros selecionados.
                    </td>
                  </tr>
                ) : (
                  filteredDealers.map((d) => {
                    const isOverTarget = d.targetPercent >= 100;
                    const isWarning = d.targetPercent < 75 || d.creditUsagePercent > 80;
                    return (
                      <tr 
                        key={d.profile.id}
                        className="hover:bg-neutral-900/50 transition-colors group"
                      >
                        {/* Dealer Name & City */}
                        <td className="py-3.5 px-4 font-medium text-white">
                          <div className="flex items-center gap-2.5">
                            <div className="p-1.5 rounded-lg bg-neutral-800 text-blue-400 border border-neutral-700">
                              <Building2 className="w-4 h-4" />
                            </div>
                            <div>
                              <p className="font-bold leading-tight flex items-center gap-1.5">
                                {d.profile.name}
                                <span className="text-[9px] bg-neutral-800 text-neutral-300 px-1 py-0.2 rounded font-bold">
                                  {d.profile.state}
                                </span>
                              </p>
                              <span className="text-[11px] text-neutral-500">{d.profile.city} • Gerente: {d.profile.manager}</span>
                            </div>
                          </div>
                        </td>

                        {/* Region & Tier */}
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-1.5">
                            <span className="text-[11px] text-neutral-300 font-medium">
                              {d.profile.region}
                            </span>
                            {d.profile.tier && (
                              <span className={`text-[9px] px-1.5 py-0.2 rounded font-bold uppercase ${
                                d.profile.tier === 'Diamante' ? 'bg-cyan-950 text-cyan-300 border border-cyan-800/50' :
                                d.profile.tier === 'Ouro' ? 'bg-amber-950 text-amber-300 border border-amber-800/50' :
                                d.profile.tier === 'Prata' ? 'bg-slate-800 text-slate-300 border border-slate-700' :
                                'bg-orange-950 text-orange-300 border border-orange-800/50'
                              }`}>
                                {d.profile.tier}
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Sales Revenue & Target */}
                        <td className="py-3.5 px-4 text-right">
                          <p className="font-bold text-white">R$ {d.salesRevenue.toLocaleString('pt-BR')}</p>
                          <span className="text-[11px] text-neutral-500">Meta: R$ {(d.profile.monthlyTarget / 1000).toFixed(0)}k</span>
                        </td>

                        {/* Target Progress Bar */}
                        <td className="py-3.5 px-4 text-center min-w-[120px]">
                          <div className="flex items-center justify-center gap-2">
                            <span className={`text-[12px] font-bold ${
                              isOverTarget ? 'text-emerald-400' : d.targetPercent >= 75 ? 'text-blue-400' : 'text-amber-400'
                            }`}>
                              {d.targetPercent}%
                            </span>
                          </div>
                          <div className="w-full h-1.5 bg-neutral-800 rounded-full overflow-hidden mt-1">
                            <div 
                              className={`h-full rounded-full ${
                                isOverTarget ? 'bg-emerald-500' : d.targetPercent >= 75 ? 'bg-blue-500' : 'bg-amber-500'
                              }`}
                              style={{ width: `${Math.min(100, d.targetPercent)}%` }}
                            />
                          </div>
                        </td>

                        {/* Physical Stock in Store */}
                        <td className="py-3.5 px-4 text-center">
                          <span className="font-bold text-white">{d.stockCount} un.</span>
                          <p className="text-[10px] text-neutral-500">R$ {(d.stockValue / 1000).toFixed(0)}k</p>
                        </td>

                        {/* Factory Quota */}
                        <td className="py-3.5 px-4 text-center">
                          <span className="font-bold text-neutral-200">{d.quotaOrdered}/{d.quotaAllocated} un.</span>
                          <div className="text-[10px] text-neutral-500">
                            {d.quotaAllocated - d.quotaOrdered} restantes
                          </div>
                        </td>

                        {/* Credit Usage */}
                        <td className="py-3.5 px-4 text-right">
                          <p className="font-bold text-neutral-200">
                            R$ {(d.creditUsed / 1000).toFixed(0)}k
                          </p>
                          <span className={`text-[10px] font-bold ${
                            d.creditUsagePercent > 80 ? 'text-amber-400' : 'text-neutral-500'
                          }`}>
                            {d.creditUsagePercent}% do limite
                          </span>
                        </td>

                        {/* Actions */}
                        <td className="py-3.5 px-4 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            {/* Open Store Dashboard */}
                            <button
                              onClick={() => onSelectDealership(d.profile.id)}
                              title="Abrir Cockpit Individual desta Loja"
                              className="p-1.5 rounded-lg bg-blue-600/20 hover:bg-blue-600 text-blue-400 hover:text-white border border-blue-500/30 transition-all"
                            >
                              <ArrowUpRight className="w-4 h-4" />
                            </button>

                            {/* Audit Modal */}
                            <button
                              onClick={() => setAuditDealer(d.profile)}
                              title="Auditar Concessionária"
                              className="p-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white border border-neutral-700 transition-all"
                            >
                              <Layers className="w-4 h-4" />
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
        )}

        {/* View Mode 2: Bento Cards Grid */}
        {viewMode === 'cards' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredDealers.map((d) => (
              <div
                key={d.profile.id}
                className="bg-neutral-900/70 border border-neutral-800 hover:border-blue-500/50 rounded-2xl p-4 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] bg-neutral-800 text-neutral-300 border border-neutral-700 px-2 py-0.5 rounded-full font-bold">
                        {d.profile.region} • {d.profile.state}
                      </span>
                      {d.profile.tier && (
                        <span className="text-[9px] bg-amber-950 text-amber-300 border border-amber-800/40 px-1.5 py-0.5 rounded font-bold">
                          {d.profile.tier}
                        </span>
                      )}
                    </div>
                    <span className={`text-[12px] font-bold ${
                      d.targetPercent >= 100 ? 'text-emerald-400' : d.targetPercent >= 75 ? 'text-blue-400' : 'text-amber-400'
                    }`}>
                      {d.targetPercent}% da meta
                    </span>
                  </div>

                  <h4 className="font-bold text-[14px] text-white leading-tight mb-1">
                    {d.profile.name}
                  </h4>
                  <p className="text-[11px] text-neutral-400 mb-3">
                    {d.profile.city} • Gerente: {d.profile.manager}
                  </p>

                  <div className="grid grid-cols-2 gap-2 p-2.5 bg-neutral-950 rounded-xl border border-neutral-800 text-[11px] font-tabular mb-3">
                    <div>
                      <span className="text-[9px] text-neutral-500 uppercase block">Vendas Mês</span>
                      <strong className="text-white">R$ {(d.salesRevenue / 1000).toFixed(0)}k</strong>
                    </div>
                    <div>
                      <span className="text-[9px] text-neutral-500 uppercase block">Pátio Loja</span>
                      <strong className="text-white">{d.stockCount} motocicletas</strong>
                    </div>
                    <div>
                      <span className="text-[9px] text-neutral-500 uppercase block">Cota Pedida</span>
                      <strong className="text-neutral-300">{d.quotaOrdered} de {d.quotaAllocated} un.</strong>
                    </div>
                    <div>
                      <span className="text-[9px] text-neutral-500 uppercase block">Crédito Usado</span>
                      <strong className={d.creditUsagePercent > 80 ? 'text-amber-400' : 'text-neutral-300'}>
                        {d.creditUsagePercent}%
                      </strong>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-2 border-t border-neutral-800">
                  <button
                    onClick={() => onSelectDealership(d.profile.id)}
                    className="flex-1 bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 rounded-xl text-[11px] flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <span>Acessar Loja</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => setAuditDealer(d.profile)}
                    className="px-3 py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 rounded-xl text-[11px] font-bold transition-colors"
                  >
                    Auditar
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Dealership Deep Audit & Action Modal */}
      {auditDealer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-[#18181b] border border-[#27272a] rounded-3xl max-w-2xl w-full p-6 md:p-8 shadow-2xl relative overflow-hidden max-h-[90vh] overflow-y-auto">
            <button 
              onClick={() => setAuditDealer(null)}
              className="absolute top-5 right-5 p-2 text-neutral-400 hover:text-white hover:bg-neutral-800 rounded-xl"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-blue-600/20 text-blue-400 border border-blue-500/30 rounded-2xl">
                <Building2 className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-blue-400 tracking-wider">
                  Auditoria Montadora • Região {auditDealer.region}
                </span>
                <h3 className="text-[20px] font-bold text-white">{auditDealer.name}</h3>
                <p className="text-[12px] text-neutral-400">{auditDealer.city} ({auditDealer.state}) • CNPJ: {auditDealer.cnpj}</p>
              </div>
            </div>

            {/* Modal Content */}
            <div className="space-y-4 text-[13px]">
              {/* Profile Card */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 bg-neutral-900 rounded-2xl border border-neutral-800 font-tabular">
                <div>
                  <span className="text-[10px] text-neutral-400 uppercase block">Gerente Titular</span>
                  <strong className="text-white">{auditDealer.manager}</strong>
                </div>
                <div>
                  <span className="text-[10px] text-neutral-400 uppercase block">Contato Telefônico</span>
                  <strong className="text-white">{auditDealer.phone}</strong>
                </div>
                <div>
                  <span className="text-[10px] text-neutral-400 uppercase block">Meta Mensal</span>
                  <strong className="text-emerald-400">R$ {auditDealer.monthlyTarget.toLocaleString('pt-BR')}</strong>
                </div>
              </div>

              {/* Credit & Quota Actions */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Credit Limit */}
                <div className="p-4 bg-neutral-900 rounded-2xl border border-neutral-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-neutral-300">Limite de Crédito de Fábrica</span>
                    <CreditCard className="w-4 h-4 text-blue-400" />
                  </div>
                  <p className="text-[18px] font-bold text-white font-tabular">
                    R$ {(auditDealer.creditLimit || 2000000).toLocaleString('pt-BR')}
                  </p>
                  <p className="text-[11px] text-neutral-400 font-tabular">
                    Utilizado: R$ {(auditDealer.creditUsed || 1000000).toLocaleString('pt-BR')} ({Math.round(((auditDealer.creditUsed || 1000000) / (auditDealer.creditLimit || 2000000)) * 100)}%)
                  </p>
                  <button
                    onClick={() => {
                      setCreditAdjustmentDealer(auditDealer);
                      setAuditDealer(null);
                    }}
                    className="w-full bg-neutral-800 hover:bg-neutral-700 text-white font-bold py-2 rounded-xl text-[11px] transition-colors"
                  >
                    Ajustar Limite de Crédito
                  </button>
                </div>

                {/* Monthly Quota */}
                <div className="p-4 bg-neutral-900 rounded-2xl border border-neutral-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-neutral-300">Cota Mensal de Motocicletas</span>
                    <Bike className="w-4 h-4 text-emerald-400" />
                  </div>
                  <p className="text-[18px] font-bold text-white font-tabular">
                    {auditDealer.quotaOrdered || 15} / {auditDealer.quotaAllocated || 20} un.
                  </p>
                  <p className="text-[11px] text-neutral-400">
                    Restante no mês: {(auditDealer.quotaAllocated || 20) - (auditDealer.quotaOrdered || 15)} unidades 0km
                  </p>
                  <button
                    onClick={() => {
                      setQuotaDealer(auditDealer);
                      setAuditDealer(null);
                    }}
                    className="w-full bg-blue-600/30 hover:bg-blue-600 text-blue-300 hover:text-white font-bold py-2 rounded-xl text-[11px] transition-colors"
                  >
                    Liberar Cota Extra
                  </button>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-3 pt-4 border-t border-neutral-800">
                <button
                  onClick={() => {
                    onSelectDealership(auditDealer.id);
                    setAuditDealer(null);
                  }}
                  className="flex-1 bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-2xl text-[12px] flex items-center justify-center gap-2 transition-all shadow-lg shadow-blue-500/20"
                >
                  <span>Acessar Painel Exclusivo de {auditDealer.shortName}</span>
                  <ArrowUpRight className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setAuditDealer(null)}
                  className="px-5 py-3 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 rounded-2xl text-[12px] font-bold transition-colors"
                >
                  Fechar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Credit Limit Adjustment Modal */}
      {creditAdjustmentDealer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-[#18181b] border border-[#27272a] rounded-3xl max-w-md w-full p-6 shadow-2xl relative">
            <button 
              onClick={() => setCreditAdjustmentDealer(null)}
              className="absolute top-4 right-4 p-1.5 text-neutral-400 hover:text-white hover:bg-neutral-800 rounded-xl"
            >
              <X className="w-4 h-4" />
            </button>
            <div className="flex items-center gap-2.5 mb-3">
              <CreditCard className="w-5 h-5 text-blue-400" />
              <h3 className="text-[16px] font-bold text-white">Ajuste de Crédito J. Toledo</h3>
            </div>
            <p className="text-[12px] text-neutral-400 mb-4">
              Concessionária: <strong>{creditAdjustmentDealer.name}</strong>
            </p>
            <div className="space-y-3">
              <div>
                <label className="text-[11px] font-bold text-neutral-400 uppercase block mb-1">Novo Limite (R$)</label>
                <input
                  type="number"
                  defaultValue={creditAdjustmentDealer.creditLimit || 3000000}
                  className="w-full bg-neutral-900 border border-neutral-700 rounded-xl px-3 py-2 text-white font-tabular text-[13px] focus:outline-none focus:border-blue-500"
                />
              </div>
              <div className="flex gap-2 pt-2">
                <button
                  onClick={() => {
                    showToast(`Limite de crédito de ${creditAdjustmentDealer.shortName} atualizado com sucesso!`);
                    setCreditAdjustmentDealer(null);
                  }}
                  className="flex-1 bg-blue-600 hover:bg-blue-500 text-white font-bold py-2.5 rounded-xl text-[12px] transition-colors"
                >
                  Salvar e Notificar Loja
                </button>
                <button
                  onClick={() => setCreditAdjustmentDealer(null)}
                  className="px-4 py-2.5 bg-neutral-800 text-neutral-300 font-bold rounded-xl text-[12px]"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Quota Expansion Modal */}
      {quotaDealer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-[#18181b] border border-[#27272a] rounded-3xl max-w-md w-full p-6 shadow-2xl relative">
            <button 
              onClick={() => setQuotaDealer(null)}
              className="absolute top-4 right-4 p-1.5 text-neutral-400 hover:text-white hover:bg-neutral-800 rounded-xl"
            >
              <X className="w-4 h-4" />
            </button>
            <div className="flex items-center gap-2.5 mb-3">
              <Bike className="w-5 h-5 text-emerald-400" />
              <h3 className="text-[16px] font-bold text-white">Liberação de Cota Extra</h3>
            </div>
            <p className="text-[12px] text-neutral-400 mb-4">
              Concessionária: <strong>{quotaDealer.name}</strong>
            </p>
            <div className="space-y-3">
              <div>
                <label className="text-[11px] font-bold text-neutral-400 uppercase block mb-1">Unidades Adicionais 0km</label>
                <input
                  type="number"
                  value={extraQuotaUnits}
                  onChange={(e) => setExtraQuotaUnits(e.target.value)}
                  className="w-full bg-neutral-900 border border-neutral-700 rounded-xl px-3 py-2 text-white font-tabular text-[13px] focus:outline-none focus:border-blue-500"
                />
              </div>
              <div className="flex gap-2 pt-2">
                <button
                  onClick={() => {
                    showToast(`Cota extra de +${extraQuotaUnits} motocicletas liberada para ${quotaDealer.shortName}!`);
                    setQuotaDealer(null);
                  }}
                  className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2.5 rounded-xl text-[12px] transition-colors"
                >
                  Liberar para Pedido
                </button>
                <button
                  onClick={() => setQuotaDealer(null)}
                  className="px-4 py-2.5 bg-neutral-800 text-neutral-300 font-bold rounded-xl text-[12px]"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Transit Logistics Batch Modal */}
      {selectedBatchModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-[#18181b] border border-[#27272a] rounded-3xl max-w-md w-full p-6 shadow-2xl relative">
            <button 
              onClick={() => setSelectedBatchModal(null)}
              className="absolute top-4 right-4 p-1.5 text-neutral-400 hover:text-white hover:bg-neutral-800 rounded-xl"
            >
              <X className="w-4 h-4" />
            </button>
            <div className="flex items-center gap-2.5 mb-3">
              <Truck className="w-5 h-5 text-indigo-400" />
              <h3 className="text-[16px] font-bold text-white">Detalhes de Transporte de Fábrica</h3>
            </div>
            <div className="space-y-3 text-[12px]">
              <div className="p-3 bg-neutral-900 rounded-xl border border-neutral-800 space-y-1 font-tabular">
                <p className="font-bold text-white text-[13px]">{selectedBatchModal.batchName}</p>
                <p className="text-neutral-400">Previsão: {selectedBatchModal.eta}</p>
                <p className="text-neutral-400">Localização Atual: {selectedBatchModal.location}</p>
                <p className="text-indigo-300 font-bold">{selectedBatchModal.unitsCount} unidades • R$ {(selectedBatchModal.value || 0).toLocaleString('pt-BR')}</p>
              </div>
              <button
                onClick={() => setSelectedBatchModal(null)}
                className="w-full bg-neutral-800 hover:bg-neutral-700 text-white font-bold py-2.5 rounded-xl text-[12px] transition-colors"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
