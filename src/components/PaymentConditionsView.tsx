import React, { useState } from 'react';
import { PaymentConditionCampaign, BrandType } from '../types';
import { CreditCard, Plus, Search, Filter, Edit3, Trash2, CheckCircle2, Calendar, Tag, Percent, Sparkles } from 'lucide-react';

interface PaymentConditionsViewProps {
  conditions: PaymentConditionCampaign[];
  onSaveCondition: (condition: PaymentConditionCampaign) => void;
  onDeleteCondition: (id: string) => void;
}

export const PaymentConditionsView: React.FC<PaymentConditionsViewProps> = ({
  conditions,
  onSaveCondition,
  onDeleteCondition
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [brandFilter, setBrandFilter] = useState<string>('todas');
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCondition, setEditingCondition] = useState<PaymentConditionCampaign | null>(null);

  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const filteredConditions = conditions.filter(c => {
    const matchSearch = 
      c.paymentMethodName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.modelCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (c.description && c.description.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchBrand = brandFilter === 'todas' || c.brand === brandFilter;
    return matchSearch && matchBrand;
  });

  const handleOpenAdd = () => {
    setEditingCondition({
      id: `pay-${Date.now()}`,
      modelCode: 'GSX-S1000GX',
      modelYear: '2026',
      brand: 'Suzuki',
      paymentMethodName: 'À Vista c/ Desconto de Campanha (5%)',
      discountPercentage: 5,
      installments: 1,
      startDate: '2026-01-01',
      endDate: '2026-12-31',
      inLine: true,
      active: true,
      description: 'Campanha promocional autorizada pela Montadora J. Toledo'
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (cond: PaymentConditionCampaign) => {
    setEditingCondition({ ...cond });
    setIsModalOpen(true);
  };

  const handleSave = () => {
    if (!editingCondition) return;
    onSaveCondition(editingCondition);
    setIsModalOpen(false);
    showToast('Condição de pagamento salva no sistema!');
  };

  const handleDelete = (id: string) => {
    onDeleteCondition(id);
    showToast('Condição de pagamento removida.');
  };

  return (
    <div className="space-y-6">
      {/* Toast Feedback */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-emerald-600 text-white px-5 py-3 rounded-xl shadow-2xl font-bold text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-white dark:bg-[#18181b] border border-neutral-200 dark:border-[#27272a] rounded-3xl p-6 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="p-3 bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-2xl border border-blue-500/20">
            <CreditCard className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-neutral-900 dark:text-white flex items-center gap-2">
              <span>Cadastro de Condições de Pagamento & Campanhas</span>
              <span className="text-xs font-mono font-bold bg-blue-500/20 text-blue-700 dark:text-blue-300 px-2 py-0.5 rounded-full border border-blue-500/30">
                Tabela Comercial Fábrica
              </span>
            </h2>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
              Defina formas de pagamento, parcelamentos, descontos e períodos de vigência por Marca, Modelo e Ano.
            </p>
          </div>
        </div>

        <button
          onClick={handleOpenAdd}
          className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-xs flex items-center gap-2 shadow-lg shadow-blue-500/20 transition-all"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>Nova Condição de Pagamento</span>
        </button>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-[#18181b] border border-neutral-200 dark:border-[#27272a] rounded-2xl p-4 shadow-sm">
          <span className="text-xs text-neutral-500 dark:text-neutral-400 font-bold block mb-1">Total de Condições Ativas</span>
          <p className="text-2xl font-black text-neutral-900 dark:text-white font-tabular">{conditions.filter(c => c.inLine).length} Campanhas</p>
        </div>
        <div className="bg-white dark:bg-[#18181b] border border-neutral-200 dark:border-[#27272a] rounded-2xl p-4 shadow-sm">
          <span className="text-xs text-neutral-500 dark:text-neutral-400 font-bold block mb-1">Maior Desconto Vigente</span>
          <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400 font-tabular">
            {Math.max(0, ...conditions.map(c => c.discountPercentage || 0))}% à Vista
          </p>
        </div>
        <div className="bg-white dark:bg-[#18181b] border border-neutral-200 dark:border-[#27272a] rounded-2xl p-4 shadow-sm">
          <span className="text-xs text-neutral-500 dark:text-neutral-400 font-bold block mb-1">Marcas Mapeadas</span>
          <p className="text-2xl font-black text-blue-600 dark:text-blue-400 font-tabular">Suzuki, Haojue, Zontes, Kymco</p>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="bg-white dark:bg-[#18181b] border border-neutral-200 dark:border-[#27272a] rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar por Nome da Forma de Pagamento, Modelo ou Descrição..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 rounded-xl pl-9 pr-3 py-2 text-xs text-neutral-900 dark:text-white placeholder-neutral-400 dark:placeholder-neutral-500 focus:outline-none focus:border-blue-500"
          />
        </div>

        <select
          value={brandFilter}
          onChange={(e) => setBrandFilter(e.target.value)}
          className="bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 rounded-xl px-3 py-2 text-xs text-neutral-900 dark:text-neutral-300 focus:outline-none w-full sm:w-auto"
        >
          <option value="todas">Todas as Marcas</option>
          <option value="Suzuki">Suzuki</option>
          <option value="Haojue">Haojue</option>
          <option value="Zontes">Zontes</option>
          <option value="Kymco">Kymco</option>
        </select>
      </div>

      {/* Conditions Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredConditions.map((cond) => (
          <div key={cond.id} className="bg-white dark:bg-[#18181b] border border-neutral-200 dark:border-[#27272a] hover:border-blue-500/40 rounded-2xl p-5 shadow-xl transition-all space-y-3 relative">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-md uppercase bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300 border border-blue-300 dark:border-blue-800 font-mono">
                {cond.brand} • {cond.modelCode} ({cond.modelYear})
              </span>
              {cond.discountPercentage > 0 ? (
                <span className="text-xs font-black bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-500/30 flex items-center gap-1">
                  <Percent className="w-3 h-3" />
                  -{cond.discountPercentage}% OFF
                </span>
              ) : (
                <span className="text-xs font-bold text-neutral-500 dark:text-neutral-400 bg-neutral-100 dark:bg-neutral-900 px-2 py-0.5 rounded-md border border-neutral-200 dark:border-neutral-800">
                  Floor Plan
                </span>
              )}
            </div>

            <div>
              <h3 className="text-sm font-bold text-neutral-900 dark:text-white">{cond.paymentMethodName}</h3>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">{cond.description || 'Sem observações adicionais.'}</p>
            </div>

            <div className="bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 p-2.5 rounded-xl text-xs space-y-1">
              <div className="flex justify-between text-neutral-600 dark:text-neutral-400">
                <span>Parcelamento:</span>
                <span className="font-bold text-neutral-900 dark:text-white">{cond.installments}x parcela(s)</span>
              </div>
              <div className="flex justify-between text-neutral-600 dark:text-neutral-400">
                <span>Vigência:</span>
                <span className="font-semibold text-neutral-800 dark:text-neutral-200">{cond.startDate} até {cond.endDate}</span>
              </div>
              <div className="flex justify-between text-neutral-600 dark:text-neutral-400">
                <span>Em Linha:</span>
                <span className={cond.inLine ? 'text-emerald-600 dark:text-emerald-400 font-bold' : 'text-rose-600 dark:text-rose-400 font-bold'}>
                  {cond.inLine ? 'Sim (Ativo)' : 'Não (Inativo)'}
                </span>
              </div>
            </div>

            <div className="pt-2 border-t border-neutral-200 dark:border-neutral-800 flex items-center justify-end gap-2">
              <button
                onClick={() => handleOpenEdit(cond)}
                className="px-3 py-1.5 bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-300 rounded-lg text-xs font-bold transition-colors flex items-center gap-1"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Editar</span>
              </button>
              <button
                onClick={() => handleDelete(cond.id)}
                className="px-2 py-1.5 bg-neutral-100 hover:bg-rose-100 dark:bg-neutral-800 dark:hover:bg-rose-950 text-neutral-600 hover:text-rose-600 dark:text-neutral-400 dark:hover:text-rose-300 rounded-lg text-xs transition-colors"
                title="Excluir"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal: Add / Edit Condition */}
      {isModalOpen && editingCondition && (
        <div className="fixed inset-0 bg-black/60 dark:bg-black/80 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white dark:bg-[#18181b] border border-neutral-200 dark:border-[#27272a] rounded-2xl p-6 max-w-lg w-full space-y-4 shadow-2xl">
            <h3 className="text-base font-bold text-neutral-900 dark:text-white flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-blue-500 dark:text-blue-400" />
              <span>{editingCondition.id.includes('pay-') ? 'Nova Condição de Pagamento' : 'Editar Condição'}</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="text-neutral-500 dark:text-neutral-400 font-semibold block mb-1">Marca</label>
                <select
                  value={editingCondition.brand}
                  onChange={(e) => setEditingCondition({ ...editingCondition, brand: e.target.value as BrandType })}
                  className="w-full bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 rounded-xl px-3 py-2 text-neutral-900 dark:text-white font-bold"
                >
                  <option value="Suzuki">Suzuki</option>
                  <option value="Haojue">Haojue</option>
                  <option value="Zontes">Zontes</option>
                  <option value="Kymco">Kymco</option>
                </select>
              </div>

              <div>
                <label className="text-neutral-500 dark:text-neutral-400 font-semibold block mb-1">Modelo / Código</label>
                <input
                  type="text"
                  value={editingCondition.modelCode}
                  onChange={(e) => setEditingCondition({ ...editingCondition, modelCode: e.target.value })}
                  className="w-full bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 rounded-xl px-3 py-2 text-neutral-900 dark:text-white font-bold"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="text-neutral-500 dark:text-neutral-400 font-semibold block mb-1">Nome da Condição de Pagamento *</label>
                <input
                  type="text"
                  value={editingCondition.paymentMethodName}
                  onChange={(e) => setEditingCondition({ ...editingCondition, paymentMethodName: e.target.value })}
                  className="w-full bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 rounded-xl px-3 py-2 text-neutral-900 dark:text-white font-bold"
                />
              </div>

              <div>
                <label className="text-neutral-500 dark:text-neutral-400 font-semibold block mb-1">Desconto (%)</label>
                <input
                  type="number"
                  step="0.5"
                  value={editingCondition.discountPercentage}
                  onChange={(e) => setEditingCondition({ ...editingCondition, discountPercentage: Number(e.target.value) })}
                  className="w-full bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 rounded-xl px-3 py-2 text-emerald-600 dark:text-emerald-400 font-bold"
                />
              </div>

              <div>
                <label className="text-neutral-500 dark:text-neutral-400 font-semibold block mb-1">Número de Parcelas</label>
                <input
                  type="number"
                  value={editingCondition.installments}
                  onChange={(e) => setEditingCondition({ ...editingCondition, installments: Number(e.target.value) })}
                  className="w-full bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 rounded-xl px-3 py-2 text-neutral-900 dark:text-white font-bold"
                />
              </div>

              <div>
                <label className="text-neutral-500 dark:text-neutral-400 font-semibold block mb-1">Data Início Vigência</label>
                <input
                  type="date"
                  value={editingCondition.startDate}
                  onChange={(e) => setEditingCondition({ ...editingCondition, startDate: e.target.value })}
                  className="w-full bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 rounded-xl px-3 py-2 text-neutral-900 dark:text-white font-bold"
                />
              </div>

              <div>
                <label className="text-neutral-500 dark:text-neutral-400 font-semibold block mb-1">Data Fim Vigência</label>
                <input
                  type="date"
                  value={editingCondition.endDate}
                  onChange={(e) => setEditingCondition({ ...editingCondition, endDate: e.target.value })}
                  className="w-full bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 rounded-xl px-3 py-2 text-neutral-900 dark:text-white font-bold"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="text-neutral-500 dark:text-neutral-400 font-semibold block mb-1">Descrição / Detalhes Comercial</label>
                <textarea
                  rows={2}
                  value={editingCondition.description || ''}
                  onChange={(e) => setEditingCondition({ ...editingCondition, description: e.target.value })}
                  className="w-full bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 rounded-xl p-2 text-neutral-900 dark:text-white"
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
                className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-xs shadow-lg shadow-blue-500/20"
              >
                Salvar Condição
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
