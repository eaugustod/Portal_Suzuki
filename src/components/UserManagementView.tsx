import React, { useState, useEffect } from 'react';
import { 
  Users, 
  UserPlus, 
  Search, 
  Filter, 
  ShieldCheck, 
  KeyRound, 
  Building2, 
  Briefcase, 
  Mail, 
  Phone, 
  CheckCircle2, 
  AlertCircle, 
  Lock, 
  Unlock, 
  RefreshCw, 
  Edit3, 
  Eye, 
  Check, 
  X,
  Copy,
  Clock,
  ChevronRight
} from 'lucide-react';
import api from '../services/api';

import { DealershipScope, DealershipProfile, DealershipFullProfile } from '../types';

interface UserItem {
  id: string;
  dealershipId: string | null;
  dealershipName: string | null;
  dealerCode: string | null;
  departmentId: number;
  departmentName: string;
  departmentCode: string;
  profileId: number;
  profileCode: string;
  profileName: string;
  scopeType: 'montadora' | 'concessionaria';
  name: string;
  email: string;
  cpf: string | null;
  phone: string | null;
  role: string;
  status: 'ativo' | 'inativo' | 'bloqueado';
  isTemporaryPassword: boolean;
  mustChangePassword: boolean;
  failedAttempts: number;
  lastLogin: string | null;
  createdAt: string;
}

interface MetadataOption {
  departments: Array<{ id: number; name: string; code: string; description: string }>;
  profiles: Array<{ id: number; code: string; name: string; scopeType: string; description: string }>;
  dealerships: Array<{ id: string; dealerCode: string; name: string; city: string; state: string }>;
}

interface UserManagementViewProps {
  currentScope?: DealershipScope;
  activeDealership?: DealershipProfile | DealershipFullProfile;
}

export const UserManagementView: React.FC<UserManagementViewProps> = ({ 
  currentScope = 'jtoledo',
  activeDealership
}) => {
  const [users, setUsers] = useState<UserItem[]>([]);
  const [metadata, setMetadata] = useState<MetadataOption>({ departments: [], profiles: [], dealerships: [] });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterDepartment, setFilterDepartment] = useState('all');
  const [filterProfile, setFilterProfile] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterScope, setFilterScope] = useState('all');

  // Modais
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserItem | null>(null);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string; tempPass?: string } | null>(null);

  // Form State Novo/Editar
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: '',
    departmentId: 1,
    profileId: 1,
    dealershipId: '',
    phone: '',
    cpf: '',
    status: 'ativo',
    password: '',
    mustChangePassword: true
  });

  const isDealershipScope = currentScope !== 'jtoledo';

  const loadData = async () => {
    setLoading(true);
    try {
      const [usersData, metaData] = await Promise.all([
        api.getUsers(isDealershipScope ? currentScope : undefined),
        api.getUsersMetadata()
      ]);
      setUsers(usersData);
      setMetadata(metaData);
      if (metaData.departments.length > 0 && formData.departmentId === 1) {
        setFormData(prev => ({
          ...prev,
          departmentId: metaData.departments[0].id,
          profileId: metaData.profiles[0]?.id || 1,
          dealershipId: isDealershipScope ? currentScope : ''
        }));
      }
    } catch (err: any) {
      console.error(err);
      setNotification({ type: 'error', message: 'Erro ao carregar dados de usuários do SQL Server.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [currentScope]);

  const handleOpenCreate = () => {
    // Se for concessionária, filtra para um perfil de concessionária por padrão
    const defaultProfile = isDealershipScope
      ? metadata.profiles.find(p => p.scopeType === 'concessionaria') || metadata.profiles[0]
      : metadata.profiles[0];

    setFormData({
      name: '',
      email: '',
      role: '',
      departmentId: metadata.departments[0]?.id || 1,
      profileId: defaultProfile?.id || 1,
      dealershipId: isDealershipScope ? currentScope : '',
      phone: '',
      cpf: '',
      status: 'ativo',
      password: '',
      mustChangePassword: true
    });
    setIsNewModalOpen(true);
  };

  const handleOpenEdit = (u: UserItem) => {
    setSelectedUser(u);
    setFormData({
      name: u.name,
      email: u.email,
      role: u.role,
      departmentId: u.departmentId,
      profileId: u.profileId,
      dealershipId: u.dealershipId || (isDealershipScope ? currentScope : ''),
      phone: u.phone || '',
      cpf: u.cpf || '',
      status: u.status,
      password: '',
      mustChangePassword: u.mustChangePassword
    });
    setIsEditModalOpen(true);
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await api.createUser(formData);
      setIsNewModalOpen(false);
      setNotification({
        type: 'success',
        message: `Usuário ${formData.name} cadastrado com sucesso!`,
        tempPass: res.temporaryPassword
      });
      loadData();
    } catch (err: any) {
      setNotification({ type: 'error', message: err.message || 'Erro ao cadastrar usuário.' });
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;
    try {
      await api.updateUser(selectedUser.id, formData);
      setIsEditModalOpen(false);
      setNotification({ type: 'success', message: 'Dados do usuário atualizados com sucesso!' });
      loadData();
    } catch (err: any) {
      setNotification({ type: 'error', message: err.message || 'Erro ao atualizar usuário.' });
    }
  };

  const handleAdminResetPassword = async (user: UserItem) => {
    if (!window.confirm(`Deseja resetar a senha de acesso de ${user.name}? Uma nova senha provisória será gerada.`)) return;
    try {
      const res = await api.adminResetPassword(user.id);
      setNotification({
        type: 'success',
        message: `Senha de ${user.name} resetada com sucesso!`,
        tempPass: res.temporaryPassword
      });
      loadData();
    } catch (err: any) {
      setNotification({ type: 'error', message: err.message || 'Erro ao resetar senha.' });
    }
  };

  const handleToggleStatus = async (user: UserItem, newStatus: string) => {
    try {
      await api.toggleUserStatus(user.id, newStatus);
      setNotification({
        type: 'success',
        message: `Status de ${user.name} atualizado para ${newStatus.toUpperCase()}.`
      });
      loadData();
    } catch (err: any) {
      setNotification({ type: 'error', message: err.message || 'Erro ao alterar status.' });
    }
  };

  const filteredUsers = users.filter(u => {
    // Se estiver no escopo da concessionária, restringe estritamente aos usuários vinculados
    if (isDealershipScope && u.dealershipId !== currentScope) {
      return false;
    }

    const matchSearch = 
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      (u.dealershipName && u.dealershipName.toLowerCase().includes(search.toLowerCase())) ||
      u.role.toLowerCase().includes(search.toLowerCase());

    const matchDept = filterDepartment === 'all' || String(u.departmentId) === filterDepartment;
    const matchProfile = filterProfile === 'all' || String(u.profileId) === filterProfile;
    const matchStatus = filterStatus === 'all' || u.status === filterStatus;
    const matchScope = filterScope === 'all' || u.scopeType === filterScope;

    return matchSearch && matchDept && matchProfile && matchStatus && matchScope;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Banner Superior Corporativo Suzuki */}
      <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-neutral-900 rounded-3xl p-6 md:p-8 text-white shadow-xl border border-slate-800 relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="bg-blue-500/20 text-blue-400 text-[11px] font-bold px-3 py-0.5 rounded-full border border-blue-500/30 uppercase tracking-wider">
                {isDealershipScope ? 'Gestão da Concessionária' : 'Segurança & Governança Corporativa'}
              </span>
              <span className="text-slate-400 text-[11px] font-mono">
                {isDealershipScope && activeDealership ? `${activeDealership.name} (${activeDealership.city}/${activeDealership.state})` : 'SQL Server RBAC'}
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-black tracking-tight flex items-center gap-3">
              <Users className="w-8 h-8 text-blue-500" />
              {isDealershipScope ? `Equipe & Colaboradores — ${activeDealership?.name || 'Concessionária'}` : 'Gestão de Usuários & Logins'}
            </h1>
            <p className="text-slate-300 text-[13px] max-w-2xl">
              {isDealershipScope 
                ? 'Gerencie os usuários e alçadas de acesso da sua concessionária com perfis de gerência, vendas, peças e oficina autorizada.'
                : 'Administração centralizada de credenciais corporativas, alçadas de acesso por departamento, vínculos de concessionárias e redefinição de senhas para o Portal Suzuki.'}
            </p>
          </div>

          <button
            onClick={handleOpenCreate}
            className="self-start md:self-auto flex items-center gap-2 px-5 py-3 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-bold text-[13px] rounded-2xl shadow-lg shadow-blue-600/30 transition-all cursor-pointer"
          >
            <UserPlus className="w-4 h-4" />
            <span>Novo Colaborador</span>
          </button>
        </div>
      </div>

      {/* Alerta de Notificação / Senha Temporária */}
      {notification && (
        <div className={`p-4 rounded-2xl border flex flex-col md:flex-row md:items-center justify-between gap-3 animate-in fade-in duration-200 ${
          notification.type === 'success' 
            ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800/60 text-emerald-800 dark:text-emerald-300' 
            : 'bg-red-50 dark:bg-red-950/40 border-red-200 dark:border-red-800/60 text-red-800 dark:text-red-300'
        }`}>
          <div className="flex items-center gap-3">
            {notification.type === 'success' ? <CheckCircle2 className="w-5 h-5 shrink-0" /> : <AlertCircle className="w-5 h-5 shrink-0" />}
            <div>
              <p className="text-[13px] font-bold">{notification.message}</p>
              {notification.tempPass && (
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-[12px] opacity-90">Senha Temporária Gerada:</span>
                  <span className="font-mono font-bold bg-white dark:bg-neutral-800 px-2.5 py-0.5 rounded-lg border border-emerald-400 text-blue-600 dark:text-blue-400 text-[13px]">
                    {notification.tempPass}
                  </span>
                </div>
              )}
            </div>
          </div>
          <button 
            onClick={() => setNotification(null)}
            className="p-1 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 self-end md:self-auto"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Barra de Filtros e Busca */}
      <div className="bg-white dark:bg-neutral-900 p-4 md:p-5 rounded-2xl border border-slate-200 dark:border-neutral-800 shadow-sm space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
          
          {/* Busca por Nome/Email */}
          <div className="md:col-span-2 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por colaborador, e-mail ou concessionária..."
              className="w-full bg-slate-50 dark:bg-neutral-800/60 border border-slate-200 dark:border-neutral-700 rounded-xl py-2.5 pl-10 pr-4 text-[13px] text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
            />
          </div>

          {/* Filtro Departamento */}
          <div>
            <select
              value={filterDepartment}
              onChange={(e) => setFilterDepartment(e.target.value)}
              className="w-full bg-slate-50 dark:bg-neutral-800/60 border border-slate-200 dark:border-neutral-700 rounded-xl py-2.5 px-3 text-[13px] text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-600"
            >
              <option value="all">Todos Departamentos</option>
              {metadata.departments.map(d => (
                <option key={d.id} value={d.id}>{d.name}</option>
              ))}
            </select>
          </div>

          {/* Filtro Perfil */}
          <div>
            <select
              value={filterProfile}
              onChange={(e) => setFilterProfile(e.target.value)}
              className="w-full bg-slate-50 dark:bg-neutral-800/60 border border-slate-200 dark:border-neutral-700 rounded-xl py-2.5 px-3 text-[13px] text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-600"
            >
              <option value="all">Todos Perfis RBAC</option>
              {metadata.profiles.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>

          {/* Filtro Status */}
          <div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full bg-slate-50 dark:bg-neutral-800/60 border border-slate-200 dark:border-neutral-700 rounded-xl py-2.5 px-3 text-[13px] text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-600"
            >
              <option value="all">Todos os Status</option>
              <option value="ativo">Ativo</option>
              <option value="bloqueado">Bloqueado</option>
              <option value="inativo">Inativo</option>
            </select>
          </div>

        </div>

        {/* Contador */}
        <div className="flex items-center justify-between text-[12px] text-slate-500 dark:text-slate-400 pt-2 border-t border-slate-100 dark:border-neutral-800">
          <span>Exibindo <strong>{filteredUsers.length}</strong> usuários cadastrados no SQL Server</span>
          <button 
            onClick={loadData}
            className="flex items-center gap-1.5 hover:text-blue-600 dark:hover:text-blue-400 transition-colors font-medium"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Atualizar Lista</span>
          </button>
        </div>
      </div>

      {/* Tabela de Usuários */}
      <div className="bg-white dark:bg-neutral-900 rounded-3xl border border-slate-200 dark:border-neutral-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 dark:border-neutral-800 bg-slate-50/70 dark:bg-neutral-800/50 text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                <th className="py-3.5 px-4 md:px-6">Usuário / Colaborador</th>
                <th className="py-3.5 px-4">Departamento & Perfil</th>
                <th className="py-3.5 px-4">Entidade / Concessionária</th>
                <th className="py-3.5 px-4 text-center">Status Login</th>
                <th className="py-3.5 px-4">Último Acesso</th>
                <th className="py-3.5 px-4 md:px-6 text-right">Ações de Gestão</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-neutral-800 text-[13px]">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400 dark:text-neutral-500">
                    Nenhum colaborador encontrado com os filtros selecionados.
                  </td>
                </tr>
              ) : (
                filteredUsers.map(user => (
                  <tr key={user.id} className="hover:bg-slate-50/60 dark:hover:bg-neutral-800/40 transition-colors">
                    
                    {/* Nome / Email */}
                    <td className="py-3.5 px-4 md:px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white font-black text-[13px] flex items-center justify-center shrink-0 shadow-xs">
                          {user.name.split(' ').map(n => n[0]).slice(0, 2).join('')}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900 dark:text-white leading-tight">
                            {user.name}
                          </p>
                          <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 text-[11px] mt-0.5">
                            <Mail className="w-3 h-3 shrink-0" />
                            <span>{user.email}</span>
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Departamento & Cargo */}
                    <td className="py-3.5 px-4">
                      <div>
                        <span className="font-bold text-slate-800 dark:text-neutral-200 block">
                          {user.role}
                        </span>
                        <div className="flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                          <span className="bg-slate-100 dark:bg-neutral-800 px-2 py-0.5 rounded-md font-medium">
                            {user.departmentName}
                          </span>
                          <span>•</span>
                          <span className="text-blue-600 dark:text-blue-400 font-semibold">
                            {user.profileName}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Entidade / Escopo */}
                    <td className="py-3.5 px-4">
                      {user.dealershipName ? (
                        <div className="flex items-center gap-2">
                          <Building2 className="w-4 h-4 text-slate-400 shrink-0" />
                          <div>
                            <p className="font-semibold text-slate-900 dark:text-white text-[12px] leading-tight">
                              {user.dealershipName}
                            </p>
                            <span className="text-[10px] text-slate-400 font-mono">
                              Dealer {user.dealerCode}
                            </span>
                          </div>
                        </div>
                      ) : (
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-400 text-[11px] font-bold border border-blue-200 dark:border-blue-900/40">
                          <ShieldCheck className="w-3.5 h-3.5" />
                          <span>Montadora J. Toledo</span>
                        </div>
                      )}
                    </td>

                    {/* Status */}
                    <td className="py-3.5 px-4 text-center">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider ${
                        user.status === 'ativo'
                          ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800'
                          : user.status === 'bloqueado'
                          ? 'bg-red-100 dark:bg-red-950/60 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800'
                          : 'bg-slate-100 dark:bg-neutral-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-neutral-700'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${
                          user.status === 'ativo' ? 'bg-emerald-500 animate-pulse' : user.status === 'bloqueado' ? 'bg-red-500' : 'bg-slate-400'
                        }`} />
                        {user.status}
                      </span>
                    </td>

                    {/* Último Login */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400 text-[11px]">
                        <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>{user.lastLogin || 'Nunca acessou'}</span>
                      </div>
                    </td>

                    {/* Ações */}
                    <td className="py-3.5 px-4 md:px-6 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        
                        {/* Editar */}
                        <button
                          onClick={() => handleOpenEdit(user)}
                          title="Editar Usuário"
                          className="p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-neutral-800 text-slate-600 dark:text-slate-300 transition-colors"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>

                        {/* Reset de Senha */}
                        <button
                          onClick={() => handleAdminResetPassword(user)}
                          title="Gerar Nova Senha Provisória"
                          className="p-1.5 rounded-xl hover:bg-amber-100 dark:hover:bg-amber-950/50 text-amber-600 dark:text-amber-400 transition-colors"
                        >
                          <KeyRound className="w-4 h-4" />
                        </button>

                        {/* Bloquear / Desbloquear */}
                        {user.status === 'bloqueado' ? (
                          <button
                            onClick={() => handleToggleStatus(user, 'ativo')}
                            title="Desbloquear Usuário"
                            className="p-1.5 rounded-xl hover:bg-emerald-100 dark:hover:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 transition-colors"
                          >
                            <Unlock className="w-4 h-4" />
                          </button>
                        ) : (
                          <button
                            onClick={() => handleToggleStatus(user, 'bloqueado')}
                            title="Bloquear Acesso"
                            className="p-1.5 rounded-xl hover:bg-red-100 dark:hover:bg-red-950/50 text-red-600 dark:text-red-400 transition-colors"
                          >
                            <Lock className="w-4 h-4" />
                          </button>
                        )}

                      </div>
                    </td>

                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Criar Novo Usuário */}
      {isNewModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-xl bg-white dark:bg-neutral-900 rounded-3xl border border-slate-200 dark:border-neutral-800 shadow-2xl p-6 md:p-8 max-h-[90vh] overflow-y-auto">
            
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-neutral-800 mb-5">
              <div>
                <h3 className="text-[18px] font-bold text-slate-900 dark:text-white">Cadastrar Novo Usuário</h3>
                <p className="text-[12px] text-slate-500">Credenciais corporativas vinculadas ao SQL Server.</p>
              </div>
              <button 
                onClick={() => setIsNewModalOpen(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-neutral-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-4 text-[13px]">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold uppercase text-slate-600 dark:text-slate-400 mb-1">
                    Nome Completo *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="ex: Carlos Alberto Santos"
                    className="w-full bg-slate-50 dark:bg-neutral-800 border border-slate-200 dark:border-neutral-700 rounded-xl p-2.5 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase text-slate-600 dark:text-slate-400 mb-1">
                    E-mail Corporativo *
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="carlos@jtoledo.com.br"
                    className="w-full bg-slate-50 dark:bg-neutral-800 border border-slate-200 dark:border-neutral-700 rounded-xl p-2.5 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold uppercase text-slate-600 dark:text-slate-400 mb-1">
                    Cargo / Função *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    placeholder="ex: Consultor Comercial"
                    className="w-full bg-slate-50 dark:bg-neutral-800 border border-slate-200 dark:border-neutral-700 rounded-xl p-2.5 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase text-slate-600 dark:text-slate-400 mb-1">
                    Telefone / Celular
                  </label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="(11) 98765-4321"
                    className="w-full bg-slate-50 dark:bg-neutral-800 border border-slate-200 dark:border-neutral-700 rounded-xl p-2.5 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold uppercase text-slate-600 dark:text-slate-400 mb-1">
                    Departamento *
                  </label>
                  <select
                    value={formData.departmentId}
                    onChange={(e) => setFormData({ ...formData, departmentId: Number(e.target.value) })}
                    className="w-full bg-slate-50 dark:bg-neutral-800 border border-slate-200 dark:border-neutral-700 rounded-xl p-2.5 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                  >
                    {metadata.departments.map(d => (
                      <option key={d.id} value={d.id}>{d.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase text-slate-600 dark:text-slate-400 mb-1">
                    Perfil de Acesso (RBAC) *
                  </label>
                  <select
                    value={formData.profileId}
                    onChange={(e) => setFormData({ ...formData, profileId: Number(e.target.value) })}
                    className="w-full bg-slate-50 dark:bg-neutral-800 border border-slate-200 dark:border-neutral-700 rounded-xl p-2.5 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                  >
                    {metadata.profiles
                      .filter(p => isDealershipScope ? p.scopeType === 'concessionaria' : true)
                      .map(p => (
                        <option key={p.id} value={p.id}>{p.name} {!isDealershipScope ? `(${p.scopeType})` : ''}</option>
                      ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase text-slate-600 dark:text-slate-400 mb-1">
                  Vínculo com Concessionária {isDealershipScope ? '(Fixo)' : '(Opcional - Vazio para Montadora)'}
                </label>
                {isDealershipScope ? (
                  <div className="w-full bg-slate-100 dark:bg-neutral-800/80 border border-slate-200 dark:border-neutral-700 rounded-xl p-2.5 text-slate-700 dark:text-slate-300 font-semibold flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-blue-500 shrink-0" />
                    <span>{activeDealership?.name || currentScope} ({activeDealership?.city}/{activeDealership?.state})</span>
                  </div>
                ) : (
                  <select
                    value={formData.dealershipId}
                    onChange={(e) => setFormData({ ...formData, dealershipId: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-neutral-800 border border-slate-200 dark:border-neutral-700 rounded-xl p-2.5 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                  >
                    <option value="">🏢 Sem Concessionária (Usuário Montadora J. Toledo)</option>
                    {metadata.dealerships.map(d => (
                      <option key={d.id} value={d.id}>
                        {d.name} ({d.city}/{d.state}) - {d.dealerCode}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase text-slate-600 dark:text-slate-400 mb-1">
                  Senha Inicial (Opcional - Padrão corporativo Suzuki@2026)
                </label>
                <input
                  type="text"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="Deixe em branco para usar Suzuki@2026"
                  className="w-full bg-slate-50 dark:bg-neutral-800 border border-slate-200 dark:border-neutral-700 rounded-xl p-2.5 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <div className="pt-4 flex justify-end gap-3 border-t border-slate-100 dark:border-neutral-800">
                <button
                  type="button"
                  onClick={() => setIsNewModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-neutral-700 text-slate-600 dark:text-slate-300 font-medium hover:bg-slate-50 dark:hover:bg-neutral-800 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-md transition-all"
                >
                  Confirmar Cadastro
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

      {/* Modal Editar Usuário */}
      {isEditModalOpen && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-xl bg-white dark:bg-neutral-900 rounded-3xl border border-slate-200 dark:border-neutral-800 shadow-2xl p-6 md:p-8 max-h-[90vh] overflow-y-auto">
            
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-neutral-800 mb-5">
              <div>
                <h3 className="text-[18px] font-bold text-slate-900 dark:text-white">Editar Dados de {selectedUser.name}</h3>
                <p className="text-[12px] text-slate-500">Atualização de permissões e departamento.</p>
              </div>
              <button 
                onClick={() => setIsEditModalOpen(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-neutral-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="space-y-4 text-[13px]">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold uppercase text-slate-600 dark:text-slate-400 mb-1">
                    Nome Completo *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-neutral-800 border border-slate-200 dark:border-neutral-700 rounded-xl p-2.5 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase text-slate-600 dark:text-slate-400 mb-1">
                    E-mail Corporativo *
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-neutral-800 border border-slate-200 dark:border-neutral-700 rounded-xl p-2.5 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold uppercase text-slate-600 dark:text-slate-400 mb-1">
                    Cargo / Função *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-neutral-800 border border-slate-200 dark:border-neutral-700 rounded-xl p-2.5 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase text-slate-600 dark:text-slate-400 mb-1">
                    Status da Conta *
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-neutral-800 border border-slate-200 dark:border-neutral-700 rounded-xl p-2.5 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                  >
                    <option value="ativo">Ativo</option>
                    <option value="bloqueado">Bloqueado</option>
                    <option value="inativo">Inativo</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold uppercase text-slate-600 dark:text-slate-400 mb-1">
                    Departamento *
                  </label>
                  <select
                    value={formData.departmentId}
                    onChange={(e) => setFormData({ ...formData, departmentId: Number(e.target.value) })}
                    className="w-full bg-slate-50 dark:bg-neutral-800 border border-slate-200 dark:border-neutral-700 rounded-xl p-2.5 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                  >
                    {metadata.departments.map(d => (
                      <option key={d.id} value={d.id}>{d.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase text-slate-600 dark:text-slate-400 mb-1">
                    Perfil de Acesso (RBAC) *
                  </label>
                  <select
                    value={formData.profileId}
                    onChange={(e) => setFormData({ ...formData, profileId: Number(e.target.value) })}
                    className="w-full bg-slate-50 dark:bg-neutral-800 border border-slate-200 dark:border-neutral-700 rounded-xl p-2.5 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                  >
                    {metadata.profiles
                      .filter(p => isDealershipScope ? p.scopeType === 'concessionaria' : true)
                      .map(p => (
                        <option key={p.id} value={p.id}>{p.name} {!isDealershipScope ? `(${p.scopeType})` : ''}</option>
                      ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase text-slate-600 dark:text-slate-400 mb-1">
                  Vínculo com Concessionária {isDealershipScope ? '(Fixo)' : ''}
                </label>
                {isDealershipScope ? (
                  <div className="w-full bg-slate-100 dark:bg-neutral-800/80 border border-slate-200 dark:border-neutral-700 rounded-xl p-2.5 text-slate-700 dark:text-slate-300 font-semibold flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-blue-500 shrink-0" />
                    <span>{selectedUser?.dealershipName || activeDealership?.name || currentScope}</span>
                  </div>
                ) : (
                  <select
                    value={formData.dealershipId}
                    onChange={(e) => setFormData({ ...formData, dealershipId: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-neutral-800 border border-slate-200 dark:border-neutral-700 rounded-xl p-2.5 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                  >
                    <option value="">🏢 Sem Concessionária (Montadora J. Toledo)</option>
                    {metadata.dealerships.map(d => (
                      <option key={d.id} value={d.id}>
                        {d.name} ({d.city}/{d.state}) - {d.dealerCode}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              <div className="pt-4 flex justify-end gap-3 border-t border-slate-100 dark:border-neutral-800">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-neutral-700 text-slate-600 dark:text-slate-300 font-medium hover:bg-slate-50 dark:hover:bg-neutral-800 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-md transition-all"
                >
                  Salvar Alterações
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
};

export default UserManagementView;
