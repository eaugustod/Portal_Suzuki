import React, { useState } from 'react';
import { InventoryItem, DealershipScope } from '../types';
import { DEALERSHIP_PROFILES } from '../data/mockData';
import { 
  Bike, 
  Search, 
  Filter, 
  Plus, 
  FileSpreadsheet, 
  ExternalLink, 
  Eye, 
  Edit3, 
  Trash2, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  X,
  Sparkles,
  Zap,
  TrendingUp,
  Building2,
  LayoutGrid,
  List
} from 'lucide-react';

interface InventoryViewProps {
  inventory: InventoryItem[];
  onAddVehicle: (item: Omit<InventoryItem, 'id'>) => void;
  onUpdateVehicle: (item: InventoryItem) => void;
  onDeleteVehicle: (id: string) => void;
  searchQuery: string;
  currentScope?: DealershipScope;
}

export const InventoryView: React.FC<InventoryViewProps> = ({
  inventory,
  onAddVehicle,
  onUpdateVehicle,
  onDeleteVehicle,
  searchQuery,
  currentScope = 'motosul'
}) => {
  const [selectedDealershipFilter, setSelectedDealershipFilter] = useState<string>('todos');
  const [selectedStatus, setSelectedStatus] = useState<string>('todos');
  const [selectedColor, setSelectedColor] = useState<string>('todos');
  const [selectedModelFilter, setSelectedModelFilter] = useState<string>('todos');
  const [viewMode, setViewMode] = useState<'detailed' | 'matrix'>('detailed');
  
  // Modals
  const [specModalItem, setSpecModalItem] = useState<InventoryItem | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);

  // Form State for new vehicle
  const [formModel, setFormModel] = useState('GSX-S1000GX');
  const [formYear, setFormYear] = useState('2024');
  const [formVin, setFormVin] = useState('');
  const [formColor, setFormColor] = useState('Azul Metálico');
  const [formColorHex, setFormColorHex] = useState('#1b3b6f');
  const [formCost, setFormCost] = useState('79040');
  const [formRetail, setFormRetail] = useState('98800');
  const [formStatus, setFormStatus] = useState<'disponivel' | 'reservado' | 'vendido'>('disponivel');
  const [formDisplacement, setFormDisplacement] = useState('999 cc Inline-4');
  const [formPower, setFormPower] = useState('152 cv @ 11.000 rpm');
  const [formNotes, setFormNotes] = useState('');

  // Filter logic
  const filteredInventory = inventory.filter(item => {
    const matchesSearch = 
      item.model.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.vin.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.plate && item.plate.toLowerCase().includes(searchQuery.toLowerCase())) ||
      item.color.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesDealer = 
      selectedDealershipFilter === 'todos' || 
      item.dealershipId === selectedDealershipFilter;

    const matchesStatus = selectedStatus === 'todos' || item.status === selectedStatus;
    const matchesColor = selectedColor === 'todos' || item.color === selectedColor;
    const matchesModel = selectedModelFilter === 'todos' || item.model === selectedModelFilter;

    return matchesSearch && matchesDealer && matchesStatus && matchesColor && matchesModel;
  });

  const availableCount = inventory.filter(i => i.status === 'disponivel').length;
  const reservedCount = inventory.filter(i => i.status === 'reservado').length;
  const soldCount = inventory.filter(i => i.status === 'vendido').length;
  const totalStockValue = inventory.reduce((acc, i) => acc + (i.status !== 'vendido' ? i.retailPrice : 0), 0);
  const totalCostValue = inventory.reduce((acc, i) => acc + (i.status !== 'vendido' ? i.costPrice : 0), 0);

  const uniqueModels = Array.from(new Set(inventory.map(i => i.model)));
  const uniqueColors = Array.from(new Set(inventory.map(i => i.color)));
  // Dinâmico: lista de concessionárias com estoque (para a visão montadora)
  const uniqueDealers = Array.from(new Set(inventory.map(i => i.dealershipId || 'motosul')));
  const dealerOptions = uniqueDealers
    .map(id => ({
      id,
      name: (DEALERSHIP_PROFILES[id]?.shortName || DEALERSHIP_PROFILES[id]?.name || id).replace('Suzuki ', '').replace(' Suzuki', '')
    }))
    .filter(d => d.id !== 'jtoledo');

  const handleCreateVehicle = (e: React.FormEvent) => {
    e.preventDefault();
    onAddVehicle({
      model: formModel,
      year: parseInt(formYear) || 2024,
      vin: formVin || `JS1${Math.random().toString(36).substring(2, 10).toUpperCase()}`,
      color: formColor,
      colorHex: formColorHex,
      costPrice: parseFloat(formCost) || 0,
      retailPrice: parseFloat(formRetail) || 0,
      status: formStatus,
      engineDisplacement: formDisplacement,
      power: formPower,
      notes: formNotes,
      arrivedDate: new Date().toLocaleDateString('pt-BR')
    });
    setIsAddModalOpen(false);
    // Reset
    setFormVin('');
    setFormNotes('');
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;
    onUpdateVehicle(editingItem);
    setEditingItem(null);
  };

  const exportCSV = () => {
    const headers = 'ID,Modelo,Ano,Chassi/VIN,Cor,Custo,Preço Venda,Status,Placa\n';
    const rows = filteredInventory.map(i => 
      `"${i.id}","${i.model}",${i.year},"${i.vin}","${i.color}",${i.costPrice},${i.retailPrice},"${i.status}","${i.plate || ''}"`
    ).join('\n');
    
    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `inventario_motosul_${Date.now()}.csv`);
    link.click();
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] uppercase font-bold tracking-widest text-[#3b82f6] bg-[#3b82f6]/10 px-2.5 py-0.5 rounded-full border border-[#3b82f6]/20">
              Pátio & Salão Showroom
            </span>
          </div>
          <h2 className="text-[26px] md:text-[30px] font-bold text-[#fafafa] tracking-tight">
            Gestão de Estoque Detalhada
          </h2>
          <p className="text-[13px] text-neutral-500 dark:text-neutral-400">
            Controle de chassis, preços de aquisição, margem líquida e status operacional.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Seletor de Modo de Visualização (Item b) */}
          <div className="flex items-center bg-neutral-100 dark:bg-[#18181b] border border-neutral-200 dark:border-[#27272a] p-1 rounded-xl shadow-inner">
            <button
              onClick={() => setViewMode('detailed')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                viewMode === 'detailed'
                  ? 'bg-[#3b82f6] text-white shadow'
                  : 'text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-200 dark:hover:bg-neutral-800'
              }`}
            >
              <List className="w-3.5 h-3.5" />
              <span>Lista Detalhada</span>
            </button>
            <button
              onClick={() => setViewMode('matrix')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                viewMode === 'matrix'
                  ? 'bg-[#3b82f6] text-white shadow'
                  : 'text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-200 dark:hover:bg-neutral-800'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>Matriz (Rede vs Modelos)</span>
            </button>
          </div>

          <button
            onClick={exportCSV}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-neutral-200 dark:border-[#27272a] bg-white dark:bg-[#18181b] hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-300 font-bold text-[12px] transition-colors"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>Exportar CSV</span>
          </button>

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#3b82f6] hover:bg-[#2563eb] active:scale-[0.98] text-white font-bold text-[12px] transition-all shadow-md shadow-blue-500/20"
          >
            <Plus className="w-4 h-4" />
            <span>Cadastrar Veículo</span>
          </button>
        </div>
      </div>

      {/* Bento Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-[#18181b] rounded-3xl p-5 border border-neutral-200 dark:border-[#27272a] shadow-md flex flex-col justify-between">
          <span className="text-neutral-500 dark:text-neutral-400 text-[10px] font-bold uppercase tracking-widest block mb-1">
            Total em Estoque
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-[26px] font-bold text-neutral-900 dark:text-[#fafafa] font-tabular">{inventory.length}</span>
            <span className="text-[11px] text-neutral-500 dark:text-neutral-400">veículos</span>
          </div>
        </div>

        <div className="bg-white dark:bg-[#18181b] rounded-3xl p-5 border border-neutral-200 dark:border-[#27272a] shadow-md flex flex-col justify-between">
          <span className="text-neutral-500 dark:text-neutral-400 text-[10px] font-bold uppercase tracking-widest block mb-1">
            Disponíveis Pronta Entrega
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-[26px] font-bold text-emerald-600 dark:text-emerald-400 font-tabular">{availableCount}</span>
            <span className="text-[11px] text-neutral-500 dark:text-neutral-400">unidades</span>
          </div>
        </div>

        <div className="bg-white dark:bg-[#18181b] rounded-3xl p-5 border border-neutral-200 dark:border-[#27272a] shadow-md flex flex-col justify-between">
          <span className="text-neutral-500 dark:text-neutral-400 text-[10px] font-bold uppercase tracking-widest block mb-1">
            Reservadas / Proposta
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-[26px] font-bold text-rose-600 dark:text-rose-400 font-tabular">{reservedCount}</span>
            <span className="text-[11px] text-neutral-500 dark:text-neutral-400">unidades</span>
          </div>
        </div>

        <div className="bg-white dark:bg-[#18181b] rounded-3xl p-5 border border-neutral-200 dark:border-[#27272a] shadow-md flex flex-col justify-between">
          <span className="text-neutral-500 dark:text-neutral-400 text-[10px] font-bold uppercase tracking-widest block mb-1">
            Patrimônio em Pátio
          </span>
          <span className="text-[22px] font-bold text-blue-600 dark:text-[#60a5fa] font-tabular">
            R$ {totalStockValue.toLocaleString('pt-BR')}
          </span>
        </div>
      </div>

      {/* Filter Bento Bar */}
      <div className="bg-white dark:bg-[#18181b] border border-neutral-200 dark:border-[#27272a] rounded-2xl p-3 flex flex-wrap items-center justify-between gap-3 shadow-sm">
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex items-center gap-1.5 text-[12px] font-bold text-neutral-500 dark:text-neutral-400 pl-2">
            <Filter className="w-3.5 h-3.5 text-[#3b82f6]" />
            <span>Filtros:</span>
          </div>

          {/* Dealership Filter (When in J. Toledo Montadora view) */}
          {currentScope === 'jtoledo' && (
            <select 
              value={selectedDealershipFilter}
              onChange={(e) => setSelectedDealershipFilter(e.target.value)}
              className="bg-blue-950/60 text-[12px] text-blue-300 font-bold border border-blue-800/60 rounded-xl px-3 py-1.5 focus:outline-none focus:border-[#3b82f6]"
            >
              <option value="todos">Todas as Concessionárias</option>
              <option value="motosul">MotoSul Suzuki (RS)</option>
              <option value="novamotor">Nova Motor (SP)</option>
            </select>
          )}

          {/* Status Filter */}
          <select 
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="bg-white dark:bg-neutral-900 text-[12px] text-neutral-200 font-medium border border-[#27272a] rounded-xl px-3 py-1.5 focus:outline-none focus:border-[#3b82f6]"
          >
            <option value="todos">Todos os Status</option>
            <option value="disponivel">Disponível</option>
            <option value="reservado">Reservado</option>
            <option value="vendido">Vendido</option>
          </select>

          {/* Model Filter */}
          <select 
            value={selectedModelFilter}
            onChange={(e) => setSelectedModelFilter(e.target.value)}
            className="bg-white dark:bg-neutral-900 text-[12px] text-neutral-200 font-medium border border-[#27272a] rounded-xl px-3 py-1.5 focus:outline-none focus:border-[#3b82f6]"
          >
            <option value="todos">Todos os Modelos</option>
            {uniqueModels.map(m => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>

          {/* Color Filter */}
          <select 
            value={selectedColor}
            onChange={(e) => setSelectedColor(e.target.value)}
            className="bg-white dark:bg-neutral-900 text-[12px] text-neutral-200 font-medium border border-[#27272a] rounded-xl px-3 py-1.5 focus:outline-none focus:border-[#3b82f6]"
          >
            <option value="todos">Todas as Cores</option>
            {uniqueColors.map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        <div className="text-[12px] text-neutral-500 dark:text-neutral-400 font-tabular px-2">
          Mostrando <strong className="text-white">{filteredInventory.length}</strong> de {inventory.length} motocicletas
        </div>
      </div>

      {/* Inventory Container: Matriz ou Lista Detalhada (Item a) */}
      {viewMode === 'matrix' ? (
        <div className="bg-white dark:bg-[#18181b] border border-neutral-200 dark:border-[#27272a] rounded-3xl p-6 shadow-xl space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-200 dark:border-neutral-800/80 pb-4">
            <div>
              <h3 className="text-xl font-bold text-neutral-900 dark:text-white tracking-tight flex items-center gap-2">
                <LayoutGrid className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                <span>
                  {currentScope === 'jtoledo'
                    ? 'Matriz de Estoque da Rede (Rede vs Modelos)'
                    : 'Matriz de Estoque da Loja (Cores vs Modelos)'}
                </span>
              </h3>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                {currentScope === 'jtoledo'
                  ? 'Consolidado do estoque por concessionária da rede e modelos (Risco de Ruptura em Vermelho).'
                  : 'Disponibilidade detalhada de motocicletas por variação de cor e modelos na concessionária.'}
              </p>
            </div>

            {/* Legenda */}
            <div className="flex items-center gap-4 text-xs font-semibold">
              <div className="flex items-center gap-1.5">
                <span className="text-neutral-600 dark:text-neutral-400">Normal</span>
                <div className="w-4 h-4 rounded bg-slate-200 dark:bg-[#1e293b] border border-slate-300 dark:border-neutral-700"></div>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-amber-600 dark:text-amber-300">Pouco Estoque (1-4)</span>
                <div className="w-4 h-4 rounded bg-amber-500 border border-amber-600"></div>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-rose-600 dark:text-rose-400">Crítico (0)</span>
                <div className="w-4 h-4 rounded bg-rose-600 border border-rose-700"></div>
              </div>
            </div>
          </div>

          {/* Tabela de Matriz */}
          <div className="overflow-x-auto">
            {currentScope === 'jtoledo' ? (
              /* Visão Montadora: Rede vs Modelos (dinâmico) */
              <table className="w-full text-left border-separate border-spacing-y-2.5 border-spacing-x-2.5">
                <thead>
                  <tr className="text-[11px] font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                    <th className="py-3 px-4 bg-neutral-100 dark:bg-neutral-900/60 rounded-xl">CONCESSIONÁRIA</th>
                    {uniqueModels.map(mName => (
                      <th key={mName} className="py-3 px-4 text-center bg-neutral-100 dark:bg-neutral-900/60 rounded-xl min-w-[130px]">
                        {mName}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {dealerOptions.map(dealer => (
                    <tr key={dealer.id} className="hover:bg-neutral-50 dark:hover:bg-neutral-900/40 transition-colors">
                      <td className="py-3.5 px-4 font-bold text-neutral-900 dark:text-white bg-neutral-50 dark:bg-neutral-900/90 rounded-xl text-sm border border-neutral-200 dark:border-neutral-800/80 shadow-sm">
                        {dealer.name}
                      </td>
                      {uniqueModels.map(mName => {
                        const count = inventory.filter(item => {
                          const itemDealer = item.dealershipId || 'motosul';
                          const isDealerMatch = itemDealer === dealer.id;
                          const isModelMatch = item.model.toLowerCase() === mName.toLowerCase();
                          const isAvailable = item.status !== 'vendido';
                          return isDealerMatch && isModelMatch && isAvailable;
                        }).length;

                        let cellBg = 'bg-slate-100 dark:bg-[#1e293b]/60 text-slate-800 dark:text-neutral-300 border-slate-200 dark:border-neutral-700/60';
                        if (count === 0) {
                          cellBg = 'bg-rose-600 text-white font-black border-rose-500 shadow-md shadow-rose-950/20';
                        } else if (count <= 4) {
                          cellBg = 'bg-amber-500 text-slate-950 font-extrabold border-amber-400 shadow-md shadow-amber-950/20';
                        }

                        return (
                          <td key={mName} className="text-center p-0">
                            <div className={`py-3.5 rounded-xl border font-mono font-bold text-base transition-transform hover:scale-105 cursor-default ${cellBg}`}>
                              {count}
                            </div>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              /* Visão Concessionária: Cores vs Modelos (dinâmico) */
              <table className="w-full text-left border-separate border-spacing-y-2.5 border-spacing-x-2.5">
                <thead>
                  <tr className="text-[11px] font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                    <th className="py-3 px-4 bg-neutral-100 dark:bg-neutral-900/60 rounded-xl">COR DO VEÍCULO</th>
                    {uniqueModels.map(mName => (
                      <th key={mName} className="py-3 px-4 text-center bg-neutral-100 dark:bg-neutral-900/60 rounded-xl min-w-[130px]">
                        {mName}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {uniqueColors.map(colorName => {
                    const colorHex = inventory.find(i => i.color === colorName)?.colorHex || '#64748b';
                    return (
                      <tr key={colorName} className="hover:bg-neutral-50 dark:hover:bg-neutral-900/40 transition-colors">
                        <td className="py-3.5 px-4 font-bold text-neutral-900 dark:text-white bg-neutral-50 dark:bg-neutral-900/90 rounded-xl text-sm border border-neutral-200 dark:border-neutral-800/80 shadow-sm">
                          <div className="flex items-center gap-2.5">
                            <span
                              className="w-4 h-4 rounded-full border border-neutral-400 dark:border-neutral-600 shadow-sm shrink-0"
                              style={{ backgroundColor: colorHex }}
                            />
                            <span>{colorName}</span>
                          </div>
                        </td>
                        {uniqueModels.map(mName => {
                          const count = inventory.filter(item => {
                            const isDealerMatch = currentScope === 'jtoledo' || item.dealershipId === currentScope || (!item.dealershipId && currentScope === 'motosul');
                            const isColorMatch = item.color.toLowerCase() === colorName.toLowerCase();
                            const isModelMatch = item.model.toLowerCase() === mName.toLowerCase();
                            return isDealerMatch && isColorMatch && isModelMatch && item.status !== 'vendido';
                          }).length;

                          let cellBg = 'bg-slate-100 dark:bg-[#1e293b]/60 text-slate-800 dark:text-neutral-300 border-slate-200 dark:border-neutral-700/60';
                          if (count === 0) {
                            cellBg = 'bg-rose-600 text-white font-black border-rose-500 shadow-md shadow-rose-950/20';
                          } else if (count <= 4) {
                            cellBg = 'bg-amber-500 text-slate-950 font-extrabold border-amber-400 shadow-md shadow-amber-950/20';
                          }

                          return (
                            <td key={mName} className="text-center p-0">
                              <div className={`py-3.5 rounded-xl border font-mono font-bold text-base transition-transform hover:scale-105 cursor-default ${cellBg}`}>
                                {count}
                              </div>
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>
      ) : (
        <div className="bg-white dark:bg-[#18181b] border border-neutral-200 dark:border-[#27272a] rounded-3xl overflow-hidden shadow-md">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-[13px]">
              <thead>
                <tr className="bg-neutral-100 dark:bg-neutral-900/80 border-b border-neutral-200 dark:border-[#27272a] text-[10px] font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                  <th className="py-3 px-4">Motocicleta / Modelo</th>
                  <th className="py-3 px-4">Chassi (VIN)</th>
                  <th className="py-3 px-4">Cor</th>
                  <th className="py-3 px-4 text-right">Custo Aquisição</th>
                  <th className="py-3 px-4 text-right">Preço de Venda</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-center">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200 dark:divide-[#27272a] font-tabular">
                {filteredInventory.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-neutral-500">
                      Nenhum veículo encontrado com os filtros selecionados.
                    </td>
                  </tr>
                ) : (
                  filteredInventory.map((item) => (
                    <tr 
                      key={item.id} 
                      className="hover:bg-neutral-50 dark:hover:bg-neutral-900/50 transition-colors"
                    >
                      {/* Model & Year */}
                      <td className="py-3.5 px-4 font-medium text-neutral-900 dark:text-[#fafafa]">
                        <div className="flex items-center gap-2">
                          <Bike className="w-4 h-4 text-[#3b82f6] shrink-0" />
                          <div>
                            <div className="flex items-center gap-1.5">
                              <p className="font-bold leading-tight">{item.model}</p>
                              {currentScope === 'jtoledo' && item.dealershipId && (
                                <span className={`text-[9px] px-1.5 py-0.2 rounded font-bold uppercase ${
                                  item.dealershipId === 'motosul' ? 'bg-blue-950 text-blue-300 border border-blue-800/40' : 'bg-amber-950 text-amber-300 border border-amber-800/40'
                                }`}>
                                  {item.dealershipId === 'motosul' ? 'MotoSul RS' : 'Nova Motor SP'}
                                </span>
                              )}
                            </div>
                            <span className="text-[11px] text-neutral-500">{item.year}</span>
                          </div>
                        </div>
                      </td>

                      {/* VIN */}
                      <td className="py-3.5 px-4 text-neutral-700 dark:text-neutral-300 font-mono text-[12px]">
                        {item.vin}
                      </td>

                      {/* Color Swatch */}
                      <td className="py-3.5 px-4 text-neutral-700 dark:text-neutral-300">
                        <div className="flex items-center gap-2">
                          <div 
                            className="w-3.5 h-3.5 rounded-full border border-neutral-700 shrink-0" 
                            style={{ backgroundColor: item.colorHex }}
                          />
                          <span className="text-[12px]">{item.color}</span>
                        </div>
                      </td>

                      {/* Cost */}
                      <td className="py-3.5 px-4 text-right text-neutral-500 dark:text-neutral-400">
                        R$ {item.costPrice.toLocaleString('pt-BR')}
                      </td>

                      {/* Retail Price */}
                      <td className="py-3.5 px-4 text-right font-bold text-[#60a5fa]">
                        R$ {item.retailPrice.toLocaleString('pt-BR')}
                      </td>

                      {/* Status Pill */}
                      <td className="py-3.5 px-4 text-center">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                          item.status === 'disponivel'
                            ? 'bg-emerald-950/60 text-emerald-400 border-emerald-800/40'
                            : item.status === 'reservado'
                            ? 'bg-rose-950/60 text-rose-400 border-rose-800/40'
                            : 'bg-neutral-800 text-neutral-500 dark:text-neutral-400 border-neutral-700'
                        }`}>
                          {item.status}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => setSpecModalItem(item)}
                            title="Ficha Técnica"
                            className="p-1.5 hover:bg-neutral-800 text-neutral-500 dark:text-neutral-400 hover:text-white rounded-lg transition-colors"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setEditingItem(item)}
                            title="Editar Preço/Status"
                            className="p-1.5 hover:bg-neutral-800 text-neutral-500 dark:text-neutral-400 hover:text-white rounded-lg transition-colors"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => onDeleteVehicle(item.id)}
                            title="Excluir"
                            className="p-1.5 hover:bg-neutral-800 text-neutral-500 dark:text-neutral-400 hover:text-rose-400 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Technical Specs Modal (Bento) */}
      {specModalItem && (
        <div className="fixed inset-0 bg-black/60 dark:bg-black/80 z-50 flex items-center justify-center p-4 backdrop-blur-md">
          <div className="bg-white dark:bg-[#18181b] rounded-3xl max-w-lg w-full p-6 md:p-7 shadow-2xl border border-neutral-200 dark:border-[#27272a] animate-in fade-in zoom-in-95">
            <div className="flex justify-between items-start pb-4 border-b border-neutral-200 dark:border-[#27272a]">
              <div>
                <span className="text-[10px] uppercase font-bold tracking-widest text-[#3b82f6]">Ficha Técnica & Homologação</span>
                <h3 className="text-[20px] font-bold text-neutral-900 dark:text-[#fafafa]">{specModalItem.model} ({specModalItem.year})</h3>
              </div>
              <button 
                onClick={() => setSpecModalItem(null)}
                className="text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white font-bold text-lg"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 py-4 text-[13px]">
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-neutral-50 dark:bg-neutral-900/60 p-3 rounded-2xl border border-neutral-200 dark:border-[#27272a]">
                  <span className="text-[10px] uppercase font-bold text-neutral-500 block">Cilindrada / Motor</span>
                  <p className="font-bold text-neutral-900 dark:text-white mt-0.5">{specModalItem.engineDisplacement}</p>
                </div>
                <div className="bg-neutral-50 dark:bg-neutral-900/60 p-3 rounded-2xl border border-neutral-200 dark:border-[#27272a]">
                  <span className="text-[10px] uppercase font-bold text-neutral-500 block">Potência Máxima</span>
                  <p className="font-bold text-neutral-900 dark:text-white mt-0.5">{specModalItem.power}</p>
                </div>
                <div className="bg-neutral-50 dark:bg-neutral-900/60 p-3 rounded-2xl border border-neutral-200 dark:border-[#27272a]">
                  <span className="text-[10px] uppercase font-bold text-neutral-500 block">VIN / Chassi</span>
                  <p className="font-mono font-bold text-neutral-700 dark:text-neutral-300 mt-0.5">{specModalItem.vin}</p>
                </div>
                <div className="bg-neutral-50 dark:bg-neutral-900/60 p-3 rounded-2xl border border-neutral-200 dark:border-[#27272a]">
                  <span className="text-[10px] uppercase font-bold text-neutral-500 block">Data de Chegada</span>
                  <p className="font-bold text-neutral-900 dark:text-white mt-0.5">{specModalItem.arrivedDate}</p>
                </div>
              </div>

              {specModalItem.notes && (
                <div className="bg-neutral-50 dark:bg-neutral-900/60 p-3.5 rounded-2xl border border-neutral-200 dark:border-[#27272a]">
                  <span className="text-[10px] uppercase font-bold text-neutral-500 block mb-1">Observações do Pátio</span>
                  <p className="text-neutral-700 dark:text-neutral-300 text-[12px] leading-relaxed">{specModalItem.notes}</p>
                </div>
              )}
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setSpecModalItem(null)}
                className="bg-[#3b82f6] hover:bg-[#2563eb] text-white px-5 py-2 rounded-xl font-bold text-[12px] transition-colors"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Vehicle Modal */}
      {editingItem && (
        <div className="fixed inset-0 bg-black/60 dark:bg-black/80 z-50 flex items-center justify-center p-4 backdrop-blur-md">
          <div className="bg-white dark:bg-[#18181b] rounded-3xl max-w-md w-full p-6 shadow-2xl border border-neutral-200 dark:border-[#27272a] animate-in fade-in zoom-in-95">
            <div className="flex justify-between items-start pb-3 border-b border-neutral-200 dark:border-[#27272a]">
              <h3 className="text-[18px] font-bold text-neutral-900 dark:text-[#fafafa]">Editar {editingItem.model}</h3>
              <button 
                onClick={() => setEditingItem(null)}
                className="text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4 py-4 text-[13px]">
              <div>
                <label className="block text-[11px] font-bold text-neutral-500 dark:text-neutral-400 mb-1">Preço de Venda (R$)</label>
                <input 
                  type="number"
                  value={editingItem.retailPrice}
                  onChange={(e) => setEditingItem({ ...editingItem, retailPrice: parseFloat(e.target.value) || 0 })}
                  className="w-full bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-[#27272a] rounded-xl p-2.5 text-neutral-900 dark:text-white focus:border-[#3b82f6] outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-neutral-500 dark:text-neutral-400 mb-1">Status Operacional</label>
                <select 
                  value={editingItem.status}
                  onChange={(e) => setEditingItem({ ...editingItem, status: e.target.value as any })}
                  className="w-full bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-[#27272a] rounded-xl p-2.5 text-neutral-900 dark:text-white focus:border-[#3b82f6] outline-none"
                >
                  <option value="disponivel">Disponível</option>
                  <option value="reservado">Reservado</option>
                  <option value="vendido">Vendido</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-neutral-500 dark:text-neutral-400 mb-1">Observações</label>
                <textarea 
                  value={editingItem.notes || ''}
                  onChange={(e) => setEditingItem({ ...editingItem, notes: e.target.value })}
                  className="w-full bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-[#27272a] rounded-xl p-2.5 text-neutral-900 dark:text-white h-20 resize-none focus:border-[#3b82f6] outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingItem(null)}
                  className="px-4 py-2 rounded-xl text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 text-[12px] font-bold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#3b82f6] hover:bg-[#2563eb] text-white rounded-xl text-[12px] font-bold transition-colors shadow-md shadow-blue-500/20"
                >
                  Salvar Alterações
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Vehicle Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black/60 dark:bg-black/80 z-50 flex items-center justify-center p-4 backdrop-blur-md">
          <div className="bg-white dark:bg-[#18181b] rounded-3xl max-w-lg w-full p-6 md:p-7 shadow-2xl border border-neutral-200 dark:border-[#27272a] animate-in fade-in zoom-in-95 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start pb-3 border-b border-neutral-200 dark:border-[#27272a]">
              <div>
                <span className="text-[10px] uppercase font-bold tracking-widest text-[#3b82f6]">Entrada de Estoque</span>
                <h3 className="text-[18px] font-bold text-neutral-900 dark:text-[#fafafa]">Cadastrar Nova Motocicleta</h3>
              </div>
              <button 
                onClick={() => setIsAddModalOpen(false)}
                className="text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateVehicle} className="space-y-4 py-4 text-[13px]">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-neutral-500 dark:text-neutral-400 mb-1">Modelo *</label>
                  <input 
                    type="text" 
                    value={formModel}
                    onChange={(e) => setFormModel(e.target.value)}
                    className="w-full bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-[#27272a] rounded-xl p-2.5 text-neutral-900 dark:text-white focus:border-[#3b82f6] outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-neutral-500 dark:text-neutral-400 mb-1">Ano *</label>
                  <input 
                    type="number" 
                    value={formYear}
                    onChange={(e) => setFormYear(e.target.value)}
                    className="w-full bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-[#27272a] rounded-xl p-2.5 text-neutral-900 dark:text-white focus:border-[#3b82f6] outline-none"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-neutral-500 dark:text-neutral-400 mb-1">Número de Chassi (VIN)</label>
                <input 
                  type="text" 
                  value={formVin}
                  onChange={(e) => setFormVin(e.target.value)}
                  placeholder="Ex: JS1GT79B4R3001XXX"
                  className="w-full bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-[#27272a] rounded-xl p-2.5 text-neutral-900 dark:text-white font-mono uppercase focus:border-[#3b82f6] outline-none placeholder:text-neutral-400 dark:placeholder:text-neutral-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-neutral-500 dark:text-neutral-400 mb-1">Cor</label>
                  <input 
                    type="text" 
                    value={formColor}
                    onChange={(e) => setFormColor(e.target.value)}
                    className="w-full bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-[#27272a] rounded-xl p-2.5 text-neutral-900 dark:text-white focus:border-[#3b82f6] outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-neutral-500 dark:text-neutral-400 mb-1">Status</label>
                  <select 
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value as any)}
                    className="w-full bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-[#27272a] rounded-xl p-2.5 text-neutral-900 dark:text-white focus:border-[#3b82f6] outline-none"
                  >
                    <option value="disponivel">Disponível</option>
                    <option value="reservado">Reservado</option>
                    <option value="vendido">Vendido</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-neutral-500 dark:text-neutral-400 mb-1">Custo (R$)</label>
                  <input 
                    type="number" 
                    value={formCost}
                    onChange={(e) => setFormCost(e.target.value)}
                    className="w-full bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-[#27272a] rounded-xl p-2.5 text-neutral-900 dark:text-white focus:border-[#3b82f6] outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-neutral-500 dark:text-neutral-400 mb-1">Preço Venda (R$)</label>
                  <input 
                    type="number" 
                    value={formRetail}
                    onChange={(e) => setFormRetail(e.target.value)}
                    className="w-full bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-[#27272a] rounded-xl p-2.5 text-neutral-900 dark:text-white focus:border-[#3b82f6] outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-neutral-500 dark:text-neutral-400 mb-1">Observações</label>
                <textarea 
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  placeholder="Informações adicionais do veículo ou acessórios..."
                  className="w-full bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-[#27272a] rounded-xl p-2.5 text-neutral-900 dark:text-white h-16 resize-none focus:border-[#3b82f6] outline-none placeholder:text-neutral-400 dark:placeholder:text-neutral-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 text-[12px] font-bold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#3b82f6] hover:bg-[#2563eb] text-white rounded-xl text-[12px] font-bold transition-colors shadow-md shadow-blue-500/20"
                >
                  Adicionar ao Estoque
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
