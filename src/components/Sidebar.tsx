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
  CreditCard,
  Layers,
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

  interface NavItemDef {
    id: NavTab;
    label: string;
    icon: any;
    badge?: number;
  }

  const navItems: NavItemDef[] = isMontadora ? [
    { id: 'dashboard' as NavTab, label: 'Cockpit Montadora', icon: LayoutDashboard },
    { id: 'dealers_network' as NavTab, label: 'Gestão da Rede (Dealers)', icon: Building2 },
    { id: 'commitments' as NavTab, label: 'Compromissos da Rede', icon: CalendarCheck },
    { id: 'purchase' as NavTab, label: 'Pedidos da Rede & ERP', icon: ShoppingCart, badge: pendingOrdersCount },
    { id: 'freight_table' as NavTab, label: 'Gestão de Fretes & UF', icon: Truck },
    { id: 'payment_conditions' as NavTab, label: 'Condições de Pagamento', icon: CreditCard },
    { id: 'model_matrix' as NavTab, label: 'Habilitação Modelos/Cores', icon: Layers },
    { id: 'approval_workflow' as NavTab, label: 'Workflow de Aprovação', icon: ShieldCheck },
    { id: 'reserve_fund' as NavTab, label: 'Fundo de Reserva', icon: BadgeDollarSign },
    { id: 'inventory' as NavTab, label: 'Estoque da Rede', icon: Boxes },
  ] : [
    { id: 'dashboard' as NavTab, label: 'Dashboard', icon: LayoutDashboard },
    { id: 'commitments' as NavTab, label: 'Compromisso Mensal', icon: CalendarCheck },
    { id: 'purchase' as NavTab, label: 'Pedido de Fábrica (Motos)', icon: ShoppingCart, badge: pendingOrdersCount },
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
        fixed top-0 bottom-0 left-0 z-40 w-[270px] bg-white dark:bg-neutral-900 border-r border-slate-200 dark:border-neutral-800
        flex flex-col py-5 transition-all duration-300 ease-in-out
        ${mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Logo & Header */}
        <div className="px-5 mb-5 flex flex-col gap-2 relative">
          <button 
            onClick={() => setMobileOpen(false)} 
            className="lg:hidden absolute right-4 top-0 p-1 text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-neutral-800 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
          
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl overflow-hidden flex items-center justify-center p-1 bg-gradient-to-tr from-blue-700 to-red-600 text-white shadow-md shadow-blue-500/20">
              {isMontadora ? (
                <Factory className="w-6 h-6 text-white" />
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
              <h1 className="text-[15px] font-bold text-slate-900 dark:text-white leading-tight tracking-tight truncate flex items-center gap-1">
                <span>Suzuki</span>
                <span className="text-red-600 dark:text-red-500">DealerHub</span>
              </h1>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className={`text-[10px] uppercase font-bold tracking-widest ${
                  isMontadora ? 'text-blue-600 dark:text-blue-400' : 'text-emerald-600 dark:text-emerald-400'
                }`}>
                  {isMontadora ? 'Montadora Oficial' : activeProfile?.shortName || 'Concessionária'}
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
              className="w-full bg-blue-600 hover:bg-blue-700 active:scale-[0.98] text-white py-2.5 px-4 rounded-xl font-bold text-[12px] tracking-wide flex items-center justify-center gap-2 transition-all shadow-md shadow-blue-600/30"
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
              className="w-full bg-gradient-to-r from-blue-700 to-red-600 hover:from-blue-800 hover:to-red-700 active:scale-[0.98] text-white py-2.5 px-4 rounded-xl font-bold text-[12px] tracking-wide flex items-center justify-center gap-2 transition-all shadow-md shadow-blue-500/20"
            >
              <Truck className="w-4 h-4" />
              <span>Gestão de Pedidos & ERP</span>
            </button>
          )}
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 flex flex-col gap-1 px-3 overflow-y-auto">
          <span className="px-3 text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-neutral-500 mb-1">
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
                    ? 'bg-blue-600 text-white shadow-sm shadow-blue-600/30 font-semibold' 
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-neutral-800/80'
                  }
                `}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400 dark:text-neutral-400'}`} />
                  <span>{item.label}</span>
                </div>
                {item.badge !== undefined && item.badge > 0 && (
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    isActive ? 'bg-white text-blue-600' : 'bg-slate-200 dark:bg-neutral-800 text-slate-700 dark:text-neutral-300 border border-slate-300 dark:border-neutral-700'
                  }`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Dealership Switcher Pills directly in Sidebar */}
        <div className="px-3 py-2 border-t border-slate-200 dark:border-neutral-800 mx-2">
          <div className="flex items-center justify-between mb-1.5 px-1">
            <span className="text-[9px] uppercase font-bold text-slate-400 dark:text-slate-400 tracking-wider flex items-center gap-1">
              <Globe2 className="w-3 h-3 text-blue-600 dark:text-blue-400" />
              Rede Nacional ({Object.keys(DEALERSHIP_PROFILES).length - 1} Lojas)
            </span>
          </div>
          
          <div className="flex flex-col gap-1.5">
            <button
              onClick={() => onChangeScope('jtoledo')}
              className={`w-full py-1.5 px-2.5 rounded-xl text-[11px] font-bold transition-all flex items-center justify-between border ${
                currentScope === 'jtoledo'
                  ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                  : 'bg-slate-50 dark:bg-neutral-950 border-slate-200 dark:border-neutral-800 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <div className="flex items-center gap-1.5">
                <Factory className="w-3.5 h-3.5 text-blue-300 dark:text-blue-400" />
                <span>Cockpit Montadora</span>
              </div>
              <span className="text-[8px] bg-blue-500/20 text-blue-200 px-1 py-0.2 rounded font-bold uppercase">
                Geral
              </span>
            </button>

            {currentScope !== 'jtoledo' && (
              <div className="px-2 py-1.5 bg-slate-100 dark:bg-neutral-800/90 border border-slate-200 dark:border-neutral-700 rounded-xl flex items-center justify-between">
                <div className="min-w-0">
                  <span className="text-[8px] text-slate-500 dark:text-neutral-400 font-bold uppercase block">Loja Ativa</span>
                  <p className="text-[11px] font-bold text-slate-900 dark:text-white truncate">{activeProfile?.shortName}</p>
                </div>
                <span className="text-[9px] bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-200 px-1.5 py-0.5 rounded font-mono font-bold">
                  {activeProfile?.state}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Footer Navigation: Settings & Support */}
        <div className="flex flex-col gap-1 px-3 pt-2 border-t border-slate-200 dark:border-neutral-800 mx-2">
          <button
            onClick={() => {
              setCurrentTab('settings');
              setMobileOpen(false);
            }}
            className={`
              flex items-center gap-3 px-3 py-1.5 rounded-xl text-left transition-colors text-[12px]
              ${currentTab === 'settings' 
                ? 'bg-blue-600 text-white font-semibold' 
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-neutral-800/60'
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
                ? 'bg-blue-600 text-white font-semibold' 
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-neutral-800/60'
              }
            `}
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Suporte</span>
          </button>

          {onToggleTheme && (
            <button
              onClick={onToggleTheme}
              className="flex items-center gap-3 px-3 py-1.5 rounded-xl text-left transition-colors text-[12px] border border-slate-200 dark:border-neutral-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-neutral-800 w-full font-medium"
            >
              {theme === 'dark' ? (
                <>
                  <Sun className="w-3.5 h-3.5 text-amber-400" />
                  <span>Modo Claro</span>
                </>
              ) : (
                <>
                  <Moon className="w-3.5 h-3.5 text-slate-600" />
                  <span>Modo Escuro</span>
                </>
              )}
            </button>
          )}

          {/* Dealership Info Badge */}
          <div className="mt-1 p-2.5 bg-slate-50 dark:bg-neutral-900 rounded-2xl border border-slate-200 dark:border-neutral-800 text-[11px] text-slate-600 dark:text-neutral-400">
            <div className="flex items-center justify-between">
              <p className="font-bold text-slate-900 dark:text-white truncate">{activeProfile?.shortName}</p>
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
            </div>
            <p className="text-[10px] text-slate-500 dark:text-neutral-500 font-mono mt-0.5">
              {activeProfile?.city} ({activeProfile?.state})
            </p>
            <div className="flex items-center gap-1.5 mt-1.5 text-emerald-600 dark:text-emerald-400 font-medium text-[10px]">
              <Radio className="w-3 h-3 text-emerald-500" />
              <span>J. Toledo Live Network</span>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};
