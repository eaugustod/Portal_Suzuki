import React, { useState } from 'react';
import { 
  HelpCircle, 
  PhoneCall, 
  MessageSquare, 
  FileText, 
  ExternalLink, 
  CheckCircle2, 
  Send,
  LifeBuoy,
  Sparkles
} from 'lucide-react';

export const SupportView: React.FC = () => {
  const [ticketSubject, setTicketSubject] = useState('');
  const [ticketCategory, setTicketCategory] = useState('Garantia e Peças J. Toledo');
  const [ticketDesc, setTicketDesc] = useState('');
  const [ticketSent, setTicketSent] = useState(false);

  const handleSubmitTicket = (e: React.FormEvent) => {
    e.preventDefault();
    setTicketSent(true);
    setTimeout(() => {
      setTicketSent(false);
      setTicketSubject('');
      setTicketDesc('');
    }, 2800);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-16">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <span className="text-[10px] uppercase font-bold tracking-widest text-[#3b82f6] bg-[#3b82f6]/10 px-2.5 py-0.5 rounded-full border border-[#3b82f6]/20">
            Canal Direto Montadora
          </span>
        </div>
        <h2 className="text-[26px] md:text-[30px] font-bold text-[#fafafa] tracking-tight">
          Central de Suporte ao Concessionário
        </h2>
        <p className="text-[13px] text-neutral-500 dark:text-neutral-400">
          Canais diretos com a fábrica J. Toledo Suzuki Motos do Brasil.
        </p>
      </div>

      {/* Support Cards (Bento) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-[#18181b] border border-[#27272a] rounded-3xl p-5 shadow-md flex flex-col justify-between hover:border-[#3b82f6]/50 transition-all">
          <div>
            <div className="w-10 h-10 rounded-2xl bg-neutral-800 text-[#60a5fa] flex items-center justify-center mb-3 border border-[#27272a]">
              <PhoneCall className="w-5 h-5" />
            </div>
            <h3 className="text-[15px] font-bold text-[#fafafa]">Plantão Comercial Fábrica</h3>
            <p className="text-[12px] text-neutral-500 dark:text-neutral-400 mt-1 leading-relaxed">
              Atendimento exclusivo para pedidos de lote, faturamento e concessões especiais.
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-[#27272a] text-[13px] font-bold text-[#60a5fa] font-mono">
            0800 707 8020
          </div>
        </div>

        <div className="bg-[#18181b] border border-[#27272a] rounded-3xl p-5 shadow-md flex flex-col justify-between hover:border-[#3b82f6]/50 transition-all">
          <div>
            <div className="w-10 h-10 rounded-2xl bg-neutral-800 text-emerald-400 flex items-center justify-center mb-3 border border-[#27272a]">
              <LifeBuoy className="w-5 h-5" />
            </div>
            <h3 className="text-[15px] font-bold text-[#fafafa]">Engenharia & Garantia</h3>
            <p className="text-[12px] text-neutral-500 dark:text-neutral-400 mt-1 leading-relaxed">
              Homologação de garantias, recalls e manuais de serviço para a oficina.
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-[#27272a] text-[13px] font-bold text-[#60a5fa]">
            garantia@jtoledo.com.br
          </div>
        </div>

        <div className="bg-[#18181b] border border-[#27272a] rounded-3xl p-5 shadow-md flex flex-col justify-between hover:border-[#3b82f6]/50 transition-all">
          <div>
            <div className="w-10 h-10 rounded-2xl bg-neutral-800 text-purple-400 flex items-center justify-center mb-3 border border-[#27272a]">
              <FileText className="w-5 h-5" />
            </div>
            <h3 className="text-[15px] font-bold text-[#fafafa]">Tabelas e Circulares</h3>
            <p className="text-[12px] text-neutral-500 dark:text-neutral-400 mt-1 leading-relaxed">
              Catálogos oficiais 2024, tabelas de PPS e campanhas de marketing promocional.
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-[#27272a] text-[13px] font-bold text-[#60a5fa]">
            Download Circulares 2024
          </div>
        </div>
      </div>

      {/* Ticket Opening Form (Bento) */}
      <div className="bg-[#18181b] border border-[#27272a] rounded-3xl p-6 shadow-md">
        <h3 className="text-[18px] font-bold text-[#fafafa] mb-1">Abrir Chamado com a Montadora</h3>
        <p className="text-[13px] text-neutral-500 dark:text-neutral-400 mb-4">
          Envie sua dúvida ou solicitação técnica para a equipe de pós-venda J. Toledo.
        </p>

        {ticketSent ? (
          <div className="p-6 bg-emerald-950/70 border border-emerald-800/60 text-emerald-400 rounded-2xl text-center">
            <CheckCircle2 className="w-12 h-12 mx-auto mb-2" />
            <h4 className="text-[18px] font-bold text-white">Chamado Aberto com Sucesso!</h4>
            <p className="text-[13px] mt-1 text-emerald-300">Protocolo #JT-2023-98432 registrado. Resposta estimada em 2 horas.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmitTicket} className="space-y-4 text-[13px]">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-bold text-neutral-500 dark:text-neutral-400 mb-1">Assunto da Solicitação *</label>
                <input 
                  type="text" 
                  value={ticketSubject}
                  onChange={(e) => setTicketSubject(e.target.value)}
                  placeholder="Ex: Liberação de cota extra V-Strom 800DE"
                  className="w-full bg-white dark:bg-neutral-900 border border-[#27272a] rounded-xl p-2.5 text-white focus:border-[#3b82f6] outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-neutral-500 dark:text-neutral-400 mb-1">Departamento</label>
                <select 
                  value={ticketCategory}
                  onChange={(e) => setTicketCategory(e.target.value)}
                  className="w-full bg-white dark:bg-neutral-900 border border-[#27272a] rounded-xl p-2.5 text-white focus:border-[#3b82f6] outline-none"
                >
                  <option value="Comercial">Comercial & Faturamento de Motos</option>
                  <option value="Garantia e Peças J. Toledo">Garantia e Peças J. Toledo</option>
                  <option value="Logística e Frete">Logística, Carretas e Prazos</option>
                  <option value="TI e Portal">TI, Acessos e Sistema Dealer</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-neutral-500 dark:text-neutral-400 mb-1">Detalhes e Informações Adicionais *</label>
              <textarea 
                value={ticketDesc}
                onChange={(e) => setTicketDesc(e.target.value)}
                placeholder="Descreva o caso com número de chassi, cliente ou detalhe do pedido..."
                className="w-full bg-white dark:bg-neutral-900 border border-[#27272a] rounded-xl p-3 h-28 resize-none text-white focus:border-[#3b82f6] outline-none"
                required
              />
            </div>

            <div className="flex justify-end">
              <button 
                type="submit"
                className="bg-[#3b82f6] hover:bg-[#2563eb] active:scale-[0.98] text-white px-6 py-2.5 rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-blue-500/20 transition-all"
              >
                <Send className="w-4 h-4" />
                <span>Enviar Chamado</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
