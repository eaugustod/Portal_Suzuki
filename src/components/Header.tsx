import React, { useState } from 'react';
import { NavTab, DealershipScope } from '../types';
import { DEALER_IMAGES, DEALERSHIP_PROFILES } from '../data/mockData';
import { 
  Menu, 
  Bell, 
  Search, 
  CheckCircle2, 
  AlertTriangle,
  X,
  Plus,
  Building2,
  Factory,
  ChevronDown,
  Globe2,
  Check,
  Sun,
  Moon
} from 'lucide-react';

interface HeaderProps {
  currentTab: NavTab;
  currentScope: DealershipScope;
  onChangeScope: (scope: DealershipScope) => void;
  onOpenMobileNav: () => void;
  onOpenNewOrder: () => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  theme?: 'dark' | 'light';
  onToggleTheme?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  currentScope,
  onChangeScope,
  onOpenMobileNav,
  onOpenNewOrder,
  searchQuery,
  setSearchQuery,
  theme = 'dark',
  onToggleTheme
}) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showScopeDropdown, setShowScopeDropdown] = useState(false);

  const activeProfile = DEALERSHIP_PROFILES[currentScope];

  const getTabTitle = (tab: NavTab) => {
    if (currentScope === 'jtoledo') {
      switch (tab) {
        case 'dashboard': return 'Cockpit Geral da Montadora';
        case 'commitments': return 'Gestão Nacional de Compromissos de Compra';
        case 'purchase': return 'Catálogo Nacional & Pedidos de Fábrica';
        case 'parts_catalog': return 'Catálogo de Peças Genuínas (EPC) & ERP';
        case 'inventory': return 'Estoque Consolidado da Rede';
        case 'sales': return 'Consolidado Comercial & CRM Rede';
        case 'service_order': return 'Garantias & Pós-Venda Nacional';
        case 'dealers_network': return 'Gestão da Rede de Concessionárias';
        case 'settings': return 'Diretrizes & Parâmetros Montadora';
        case 'support': return 'Central de Suporte à Rede';
        default: return 'Grupo J. Toledo Brasil';
      }
    }

    switch (tab) {
      case 'dashboard': return 'Dashboard Executivo';
      case 'commitments': return 'Compromisso de Compra Mensal & Estoque';
      case 'purchase': return 'Pedido de Fábrica (Motos 0km)';
      case 'parts_catalog': return 'Catálogo Eletrônico de Peças (EPC)';
      case 'inventory': return 'Gestão de Estoque do Pátio';
      case 'sales': return 'Gestão de Vendas & CRM';
      case 'service_order': return 'Ordem de Serviço (Oficina)';
      case 'settings': return 'Configurações da Concessionária';
      case 'support': return 'Central de Suporte ao Concessionário';
      default: return activeProfile?.name || 'Portal do Concessionário';
    }
  };

  const notifications = [
    {
      id: 1,
      title: currentScope === 'jtoledo' ? 'Lote de 12 motos despachado de Manaus' : 'Lote V-Strom em trânsito',
      desc: currentScope === 'jtoledo' ? 'Carga com destino a Nova Motor SP e MotoSul RS.' : 'Previsão de chegada na concessionária hoje às 14:00.',
      time: '25m',
      type: 'shipping',
      unread: true
    },
    {
      id: 2,
      title: 'Crédito Aprovado J. Toledo Finance',
      desc: 'Proposta pronta para faturamento de motocicletas 0km.',
      time: '1h',
      type: 'credit',
      unread: true
    },
    {
      id: 3,
      title: 'Auditoria de Pós-Venda Concluída',
      desc: 'Índice de conformidade de garantia atingiu 99.2% na rede.',
      time: '2h',
      type: 'workshop',
      unread: false
    }
  ];

  return (
    <header className="flex justify-between items-center w-full px-4 md:px-6 h-16 bg-white dark:bg-neutral-900 border-b border-slate-200 dark:border-neutral-800 sticky top-0 z-20 shrink-0 transition-colors">
      {/* Left: Mobile Menu & Tab Title with Official Suzuki Branding */}
      <div className="flex items-center gap-3">
        <button 
          onClick={onOpenMobileNav}
          className="lg:hidden text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-neutral-800 p-2 rounded-xl transition-colors"
          aria-label="Abrir Menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Suzuki Official Logo Badge */}
        <div className="hidden sm:flex items-center gap-2 bg-white dark:bg-neutral-800 px-3 py-1.5 rounded-xl border border-slate-200/80 dark:border-neutral-700/80 shadow-2xs h-11">
          <img 
            src="/suzuki-logo.png" 
            alt="Grupo J. Toledo Suzuki Motos Brasil" 
            className="h-8 md:h-9 w-auto object-contain"
          />
        </div>

        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <h1 className="text-[16px] md:text-[18px] font-bold text-slate-900 dark:text-white tracking-tight">
              {getTabTitle(currentTab)}
            </h1>
          </div>
          <span className="text-[11px] text-slate-500 dark:text-slate-400 hidden sm:flex items-center gap-1.5">
            <span className={`w-1.5 h-1.5 rounded-full ${currentScope === 'jtoledo' ? 'bg-blue-600' : 'bg-emerald-500'}`} />
            {activeProfile?.name} • {activeProfile?.city} ({activeProfile?.state})
          </span>
        </div>
      </div>

      {/* Center: Dealership & Montadora Selector Pill */}
      <div className="relative">
        <button
          onClick={() => {
            setShowScopeDropdown(!showScopeDropdown);
            setShowNotifications(false);
            setShowUserMenu(false);
          }}
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-2xl text-[12px] font-bold border transition-all shadow-sm ${
            currentScope === 'jtoledo'
              ? 'bg-blue-600 text-white border-blue-600'
              : 'bg-slate-100 dark:bg-neutral-800 border-slate-200 dark:border-neutral-700 text-slate-800 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          {currentScope === 'jtoledo' ? (
            <Factory className="w-4 h-4 text-white" />
          ) : (
            <Building2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          )}

          <div className="flex flex-col text-left leading-tight hidden xs:block sm:block">
            <span className="text-[9px] uppercase font-bold tracking-wider opacity-80">
              {currentScope === 'jtoledo' ? 'Visão Montadora' : 'Concessionária'}
            </span>
            <span className="text-[12px] font-bold truncate max-w-[140px] md:max-w-[180px]">
              {activeProfile?.shortName}
            </span>
          </div>

          <ChevronDown className="w-3.5 h-3.5 opacity-80 ml-1" />
        </button>

        {/* Scope Dropdown Menu with Search and Region Grouping */}
        {showScopeDropdown && (
          <div className="absolute left-1/2 -translate-x-1/2 md:translate-x-0 md:left-auto md:right-0 top-12 w-96 bg-white dark:bg-neutral-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-neutral-800 p-3 z-50 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between px-1 py-1 mb-2 border-b border-slate-200 dark:border-neutral-800">
              <span className="text-[11px] uppercase font-bold text-slate-700 dark:text-slate-300 tracking-wider flex items-center gap-1.5">
                <Globe2 className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                Rede de Concessionárias ({Object.keys(DEALERSHIP_PROFILES).length - 1} Lojas)
              </span>
              <span className="text-[10px] text-slate-400 dark:text-neutral-500 font-mono">Grupo J. Toledo</span>
            </div>

            {/* Option 1: Grupo J. Toledo Montadora (Always on top) */}
            <button
              onClick={() => {
                onChangeScope('jtoledo');
                setShowScopeDropdown(false);
              }}
              className={`w-full text-left p-2.5 mb-2 rounded-xl border flex items-center justify-between transition-all ${
                currentScope === 'jtoledo'
                  ? 'bg-blue-600 text-white border-blue-600 shadow-md'
                  : 'bg-slate-50 dark:bg-neutral-800 border-slate-200 dark:border-neutral-700 text-slate-800 dark:text-neutral-200 hover:bg-slate-100 dark:hover:bg-neutral-700'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-blue-500/20 text-blue-600 dark:text-blue-400">
                  <Factory className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[12px] font-bold">Grupo J. Toledo Brasil</span>
                    <span className="text-[9px] bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-200 px-1.5 py-0.2 rounded font-bold uppercase">
                      Montadora Nacional
                    </span>
                  </div>
                  <p className="text-[10px] opacity-80">Consolidado & Cockpit de Todas as Lojas</p>
                </div>
              </div>
              {currentScope === 'jtoledo' && <Check className="w-4 h-4 text-white shrink-0" />}
            </button>

            {/* Dealerships Search Bar */}
            <div className="relative mb-2">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Buscar por loja, cidade ou UF..."
                className="w-full bg-slate-50 dark:bg-neutral-800 text-[11px] text-slate-900 dark:text-white pl-8 pr-3 py-1.5 rounded-lg border border-slate-200 dark:border-neutral-700 focus:outline-none focus:border-blue-600 dark:focus:border-blue-500 placeholder:text-slate-400"
                onClick={(e) => e.stopPropagation()}
                onChange={(e) => {
                  const val = e.target.value.toLowerCase();
                  const elements = document.querySelectorAll('.dealer-dropdown-item');
                  elements.forEach((el: any) => {
                    const text = el.getAttribute('data-search') || '';
                    if (text.includes(val)) {
                      el.style.display = 'flex';
                    } else {
                      el.style.display = 'none';
                    }
                  });
                }}
              />
            </div>

            {/* Scrollable list of authorized dealerships */}
            <div className="space-y-1 max-h-64 overflow-y-auto pr-1">
              {Object.entries(DEALERSHIP_PROFILES)
                .filter(([id, p]) => p.type === 'concessionaria')
                .map(([id, profile]) => {
                  const isSelected = currentScope === id;
                  return (
                    <button
                      key={id}
                      data-search={`${profile.name.toLowerCase()} ${profile.city.toLowerCase()} ${profile.state.toLowerCase()} ${profile.region.toLowerCase()}`}
                      onClick={() => {
                        onChangeScope(id);
                        setShowScopeDropdown(false);
                      }}
                      className={`dealer-dropdown-item w-full text-left p-2 rounded-xl border flex items-center justify-between transition-all ${
                        isSelected
                          ? 'bg-blue-50 dark:bg-blue-950/60 border-blue-600 text-blue-900 dark:text-white font-semibold'
                          : 'bg-white dark:bg-neutral-900 border-slate-200 dark:border-neutral-800 text-slate-700 dark:text-neutral-300 hover:bg-slate-50 dark:hover:bg-neutral-800'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="p-1.5 rounded-lg bg-slate-100 dark:bg-neutral-800 text-blue-600 dark:text-blue-400 border border-slate-200 dark:border-neutral-700 shrink-0">
                          <Building2 className="w-3.5 h-3.5" />
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="text-[11px] font-bold truncate max-w-[170px]">
                              {profile.name}
                            </span>
                            <span className="text-[9px] bg-slate-100 dark:bg-neutral-800 text-slate-700 dark:text-neutral-300 border border-slate-200 dark:border-neutral-700 px-1 py-0.2 rounded font-bold shrink-0">
                              {profile.state}
                            </span>
                          </div>
                          <p className="text-[9px] text-slate-500 dark:text-neutral-400 truncate">
                            {profile.city} • Região {profile.region} • Gerente: {profile.manager}
                          </p>
                        </div>
                      </div>
                      {isSelected && <Check className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 shrink-0" />}
                    </button>
                  );
                })}
            </div>
          </div>
        )}
      </div>

      {/* Right: Search + Notifications + Profile */}
      <div className="flex items-center gap-2 md:gap-3 relative">
        {currentScope !== 'jtoledo' && (
          <button
            onClick={onOpenNewOrder}
            className="hidden sm:flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-xl text-[12px] font-bold transition-all shadow-sm"
          >
            <Plus className="w-3.5 h-3.5 stroke-[3]" />
            <span>Novo Pedido</span>
          </button>
        )}

        {/* Theme Toggle Button (Light/Dark Mode) */}
        {onToggleTheme && (
          <button
            onClick={onToggleTheme}
            className="text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-neutral-800 p-2 rounded-xl transition-colors border border-slate-200 dark:border-neutral-700 flex items-center justify-center shadow-sm"
            title={theme === 'dark' ? 'Alternar para Modo Claro' : 'Alternar para Modo Escuro'}
          >
            {theme === 'dark' ? (
              <Sun className="w-4 h-4 text-amber-400" />
            ) : (
              <Moon className="w-4 h-4 text-slate-600" />
            )}
          </button>
        )}

        {/* Notifications Button & Dropdown */}
        <div className="relative">
          <button 
            onClick={() => {
              setShowNotifications(!showNotifications);
              setShowUserMenu(false);
              setShowScopeDropdown(false);
            }}
            className="text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-neutral-800 p-2 rounded-xl transition-colors relative border border-slate-200 dark:border-neutral-700"
            title="Notificações"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-600 rounded-full ring-2 ring-white dark:ring-neutral-900"></span>
          </button>

          {showNotifications && (
            <div className="absolute right-0 top-12 w-80 bg-white dark:bg-neutral-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-neutral-800 p-3 z-50 animate-in fade-in zoom-in-95 duration-150">
              <div className="flex justify-between items-center pb-2 border-b border-slate-200 dark:border-neutral-800 mb-2">
                <span className="text-[12px] font-bold text-slate-900 dark:text-white uppercase tracking-wider">Notificações</span>
                <span className="text-[10px] font-bold px-1.5 py-0.5 bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-800 rounded-md">2 novas</span>
              </div>
              <div className="space-y-2 max-h-72 overflow-y-auto">
                {notifications.map((notif) => (
                  <div 
                    key={notif.id} 
                    className={`p-2.5 rounded-xl border text-left transition-colors ${
                      notif.unread 
                        ? 'bg-blue-50/50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800/60' 
                        : 'bg-slate-50 dark:bg-neutral-800/40 border-slate-200 dark:border-neutral-800'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-1">
                      <p className="text-[12px] font-bold text-slate-900 dark:text-white leading-snug">{notif.title}</p>
                      <span className="text-[10px] text-slate-400 dark:text-neutral-500 font-mono whitespace-nowrap">{notif.time}</span>
                    </div>
                    <p className="text-[11px] text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">{notif.desc}</p>
                  </div>
                ))}
              </div>
              <button 
                onClick={() => setShowNotifications(false)}
                className="w-full mt-2 py-1.5 text-center text-[11px] font-bold text-blue-600 dark:text-blue-400 hover:underline"
              >
                Fechar Notificações
              </button>
            </div>
          )}
        </div>

        {/* User Profile Avatar & Dropdown */}
        <div className="relative">
          <button 
            onClick={() => {
              setShowUserMenu(!showUserMenu);
              setShowNotifications(false);
              setShowScopeDropdown(false);
            }}
            className="flex items-center gap-2 p-1 hover:bg-slate-100 dark:hover:bg-neutral-800 rounded-xl transition-colors border border-slate-200 dark:border-neutral-700"
          >
            <div className="w-7 h-7 rounded-lg overflow-hidden border border-slate-300 dark:border-neutral-700">
              <img 
                src={DEALER_IMAGES.userAvatar} 
                alt="Eduardo Donato" 
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
          </button>

          {showUserMenu && (
            <div className="absolute right-0 top-12 w-72 bg-white dark:bg-neutral-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-neutral-800 p-3.5 z-50">
              <div className="flex items-center gap-3 pb-3 border-b border-slate-200 dark:border-neutral-800">
                <img 
                  src={DEALER_IMAGES.userAvatar} 
                  alt="Eduardo Donato" 
                  className="w-10 h-10 rounded-xl object-cover border border-slate-300 dark:border-neutral-700"
                  referrerPolicy="no-referrer"
                />
                <div>
                  <p className="text-[13px] font-bold text-slate-900 dark:text-white">Eduardo Donato</p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    {currentScope === 'jtoledo' ? 'Diretor Nacional de Rede' : 'Gerente Geral Dealer'}
                  </p>
                  <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">● Online</span>
                </div>
              </div>

              <div className="py-2.5 text-[12px] space-y-1.5">
                <div className="flex justify-between px-1 text-slate-600 dark:text-slate-400">
                  <span>Entidade Ativa:</span>
                  <span className="font-semibold text-slate-900 dark:text-white">{activeProfile?.shortName}</span>
                </div>
                <div className="flex justify-between px-1 text-slate-600 dark:text-slate-400">
                  <span>Local:</span>
                  <span className="font-semibold text-slate-900 dark:text-white">{activeProfile?.city} ({activeProfile?.state})</span>
                </div>
                <div className="flex justify-between px-1 text-slate-600 dark:text-slate-400">
                  <span>CNPJ:</span>
                  <span className="font-semibold text-slate-700 dark:text-neutral-300 font-mono text-[11px]">{activeProfile?.cnpj}</span>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-200 dark:border-neutral-800">
                <button 
                  onClick={() => setShowUserMenu(false)}
                  className="w-full text-center py-2 text-[11px] font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-colors"
                >
                  Perfil Executivo
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
