import React, { useState } from 'react';
import { DEALER_IMAGES } from '../data/mockData';
import { 
  Building2, 
  ShieldCheck, 
  Bell, 
  CreditCard, 
  CheckCircle2, 
  Save, 
  MapPin, 
  Mail, 
  Phone, 
  Key,
  ExternalLink,
  Sparkles
} from 'lucide-react';

export const SettingsView: React.FC = () => {
  const [saved, setSaved] = useState(false);
  const [dealerName, setDealerName] = useState('MotoSul Suzuki S/A');
  const [cnpj, setCnpj] = useState('00.000.000/0001-00');
  const [dealerCode, setDealerCode] = useState('SZX-4109');
  const [address, setAddress] = useState('Av. Marechal Floriano Peixoto, 4500 - Curitiba, PR');
  const [phone, setPhone] = useState('(41) 3300-8800');
  const [email, setEmail] = useState('comercial@motosulsuzuki.com.br');
  const [notificationOrders, setNotificationOrders] = useState(true);
  const [notificationLeads, setNotificationLeads] = useState(true);
  const [notificationOS, setNotificationOS] = useState(true);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-16">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <span className="text-[10px] uppercase font-bold tracking-widest text-[#3b82f6] bg-[#3b82f6]/10 px-2.5 py-0.5 rounded-full border border-[#3b82f6]/20">
            Parâmetros do Sistema
          </span>
        </div>
        <h2 className="text-[26px] md:text-[30px] font-bold text-[#fafafa] tracking-tight">
          Configurações da Concessionária
        </h2>
        <p className="text-[13px] text-neutral-500 dark:text-neutral-400">
          Parametrizações de integração com a montadora J. Toledo Suzuki e dados da loja.
        </p>
      </div>

      {saved && (
        <div className="p-3.5 bg-emerald-950/80 border border-emerald-800/60 text-emerald-400 text-[13px] font-bold rounded-2xl flex items-center gap-2 shadow-md animate-in fade-in">
          <CheckCircle2 className="w-5 h-5" />
          <span>Configurações atualizadas com sucesso no portal!</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-4">
        {/* Dealership Profile Card (Bento) */}
        <div className="bg-[#18181b] border border-[#27272a] rounded-3xl p-6 shadow-md space-y-4">
          <div className="flex items-center gap-3 pb-3 border-b border-[#27272a]">
            <div className="h-12 px-3 rounded-2xl border border-[#27272a] bg-white flex items-center justify-center shadow-inner">
              <img 
                src={DEALER_IMAGES.dealerLogo} 
                alt="Logo Suzuki" 
                className="h-7 w-auto object-contain"
              />
            </div>
            <div>
              <h3 className="text-[16px] font-bold text-[#fafafa]">Dados Cadastrais J. Toledo</h3>
              <p className="text-[12px] text-neutral-500 dark:text-neutral-400">Identificação oficial da autorizada</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-[13px]">
            <div>
              <label className="block text-[11px] font-bold text-neutral-500 dark:text-neutral-400 mb-1">Razão Social / Nome Fantasia</label>
              <input 
                type="text" 
                value={dealerName} 
                onChange={(e) => setDealerName(e.target.value)}
                className="w-full bg-white dark:bg-neutral-900 border border-[#27272a] rounded-xl p-2.5 text-white focus:border-[#3b82f6] outline-none"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-neutral-500 dark:text-neutral-400 mb-1">CNPJ</label>
              <input 
                type="text" 
                value={cnpj} 
                onChange={(e) => setCnpj(e.target.value)}
                className="w-full bg-white dark:bg-neutral-900 border border-[#27272a] rounded-xl p-2.5 text-white focus:border-[#3b82f6] outline-none"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-neutral-500 dark:text-neutral-400 mb-1">Código de Concessionário</label>
              <input 
                type="text" 
                value={dealerCode} 
                disabled
                className="w-full bg-white dark:bg-neutral-900/60 border border-[#27272a] rounded-xl p-2.5 text-neutral-500 dark:text-neutral-400 font-mono font-bold"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-neutral-500 dark:text-neutral-400 mb-1">Telefone Principal</label>
              <input 
                type="text" 
                value={phone} 
                onChange={(e) => setPhone(e.target.value)}
                className="w-full bg-white dark:bg-neutral-900 border border-[#27272a] rounded-xl p-2.5 text-white focus:border-[#3b82f6] outline-none"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-[11px] font-bold text-neutral-500 dark:text-neutral-400 mb-1">Endereço Completo</label>
              <input 
                type="text" 
                value={address} 
                onChange={(e) => setAddress(e.target.value)}
                className="w-full bg-white dark:bg-neutral-900 border border-[#27272a] rounded-xl p-2.5 text-white focus:border-[#3b82f6] outline-none"
              />
            </div>
          </div>
        </div>

        {/* Integration and Credit Line Info (Bento) */}
        <div className="bg-[#18181b] border border-[#27272a] rounded-3xl p-6 shadow-md space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-[#27272a]">
            <CreditCard className="w-5 h-5 text-[#3b82f6]" />
            <h3 className="text-[16px] font-bold text-[#fafafa]">Integração Financeira e Crédito Fábrica</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-[13px]">
            <div className="bg-white dark:bg-neutral-900/60 p-3.5 rounded-2xl border border-[#27272a]">
              <span className="text-[10px] uppercase font-bold text-neutral-500 block mb-1">Crédito Aprovado J. Toledo</span>
              <span className="text-[18px] font-bold text-emerald-400 font-tabular">R$ 1.150.000,00</span>
            </div>
            <div className="bg-white dark:bg-neutral-900/60 p-3.5 rounded-2xl border border-[#27272a]">
              <span className="text-[10px] uppercase font-bold text-neutral-500 block mb-1">Bancos Homologados</span>
              <span className="text-[14px] font-bold text-neutral-200">Santander / Safra</span>
            </div>
            <div className="bg-white dark:bg-neutral-900/60 p-3.5 rounded-2xl border border-[#27272a]">
              <span className="text-[10px] uppercase font-bold text-neutral-500 block mb-1">Status do Contrato</span>
              <span className="text-[11px] font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-800/40 px-2 py-0.5 rounded-md inline-block">Ativo & Regular</span>
            </div>
          </div>
        </div>

        {/* Notifications Settings (Bento) */}
        <div className="bg-[#18181b] border border-[#27272a] rounded-3xl p-6 shadow-md space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-[#27272a]">
            <Bell className="w-5 h-5 text-[#3b82f6]" />
            <h3 className="text-[16px] font-bold text-[#fafafa]">Preferências de Alertas</h3>
          </div>

          <div className="space-y-2 text-[13px]">
            <label className="flex items-center justify-between p-3 bg-white dark:bg-neutral-900/40 hover:bg-white dark:bg-neutral-900 border border-[#27272a] rounded-2xl cursor-pointer transition-colors">
              <div>
                <p className="font-bold text-[#fafafa]">Alertas de Rastreio de Lotes e Frete Fábrica</p>
                <p className="text-[11px] text-neutral-500 dark:text-neutral-400">Notificar quando uma carreta entrar em rota ou houver previsão de descarga</p>
              </div>
              <input 
                type="checkbox" 
                checked={notificationOrders}
                onChange={(e) => setNotificationOrders(e.target.checked)}
                className="w-4 h-4 accent-[#3b82f6] rounded"
              />
            </label>

            <label className="flex items-center justify-between p-3 bg-white dark:bg-neutral-900/40 hover:bg-white dark:bg-neutral-900 border border-[#27272a] rounded-2xl cursor-pointer transition-colors">
              <div>
                <p className="font-bold text-[#fafafa]">Novos Leads do Site Suzuki Brasil</p>
                <p className="text-[11px] text-neutral-500 dark:text-neutral-400">Receber cotações geradas por clientes de Curitiba e região</p>
              </div>
              <input 
                type="checkbox" 
                checked={notificationLeads}
                onChange={(e) => setNotificationLeads(e.target.checked)}
                className="w-4 h-4 accent-[#3b82f6] rounded"
              />
            </label>

            <label className="flex items-center justify-between p-3 bg-white dark:bg-neutral-900/40 hover:bg-white dark:bg-neutral-900 border border-[#27272a] rounded-2xl cursor-pointer transition-colors">
              <div>
                <p className="font-bold text-[#fafafa]">Alertas de Peças da Oficina (O.S.)</p>
                <p className="text-[11px] text-neutral-500 dark:text-neutral-400">Avisar mecânicos quando peças encomendadas chegarem no estoque</p>
              </div>
              <input 
                type="checkbox" 
                checked={notificationOS}
                onChange={(e) => setNotificationOS(e.target.checked)}
                className="w-4 h-4 accent-[#3b82f6] rounded"
              />
            </label>
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <button 
            type="submit"
            className="bg-[#3b82f6] hover:bg-[#2563eb] active:scale-[0.98] text-white px-6 py-2.5 rounded-xl text-[13px] font-bold flex items-center gap-2 shadow-lg shadow-blue-500/20 transition-all"
          >
            <Save className="w-4 h-4" />
            <span>Salvar Configurações</span>
          </button>
        </div>
      </form>
    </div>
  );
};
