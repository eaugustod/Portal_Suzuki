import React, { useState } from 'react';
import { 
  DealershipFullProfile, 
  DealershipUser, 
  DealershipUserRole, 
  DealershipAccessLevel,
  DealershipScope,
  BrandType,
  DealerTier,
  DealershipStatus,
  BrazilRegion,
  TaxRegime,
  CreditRating,
  NavTab,
  PaymentConditionCampaign
} from '../types';
import { DEFAULT_BRAND_NAMES } from '../data/mockBrandsData';
import { 
  Building2, 
  Store, 
  Users, 
  CreditCard, 
  ShieldCheck, 
  KeyRound, 
  MapPin, 
  Phone, 
  Mail, 
  FileText, 
  DollarSign, 
  CheckCircle2, 
  AlertTriangle, 
  Lock, 
  Unlock, 
  Plus, 
  Search, 
  Filter, 
  Edit3, 
  Save, 
  X, 
  Trash2, 
  Eye, 
  EyeOff, 
  RefreshCw, 
  ExternalLink, 
  Truck, 
  BadgeCheck, 
  SlidersHorizontal, 
  LayoutGrid, 
  TableProperties, 
  Percent, 
  Calendar, 
  Briefcase, 
  Landmark, 
  Bike,
  Sparkles,
  ArrowRight
} from 'lucide-react';

interface DealershipManagementViewProps {
  dealerships: DealershipFullProfile[];
  paymentConditions?: PaymentConditionCampaign[];
  onUpdateDealership: (dealership: DealershipFullProfile) => void;
  onAddDealership: (dealership: DealershipFullProfile) => void;
  onDeleteDealership: (id: string) => void;
  onSelectDealership: (scope: DealershipScope) => void;
  onNavigate: (tab: NavTab) => void;
}

export const DealershipManagementView: React.FC<DealershipManagementViewProps> = ({
  dealerships,
  paymentConditions = [],
  onUpdateDealership,
  onAddDealership,
  onDeleteDealership,
  onSelectDealership,
  onNavigate
}) => {
  // Search & Filter States
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRegion, setSelectedRegion] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedTier, setSelectedTier] = useState<string>('all');
  const [selectedCreditRating, setSelectedCreditRating] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  // Edit / Details Modal State
  const [selectedDealership, setSelectedDealership] = useState<DealershipFullProfile | null>(null);
  const [activeTab, setActiveTab] = useState<'cadastral' | 'address' | 'users' | 'financial' | 'operations'>('cadastral');
  const [editForm, setEditForm] = useState<DealershipFullProfile | null>(null);
  const [saveNotification, setSaveNotification] = useState<string | null>(null);

  // New Dealership Modal State
  const [newDealerModalOpen, setNewDealerModalOpen] = useState(false);
  const [newDealerForm, setNewDealerForm] = useState<Partial<DealershipFullProfile>>({
    id: `dealer-${Date.now()}`,
    dealerCode: `SZX-${Math.floor(1000 + Math.random() * 9000)}`,
    name: '',
    shortName: '',
    legalName: '',
    tradeName: '',
    tagline: '',
    cnpj: '',
    stateRegistration: '',
    municipalRegistration: '',
    cnae: '45.41-2-01 - Comércio a varejo de motocicletas e motonetas novas',
    taxRegime: 'Lucro Real',
    foundedDate: new Date().toLocaleDateString('pt-BR'),
    type: 'concessionaria',
    status: 'ativa',
    tier: 'Ouro',
    dealerContractNumber: `CTR-JT-2024/${Math.floor(1000 + Math.random() * 9000)}`,
    contractValidUntil: '31/12/2028',
    brandsAuthorized: ['Suzuki', 'Zontes', 'Haojue'],
    city: '',
    state: 'SP',
    region: 'Sudeste',
    zipCode: '',
    street: '',
    number: '',
    complement: '',
    neighborhood: '',
    showroomAreaM2: 500,
    workshopAreaM2: 300,
    unloadingBayAvailable: true,
    unloadingRestrictions: 'Acesso normal em horário comercial.',
    monthlyTarget: 1500000,
    bannerColor: 'from-blue-950 to-neutral-900',
    accentColor: '#2563eb',
    phone: '',
    contactEmail: '',
    manager: '',
    creditLimit: 3000000,
    creditUsed: 0,
    floorPlanLimit: 1000000,
    defaultPaymentCondition: '30/60/90 DDL',
    creditRating: 'AA',
    onTimePaymentRate: 98.0,
    bankAccount: {
      bankName: 'Banco Itaú Unibanco S.A.',
      bankCode: '341',
      agency: '0001',
      accountNumber: '12345-6',
      accountType: 'Conta Corrente PJ',
      pixKey: '',
      pixKeyType: 'CNPJ'
    },
    rebateBonusPercentage: 2.0,
    financialContactEmail: '',
    financialContactPhone: '',
    creditNotes: 'Nova concessionária cadastrada no Portal J. Toledo.',
    lastCreditReviewDate: new Date().toLocaleDateString('pt-BR'),
    quotaAllocated: 20,
    quotaOrdered: 0,
    activeStockUnits: 0,
    monthlySalesCount: 0,
    users: []
  });

  // Password Reset / User Modal State
  const [passwordModalUser, setPasswordModalUser] = useState<{ dealer: DealershipFullProfile; user: DealershipUser } | null>(null);
  const [newPasswordValue, setNewPasswordValue] = useState('');
  const [showPasswordText, setShowPasswordText] = useState(false);
  const [mustChangeNextLogin, setMustChangeNextLogin] = useState(true);
  const [passwordSuccessMessage, setPasswordSuccessMessage] = useState<string | null>(null);

  // New User in Dealership Modal State
  const [newUserModalOpen, setNewUserModalOpen] = useState(false);
  const [newUserForm, setNewUserForm] = useState<Partial<DealershipUser>>({
    name: '',
    email: '',
    phone: '',
    cpf: '',
    role: 'Consultor de Vendas',
    accessLevel: 'vendas',
    status: 'ativo',
    passwordMasked: '••••••••••••',
    mustChangePasswordNextLogin: true
  });

  // Open Edit Modal
  const handleOpenEditModal = (dealer: DealershipFullProfile, initialTab: 'cadastral' | 'address' | 'users' | 'financial' | 'operations' = 'cadastral') => {
    setSelectedDealership(dealer);
    setEditForm(JSON.parse(JSON.stringify(dealer)));
    setActiveTab(initialTab);
    setSaveNotification(null);
  };

  // Save changes to current dealership
  const handleSaveDealershipChanges = () => {
    if (!editForm) return;
    onUpdateDealership(editForm);
    setSelectedDealership(editForm);
    setSaveNotification('Configurações da concessionária salvas com sucesso!');
    setTimeout(() => setSaveNotification(null), 3000);
  };

  // Save new user in the currently open dealership
  const handleCreateNewUser = () => {
    if (!editForm || !newUserForm.name || !newUserForm.email) return;

    const createdUser: DealershipUser = {
      id: `usr-${Date.now()}`,
      name: newUserForm.name || '',
      email: newUserForm.email || '',
      phone: newUserForm.phone || '',
      cpf: newUserForm.cpf || '',
      role: newUserForm.role as DealershipUserRole || 'Consultor de Vendas',
      accessLevel: newUserForm.accessLevel as DealershipAccessLevel || 'vendas',
      status: newUserForm.status as 'ativo' | 'inativo' | 'bloqueado' || 'ativo',
      lastLogin: 'Nunca acessou',
      passwordMasked: '••••••••••••',
      temporaryPasswordActive: true,
      mustChangePasswordNextLogin: newUserForm.mustChangePasswordNextLogin ?? true,
      createdAt: new Date().toLocaleDateString('pt-BR')
    };

    const updatedUsers = [...(editForm.users || []), createdUser];
    const updatedForm = { ...editForm, users: updatedUsers };
    setEditForm(updatedForm);
    onUpdateDealership(updatedForm);
    setSelectedDealership(updatedForm);
    setNewUserModalOpen(false);
    setNewUserForm({
      name: '',
      email: '',
      phone: '',
      cpf: '',
      role: 'Consultor de Vendas',
      accessLevel: 'vendas',
      status: 'ativo',
      passwordMasked: '••••••••••••',
      mustChangePasswordNextLogin: true
    });
  };

  // Delete user from dealership
  const handleDeleteUser = (userId: string) => {
    if (!editForm) return;
    const updatedUsers = editForm.users.filter(u => u.id !== userId);
    const updatedForm = { ...editForm, users: updatedUsers };
    setEditForm(updatedForm);
    onUpdateDealership(updatedForm);
    setSelectedDealership(updatedForm);
  };

  // Toggle user active status
  const handleToggleUserStatus = (userId: string) => {
    if (!editForm) return;
    const updatedUsers = editForm.users.map(u => {
      if (u.id !== userId) return u;
      const nextStatus: 'ativo' | 'bloqueado' = u.status === 'ativo' ? 'bloqueado' : 'ativo';
      return { ...u, status: nextStatus };
    });
    const updatedForm = { ...editForm, users: updatedUsers };
    setEditForm(updatedForm);
    onUpdateDealership(updatedForm);
    setSelectedDealership(updatedForm);
  };

  // Save new password for user
  const handleSaveNewPassword = () => {
    if (!passwordModalUser || !newPasswordValue.trim()) return;

    const { dealer, user } = passwordModalUser;
    const updatedUsers = dealer.users.map(u => {
      if (u.id !== user.id) return u;
      return {
        ...u,
        temporaryPasswordActive: true,
        mustChangePasswordNextLogin: mustChangeNextLogin
      };
    });

    const updatedDealer = { ...dealer, users: updatedUsers };
    onUpdateDealership(updatedDealer);
    if (selectedDealership?.id === dealer.id) {
      setSelectedDealership(updatedDealer);
      setEditForm(updatedDealer);
    }

    setPasswordSuccessMessage(`Nova senha definida com sucesso para ${user.name}!`);
    setTimeout(() => {
      setPasswordSuccessMessage(null);
      setPasswordModalUser(null);
      setNewPasswordValue('');
    }, 2000);
  };

  // Generate random safe password
  const generateRandomPassword = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$%&*';
    let pass = '';
    for (let i = 0; i < 10; i++) {
      pass += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setNewPasswordValue(pass);
  };

  // Submit new dealership registration
  const handleSubmitNewDealership = () => {
    if (!newDealerForm.name || !newDealerForm.cnpj || !newDealerForm.city) return;

    const fullDealer: DealershipFullProfile = {
      id: newDealerForm.id || `dealer-${Date.now()}`,
      dealerCode: newDealerForm.dealerCode || `SZX-${Math.floor(1000 + Math.random() * 9000)}`,
      name: newDealerForm.name || '',
      shortName: newDealerForm.shortName || newDealerForm.name || '',
      legalName: newDealerForm.legalName || newDealerForm.name || '',
      tradeName: newDealerForm.tradeName || newDealerForm.name || '',
      tagline: newDealerForm.tagline || `Concessionária Autorizada Suzuki • ${newDealerForm.city}/${newDealerForm.state}`,
      cnpj: newDealerForm.cnpj || '',
      stateRegistration: newDealerForm.stateRegistration || 'Isento / Em Homologação',
      municipalRegistration: newDealerForm.municipalRegistration || 'Em Homologação',
      cnae: newDealerForm.cnae || '45.41-2-01 - Comércio a varejo de motocicletas e motonetas novas',
      taxRegime: newDealerForm.taxRegime || 'Lucro Real',
      foundedDate: newDealerForm.foundedDate || new Date().toLocaleDateString('pt-BR'),
      type: 'concessionaria',
      status: newDealerForm.status || 'ativa',
      tier: newDealerForm.tier || 'Ouro',
      dealerContractNumber: newDealerForm.dealerContractNumber || `CTR-JT-2024/${Math.floor(1000 + Math.random() * 9000)}`,
      contractValidUntil: newDealerForm.contractValidUntil || '31/12/2028',
      brandsAuthorized: newDealerForm.brandsAuthorized || ['Suzuki', 'Zontes', 'Haojue'],
      city: newDealerForm.city || '',
      state: newDealerForm.state || 'SP',
      region: newDealerForm.region || 'Sudeste',
      zipCode: newDealerForm.zipCode || '00000-000',
      street: newDealerForm.street || 'Avenida Principal',
      number: newDealerForm.number || '100',
      complement: newDealerForm.complement || '',
      neighborhood: newDealerForm.neighborhood || 'Centro',
      showroomAreaM2: newDealerForm.showroomAreaM2 || 500,
      workshopAreaM2: newDealerForm.workshopAreaM2 || 300,
      unloadingBayAvailable: newDealerForm.unloadingBayAvailable ?? true,
      unloadingRestrictions: newDealerForm.unloadingRestrictions || 'Acesso normal em horário comercial.',
      monthlyTarget: newDealerForm.monthlyTarget || 1500000,
      bannerColor: newDealerForm.bannerColor || 'from-blue-950 to-neutral-900',
      accentColor: newDealerForm.accentColor || '#2563eb',
      phone: newDealerForm.phone || '(11) 3000-0000',
      contactEmail: newDealerForm.contactEmail || 'contato@concessionaria.com.br',
      manager: newDealerForm.manager || 'Diretoria Geral',
      creditLimit: newDealerForm.creditLimit || 3000000,
      creditUsed: newDealerForm.creditUsed || 0,
      floorPlanLimit: newDealerForm.floorPlanLimit || 1000000,
      defaultPaymentCondition: newDealerForm.defaultPaymentCondition || '30/60/90 DDL',
      creditRating: newDealerForm.creditRating || 'AA',
      onTimePaymentRate: newDealerForm.onTimePaymentRate || 98.0,
      bankAccount: newDealerForm.bankAccount || {
        bankName: 'Banco Itaú Unibanco S.A.',
        bankCode: '341',
        agency: '0001',
        accountNumber: '12345-6',
        accountType: 'Conta Corrente PJ',
        pixKey: newDealerForm.cnpj || '',
        pixKeyType: 'CNPJ'
      },
      rebateBonusPercentage: newDealerForm.rebateBonusPercentage || 2.0,
      financialContactEmail: newDealerForm.financialContactEmail || newDealerForm.contactEmail || '',
      financialContactPhone: newDealerForm.financialContactPhone || newDealerForm.phone || '',
      creditNotes: newDealerForm.creditNotes || 'Nova concessionária cadastrada e homologada no Portal J. Toledo.',
      lastCreditReviewDate: newDealerForm.lastCreditReviewDate || new Date().toLocaleDateString('pt-BR'),
      quotaAllocated: newDealerForm.quotaAllocated || 20,
      quotaOrdered: 0,
      activeStockUnits: 0,
      monthlySalesCount: 0,
      users: [
        {
          id: `usr-new-${Date.now()}`,
          name: newDealerForm.manager || 'Titular da Concessionária',
          email: newDealerForm.contactEmail || 'titular@dealer.com.br',
          phone: newDealerForm.phone || '',
          role: 'Diretor / Titular',
          accessLevel: 'admin_dealer',
          status: 'ativo',
          lastLogin: 'Nunca acessou',
          passwordMasked: '••••••••••••',
          temporaryPasswordActive: true,
          mustChangePasswordNextLogin: true,
          createdAt: new Date().toLocaleDateString('pt-BR')
        }
      ]
    };

    onAddDealership(fullDealer);
    setNewDealerModalOpen(false);
  };

  // Filtered Dealerships List
  const filteredDealerships = dealerships.filter(d => {
    const matchesSearch = 
      d.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.legalName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.dealerCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.cnpj.includes(searchTerm) ||
      d.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.manager.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesRegion = selectedRegion === 'all' || d.region === selectedRegion;
    const matchesStatus = selectedStatus === 'all' || d.status === selectedStatus;
    const matchesTier = selectedTier === 'all' || d.tier === selectedTier;
    const matchesCredit = selectedCreditRating === 'all' || d.creditRating === selectedCreditRating;

    return matchesSearch && matchesRegion && matchesStatus && matchesTier && matchesCredit;
  });

  // Calculate Macro Stats
  const totalCreditGranted = dealerships.reduce((acc, d) => acc + (d.creditLimit || 0), 0);
  const totalCreditUsed = dealerships.reduce((acc, d) => acc + (d.creditUsed || 0), 0);
  const totalAvailableCredit = totalCreditGranted - totalCreditUsed;
  const totalUsersCount = dealerships.reduce((acc, d) => acc + (d.users?.length || 0), 0);
  const avgOnTimePayment = dealerships.length > 0 
    ? (dealerships.reduce((acc, d) => acc + (d.onTimePaymentRate || 95), 0) / dealerships.length).toFixed(1)
    : '98.0';

  // Common Input Styles for Light / Dark Mode Consistency
  const inputClassName = "w-full bg-neutral-50 dark:bg-[#121215] border border-neutral-300 dark:border-[#27272a] rounded-xl px-3.5 py-2.5 text-xs font-medium text-neutral-900 dark:text-white placeholder-neutral-400 dark:placeholder-neutral-500 focus:outline-none focus:border-blue-500 transition-colors";
  const selectClassName = "w-full bg-neutral-50 dark:bg-[#121215] border border-neutral-300 dark:border-[#27272a] rounded-xl px-3.5 py-2.5 text-xs font-semibold text-neutral-900 dark:text-white focus:outline-none focus:border-blue-500 transition-colors";

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-300">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-900 via-slate-900 to-neutral-950 p-6 md:p-8 border border-blue-900/40 shadow-2xl">
        <div className="absolute -right-10 -bottom-10 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-300 text-[11px] font-bold uppercase tracking-wider">
              <Building2 className="w-3.5 h-3.5" />
              <span>Gestão Central da Rede Autorizada • J. Toledo Brasil</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
              Cadastro e Configurações de Concessionárias
            </h1>
            <p className="text-neutral-300 text-sm max-w-2xl leading-relaxed">
              Administração completa e individualizada das concessionárias: dados cadastrais, endereços e logística, gestão de usuários e senhas de acesso, contas bancárias e concessão de limites de crédito.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <button
              onClick={() => setNewDealerModalOpen(true)}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold px-5 py-3 rounded-2xl text-sm flex items-center gap-2 transition-all shadow-lg shadow-blue-500/25 active:scale-95 cursor-pointer"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>Cadastrar Nova Concessionária</span>
            </button>
          </div>
        </div>
      </div>

      {/* 5 Macro Executive KPI Cards (Bento) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* KPI 1: Total Rede */}
        <div className="bg-white dark:bg-[#18181b] border border-neutral-200 dark:border-[#27272a] rounded-3xl p-5 shadow-sm hover:border-blue-500/40 transition-all">
          <div className="flex justify-between items-start mb-3">
            <span className="text-[11px] font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">Rede Homologada</span>
            <div className="p-2 bg-blue-50 dark:bg-blue-950/80 border border-blue-200 dark:border-blue-600/30 text-blue-600 dark:text-blue-400 rounded-xl">
              <Store className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl md:text-3xl font-extrabold text-neutral-900 dark:text-white font-tabular">{dealerships.length} Lojas</p>
          <div className="flex items-center gap-2 mt-2 text-xs text-neutral-500 dark:text-neutral-400">
            <span className="text-emerald-600 dark:text-emerald-400 font-bold">{dealerships.filter(d => d.status === 'ativa').length} ativas</span>
            <span>•</span>
            <span>5 regiões do Brasil</span>
          </div>
        </div>

        {/* KPI 2: Limite Concedido */}
        <div className="bg-white dark:bg-[#18181b] border border-neutral-200 dark:border-[#27272a] rounded-3xl p-5 shadow-sm hover:border-blue-500/40 transition-all">
          <div className="flex justify-between items-start mb-3">
            <span className="text-[11px] font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">Crédito Total Homologado</span>
            <div className="p-2 bg-indigo-50 dark:bg-indigo-950/80 border border-indigo-200 dark:border-indigo-600/30 text-indigo-600 dark:text-indigo-400 rounded-xl">
              <CreditCard className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl md:text-3xl font-extrabold text-neutral-900 dark:text-white font-tabular">
            R$ {(totalCreditGranted / 1000000).toFixed(1)} M
          </p>
          <div className="flex items-center gap-2 mt-2 text-xs text-indigo-600 dark:text-indigo-400 font-medium">
            <BadgeCheck className="w-3.5 h-3.5" />
            <span>Comitê Financeiro J. Toledo</span>
          </div>
        </div>

        {/* KPI 3: Crédito em Utilização */}
        <div className="bg-white dark:bg-[#18181b] border border-neutral-200 dark:border-[#27272a] rounded-3xl p-5 shadow-sm hover:border-blue-500/40 transition-all">
          <div className="flex justify-between items-start mb-3">
            <span className="text-[11px] font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">Crédito Utilizado</span>
            <div className="p-2 bg-amber-50 dark:bg-amber-950/80 border border-amber-200 dark:border-amber-600/30 text-amber-600 dark:text-amber-400 rounded-xl">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl md:text-3xl font-extrabold text-amber-600 dark:text-amber-400 font-tabular">
            R$ {(totalCreditUsed / 1000000).toFixed(1)} M
          </p>
          <div className="mt-2 flex items-center justify-between text-xs text-neutral-500 dark:text-neutral-400">
            <span>Ocupação: {((totalCreditUsed / Math.max(1, totalCreditGranted)) * 100).toFixed(0)}%</span>
            <span className="text-emerald-600 dark:text-emerald-400 font-medium">Saldo: R$ {(totalAvailableCredit / 1000000).toFixed(1)}M</span>
          </div>
        </div>

        {/* KPI 4: Usuários Concessionárias */}
        <div className="bg-white dark:bg-[#18181b] border border-neutral-200 dark:border-[#27272a] rounded-3xl p-5 shadow-sm hover:border-blue-500/40 transition-all">
          <div className="flex justify-between items-start mb-3">
            <span className="text-[11px] font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">Usuários / Acessos</span>
            <div className="p-2 bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-200 dark:border-emerald-600/30 text-emerald-600 dark:text-emerald-400 rounded-xl">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl md:text-3xl font-extrabold text-neutral-900 dark:text-white font-tabular">{totalUsersCount} Usuários</p>
          <div className="flex items-center gap-1.5 mt-2 text-xs text-neutral-500 dark:text-neutral-400">
            <KeyRound className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>Gestão individual de senhas</span>
          </div>
        </div>

        {/* KPI 5: Rating de Adimplência */}
        <div className="bg-white dark:bg-[#18181b] border border-neutral-200 dark:border-[#27272a] rounded-3xl p-5 shadow-sm hover:border-blue-500/40 transition-all">
          <div className="flex justify-between items-start mb-3">
            <span className="text-[11px] font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">Pontualidade Média</span>
            <div className="p-2 bg-teal-50 dark:bg-teal-950/80 border border-teal-200 dark:border-teal-600/30 text-teal-600 dark:text-teal-400 rounded-xl">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl md:text-3xl font-extrabold text-emerald-600 dark:text-emerald-400 font-tabular">{avgOnTimePayment}%</p>
          <div className="flex items-center gap-1.5 mt-2 text-xs text-neutral-500 dark:text-neutral-400">
            <span className="text-emerald-600 dark:text-emerald-400 font-bold">Risco Baixo</span>
            <span>•</span>
            <span>Rating Médio AAA/AA</span>
          </div>
        </div>
      </div>

      {/* Search & Filters Controls Bar */}
      <div className="bg-white dark:bg-[#18181b] border border-neutral-200 dark:border-[#27272a] rounded-3xl p-4 md:p-5 shadow-lg flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
        {/* Search Bar */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400 dark:text-neutral-400" />
          <input
            type="text"
            placeholder="Buscar por Nome Fantasia, Razão Social, CNPJ, Código SZX, Cidade ou Titular..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-neutral-50 dark:bg-[#121215] border border-neutral-300 dark:border-[#27272a] rounded-2xl pl-10 pr-10 py-2.5 text-xs md:text-sm text-neutral-900 dark:text-white placeholder-neutral-400 dark:placeholder-neutral-500 focus:outline-none focus:border-blue-500 transition-colors"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-neutral-900 dark:hover:text-white text-xs font-semibold px-1"
            >
              Limpar
            </button>
          )}
        </div>

        {/* Filters and View Mode Switcher */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Region Filter */}
          <select
            value={selectedRegion}
            onChange={(e) => setSelectedRegion(e.target.value)}
            className="bg-neutral-50 dark:bg-[#121215] border border-neutral-300 dark:border-[#27272a] rounded-xl px-3 py-2.5 text-xs font-semibold text-neutral-900 dark:text-neutral-200 focus:outline-none focus:border-blue-500 min-w-[140px]"
          >
            <option value="all">Todas as Regiões</option>
            <option value="Sul">Região Sul</option>
            <option value="Sudeste">Região Sudeste</option>
            <option value="Centro-Oeste">Região Centro-Oeste</option>
            <option value="Nordeste">Região Nordeste</option>
            <option value="Norte">Região Norte</option>
          </select>

          {/* Tier Filter */}
          <select
            value={selectedTier}
            onChange={(e) => setSelectedTier(e.target.value)}
            className="bg-neutral-50 dark:bg-[#121215] border border-neutral-300 dark:border-[#27272a] rounded-xl px-3 py-2.5 text-xs font-semibold text-neutral-900 dark:text-neutral-200 focus:outline-none focus:border-blue-500 min-w-[130px]"
          >
            <option value="all">Todos os Tiers</option>
            <option value="Diamante">Tier Diamante</option>
            <option value="Ouro">Tier Ouro</option>
            <option value="Prata">Tier Prata</option>
            <option value="Bronze">Tier Bronze</option>
          </select>

          {/* Status Filter */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="bg-neutral-50 dark:bg-[#121215] border border-neutral-300 dark:border-[#27272a] rounded-xl px-3 py-2.5 text-xs font-semibold text-neutral-900 dark:text-neutral-200 focus:outline-none focus:border-blue-500 min-w-[130px]"
          >
            <option value="all">Todos os Status</option>
            <option value="ativa">Ativa</option>
            <option value="homologacao">Em Homologação</option>
            <option value="suspensa">Suspensa</option>
            <option value="bloqueada">Bloqueada</option>
          </select>

          {/* View Mode Toggle */}
          <div className="bg-neutral-100 dark:bg-[#121215] p-1 border border-neutral-300 dark:border-[#27272a] rounded-xl flex items-center gap-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg transition-colors ${
                viewMode === 'grid' ? 'bg-blue-600 text-white shadow-sm' : 'text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
              }`}
              title="Visualização em Cards"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-2 rounded-lg transition-colors ${
                viewMode === 'table' ? 'bg-blue-600 text-white shadow-sm' : 'text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
              }`}
              title="Visualização em Tabela"
            >
              <TableProperties className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Dealerships Listing */}
      {filteredDealerships.length === 0 ? (
        <div className="bg-white dark:bg-[#18181b] border border-neutral-200 dark:border-[#27272a] rounded-3xl p-12 text-center space-y-4 shadow-sm">
          <div className="w-16 h-16 bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-neutral-500 rounded-full flex items-center justify-center mx-auto">
            <Building2 className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-neutral-900 dark:text-white">Nenhuma concessionária encontrada</h3>
          <p className="text-sm text-neutral-500 dark:text-neutral-400 max-w-md mx-auto">
            Não encontramos nenhuma concessionária com os filtros selecionados. Tente ajustar os termos de busca.
          </p>
          <button
            onClick={() => {
              setSearchTerm('');
              setSelectedRegion('all');
              setSelectedStatus('all');
              setSelectedTier('all');
              setSelectedCreditRating('all');
            }}
            className="px-4 py-2 bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-neutral-900 dark:text-white font-bold rounded-xl text-xs transition-colors"
          >
            Redefinir Filtros
          </button>
        </div>
      ) : viewMode === 'grid' ? (
        /* Bento Cards Grid View */
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {filteredDealerships.map((dealer) => {
            const creditPercent = Math.min(100, Math.round(((dealer.creditUsed || 0) / Math.max(1, dealer.creditLimit || 1)) * 100));
            const availableCredit = (dealer.creditLimit || 0) - (dealer.creditUsed || 0);

            return (
              <div
                key={dealer.id}
                className="bg-white dark:bg-[#18181b] border border-neutral-200 dark:border-[#27272a] hover:border-blue-500/50 rounded-3xl p-6 shadow-md hover:shadow-xl transition-all flex flex-col justify-between group relative overflow-hidden"
              >
                {/* Top Accent Line */}
                <div 
                  className="absolute top-0 left-0 right-0 h-1.5"
                  style={{ backgroundColor: dealer.accentColor || '#3b82f6' }}
                />

                <div className="space-y-4">
                  {/* Top Bar: Code, Tier, Status */}
                  <div className="flex items-center justify-between gap-2 pt-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-extrabold px-2.5 py-1 rounded-lg bg-blue-50 dark:bg-blue-950/80 border border-blue-200 dark:border-blue-600/40 text-blue-700 dark:text-blue-400">
                        {dealer.dealerCode}
                      </span>
                      <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
                        dealer.tier === 'Diamante'
                          ? 'bg-blue-100 dark:bg-blue-500/20 text-blue-800 dark:text-blue-300 border border-blue-300 dark:border-blue-400/40'
                          : dealer.tier === 'Ouro'
                          ? 'bg-amber-100 dark:bg-amber-500/20 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-400/40'
                          : dealer.tier === 'Prata'
                          ? 'bg-slate-100 dark:bg-slate-500/20 text-slate-800 dark:text-slate-300 border border-slate-300 dark:border-slate-400/40'
                          : 'bg-orange-100 dark:bg-orange-500/20 text-orange-800 dark:text-orange-300 border border-orange-300 dark:border-orange-400/40'
                      }`}>
                        Tier {dealer.tier}
                      </span>
                    </div>

                    <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-md uppercase ${
                      dealer.status === 'ativa'
                        ? 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-600/30'
                        : dealer.status === 'homologacao'
                        ? 'bg-blue-100 dark:bg-blue-950/80 text-blue-800 dark:text-blue-400 border border-blue-300 dark:border-blue-600/30'
                        : 'bg-rose-100 dark:bg-rose-950/80 text-rose-800 dark:text-rose-400 border border-rose-300 dark:border-rose-600/30'
                    }`}>
                      {dealer.status}
                    </span>
                  </div>

                  {/* Dealer Name & City */}
                  <div>
                    <h3 className="text-lg font-bold text-neutral-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      {dealer.tradeName || dealer.name}
                    </h3>
                    <p className="text-xs text-neutral-500 dark:text-neutral-400 line-clamp-1 mt-0.5">{dealer.legalName}</p>
                    <p className="text-xs text-neutral-600 dark:text-neutral-400 flex items-center gap-1.5 mt-2 font-medium">
                      <MapPin className="w-3.5 h-3.5 text-blue-500 dark:text-blue-400 shrink-0" />
                      <span>{dealer.city}/{dealer.state} • Região {dealer.region}</span>
                    </p>
                  </div>

                  {/* Corporate Snippet */}
                  <div className="bg-neutral-50 dark:bg-[#121215] border border-neutral-200 dark:border-[#27272a] rounded-2xl p-3.5 text-xs space-y-1.5 font-tabular">
                    <div className="flex justify-between text-neutral-500 dark:text-neutral-400">
                      <span>CNPJ:</span>
                      <span className="font-mono text-neutral-900 dark:text-white font-bold">{dealer.cnpj}</span>
                    </div>
                    <div className="flex justify-between text-neutral-500 dark:text-neutral-400">
                      <span>Titular / Gestor:</span>
                      <span className="text-neutral-900 dark:text-white font-semibold">{dealer.manager}</span>
                    </div>
                    <div className="flex justify-between text-neutral-500 dark:text-neutral-400">
                      <span>Usuários Ativos:</span>
                      <span className="text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                        <Users className="w-3 h-3" />
                        {dealer.users?.length || 0} cadastrados
                      </span>
                    </div>
                  </div>

                  {/* Financial & Credit Progress Box */}
                  <div className="bg-neutral-50 dark:bg-[#121215] border border-neutral-200 dark:border-[#27272a] rounded-2xl p-3.5 space-y-2.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-neutral-500 dark:text-neutral-400 font-medium">Limite Homologado J. Toledo:</span>
                      <span className="font-bold text-neutral-900 dark:text-white font-tabular">
                        R$ {(dealer.creditLimit || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </span>
                    </div>

                    {/* Progress Bar */}
                    <div className="space-y-1">
                      <div className="w-full bg-neutral-200 dark:bg-neutral-900 rounded-full h-2 overflow-hidden border border-neutral-300 dark:border-neutral-800">
                        <div
                          className={`h-full rounded-full transition-all ${
                            creditPercent > 85 ? 'bg-rose-500' : creditPercent > 65 ? 'bg-amber-500' : 'bg-blue-500'
                          }`}
                          style={{ width: `${creditPercent}%` }}
                        />
                      </div>
                      <div className="flex justify-between text-[10px] text-neutral-500 dark:text-neutral-400 font-tabular font-semibold">
                        <span>Utilizado: R$ {((dealer.creditUsed || 0) / 1000).toFixed(0)}k ({creditPercent}%)</span>
                        <span className="text-emerald-600 dark:text-emerald-400">Saldo: R$ {(availableCredit / 1000).toFixed(0)}k</span>
                      </div>
                    </div>

                    <div className="pt-1.5 flex items-center justify-between text-[11px] border-t border-neutral-200 dark:border-neutral-800/80">
                      <div className="flex items-center gap-1 text-neutral-500 dark:text-neutral-400">
                        <span>Rating:</span>
                        <span className="font-extrabold text-blue-600 dark:text-blue-400 font-mono">{dealer.creditRating || 'AAA'}</span>
                      </div>
                      <span className="text-neutral-500 dark:text-neutral-400">
                        Adimplência: <strong className="text-emerald-600 dark:text-emerald-400">{dealer.onTimePaymentRate || 98.0}%</strong>
                      </span>
                    </div>
                  </div>
                </div>

                {/* Card Action Buttons */}
                <div className="mt-5 pt-4 border-t border-neutral-200 dark:border-[#27272a] grid grid-cols-2 gap-2">
                  <button
                    onClick={() => handleOpenEditModal(dealer, 'cadastral')}
                    className="w-full bg-neutral-900 hover:bg-neutral-800 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-white font-bold py-2.5 px-3 rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all shadow-sm active:scale-95 cursor-pointer"
                  >
                    <SlidersHorizontal className="w-3.5 h-3.5 text-blue-400" />
                    <span>Configurar Ficha</span>
                  </button>

                  <button
                    onClick={() => {
                      onSelectDealership(dealer.id);
                      onNavigate('dashboard');
                    }}
                    className="w-full bg-blue-50 hover:bg-blue-600 text-blue-600 hover:text-white border border-blue-200 dark:bg-blue-600/20 dark:hover:bg-blue-600 dark:text-blue-300 dark:hover:text-white dark:border-blue-600/30 font-bold py-2.5 px-3 rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all active:scale-95 cursor-pointer"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>Visão Loja</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Detailed Table View */
        <div className="bg-white dark:bg-[#18181b] border border-neutral-200 dark:border-[#27272a] rounded-3xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-tabular">
              <thead className="bg-neutral-50 dark:bg-[#121215] border-b border-neutral-200 dark:border-[#27272a] text-neutral-500 dark:text-neutral-400 uppercase text-[10px] tracking-wider font-bold">
                <tr>
                  <th className="py-3.5 px-4">Código / Nome</th>
                  <th className="py-3.5 px-4">CNPJ / Razão Social</th>
                  <th className="py-3.5 px-4">Cidade / Região</th>
                  <th className="py-3.5 px-4">Tier & Status</th>
                  <th className="py-3.5 px-4 text-right">Limite de Crédito</th>
                  <th className="py-3.5 px-4 text-center">Rating</th>
                  <th className="py-3.5 px-4 text-center">Usuários</th>
                  <th className="py-3.5 px-4 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200 dark:divide-[#27272a] text-neutral-800 dark:text-neutral-200">
                {filteredDealerships.map((dealer) => {
                  const creditPercent = Math.min(100, Math.round(((dealer.creditUsed || 0) / Math.max(1, dealer.creditLimit || 1)) * 100));

                  return (
                    <tr key={dealer.id} className="hover:bg-neutral-50 dark:hover:bg-neutral-900/60 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-[11px] font-bold text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-950 px-2 py-0.5 rounded border border-blue-200 dark:border-blue-800">
                            {dealer.dealerCode}
                          </span>
                          <div>
                            <p className="font-bold text-neutral-900 dark:text-white text-[13px]">{dealer.tradeName || dealer.name}</p>
                            <p className="text-[11px] text-neutral-500 dark:text-neutral-400">{dealer.phone}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <p className="font-mono font-semibold text-neutral-900 dark:text-white">{dealer.cnpj}</p>
                        <p className="text-[11px] text-neutral-500 dark:text-neutral-400 truncate max-w-[200px]">{dealer.legalName}</p>
                      </td>
                      <td className="py-3.5 px-4">
                        <p className="text-neutral-900 dark:text-white font-medium">{dealer.city}/{dealer.state}</p>
                        <p className="text-[11px] text-neutral-500 dark:text-neutral-400">Região {dealer.region}</p>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex flex-col gap-1 items-start">
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded uppercase bg-blue-100 dark:bg-blue-500/20 text-blue-800 dark:text-blue-300">
                            Tier {dealer.tier}
                          </span>
                          <span className="text-[9px] font-bold uppercase text-emerald-600 dark:text-emerald-400">
                            {dealer.status}
                          </span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <p className="font-bold text-neutral-900 dark:text-white text-[13px]">
                          R$ {(dealer.creditLimit || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </p>
                        <p className="text-[11px] text-neutral-500 dark:text-neutral-400">
                          Utilizado: <span className="text-amber-600 dark:text-amber-400 font-semibold">R$ {((dealer.creditUsed || 0) / 1000).toFixed(0)}k</span> ({creditPercent}%)
                        </p>
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <span className="font-mono font-bold text-blue-600 dark:text-blue-400 bg-neutral-100 dark:bg-neutral-900 px-2 py-1 rounded border border-neutral-200 dark:border-neutral-800">
                          {dealer.creditRating || 'AAA'}
                        </span>
                        <p className="text-[10px] text-emerald-600 dark:text-emerald-400 mt-0.5 font-bold">{dealer.onTimePaymentRate || 98}%</p>
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <span className="inline-flex items-center gap-1 font-bold text-neutral-700 dark:text-neutral-300">
                          <Users className="w-3.5 h-3.5 text-blue-500" />
                          {dealer.users?.length || 0}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleOpenEditModal(dealer, 'cadastral')}
                            className="p-2 bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-neutral-700 dark:text-white rounded-lg transition-colors"
                            title="Editar Ficha e Configurações"
                          >
                            <SlidersHorizontal className="w-4 h-4 text-blue-500" />
                          </button>
                          <button
                            onClick={() => {
                              onSelectDealership(dealer.id);
                              onNavigate('dashboard');
                            }}
                            className="p-2 bg-blue-50 hover:bg-blue-600 text-blue-600 hover:text-white dark:bg-blue-600/20 dark:hover:bg-blue-600 dark:text-blue-300 dark:hover:text-white rounded-lg transition-colors"
                            title="Acessar Cockpit da Loja"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* COMPREHENSIVE DEALERSHIP MANAGEMENT & EDIT MODAL (5 TABS)                */}
      {/* ========================================================================= */}
      {selectedDealership && editForm && (
        <div className="fixed inset-0 bg-black/75 z-50 flex items-center justify-center p-4 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white dark:bg-[#18181b] rounded-3xl max-w-5xl w-full p-6 md:p-8 shadow-2xl border border-neutral-200 dark:border-[#27272a] animate-in fade-in zoom-in-95 my-6 max-h-[92vh] flex flex-col text-neutral-900 dark:text-white">
            
            {/* Modal Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between pb-5 border-b border-neutral-200 dark:border-[#27272a] gap-4">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/80 border border-blue-200 dark:border-blue-600/40 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold text-lg shadow-inner shrink-0">
                  <Building2 className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-blue-100 dark:bg-blue-900/60 border border-blue-300 dark:border-blue-700 text-blue-800 dark:text-blue-300">
                      {editForm.dealerCode}
                    </span>
                    <h2 className="text-xl font-bold text-neutral-900 dark:text-white">{editForm.tradeName || editForm.name}</h2>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded uppercase bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-800">
                      {editForm.status}
                    </span>
                  </div>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
                    {editForm.legalName} • CNPJ: <span className="font-mono font-bold text-neutral-800 dark:text-neutral-200">{editForm.cnpj}</span>
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    onSelectDealership(editForm.id);
                    onNavigate('dashboard');
                  }}
                  className="bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-neutral-800 dark:text-neutral-200 font-bold px-3.5 py-2 rounded-xl text-xs flex items-center gap-1.5 transition-colors border border-neutral-300 dark:border-neutral-700 cursor-pointer"
                >
                  <ExternalLink className="w-3.5 h-3.5 text-blue-500 dark:text-blue-400" />
                  <span>Acessar Visão Loja</span>
                </button>

                <button
                  onClick={() => setSelectedDealership(null)}
                  className="text-neutral-400 hover:text-neutral-900 dark:hover:text-white p-2 rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Notification Banner */}
            {saveNotification && (
              <div className="mt-4 p-3 bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-200 dark:border-emerald-600/50 rounded-2xl text-emerald-800 dark:text-emerald-300 text-xs flex items-center gap-2 animate-in fade-in">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span>{saveNotification}</span>
              </div>
            )}

            {/* Tab Navigation */}
            <div className="flex items-center gap-2 pt-4 pb-3 border-b border-neutral-200 dark:border-[#27272a] overflow-x-auto no-scrollbar">
              <button
                onClick={() => setActiveTab('cadastral')}
                className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 whitespace-nowrap transition-all cursor-pointer ${
                  activeTab === 'cadastral'
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                    : 'bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-900 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-300 border border-neutral-200 dark:border-neutral-800'
                }`}
              >
                <Briefcase className="w-3.5 h-3.5" />
                <span>1. Dados Cadastrais & Empresa</span>
              </button>

              <button
                onClick={() => setActiveTab('address')}
                className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 whitespace-nowrap transition-all cursor-pointer ${
                  activeTab === 'address'
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                    : 'bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-900 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-300 border border-neutral-200 dark:border-neutral-800'
                }`}
              >
                <MapPin className="w-3.5 h-3.5" />
                <span>2. Endereço & Logística</span>
              </button>

              <button
                onClick={() => setActiveTab('users')}
                className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 whitespace-nowrap transition-all cursor-pointer ${
                  activeTab === 'users'
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                    : 'bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-900 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-300 border border-neutral-200 dark:border-neutral-800'
                }`}
              >
                <Users className="w-3.5 h-3.5" />
                <span>3. Usuários & Acessos ({editForm.users?.length || 0})</span>
              </button>

              <button
                onClick={() => setActiveTab('financial')}
                className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 whitespace-nowrap transition-all cursor-pointer ${
                  activeTab === 'financial'
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                    : 'bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-900 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-300 border border-neutral-200 dark:border-neutral-800'
                }`}
              >
                <DollarSign className="w-3.5 h-3.5" />
                <span>4. Financeiro & Crédito</span>
              </button>

              <button
                onClick={() => setActiveTab('operations')}
                className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 whitespace-nowrap transition-all cursor-pointer ${
                  activeTab === 'operations'
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                    : 'bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-900 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-300 border border-neutral-200 dark:border-neutral-800'
                }`}
              >
                <Bike className="w-3.5 h-3.5" />
                <span>5. Metas & Performance</span>
              </button>
            </div>

            {/* Modal Body with Scrollable Tab Content */}
            <div className="flex-1 overflow-y-auto py-5 space-y-6 pr-1">

              {/* ---------------- TAB 1: DADOS CADASTRAIS ---------------- */}
              {activeTab === 'cadastral' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="text-[11px] font-bold uppercase text-neutral-500 dark:text-neutral-400 block mb-1">
                        Código de Rede (SZX) *
                      </label>
                      <input
                        type="text"
                        value={editForm.dealerCode}
                        onChange={(e) => setEditForm({ ...editForm, dealerCode: e.target.value })}
                        className={`${inputClassName} font-mono font-bold`}
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-bold uppercase text-neutral-500 dark:text-neutral-400 block mb-1">
                        CNPJ (Cadastro Nacional) *
                      </label>
                      <input
                        type="text"
                        value={editForm.cnpj}
                        onChange={(e) => setEditForm({ ...editForm, cnpj: e.target.value })}
                        className={`${inputClassName} font-mono font-bold`}
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-bold uppercase text-neutral-500 dark:text-neutral-400 block mb-1">
                        Status Operacional *
                      </label>
                      <select
                        value={editForm.status}
                        onChange={(e) => setEditForm({ ...editForm, status: e.target.value as DealershipStatus })}
                        className={selectClassName}
                      >
                        <option value="ativa">Ativa (Operação Normal)</option>
                        <option value="homologacao">Em Homologação / Auditoria</option>
                        <option value="suspensa">Suspensa Temporariamente</option>
                        <option value="bloqueada">Bloqueada pelo Comitê</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-[11px] font-bold uppercase text-neutral-500 dark:text-neutral-400 block mb-1">
                        Razão Social Completa *
                      </label>
                      <input
                        type="text"
                        value={editForm.legalName}
                        onChange={(e) => setEditForm({ ...editForm, legalName: e.target.value })}
                        className={inputClassName}
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-bold uppercase text-neutral-500 dark:text-neutral-400 block mb-1">
                        Nome Fantasia (Letreiro / Fachada) *
                      </label>
                      <input
                        type="text"
                        value={editForm.tradeName}
                        onChange={(e) => setEditForm({ ...editForm, tradeName: e.target.value, name: e.target.value })}
                        className={`${inputClassName} font-bold`}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <label className="text-[11px] font-bold uppercase text-neutral-500 dark:text-neutral-400 block mb-1">
                        Inscrição Estadual (IE)
                      </label>
                      <input
                        type="text"
                        value={editForm.stateRegistration || ''}
                        onChange={(e) => setEditForm({ ...editForm, stateRegistration: e.target.value })}
                        className={inputClassName}
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-bold uppercase text-neutral-500 dark:text-neutral-400 block mb-1">
                        Inscrição Municipal (IM)
                      </label>
                      <input
                        type="text"
                        value={editForm.municipalRegistration || ''}
                        onChange={(e) => setEditForm({ ...editForm, municipalRegistration: e.target.value })}
                        className={inputClassName}
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-bold uppercase text-neutral-500 dark:text-neutral-400 block mb-1">
                        Regime Tributário
                      </label>
                      <select
                        value={editForm.taxRegime || 'Lucro Real'}
                        onChange={(e) => setEditForm({ ...editForm, taxRegime: e.target.value as TaxRegime })}
                        className={selectClassName}
                      >
                        <option value="Lucro Real">Lucro Real</option>
                        <option value="Lucro Presumido">Lucro Presumido</option>
                        <option value="Simples Nacional">Simples Nacional</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-[11px] font-bold uppercase text-neutral-500 dark:text-neutral-400 block mb-1">
                        Data de Fundação / Início
                      </label>
                      <input
                        type="text"
                        value={editForm.foundedDate || ''}
                        onChange={(e) => setEditForm({ ...editForm, foundedDate: e.target.value })}
                        placeholder="DD/MM/AAAA"
                        className={inputClassName}
                      />
                    </div>
                  </div>

                  {/* Contract & Tier */}
                  <div className="bg-neutral-50 dark:bg-[#121215] border border-neutral-200 dark:border-[#27272a] rounded-2xl p-4.5 space-y-4">
                    <h4 className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider flex items-center gap-1.5">
                      <FileText className="w-4 h-4" />
                      <span>Contrato de Concessão & Classificação da Montadora</span>
                    </h4>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div>
                        <label className="text-[11px] font-bold uppercase text-neutral-500 dark:text-neutral-400 block mb-1">
                          Número do Contrato J. Toledo
                        </label>
                        <input
                          type="text"
                          value={editForm.dealerContractNumber || ''}
                          onChange={(e) => setEditForm({ ...editForm, dealerContractNumber: e.target.value })}
                          className={`${inputClassName} font-mono`}
                        />
                      </div>

                      <div>
                        <label className="text-[11px] font-bold uppercase text-neutral-500 dark:text-neutral-400 block mb-1">
                          Vigência do Contrato
                        </label>
                        <input
                          type="text"
                          value={editForm.contractValidUntil || ''}
                          onChange={(e) => setEditForm({ ...editForm, contractValidUntil: e.target.value })}
                          className={inputClassName}
                        />
                      </div>

                      <div>
                        <label className="text-[11px] font-bold uppercase text-neutral-500 dark:text-neutral-400 block mb-1">
                          Tier de Concessionária
                        </label>
                        <select
                          value={editForm.tier || 'Ouro'}
                          onChange={(e) => setEditForm({ ...editForm, tier: e.target.value as DealerTier })}
                          className={selectClassName}
                        >
                          <option value="Diamante">Tier Diamante (Cota Máxima)</option>
                          <option value="Ouro">Tier Ouro (Cota Alta)</option>
                          <option value="Prata">Tier Prata (Cota Padrão)</option>
                          <option value="Bronze">Tier Bronze (Cota Entrada)</option>
                        </select>
                      </div>
                    </div>

                    {/* Brands Authorized & Regional Selection */}
                    <div>
                      <label className="text-[11px] font-bold uppercase text-neutral-500 dark:text-neutral-400 block mb-2">
                        Marcas Homologadas & Regionais da Montadora
                      </label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {DEFAULT_BRAND_NAMES.map((brand) => {
                          const isAuthorized = editForm.brandsAuthorized?.includes(brand);
                          return (
                            <div key={brand} className="p-3 bg-white dark:bg-[#18181b] border border-neutral-200 dark:border-[#27272a] rounded-xl space-y-2">
                              <label className="flex items-center gap-2 cursor-pointer font-bold text-xs text-neutral-900 dark:text-white">
                                <input
                                  type="checkbox"
                                  checked={isAuthorized}
                                  onChange={(e) => {
                                    const current = editForm.brandsAuthorized || [];
                                    if (e.target.checked) {
                                      setEditForm({ ...editForm, brandsAuthorized: [...current, brand] });
                                    } else {
                                      setEditForm({ ...editForm, brandsAuthorized: current.filter(b => b !== brand) });
                                    }
                                  }}
                                  className="rounded border-neutral-300 dark:border-neutral-700 text-blue-600 focus:ring-0"
                                />
                                <span>{brand} Motos</span>
                              </label>

                              {isAuthorized && (
                                <div>
                                  <label className="text-[9px] uppercase font-bold text-neutral-500 dark:text-neutral-400 block mb-1">
                                    Regional {brand} Vinculada
                                  </label>
                                  <select
                                    value={(editForm as any)[`regional_${brand.toLowerCase()}`] || `Regional ${brand} Padrão`}
                                    onChange={(e) => setEditForm({ ...editForm, [`regional_${brand.toLowerCase()}`]: e.target.value } as any)}
                                    className="w-full bg-neutral-50 dark:bg-[#121215] border border-neutral-300 dark:border-[#27272a] rounded-lg px-2.5 py-1.5 text-[11px] font-semibold text-neutral-900 dark:text-neutral-200 focus:outline-none focus:border-blue-500"
                                  >
                                    <option value={`Regional ${brand} Sul/Sudeste`}>Regional {brand} - Sul/Sudeste</option>
                                    <option value={`Regional ${brand} Norte/Nordeste`}>Regional {brand} - Norte/Nordeste</option>
                                    <option value={`Regional ${brand} Centro-Oeste`}>Regional {brand} - Centro-Oeste</option>
                                  </select>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ---------------- TAB 2: ENDEREÇO & LOGÍSTICA ---------------- */}
              {activeTab === 'address' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="text-[11px] font-bold uppercase text-neutral-500 dark:text-neutral-400 block mb-1">
                        CEP (Código Postal) *
                      </label>
                      <input
                        type="text"
                        value={editForm.zipCode || ''}
                        onChange={(e) => setEditForm({ ...editForm, zipCode: e.target.value })}
                        className={`${inputClassName} font-mono`}
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="text-[11px] font-bold uppercase text-neutral-500 dark:text-neutral-400 block mb-1">
                        Logradouro / Endereço *
                      </label>
                      <input
                        type="text"
                        value={editForm.street || ''}
                        onChange={(e) => setEditForm({ ...editForm, street: e.target.value })}
                        className={inputClassName}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                    <div>
                      <label className="text-[11px] font-bold uppercase text-neutral-500 dark:text-neutral-400 block mb-1">
                        Número *
                      </label>
                      <input
                        type="text"
                        value={editForm.number || ''}
                        onChange={(e) => setEditForm({ ...editForm, number: e.target.value })}
                        className={inputClassName}
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-bold uppercase text-neutral-500 dark:text-neutral-400 block mb-1">
                        Complemento
                      </label>
                      <input
                        type="text"
                        value={editForm.complement || ''}
                        onChange={(e) => setEditForm({ ...editForm, complement: e.target.value })}
                        className={inputClassName}
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-bold uppercase text-neutral-500 dark:text-neutral-400 block mb-1">
                        Bairro *
                      </label>
                      <input
                        type="text"
                        value={editForm.neighborhood || ''}
                        onChange={(e) => setEditForm({ ...editForm, neighborhood: e.target.value })}
                        className={inputClassName}
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-bold uppercase text-neutral-500 dark:text-neutral-400 block mb-1">
                        Cidade / UF *
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={editForm.city}
                          onChange={(e) => setEditForm({ ...editForm, city: e.target.value })}
                          className={`flex-1 ${inputClassName}`}
                        />
                        <input
                          type="text"
                          value={editForm.state}
                          onChange={(e) => setEditForm({ ...editForm, state: e.target.value })}
                          className={`w-14 text-center font-bold uppercase ${inputClassName}`}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Logistics Facilities */}
                  <div className="bg-neutral-50 dark:bg-[#121215] border border-neutral-200 dark:border-[#27272a] rounded-2xl p-4.5 space-y-4">
                    <h4 className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider flex items-center gap-1.5">
                      <Truck className="w-4 h-4" />
                      <span>Estrutura Física & Logística de Descarga de Cegonhas</span>
                    </h4>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div>
                        <label className="text-[11px] font-bold uppercase text-neutral-500 dark:text-neutral-400 block mb-1">
                          Área de Showroom (m²)
                        </label>
                        <input
                          type="number"
                          value={editForm.showroomAreaM2 || 0}
                          onChange={(e) => setEditForm({ ...editForm, showroomAreaM2: Number(e.target.value) })}
                          className={inputClassName}
                        />
                      </div>

                      <div>
                        <label className="text-[11px] font-bold uppercase text-neutral-500 dark:text-neutral-400 block mb-1">
                          Área de Oficina / Pós-Venda (m²)
                        </label>
                        <input
                          type="number"
                          value={editForm.workshopAreaM2 || 0}
                          onChange={(e) => setEditForm({ ...editForm, workshopAreaM2: Number(e.target.value) })}
                          className={inputClassName}
                        />
                      </div>

                      <div>
                        <label className="text-[11px] font-bold uppercase text-neutral-500 dark:text-neutral-400 block mb-1">
                          Pátio de Descarga de Carretas
                        </label>
                        <select
                          value={editForm.unloadingBayAvailable ? 'sim' : 'nao'}
                          onChange={(e) => setEditForm({ ...editForm, unloadingBayAvailable: e.target.value === 'sim' })}
                          className={selectClassName}
                        >
                          <option value="sim">Sim (Possui Pátio Próprio)</option>
                          <option value="nao">Não (Descarga em Via Pública)</option>
                        </select>
                      </div>
                    </div>

                    <div className="p-4 bg-amber-50 dark:bg-[#18181b] border border-amber-300 dark:border-amber-500/30 rounded-2xl space-y-3">
                      <h5 className="text-xs font-bold text-amber-700 dark:text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                        <Truck className="w-4 h-4" />
                        <span>Origem Logística & Tabela de Fretes de Compra de Motos (Regra ERP)</span>
                      </h5>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="text-[11px] font-bold uppercase text-neutral-600 dark:text-neutral-400 block mb-1">
                            Armazém / Local de Estoque Faturamento
                          </label>
                          <select
                            value={(editForm as any).originWarehouse || (['Sul', 'Sudeste'].includes(editForm.region) && editForm.state !== 'ES' ? 'empresa_13_armazem' : 'manaus_le_16')}
                            onChange={(e) => setEditForm({ ...editForm, originWarehouse: e.target.value as any })}
                            className={selectClassName}
                          >
                            <option value="empresa_13_armazem">Empresa 13 - Armazém SP (Sul e Sudeste exceto ES)</option>
                            <option value="manaus_le_16">Manaus Local de Estoque 16 - Empresa 01/10 (Norte, Nordeste, Centro-Oeste e ES)</option>
                          </select>
                        </div>
                        <div>
                          <label className="text-[11px] font-bold uppercase text-neutral-600 dark:text-neutral-400 block mb-1">
                            Regra de Roteamento de Frete Ativa
                          </label>
                          <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-xl p-2.5 text-xs text-neutral-700 dark:text-neutral-300">
                            UF <strong className="text-neutral-900 dark:text-white">{editForm.state}</strong> ({editForm.region}): Roteamento via{' '}
                            <span className="text-amber-700 dark:text-amber-400 font-bold">
                              {['Sul', 'Sudeste'].includes(editForm.region) && editForm.state !== 'ES' ? 'Empresa 13 (SP)' : 'Manaus LE 16 (Emp. 01/10)'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="text-[11px] font-bold uppercase text-neutral-500 dark:text-neutral-400 block mb-1">
                        Restrições de Tráfego / Instruções para Transportadoras
                      </label>
                      <textarea
                        rows={2}
                        value={editForm.unloadingRestrictions || ''}
                        onChange={(e) => setEditForm({ ...editForm, unloadingRestrictions: e.target.value })}
                        className={inputClassName}
                        placeholder="Ex: Horários permitidos para caminhões de grande porte, portão de acesso..."
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* ---------------- TAB 3: USUÁRIOS, SENHAS & ACESSOS ---------------- */}
              {activeTab === 'users' && (
                <div className="space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <h3 className="text-sm font-bold text-neutral-900 dark:text-white">Usuários com Acesso ao Portal J. Toledo</h3>
                      <p className="text-xs text-neutral-500 dark:text-neutral-400">
                        Gerenciamento de credenciais, cargos, perfis e redefinição de senhas para a concessionária {editForm.tradeName}.
                      </p>
                    </div>
                    <button
                      onClick={() => setNewUserModalOpen(true)}
                      className="bg-blue-600 hover:bg-blue-500 text-white font-bold px-3.5 py-2 rounded-xl text-xs flex items-center gap-1.5 transition-all shadow cursor-pointer shrink-0"
                    >
                      <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                      <span>Cadastrar Usuário</span>
                    </button>
                  </div>

                  {/* Users List Table */}
                  <div className="border border-neutral-200 dark:border-[#27272a] rounded-2xl overflow-hidden shadow-inner">
                    <table className="w-full text-left text-xs font-tabular">
                      <thead className="bg-neutral-50 dark:bg-[#121215] border-b border-neutral-200 dark:border-[#27272a] text-neutral-500 dark:text-neutral-400 uppercase text-[10px] tracking-wider font-bold">
                        <tr>
                          <th className="py-3 px-4">Nome & Contato</th>
                          <th className="py-3 px-4">Cargo / Função</th>
                          <th className="py-3 px-4">Perfil de Acesso</th>
                          <th className="py-3 px-4">Último Acesso</th>
                          <th className="py-3 px-4 text-center">Status</th>
                          <th className="py-3 px-4 text-right">Gestão de Senha & Acesso</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-neutral-200 dark:divide-[#27272a] text-neutral-800 dark:text-neutral-200">
                        {editForm.users && editForm.users.length > 0 ? (
                          editForm.users.map((user) => (
                            <tr key={user.id} className="hover:bg-neutral-50 dark:hover:bg-neutral-900/60 transition-colors">
                              <td className="py-3.5 px-4">
                                <p className="font-bold text-neutral-900 dark:text-white">{user.name}</p>
                                <p className="text-[11px] text-neutral-500 dark:text-neutral-400 font-mono">{user.email}</p>
                                {user.phone && <p className="text-[10px] text-neutral-400 dark:text-neutral-500">{user.phone}</p>}
                              </td>
                              <td className="py-3.5 px-4">
                                <span className="font-semibold text-neutral-700 dark:text-neutral-200">{user.role}</span>
                              </td>
                              <td className="py-3.5 px-4">
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-neutral-100 dark:bg-neutral-800 text-blue-700 dark:text-blue-400 border border-neutral-200 dark:border-neutral-700">
                                  {user.accessLevel === 'admin_dealer'
                                    ? 'Administrador Master'
                                    : user.accessLevel === 'vendas'
                                    ? 'Vendas & Pedidos'
                                    : user.accessLevel === 'pos_vendas'
                                    ? 'Garantia & Pós-Venda'
                                    : 'Financeiro'}
                                </span>
                              </td>
                              <td className="py-3.5 px-4 text-neutral-500 dark:text-neutral-400 text-[11px]">
                                {user.lastLogin || 'Nunca'}
                              </td>
                              <td className="py-3.5 px-4 text-center">
                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                                  user.status === 'ativo'
                                    ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-800'
                                    : 'bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-400 border border-rose-300 dark:border-rose-800'
                                }`}>
                                  {user.status}
                                </span>
                              </td>
                              <td className="py-3.5 px-4 text-right">
                                <div className="flex items-center justify-end gap-2">
                                  {/* Reset Password Button */}
                                  <button
                                    onClick={() => {
                                      setPasswordModalUser({ dealer: editForm, user });
                                      setNewPasswordValue('');
                                      setShowPasswordText(false);
                                    }}
                                    className="bg-amber-50 hover:bg-amber-100 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-amber-800 dark:text-amber-300 font-bold px-2.5 py-1.5 rounded-lg text-xs flex items-center gap-1 border border-amber-200 dark:border-amber-500/30 transition-colors cursor-pointer"
                                    title="Alterar ou Redefinir Senha do Usuário"
                                  >
                                    <KeyRound className="w-3.5 h-3.5" />
                                    <span>Alterar Senha</span>
                                  </button>

                                  {/* Toggle Active/Block */}
                                  <button
                                    onClick={() => handleToggleUserStatus(user.id)}
                                    className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                                      user.status === 'ativo'
                                        ? 'bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 border-neutral-300 dark:border-neutral-700 text-neutral-600 dark:text-neutral-400 hover:text-rose-600 dark:hover:text-rose-400'
                                        : 'bg-emerald-100 dark:bg-emerald-950 border-emerald-300 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400'
                                    }`}
                                    title={user.status === 'ativo' ? 'Bloquear Acesso' : 'Desbloquear Acesso'}
                                  >
                                    {user.status === 'ativo' ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
                                  </button>

                                  {/* Delete User */}
                                  <button
                                    onClick={() => handleDeleteUser(user.id)}
                                    className="p-1.5 bg-neutral-100 hover:bg-rose-100 dark:bg-neutral-800 dark:hover:bg-rose-950 border border-neutral-300 dark:border-neutral-700 hover:border-rose-300 dark:hover:border-rose-700 text-neutral-600 dark:text-neutral-400 hover:text-rose-700 dark:hover:text-rose-300 rounded-lg transition-colors cursor-pointer"
                                    title="Excluir Usuário"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={6} className="text-center py-6 text-neutral-500 text-xs">
                              Nenhum usuário cadastrado para esta concessionária.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* ---------------- TAB 4: FINANCEIRO & CRÉDITO ---------------- */}
              {activeTab === 'financial' && (
                <div className="space-y-6">
                  {/* Credit Line Bento Box */}
                  <div className="bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-blue-950/40 dark:via-neutral-900 dark:to-indigo-950/40 border border-blue-200 dark:border-blue-900/50 rounded-3xl p-6 shadow-md space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div>
                        <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-widest block mb-1">
                          Comitê de Crédito J. Toledo • Linha Rotativa
                        </span>
                        <h3 className="text-xl font-bold text-neutral-900 dark:text-white">Disponibilidade de Crédito & Financiamento</h3>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-neutral-500 dark:text-neutral-400">Classificação de Risco:</span>
                        <select
                          value={editForm.creditRating || 'AAA'}
                          onChange={(e) => setEditForm({ ...editForm, creditRating: e.target.value as CreditRating })}
                          className="bg-white dark:bg-neutral-900 border border-blue-300 dark:border-blue-500/50 text-blue-700 dark:text-blue-300 font-mono font-bold text-xs px-3 py-1.5 rounded-xl focus:outline-none"
                        >
                          <option value="AAA">Rating AAA (Excelente / Risco Zero)</option>
                          <option value="AA">Rating AA (Ótimo)</option>
                          <option value="A">Rating A (Bom)</option>
                          <option value="BBB">Rating BBB (Moderado)</option>
                          <option value="BB">Rating BB (Atenção)</option>
                          <option value="Restritivo">Restritivo (Somente À Vista)</option>
                        </select>
                      </div>
                    </div>

                    {/* Credit Inputs */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                      <div className="bg-white dark:bg-[#121215] p-4 rounded-2xl border border-neutral-200 dark:border-[#27272a]">
                        <label className="text-[11px] font-bold uppercase text-neutral-500 dark:text-neutral-400 block mb-1">
                          Limite de Crédito Total (R$) *
                        </label>
                        <input
                          type="number"
                          step={50000}
                          value={editForm.creditLimit || 0}
                          onChange={(e) => setEditForm({ ...editForm, creditLimit: Number(e.target.value) })}
                          className="w-full bg-neutral-50 dark:bg-neutral-900 border border-neutral-300 dark:border-[#27272a] rounded-xl px-3 py-2 text-lg font-bold text-neutral-900 dark:text-white font-tabular focus:outline-none focus:border-blue-500"
                        />
                        <span className="text-[10px] text-neutral-500 mt-1 block">Aprovado pelo Comitê Financeiro</span>
                      </div>

                      <div className="bg-white dark:bg-[#121215] p-4 rounded-2xl border border-neutral-200 dark:border-[#27272a]">
                        <label className="text-[11px] font-bold uppercase text-neutral-500 dark:text-neutral-400 block mb-1">
                          Crédito em Utilização (R$)
                        </label>
                        <input
                          type="number"
                          step={10000}
                          value={editForm.creditUsed || 0}
                          onChange={(e) => setEditForm({ ...editForm, creditUsed: Number(e.target.value) })}
                          className="w-full bg-neutral-50 dark:bg-neutral-900 border border-neutral-300 dark:border-[#27272a] rounded-xl px-3 py-2 text-lg font-bold text-amber-600 dark:text-amber-400 font-tabular focus:outline-none focus:border-blue-500"
                        />
                        <span className="text-[10px] text-neutral-500 mt-1 block">Pedidos em Trânsito / Faturados</span>
                      </div>

                      <div className="bg-white dark:bg-[#121215] p-4 rounded-2xl border border-neutral-200 dark:border-[#27272a]">
                        <label className="text-[11px] font-bold uppercase text-neutral-500 dark:text-neutral-400 block mb-1">
                          Saldo Disponível Líquido
                        </label>
                        <p className="text-lg font-bold text-emerald-600 dark:text-emerald-400 font-tabular py-2">
                          R$ {((editForm.creditLimit || 0) - (editForm.creditUsed || 0)).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </p>
                        <span className="text-[10px] text-neutral-500 block">Livre para novos pedidos</span>
                      </div>
                    </div>

                    {/* Floor Plan and Payment conditions */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                      <div>
                        <label className="text-[11px] font-bold uppercase text-neutral-500 dark:text-neutral-400 block mb-1">
                          Linha Floor Plan Estoque (R$)
                        </label>
                        <input
                          type="number"
                          step={50000}
                          value={editForm.floorPlanLimit || 0}
                          onChange={(e) => setEditForm({ ...editForm, floorPlanLimit: Number(e.target.value) })}
                          className={`${inputClassName} font-tabular`}
                        />
                      </div>

                      <div>
                        <label className="text-[11px] font-bold uppercase text-neutral-500 dark:text-neutral-400 block mb-1">
                          Condição Comercial Padrão
                        </label>
                        <select
                          value={editForm.defaultPaymentCondition || '30/60/90 DDL'}
                          onChange={(e) => setEditForm({ ...editForm, defaultPaymentCondition: e.target.value })}
                          className={selectClassName}
                        >
                          <option value="30/60/90 DDL">30 / 60 / 90 DDL (Sem Juros)</option>
                          <option value="28/56 DDL">28 / 56 DDL</option>
                          <option value="45 DDL">45 DDL Direto</option>
                          <option value="À Vista com 3% Desc">À Vista com 3.0% Desconto</option>
                          <option value="Consignação Floor Plan">Consignação Floor Plan Bancário</option>
                        </select>
                      </div>

                      <div>
                        <label className="text-[11px] font-bold uppercase text-neutral-500 dark:text-neutral-400 block mb-1">
                          Taxa de Bonificação / Rebate (%)
                        </label>
                        <input
                          type="number"
                          step={0.1}
                          value={editForm.rebateBonusPercentage || 2.0}
                          onChange={(e) => setEditForm({ ...editForm, rebateBonusPercentage: Number(e.target.value) })}
                          className={`${inputClassName} font-tabular`}
                        />
                      </div>
                    </div>

                    {/* Authorized Payment Conditions Selection */}
                    <div className="pt-3 border-t border-blue-200 dark:border-blue-900/40 space-y-2">
                      <label className="text-[11px] font-bold uppercase text-blue-600 dark:text-blue-400 block">
                        Condições de Pagamento Autorizadas para esta Concessionária (Pedido de Fábrica)
                      </label>
                      <p className="text-[10px] text-neutral-500 dark:text-neutral-400">
                        Marque quais opções de pagamento a concessionária terá disponível para escolha ao montar pedidos de motos.
                      </p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 pt-1">
                        {paymentConditions.map(payCond => {
                          const currentAuth = editForm.authorizedPaymentConditionIds || paymentConditions.map(p => p.id);
                          const isChecked = currentAuth.includes(payCond.id);
                          return (
                            <label key={payCond.id} className="flex items-center gap-2 p-2 bg-white dark:bg-[#121215] border border-neutral-200 dark:border-[#27272a] rounded-xl cursor-pointer text-xs font-semibold text-neutral-800 dark:text-neutral-200 hover:border-blue-500/50">
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setEditForm({ ...editForm, authorizedPaymentConditionIds: [...currentAuth, payCond.id] });
                                  } else {
                                    setEditForm({ ...editForm, authorizedPaymentConditionIds: currentAuth.filter(id => id !== payCond.id) });
                                  }
                                }}
                                className="rounded border-neutral-300 dark:border-neutral-700 text-blue-600 focus:ring-0"
                              />
                              <span className="truncate">{payCond.paymentMethodName} ({payCond.brand})</span>
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Bank Account Data */}
                  <div className="bg-neutral-50 dark:bg-[#121215] border border-neutral-200 dark:border-[#27272a] rounded-2xl p-4.5 space-y-4">
                    <h4 className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider flex items-center gap-1.5">
                      <Landmark className="w-4 h-4" />
                      <span>Dados Bancários PJ da Concessionária (Para Repasses & Bonificações)</span>
                    </h4>

                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                      <div className="sm:col-span-2">
                        <label className="text-[11px] font-bold uppercase text-neutral-500 dark:text-neutral-400 block mb-1">
                          Instituição Bancária
                        </label>
                        <input
                          type="text"
                          value={editForm.bankAccount?.bankName || ''}
                          onChange={(e) => setEditForm({
                            ...editForm,
                            bankAccount: { ...editForm.bankAccount!, bankName: e.target.value }
                          })}
                          className={inputClassName}
                        />
                      </div>

                      <div>
                        <label className="text-[11px] font-bold uppercase text-neutral-500 dark:text-neutral-400 block mb-1">
                          Agência (sem dígito)
                        </label>
                        <input
                          type="text"
                          value={editForm.bankAccount?.agency || ''}
                          onChange={(e) => setEditForm({
                            ...editForm,
                            bankAccount: { ...editForm.bankAccount!, agency: e.target.value }
                          })}
                          className={`${inputClassName} font-mono`}
                        />
                      </div>

                      <div>
                        <label className="text-[11px] font-bold uppercase text-neutral-500 dark:text-neutral-400 block mb-1">
                          Conta Corrente PJ
                        </label>
                        <input
                          type="text"
                          value={editForm.bankAccount?.accountNumber || ''}
                          onChange={(e) => setEditForm({
                            ...editForm,
                            bankAccount: { ...editForm.bankAccount!, accountNumber: e.target.value }
                          })}
                          className={`${inputClassName} font-mono`}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="text-[11px] font-bold uppercase text-neutral-500 dark:text-neutral-400 block mb-1">
                          Chave PIX Cadastrada
                        </label>
                        <input
                          type="text"
                          value={editForm.bankAccount?.pixKey || ''}
                          onChange={(e) => setEditForm({
                            ...editForm,
                            bankAccount: { ...editForm.bankAccount!, pixKey: e.target.value }
                          })}
                          className={`${inputClassName} font-mono`}
                        />
                      </div>

                      <div>
                        <label className="text-[11px] font-bold uppercase text-neutral-500 dark:text-neutral-400 block mb-1">
                          E-mail do Departamento Financeiro
                        </label>
                        <input
                          type="email"
                          value={editForm.financialContactEmail || ''}
                          onChange={(e) => setEditForm({ ...editForm, financialContactEmail: e.target.value })}
                          className={`${inputClassName} font-mono`}
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-[11px] font-bold uppercase text-neutral-500 dark:text-neutral-400 block mb-1">
                        Anotações & Parecer do Comitê de Crédito J. Toledo
                      </label>
                      <textarea
                        rows={2}
                        value={editForm.creditNotes || ''}
                        onChange={(e) => setEditForm({ ...editForm, creditNotes: e.target.value })}
                        className={inputClassName}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* ---------------- TAB 5: METAS & OPERAÇÃO ---------------- */}
              {activeTab === 'operations' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="bg-neutral-50 dark:bg-[#121215] p-4 rounded-2xl border border-neutral-200 dark:border-[#27272a]">
                      <label className="text-[11px] font-bold uppercase text-neutral-500 dark:text-neutral-400 block mb-1">
                        Meta Mensal Faturamento (R$)
                      </label>
                      <input
                        type="number"
                        step={50000}
                        value={editForm.monthlyTarget || 0}
                        onChange={(e) => setEditForm({ ...editForm, monthlyTarget: Number(e.target.value) })}
                        className={`${inputClassName} text-sm font-tabular`}
                      />
                    </div>

                    <div className="bg-neutral-50 dark:bg-[#121215] p-4 rounded-2xl border border-neutral-200 dark:border-[#27272a]">
                      <label className="text-[11px] font-bold uppercase text-neutral-500 dark:text-neutral-400 block mb-1">
                        Cota Mensal Alocada (Unidades)
                      </label>
                      <input
                        type="number"
                        value={editForm.quotaAllocated || 0}
                        onChange={(e) => setEditForm({ ...editForm, quotaAllocated: Number(e.target.value) })}
                        className={`${inputClassName} text-sm font-tabular`}
                      />
                    </div>

                    <div className="bg-neutral-50 dark:bg-[#121215] p-4 rounded-2xl border border-neutral-200 dark:border-[#27272a]">
                      <label className="text-[11px] font-bold uppercase text-neutral-500 dark:text-neutral-400 block mb-1">
                        Cota Encomendada Atual
                      </label>
                      <input
                        type="number"
                        value={editForm.quotaOrdered || 0}
                        onChange={(e) => setEditForm({ ...editForm, quotaOrdered: Number(e.target.value) })}
                        className={`${inputClassName} text-sm font-tabular`}
                      />
                    </div>
                  </div>
                </div>
              )}

            </div>

            {/* Modal Footer / Action Bar */}
            <div className="pt-4 border-t border-neutral-200 dark:border-[#27272a] flex items-center justify-between">
              <button
                onClick={() => setSelectedDealership(null)}
                className="px-5 py-2.5 rounded-xl border border-neutral-300 dark:border-[#27272a] font-bold text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-xs transition-colors cursor-pointer"
              >
                Fechar sem Salvar
              </button>

              <button
                onClick={handleSaveDealershipChanges}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold px-6 py-2.5 rounded-xl text-xs flex items-center gap-2 transition-all shadow-lg shadow-blue-500/25 active:scale-95 cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>Salvar Configurações da Concessionária</span>
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: CADASTRAR NOVA CONCESSIONÁRIA NA REDE J. TOLEDO                    */}
      {/* ========================================================================= */}
      {newDealerModalOpen && (
        <div className="fixed inset-0 bg-black/75 z-50 flex items-center justify-center p-4 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white dark:bg-[#18181b] rounded-3xl max-w-4xl w-full p-6 md:p-8 shadow-2xl border border-neutral-200 dark:border-[#27272a] animate-in fade-in zoom-in-95 my-6 max-h-[92vh] flex flex-col text-neutral-900 dark:text-white">
            
            <div className="flex justify-between items-start pb-4 border-b border-neutral-200 dark:border-[#27272a]">
              <div>
                <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-widest block mb-0.5">
                  Expansão de Rede • J. Toledo Brasil
                </span>
                <h3 className="text-xl font-bold text-neutral-900 dark:text-white">Cadastrar Nova Concessionária Autorizada</h3>
              </div>
              <button
                onClick={() => setNewDealerModalOpen(false)}
                className="text-neutral-400 hover:text-neutral-900 dark:hover:text-white p-1 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto py-5 space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="text-[11px] font-bold uppercase text-neutral-500 dark:text-neutral-400 block mb-1">
                    Código de Rede (SZX) *
                  </label>
                  <input
                    type="text"
                    value={newDealerForm.dealerCode}
                    onChange={(e) => setNewDealerForm({ ...newDealerForm, dealerCode: e.target.value })}
                    className={`${inputClassName} font-mono font-bold`}
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold uppercase text-neutral-500 dark:text-neutral-400 block mb-1">
                    CNPJ Completo *
                  </label>
                  <input
                    type="text"
                    placeholder="00.000.000/0000-00"
                    value={newDealerForm.cnpj}
                    onChange={(e) => setNewDealerForm({ ...newDealerForm, cnpj: e.target.value })}
                    className={`${inputClassName} font-mono font-bold`}
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold uppercase text-neutral-500 dark:text-neutral-400 block mb-1">
                    Tier Inicial
                  </label>
                  <select
                    value={newDealerForm.tier}
                    onChange={(e) => setNewDealerForm({ ...newDealerForm, tier: e.target.value as DealerTier })}
                    className={selectClassName}
                  >
                    <option value="Diamante">Diamante</option>
                    <option value="Ouro">Ouro</option>
                    <option value="Prata">Prata</option>
                    <option value="Bronze">Bronze</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-[11px] font-bold uppercase text-neutral-500 dark:text-neutral-400 block mb-1">
                    Nome Fantasia (Letreiro) *
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: Santos Prime Motos Suzuki"
                    value={newDealerForm.tradeName}
                    onChange={(e) => setNewDealerForm({
                      ...newDealerForm,
                      tradeName: e.target.value,
                      name: e.target.value,
                      shortName: e.target.value
                    })}
                    className={`${inputClassName} font-bold`}
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold uppercase text-neutral-500 dark:text-neutral-400 block mb-1">
                    Razão Social Completa *
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: Santos Comércio de Motocicletas Ltda."
                    value={newDealerForm.legalName}
                    onChange={(e) => setNewDealerForm({ ...newDealerForm, legalName: e.target.value })}
                    className={inputClassName}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="text-[11px] font-bold uppercase text-neutral-500 dark:text-neutral-400 block mb-1">
                    Cidade *
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: Santos"
                    value={newDealerForm.city}
                    onChange={(e) => setNewDealerForm({ ...newDealerForm, city: e.target.value })}
                    className={inputClassName}
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold uppercase text-neutral-500 dark:text-neutral-400 block mb-1">
                    Estado (UF) *
                  </label>
                  <input
                    type="text"
                    placeholder="SP"
                    value={newDealerForm.state}
                    onChange={(e) => setNewDealerForm({ ...newDealerForm, state: e.target.value })}
                    className={`${inputClassName} uppercase text-center font-bold`}
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold uppercase text-neutral-500 dark:text-neutral-400 block mb-1">
                    Região
                  </label>
                  <select
                    value={newDealerForm.region}
                    onChange={(e) => setNewDealerForm({ ...newDealerForm, region: e.target.value as BrazilRegion })}
                    className={selectClassName}
                  >
                    <option value="Sul">Sul</option>
                    <option value="Sudeste">Sudeste</option>
                    <option value="Centro-Oeste">Centro-Oeste</option>
                    <option value="Nordeste">Nordeste</option>
                    <option value="Norte">Norte</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="text-[11px] font-bold uppercase text-neutral-500 dark:text-neutral-400 block mb-1">
                    Titular / Diretor Responsável *
                  </label>
                  <input
                    type="text"
                    placeholder="Nome completo do titular"
                    value={newDealerForm.manager}
                    onChange={(e) => setNewDealerForm({ ...newDealerForm, manager: e.target.value })}
                    className={inputClassName}
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold uppercase text-neutral-500 dark:text-neutral-400 block mb-1">
                    E-mail Institucional *
                  </label>
                  <input
                    type="email"
                    placeholder="contato@santosprime.com.br"
                    value={newDealerForm.contactEmail}
                    onChange={(e) => setNewDealerForm({ ...newDealerForm, contactEmail: e.target.value })}
                    className={`${inputClassName} font-mono`}
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold uppercase text-neutral-500 dark:text-neutral-400 block mb-1">
                    Telefone de Contato *
                  </label>
                  <input
                    type="text"
                    placeholder="(13) 3220-0000"
                    value={newDealerForm.phone}
                    onChange={(e) => setNewDealerForm({ ...newDealerForm, phone: e.target.value })}
                    className={inputClassName}
                  />
                </div>
              </div>

              <div className="bg-neutral-50 dark:bg-[#121215] p-4 rounded-2xl border border-neutral-200 dark:border-[#27272a] grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-[11px] font-bold uppercase text-neutral-500 dark:text-neutral-400 block mb-1">
                    Limite de Crédito Inicial Homologado (R$)
                  </label>
                  <input
                    type="number"
                    step={100000}
                    value={newDealerForm.creditLimit}
                    onChange={(e) => setNewDealerForm({ ...newDealerForm, creditLimit: Number(e.target.value) })}
                    className={`${inputClassName} text-sm font-tabular font-bold`}
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold uppercase text-neutral-500 dark:text-neutral-400 block mb-1">
                    Condição de Pagamento Padrão
                  </label>
                  <select
                    value={newDealerForm.defaultPaymentCondition}
                    onChange={(e) => setNewDealerForm({ ...newDealerForm, defaultPaymentCondition: e.target.value })}
                    className={selectClassName}
                  >
                    <option value="30/60/90 DDL">30/60/90 DDL</option>
                    <option value="28/56 DDL">28/56 DDL</option>
                    <option value="À Vista com 3% Desc">À Vista com 3.0% Desconto</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-neutral-200 dark:border-[#27272a] flex items-center justify-between">
              <button
                onClick={() => setNewDealerModalOpen(false)}
                className="px-5 py-2.5 rounded-xl border border-neutral-300 dark:border-[#27272a] font-bold text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-xs transition-colors cursor-pointer"
              >
                Cancelar
              </button>

              <button
                onClick={handleSubmitNewDealership}
                disabled={!newDealerForm.name || !newDealerForm.cnpj || !newDealerForm.city}
                className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-bold px-6 py-2.5 rounded-xl text-xs flex items-center gap-2 transition-all shadow-lg cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Salvar e Homologar Concessionária</span>
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: REDEFINIÇÃO / ALTERAÇÃO DE SENHA DO USUÁRIO                       */}
      {/* ========================================================================= */}
      {passwordModalUser && (
        <div className="fixed inset-0 bg-black/75 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white dark:bg-[#18181b] rounded-3xl max-w-md w-full p-6 shadow-2xl border border-neutral-200 dark:border-[#27272a] animate-in fade-in zoom-in-95 space-y-5 text-neutral-900 dark:text-white">
            
            <div className="flex justify-between items-start pb-3 border-b border-neutral-200 dark:border-[#27272a]">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 bg-amber-50 dark:bg-amber-950/80 border border-amber-200 dark:border-amber-600/50 text-amber-600 dark:text-amber-400 rounded-xl flex items-center justify-center shrink-0">
                  <KeyRound className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-neutral-900 dark:text-white">Alterar Senha de Acesso</h3>
                  <p className="text-[11px] text-neutral-500 dark:text-neutral-400">{passwordModalUser.user.name}</p>
                </div>
              </div>
              <button
                onClick={() => setPasswordModalUser(null)}
                className="text-neutral-400 hover:text-neutral-900 dark:hover:text-white p-1 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {passwordSuccessMessage ? (
              <div className="p-4 bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-200 dark:border-emerald-600/50 rounded-2xl text-center space-y-2">
                <CheckCircle2 className="w-8 h-8 text-emerald-600 dark:text-emerald-400 mx-auto" />
                <p className="text-xs font-bold text-emerald-800 dark:text-emerald-300">{passwordSuccessMessage}</p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="bg-neutral-50 dark:bg-[#121215] p-3 rounded-xl border border-neutral-200 dark:border-[#27272a] text-xs space-y-1">
                  <p className="text-neutral-500 dark:text-neutral-400">Login (E-mail): <strong className="text-neutral-900 dark:text-white font-mono">{passwordModalUser.user.email}</strong></p>
                  <p className="text-neutral-500 dark:text-neutral-400">Concessionária: <strong className="text-blue-600 dark:text-blue-400">{passwordModalUser.dealer.tradeName}</strong></p>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-[11px] font-bold uppercase text-neutral-500 dark:text-neutral-400">
                      Nova Senha Temporária *
                    </label>
                    <button
                      type="button"
                      onClick={generateRandomPassword}
                      className="text-[10px] text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 font-bold cursor-pointer"
                    >
                      <RefreshCw className="w-2.5 h-2.5" />
                      Gerar Senha Segura
                    </button>
                  </div>
                  
                  <div className="relative">
                    <input
                      type={showPasswordText ? 'text' : 'password'}
                      value={newPasswordValue}
                      onChange={(e) => setNewPasswordValue(e.target.value)}
                      placeholder="Mínimo 8 caracteres"
                      className={`${inputClassName} font-mono pr-10`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPasswordText(!showPasswordText)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-900 dark:hover:text-white cursor-pointer"
                    >
                      {showPasswordText ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <label className="flex items-center gap-2 cursor-pointer text-xs text-neutral-700 dark:text-neutral-300">
                  <input
                    type="checkbox"
                    checked={mustChangeNextLogin}
                    onChange={(e) => setMustChangeNextLogin(e.target.checked)}
                    className="rounded border-neutral-300 dark:border-neutral-700 text-blue-600 focus:ring-0"
                  />
                  <span>Exigir alteração de senha no próximo login</span>
                </label>

                <div className="pt-2 flex justify-between items-center">
                  <button
                    onClick={() => setPasswordModalUser(null)}
                    className="px-4 py-2 rounded-xl border border-neutral-300 dark:border-[#27272a] text-xs font-bold text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
                  >
                    Cancelar
                  </button>

                  <button
                    onClick={handleSaveNewPassword}
                    disabled={!newPasswordValue.trim()}
                    className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-bold px-5 py-2 rounded-xl text-xs flex items-center gap-1.5 transition-all shadow cursor-pointer"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>Salvar Nova Senha</span>
                  </button>
                </div>
              </div>
            )}

          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: NOVO USUÁRIO DA CONCESSIONÁRIA                                     */}
      {/* ========================================================================= */}
      {newUserModalOpen && editForm && (
        <div className="fixed inset-0 bg-black/75 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white dark:bg-[#18181b] rounded-3xl max-w-md w-full p-6 shadow-2xl border border-neutral-200 dark:border-[#27272a] animate-in fade-in zoom-in-95 space-y-4 text-neutral-900 dark:text-white">
            
            <div className="flex justify-between items-start pb-3 border-b border-neutral-200 dark:border-[#27272a]">
              <div>
                <h3 className="text-base font-bold text-neutral-900 dark:text-white">Adicionar Novo Usuário</h3>
                <p className="text-[11px] text-neutral-500 dark:text-neutral-400">{editForm.tradeName}</p>
              </div>
              <button
                onClick={() => setNewUserModalOpen(false)}
                className="text-neutral-400 hover:text-neutral-900 dark:hover:text-white p-1 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-[11px] font-bold uppercase text-neutral-500 dark:text-neutral-400 block mb-1">
                  Nome Completo *
                </label>
                <input
                  type="text"
                  placeholder="Nome do colaborador"
                  value={newUserForm.name}
                  onChange={(e) => setNewUserForm({ ...newUserForm, name: e.target.value })}
                  className={inputClassName}
                />
              </div>

              <div>
                <label className="text-[11px] font-bold uppercase text-neutral-500 dark:text-neutral-400 block mb-1">
                  E-mail Institucional (Login) *
                </label>
                <input
                  type="email"
                  placeholder="usuario@concessionaria.com.br"
                  value={newUserForm.email}
                  onChange={(e) => setNewUserForm({ ...newUserForm, email: e.target.value })}
                  className={`${inputClassName} font-mono`}
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[11px] font-bold uppercase text-neutral-500 dark:text-neutral-400 block mb-1">
                    Telefone / WhatsApp
                  </label>
                  <input
                    type="text"
                    placeholder="(00) 00000-0000"
                    value={newUserForm.phone}
                    onChange={(e) => setNewUserForm({ ...newUserForm, phone: e.target.value })}
                    className={inputClassName}
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold uppercase text-neutral-500 dark:text-neutral-400 block mb-1">
                    CPF
                  </label>
                  <input
                    type="text"
                    placeholder="000.000.000-00"
                    value={newUserForm.cpf}
                    onChange={(e) => setNewUserForm({ ...newUserForm, cpf: e.target.value })}
                    className={`${inputClassName} font-mono`}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[11px] font-bold uppercase text-neutral-500 dark:text-neutral-400 block mb-1">
                    Cargo / Função
                  </label>
                  <select
                    value={newUserForm.role}
                    onChange={(e) => setNewUserForm({ ...newUserForm, role: e.target.value as DealershipUserRole })}
                    className={selectClassName}
                  >
                    <option value="Diretor / Titular">Diretor / Titular</option>
                    <option value="Gerente Geral">Gerente Geral</option>
                    <option value="Gerente Comercial">Gerente Comercial</option>
                    <option value="Consultor de Vendas">Consultor de Vendas</option>
                    <option value="Chefe de Oficina">Chefe de Oficina</option>
                    <option value="Analista Financeiro">Analista Financeiro</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-bold uppercase text-neutral-500 dark:text-neutral-400 block mb-1">
                    Perfil de Acesso
                  </label>
                  <select
                    value={newUserForm.accessLevel}
                    onChange={(e) => setNewUserForm({ ...newUserForm, accessLevel: e.target.value as DealershipAccessLevel })}
                    className={selectClassName}
                  >
                    <option value="admin_dealer">Admin Concessionária</option>
                    <option value="vendas">Vendas & Pedidos</option>
                    <option value="pos_vendas">Garantia & Oficina</option>
                    <option value="financeiro">Financeiro & Crédito</option>
                  </select>
                </div>
              </div>

              <label className="flex items-center gap-2 cursor-pointer text-xs text-neutral-700 dark:text-neutral-300 pt-1">
                <input
                  type="checkbox"
                  checked={newUserForm.mustChangePasswordNextLogin}
                  onChange={(e) => setNewUserForm({ ...newUserForm, mustChangePasswordNextLogin: e.target.checked })}
                  className="rounded border-neutral-300 dark:border-neutral-700 text-blue-600 focus:ring-0"
                />
                <span>Exigir criação de senha própria no primeiro login</span>
              </label>
            </div>

            <div className="pt-3 border-t border-neutral-200 dark:border-[#27272a] flex justify-between items-center">
              <button
                onClick={() => setNewUserModalOpen(false)}
                className="px-4 py-2 rounded-xl border border-neutral-300 dark:border-[#27272a] text-xs font-bold text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
              >
                Cancelar
              </button>

              <button
                onClick={handleCreateNewUser}
                disabled={!newUserForm.name || !newUserForm.email}
                className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-bold px-5 py-2 rounded-xl text-xs flex items-center gap-1.5 transition-all shadow cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Criar Usuário</span>
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
};
