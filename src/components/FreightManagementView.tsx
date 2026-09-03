import React, { useState, useEffect, useCallback } from 'react';
import { FreightRateEntry, BrazilRegion } from '../types';
import { api } from '../services/api';
import { Truck, Plus, Search, Filter, Edit3, Trash2, CheckCircle2, Building2, MapPin, DollarSign, Clock, AlertTriangle } from 'lucide-react';

const emptyEntry = (): FreightRateEntry => ({
  id: `frt-${Date.now()}`,
  state: 'SP',
  region: 'Sudeste',
  originWarehouse: 'empresa_13_armazem',
  originWarehouseLabel: 'Empresa 13 - Armazém (SP)',
  costPerUnit: 750,
  estimatedDays: 3,
  locationType: 'capital'
});

export const FreightManagementView: React.FC = () => {
  const [freightEntries, setFreightEntries] = useState<FreightRateEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isNewEntry, setIsNewEntry] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [regionFilter, setRegionFilter] = useState<string>('all');
  const [warehouseFilter, setWarehouseFilter] = useState<string>('all');

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<FreightRateEntry | null>(null);

  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastType, setToastType] = useState<'success' | 'error'>('success');
  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
    setToastType(type);
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const loadEntries = useCallback(async () => {
    setIsLoading(true);
    setLoadError(null);
    try {
      const data = await api.getFreightTable();
      setFreightEntries(data);
    } catch (err: any) {
      setLoadError(err.message || 'Erro ao carregar tarifas de frete.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { loadEntries(); }, [loadEntries]);

  const filteredEntries = freightEntries.filter(entry => {
    const matchSearch = entry.state.toLowerCase().includes(searchTerm.toLowerCase()) || entry.originWarehouseLabel.toLowerCase().includes(searchTerm.toLowerCase());
    const matchRegion = regionFilter === 'all' || entry.region === regionFilter;
    const matchWarehouse = warehouseFilter === 'all' || entry.originWarehouse === warehouseFilter;
    return matchSearch && matchRegion && matchWarehouse;
  });

  const handleOpenAdd = () => {
    setIsNewEntry(true);
    setEditingEntry(emptyEntry());
    setIsModalOpen(true);
  };

  const handleOpenEdit = (entry: FreightRateEntry) => {
    setIsNewEntry(false);
    setEditingEntry({ ...entry });
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    if (!editingEntry || isSaving) return;
    setIsSaving(true);
    try {
      if (isNewEntry) {
        await api.createFreightRate(editingEntry);
        showToast('Regra de frete criada com sucesso!');
      } else {
        await api.updateFreightRate(editingEntry.id, editingEntry);
        showToast('Regra de frete atualizada com sucesso!');
      }
      setIsModalOpen(false);
      setEditingEntry(null);
      await loadEntries();
    } catch (err: any) {
      showToast(err.message || 'Erro ao salvar regra de frete.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await api.deleteFreightRate(id);
      showToast('Regra de frete removida.');
      await loadEntries();
    } catch (err: any) {
      showToast(err.message || 'Erro ao remover regra de frete.', 'error');
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast Feedback */}
      {toastMessage && (
        <div className={`fixed bottom-6 right-6 z-50 text-white px-5 py-3 rounded-xl shadow-2xl font-bold text-xs flex items-center gap-2 ${toastType === 'success' ? 'bg-emerald-600' : 'bg-rose-600'}`}>
          {toastType === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-white dark:bg-[#18181b] border border-neutral-200 dark:border-[#27272a] rounded-3xl p-6 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="p-3 bg-amber-500/10 text-amber-600 dark:text-amber-400 rounded-2xl border border-amber-500/20">
            <Truck className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-neutral-900 dark:text-white flex items-center gap-2">
              <span>Tabela & Regras Logísticas de Frete UF</span>
              <span className="text-xs font-mono font-bold bg-amber-500/20 text-amber-700 dark:text-amber-300 px-2 py-0.5 rounded-full border border-amber-500/30">
                ERP Protheus Sync
              </span>
            </h2>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
              Cadastro de fretes automáticos por UF e direcionamento de faturamento (*Empresa 13 Armazém SP* vs *Manaus LE 16*).
            </p>
          </div>
        </div>

        <button
          onClick={handleOpenAdd}
          className="px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-black font-bold rounded-xl text-xs flex items-center gap-2 shadow-lg shadow-amber-500/20 transition-all"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>Nova Regra de Frete</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-[#18181b] border border-neutral-200 dark:border-[#27272a] rounded-2xl p-4 shadow-sm">
          <span className="text-xs text-neutral-500 dark:text-neutral-400 font-bold block mb-1">Total de UFs Mapeadas</span>
          <p className="text-2xl font-black text-neutral-900 dark:text-white font-tabular">{freightEntries.length} Estados</p>
        </div>
        <div className="bg-white dark:bg-[#18181b] border border-neutral-200 dark:border-[#27272a] rounded-2xl p-4 shadow-sm">
          <span className="text-xs text-neutral-500 dark:text-neutral-400 font-bold block mb-1">Origem Sul / Sudeste (- ES)</span>
          <p className="text-2xl font-black text-blue-600 dark:text-blue-400 font-tabular">Empresa 13 - Armazém SP</p>
        </div>
        <div className="bg-white dark:bg-[#18181b] border border-neutral-200 dark:border-[#27272a] rounded-2xl p-4 shadow-sm">
          <span className="text-xs text-neutral-500 dark:text-neutral-400 font-bold block mb-1">Origem Norte/NE/CO & ES</span>
          <p className="text-2xl font-black text-amber-600 dark:text-amber-400 font-tabular">Manaus LE 16 (Emp. 01/10)</p>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="bg-white dark:bg-[#18181b] border border-neutral-200 dark:border-[#27272a] rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar por Estado (UF) ou Armazém..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 rounded-xl pl-9 pr-3 py-2 text-xs text-neutral-900 dark:text-white placeholder-neutral-400 dark:placeholder-neutral-500 focus:outline-none focus:border-amber-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            value={regionFilter}
            onChange={(e) => setRegionFilter(e.target.value)}
            className="bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 rounded-xl px-3 py-2 text-xs text-neutral-900 dark:text-neutral-300 focus:outline-none"
          >
            <option value="all">Todas as Regiões</option>
            <option value="Sul">Sul</option>
            <option value="Sudeste">Sudeste</option>
            <option value="Centro-Oeste">Centro-Oeste</option>
            <option value="Nordeste">Nordeste</option>
            <option value="Norte">Norte</option>
          </select>

          <select
            value={warehouseFilter}
            onChange={(e) => setWarehouseFilter(e.target.value)}
            className="bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 rounded-xl px-3 py-2 text-xs text-neutral-900 dark:text-neutral-300 focus:outline-none"
          >
            <option value="all">Todos os Armazéns</option>
            <option value="empresa_13_armazem">Empresa 13 Armazém</option>
            <option value="manaus_le_16">Manaus LE 16</option>
          </select>
        </div>
      </div>

      {/* Freight Table */}
      <div className="bg-white dark:bg-[#18181b] border border-neutral-200 dark:border-[#27272a] rounded-2xl overflow-hidden shadow-xl">
        {isLoading ? (
          <div className="p-10 text-center text-xs text-neutral-500 dark:text-neutral-400 font-bold">Carregando tarifas de frete...</div>
        ) : loadError ? (
          <div className="p-10 text-center space-y-3">
            <p className="text-xs text-rose-600 dark:text-rose-400 font-bold flex items-center justify-center gap-2">
              <AlertTriangle className="w-4 h-4" />
              {loadError}
            </p>
            <button onClick={loadEntries} className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-black font-bold rounded-xl text-xs">
              Tentar novamente
            </button>
          </div>
        ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-neutral-100 dark:bg-[#121215] border-b border-neutral-200 dark:border-[#27272a] text-neutral-500 dark:text-neutral-400 font-bold uppercase text-[10px]">
              <tr>
                <th className="py-3 px-4">UF / Estado</th>
                <th className="py-3 px-4">Região</th>
                <th className="py-3 px-4">Tipo Localização</th>
                <th className="py-3 px-4">Armazém Origem Faturamento</th>
                <th className="py-3 px-4 text-right">Custo por Unidade (R$)</th>
                <th className="py-3 px-4 text-center">Prazo Estimado</th>
                <th className="py-3 px-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200 dark:divide-[#27272a] text-neutral-800 dark:text-neutral-200">
              {filteredEntries.map((entry) => (
                <tr key={entry.id} className="hover:bg-neutral-50 dark:hover:bg-neutral-900/60 transition-colors">
                  <td className="py-3 px-4 font-black text-neutral-900 dark:text-white font-mono text-sm">
                    {entry.state}
                  </td>
                  <td className="py-3 px-4 font-semibold text-neutral-700 dark:text-neutral-300">
                    {entry.region}
                  </td>
                  <td className="py-3 px-4">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                      entry.locationType === 'interior'
                        ? 'bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 border-amber-300 dark:border-amber-800'
                        : 'bg-purple-100 dark:bg-purple-950/80 text-purple-800 dark:text-purple-300 border-purple-300 dark:border-purple-800'
                    }`}>
                      {entry.locationType === 'interior' ? 'Interior' : 'Capital'}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`px-2.5 py-1 rounded-lg text-xs font-bold ${
                      entry.originWarehouse === 'empresa_13_armazem' 
                        ? 'bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300 border border-blue-300 dark:border-blue-800' 
                        : 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800'
                    }`}>
                      {entry.originWarehouseLabel}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right font-extrabold text-emerald-600 dark:text-emerald-400 font-tabular text-sm">
                    R$ {entry.costPerUnit.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="py-3 px-4 text-center text-neutral-500 dark:text-neutral-400 font-medium">
                    <span className="inline-flex items-center gap-1 bg-neutral-100 dark:bg-neutral-900 px-2 py-1 rounded-md">
                      <Clock className="w-3 h-3 text-amber-500 dark:text-amber-400" />
                      {entry.estimatedDays} dias úteis
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleOpenEdit(entry)}
                        className="p-1.5 bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-300 rounded-lg transition-colors"
                        title="Editar"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(entry.id)}
                        className="p-1.5 bg-neutral-100 hover:bg-rose-100 dark:bg-neutral-800 dark:hover:bg-rose-950 text-neutral-700 hover:text-rose-600 dark:text-neutral-300 dark:hover:text-rose-400 rounded-lg transition-colors"
                        title="Excluir"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        )}
      </div>

      {/* Modal: Add / Edit Freight Entry */}
      {isModalOpen && editingEntry && (
        <div className="fixed inset-0 bg-black/60 dark:bg-black/80 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white dark:bg-[#18181b] border border-neutral-200 dark:border-[#27272a] rounded-2xl p-6 max-w-md w-full space-y-4 shadow-2xl">
            <h3 className="text-base font-bold text-neutral-900 dark:text-white flex items-center gap-2">
              <Truck className="w-5 h-5 text-amber-500 dark:text-amber-400" />
              <span>{isNewEntry ? 'Nova Regra de Frete' : 'Editar Regra de Frete UF'}</span>
            </h3>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-neutral-500 dark:text-neutral-400 font-semibold block mb-1">Estado (UF)</label>
                <input
                  type="text"
                  maxLength={2}
                  value={editingEntry.state}
                  onChange={(e) => setEditingEntry({ ...editingEntry, state: e.target.value.toUpperCase() })}
                  className="w-full bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 rounded-xl px-3 py-2 text-neutral-900 dark:text-white font-mono font-bold uppercase"
                />
              </div>

              <div>
                <label className="text-neutral-500 dark:text-neutral-400 font-semibold block mb-1">Regra de Localização (Requisito b)</label>
                <select
                  value={editingEntry.locationType || 'capital'}
                  onChange={(e) => setEditingEntry({ ...editingEntry, locationType: e.target.value as 'capital' | 'interior' })}
                  className="w-full bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 rounded-xl px-3 py-2 text-neutral-900 dark:text-white font-bold"
                >
                  <option value="capital">Capital</option>
                  <option value="interior">Interior</option>
                </select>
              </div>

              <div>
                <label className="text-neutral-500 dark:text-neutral-400 font-semibold block mb-1">Região Geográfica</label>
                <select
                  value={editingEntry.region}
                  onChange={(e) => setEditingEntry({ ...editingEntry, region: e.target.value as BrazilRegion })}
                  className="w-full bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 rounded-xl px-3 py-2 text-neutral-900 dark:text-white font-bold"
                >
                  <option value="Sudeste">Sudeste</option>
                  <option value="Sul">Sul</option>
                  <option value="Centro-Oeste">Centro-Oeste</option>
                  <option value="Nordeste">Nordeste</option>
                  <option value="Norte">Norte</option>
                </select>
              </div>

              <div>
                <label className="text-neutral-500 dark:text-neutral-400 font-semibold block mb-1">Armazém Origem de Faturamento</label>
                <select
                  value={editingEntry.originWarehouse}
                  onChange={(e) => {
                    const wh = e.target.value as any;
                    const label = wh === 'empresa_13_armazem' ? 'Empresa 13 - Armazém (SP)' : 'Manaus LE 16 - Empresa 01/10';
                    setEditingEntry({ ...editingEntry, originWarehouse: wh, originWarehouseLabel: label });
                  }}
                  className="w-full bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 rounded-xl px-3 py-2 text-neutral-900 dark:text-white font-bold"
                >
                  <option value="empresa_13_armazem">Empresa 13 - Armazém (SP)</option>
                  <option value="manaus_le_16">Manaus Local de Estoque 16 (Emp. 01/10)</option>
                </select>
              </div>

              <div>
                <label className="text-neutral-500 dark:text-neutral-400 font-semibold block mb-1">Custo do Frete Unitário (R$)</label>
                <input
                  type="number"
                  value={editingEntry.costPerUnit}
                  onChange={(e) => setEditingEntry({ ...editingEntry, costPerUnit: Number(e.target.value) })}
                  className="w-full bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 rounded-xl px-3 py-2 text-emerald-600 dark:text-emerald-400 font-extrabold"
                />
              </div>

              <div>
                <label className="text-neutral-500 dark:text-neutral-400 font-semibold block mb-1">Prazo Estimado (Dias Úteis)</label>
                <input
                  type="number"
                  value={editingEntry.estimatedDays}
                  onChange={(e) => setEditingEntry({ ...editingEntry, estimatedDays: Number(e.target.value) })}
                  className="w-full bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 rounded-xl px-3 py-2 text-neutral-900 dark:text-white font-bold"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-neutral-200 dark:border-neutral-800">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-300 font-bold rounded-xl text-xs"
              >
                Cancelar
              </button>
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="px-5 py-2 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 disabled:cursor-not-allowed text-black font-bold rounded-xl text-xs shadow-lg shadow-amber-500/20"
              >
                {isSaving ? 'Salvando...' : 'Salvar Regra'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
