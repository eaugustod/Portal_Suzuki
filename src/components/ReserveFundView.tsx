import React, { useState, useEffect } from 'react';
import { ReserveFundTransaction, BrandType, DealershipScope } from '../types';
import { INITIAL_RESERVE_FUND_TRANSACTIONS } from '../data/mockReserveFundData';
import { DEALERSHIP_PROFILES } from '../data/mockData';
import { 
  BadgeDollarSign, 
  Plus, 
  ArrowDownLeft, 
  ArrowUpRight, 
  CheckCircle2, 
  Filter, 
  Search, 
  Building2, 
  Info, 
  X,
  Store
} from 'lucide-react';

interface ReserveFundViewProps {
  currentScope: DealershipScope;
  transactions?: ReserveFundTransaction[];
  onAddTransaction?: (tx: ReserveFundTransaction) => void;
  onApproveTransaction?: (id: string) => void;
}

export const ReserveFundView: React.FC<ReserveFundViewProps> = ({
  currentScope,
  transactions = INITIAL_RESERVE_FUND_TRANSACTIONS,
  onAddTransaction,
  onApproveTransaction
}) => {
  const isMontadora = currentScope === 'jtoledo';
  const activeProfile = DEALERSHIP_PROFILES[currentScope];

  const [txList, setTxList] = useState<ReserveFundTransaction[]>(transactions);

  // Sync internal state if external transactions prop changes
  useEffect(() => {
    setTxList(transactions);
  }, [transactions]);

  // Filters
  const [selectedBrandFilter, setSelectedBrandFilter] = useState<BrandType | 'todas'>('todas');
  const [selectedDealerFilter, setSelectedDealerFilter] = useState<string>('todas');
  const [searchQuery, setSearchQuery] = useState('');
  
  // New Entry Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTxType, setNewTxType] = useState<'credito' | 'debito'>('credito');
  const [targetDealerScope, setTargetDealerScope] = useState<DealershipScope>('motosul');
  const [newRef, setNewRef] = useState('APORTA RD STATION / MARKETING');
  const [newBrand, setNewBrand] = useState<BrandType>('Suzuki');
  const [newModel, setNewModel] = useState('');
  const [newChassi, setNewChassi] = useState('');
  const [newAmount, setNewAmount] = useState<number>(1000);
  const [newObs, setNewObs] = useState('');

  // 1. Filter by Dealership Scope first
  const scopeFilteredTransactions = txList.filter(t => {
    if (!isMontadora) {
      // Concessionária view: STRICTLY see only its own transactions
      return t.dealershipId === currentScope;
    }
    // Montadora view: Can filter by specific dealership or see all
    if (selectedDealerFilter !== 'todas') {
      return t.dealershipId === selectedDealerFilter;
    }
    return true;
  });

  // 2. Filter by Brand & Search query
  const filteredTransactions = scopeFilteredTransactions.filter(t => {
    const matchesBrand = selectedBrandFilter === 'todas' || t.brand === selectedBrandFilter;
    const matchesSearch = 
      t.reference.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (t.modelName && t.modelName.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (t.chassi && t.chassi.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (t.orderId && t.orderId.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (t.dealershipName && t.dealershipName.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesBrand && matchesSearch;
  });

  // Calculate totals based on filtered scope
  const totalCreditos = filteredTransactions
    .filter(t => t.type === 'credito' && t.financialApproved)
    .reduce((sum, t) => sum + t.amount, 0);

  const totalDebitos = filteredTransactions
    .filter(t => t.type === 'debito' && t.financialApproved)
    .reduce((sum, t) => sum + t.amount, 0);

  const saldoDisponivel = totalCreditos - totalDebitos;

  const creditTransactions = filteredTransactions.filter(t => t.type === 'credito');
  const debitTransactions = filteredTransactions.filter(t => t.type === 'debito');

  const handleCreateNewTransaction = (e: React.FormEvent) => {
    e.preventDefault();

    const destDealerProfile = DEALERSHIP_PROFILES[targetDealerScope];

    const newTx: ReserveFundTransaction = {
      id: `rf-custom-${Date.now()}`,
      dealershipId: targetDealerScope,
      dealershipName: destDealerProfile ? destDealerProfile.name : targetDealerScope,
      type: newTxType,
      date: new Date().toLocaleDateString('pt-BR'),
      reference: newRef,
      modelName: newModel || undefined,
      chassi: newChassi || undefined,
      amount: Number(newAmount),
      status: isMontadora ? 'aprovado' : 'pendente_financeiro',
      brand: newBrand,
      financialApproved: isMontadora,
      observation: newObs || `Lançamento de ${newTxType} via portal montadora`
    };

    if (onAddTransaction) {
      onAddTransaction(newTx);
    }
    setTxList(prev => [newTx, ...prev]);
    setIsModalOpen(false);
    setNewModel('');
    setNewChassi('');
    setNewObs('');
  };

  const handleToggleApproval = (id: string) => {
    if (onApproveTransaction) {
      onApproveTransaction(id);
    }
    setTxList(prev => prev.map(tx => {
      if (tx.id === id) {
        const updated = !tx.financialApproved;
        return {
          ...tx,
          financialApproved: updated,
          status: updated ? 'aprovado' : 'pendente_financeiro'
        };
      }
      return tx;
    }));
  };

  // Get active dealership list for dropdowns (excluding montadora holding scope)
  const dealershipOptions = Object.entries(DEALERSHIP_PROFILES).filter(
    ([key]) => key !== 'jtoledo'
  );

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-amber-600 via-amber-700 to-amber-900 p-6 text-white shadow-xl">
        <div className="absolute right-0 top-0 -mr-16 -mt-16 w-64 h-64 rounded-full bg-white/5 blur-2xl pointer-events-none" />
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-white/10 rounded-xl backdrop-blur-md border border-white/20">
                <BadgeDollarSign className="w-7 h-7 text-amber-300" />
              </div>
              <div>
                <h1 className="text-2xl font-bold tracking-tight">Fundo de Reserva (Conta Corrente & Extrato)</h1>
                <p className="text-amber-100/80 text-sm mt-0.5 flex items-center gap-1.5">
                  {isMontadora ? (
                    <>
                      <Building2 className="w-4 h-4 text-amber-300" />
                      <span>Cockpit Montadora: Gestão de Créditos & Débitos por Concessionária</span>
                    </>
                  ) : (
                    <>
                      <Store className="w-4 h-4 text-amber-300" />
                      <span>Concessionária Exclusiva: <strong className="text-white">{activeProfile?.name || currentScope}</strong></span>
                    </>
                  )}
                </p>
              </div>
            </div>
          </div>

          {/* Quick Metrics */}
          <div className="flex flex-wrap items-center gap-4 bg-black/20 p-4 rounded-xl backdrop-blur-md border border-white/10">
            <div className="pr-4 border-r border-white/10">
              <span className="text-xs text-amber-200/70 uppercase font-semibold tracking-wider block">Total Crédito</span>
              <span className="text-xl font-extrabold text-emerald-400">
                R$ {totalCreditos.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </span>
            </div>
            <div className="pr-4 border-r border-white/10">
              <span className="text-xs text-amber-200/70 uppercase font-semibold tracking-wider block">Total Utilizado</span>
              <span className="text-xl font-extrabold text-red-400">
                R$ {totalDebitos.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </span>
            </div>
            <div>
              <span className="text-xs text-amber-200/70 uppercase font-semibold tracking-wider block">Saldo Disponível</span>
              <span className="text-2xl font-black text-amber-300">
                R$ {saldoDisponivel.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </span>
            </div>

            {isMontadora && (
              <button
                onClick={() => setIsModalOpen(true)}
                className="ml-2 bg-amber-400 hover:bg-amber-300 text-neutral-900 font-bold px-4 py-2 rounded-lg shadow-lg flex items-center gap-2 text-xs transition-all"
              >
                <Plus className="w-4 h-4 stroke-[3]" />
                Lançar Crédito/Débito
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Info Banner for Dealership View */}
      {!isMontadora && (
        <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 flex items-start gap-3 text-amber-900 dark:text-amber-200">
          <Info className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
          <div className="text-xs space-y-1">
            <p className="font-bold">Extrato de Fundo de Reserva Individualizado</p>
            <p className="text-neutral-600 dark:text-neutral-300">
              Este extrato exibe exclusivamente os lançamentos de bônus, reembolsos e abatimentos vinculados à <strong>{activeProfile?.name}</strong>. Os créditos e débitos são geridos e auditados pelo departamento financeiro da fábrica (JToledo).
            </p>
          </div>
        </div>
      )}

      {/* Filter Toolbar */}
      <div className="bg-white dark:bg-[#18181b] p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 shadow-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          {/* Dealership Filter (Montadora View Only) */}
          {isMontadora && (
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-neutral-500 dark:text-neutral-400 flex items-center gap-1">
                <Building2 className="w-3.5 h-3.5" /> Concessionária:
              </span>
              <select
                value={selectedDealerFilter}
                onChange={(e) => setSelectedDealerFilter(e.target.value)}
                className="bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-white border border-neutral-300 dark:border-neutral-700 rounded-lg px-3 py-1.5 text-xs font-semibold focus:ring-2 focus:ring-amber-500"
              >
                <option value="todas">Todas as Concessionárias (Rede Consolidada)</option>
                {dealershipOptions.map(([key, profile]) => (
                  <option key={key} value={key}>
                    {profile.name} ({profile.city}/{profile.state})
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Brand Selector */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
            <span className="text-xs font-semibold text-neutral-500 dark:text-neutral-400 flex items-center gap-1 mr-1">
              <Filter className="w-3.5 h-3.5" /> Marca:
            </span>
            {(['todas', 'Suzuki', 'Haojue', 'Zontes', 'Hisun', 'Kymco'] as const).map(b => (
              <button
                key={b}
                onClick={() => setSelectedBrandFilter(b as any)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                  selectedBrandFilter === b
                    ? 'bg-amber-500 text-white shadow-sm'
                    : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700'
                }`}
              >
                {b === 'todas' ? 'Todas' : b}
              </button>
            ))}
          </div>
        </div>

        {/* Search */}
        <div className="relative w-full md:w-64">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar referência, chassi, pedido..."
            className="w-full pl-9 pr-4 py-1.5 text-xs bg-neutral-100 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-lg text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
        </div>
      </div>

      {/* Main Extrato View (2 Columns Layout) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Left Column: Créditos Concedidos */}
        <div className="bg-white dark:bg-[#18181b] rounded-xl border border-neutral-200 dark:border-neutral-800 shadow-sm overflow-hidden flex flex-col">
          <div className="p-4 bg-emerald-50 dark:bg-emerald-950/30 border-b border-emerald-200 dark:border-emerald-900/50 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ArrowDownLeft className="w-5 h-5 text-emerald-500" />
              <h2 className="font-bold text-neutral-900 dark:text-emerald-100 text-sm">Créditos Concedidos (Montadora)</h2>
            </div>
            <span className="text-xs bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold px-2.5 py-0.5 rounded-full border border-emerald-500/20">
              {creditTransactions.length} Lançamentos
            </span>
          </div>

          <div className="overflow-x-auto flex-1">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-neutral-100 dark:bg-neutral-800/80 text-neutral-500 dark:text-neutral-400 font-semibold border-b border-neutral-200 dark:border-neutral-700">
                  <th className="py-2.5 px-3">Data</th>
                  {isMontadora && <th className="py-2.5 px-3">Concessionária</th>}
                  <th className="py-2.5 px-3">Referência</th>
                  <th className="py-2.5 px-3">Modelo / Chassi</th>
                  <th className="py-2.5 px-3 text-right">Valor</th>
                  <th className="py-2.5 px-3 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800">
                {creditTransactions.length === 0 ? (
                  <tr>
                    <td colSpan={isMontadora ? 6 : 5} className="py-8 text-center text-neutral-400">Nenhum crédito registrado</td>
                  </tr>
                ) : (
                  creditTransactions.map(tx => (
                    <tr key={tx.id} className="hover:bg-neutral-50 dark:hover:bg-neutral-800/40 transition-colors">
                      <td className="py-2.5 px-3 font-medium text-neutral-600 dark:text-neutral-300">{tx.date}</td>
                      
                      {isMontadora && (
                        <td className="py-2.5 px-3">
                          <span className="inline-flex items-center gap-1 font-semibold text-neutral-900 dark:text-white text-[11px] bg-neutral-100 dark:bg-neutral-800 px-2 py-0.5 rounded border border-neutral-200 dark:border-neutral-700">
                            <Building2 className="w-3 h-3 text-amber-500" />
                            {tx.dealershipName || tx.dealershipId}
                          </span>
                        </td>
                      )}

                      <td className="py-2.5 px-3">
                        <span className="font-bold text-neutral-900 dark:text-white block">{tx.reference}</span>
                        <span className="text-[10px] text-amber-600 dark:text-amber-400 font-semibold">{tx.brand}</span>
                      </td>
                      <td className="py-2.5 px-3 text-neutral-600 dark:text-neutral-300">
                        {tx.modelName && <div className="font-semibold text-neutral-800 dark:text-neutral-200">{tx.modelName}</div>}
                        {tx.chassi && <div className="text-[10px] text-neutral-400">Chassi: {tx.chassi}</div>}
                      </td>
                      <td className="py-2.5 px-3 text-right font-bold text-emerald-600 dark:text-emerald-400">
                        R$ {tx.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        {isMontadora ? (
                          <button
                            onClick={() => handleToggleApproval(tx.id)}
                            title="Alternar aprovação financeira"
                            className={`w-6 h-6 rounded border flex items-center justify-center mx-auto transition-colors ${
                              tx.financialApproved 
                                ? 'bg-emerald-500 border-emerald-600 text-white' 
                                : 'border-neutral-400 bg-neutral-100 dark:bg-neutral-800'
                            }`}
                          >
                            {tx.financialApproved && <CheckCircle2 className="w-4 h-4" />}
                          </button>
                        ) : (
                          <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            tx.financialApproved 
                              ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' 
                              : 'bg-amber-500/10 text-amber-500 border border-amber-500/20'
                          }`}>
                            {tx.financialApproved ? 'Liberado' : 'Em Análise'}
                          </span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Column: Transferido Para (Débitos / Pedidos) */}
        <div className="bg-white dark:bg-[#18181b] rounded-xl border border-neutral-200 dark:border-neutral-800 shadow-sm overflow-hidden flex flex-col">
          <div className="p-4 bg-red-50 dark:bg-red-950/30 border-b border-red-200 dark:border-red-900/50 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ArrowUpRight className="w-5 h-5 text-red-500" />
              <h2 className="font-bold text-neutral-900 dark:text-red-100 text-sm">Transferido Para (Débitos / Pedidos)</h2>
            </div>
            <span className="text-xs bg-red-500/10 text-red-600 dark:text-red-400 font-bold px-2.5 py-0.5 rounded-full border border-red-500/20">
              {debitTransactions.length} Lançamentos
            </span>
          </div>

          <div className="overflow-x-auto flex-1">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-neutral-100 dark:bg-neutral-800/80 text-neutral-500 dark:text-neutral-400 font-semibold border-b border-neutral-200 dark:border-neutral-700">
                  <th className="py-2.5 px-3">Data</th>
                  {isMontadora && <th className="py-2.5 px-3">Concessionária</th>}
                  <th className="py-2.5 px-3">Pedido / Destino</th>
                  <th className="py-2.5 px-3">Observação</th>
                  <th className="py-2.5 px-3 text-right">Valor</th>
                  <th className="py-2.5 px-3 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800">
                {debitTransactions.length === 0 ? (
                  <tr>
                    <td colSpan={isMontadora ? 6 : 5} className="py-8 text-center text-neutral-400">Nenhum débito registrado</td>
                  </tr>
                ) : (
                  debitTransactions.map(tx => (
                    <tr key={tx.id} className="hover:bg-neutral-50 dark:hover:bg-neutral-800/40 transition-colors">
                      <td className="py-2.5 px-3 font-medium text-neutral-600 dark:text-neutral-300">{tx.date}</td>

                      {isMontadora && (
                        <td className="py-2.5 px-3">
                          <span className="inline-flex items-center gap-1 font-semibold text-neutral-900 dark:text-white text-[11px] bg-neutral-100 dark:bg-neutral-800 px-2 py-0.5 rounded border border-neutral-200 dark:border-neutral-700">
                            <Building2 className="w-3 h-3 text-amber-500" />
                            {tx.dealershipName || tx.dealershipId}
                          </span>
                        </td>
                      )}

                      <td className="py-2.5 px-3">
                        <span className="font-bold text-neutral-900 dark:text-white block">
                          {tx.orderId ? `Pedido #${tx.orderId}` : tx.reference}
                        </span>
                        <span className="text-[10px] text-amber-600 dark:text-amber-400 font-semibold">{tx.brand}</span>
                      </td>
                      <td className="py-2.5 px-3 text-neutral-500 dark:text-neutral-400 text-[11px]">
                        {tx.observation || tx.reference}
                      </td>
                      <td className="py-2.5 px-3 text-right font-bold text-red-600 dark:text-red-400">
                        R$ {tx.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        {isMontadora ? (
                          <button
                            onClick={() => handleToggleApproval(tx.id)}
                            title="Alternar aprovação financeira"
                            className={`w-6 h-6 rounded border flex items-center justify-center mx-auto transition-colors ${
                              tx.financialApproved 
                                ? 'bg-emerald-500 border-emerald-600 text-white' 
                                : 'border-neutral-400 bg-neutral-100 dark:bg-neutral-800'
                            }`}
                          >
                            {tx.financialApproved && <CheckCircle2 className="w-4 h-4" />}
                          </button>
                        ) : (
                          <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            tx.financialApproved 
                              ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' 
                              : 'bg-amber-500/10 text-amber-500 border border-amber-500/20'
                          }`}>
                            {tx.financialApproved ? 'Aprovado' : 'Em Análise'}
                          </span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>

      {/* Modal for Creating New Entry (Montadora / Commercial / Marketing) */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#18181b] border border-neutral-200 dark:border-neutral-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-200 dark:border-neutral-800">
              <h3 className="text-base font-bold text-neutral-900 dark:text-white flex items-center gap-2">
                <Plus className="w-5 h-5 text-amber-500" />
                Lançar no Fundo de Reserva
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-neutral-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateNewTransaction} className="space-y-3">
              {/* Type selector: Credit vs Debit */}
              <div className="grid grid-cols-2 gap-2 p-1 bg-neutral-100 dark:bg-neutral-800 rounded-lg">
                <button
                  type="button"
                  onClick={() => setNewTxType('credito')}
                  className={`py-1.5 rounded-md text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                    newTxType === 'credito'
                      ? 'bg-emerald-500 text-white shadow'
                      : 'text-neutral-600 dark:text-neutral-400 hover:text-white'
                  }`}
                >
                  <ArrowDownLeft className="w-3.5 h-3.5" /> Crédito (Aporte)
                </button>
                <button
                  type="button"
                  onClick={() => setNewTxType('debito')}
                  className={`py-1.5 rounded-md text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                    newTxType === 'debito'
                      ? 'bg-red-500 text-white shadow'
                      : 'text-neutral-600 dark:text-neutral-400 hover:text-white'
                  }`}
                >
                  <ArrowUpRight className="w-3.5 h-3.5" /> Débito (Uso)
                </button>
              </div>

              {/* Target Dealership Dropdown */}
              <div>
                <label className="block text-xs font-semibold text-neutral-600 dark:text-neutral-400 mb-1">
                  Concessionária Destino <span className="text-red-500">*</span>
                </label>
                <select
                  value={targetDealerScope}
                  onChange={(e) => setTargetDealerScope(e.target.value as DealershipScope)}
                  className="w-full bg-neutral-100 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-lg p-2 text-xs text-neutral-900 dark:text-white font-bold focus:ring-2 focus:ring-amber-500"
                  required
                >
                  {dealershipOptions.map(([key, profile]) => (
                    <option key={key} value={key}>
                      {profile.name} ({profile.city}/{profile.state})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-600 dark:text-neutral-400 mb-1">Origem / Referência</label>
                <select
                  value={newRef}
                  onChange={(e) => setNewRef(e.target.value)}
                  className="w-full bg-neutral-100 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-lg p-2 text-xs text-neutral-900 dark:text-white"
                >
                  <option value="APORTA RD STATION / MARKETING">Aporte Marketing / RD Station</option>
                  <option value="EMPLACAMENTO GRÁTIS">Emplacamento Grátis</option>
                  <option value="EMPLACAMENTO + RESTITUIÇÃO">Emplacamento + Restituição</option>
                  <option value="BÔNUS COMERCIAL MONTADORA">Bônus Comercial Montadora</option>
                  <option value="DESCONTO EM PEDIDO DE MOTO">Desconto em Pedido de Moto</option>
                  <option value="ABATIMENTO DE FATURA">Abatimento de Fatura</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-neutral-600 dark:text-neutral-400 mb-1">Marca</label>
                  <select
                    value={newBrand}
                    onChange={(e) => setNewBrand(e.target.value as BrandType)}
                    className="w-full bg-neutral-100 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-lg p-2 text-xs text-neutral-900 dark:text-white"
                  >
                    <option value="Suzuki">Suzuki</option>
                    <option value="Haojue">Haojue</option>
                    <option value="Zontes">Zontes</option>
                    <option value="Hisun">Hisun</option>
                    <option value="Kymco">Kymco</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-neutral-600 dark:text-neutral-400 mb-1">Valor (R$)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={newAmount}
                    onChange={(e) => setNewAmount(parseFloat(e.target.value))}
                    className="w-full bg-neutral-100 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-lg p-2 text-xs text-neutral-900 dark:text-white font-bold"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-neutral-600 dark:text-neutral-400 mb-1">Modelo (Opcional)</label>
                  <input
                    type="text"
                    value={newModel}
                    onChange={(e) => setNewModel(e.target.value)}
                    placeholder="Ex: GSX-8S"
                    className="w-full bg-neutral-100 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-lg p-2 text-xs text-neutral-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-neutral-600 dark:text-neutral-400 mb-1">Chassi (Opcional)</label>
                  <input
                    type="text"
                    value={newChassi}
                    onChange={(e) => setNewChassi(e.target.value)}
                    placeholder="Ex: 102719"
                    className="w-full bg-neutral-100 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-lg p-2 text-xs text-neutral-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-600 dark:text-neutral-400 mb-1">Observação / Justificativa</label>
                <textarea
                  value={newObs}
                  onChange={(e) => setNewObs(e.target.value)}
                  placeholder="Detalhamento do lançamento..."
                  rows={2}
                  className="w-full bg-neutral-100 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-lg p-2 text-xs text-neutral-900 dark:text-white"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-lg text-xs font-bold text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="bg-amber-500 hover:bg-amber-600 text-white px-5 py-2 rounded-lg text-xs font-bold shadow-md"
                >
                  Confirmar Lançamento
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
