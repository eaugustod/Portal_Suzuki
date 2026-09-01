import React, { useState } from 'react';
import { PipelineCard, InteractionLog, RecentSale } from '../types';
import { 
  Phone, 
  MessageSquare, 
  Plus, 
  Clock, 
  CheckCircle2, 
  DollarSign, 
  TrendingUp, 
  UserPlus, 
  ChevronRight, 
  AlertCircle,
  FileCheck,
  Send,
  Sparkles,
  Calendar,
  X,
  PhoneCall,
  Mail
} from 'lucide-react';

interface SalesCrmViewProps {
  pipelineCards: PipelineCard[];
  onAddLead: (lead: Omit<PipelineCard, 'id'>) => void;
  onMoveCard: (cardId: string, targetType: PipelineCard['type']) => void;
  interactions: InteractionLog[];
  onAddInteraction: (interaction: Omit<InteractionLog, 'id'>) => void;
  recentSales: RecentSale[];
}

export const SalesCrmView: React.FC<SalesCrmViewProps> = ({
  pipelineCards,
  onAddLead,
  onMoveCard,
  interactions,
  onAddInteraction,
  recentSales
}) => {
  const [selectedCard, setSelectedCard] = useState<PipelineCard | null>(null);
  const [isAddLeadModalOpen, setIsAddLeadModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'kanban' | 'interactions'>('kanban');

  // Form State for new Lead
  const [leadCustomer, setLeadCustomer] = useState('');
  const [leadVehicle, setLeadVehicle] = useState('GSX-S1000GX');
  const [leadValue, setLeadValue] = useState('98800');
  const [leadPhone, setLeadPhone] = useState('');
  const [leadEmail, setLeadEmail] = useState('');
  const [leadNotes, setLeadNotes] = useState('');

  // Form for quick interaction note
  const [interactionTitle, setInteractionTitle] = useState('');
  const [interactionDesc, setInteractionDesc] = useState('');
  const [interactionType, setInteractionType] = useState<'call' | 'whatsapp' | 'lead' | 'email'>('whatsapp');

  const columns: { id: PipelineCard['type']; label: string; dotColor: string }[] = [
    { id: 'lead', label: '1. Novos Leads', dotColor: 'bg-[#3b82f6]' },
    { id: 'proposta', label: '2. Proposta / Simulação', dotColor: 'bg-amber-400' },
    { id: 'documentacao', label: '3. Análise Crédito', dotColor: 'bg-purple-400' },
    { id: 'entrega', label: '4. Pronto p/ Entrega', dotColor: 'bg-emerald-400' }
  ];

  const handleCreateLead = (e: React.FormEvent) => {
    e.preventDefault();
    onAddLead({
      customerName: leadCustomer,
      type: 'lead',
      vehicleInterest: leadVehicle,
      value: parseFloat(leadValue) || 0,
      dateBadge: 'Hoje',
      phone: leadPhone,
      email: leadEmail,
      notes: leadNotes
    });
    setIsAddLeadModalOpen(false);
    setLeadCustomer('');
    setLeadPhone('');
    setLeadEmail('');
    setLeadNotes('');
  };

  const handleCreateInteraction = (e: React.FormEvent) => {
    e.preventDefault();
    if (!interactionTitle) return;
    onAddInteraction({
      type: interactionType,
      title: interactionTitle,
      time: 'Agora',
      description: interactionDesc
    });
    setInteractionTitle('');
    setInteractionDesc('');
  };

  const totalPipelineValue = pipelineCards.reduce((acc, c) => acc + c.value, 0);

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] uppercase font-bold tracking-widest text-[#3b82f6] bg-[#3b82f6]/10 px-2.5 py-0.5 rounded-full border border-[#3b82f6]/20">
              Pipeline Comercial Dealer
            </span>
          </div>
          <h2 className="text-[26px] md:text-[30px] font-bold text-[#fafafa] tracking-tight">
            Gestão de Vendas & CRM
          </h2>
          <p className="text-[13px] text-neutral-500 dark:text-neutral-400">
            Funil de atendimento ao cliente, simulação bancária e entregas técnicas.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setIsAddLeadModalOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#3b82f6] hover:bg-[#2563eb] active:scale-[0.98] text-white font-bold text-[12px] transition-all shadow-md shadow-blue-500/20"
          >
            <UserPlus className="w-4 h-4" />
            <span>Novo Lead</span>
          </button>
        </div>
      </div>

      {/* Bento Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-[#18181b] rounded-3xl p-5 border border-[#27272a] shadow-md flex flex-col justify-between">
          <span className="text-neutral-500 text-[10px] font-bold uppercase tracking-widest block mb-1">
            Leads em Atendimento
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-[26px] font-bold text-[#fafafa] font-tabular">{pipelineCards.length}</span>
            <span className="text-[11px] text-neutral-500 dark:text-neutral-400">oportunidades</span>
          </div>
        </div>

        <div className="bg-[#18181b] rounded-3xl p-5 border border-[#27272a] shadow-md flex flex-col justify-between">
          <span className="text-neutral-500 text-[10px] font-bold uppercase tracking-widest block mb-1">
            Valor em Negociação
          </span>
          <span className="text-[22px] font-bold text-[#60a5fa] font-tabular">
            R$ {totalPipelineValue.toLocaleString('pt-BR')}
          </span>
        </div>

        <div className="bg-[#18181b] rounded-3xl p-5 border border-[#27272a] shadow-md flex flex-col justify-between">
          <span className="text-neutral-500 text-[10px] font-bold uppercase tracking-widest block mb-1">
            Taxa de Conversão
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-[26px] font-bold text-emerald-400 font-tabular">28.4%</span>
            <span className="text-[11px] text-neutral-500 dark:text-neutral-400">média PR</span>
          </div>
        </div>

        <div className="bg-[#18181b] rounded-3xl p-5 border border-[#27272a] shadow-md flex flex-col justify-between">
          <span className="text-neutral-500 text-[10px] font-bold uppercase tracking-widest block mb-1">
            Vendas Faturadas (Mês)
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-[26px] font-bold text-[#fafafa] font-tabular">35</span>
            <span className="text-[11px] text-neutral-500 dark:text-neutral-400">motos</span>
          </div>
        </div>
      </div>

      {/* Main CRM Layout: Kanban + Right Bento Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* Kanban Board (3 cols) */}
        <div className="lg:col-span-3 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
          {columns.map((col) => {
            const cardsInCol = pipelineCards.filter(c => c.type === col.id);
            const colTotal = cardsInCol.reduce((acc, c) => acc + c.value, 0);

            return (
              <div 
                key={col.id}
                className="bg-[#18181b] border border-[#27272a] rounded-3xl p-3.5 flex flex-col shadow-md min-h-[480px]"
              >
                {/* Column Header */}
                <div className="flex justify-between items-center pb-3 border-b border-[#27272a] mb-3">
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${col.dotColor}`}></div>
                    <h3 className="text-[12px] font-bold text-[#fafafa]">{col.label}</h3>
                  </div>
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-neutral-800 text-neutral-700 dark:text-neutral-300 font-tabular">
                    {cardsInCol.length}
                  </span>
                </div>

                {/* Cards List */}
                <div className="flex-1 space-y-2.5 overflow-y-auto">
                  {cardsInCol.map((card) => (
                    <div
                      key={card.id}
                      onClick={() => setSelectedCard(card)}
                      className="bg-white dark:bg-neutral-900/80 border border-[#27272a] rounded-2xl p-3 shadow-xs hover:border-[#3b82f6]/60 hover:bg-white dark:bg-neutral-900 transition-all cursor-pointer group"
                    >
                      <div className="flex justify-between items-start mb-1.5">
                        <p className="text-[13px] font-bold text-[#fafafa] group-hover:text-[#60a5fa] transition-colors">
                          {card.customerName}
                        </p>
                        <span className="text-[10px] text-neutral-500 font-mono">{card.dateBadge}</span>
                      </div>

                      <p className="text-[12px] font-semibold text-neutral-700 dark:text-neutral-300">
                        {card.vehicleInterest}
                      </p>

                      <div className="flex justify-between items-center mt-2.5 pt-2 border-t border-[#27272a] text-[11px]">
                        <span className="font-bold text-[#60a5fa] font-tabular">
                          R$ {card.value.toLocaleString('pt-BR')}
                        </span>
                        
                        {/* Move stage mini button */}
                        <div className="flex gap-1">
                          {col.id === 'lead' && (
                            <button 
                              onClick={(e) => { e.stopPropagation(); onMoveCard(card.id, 'proposta'); }}
                              className="text-[10px] text-neutral-500 dark:text-neutral-400 hover:text-white px-1.5 py-0.5 bg-neutral-800 rounded border border-neutral-700"
                            >
                              Proposta →
                            </button>
                          )}
                          {col.id === 'proposta' && (
                            <button 
                              onClick={(e) => { e.stopPropagation(); onMoveCard(card.id, 'documentacao'); }}
                              className="text-[10px] text-neutral-500 dark:text-neutral-400 hover:text-white px-1.5 py-0.5 bg-neutral-800 rounded border border-neutral-700"
                            >
                              Crédito →
                            </button>
                          )}
                          {col.id === 'documentacao' && (
                            <button 
                              onClick={(e) => { e.stopPropagation(); onMoveCard(card.id, 'entrega'); }}
                              className="text-[10px] text-neutral-500 dark:text-neutral-400 hover:text-white px-1.5 py-0.5 bg-neutral-800 rounded border border-neutral-700"
                            >
                              Entrega →
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Column total footer */}
                <div className="mt-3 pt-2 border-t border-[#27272a] text-[11px] text-neutral-500 font-tabular flex justify-between">
                  <span>Subtotal:</span>
                  <span className="font-bold text-neutral-700 dark:text-neutral-300">R$ {colTotal.toLocaleString('pt-BR')}</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Right Bento Sidebar: Recent Sales & Quick Interactions */}
        <div className="space-y-4">
          {/* Recent Sales Box */}
          <div className="bg-[#18181b] border border-[#27272a] rounded-3xl p-5 shadow-md">
            <div className="flex justify-between items-center mb-3">
              <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-500">
                Últimas Vendas Fechadas
              </span>
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
            </div>

            <div className="space-y-2.5 text-[12px] font-tabular">
              {recentSales.map((sale) => (
                <div key={sale.id} className="p-2.5 rounded-xl bg-white dark:bg-neutral-900/60 border border-[#27272a] flex justify-between items-center">
                  <div>
                    <p className="font-bold text-[#fafafa]">{sale.model}</p>
                    <p className="text-[11px] text-neutral-500 dark:text-neutral-400">{sale.client} • {sale.timeAgo}</p>
                  </div>
                  <span className="font-bold text-emerald-400">
                    R$ {sale.price.toLocaleString('pt-BR')}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Interaction Feed */}
          <div className="bg-[#18181b] border border-[#27272a] rounded-3xl p-5 shadow-md">
            <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-500 block mb-3">
              Feed de Interações
            </span>

            <div className="space-y-2.5 max-h-64 overflow-y-auto pr-1 text-[12px]">
              {interactions.map((int) => (
                <div key={int.id} className="p-2.5 rounded-xl bg-white dark:bg-neutral-900/60 border border-[#27272a]">
                  <div className="flex justify-between items-center text-[11px] mb-1">
                    <span className="font-bold text-[#60a5fa]">{int.title}</span>
                    <span className="text-neutral-500 font-mono">{int.time}</span>
                  </div>
                  <p className="text-neutral-500 dark:text-neutral-400 text-[11px] leading-relaxed">{int.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Lead Detail Modal */}
      {selectedCard && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 backdrop-blur-md">
          <div className="bg-[#18181b] rounded-3xl max-w-lg w-full p-6 md:p-7 shadow-2xl border border-[#27272a] animate-in fade-in zoom-in-95">
            <div className="flex justify-between items-start pb-4 border-b border-[#27272a]">
              <div>
                <span className="text-[10px] uppercase font-bold tracking-widest text-[#3b82f6]">Oportunidade CRM</span>
                <h3 className="text-[20px] font-bold text-[#fafafa]">{selectedCard.customerName}</h3>
                <p className="text-[12px] text-neutral-500 dark:text-neutral-400">Interesse: <strong className="text-white">{selectedCard.vehicleInterest}</strong></p>
              </div>
              <button 
                onClick={() => setSelectedCard(null)}
                className="text-neutral-500 dark:text-neutral-400 hover:text-white font-bold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 py-4 text-[13px]">
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-white dark:bg-neutral-900/60 p-3 rounded-2xl border border-[#27272a]">
                  <span className="text-[10px] uppercase font-bold text-neutral-500 block">Telefone / WhatsApp</span>
                  <p className="font-bold text-white mt-0.5">{selectedCard.phone || '(41) 99876-0000'}</p>
                </div>
                <div className="bg-white dark:bg-neutral-900/60 p-3 rounded-2xl border border-[#27272a]">
                  <span className="text-[10px] uppercase font-bold text-neutral-500 block">Valor da Proposta</span>
                  <p className="font-bold text-[#60a5fa] mt-0.5 font-tabular">R$ {selectedCard.value.toLocaleString('pt-BR')}</p>
                </div>
              </div>

              {selectedCard.notes && (
                <div className="bg-white dark:bg-neutral-900/60 p-3.5 rounded-2xl border border-[#27272a]">
                  <span className="text-[10px] uppercase font-bold text-neutral-500 block mb-1">Notas do Vendedor</span>
                  <p className="text-neutral-700 dark:text-neutral-300 text-[12px] leading-relaxed">{selectedCard.notes}</p>
                </div>
              )}

              {/* Move stage dropdown in modal */}
              <div>
                <label className="block text-[11px] font-bold text-neutral-500 dark:text-neutral-400 mb-1">Alterar Etapa do Funil</label>
                <select 
                  value={selectedCard.type}
                  onChange={(e) => {
                    onMoveCard(selectedCard.id, e.target.value as any);
                    setSelectedCard({ ...selectedCard, type: e.target.value as any });
                  }}
                  className="w-full bg-white dark:bg-neutral-900 border border-[#27272a] rounded-xl p-2.5 text-white focus:border-[#3b82f6] outline-none"
                >
                  <option value="lead">1. Novos Leads</option>
                  <option value="proposta">2. Proposta / Simulação</option>
                  <option value="documentacao">3. Análise Crédito</option>
                  <option value="entrega">4. Pronto p/ Entrega</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button 
                onClick={() => setSelectedCard(null)}
                className="bg-[#3b82f6] hover:bg-[#2563eb] text-white px-5 py-2 rounded-xl font-bold text-[12px] transition-colors"
              >
                Concluir
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Lead Modal */}
      {isAddLeadModalOpen && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 backdrop-blur-md">
          <div className="bg-[#18181b] rounded-3xl max-w-md w-full p-6 shadow-2xl border border-[#27272a] animate-in fade-in zoom-in-95">
            <div className="flex justify-between items-start pb-3 border-b border-[#27272a]">
              <div>
                <span className="text-[10px] uppercase font-bold tracking-widest text-[#3b82f6]">Novo Lead</span>
                <h3 className="text-[18px] font-bold text-[#fafafa]">Cadastrar Oportunidade</h3>
              </div>
              <button 
                onClick={() => setIsAddLeadModalOpen(false)}
                className="text-neutral-500 dark:text-neutral-400 hover:text-white font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateLead} className="space-y-3.5 py-3.5 text-[13px]">
              <div>
                <label className="block text-[11px] font-bold text-neutral-500 dark:text-neutral-400 mb-1">Nome do Cliente *</label>
                <input 
                  type="text" 
                  value={leadCustomer}
                  onChange={(e) => setLeadCustomer(e.target.value)}
                  placeholder="Ex: Marcos Souza"
                  className="w-full bg-white dark:bg-neutral-900 border border-[#27272a] rounded-xl p-2.5 text-white focus:border-[#3b82f6] outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-neutral-500 dark:text-neutral-400 mb-1">Moto de Interesse</label>
                  <input 
                    type="text" 
                    value={leadVehicle}
                    onChange={(e) => setLeadVehicle(e.target.value)}
                    className="w-full bg-white dark:bg-neutral-900 border border-[#27272a] rounded-xl p-2.5 text-white focus:border-[#3b82f6] outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-neutral-500 dark:text-neutral-400 mb-1">Valor Estimado (R$)</label>
                  <input 
                    type="number" 
                    value={leadValue}
                    onChange={(e) => setLeadValue(e.target.value)}
                    className="w-full bg-white dark:bg-neutral-900 border border-[#27272a] rounded-xl p-2.5 text-white focus:border-[#3b82f6] outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-neutral-500 dark:text-neutral-400 mb-1">Telefone / WhatsApp</label>
                <input 
                  type="text" 
                  value={leadPhone}
                  onChange={(e) => setLeadPhone(e.target.value)}
                  placeholder="(41) 98888-7766"
                  className="w-full bg-white dark:bg-neutral-900 border border-[#27272a] rounded-xl p-2.5 text-white focus:border-[#3b82f6] outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-neutral-500 dark:text-neutral-400 mb-1">Observações da Negociação</label>
                <textarea 
                  value={leadNotes}
                  onChange={(e) => setLeadNotes(e.target.value)}
                  placeholder="Pretensão de entrada, moto usada na troca, prazo..."
                  className="w-full bg-white dark:bg-neutral-900 border border-[#27272a] rounded-xl p-2.5 text-white h-20 resize-none focus:border-[#3b82f6] outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddLeadModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-neutral-500 dark:text-neutral-400 hover:text-white hover:bg-neutral-800 text-[12px] font-bold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#3b82f6] hover:bg-[#2563eb] text-white rounded-xl text-[12px] font-bold transition-colors shadow-md shadow-blue-500/20"
                >
                  Salvar Lead
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
