import React from 'react';
import { NavTab, DealershipScope } from '../types';
import { DEALER_IMAGES, DEALERSHIP_PROFILES } from '../data/mockData';
import { 
  LayoutDashboard, 
  ShoppingCart, 
  Bike, 
  BadgeDollarSign, 
  Wrench, 
  Settings, 
  HelpCircle, 
  Plus,
  X,
  Radio,
  Factory,
  Building2,
  Boxes,
  ShieldCheck,
  Truck,
  Globe2,
  CalendarCheck,
  Package,
  Sun,
  Moon
} from 'lucide-react';

interface SidebarProps {
  currentTab: NavTab;
  setCurrentTab: (tab: NavTab) => void;
  currentScope: DealershipScope;
  onChangeScope: (scope: DealershipScope) => void;
  mobileOpen: boolean;
  setMobileOpen: (open: boolean) => void;
  onOpenNewOrder: () => void;
  pendingOrdersCount?: number;
  activeOSCount?: number;
  theme?: 'dark' | 'light';
  onToggleTheme?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  setCurrentTab,
  currentScope,
  onChangeScope,
  mobileOpen,
  setMobileOpen,
  onOpenNewOrder,
  pendingOrdersCount = 0,
  activeOSCount = 0,
  theme = 'dark',
  onToggleTheme
}) => {
  const activeProfile = DEALERSHIP_PROFILES[currentScope];
  const isMontadora = currentScope === 'jtoledo';

  const navItems = isMontadora ? [
    { id: 'dashboard' as NavTab, label: 'Cockpit Geral Montadora', icon: LayoutDashboard },
    { id: 'dealers_network' as NavTab, label: 'Rede de Concessionárias', icon: Building2 },
    { id: 'commitments' as NavTab, label: 'Compromissos da Rede', icon: CalendarCheck },
    { id: 'purchase' as NavTab, label: 'Pedidos da Rede & ERP', icon: ShoppingCart },
    { id: 'reserve_fund' as NavTab, label: 'Fundo de Reserva', icon: BadgeDollarSign },
    { id: 'inventory' as NavTab, label: 'Estoque da Rede', icon: Boxes },
  ] : [
    { id: 'dashboard' as NavTab, label: 'Dashboard', icon: LayoutDashboard },
    { id: 'commitments' as NavTab, label: 'Compromisso Mensal', icon: CalendarCheck },
    { id: 'purchase' as NavTab, label: 'Pedido de Fábrica (Motos)', icon: ShoppingCart },
    { id: 'reserve_fund' as NavTab, label: 'Fundo de Reserva', icon: BadgeDollarSign },
    { id: 'inventory' as NavTab, label: 'Estoque da Loja', icon: Bike },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div 
          className="fixed inset-0 bg-black/70 z-30 lg:hidden backdrop-blur-sm transition-opacity"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <aside className={`
        fixed top-0 bottom-0 left-0 z-40 w-[270px] bg-white dark:bg-[#121215] border-r border-neutral-200 dark:border-[#27272a]
        flex flex-col py-5 transition-all duration-300 ease-in-out
        ${mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Logo & Header */}
        <div className="px-5 mb-5 flex flex-col gap-2 relative">
          <button 
            onClick={() => setMobileOpen(false)} 
            className="lg:hidden absolute right-4 top-0 p-1 text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
          
          <div className="flex items-center gap-3">
            <div className={`w-11 h-11 rounded-2xl overflow-hidden border flex items-center justify-center p-1 shadow-inner shadow-black/40 ${
              isMontadora 
                ? 'bg-blue-950/80 border-blue-600/50 text-blue-400' 
                : currentScope === 'novamotor'
                ? 'bg-amber-950/80 border-amber-600/50 text-amber-400'
                : 'bg-neutral-900 border-neutral-700 text-blue-400'
            }`}>
              {isMontadora ? (
                <Factory className="w-6 h-6 text-blue-400" />
              ) : (
                <img 
                  src={DEALER_IMAGES.dealerLogo} 
                  alt="Logo Dealer" 
                  className="w-full h-full object-cover rounded-xl"
                  referrerPolicy="no-referrer"
                />
              )}
            </div>
            <div className="overflow-hidden">
              <h1 className="text-[15px] font-bold text-neutral-900 dark:text-[#fafafa] leading-tight tracking-tight truncate">
                {activeProfile?.name}
              </h1>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className={`text-[10px] uppercase font-bold tracking-widest ${
                  isMontadora ? 'text-blue-400' : 'text-emerald-400'
                }`}>
                  {isMontadora ? 'Montadora Oficial' : 'Concessionária Autorizada'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="px-4 mb-4">
          {!isMontadora ? (
            <button 
              onClick={() => {
                onOpenNewOrder();
                setMobileOpen(false);
              }}
              className="w-full bg-[#3b82f6] hover:bg-[#2563eb] active:scale-[0.98] text-white py-2.5 px-4 rounded-xl font-bold text-[12px] tracking-wide flex items-center justify-center gap-2 transition-all shadow-lg shadow-blue-500/20"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>Novo Pedido de Fábrica</span>
            </button>
          ) : (
            <button 
              onClick={() => {
                setCurrentTab('purchase');
                setMobileOpen(false);
              }}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 active:scale-[0.98] text-white py-2.5 px-4 rounded-xl font-bold text-[12px] tracking-wide flex items-center justify-center gap-2 transition-all shadow-lg shadow-blue-500/20"
            >
              <Truck className="w-4 h-4" />
              <span>Gestão de Pedidos & ERP</span>
            </button>
          )}
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 flex flex-col gap-1 px-3 overflow-y-auto">
          <span className="px-3 text-[10px] font-bold uppercase tracking-widest text-neutral-500 mb-1">
            {isMontadora ? 'Módulos da Montadora' : 'Menu da Concessionária'}
          </span>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setCurrentTab(item.id);
                  setMobileOpen(false);
                }}
                className={`
                  flex items-center justify-between w-full px-3 py-2.5 text-left transition-all rounded-xl text-[12.5px] font-medium
                  ${isActive 
                    ? 'bg-[#3b82f6]/15 text-[#2563eb] dark:text-[#60a5fa] border border-[#3b82f6]/40 font-semibold shadow-inner' 
                    : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-[#fafafa] hover:bg-neutral-100 dark:hover:bg-neutral-800/60'
                  }
                `}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-[#3b82f6]' : 'text-neutral-400'}`} />
                  <span>{item.label}</span>
                </div>
                {item.badge !== undefined && item.badge > 0 && (
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    isActive ? 'bg-[#3b82f6] text-white' : 'bg-neutral-800 text-neutral-300 border border-neutral-700'
                  }`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Dealership Switcher Pills directly in Sidebar */}
        <div className="px-3 py-2 border-t border-[#27272a] mx-2">
          <div className="flex items-center justify-between mb-1.5 px-1">
            <span className="text-[9px] uppercase font-bold text-neutral-400 tracking-wider flex items-center gap-1">
              <Globe2 className="w-3 h-3 text-blue-400" />
              Rede Nacional ({Object.keys(DEALERSHIP_PROFILES).length - 1} Lojas)
            </span>
          </div>
          
          <div className="flex flex-col gap-1.5">
            <button
              onClick={() => onChangeScope('jtoledo')}
              className={`w-full py-1.5 px-2.5 rounded-xl text-[11px] font-bold transition-all flex items-center justify-between border ${
                currentScope === 'jtoledo'
                  ? 'bg-blue-950 border-blue-500 text-white shadow-sm'
                  : 'bg-neutral-950 border-neutral-800 text-neutral-300 hover:text-white hover:border-neutral-700'
              }`}
            >
              <div className="flex items-center gap-1.5">
                <Factory className="w-3.5 h-3.5 text-blue-400" />
                <span>Cockpit Montadora</span>
              </div>
              <span className="text-[8px] bg-blue-500/20 text-blue-300 px-1 py-0.2 rounded font-bold uppercase">
                Geral
              </span>
            </button>

            {currentScope !== 'jtoledo' && (
              <div className="px-2 py-1.5 bg-neutral-900/90 border border-blue-900/40 rounded-xl flex items-center justify-between">
                <div className="min-w-0">
                  <span className="text-[8px] text-neutral-400 font-bold uppercase block">Loja Ativa</span>
                  <p className="text-[11px] font-bold text-white truncate">{activeProfile?.shortName}</p>
                </div>
                <span className="text-[9px] bg-blue-900/60 text-blue-200 px-1.5 py-0.5 rounded font-mono font-bold">
                  {activeProfile?.state}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Footer Navigation: Settings & Support */}
        <div className="flex flex-col gap-1 px-3 pt-2 border-t border-[#27272a] mx-2">
          <button
            onClick={() => {
              setCurrentTab('settings');
              setMobileOpen(false);
            }}
            className={`
              flex items-center gap-3 px-3 py-1.5 rounded-xl text-left transition-colors text-[12px]
              ${currentTab === 'settings' 
                ? 'bg-[#3b82f6]/15 text-[#60a5fa] font-semibold border border-[#3b82f6]/30' 
                : 'text-neutral-400 hover:text-[#fafafa] hover:bg-neutral-800/60'
              }
            `}
          >
            <Settings className="w-3.5 h-3.5" />
            <span>Configurações</span>
          </button>
          
          <button
            onClick={() => {
              setCurrentTab('support');
              setMobileOpen(false);
            }}
            className={`
              flex items-center gap-3 px-3 py-1.5 rounded-xl text-left transition-colors text-[12px]
              ${currentTab === 'support' 
                ? 'bg-[#3b82f6]/15 text-[#60a5fa] font-semibold border border-[#3b82f6]/30' 
                : 'text-neutral-400 hover:text-[#fafafa] hover:bg-neutral-800/60'
              }
            `}
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Suporte</span>
          </button>

          {onToggleTheme && (
            <button
              onClick={onToggleTheme}
              className="flex items-center gap-3 px-3 py-1.5 rounded-xl text-left transition-colors text-[12px] text-neutral-400 hover:text-[#fafafa] hover:bg-neutral-800/60 w-full"
            >
              {theme === 'dark' ? (
                <>
                  <Sun className="w-3.5 h-3.5 text-amber-400" />
                  <span>Tema Claro (Light)</span>
                </>
              ) : (
                <>
                  <Moon className="w-3.5 h-3.5 text-blue-500" />
                  <span>Tema Escuro (Dark)</span>
                </>
              )}
            </button>
          )}

          {/* Dealership Info Badge */}
          <div className="mt-1 p-2.5 bg-[#18181b] rounded-2xl border border-[#27272a] text-[11px] text-neutral-400">
            <div className="flex items-center justify-between">
              <p className="font-bold text-[#fafafa] truncate">{activeProfile?.shortName}</p>
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
            </div>
            <p className="text-[10px] text-neutral-500 font-mono mt-0.5">
              {activeProfile?.city} ({activeProfile?.state})
            </p>
            <div className="flex items-center gap-1.5 mt-1.5 text-emerald-400 font-medium text-[10px]">
              <Radio className="w-3 h-3 text-emerald-500" />
              <span>J. Toledo Live Network</span>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};
