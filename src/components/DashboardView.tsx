import React, { useState } from 'react';
import { NavTab, TransitOrder, InventoryItem, ServiceOrder, PipelineCard, RecentSale } from '../types';
import { 
  TrendingUp, 
  TrendingDown, 
  CreditCard, 
  Receipt, 
  Landmark, 
  Truck, 
  Bike, 
  FileText, 
  UserCheck, 
  Wrench, 
  Calendar, 
  ArrowRight,
  Sparkles,
  Zap,
  ShieldCheck,
  CheckCircle2,
  Clock,
  AlertTriangle,
  DollarSign,
  PieChart,
  Percent,
  Gauge,
  Layers,
  ChevronRight
} from 'lucide-react';

interface DashboardViewProps {
  onNavigate: (tab: NavTab) => void;
  onOpenNewVehicleModal: () => void;
  onOpenNewLeadModal: () => void;
  inventory: InventoryItem[];
  transitOrders: TransitOrder[];
  serviceOrders?: ServiceOrder[];
  pipelineCards?: PipelineCard[];
  recentSales?: RecentSale[];
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  onNavigate,
  onOpenNewVehicleModal,
  onOpenNewLeadModal,
  inventory = [],
  transitOrders = [],
  serviceOrders = [],
  pipelineCards = [],
  recentSales = []
}) => {
  const [hoveredMonth, setHoveredMonth] = useState<string | null>(null);
  const [selectedTransit, setSelectedTransit] = useState<TransitOrder | null>(null);
  const [hoveredServiceSegment, setHoveredServiceSegment] = useState<string | null>(null);

  // --- Dynamic KPI Calculations ---

  // 1. Inventory Valuation & Capacity Metrics
  const activeStockItems = inventory.filter(i => i.status !== 'vendido');
  const availableStockCount = inventory.filter(i => i.status === 'disponivel').length;
  const reservedStockCount = inventory.filter(i => i.status === 'reservado').length;
  const soldStockCount = inventory.filter(i => i.status === 'vendido').length;
  const totalStockCount = inventory.length;

  const totalInventoryRetailValue = activeStockItems.reduce((acc, i) => acc + i.retailPrice, 0);
  const totalInventoryCostValue = activeStockItems.reduce((acc, i) => acc + i.costPrice, 0);
  const grossInventoryMargin = totalInventoryRetailValue - totalInventoryCostValue;
  const inventoryMarginPercent = totalInventoryRetailValue > 0 
    ? (grossInventoryMargin / totalInventoryRetailValue) * 100 
    : 0;

  // 2. Monthly Sales & Commercial Revenue Metrics
  const totalRecentSalesRevenue = recentSales.reduce((acc, s) => acc + s.price, 0);
  const averageSalesTicket = recentSales.length > 0 
    ? totalRecentSalesRevenue / recentSales.length 
    : 0;
  const totalPipelineValue = pipelineCards.reduce((acc, c) => acc + c.value, 0);
  const activeLeadsCount = pipelineCards.length;
  const monthlySalesTarget = 1500000;
  const salesQuotaProgress = Math.min(100, Math.round((totalRecentSalesRevenue / monthlySalesTarget) * 100));

  // 3. Service Efficiency & After-Sales Workshop Metrics
  const totalServiceOrdersCount = serviceOrders.length;
  const completedOrdersCount = serviceOrders.filter(o => o.status === 'finalizado').length;
  const inExecutionOrdersCount = serviceOrders.filter(o => o.status === 'em_execucao').length;
  const waitingPartsOrdersCount = serviceOrders.filter(o => o.status === 'aguardando_pecas').length;
  const openOrdersCount = serviceOrders.filter(o => o.status === 'em_aberto').length;

  const totalWorkshopRevenue = serviceOrders.reduce(
    (acc, o) => acc + (o.totalEstimated || o.totalAmount || 0), 0
  );
  const serviceResolutionEfficiency = totalServiceOrdersCount > 0 
    ? Math.round((completedOrdersCount / totalServiceOrdersCount) * 100) 
    : 0;
  const averageWorkshopTicket = totalServiceOrdersCount > 0 
    ? totalWorkshopRevenue / totalServiceOrdersCount 
    : 0;

  // Chart data with dynamic current month
  const salesMonths = [
    { month: 'Mai', height: '40%', value: 'R$ 780.000', units: 21 },
    { month: 'Jun', height: '55%', value: 'R$ 940.000', units: 26 },
    { month: 'Jul', height: '45%', value: 'R$ 820.000', units: 23 },
    { month: 'Ago', height: '70%', value: 'R$ 1.090.000', units: 31 },
    { month: 'Set', height: '60%', value: 'R$ 980.000', units: 28 },
    { 
      month: 'Out', 
      height: `${Math.min(95, Math.max(35, Math.round((totalRecentSalesRevenue / 1500000) * 100)))}%`, 
      value: `R$ ${(totalRecentSalesRevenue / 1000).toFixed(0)}.000`, 
      units: recentSales.length, 
      isCurrent: true 
    }
  ];

  // Circumference constant for SVG donut charts (radius = 38)
  const C = 2 * Math.PI * 38; // ~238.761

  // Inventory Donut Calculations
  const availableRatio = totalStockCount > 0 ? availableStockCount / totalStockCount : 0.7;
  const reservedRatio = totalStockCount > 0 ? reservedStockCount / totalStockCount : 0.3;
  const availableDash = C * availableRatio;
  const reservedDash = C * reservedRatio;

  // Service Order Donut Calculations (Aguardando Peças, Em Execução, Finalizado, Em Aberto)
  const effectiveTotalOS = totalServiceOrdersCount > 0 ? totalServiceOrdersCount : 1;
  const ratioCompleted = completedOrdersCount / effectiveTotalOS;
  const ratioInExecution = inExecutionOrdersCount / effectiveTotalOS;
  const ratioWaitingParts = waitingPartsOrdersCount / effectiveTotalOS;
  const ratioOpen = openOrdersCount / effectiveTotalOS;

  const lenCompleted = C * ratioCompleted;
  const lenInExecution = C * ratioInExecution;
  const lenWaitingParts = C * ratioWaitingParts;
  const lenOpen = C * ratioOpen;

  const offsetCompleted = 0;
  const offsetInExecution = -(lenCompleted);
  const offsetWaitingParts = -(lenCompleted + lenInExecution);
  const offsetOpen = -(lenCompleted + lenInExecution + lenWaitingParts);

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12">
      {/* Bento Header & Period Pill */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] uppercase font-bold tracking-widest text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 px-2.5 py-0.5 rounded-full border border-blue-200 dark:border-blue-800/40">
              Dealer Performance Core
            </span>
          </div>
          <h2 className="text-[26px] md:text-[30px] font-bold text-slate-900 dark:text-white tracking-tight">
            Dashboard Executivo
          </h2>
          <p className="text-[13px] text-slate-500 dark:text-slate-400">
            Painel consolidado em tempo real • Concessionária MotoSul Suzuki
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <span className="px-3.5 py-1.5 bg-white dark:bg-neutral-900 text-slate-700 dark:text-slate-300 rounded-full text-[11px] font-bold tracking-wide flex items-center gap-2 border border-slate-200 dark:border-neutral-800 shadow-sm">
            <Calendar className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
            Dados em Tempo Real
          </span>
        </div>
      </div>

      {/* Dynamic Primary Bento KPI Cards (3 Pillars) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        
        {/* KPI 1: Patrimônio em Estoque (Inventory Value) */}
        <div 
          onClick={() => onNavigate('inventory')}
          className="bg-white dark:bg-neutral-900 rounded-3xl p-5 md:p-6 border border-slate-200 dark:border-neutral-800 relative overflow-hidden group hover:border-blue-500 transition-all shadow-sm cursor-pointer flex flex-col justify-between"
        >
          <div className="absolute -right-8 -top-8 w-24 h-24 bg-blue-500/10 rounded-full blur-2xl group-hover:bg-blue-500/20 transition-all pointer-events-none" />
          
          <div>
            <div className="flex justify-between items-start mb-3 relative z-10">
              <span className="text-slate-500 dark:text-slate-400 text-[10px] font-bold uppercase tracking-widest block">
                Valor Total do Pátio
              </span>
              <div className="p-2 bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-2xl border border-blue-200 dark:border-blue-900/40 group-hover:scale-105 transition-transform">
                <Bike className="w-4 h-4" />
              </div>
            </div>

            <h3 className="text-[24px] xl:text-[26px] font-bold text-slate-900 dark:text-white tracking-tight font-tabular">
              R$ {totalInventoryRetailValue.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}
            </h3>
            
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
              Custo Fábrica: <strong className="text-slate-700 dark:text-slate-300 font-tabular">R$ {totalInventoryCostValue.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}</strong>
            </p>
          </div>

          <div className="pt-4 mt-3 border-t border-slate-100 dark:border-neutral-800 flex items-center justify-between relative z-10 text-[11px]">
            <span className="text-emerald-700 dark:text-emerald-400 font-bold bg-emerald-100 dark:bg-emerald-950 border border-emerald-200 dark:border-emerald-800/40 px-2 py-0.5 rounded-lg flex items-center gap-1 font-tabular">
              <TrendingUp className="w-3 h-3" /> {inventoryMarginPercent.toFixed(1)}% Margem
            </span>
            <span className="text-slate-500 dark:text-slate-400 font-tabular font-semibold">
              {activeStockItems.length} motos ativas
            </span>
          </div>
        </div>

        {/* KPI 2: Faturamento / Vendas do Mês (Monthly Sales Revenue) */}
        <div 
          onClick={() => onNavigate('purchase')}
          className="bg-white dark:bg-neutral-900 rounded-3xl p-5 md:p-6 border border-slate-200 dark:border-neutral-800 relative overflow-hidden group hover:border-blue-500 transition-all shadow-sm cursor-pointer flex flex-col justify-between"
        >
          <div className="absolute -right-8 -top-8 w-24 h-24 bg-emerald-500/10 rounded-full blur-2xl group-hover:bg-emerald-500/20 transition-all pointer-events-none" />
          
          <div>
            <div className="flex justify-between items-start mb-3 relative z-10">
              <span className="text-slate-500 dark:text-slate-400 text-[10px] font-bold uppercase tracking-widest block">
                Faturamento de Vendas
              </span>
              <div className="p-2 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-2xl border border-emerald-200 dark:border-emerald-900/40 group-hover:scale-105 transition-transform">
                <CreditCard className="w-4 h-4" />
              </div>
            </div>

            <h3 className="text-[24px] xl:text-[26px] font-bold text-slate-900 dark:text-white tracking-tight font-tabular">
              R$ {totalRecentSalesRevenue.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}
            </h3>

            <div className="mt-2 space-y-1">
              <div className="flex justify-between text-[10px] text-slate-500 dark:text-slate-400">
                <span>Meta Mensal (R$ 1.5M)</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400 font-tabular">{salesQuotaProgress}%</span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-neutral-800 h-1.5 rounded-full overflow-hidden">
                <div 
                  className="bg-emerald-500 h-full rounded-full transition-all duration-500" 
                  style={{ width: `${salesQuotaProgress}%` }}
                />
              </div>
            </div>
          </div>

          <div className="pt-3 mt-3 border-t border-slate-100 dark:border-neutral-800 flex items-center justify-between relative z-10 text-[11px]">
            <span className="text-slate-500 dark:text-slate-400">
              Ticket: <strong className="text-slate-700 dark:text-slate-200 font-tabular">R$ {averageSalesTicket.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}</strong>
            </span>
            <span className="text-blue-600 dark:text-blue-400 font-bold font-tabular">
              {recentSales.length} faturadas
            </span>
          </div>
        </div>

        {/* KPI 3: Pipeline & Oportunidades CRM (Sales Pipeline) */}
        <div 
          onClick={() => onNavigate('purchase')}
          className="bg-white dark:bg-neutral-900 rounded-3xl p-5 md:p-6 border border-slate-200 dark:border-neutral-800 relative overflow-hidden group hover:border-blue-500 transition-all shadow-sm cursor-pointer flex flex-col justify-between"
        >
          <div className="absolute -right-8 -top-8 w-24 h-24 bg-purple-500/10 rounded-full blur-2xl group-hover:bg-purple-500/20 transition-all pointer-events-none" />
          
          <div>
            <div className="flex justify-between items-start mb-3 relative z-10">
              <span className="text-slate-500 dark:text-slate-400 text-[10px] font-bold uppercase tracking-widest block">
                Pipeline em Negociação
              </span>
              <div className="p-2 bg-purple-500/10 text-purple-600 dark:text-purple-400 rounded-2xl border border-purple-200 dark:border-purple-900/40 group-hover:scale-105 transition-transform">
                <Receipt className="w-4 h-4" />
              </div>
            </div>

            <h3 className="text-[24px] xl:text-[26px] font-bold text-slate-900 dark:text-white tracking-tight font-tabular">
              R$ {totalPipelineValue.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}
            </h3>

            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
              Volume em simulação e aprovação bancária
            </p>
          </div>

          <div className="pt-4 mt-3 border-t border-slate-100 dark:border-neutral-800 flex items-center justify-between relative z-10 text-[11px]">
            <span className="text-purple-700 dark:text-purple-400 font-bold bg-purple-100 dark:bg-purple-950 border border-purple-200 dark:border-purple-800/40 px-2 py-0.5 rounded-lg font-tabular">
              {activeLeadsCount} Leads Ativos
            </span>
            <span className="text-slate-500 dark:text-slate-400 text-[11px] flex items-center gap-1 group-hover:text-blue-600 dark:group-hover:text-white transition-colors">
              Abrir CRM <ArrowRight className="w-3 h-3 text-blue-600 dark:text-blue-400" />
            </span>
          </div>
        </div>

      </div>

      {/* Middle Section: Chart & Stock Donut (Bento Grid) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* 6 Months Bar Chart Card */}
        <div className="lg:col-span-2 bg-white dark:bg-neutral-900 rounded-3xl p-5 md:p-6 border border-slate-200 dark:border-neutral-800 flex flex-col shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <div>
              <span className="text-slate-500 dark:text-slate-400 text-[10px] font-bold uppercase tracking-widest block mb-1">
                Desempenho Comercial Consolidado
              </span>
              <h3 className="text-[17px] font-bold text-slate-900 dark:text-white">
                Histórico de Vendas & Mês Atual
              </h3>
            </div>
            <button 
              onClick={() => onNavigate('purchase')}
              className="text-blue-600 dark:text-blue-400 hover:underline text-[12px] font-bold flex items-center gap-1 transition-colors"
            >
              Ver Relatório CRM <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="flex-1 bg-slate-50 dark:bg-neutral-800/60 border border-slate-200 dark:border-neutral-800 rounded-2xl flex flex-col justify-end p-4 h-64 relative overflow-hidden">
            {/* Grid background lines */}
            <div className="absolute inset-0 flex flex-col justify-between p-4 pointer-events-none">
              <div className="w-full border-b border-dashed border-slate-200 dark:border-neutral-700"></div>
              <div className="w-full border-b border-dashed border-slate-200 dark:border-neutral-700"></div>
              <div className="w-full border-b border-dashed border-slate-200 dark:border-neutral-700"></div>
              <div className="w-full border-b border-dashed border-slate-200 dark:border-neutral-700"></div>
            </div>

            {/* Bars container */}
            <div className="w-full flex justify-between items-end h-full gap-2 md:gap-4 px-2 relative z-10">
              {salesMonths.map((item) => (
                <div 
                  key={item.month}
                  className="flex-1 flex flex-col items-center h-full justify-end relative group cursor-pointer"
                  onMouseEnter={() => setHoveredMonth(item.month)}
                  onMouseLeave={() => setHoveredMonth(null)}
                >
                  {/* Tooltip on hover */}
                  <div className={`
                    absolute -top-12 left-1/2 -translate-x-1/2 bg-slate-900 dark:bg-neutral-950 text-white text-[11px] py-1.5 px-3 rounded-xl border border-slate-700 dark:border-neutral-700 shadow-xl whitespace-nowrap z-30 transition-all pointer-events-none
                    ${hoveredMonth === item.month ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}
                  `}>
                    <p className="font-bold">{item.month}: {item.value}</p>
                    <p className="text-[10px] text-slate-300 dark:text-neutral-400">{item.units} motocicletas faturadas</p>
                  </div>

                  {/* Top indicator dot on peak/current month */}
                  {item.isCurrent && (
                    <div className="mb-1.5 relative">
                      <div className="w-2 h-2 rounded-full bg-blue-600 ring-4 ring-blue-500/30 animate-pulse"></div>
                    </div>
                  )}

                  {/* Bar Body */}
                  <div 
                    style={{ height: item.height }}
                    className={`
                      w-full max-w-[60px] rounded-t-xl transition-all duration-300
                      ${item.isCurrent 
                        ? 'bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-500/25' 
                        : 'bg-slate-300 dark:bg-neutral-700/80 hover:bg-slate-400 dark:hover:bg-neutral-600'
                      }
                    `}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Month labels */}
          <div className="flex justify-between px-4 mt-3 text-[12px] font-tabular text-slate-500 dark:text-neutral-400">
            {salesMonths.map(item => (
              <span key={item.month} className={item.isCurrent ? 'font-bold text-slate-900 dark:text-white' : ''}>
                {item.month} {item.isCurrent && '(Atual)'}
              </span>
            ))}
          </div>
        </div>

        {/* Dynamic Stock Donut Summary Card */}
        <div className="bg-white dark:bg-neutral-900 rounded-3xl p-5 md:p-6 border border-slate-200 dark:border-neutral-800 flex flex-col shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <div>
              <span className="text-slate-500 dark:text-slate-400 text-[10px] font-bold uppercase tracking-widest block mb-1">
                Inventário Físico
              </span>
              <h3 className="text-[17px] font-bold text-slate-900 dark:text-white">Distribuição do Pátio</h3>
            </div>
            <button 
              onClick={() => onNavigate('inventory')}
              className="text-blue-600 dark:text-blue-400 text-[12px] font-bold hover:underline"
            >
              Ver Tabela
            </button>
          </div>

          <div className="flex-1 flex flex-col justify-center items-center py-2">
            {/* SVG Donut Chart */}
            <div className="relative w-44 h-44 my-auto">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                {/* Background circle */}
                <circle 
                  cx="50" cy="50" r="38" 
                  fill="transparent" 
                  className="stroke-slate-200 dark:stroke-neutral-800" 
                  strokeWidth="12" 
                />
                {/* Blue circle: Disponíveis */}
                <circle 
                  cx="50" cy="50" r="38" 
                  fill="transparent" 
                  stroke="#2563eb" 
                  strokeWidth="12" 
                  strokeDasharray={`${availableDash} ${C}`}
                  strokeDashoffset="0" 
                  strokeLinecap="round"
                  className="transition-all duration-700 ease-out"
                />
                {/* Rose/Orange circle: Reservadas */}
                <circle 
                  cx="50" cy="50" r="38" 
                  fill="transparent" 
                  stroke="#f43f5e" 
                  strokeWidth="12" 
                  strokeDasharray={`${reservedDash} ${C}`}
                  strokeDashoffset={`-${availableDash}`}
                  strokeLinecap="round"
                  className="transition-all duration-700 ease-out"
                />
              </svg>

              {/* Center text */}
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-[30px] font-bold text-slate-900 dark:text-white leading-none font-tabular">
                  {totalStockCount}
                </span>
                <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500 dark:text-neutral-400 mt-1">
                  Motos Totais
                </span>
              </div>
            </div>

            {/* Legend & Numbers */}
            <div className="w-full space-y-2 pt-4 border-t border-slate-100 dark:border-neutral-800 mt-2 text-[12px]">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-blue-600"></div>
                  <span className="text-slate-700 dark:text-neutral-300">Pronta Entrega</span>
                </div>
                <span className="font-tabular font-bold text-slate-900 dark:text-white">{availableStockCount} un.</span>
              </div>

              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-rose-500"></div>
                  <span className="text-slate-700 dark:text-neutral-300">Reservadas / Proposta</span>
                </div>
                <span className="font-tabular font-bold text-slate-900 dark:text-white">{reservedStockCount} un.</span>
              </div>

              {soldStockCount > 0 && (
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-slate-400 dark:bg-neutral-600"></div>
                    <span className="text-slate-500 dark:text-neutral-400">Entregues / Vendidas</span>
                  </div>
                  <span className="font-tabular font-bold text-slate-500 dark:text-neutral-400">{soldStockCount} un.</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Workshop Analytics & Service Order Status Donut (Bento Grid) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        
        {/* Workshop Donut Chart Card (Proporção de Status das O.S.) */}
        <div className="bg-white dark:bg-neutral-900 rounded-3xl p-5 md:p-6 border border-slate-200 dark:border-neutral-800 flex flex-col shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <div>
              <span className="text-slate-500 dark:text-slate-400 text-[10px] font-bold uppercase tracking-widest block mb-1">
                Pós-Venda & Oficina
              </span>
              <h3 className="text-[17px] font-bold text-slate-900 dark:text-white">
                Status das Ordens de Serviço
              </h3>
            </div>
            <button 
              onClick={() => onNavigate('inventory')}
              className="text-blue-600 dark:text-blue-400 text-[12px] font-bold hover:underline flex items-center gap-1"
            >
              Abrir O.S. <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="flex-1 flex flex-col justify-center items-center py-2">
            {/* SVG Service Orders Donut Chart */}
            <div className="relative w-44 h-44 my-auto">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                {/* Background circle */}
                <circle 
                  cx="50" cy="50" r="38" 
                  fill="transparent" 
                  className="stroke-slate-200 dark:stroke-neutral-800" 
                  strokeWidth="12" 
                />

                {/* 1. Finalizado (Emerald Green) */}
                {ratioCompleted > 0 && (
                  <circle 
                    cx="50" cy="50" r="38" 
                    fill="transparent" 
                    stroke="#10b981" 
                    strokeWidth="12" 
                    strokeDasharray={`${lenCompleted} ${C}`}
                    strokeDashoffset={`${offsetCompleted}`}
                    strokeLinecap="round"
                    className="transition-all duration-700 ease-out cursor-pointer hover:opacity-80"
                    onMouseEnter={() => setHoveredServiceSegment('Finalizado')}
                    onMouseLeave={() => setHoveredServiceSegment(null)}
                  />
                )}

                {/* 2. Em Execução (Indigo/Purple) */}
                {ratioInExecution > 0 && (
                  <circle 
                    cx="50" cy="50" r="38" 
                    fill="transparent" 
                    stroke="#818cf8" 
                    strokeWidth="12" 
                    strokeDasharray={`${lenInExecution} ${C}`}
                    strokeDashoffset={`${offsetInExecution}`}
                    strokeLinecap="round"
                    className="transition-all duration-700 ease-out cursor-pointer hover:opacity-80"
                    onMouseEnter={() => setHoveredServiceSegment('Em Execução')}
                    onMouseLeave={() => setHoveredServiceSegment(null)}
                  />
                )}

                {/* 3. Aguardando Peças (Amber/Yellow) */}
                {ratioWaitingParts > 0 && (
                  <circle 
                    cx="50" cy="50" r="38" 
                    fill="transparent" 
                    stroke="#f59e0b" 
                    strokeWidth="12" 
                    strokeDasharray={`${lenWaitingParts} ${C}`}
                    strokeDashoffset={`${offsetWaitingParts}`}
                    strokeLinecap="round"
                    className="transition-all duration-700 ease-out cursor-pointer hover:opacity-80"
                    onMouseEnter={() => setHoveredServiceSegment('Aguardando Peças')}
                    onMouseLeave={() => setHoveredServiceSegment(null)}
                  />
                )}

                {/* 4. Em Aberto (Sky Blue) */}
                {ratioOpen > 0 && (
                  <circle 
                    cx="50" cy="50" r="38" 
                    fill="transparent" 
                    stroke="#38bdf8" 
                    strokeWidth="12" 
                    strokeDasharray={`${lenOpen} ${C}`}
                    strokeDashoffset={`${offsetOpen}`}
                    strokeLinecap="round"
                    className="transition-all duration-700 ease-out cursor-pointer hover:opacity-80"
                    onMouseEnter={() => setHoveredServiceSegment('Em Aberto')}
                    onMouseLeave={() => setHoveredServiceSegment(null)}
                  />
                )}
              </svg>

              {/* Center text of Workshop Donut */}
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center">
                <span className="text-[28px] font-bold text-slate-900 dark:text-white leading-none font-tabular">
                  {hoveredServiceSegment 
                    ? (hoveredServiceSegment === 'Finalizado' ? completedOrdersCount :
                       hoveredServiceSegment === 'Em Execução' ? inExecutionOrdersCount :
                       hoveredServiceSegment === 'Aguardando Peças' ? waitingPartsOrdersCount : openOrdersCount)
                    : totalServiceOrdersCount
                  }
                </span>
                <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500 dark:text-neutral-400 mt-1 max-w-[80px] truncate">
                  {hoveredServiceSegment || 'Ordens O.S.'}
                </span>
              </div>
            </div>

            {/* Donut Legend & Proportion List */}
            <div className="w-full space-y-2 pt-4 border-t border-slate-100 dark:border-neutral-800 mt-2 text-[12px]">
              {/* Em Execução */}
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-[#818cf8]"></div>
                  <span className="text-slate-700 dark:text-neutral-300">Em Execução nos Boxes</span>
                </div>
                <div className="flex items-center gap-2 font-tabular">
                  <span className="text-slate-400 dark:text-neutral-400 text-[11px]">
                    ({totalServiceOrdersCount > 0 ? Math.round((inExecutionOrdersCount / totalServiceOrdersCount) * 100) : 0}%)
                  </span>
                  <span className="font-bold text-slate-900 dark:text-white">{inExecutionOrdersCount} un.</span>
                </div>
              </div>

              {/* Aguardando Peças */}
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-amber-500"></div>
                  <span className="text-slate-700 dark:text-neutral-300">Aguardando Peças</span>
                </div>
                <div className="flex items-center gap-2 font-tabular">
                  <span className="text-slate-400 dark:text-neutral-400 text-[11px]">
                    ({totalServiceOrdersCount > 0 ? Math.round((waitingPartsOrdersCount / totalServiceOrdersCount) * 100) : 0}%)
                  </span>
                  <span className="font-bold text-amber-600 dark:text-amber-400">{waitingPartsOrdersCount} un.</span>
                </div>
              </div>

              {/* Finalizado */}
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500"></div>
                  <span className="text-slate-700 dark:text-neutral-300">Finalizado / Entregue</span>
                </div>
                <div className="flex items-center gap-2 font-tabular">
                  <span className="text-slate-400 dark:text-neutral-400 text-[11px]">
                    ({totalServiceOrdersCount > 0 ? Math.round((completedOrdersCount / totalServiceOrdersCount) * 100) : 0}%)
                  </span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">{completedOrdersCount} un.</span>
                </div>
              </div>

              {/* Em Aberto (if any) */}
              {openOrdersCount > 0 && (
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-sky-400"></div>
                    <span className="text-slate-700 dark:text-neutral-300">Em Aberto / Triagem</span>
                  </div>
                  <div className="flex items-center gap-2 font-tabular">
                    <span className="text-slate-400 dark:text-neutral-400 text-[11px]">
                      ({Math.round((openOrdersCount / totalServiceOrdersCount) * 100)}%)
                    </span>
                    <span className="font-bold text-sky-600 dark:text-sky-400">{openOrdersCount} un.</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Factory Orders Alerts (Pedidos em Trânsito) */}
        <div className="bg-white dark:bg-neutral-900 rounded-3xl p-5 md:p-6 border border-slate-200 dark:border-neutral-800 shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-blue-500/10 rounded-2xl text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-900/40">
                <Truck className="w-5 h-5" />
              </div>
              <div>
                <span className="text-slate-500 dark:text-slate-400 text-[10px] font-bold uppercase tracking-widest block mb-0.5">
                  Logística J. Toledo
                </span>
                <h3 className="text-[17px] font-bold text-slate-900 dark:text-white">Pedidos em Trânsito</h3>
              </div>
            </div>
            <span className="bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-800 text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">
              {transitOrders.length} Lotes Ativos
            </span>
          </div>

          <div className="space-y-2.5 flex-1">
            {transitOrders.length === 0 ? (
              <div className="p-8 text-center text-slate-400 dark:text-neutral-500 text-[13px]">
                Nenhum lote de fábrica em trânsito no momento.
              </div>
            ) : (
              transitOrders.map((order) => (
                <div 
                  key={order.id}
                  onClick={() => setSelectedTransit(order)}
                  className="bg-slate-50 dark:bg-neutral-800/60 border border-slate-200 dark:border-neutral-800 rounded-2xl p-3.5 flex justify-between items-center hover:bg-slate-100 dark:hover:bg-neutral-800 hover:border-slate-300 dark:hover:border-neutral-700 transition-all cursor-pointer group"
                >
                  <div>
                    <p className="text-[13px] font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      {order.batchName}
                    </p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">{order.eta}</p>
                  </div>

                  <div className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider border ${
                    order.status === 'Chegando' 
                      ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/40' 
                      : order.status === 'Atrasado'
                      ? 'bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800/40'
                      : 'bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800/40'
                  }`}>
                    {order.status}
                  </div>
                </div>
              ))
            )}
          </div>

          <button 
            onClick={() => onNavigate('purchase')}
            className="mt-4 text-blue-600 dark:text-blue-400 text-[12px] font-bold hover:underline w-full text-center py-1"
          >
            Fazer novo pedido de fábrica →
          </button>
        </div>

        {/* Bento Quick Shortcuts */}
        <div className="bg-white dark:bg-neutral-900 rounded-3xl p-5 md:p-6 border border-slate-200 dark:border-neutral-800 shadow-sm flex flex-col">
          <div className="flex items-center gap-2 mb-4">
            <Zap className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <span className="text-slate-500 dark:text-slate-400 text-[10px] font-bold uppercase tracking-widest">
              Ações Rápidas do Dealer
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3 flex-1">
            {/* Shortcut 1: Novo Veículo */}
            <button 
              onClick={onOpenNewVehicleModal}
              className="bg-slate-50 dark:bg-neutral-800/70 border border-slate-200 dark:border-neutral-800 hover:border-blue-500 hover:bg-slate-100 dark:hover:bg-neutral-800 p-4 rounded-2xl flex flex-col items-center justify-center gap-2 transition-all group text-center"
            >
              <div className="w-9 h-9 rounded-xl bg-slate-200 dark:bg-neutral-800 flex items-center justify-center text-slate-700 dark:text-slate-300 group-hover:text-blue-600 dark:group-hover:text-blue-400 group-hover:scale-110 transition-all border border-slate-300 dark:border-neutral-700">
                <Bike className="w-4 h-4" />
              </div>
              <span className="text-[12px] font-bold text-slate-900 dark:text-white">Novo Veículo</span>
              <span className="text-[10px] text-slate-500 dark:text-slate-400">Cadastrar no estoque</span>
            </button>

            {/* Shortcut 2: Gerar Pedido */}
            <button 
              onClick={() => onNavigate('purchase')}
              className="bg-slate-50 dark:bg-neutral-800/70 border border-slate-200 dark:border-neutral-800 hover:border-blue-500 hover:bg-slate-100 dark:hover:bg-neutral-800 p-4 rounded-2xl flex flex-col items-center justify-center gap-2 transition-all group text-center"
            >
              <div className="w-9 h-9 rounded-xl bg-slate-200 dark:bg-neutral-800 flex items-center justify-center text-slate-700 dark:text-slate-300 group-hover:text-blue-600 dark:group-hover:text-blue-400 group-hover:scale-110 transition-all border border-slate-300 dark:border-neutral-700">
                <FileText className="w-4 h-4" />
              </div>
              <span className="text-[12px] font-bold text-slate-900 dark:text-white">Gerar Pedido</span>
              <span className="text-[10px] text-slate-500 dark:text-slate-400">Comprar da fábrica</span>
            </button>

            {/* Shortcut 3: Novo Lead CRM */}
            <button 
              onClick={onOpenNewLeadModal}
              className="bg-slate-50 dark:bg-neutral-800/70 border border-slate-200 dark:border-neutral-800 hover:border-blue-500 hover:bg-slate-100 dark:hover:bg-neutral-800 p-4 rounded-2xl flex flex-col items-center justify-center gap-2 transition-all group text-center"
            >
              <div className="w-9 h-9 rounded-xl bg-slate-200 dark:bg-neutral-800 flex items-center justify-center text-slate-700 dark:text-slate-300 group-hover:text-blue-600 dark:group-hover:text-blue-400 group-hover:scale-110 transition-all border border-slate-300 dark:border-neutral-700">
                <UserCheck className="w-4 h-4" />
              </div>
              <span className="text-[12px] font-bold text-slate-900 dark:text-white">Novo Lead CRM</span>
              <span className="text-[10px] text-slate-500 dark:text-slate-400">Registrar proposta</span>
            </button>

            {/* Shortcut 4: Ordem de Serviço */}
            <button 
              onClick={() => onNavigate('inventory')}
              className="bg-slate-50 dark:bg-neutral-800/70 border border-slate-200 dark:border-neutral-800 hover:border-blue-500 hover:bg-slate-100 dark:hover:bg-neutral-800 p-4 rounded-2xl flex flex-col items-center justify-center gap-2 transition-all group text-center"
            >
              <div className="w-9 h-9 rounded-xl bg-slate-200 dark:bg-neutral-800 flex items-center justify-center text-slate-700 dark:text-slate-300 group-hover:text-blue-600 dark:group-hover:text-blue-400 group-hover:scale-110 transition-all border border-slate-300 dark:border-neutral-700">
                <Wrench className="w-4 h-4" />
              </div>
              <span className="text-[12px] font-bold text-slate-900 dark:text-white">Ordem Serviço</span>
              <span className="text-[10px] text-slate-500 dark:text-slate-400">Abertura de O.S.</span>
            </button>
          </div>
        </div>
      </div>

      {/* Shipment Detail Modal */}
      {selectedTransit && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white dark:bg-neutral-900 rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 dark:border-neutral-800 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-blue-500/10 rounded-2xl text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-900/40">
                  <Truck className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-[16px] font-bold text-slate-900 dark:text-white">{selectedTransit.batchName}</h4>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">JT-BR{selectedTransit.id.toUpperCase()}</span>
                </div>
              </div>
              <button 
                onClick={() => setSelectedTransit(null)}
                className="text-slate-400 hover:text-slate-900 dark:hover:text-white text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 py-3 border-y border-slate-200 dark:border-neutral-800 text-[13px]">
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-slate-400">Status da Carga:</span>
                <span className="font-bold text-blue-600 dark:text-blue-400">{selectedTransit.status}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-slate-400">Previsão Entrega:</span>
                <span className="font-semibold text-slate-900 dark:text-white">{selectedTransit.eta}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-slate-400">Local Atual:</span>
                <span className="font-semibold text-slate-900 dark:text-white">{selectedTransit.location || 'Em rota'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-slate-400">Transportadora:</span>
                <span className="font-semibold text-slate-900 dark:text-white">Expresso Suzuki Logística S/A</span>
              </div>
            </div>

            <div className="mt-5">
              <button 
                onClick={() => setSelectedTransit(null)}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-xl font-bold text-[13px] transition-colors"
              >
                OK, Entendido
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
