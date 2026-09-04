import React, { useState, useEffect, useCallback } from 'react';
import { Brand } from '../types';
import { api } from '../services/api';
import { INITIAL_BRANDS } from '../data/mockBrandsData';
import { 
  Tag, 
  Plus, 
  Search, 
  Edit3, 
  Trash2, 
  ExternalLink, 
  CheckCircle2, 
  AlertTriangle, 
  Building2, 
  Bike, 
  RefreshCw,
  X,
  Palette
} from 'lucide-react';

interface BrandManagementViewProps {
  onBrandsUpdated?: () => void;
}

export const BrandManagementView: React.FC<BrandManagementViewProps> = ({ onBrandsUpdated }) => {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isNewBrand, setIsNewBrand] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [brandForm, setBrandForm] = useState<Partial<Brand>>({});
  
  // Delete confirm modal state
  const [brandToDelete, setBrandToDelete] = useState<Brand | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastType, setToastType] = useState<'success' | 'error'>('success');

  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
    setToastType(type);
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const loadBrands = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await api.getBrands();
      if (Array.isArray(data) && data.length > 0) {
        setBrands(data);
      } else {
        setBrands(INITIAL_BRANDS);
      }
    } catch (err: any) {
      console.warn('[Brands] API fallback:', err.message);
      setBrands(INITIAL_BRANDS);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadBrands();
  }, [loadBrands]);

  const filteredBrands = brands.filter(b => {
    const matchSearch = 
      b.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.codigo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (b.razaoSocial && b.razaoSocial.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (b.paisOrigem && b.paisOrigem.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchStatus = 
      statusFilter === 'all' || 
      (statusFilter === 'active' && b.ativo) || 
      (statusFilter === 'inactive' && !b.ativo);

    return matchSearch && matchStatus;
  });

  const handleOpenAdd = () => {
    setIsNewBrand(true);
    setBrandForm({
      nome: '',
      codigo: '',
      razaoSocial: '',
      cnpj: '',
      corPrimaria: '#00428c',
      corSecundaria: '#ffffff',
      logoUrl: '',
      siteOficial: '',
      descricao: '',
      paisOrigem: 'Brasil',
      ativo: true,
      ordemExibicao: brands.length + 1
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (brand: Brand) => {
    setIsNewBrand(false);
    setBrandForm({ ...brand });
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!brandForm.nome || !brandForm.nome.trim()) {
      showToast('O nome da marca é obrigatório.', 'error');
      return;
    }
    if (!brandForm.codigo || !brandForm.codigo.trim()) {
      showToast('A sigla/código da marca é obrigatória.', 'error');
      return;
    }

    setIsSaving(true);
    try {
      if (isNewBrand) {
        await api.createBrand(brandForm);
        showToast(`Marca "${brandForm.nome}" cadastrada com sucesso!`);
      } else if (brandForm.id) {
        await api.updateBrand(brandForm.id, brandForm);
        showToast(`Marca "${brandForm.nome}" atualizada com sucesso!`);
      }
      setIsModalOpen(false);
      await loadBrands();
      if (onBrandsUpdated) onBrandsUpdated();
    } catch (err: any) {
      showToast(err.message || 'Erro ao salvar marca.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!brandToDelete) return;
    setIsDeleting(true);
    try {
      const res = await api.deleteBrand(brandToDelete.id);
      showToast(res.message || 'Marca excluída com sucesso!');
      setBrandToDelete(null);
      await loadBrands();
      if (onBrandsUpdated) onBrandsUpdated();
    } catch (err: any) {
      showToast(err.message || 'Erro ao excluir marca.', 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Toast Notification */}
      {toastMessage && (
        <div className={`fixed bottom-6 right-6 z-50 px-5 py-3.5 rounded-2xl shadow-2xl font-bold text-xs flex items-center gap-2.5 backdrop-blur-md border ${
          toastType === 'success' ? 'bg-emerald-600/95 text-white border-emerald-400/30' : 'bg-rose-600/95 text-white border-rose-400/30'
        }`}>
          {toastType === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-gradient-to-r from-blue-950 via-slate-900 to-neutral-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-[10px] font-black uppercase tracking-wider bg-blue-500/20 text-blue-400 px-3 py-1 rounded-full border border-blue-500/30">
                Cadastro Central da Montadora
              </span>
              <span className="text-[10px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-400 px-3 py-1 rounded-full border border-emerald-500/30">
                Multi-Marcas Integrado
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-3">
              <Tag className="w-8 h-8 text-blue-500" />
              <span>Cadastro & Gestão de Marcas</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl mt-1">
              Administre marcas de motocicletas e produtos do grupo. Adições, edições e desativações sincronizam em todo o projeto.
            </p>
          </div>
          <button onClick={handleOpenAdd} className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold px-5 py-3 rounded-2xl text-xs flex items-center gap-2 transition-all shadow-lg shadow-blue-500/25 cursor-pointer">
            <Plus className="w-4 h-4" />
            <span>Nova Marca</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-[#18181b] border border-neutral-200 dark:border-[#27272a] rounded-2xl p-4 shadow-sm">
          <span className="text-[10px] text-neutral-500 dark:text-neutral-400 font-black uppercase tracking-wider block mb-1">Total de Marcas</span>
          <p className="text-2xl font-black text-neutral-900 dark:text-white font-tabular">{brands.length}</p>
        </div>
        <div className="bg-white dark:bg-[#18181b] border border-neutral-200 dark:border-[#27272a] rounded-2xl p-4 shadow-sm">
          <span className="text-[10px] text-neutral-500 dark:text-neutral-400 font-black uppercase tracking-wider block mb-1">Marcas Ativas</span>
          <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400 font-tabular">{brands.filter(b => b.ativo).length}</p>
        </div>
        <div className="bg-white dark:bg-[#18181b] border border-neutral-200 dark:border-[#27272a] rounded-2xl p-4 shadow-sm">
          <span className="text-[10px] text-neutral-500 dark:text-neutral-400 font-black uppercase tracking-wider block mb-1">Modelos Mapeados</span>
          <p className="text-2xl font-black text-blue-600 dark:text-blue-400 font-tabular">{brands.reduce((acc, b) => acc + (b.modelsCount || 0), 0)}</p>
        </div>
        <div className="bg-white dark:bg-[#18181b] border border-neutral-200 dark:border-[#27272a] rounded-2xl p-4 shadow-sm">
          <span className="text-[10px] text-neutral-500 dark:text-neutral-400 font-black uppercase tracking-wider block mb-1">Concessões Homologadas</span>
          <p className="text-2xl font-black text-indigo-600 dark:text-indigo-400 font-tabular">{brands.reduce((acc, b) => acc + (b.dealersCount || 0), 0)}</p>
        </div>
      </div>

      {/* Filters Toolbar */}
      <div className="bg-white dark:bg-[#18181b] border border-neutral-200 dark:border-[#27272a] rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-sm">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar por Nome, Sigla, Razão Social ou País de Origem..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-xl pl-9 pr-3 py-2 text-xs text-neutral-900 dark:text-white placeholder-neutral-400 focus:outline-none focus:border-blue-500"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as any)}
          className="bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-xl px-3 py-2 text-xs text-neutral-900 dark:text-neutral-200 focus:outline-none"
        >
          <option value="all">Todos os Status</option>
          <option value="active">Apenas Ativas</option>
          <option value="inactive">Apenas Inativas</option>
        </select>
      </div>

      {/* Brands Grid */}
      {isLoading ? (
        <div className="p-12 text-center text-xs text-neutral-500 font-bold">Carregando marcas...</div>
      ) : filteredBrands.length === 0 ? (
        <div className="p-12 text-center bg-white dark:bg-[#18181b] rounded-2xl border border-neutral-200 dark:border-[#27272a] space-y-3">
          <Tag className="w-10 h-10 text-neutral-400 mx-auto" />
          <p className="text-sm font-bold text-neutral-700 dark:text-neutral-300">Nenhuma marca encontrada.</p>
          <button onClick={handleOpenAdd} className="px-4 py-2 bg-blue-600 text-white font-bold rounded-xl text-xs">
            Cadastrar Marca
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredBrands.map((brand) => (
            <div
              key={brand.id}
              className="bg-white dark:bg-[#18181b] border border-neutral-200 dark:border-[#27272a] rounded-3xl p-5 shadow-md hover:shadow-xl transition-all flex flex-col justify-between relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 right-0 h-1.5" style={{ backgroundColor: brand.corPrimaria || '#00428c' }} />

              <div className="space-y-4 pt-1">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-12 h-12 rounded-2xl flex items-center justify-center font-black text-base text-white shadow-md flex-shrink-0"
                      style={{ backgroundColor: brand.corPrimaria || '#00428c' }}
                    >
                      {brand.codigo || brand.nome.substring(0, 3).toUpperCase()}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-base font-black text-neutral-900 dark:text-white">{brand.nome}</h3>
                        <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full border ${
                          brand.ativo ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20' : 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20'
                        }`}>
                          {brand.ativo ? 'Ativa' : 'Inativa'}
                        </span>
                      </div>
                      <span className="text-[11px] font-mono text-neutral-500 dark:text-neutral-400">
                        {brand.codigo} • {brand.paisOrigem || 'Brasil'}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <button onClick={() => handleOpenEdit(brand)} className="p-2 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-600 dark:text-neutral-300 rounded-xl transition cursor-pointer" title="Editar">
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button onClick={() => setBrandToDelete(brand)} className="p-2 hover:bg-rose-50 dark:hover:bg-rose-950/50 text-neutral-600 hover:text-rose-600 dark:text-neutral-300 dark:hover:text-rose-400 rounded-xl transition cursor-pointer" title="Excluir">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="space-y-2 text-xs text-neutral-600 dark:text-neutral-400 border-t border-neutral-100 dark:border-[#27272a] pt-3">
                  {brand.razaoSocial && (
                    <div className="flex items-center justify-between">
                      <span className="text-neutral-500 font-semibold">Razão Social:</span>
                      <span className="font-bold text-neutral-900 dark:text-neutral-200 truncate max-w-[180px]">{brand.razaoSocial}</span>
                    </div>
                  )}
                  {brand.cnpj && (
                    <div className="flex items-center justify-between">
                      <span className="text-neutral-500 font-semibold">CNPJ:</span>
                      <span className="font-mono text-neutral-800 dark:text-neutral-300">{brand.cnpj}</span>
                    </div>
                  )}
                  {brand.descricao && (
                    <p className="text-[11px] text-neutral-500 dark:text-neutral-400 line-clamp-2 pt-1">{brand.descricao}</p>
                  )}
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-neutral-100 dark:border-[#27272a] flex items-center justify-between">
                <div className="flex items-center gap-3 text-[11px] font-bold">
                  <span className="flex items-center gap-1 text-blue-600 dark:text-blue-400"><Bike className="w-3.5 h-3.5" />{brand.modelsCount || 0} modelos</span>
                  <span className="flex items-center gap-1 text-neutral-500"><Building2 className="w-3.5 h-3.5" />{brand.dealersCount || 0} dealers</span>
                </div>
                {brand.siteOficial && (
                  <a href={brand.siteOficial} target="_blank" rel="noreferrer" className="text-[11px] font-bold text-blue-600 hover:text-blue-500 dark:text-blue-400 flex items-center gap-1">
                    <span>Site</span><ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      )}


      {/* Modal: Add / Edit Brand */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white dark:bg-[#18181b] border border-neutral-200 dark:border-[#27272a] rounded-3xl p-6 max-w-xl w-full max-h-[90vh] overflow-y-auto space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-neutral-200 dark:border-[#27272a] pb-3">
              <h3 className="text-base font-black text-neutral-900 dark:text-white flex items-center gap-2">
                <Tag className="w-5 h-5 text-blue-500" />
                <span>{isNewBrand ? 'Cadastrar Nova Marca' : `Editar Marca: ${brandForm.nome}`}</span>
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="p-1.5 text-neutral-400 hover:text-neutral-900 dark:hover:text-white rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-800 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-3 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-neutral-500 dark:text-neutral-400 font-bold block mb-1">Nome da Marca *</label>
                  <input type="text" required placeholder="Ex: Suzuki" value={brandForm.nome || ''} onChange={(e) => setBrandForm({ ...brandForm, nome: e.target.value })} className="w-full bg-neutral-50 dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 rounded-xl px-3 py-2 text-neutral-900 dark:text-white font-bold focus:outline-none focus:border-blue-500" />
                </div>
                <div>
                  <label className="text-neutral-500 dark:text-neutral-400 font-bold block mb-1">Código / Sigla *</label>
                  <input type="text" required maxLength={10} placeholder="Ex: SUZ" value={brandForm.codigo || ''} onChange={(e) => setBrandForm({ ...brandForm, codigo: e.target.value.toUpperCase() })} className="w-full bg-neutral-50 dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 rounded-xl px-3 py-2 text-neutral-900 dark:text-white font-mono font-bold focus:outline-none focus:border-blue-500 uppercase" />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-neutral-500 dark:text-neutral-400 font-bold block mb-1">Razão Social</label>
                  <input type="text" placeholder="Razão social da empresa" value={brandForm.razaoSocial || ''} onChange={(e) => setBrandForm({ ...brandForm, razaoSocial: e.target.value })} className="w-full bg-neutral-50 dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 rounded-xl px-3 py-2 text-neutral-900 dark:text-white focus:outline-none focus:border-blue-500" />
                </div>
                <div>
                  <label className="text-neutral-500 dark:text-neutral-400 font-bold block mb-1">CNPJ</label>
                  <input type="text" placeholder="00.000.000/0000-00" value={brandForm.cnpj || ''} onChange={(e) => setBrandForm({ ...brandForm, cnpj: e.target.value })} className="w-full bg-neutral-50 dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 rounded-xl px-3 py-2 text-neutral-900 dark:text-white font-mono focus:outline-none focus:border-blue-500" />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-neutral-500 dark:text-neutral-400 font-bold block mb-1 flex items-center gap-1.5"><Palette className="w-3 h-3 text-blue-500" /> Cor Primária</label>
                  <div className="flex items-center gap-2">
                    <input type="color" value={brandForm.corPrimaria || '#00428c'} onChange={(e) => setBrandForm({ ...brandForm, corPrimaria: e.target.value })} className="w-8 h-8 rounded-lg border cursor-pointer bg-transparent" />
                    <input type="text" value={brandForm.corPrimaria || '#00428c'} onChange={(e) => setBrandForm({ ...brandForm, corPrimaria: e.target.value })} className="w-full bg-neutral-50 dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 rounded-xl px-2 py-1.5 font-mono text-xs text-neutral-900 dark:text-white" />
                  </div>
                </div>
                <div>
                  <label className="text-neutral-500 dark:text-neutral-400 font-bold block mb-1">País Origem</label>
                  <input type="text" placeholder="Ex: Japão" value={brandForm.paisOrigem || ''} onChange={(e) => setBrandForm({ ...brandForm, paisOrigem: e.target.value })} className="w-full bg-neutral-50 dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 rounded-xl px-3 py-2 text-neutral-900 dark:text-white focus:outline-none focus:border-blue-500" />
                </div>
                <div>
                  <label className="text-neutral-500 dark:text-neutral-400 font-bold block mb-1">Ordem</label>
                  <input type="number" min={0} value={brandForm.ordemExibicao || 0} onChange={(e) => setBrandForm({ ...brandForm, ordemExibicao: Number(e.target.value) })} className="w-full bg-neutral-50 dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 rounded-xl px-3 py-2 text-neutral-900 dark:text-white font-tabular focus:outline-none focus:border-blue-500" />
                </div>
              </div>

              <div>
                <label className="text-neutral-500 dark:text-neutral-400 font-bold block mb-1">Site Oficial</label>
                <input type="url" placeholder="https://..." value={brandForm.siteOficial || ''} onChange={(e) => setBrandForm({ ...brandForm, siteOficial: e.target.value })} className="w-full bg-neutral-50 dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 rounded-xl px-3 py-2 text-neutral-900 dark:text-white focus:outline-none focus:border-blue-500" />
              </div>

              <div>
                <label className="text-neutral-500 dark:text-neutral-400 font-bold block mb-1">Descrição</label>
                <textarea rows={2} placeholder="Resumo da marca..." value={brandForm.descricao || ''} onChange={(e) => setBrandForm({ ...brandForm, descricao: e.target.value })} className="w-full bg-neutral-50 dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 rounded-xl px-3 py-2 text-neutral-900 dark:text-white focus:outline-none focus:border-blue-500" />
              </div>

              <div className="flex items-center gap-3 pt-1">
                <label className="flex items-center gap-2 cursor-pointer font-bold text-xs text-neutral-800 dark:text-neutral-200">
                  <input type="checkbox" checked={brandForm.ativo !== false} onChange={(e) => setBrandForm({ ...brandForm, ativo: e.target.checked })} className="rounded text-blue-600 focus:ring-0 w-4 h-4" />
                  <span>Marca Ativa no Catálogo e Sistema</span>
                </label>
              </div>

              <div className="flex items-center justify-end gap-3 border-t border-neutral-200 dark:border-[#27272a] pt-3 mt-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 rounded-xl text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 font-bold transition cursor-pointer">Cancelar</button>
                <button type="submit" disabled={isSaving} className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl shadow-md transition disabled:opacity-50 cursor-pointer">
                  {isSaving ? 'Gravando...' : isNewBrand ? 'Criar Marca' : 'Salvar Alterações'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}


      {/* Delete Confirmation Modal */}
      {brandToDelete && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white dark:bg-[#18181b] border border-neutral-200 dark:border-[#27272a] rounded-3xl p-6 max-w-md w-full space-y-4 shadow-2xl">
            <div className="flex items-center gap-3 text-rose-600 dark:text-rose-400">
              <div className="p-2.5 bg-rose-500/10 rounded-2xl border border-rose-500/20">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <h3 className="text-base font-black text-neutral-900 dark:text-white">
                Excluir Marca: {brandToDelete.nome}
              </h3>
            </div>

            <p className="text-xs text-neutral-600 dark:text-neutral-300 leading-relaxed">
              Tem certeza que deseja remover a marca <strong>{brandToDelete.nome}</strong>?
            </p>

            {(brandToDelete.modelsCount || 0) > 0 && (
              <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-2xl text-[11px] text-amber-700 dark:text-amber-300 space-y-1">
                <p className="font-bold">Aviso de Integridade:</p>
                <p>Esta marca possui {brandToDelete.modelsCount} modelo(s) cadastrados. Ela será desativada no catálogo para manter pedidos históricos preservados.</p>
              </div>
            )}

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setBrandToDelete(null)}
                className="px-4 py-2 rounded-xl text-neutral-600 dark:text-neutral-400 font-bold hover:bg-neutral-100 dark:hover:bg-neutral-800"
              >
                Cancelar
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={handleDelete}
                className="px-5 py-2 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-xl shadow-md transition"
              >
                {isDeleting ? 'Excluindo...' : 'Confirmar Exclusão'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default BrandManagementView;

