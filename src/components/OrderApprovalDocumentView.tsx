import React, { useState, useMemo } from 'react';
import { 
  OrderApprovalDocument, 
  DealershipFullProfile,
  DealershipScope,
  BrandType,
  StockScheduleItem,
  ProposalPricingItem
} from '../types';
import { 
  FileText, 
  CheckCircle2, 
  Printer, 
  Download, 
  Sparkles, 
  SlidersHorizontal, 
  Building2, 
  ShieldCheck, 
  AlertTriangle, 
  TrendingUp, 
  Send, 
  Edit3, 
  Check, 
  X, 
  Plus, 
  Trash2, 
  ArrowLeft,
  Calendar,
  Layers,
  Database,
  Search,
  Filter,
  CheckCheck,
  RefreshCw,
  Coins,
  BadgePercent
} from 'lucide-react';

interface OrderApprovalDocumentViewProps {
  proposals: OrderApprovalDocument[];
  dealerships: DealershipFullProfile[];
  currentScope: DealershipScope;
  onUpdateProposal: (updated: OrderApprovalDocument) => void;
  onCreateProposal?: (newProposal: OrderApprovalDocument) => void;
  onBackToOrders?: () => void;
  onNavigateToCommitments?: () => void;
}

export const OrderApprovalDocumentView: React.FC<OrderApprovalDocumentViewProps> = ({
  proposals,
  dealerships,
  currentScope,
  onUpdateProposal,
  onCreateProposal,
  onBackToOrders,
  onNavigateToCommitments
}) => {
  const isMontadora = currentScope === 'jtoledo';
  
  // Selected Proposal
  const [selectedProposalId, setSelectedProposalId] = useState<string>(
    proposals[0]?.id || 'prop-721-feltrin'
  );

  // View Mode: 'document' (Visual Fiel do Papel Anexo) or 'interactive' (Editor de Crédito & Tributos)
  const [viewMode, setViewMode] = useState<'document' | 'interactive'>('document');

  // Search & Filters for Proposals
  const [searchQuery, setSearchQuery] = useState('');
  const [brandFilter, setBrandFilter] = useState<string>('todas');
  const [statusFilter, setStatusFilter] = useState<string>('todos');

  // Toast feedback
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Active Proposal object
  const activeProposal = useMemo(() => {
    return proposals.find(p => p.id === selectedProposalId) || proposals[0];
  }, [proposals, selectedProposalId]);

  // Filtered Proposals list
  const filteredProposals = useMemo(() => {
    return proposals.filter(p => {
      const matchSearch = 
        p.proposalNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.dealershipName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.dealerCode.includes(searchQuery) ||
        p.brand.toLowerCase().includes(searchQuery.toLowerCase());
      const matchBrand = brandFilter === 'todas' || p.brand === brandFilter;
      const matchStatus = statusFilter === 'todos' || p.status === statusFilter;
      return matchSearch && matchBrand && matchStatus;
    });
  }, [proposals, searchQuery, brandFilter, statusFilter]);

  // Calculations for Active Proposal
  const stockTotals = useMemo(() => {
    if (!activeProposal) return { own: 0, binBloq: 0, binLib: 0, m1Comp: 0, m1Pur: 0, m2Comp: 0, m2Pur: 0, m3Comp: 0, m3Pur: 0, totalGeneral: 0 };
    return activeProposal.stockSchedule.reduce((acc, row) => {
      const own = acc.own + row.currentStockOwn;
      const binBloq = acc.binBloq + row.currentStockBinBlocked;
      const binLib = acc.binLib + row.currentStockBinLiberated;
      return {
        own,
        binBloq,
        binLib,
        m1Comp: acc.m1Comp + row.month1Commitment,
        m1Pur: acc.m1Pur + row.month1Purchase,
        m2Comp: acc.m2Comp + row.month2Commitment,
        m2Pur: acc.m2Pur + row.month2Purchase,
        m3Comp: acc.m3Comp + row.month3Commitment,
        m3Pur: acc.m3Pur + row.month3Purchase,
        totalGeneral: own + binBloq + binLib
      };
    }, { own: 0, binBloq: 0, binLib: 0, m1Comp: 0, m1Pur: 0, m2Comp: 0, m2Pur: 0, m3Comp: 0, m3Pur: 0, totalGeneral: 0 });
  }, [activeProposal]);

  const proposalTotals = useMemo(() => {
    if (!activeProposal) return { totalUnits: 0, totalProductsBase: 0, totalFinalAmount: 0 };
    return activeProposal.pricingItems.reduce((acc, item) => ({
      totalUnits: acc.totalUnits + item.quantity,
      totalProductsBase: acc.totalProductsBase + (item.quantity * item.totalProductsUnit),
      totalFinalAmount: acc.totalFinalAmount + item.totalFinalAmount
    }), { totalUnits: 0, totalProductsBase: 0, totalFinalAmount: 0 });
  }, [activeProposal]);

  // Financial Warranty & Credit Calculations
  const creditCalculations = useMemo(() => {
    if (!activeProposal) return { totalUsandoJTA: 0, saldoJTA: 0, totalUsandoJTZ: 0, saldoJTZ: 0, totalGeralUsando: 0, saldoDisponivelGeral: 0 };
    const { creditAnalysis } = activeProposal;
    
    const totalUsandoJTA = creditAnalysis.jtaWithinLimit + creditAnalysis.jtaTestRide + creditAnalysis.jtaOutsideLimitBinBloq + creditAnalysis.jtaProposalAmount;
    const saldoJTA = creditAnalysis.jtaLimit - totalUsandoJTA;

    const totalUsandoJTZ = creditAnalysis.jtzWithinLimit + creditAnalysis.jtzTestRide + creditAnalysis.jtzOutsideLimitBinBloq + creditAnalysis.jtzProposalAmount;
    const saldoJTZ = creditAnalysis.jtzLimit - totalUsandoJTZ;

    const totalGeralUsando = totalUsandoJTA + totalUsandoJTZ;
    const saldoDisponivelGeral = creditAnalysis.unifiedWarrantyTotal - totalGeralUsando;

    return {
      totalUsandoJTA,
      saldoJTA,
      totalUsandoJTZ,
      saldoJTZ,
      totalGeralUsando,
      saldoDisponivelGeral
    };
  }, [activeProposal]);

  // Action Handlers
  const handleApproveFinancial = () => {
    if (!activeProposal) return;
    const updated: OrderApprovalDocument = {
      ...activeProposal,
      financialApproved: true,
      financialApprovedBy: 'Liza (Comitê Financeiro J. Toledo)',
      financialApprovedAt: new Date().toLocaleString('pt-BR'),
      status: activeProposal.commercialApproved ? 'aprovado_geral' : 'aprovado_financeiro'
    };
    onUpdateProposal(updated);
    showToast('Aprovação Financeira JTA+JTZ confirmada!');
  };

  const handleApproveCommercial = () => {
    if (!activeProposal) return;
    const updated: OrderApprovalDocument = {
      ...activeProposal,
      commercialApproved: true,
      commercialApprovedBy: 'Keren (Regional Comercial)',
      commercialApprovedAt: new Date().toLocaleString('pt-BR'),
      status: activeProposal.financialApproved ? 'aprovado_geral' : 'aprovado_comercial'
    };
    onUpdateProposal(updated);
    showToast('Aprovação Comercial confirmada para o pedido!');
  };

  const handleIntegrateProtheus = () => {
    if (!activeProposal) return;
    const prothNum = `PROTH-SC5-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    const updated: OrderApprovalDocument = {
      ...activeProposal,
      status: 'integrado_protheus',
      protheusIntegrated: true,
      protheusOrderNumber: prothNum,
      protheusIntegratedAt: new Date().toLocaleString('pt-BR')
    };
    onUpdateProposal(updated);
    showToast(`Pedido integrado com sucesso no TOTVS Protheus! Chave ERP: ${prothNum}`);
  };

  const handlePrint = () => {
    window.print();
  };

  // Helper currency formatter
  const fmt = (val: number) => {
    return val.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
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

      {/* Header Bar */}
      <div className="bg-[#18181b] border border-[#27272a] rounded-2xl p-5 shadow-xl flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          {onBackToOrders && (
            <button
              onClick={onBackToOrders}
              className="p-2.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white rounded-xl border border-neutral-700 transition-colors"
              title="Voltar para Pedidos ERP"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
          )}
          <div>
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-blue-500/10 text-blue-400 rounded-xl border border-blue-500/20">
                <FileText className="w-5 h-5" />
              </div>
              <h2 className="text-xl font-bold text-neutral-100 flex items-center gap-2">
                Ficha de Aprovação de Pedidos
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300 font-bold border border-blue-500/30">
                  Garantia JTA + JTZ
                </span>
              </h2>
            </div>
            <p className="text-xs text-neutral-400 mt-1">
              Documento oficial da Montadora Grupo J. Toledo para análise de giro, compromissos trimestrais, garantias unificadas e aprovação comercial/financeira.
            </p>
          </div>
        </div>

        {/* View Mode Toggle & Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5 w-full lg:w-auto">
          <div className="bg-neutral-900 border border-neutral-700 p-1 rounded-xl flex items-center">
            <button
              onClick={() => setViewMode('document')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                viewMode === 'document' 
                  ? 'bg-blue-600 text-white shadow-md' 
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Ficha Oficial Impressa</span>
            </button>
            <button
              onClick={() => setViewMode('interactive')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                viewMode === 'interactive' 
                  ? 'bg-blue-600 text-white shadow-md' 
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>Editor & Análise</span>
            </button>
          </div>

          {onNavigateToCommitments && (
            <button
              onClick={onNavigateToCommitments}
              className="px-3.5 py-2 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 rounded-xl text-xs font-bold border border-amber-500/30 flex items-center gap-1.5 transition-colors"
              title="Acessar os Compromissos Mensais que originam esta Ficha"
            >
              <Calendar className="w-4 h-4" />
              <span>Compromissos de Compra</span>
            </button>
          )}

          <button
            onClick={handlePrint}
            className="px-3.5 py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 hover:text-white rounded-xl text-xs font-bold border border-neutral-700 flex items-center gap-1.5 transition-colors"
          >
            <Printer className="w-4 h-4" />
            <span>Imprimir / PDF</span>
          </button>
        </div>
      </div>

      {/* Proposal Selector Strip */}
      <div className="bg-[#18181b] border border-[#27272a] rounded-2xl p-4 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
          <span className="text-xs font-bold text-neutral-400 uppercase tracking-wider whitespace-nowrap mr-2">
            Propostas na Mesa:
          </span>
          {proposals.map(prop => {
            const isSelected = prop.id === selectedProposalId;
            return (
              <button
                key={prop.id}
                onClick={() => setSelectedProposalId(prop.id)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all border flex items-center gap-2 ${
                  isSelected
                    ? 'bg-blue-600 text-white border-blue-400 shadow-md shadow-blue-500/20'
                    : 'bg-neutral-900/80 text-neutral-300 hover:bg-neutral-800 border-neutral-700'
                }`}
              >
                <span className={`w-2 h-2 rounded-full ${
                  prop.brand === 'Suzuki' ? 'bg-blue-400' : prop.brand === 'Haojue' ? 'bg-amber-400' : 'bg-emerald-400'
                }`} />
                <span>{prop.dealershipName}</span>
                <span className="opacity-70 font-normal">({prop.proposalNumber})</span>
              </button>
            );
          })}
        </div>

        {/* Quick Status Pill */}
        {activeProposal && (
          <div className="flex items-center gap-3 w-full md:w-auto justify-end">
            <span className="text-xs text-neutral-400">Status da Ficha:</span>
            <span className={`px-3 py-1 rounded-full text-xs font-bold border flex items-center gap-1.5 ${
              activeProposal.status === 'integrado_protheus'
                ? 'bg-purple-500/10 text-purple-400 border-purple-500/30'
                : activeProposal.status === 'aprovado_geral'
                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                : activeProposal.status === 'aprovado_financeiro'
                ? 'bg-blue-500/10 text-blue-400 border-blue-500/30'
                : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
            }`}>
              {activeProposal.status === 'integrado_protheus' ? (
                <>
                  <CheckCheck className="w-3.5 h-3.5" />
                  <span>Integrado Protheus ({activeProposal.protheusOrderNumber})</span>
                </>
              ) : activeProposal.status === 'aprovado_geral' ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Aprovado Comercial & Financeiro</span>
                </>
              ) : activeProposal.status === 'aprovado_financeiro' ? (
                <>
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Aprovado Financeiro</span>
                </>
              ) : (
                <>
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>Em Análise de Crédito</span>
                </>
              )}
            </span>
          </div>
        )}
      </div>

      {/* Main Content View */}
      {viewMode === 'document' ? (
        /* ========================================================== */
        /* EXACT DOCUMENT LAYOUT (Faithful to physical attached image) */
        /* ========================================================== */
        <div className="bg-white text-black p-8 sm:p-12 rounded-2xl shadow-2xl border border-neutral-300 font-sans max-w-5xl mx-auto printable-approval-document">
          
          {/* Top Line: Date & Brand */}
          <div className="flex items-center justify-between border-b-2 border-black pb-2 mb-4">
            <span className="text-sm font-semibold tracking-wide">{activeProposal.date}</span>
            <span className="text-xl font-extrabold tracking-widest uppercase">{activeProposal.brand}</span>
          </div>

          {/* Dealership Header & Regional Identification */}
          <div className="text-center font-bold text-base mb-3 tracking-tight uppercase">
            {activeProposal.dealershipName}
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs border border-black p-2.5 mb-4 bg-neutral-50/50">
            <div>
              <span className="font-semibold text-neutral-600">Regional Comercial: </span>
              <span className="font-bold uppercase">{activeProposal.regionalComercial}</span>
            </div>
            <div>
              <span className="font-semibold text-neutral-600">Origem: </span>
              <span className="font-bold">{activeProposal.originCode}</span>
            </div>
            <div>
              <span className="font-semibold text-neutral-600">Cód.: </span>
              <span className="font-bold">{activeProposal.dealerCode}</span>
            </div>
            <div>
              <span className="font-semibold text-neutral-600">POR NOTA: </span>
              <span className="font-bold">{activeProposal.bikesPerInvoice}</span>
            </div>
            <div>
              <span className="font-semibold text-neutral-600">MÉDIA EMPLACAMENTO: </span>
              <span className="font-bold">{activeProposal.avgMonthlyRegistration}</span>
            </div>
            <div>
              <span className="font-semibold text-neutral-600">Transp.: </span>
              <span className="font-bold">{activeProposal.transporterCode}</span>
            </div>
            <div>
              <span className="font-semibold text-neutral-600">Tier Rede: </span>
              <span className="font-bold">{activeProposal.dealerTier}</span>
            </div>
            <div>
              <span className="font-semibold text-neutral-600">Regional Financeira: </span>
              <span className="font-bold uppercase">{activeProposal.regionalFinanceira}</span>
            </div>
          </div>

          {/* Table 1: ESTOQUE ATUAL & CRONOGRAMA DE COMPROMISSO/COMPRA */}
          <div className="overflow-x-auto mb-6">
            <table className="w-full text-xs border-collapse border border-black text-center">
              <thead>
                <tr className="bg-neutral-100 font-bold border-b border-black">
                  <th rowSpan={2} className="border-r border-black p-2 text-left">MODELO</th>
                  <th colSpan={3} className="border-r border-black p-1">ESTOQUE ATUAL</th>
                  <th colSpan={2} className="border-r border-black p-1">{activeProposal.month1Label}</th>
                  <th colSpan={2} className="border-r border-black p-1">{activeProposal.month2Label}</th>
                  <th colSpan={2} className="p-1">{activeProposal.month3Label}</th>
                </tr>
                <tr className="bg-neutral-50 font-semibold border-b border-black text-[11px]">
                  <th className="border-r border-black p-1">Próprio</th>
                  <th className="border-r border-black p-1">BIN Bloq</th>
                  <th className="border-r border-black p-1">BIN Lib</th>
                  <th className="border-r border-black p-1">Compromisso</th>
                  <th className="border-r border-black p-1">Compra</th>
                  <th className="border-r border-black p-1">Compromisso</th>
                  <th className="border-r border-black p-1">Compra</th>
                  <th className="border-r border-black p-1">Compromisso</th>
                  <th className="p-1">Compra</th>
                </tr>
              </thead>
              <tbody>
                {activeProposal.stockSchedule.map((row, idx) => (
                  <tr key={idx} className="border-b border-neutral-400 hover:bg-neutral-50">
                    <td className="border-r border-black p-1.5 font-bold text-left">{row.model}</td>
                    <td className="border-r border-black p-1.5">{row.currentStockOwn || '-'}</td>
                    <td className="border-r border-black p-1.5">{row.currentStockBinBlocked || '-'}</td>
                    <td className="border-r border-black p-1.5">{row.currentStockBinLiberated || '-'}</td>
                    <td className="border-r border-black p-1.5">{row.month1Commitment || '-'}</td>
                    <td className="border-r border-black p-1.5 font-bold">{row.month1Purchase || '-'}</td>
                    <td className="border-r border-black p-1.5">{row.month2Commitment || '-'}</td>
                    <td className="border-r border-black p-1.5 font-bold">{row.month2Purchase || '-'}</td>
                    <td className="border-r border-black p-1.5">{row.month3Commitment || '-'}</td>
                    <td className="p-1.5 font-bold">{row.month3Purchase || '-'}</td>
                  </tr>
                ))}
                {/* TOTAL ROW */}
                <tr className="bg-neutral-100 font-bold border-t-2 border-black">
                  <td className="border-r border-black p-1.5 text-left">TOTAL:</td>
                  <td className="border-r border-black p-1.5">{stockTotals.own}</td>
                  <td className="border-r border-black p-1.5">{stockTotals.binBloq}</td>
                  <td className="border-r border-black p-1.5">{stockTotals.binLib}</td>
                  <td className="border-r border-black p-1.5">{stockTotals.m1Comp}</td>
                  <td className="border-r border-black p-1.5 text-blue-700">{stockTotals.m1Pur}</td>
                  <td className="border-r border-black p-1.5">{stockTotals.m2Comp}</td>
                  <td className="border-r border-black p-1.5 text-blue-700">{stockTotals.m2Pur}</td>
                  <td className="border-r border-black p-1.5">{stockTotals.m3Comp}</td>
                  <td className="p-1.5 text-blue-700">{stockTotals.m3Pur}</td>
                </tr>
                {/* TOTAL GERAL ROW */}
                <tr className="bg-neutral-200 font-extrabold border-t border-black">
                  <td className="border-r border-black p-1.5 text-left">TOTAL GERAL:</td>
                  <td colSpan={3} className="border-r border-black p-1.5 text-left pl-3">{stockTotals.totalGeneral}</td>
                  <td colSpan={6} className="p-1.5"></td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Section Transition Text */}
          <div className="text-xs italic text-neutral-700 mb-4 flex items-center justify-between border-t border-dashed border-neutral-400 pt-3">
            <span>Solicito faturamento das seguintes motos nas seguintes condições de pagamento:</span>
            <span className="font-bold not-italic">Regional Financeira: {activeProposal.regionalFinanceira}</span>
          </div>

          {/* TWO MAIN BOXES: LEFT (PLANILHA DE PROPOSTA & CRÉDITO) vs RIGHT (LOTES DE PRODUTOS & IMPOSTOS) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            {/* LEFT BOX: PLANILHA DE PROPOSTA - GARANTIAS JTA + JTZ */}
            <div className="lg:col-span-6 border-2 border-black rounded-xl p-4 bg-white relative">
              <div className="text-center font-black text-xs uppercase border-b-2 border-black pb-2 mb-3">
                PLANILHA DE PROPOSTA - {activeProposal.legalName}
                <div className="text-[11px] font-bold text-neutral-700 mt-0.5">
                  CONCESSIONÁRIA {activeProposal.dealerTier.toUpperCase()}
                </div>
              </div>

              {/* GARANTIA UNIFICADA HEADER */}
              <div className="bg-neutral-200 p-2 font-bold text-xs flex justify-between items-center rounded border border-black mb-3">
                <span className="tracking-wide">GARANTIA UNIFICADA JTA+JTZ</span>
                <span className="font-extrabold text-sm">R$ {fmt(activeProposal.creditAnalysis.unifiedWarrantyTotal)}</span>
              </div>

              {/* GARANTIA JTA (Suzuki) */}
              <div className="mb-4 text-xs space-y-1">
                <div className="flex justify-between font-extrabold border-b border-black pb-0.5">
                  <span>GARANTIA JTA (SUZUKI)</span>
                  <span>R$ {fmt(activeProposal.creditAnalysis.jtaLimit)}</span>
                </div>
                <div className="flex justify-between text-neutral-800 pl-2">
                  <span>DENTRO DO LIMITE (FAT A PRAZO)</span>
                  <span>{fmt(activeProposal.creditAnalysis.jtaWithinLimit)}</span>
                </div>
                <div className="flex justify-between text-neutral-800 pl-2">
                  <span>TEST RIDE</span>
                  <span>{fmt(activeProposal.creditAnalysis.jtaTestRide)}</span>
                </div>
                <div className="flex justify-between text-neutral-800 pl-2">
                  <span>FORA DO LIMITE (BIN BLOQ)</span>
                  <span>{fmt(activeProposal.creditAnalysis.jtaOutsideLimitBinBloq)}</span>
                </div>
                <div className="flex justify-between text-neutral-800 pl-2">
                  <span>VALOR DA PROPOSTA JTA</span>
                  <span>{fmt(activeProposal.creditAnalysis.jtaProposalAmount)}</span>
                </div>
                <div className="flex justify-between font-bold text-black border-t border-neutral-400 pt-0.5 pl-2">
                  <span>TOTAL USANDO + PROPOSTA JTA</span>
                  <span>{fmt(creditCalculations.totalUsandoJTA)}</span>
                </div>
                <div className={`flex justify-between font-bold pl-2 ${creditCalculations.saldoJTA < 0 ? 'text-red-600' : 'text-emerald-700'}`}>
                  <span>SALDO JTA</span>
                  <span>{fmt(creditCalculations.saldoJTA)}</span>
                </div>
              </div>

              {/* GARANTIA JTZ (Haojue / Zontes) */}
              <div className="mb-4 text-xs space-y-1">
                <div className="flex justify-between font-extrabold border-b border-black pb-0.5">
                  <span>GARANTIA JTZ (HAOJUE / ZONTES)</span>
                  <span>R$ {fmt(activeProposal.creditAnalysis.jtzLimit)}</span>
                </div>
                <div className="flex justify-between text-neutral-800 pl-2">
                  <span>DENTRO DO LIMITE</span>
                  <span>{fmt(activeProposal.creditAnalysis.jtzWithinLimit)}</span>
                </div>
                <div className="flex justify-between text-neutral-800 pl-2">
                  <span>TEST RIDE</span>
                  <span>{fmt(activeProposal.creditAnalysis.jtzTestRide)}</span>
                </div>
                <div className="flex justify-between text-neutral-800 pl-2">
                  <span>FORA DO LIMITE</span>
                  <span>{fmt(activeProposal.creditAnalysis.jtzOutsideLimitBinBloq)}</span>
                </div>
                <div className="flex justify-between text-neutral-800 pl-2 font-bold text-blue-800">
                  <span>VALOR DA PROPOSTA JTZ</span>
                  <span>{fmt(activeProposal.creditAnalysis.jtzProposalAmount)}</span>
                </div>
                <div className="flex justify-between font-bold text-black border-t border-neutral-400 pt-0.5 pl-2">
                  <span>TOTAL USANDO + PROPOSTA JTZ</span>
                  <span>{fmt(creditCalculations.totalUsandoJTZ)}</span>
                </div>
                <div className={`flex justify-between font-bold pl-2 ${creditCalculations.saldoJTZ < 0 ? 'text-red-600' : 'text-emerald-700'}`}>
                  <span>SALDO JTZ</span>
                  <span>{fmt(creditCalculations.saldoJTZ)}</span>
                </div>
              </div>

              {/* CONSOLIDATED JTA + JTZ TOTALS */}
              <div className="bg-neutral-100 p-2.5 rounded-lg border border-black space-y-1 text-xs font-bold mb-3">
                <div className="flex justify-between">
                  <span>TOTAL COM PROPOSTA JTA + JTZ</span>
                  <span className="text-sm">R$ {fmt(creditCalculations.totalGeralUsando)}</span>
                </div>
                <div className={`flex justify-between text-sm ${creditCalculations.saldoDisponivelGeral < 0 ? 'text-red-600' : 'text-emerald-700'}`}>
                  <span>SALDO DISPONÍVEL JTA+JTZ</span>
                  <span>R$ {fmt(creditCalculations.saldoDisponivelGeral)}</span>
                </div>
              </div>

              {/* HISTÓRICO DE PAGAMENTO */}
              <div className="flex items-center justify-between p-2 bg-neutral-200 rounded border border-black text-xs font-extrabold">
                <span>HISTÓRICO DE PAGAMENTO</span>
                <span className="text-emerald-800 uppercase px-2 py-0.5 bg-emerald-100 rounded border border-emerald-400">
                  {activeProposal.creditAnalysis.paymentHistory}
                </span>
              </div>

              {/* Handwritten Note Callout Overlay (Styled authentically as in paper) */}
              <div className="mt-4 p-3 bg-amber-50 border-2 border-dashed border-blue-500 rounded-xl font-serif text-blue-900 text-xs transform -rotate-1 shadow-md relative">
                <div className="font-bold text-[13px] italic flex items-center gap-1 mb-1">
                  ✍️ Consulta Financeiro Concessionária:
                </div>
                <ul className="list-disc list-inside space-y-0.5 text-[12px] italic">
                  {activeProposal.handwrittenNotes.map((note, nIdx) => (
                    <li key={nIdx}>{note}</li>
                  ))}
                </ul>
                <div className="mt-2 text-right">
                  <span className="border-2 border-blue-700 text-blue-800 font-extrabold uppercase px-2 py-0.5 text-[11px] rounded transform rotate-2 inline-block">
                    Aprovação Financeira ✓
                  </span>
                </div>
              </div>
            </div>

            {/* RIGHT BOX: ITENS DA PROPOSTA DE FATURAMENTO / PREÇO E IMPOSTOS */}
            <div className="lg:col-span-6 space-y-4">
              {activeProposal.pricingItems.map((item, idx) => (
                <div key={item.id || idx} className="border-2 border-black rounded-xl p-3.5 bg-white text-xs space-y-1">
                  
                  {/* Header of Item */}
                  <div className="grid grid-cols-2 gap-2 border-b border-black pb-1.5 mb-1.5 font-bold">
                    <div>
                      <span className="text-neutral-500">Quant.: </span>
                      <span className="text-sm font-extrabold text-blue-800">{item.quantity}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-neutral-500">Modelo: </span>
                      <span className="text-sm font-extrabold">{item.modelName} {item.modelYear}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-1 text-[11px] text-neutral-700 mb-2 border-b border-neutral-300 pb-1">
                    <div><span className="font-semibold">COR:</span> {item.colorCode}</div>
                    <div><span className="font-semibold">Pagto:</span> {item.paymentCondition} ({fmt(item.interestRatePercent)}%)</div>
                    <div><span className="font-semibold">Frete:</span> {item.freightType}</div>
                  </div>

                  {/* Pricing Breakdown Lines */}
                  <div className="space-y-0.5 text-xs text-neutral-800">
                    <div className="flex justify-between">
                      <span>Fundo Reserva</span>
                      <span>{fmt(item.reserveFundUnit)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Preço Sugerido (MSRP)</span>
                      <span>{fmt(item.suggestedMSRPUnit)}</span>
                    </div>
                    <div className="flex justify-between font-semibold">
                      <span>Produtos Base</span>
                      <span>{fmt(item.productsBaseUnit)}</span>
                    </div>
                    <div className="flex justify-between text-neutral-600">
                      <span>Desconto R$</span>
                      <span>{fmt(item.discountUnit)}</span>
                    </div>
                    <div className="flex justify-between font-bold border-t border-neutral-300 pt-0.5">
                      <span>Total Produtos Unit.</span>
                      <span>{fmt(item.totalProductsUnit)}</span>
                    </div>
                    <div className="flex justify-between text-neutral-600">
                      <span>ICMS Unit.</span>
                      <span>{fmt(item.icmsUnit)}</span>
                    </div>
                    <div className="flex justify-between text-neutral-600">
                      <span>PIS/COFINS Unit.</span>
                      <span>{fmt(item.pisCofinsUnit)}</span>
                    </div>
                    <div className="flex justify-between font-extrabold text-blue-900 border-t border-neutral-400 pt-0.5">
                      <span>Valor Final Unitário</span>
                      <span>R$ {fmt(item.finalUnitValue)}</span>
                    </div>
                    <div className="flex justify-between text-neutral-700">
                      <span>Tot. Produtos ({item.quantity} un)</span>
                      <span>R$ {fmt(item.totalProductsSubtotal)}</span>
                    </div>
                    <div className="flex justify-between font-black text-sm bg-neutral-100 p-1 rounded border border-black mt-1">
                      <span>TOTAL DO LOTE</span>
                      <span className="text-blue-900">R$ {fmt(item.totalFinalAmount)}</span>
                    </div>
                  </div>
                </div>
              ))}

              {/* TOTAL GERAL DA PROPOSTA */}
              <div className="bg-neutral-900 text-white p-4 rounded-xl border border-black flex items-center justify-between">
                <div>
                  <div className="text-[10px] text-neutral-400 font-bold uppercase tracking-widest">Total Geral da Proposta</div>
                  <div className="text-xs text-neutral-300 font-medium">({proposalTotals.totalUnits} motocicletas)</div>
                </div>
                <div className="text-xl font-extrabold text-emerald-400">
                  R$ {fmt(proposalTotals.totalFinalAmount)}
                </div>
              </div>
            </div>
          </div>

          {/* BOTTOM APPROVAL SIGNATURES & OFFICIAL STAMPS */}
          <div className="mt-8 pt-6 border-t-2 border-black grid grid-cols-1 md:grid-cols-3 gap-6 text-xs text-center">
            
            {/* Regional Comercial Stamp */}
            <div className="border border-black rounded-lg p-3 bg-neutral-50/70">
              <div className="text-[10px] font-bold text-neutral-500 uppercase">Parecer Regional Comercial</div>
              <div className="font-extrabold text-sm uppercase mt-1">{activeProposal.regionalComercial}</div>
              <div className="text-[11px] text-neutral-600 mt-1">{activeProposal.commercialNotes || 'Liberado para faturamento conforme meta.'}</div>
              <div className="mt-3 pt-2 border-t border-neutral-400 text-[10px] font-semibold text-emerald-700 flex items-center justify-center gap-1">
                {activeProposal.commercialApproved ? (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Aprovado em {activeProposal.commercialApprovedAt || '18/05/2026'}</span>
                  </>
                ) : (
                  <span className="text-amber-600">Aguardando Avaliação</span>
                )}
              </div>
            </div>

            {/* Regional Financeira Stamp */}
            <div className="border border-black rounded-lg p-3 bg-neutral-50/70">
              <div className="text-[10px] font-bold text-neutral-500 uppercase">Comitê de Crédito JTA+JTZ</div>
              <div className="font-extrabold text-sm uppercase mt-1">{activeProposal.regionalFinanceira}</div>
              <div className="text-[11px] text-neutral-600 mt-1">{activeProposal.financialNotes || 'Garantia unificada e histórico BOM confirmados.'}</div>
              <div className="mt-3 pt-2 border-t border-neutral-400 text-[10px] font-semibold text-emerald-700 flex items-center justify-center gap-1">
                {activeProposal.financialApproved ? (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Aprovado em {activeProposal.financialApprovedAt || '18/05/2026'}</span>
                  </>
                ) : (
                  <span className="text-amber-600">Aguardando Avaliação</span>
                )}
              </div>
            </div>

            {/* Protheus ERP Gate */}
            <div className="border border-black rounded-lg p-3 bg-neutral-50/70">
              <div className="text-[10px] font-bold text-neutral-500 uppercase">TOTVS Protheus ERP</div>
              <div className="font-extrabold text-sm uppercase mt-1">Armazém Manaus</div>
              <div className="text-[11px] text-neutral-600 mt-1">
                {activeProposal.protheusIntegrated 
                  ? `Chave SC5: ${activeProposal.protheusOrderNumber}` 
                  : 'Pronto para transmissão EDI'}
              </div>
              <div className="mt-3 pt-2 border-t border-neutral-400 text-[10px] font-semibold text-purple-700 flex items-center justify-center gap-1">
                {activeProposal.protheusIntegrated ? (
                  <>
                    <CheckCheck className="w-3.5 h-3.5 text-purple-600" />
                    <span>Transmitido em {activeProposal.protheusIntegratedAt}</span>
                  </>
                ) : (
                  <span className="text-neutral-500">Pendente Integração</span>
                )}
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* ========================================================== */
        /* INTERACTIVE CREDIT SIMULATOR & AUDIT VIEW */
        /* ========================================================== */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Left Column: Credit Adjuster & Parameters */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* Credit Engine Box */}
            <div className="bg-[#18181b] border border-[#27272a] rounded-2xl p-5 shadow-xl">
              <h3 className="text-base font-bold text-neutral-100 flex items-center gap-2 mb-4">
                <Coins className="w-5 h-5 text-blue-400" />
                <span>Simulação de Garantias JTA + JTZ</span>
              </h3>

              <div className="space-y-4 text-xs">
                <div>
                  <label className="text-neutral-400 font-semibold mb-1 block">Garantia Unificada Total (R$)</label>
                  <input
                    type="number"
                    value={activeProposal.creditAnalysis.unifiedWarrantyTotal}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      onUpdateProposal({
                        ...activeProposal,
                        creditAnalysis: {
                          ...activeProposal.creditAnalysis,
                          unifiedWarrantyTotal: val
                        }
                      });
                    }}
                    className="w-full bg-neutral-900 border border-neutral-700 rounded-xl px-3.5 py-2.5 text-white font-bold"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3 pt-2 border-t border-neutral-800">
                  <div>
                    <label className="text-neutral-400 font-semibold mb-1 block">Limite JTA Suzuki (R$)</label>
                    <input
                      type="number"
                      value={activeProposal.creditAnalysis.jtaLimit}
                      onChange={(e) => {
                        const val = Number(e.target.value);
                        onUpdateProposal({
                          ...activeProposal,
                          creditAnalysis: {
                            ...activeProposal.creditAnalysis,
                            jtaLimit: val
                          }
                        });
                      }}
                      className="w-full bg-neutral-900 border border-neutral-700 rounded-xl px-3 py-2 text-white font-bold"
                    />
                  </div>
                  <div>
                    <label className="text-neutral-400 font-semibold mb-1 block">Fora Limite BIN Bloq JTA (R$)</label>
                    <input
                      type="number"
                      value={activeProposal.creditAnalysis.jtaOutsideLimitBinBloq}
                      onChange={(e) => {
                        const val = Number(e.target.value);
                        onUpdateProposal({
                          ...activeProposal,
                          creditAnalysis: {
                            ...activeProposal.creditAnalysis,
                            jtaOutsideLimitBinBloq: val
                          }
                        });
                      }}
                      className="w-full bg-neutral-900 border border-neutral-700 rounded-xl px-3 py-2 text-white font-bold"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-2 border-t border-neutral-800">
                  <div>
                    <label className="text-neutral-400 font-semibold mb-1 block">Limite JTZ Haojue/Zontes (R$)</label>
                    <input
                      type="number"
                      value={activeProposal.creditAnalysis.jtzLimit}
                      onChange={(e) => {
                        const val = Number(e.target.value);
                        onUpdateProposal({
                          ...activeProposal,
                          creditAnalysis: {
                            ...activeProposal.creditAnalysis,
                            jtzLimit: val
                          }
                        });
                      }}
                      className="w-full bg-neutral-900 border border-neutral-700 rounded-xl px-3 py-2 text-white font-bold"
                    />
                  </div>
                  <div>
                    <label className="text-neutral-400 font-semibold mb-1 block">Proposta JTZ Solicitada (R$)</label>
                    <input
                      type="number"
                      value={activeProposal.creditAnalysis.jtzProposalAmount}
                      onChange={(e) => {
                        const val = Number(e.target.value);
                        onUpdateProposal({
                          ...activeProposal,
                          creditAnalysis: {
                            ...activeProposal.creditAnalysis,
                            jtzProposalAmount: val
                          }
                        });
                      }}
                      className="w-full bg-neutral-900 border border-neutral-700 rounded-xl px-3 py-2 text-white font-bold"
                    />
                  </div>
                </div>

                {/* Real-time calculated balances */}
                <div className="bg-neutral-900/90 border border-neutral-700 p-3.5 rounded-xl space-y-2 text-xs">
                  <div className="flex justify-between text-neutral-300">
                    <span>Consumo Consolidado JTA+JTZ:</span>
                    <span className="font-bold text-white">R$ {fmt(creditCalculations.totalGeralUsando)}</span>
                  </div>
                  <div className={`flex justify-between font-bold text-sm ${creditCalculations.saldoDisponivelGeral < 0 ? 'text-red-400' : 'text-emerald-400'}`}>
                    <span>Saldo Disponível:</span>
                    <span>R$ {fmt(creditCalculations.saldoDisponivelGeral)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Approval Action Panel */}
            <div className="bg-[#18181b] border border-[#27272a] rounded-2xl p-5 shadow-xl space-y-4">
              <h3 className="text-base font-bold text-neutral-100 flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-400" />
                <span>Alçadas de Decisão J. Toledo</span>
              </h3>

              <div className="space-y-3">
                {/* Financial Approval Button */}
                <button
                  onClick={handleApproveFinancial}
                  disabled={activeProposal.financialApproved}
                  className={`w-full py-3 px-4 rounded-xl text-xs font-bold flex items-center justify-between transition-all ${
                    activeProposal.financialApproved
                      ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-700/50 cursor-default'
                      : 'bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-500/20'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4" />
                    <span>Aprovação Financeira (Liza)</span>
                  </div>
                  <span className="text-[11px] font-normal">
                    {activeProposal.financialApproved ? '✓ Confirmado' : 'Aprovar Agora'}
                  </span>
                </button>

                {/* Commercial Approval Button */}
                <button
                  onClick={handleApproveCommercial}
                  disabled={activeProposal.commercialApproved}
                  className={`w-full py-3 px-4 rounded-xl text-xs font-bold flex items-center justify-between transition-all ${
                    activeProposal.commercialApproved
                      ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-700/50 cursor-default'
                      : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-500/20'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Aprovação Comercial (Keren)</span>
                  </div>
                  <span className="text-[11px] font-normal">
                    {activeProposal.commercialApproved ? '✓ Confirmado' : 'Aprovar Agora'}
                  </span>
                </button>

                {/* Transmit to TOTVS Protheus ERP */}
                <button
                  onClick={handleIntegrateProtheus}
                  disabled={activeProposal.protheusIntegrated}
                  className={`w-full py-3 px-4 rounded-xl text-xs font-bold flex items-center justify-between transition-all ${
                    activeProposal.protheusIntegrated
                      ? 'bg-purple-950/60 text-purple-400 border border-purple-700/50 cursor-default'
                      : 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-lg shadow-purple-500/20'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Database className="w-4 h-4" />
                    <span>Transmitir para TOTVS Protheus ERP</span>
                  </div>
                  <span className="text-[11px] font-normal">
                    {activeProposal.protheusIntegrated ? `✓ ${activeProposal.protheusOrderNumber}` : 'Integrar Pedido'}
                  </span>
                </button>
              </div>
            </div>
          </div>

          {/* Right Column: Pricing Items Editor & Taxes */}
          <div className="lg:col-span-7 space-y-6">
            <div className="bg-[#18181b] border border-[#27272a] rounded-2xl p-5 shadow-xl">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-bold text-neutral-100 flex items-center gap-2">
                  <BadgePercent className="w-5 h-5 text-amber-400" />
                  <span>Composição Tributária & Preço por Lote</span>
                </h3>
                <span className="text-xs text-neutral-400">
                  {activeProposal.pricingItems.length} lotes de modelos
                </span>
              </div>

              <div className="space-y-4">
                {activeProposal.pricingItems.map((item, idx) => (
                  <div key={item.id || idx} className="bg-neutral-900 border border-neutral-800 rounded-xl p-4 space-y-3">
                    <div className="flex items-center justify-between border-b border-neutral-800 pb-2">
                      <div className="font-bold text-sm text-white">
                        {item.modelName} <span className="text-neutral-400 text-xs font-normal">({item.modelYear})</span>
                      </div>
                      <div className="text-xs text-neutral-400">
                        Cor: <span className="font-bold text-white">{item.colorCode}</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                      <div>
                        <label className="text-neutral-400 block mb-1">Quantidade</label>
                        <input
                          type="number"
                          value={item.quantity}
                          onChange={(e) => {
                            const newQty = Math.max(1, Number(e.target.value));
                            const updatedItems = [...activeProposal.pricingItems];
                            const subtotal = newQty * item.totalProductsUnit;
                            const totalFinal = newQty * item.finalUnitValue;
                            updatedItems[idx] = {
                              ...item,
                              quantity: newQty,
                              totalProductsSubtotal: subtotal,
                              totalFinalAmount: totalFinal
                            };
                            onUpdateProposal({
                              ...activeProposal,
                              pricingItems: updatedItems
                            });
                          }}
                          className="w-full bg-neutral-950 border border-neutral-700 rounded-lg px-2.5 py-1.5 text-white font-bold"
                        />
                      </div>

                      <div>
                        <label className="text-neutral-400 block mb-1">Preço Sugerido (R$)</label>
                        <input
                          type="number"
                          value={item.suggestedMSRPUnit}
                          onChange={(e) => {
                            const val = Number(e.target.value);
                            const updatedItems = [...activeProposal.pricingItems];
                            updatedItems[idx] = { ...item, suggestedMSRPUnit: val };
                            onUpdateProposal({ ...activeProposal, pricingItems: updatedItems });
                          }}
                          className="w-full bg-neutral-950 border border-neutral-700 rounded-lg px-2.5 py-1.5 text-white font-bold"
                        />
                      </div>

                      <div>
                        <label className="text-neutral-400 block mb-1">Desconto Unit. (R$)</label>
                        <input
                          type="number"
                          value={item.discountUnit}
                          onChange={(e) => {
                            const val = Number(e.target.value);
                            const updatedItems = [...activeProposal.pricingItems];
                            const totProd = item.productsBaseUnit - val;
                            const finalUnit = totProd + item.icmsUnit + item.pisCofinsUnit;
                            updatedItems[idx] = {
                              ...item,
                              discountUnit: val,
                              totalProductsUnit: totProd,
                              finalUnitValue: finalUnit,
                              totalProductsSubtotal: item.quantity * totProd,
                              totalFinalAmount: item.quantity * finalUnit
                            };
                            onUpdateProposal({ ...activeProposal, pricingItems: updatedItems });
                          }}
                          className="w-full bg-neutral-950 border border-neutral-700 rounded-lg px-2.5 py-1.5 text-white font-bold"
                        />
                      </div>

                      <div>
                        <label className="text-neutral-400 block mb-1">Fundo Reserva (R$)</label>
                        <input
                          type="number"
                          value={item.reserveFundUnit}
                          onChange={(e) => {
                            const val = Number(e.target.value);
                            const updatedItems = [...activeProposal.pricingItems];
                            updatedItems[idx] = { ...item, reserveFundUnit: val };
                            onUpdateProposal({ ...activeProposal, pricingItems: updatedItems });
                          }}
                          className="w-full bg-neutral-950 border border-neutral-700 rounded-lg px-2.5 py-1.5 text-white font-bold"
                        />
                      </div>
                    </div>

                    {/* Tax & Final Unit values */}
                    <div className="bg-neutral-950/70 p-3 rounded-lg border border-neutral-800 text-xs grid grid-cols-2 sm:grid-cols-3 gap-2">
                      <div>
                        <span className="text-neutral-400 block">ICMS Unit.:</span>
                        <span className="font-bold text-neutral-200">R$ {fmt(item.icmsUnit)}</span>
                      </div>
                      <div>
                        <span className="text-neutral-400 block">PIS/COFINS Unit.:</span>
                        <span className="font-bold text-neutral-200">R$ {fmt(item.pisCofinsUnit)}</span>
                      </div>
                      <div>
                        <span className="text-neutral-400 block">Total do Lote:</span>
                        <span className="font-extrabold text-blue-400 text-sm">R$ {fmt(item.totalFinalAmount)}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
