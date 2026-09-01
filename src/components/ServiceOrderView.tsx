import React, { useState } from 'react';
import { ServiceOrder, ServiceOrderItem } from '../types';
import { 
  Wrench, 
  Plus, 
  Search, 
  Clock, 
  CheckCircle2, 
  AlertTriangle, 
  Printer, 
  FileText, 
  Trash2, 
  Edit3, 
  DollarSign, 
  User, 
  Phone, 
  Bike,
  Sparkles,
  Zap,
  Calendar,
  X,
  Gauge
} from 'lucide-react';

interface ServiceOrderViewProps {
  serviceOrders: ServiceOrder[];
  onAddServiceOrder: (order: Omit<ServiceOrder, 'id'>) => void;
  onUpdateServiceOrder: (order: ServiceOrder) => void;
  onDeleteServiceOrder: (id: string) => void;
  searchQuery: string;
}

export const ServiceOrderView: React.FC<ServiceOrderViewProps> = ({
  serviceOrders,
  onAddServiceOrder,
  onUpdateServiceOrder,
  onDeleteServiceOrder,
  searchQuery
}) => {
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>('todos');
  const [selectedOrder, setSelectedOrder] = useState<ServiceOrder | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);

  // Form State
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [vehicleModel, setVehicleModel] = useState('V-Strom 650XT');
  const [vehiclePlate, setVehiclePlate] = useState('');
  const [vehicleKm, setVehicleKm] = useState('18450');
  const [fuelLevel, setFuelLevel] = useState<ServiceOrder['fuelLevel']>('Tanque Cheio');
  const [symptoms, setSymptoms] = useState('');
  const [diagnosis, setDiagnosis] = useState('');
  const [items, setItems] = useState<ServiceOrderItem[]>([
    { id: '1', type: 'PEÇA', description: 'Óleo Motul 5100 10W40 (3L)', quantity: 3, unitPrice: 75, total: 225 },
    { id: '2', type: 'SERVIÇO', description: 'Mão de obra: Revisão Básica', quantity: 1, unitPrice: 250, total: 250 }
  ]);

  // New item draft inputs
  const [newItemType, setNewItemType] = useState<'PEÇA' | 'SERVIÇO'>('PEÇA');
  const [newItemDesc, setNewItemDesc] = useState('');
  const [newItemQty, setNewItemQty] = useState('1');
  const [newItemPrice, setNewItemPrice] = useState('');

  const filteredOrders = serviceOrders.filter(order => {
    const matchesSearch = 
      order.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.vehicleModel.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.vehiclePlate.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.osNumber.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = selectedStatusFilter === 'todos' || order.status === selectedStatusFilter;

    return matchesSearch && matchesStatus;
  });

  const inExecutionCount = serviceOrders.filter(o => o.status === 'em_execucao').length;
  const waitingPartsCount = serviceOrders.filter(o => o.status === 'aguardando_pecas').length;
  const finishedCount = serviceOrders.filter(o => o.status === 'finalizado').length;
  const totalWorkshopRevenue = serviceOrders.reduce((acc, o) => acc + (o.totalEstimated || o.totalAmount || 0), 0);

  const handleAddItemToForm = () => {
    if (!newItemDesc || !newItemPrice) return;
    const qty = parseInt(newItemQty) || 1;
    const price = parseFloat(newItemPrice) || 0;
    const newItem: ServiceOrderItem = {
      id: Date.now().toString(),
      type: newItemType,
      description: newItemDesc,
      quantity: qty,
      unitPrice: price,
      total: qty * price
    };
    setItems(prev => [...prev, newItem]);
    setNewItemDesc('');
    setNewItemPrice('');
    setNewItemQty('1');
  };

  const handleRemoveItem = (id: string) => {
    setItems(prev => prev.filter(i => i.id !== id));
  };

  const calculateFormTotal = () => {
    return items.reduce((acc, i) => acc + i.total, 0);
  };

  const handleCreateOrder = (e: React.FormEvent) => {
    e.preventDefault();
    const total = calculateFormTotal();
    const osNum = `OS-${Math.floor(1000 + Math.random() * 9000)}`;

    onAddServiceOrder({
      osNumber: osNum,
      createdAt: new Date().toLocaleDateString('pt-BR'),
      status: 'em_aberto',
      customerName,
      customerPhone,
      vehicleModel,
      vehiclePlate: vehiclePlate || 'ABC-1234',
      vehicleKm: parseInt(vehicleKm) || 0,
      fuelLevel,
      reportedSymptoms: symptoms,
      technicalDiagnosis: diagnosis,
      items,
      totalEstimated: total,
      totalAmount: total
    });

    setIsAddModalOpen(false);
    // Reset Form
    setCustomerName('');
    setCustomerPhone('');
    setVehiclePlate('');
    setSymptoms('');
    setDiagnosis('');
  };

  const getStatusBadge = (status: ServiceOrder['status']) => {
    switch (status) {
      case 'em_aberto':
        return <span className="bg-blue-950/60 text-blue-400 border border-blue-800/40 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider">Em Aberto</span>;
      case 'aguardando_pecas':
        return <span className="bg-amber-950/60 text-amber-400 border border-amber-800/40 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider">Aguardando Peças</span>;
      case 'em_execucao':
        return <span className="bg-purple-950/60 text-purple-400 border border-purple-800/40 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider">Em Execução</span>;
      case 'finalizado':
        return <span className="bg-emerald-950/60 text-emerald-400 border border-emerald-800/40 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider">Finalizado</span>;
      default:
        return <span className="bg-neutral-800 text-neutral-500 dark:text-neutral-400 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider">{status}</span>;
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] uppercase font-bold tracking-widest text-[#3b82f6] bg-[#3b82f6]/10 px-2.5 py-0.5 rounded-full border border-[#3b82f6]/20">
              Oficina Autorizada Suzuki
            </span>
          </div>
          <h2 className="text-[26px] md:text-[30px] font-bold text-[#fafafa] tracking-tight">
            Ordem de Serviço (O.S.)
          </h2>
          <p className="text-[13px] text-neutral-500 dark:text-neutral-400">
            Revisões periódicas de garantia, manutenções corretivas e aplicação de peças originais.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#3b82f6] hover:bg-[#2563eb] active:scale-[0.98] text-white font-bold text-[12px] transition-all shadow-md shadow-blue-500/20"
          >
            <Plus className="w-4 h-4" />
            <span>Abrir Nova O.S.</span>
          </button>
        </div>
      </div>

      {/* Bento Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-[#18181b] rounded-3xl p-5 border border-[#27272a] shadow-md flex flex-col justify-between">
          <span className="text-neutral-500 text-[10px] font-bold uppercase tracking-widest block mb-1">
            Em Execução nos Boxes
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-[26px] font-bold text-[#60a5fa] font-tabular">{inExecutionCount}</span>
            <span className="text-[11px] text-neutral-500 dark:text-neutral-400">motos</span>
          </div>
        </div>

        <div className="bg-[#18181b] rounded-3xl p-5 border border-[#27272a] shadow-md flex flex-col justify-between">
          <span className="text-neutral-500 text-[10px] font-bold uppercase tracking-widest block mb-1">
            Aguardando Peças J. Toledo
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-[26px] font-bold text-amber-400 font-tabular">{waitingPartsCount}</span>
            <span className="text-[11px] text-neutral-500 dark:text-neutral-400">ordens</span>
          </div>
        </div>

        <div className="bg-[#18181b] rounded-3xl p-5 border border-[#27272a] shadow-md flex flex-col justify-between">
          <span className="text-neutral-500 text-[10px] font-bold uppercase tracking-widest block mb-1">
            Prontas / Entregues
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-[26px] font-bold text-emerald-400 font-tabular">{finishedCount}</span>
            <span className="text-[11px] text-neutral-500 dark:text-neutral-400">finalizadas</span>
          </div>
        </div>

        <div className="bg-[#18181b] rounded-3xl p-5 border border-[#27272a] shadow-md flex flex-col justify-between">
          <span className="text-neutral-500 text-[10px] font-bold uppercase tracking-widest block mb-1">
            Faturamento da Oficina
          </span>
          <span className="text-[22px] font-bold text-[#fafafa] font-tabular">
            R$ {totalWorkshopRevenue.toLocaleString('pt-BR')}
          </span>
        </div>
      </div>

      {/* Filter Bento Bar */}
      <div className="bg-[#18181b] border border-[#27272a] rounded-2xl p-3 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          {['todos', 'em_aberto', 'em_execucao', 'aguardando_pecas', 'finalizado'].map((status) => (
            <button
              key={status}
              onClick={() => setSelectedStatusFilter(status)}
              className={`px-3 py-1.5 rounded-xl text-[12px] font-bold tracking-wide transition-all ${
                selectedStatusFilter === status
                  ? 'bg-[#3b82f6] text-white shadow-md shadow-blue-500/20'
                  : 'bg-white dark:bg-neutral-900 text-neutral-500 dark:text-neutral-400 hover:text-white border border-[#27272a]'
              }`}
            >
              {status === 'todos' ? 'Todas as Ordens' : status.replace('_', ' ').toUpperCase()}
            </button>
          ))}
        </div>

        <div className="text-[12px] text-neutral-500 dark:text-neutral-400 font-tabular px-2">
          {filteredOrders.length} ordens de serviço listadas
        </div>
      </div>

      {/* Service Orders Table Container (Bento rounded-3xl) */}
      <div className="bg-[#18181b] border border-[#27272a] rounded-3xl overflow-hidden shadow-md">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-[13px]">
            <thead>
              <tr className="bg-white dark:bg-neutral-900/80 border-b border-[#27272a] text-[10px] font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                <th className="py-3 px-4">O.S. / Data</th>
                <th className="py-3 px-4">Cliente / Contato</th>
                <th className="py-3 px-4">Motocicleta / Placa</th>
                <th className="py-3 px-4">Km / Nível Tanque</th>
                <th className="py-3 px-4 text-right">Total Estimado</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-center">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#27272a] font-tabular">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-neutral-500">
                    Nenhuma ordem de serviço encontrada com os critérios informados.
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => (
                  <tr 
                    key={order.id}
                    className="hover:bg-white dark:bg-neutral-900/50 transition-colors"
                  >
                    <td className="py-3.5 px-4 font-medium text-[#fafafa]">
                      <span className="font-bold text-[#60a5fa] font-mono">{order.osNumber}</span>
                      <span className="block text-[11px] text-neutral-500">{order.createdAt}</span>
                    </td>

                    <td className="py-3.5 px-4 text-neutral-700 dark:text-neutral-300">
                      <p className="font-bold text-[#fafafa]">{order.customerName}</p>
                      <span className="text-[11px] text-neutral-500 dark:text-neutral-400">{order.customerPhone}</span>
                    </td>

                    <td className="py-3.5 px-4 text-neutral-700 dark:text-neutral-300">
                      <p className="font-bold text-[#fafafa]">{order.vehicleModel}</p>
                      <span className="text-[11px] text-neutral-500 dark:text-neutral-400 font-mono">{order.vehiclePlate}</span>
                    </td>

                    <td className="py-3.5 px-4 text-neutral-500 dark:text-neutral-400">
                      <p className="font-bold text-neutral-200">{order.vehicleKm?.toLocaleString('pt-BR')} km</p>
                      <span className="text-[11px] text-neutral-500">{order.fuelLevel}</span>
                    </td>

                    <td className="py-3.5 px-4 text-right font-bold text-[#60a5fa]">
                      R$ {(order.totalEstimated || order.totalAmount || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </td>

                    <td className="py-3.5 px-4 text-center">
                      {getStatusBadge(order.status)}
                    </td>

                    <td className="py-3.5 px-4 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => setSelectedOrder(order)}
                          title="Detalhes da O.S."
                          className="p-1.5 hover:bg-neutral-800 text-neutral-500 dark:text-neutral-400 hover:text-white rounded-lg transition-colors"
                        >
                          <FileText className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            setSelectedOrder(order);
                            setIsPrintModalOpen(true);
                          }}
                          title="Imprimir Comprovante"
                          className="p-1.5 hover:bg-neutral-800 text-neutral-500 dark:text-neutral-400 hover:text-[#60a5fa] rounded-lg transition-colors"
                        >
                          <Printer className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onDeleteServiceOrder(order.id)}
                          title="Excluir O.S."
                          className="p-1.5 hover:bg-neutral-800 text-neutral-500 dark:text-neutral-400 hover:text-rose-400 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order Detail & Printable Voucher Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 backdrop-blur-md">
          <div className="bg-[#18181b] rounded-3xl max-w-2xl w-full p-6 md:p-8 shadow-2xl border border-[#27272a] animate-in fade-in zoom-in-95 max-h-[92vh] overflow-y-auto">
            <div className="flex justify-between items-start pb-4 border-b border-[#27272a]">
              <div>
                <span className="text-[10px] uppercase font-bold tracking-widest text-[#3b82f6]">
                  Oficina Autorizada J. Toledo Suzuki
                </span>
                <h3 className="text-[22px] font-bold text-[#fafafa]">
                  Ordem de Serviço #{selectedOrder.osNumber}
                </h3>
                <p className="text-[12px] text-neutral-500 dark:text-neutral-400">Abertura: {selectedOrder.createdAt}</p>
              </div>
              <button 
                onClick={() => setSelectedOrder(null)}
                className="text-neutral-500 dark:text-neutral-400 hover:text-white font-bold"
              >
                ✕
              </button>
            </div>

            {/* Vehicle & Customer Info Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 py-4 text-[13px]">
              <div className="bg-white dark:bg-neutral-900/60 p-3.5 rounded-2xl border border-[#27272a]">
                <span className="text-[10px] uppercase font-bold text-neutral-500 block mb-1">Dados do Cliente</span>
                <p className="font-bold text-white">{selectedOrder.customerName}</p>
                <p className="text-neutral-500 dark:text-neutral-400 text-[12px] mt-0.5">{selectedOrder.customerPhone}</p>
              </div>

              <div className="bg-white dark:bg-neutral-900/60 p-3.5 rounded-2xl border border-[#27272a]">
                <span className="text-[10px] uppercase font-bold text-neutral-500 block mb-1">Dados da Motocicleta</span>
                <p className="font-bold text-white">{selectedOrder.vehicleModel} • {selectedOrder.vehiclePlate}</p>
                <p className="text-neutral-500 dark:text-neutral-400 text-[12px] mt-0.5">{selectedOrder.vehicleKm?.toLocaleString('pt-BR')} km • {selectedOrder.fuelLevel}</p>
              </div>
            </div>

            {/* Diagnosis and Symptoms */}
            <div className="space-y-3 pb-4 text-[13px]">
              {selectedOrder.reportedSymptoms && (
                <div className="bg-white dark:bg-neutral-900/60 p-3.5 rounded-2xl border border-[#27272a]">
                  <span className="text-[10px] uppercase font-bold text-neutral-500 block mb-1">Sintomas / Relato do Cliente</span>
                  <p className="text-neutral-700 dark:text-neutral-300 text-[12px]">{selectedOrder.reportedSymptoms}</p>
                </div>
              )}

              {selectedOrder.technicalDiagnosis && (
                <div className="bg-white dark:bg-neutral-900/60 p-3.5 rounded-2xl border border-[#27272a]">
                  <span className="text-[10px] uppercase font-bold text-neutral-500 block mb-1">Diagnóstico Técnico da Oficina</span>
                  <p className="text-neutral-700 dark:text-neutral-300 text-[12px]">{selectedOrder.technicalDiagnosis}</p>
                </div>
              )}
            </div>

            {/* Items and Parts Table */}
            {selectedOrder.items && selectedOrder.items.length > 0 && (
              <div className="border border-[#27272a] rounded-2xl overflow-hidden mb-4">
                <div className="bg-white dark:bg-neutral-900 px-4 py-2 text-[10px] font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider flex justify-between">
                  <span>Item / Serviço / Peça Original</span>
                  <div className="flex gap-8">
                    <span>Qtd</span>
                    <span className="w-24 text-right">Subtotal</span>
                  </div>
                </div>

                <div className="divide-y divide-[#27272a] text-[12px] font-tabular bg-white dark:bg-neutral-900/40">
                  {selectedOrder.items.map((item, index) => (
                    <div key={index} className="p-3 flex justify-between items-center">
                      <div>
                        <span className="font-bold text-white">{item.description}</span>
                        <span className="ml-2 text-[10px] px-1.5 py-0.5 rounded bg-neutral-800 text-neutral-500 dark:text-neutral-400">
                          {item.type}
                        </span>
                      </div>
                      <div className="flex items-center gap-8">
                        <span className="text-neutral-700 dark:text-neutral-300">{item.quantity}</span>
                        <span className="w-24 text-right font-bold text-neutral-200">
                          R$ {item.total.toLocaleString('pt-BR')}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Total and Actions */}
            <div className="bg-white dark:bg-neutral-900/90 border border-[#27272a] rounded-2xl p-4 flex justify-between items-center">
              <div>
                <span className="text-[10px] uppercase font-bold text-neutral-500 block">Status da O.S.</span>
                <div className="mt-1">{getStatusBadge(selectedOrder.status)}</div>
              </div>

              <div className="text-right">
                <span className="text-[10px] uppercase font-bold text-neutral-500 block">Total Geral Estimado</span>
                <span className="text-[22px] font-bold text-[#60a5fa] font-tabular">
                  R$ {(selectedOrder.totalEstimated || selectedOrder.totalAmount || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>

            <div className="flex justify-between items-center pt-4 mt-2 border-t border-[#27272a]">
              <button
                onClick={() => {
                  window.print();
                }}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-white font-bold text-[12px] border border-neutral-700 transition-colors"
              >
                <Printer className="w-4 h-4" />
                <span>Imprimir Comprovante</span>
              </button>

              <button
                onClick={() => setSelectedOrder(null)}
                className="px-5 py-2 rounded-xl bg-[#3b82f6] hover:bg-[#2563eb] text-white font-bold text-[12px] transition-colors"
              >
                Fechar Detalhes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Service Order Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 backdrop-blur-md">
          <div className="bg-[#18181b] rounded-3xl max-w-2xl w-full p-6 md:p-8 shadow-2xl border border-[#27272a] animate-in fade-in zoom-in-95 max-h-[92vh] overflow-y-auto">
            <div className="flex justify-between items-start pb-3 border-b border-[#27272a]">
              <div>
                <span className="text-[10px] uppercase font-bold tracking-widest text-[#3b82f6]">Nova Ordem</span>
                <h3 className="text-[20px] font-bold text-[#fafafa]">Abrir Ordem de Serviço</h3>
              </div>
              <button 
                onClick={() => setIsAddModalOpen(false)}
                className="text-neutral-500 dark:text-neutral-400 hover:text-white font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateOrder} className="space-y-4 py-4 text-[13px]">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-neutral-500 dark:text-neutral-400 mb-1">Nome do Cliente *</label>
                  <input 
                    type="text" 
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="Ex: João da Silva"
                    className="w-full bg-white dark:bg-neutral-900 border border-[#27272a] rounded-xl p-2.5 text-white focus:border-[#3b82f6] outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-neutral-500 dark:text-neutral-400 mb-1">Telefone de Contato *</label>
                  <input 
                    type="text" 
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    placeholder="(41) 99876-5432"
                    className="w-full bg-white dark:bg-neutral-900 border border-[#27272a] rounded-xl p-2.5 text-white focus:border-[#3b82f6] outline-none"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-neutral-500 dark:text-neutral-400 mb-1">Modelo da Moto</label>
                  <input 
                    type="text" 
                    value={vehicleModel}
                    onChange={(e) => setVehicleModel(e.target.value)}
                    className="w-full bg-white dark:bg-neutral-900 border border-[#27272a] rounded-xl p-2.5 text-white focus:border-[#3b82f6] outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-neutral-500 dark:text-neutral-400 mb-1">Placa do Veículo</label>
                  <input 
                    type="text" 
                    value={vehiclePlate}
                    onChange={(e) => setVehiclePlate(e.target.value)}
                    placeholder="ABC-1234"
                    className="w-full bg-white dark:bg-neutral-900 border border-[#27272a] rounded-xl p-2.5 text-white uppercase focus:border-[#3b82f6] outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-neutral-500 dark:text-neutral-400 mb-1">Km Atual</label>
                  <input 
                    type="number" 
                    value={vehicleKm}
                    onChange={(e) => setVehicleKm(e.target.value)}
                    className="w-full bg-white dark:bg-neutral-900 border border-[#27272a] rounded-xl p-2.5 text-white focus:border-[#3b82f6] outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-neutral-500 dark:text-neutral-400 mb-1">Sintomas / Queixa do Cliente</label>
                <textarea 
                  value={symptoms}
                  onChange={(e) => setSymptoms(e.target.value)}
                  placeholder="Descreva o barulho, revisão de garantia ou solicitação..."
                  className="w-full bg-white dark:bg-neutral-900 border border-[#27272a] rounded-xl p-2.5 text-white h-16 resize-none focus:border-[#3b82f6] outline-none"
                />
              </div>

              {/* Items / Parts Section in Form */}
              <div className="border border-[#27272a] rounded-2xl p-3 bg-white dark:bg-neutral-900/40">
                <span className="text-[11px] font-bold text-neutral-700 dark:text-neutral-300 block mb-2">Peças e Mão de Obra</span>
                
                <div className="flex flex-wrap gap-2 mb-3">
                  <select 
                    value={newItemType}
                    onChange={(e) => setNewItemType(e.target.value as any)}
                    className="bg-neutral-800 text-white text-[12px] border border-neutral-700 rounded-xl px-2 py-1.5"
                  >
                    <option value="PEÇA">Peça</option>
                    <option value="SERVIÇO">Serviço</option>
                  </select>
                  <input 
                    type="text"
                    value={newItemDesc}
                    onChange={(e) => setNewItemDesc(e.target.value)}
                    placeholder="Descrição da peça ou serviço"
                    className="flex-1 bg-neutral-800 border border-neutral-700 rounded-xl px-3 py-1.5 text-white text-[12px] outline-none"
                  />
                  <input 
                    type="number"
                    value={newItemPrice}
                    onChange={(e) => setNewItemPrice(e.target.value)}
                    placeholder="Preço (R$)"
                    className="w-24 bg-neutral-800 border border-neutral-700 rounded-xl px-3 py-1.5 text-white text-[12px] outline-none"
                  />
                  <button
                    type="button"
                    onClick={handleAddItemToForm}
                    className="px-3 py-1.5 bg-[#3b82f6] hover:bg-[#2563eb] text-white rounded-xl text-[12px] font-bold"
                  >
                    + Adicionar
                  </button>
                </div>

                <div className="space-y-1.5 max-h-32 overflow-y-auto">
                  {items.map((i) => (
                    <div key={i.id} className="flex justify-between items-center p-2 rounded-lg bg-neutral-800/80 text-[12px]">
                      <span>{i.description} ({i.type})</span>
                      <div className="flex items-center gap-3">
                        <span className="font-bold text-neutral-200">R$ {i.total}</span>
                        <button type="button" onClick={() => handleRemoveItem(i.id)} className="text-rose-400 hover:text-rose-300">✕</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-between items-center pt-2">
                <span className="text-[14px] font-bold text-white">
                  Total O.S.: <strong className="text-[#60a5fa] font-tabular">R$ {calculateFormTotal().toLocaleString('pt-BR')}</strong>
                </span>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setIsAddModalOpen(false)}
                    className="px-4 py-2 rounded-xl text-neutral-500 dark:text-neutral-400 hover:text-white hover:bg-neutral-800 text-[12px] font-bold"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-[#3b82f6] hover:bg-[#2563eb] text-white rounded-xl text-[12px] font-bold transition-colors shadow-md shadow-blue-500/20"
                  >
                    Criar Ordem de Serviço
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
