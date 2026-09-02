import React, { useState } from 'react';
import { 
  X, 
  Trash2, 
  Plus, 
  Minus, 
  ShoppingCart, 
  Truck, 
  CreditCard, 
  AlertCircle, 
  CheckCircle2, 
  Building2, 
  ShieldCheck, 
  Flame, 
  Wrench, 
  Layers,
  ArrowRight,
  Info
} from 'lucide-react';
import { PartsCartItem, PartsOrderType, DealershipFullProfile } from '../../types';

interface PartsCartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  items: PartsCartItem[];
  onUpdateQuantity: (itemId: string, delta: number) => void;
  onRemoveItem: (itemId: string) => void;
  onClearCart: () => void;
  onSubmitOrder: (orderDetails: {
    orderType: PartsOrderType;
    freightMode: 'CIF' | 'FOB';
    paymentMethod: string;
    notes: string;
    vinApplication?: string;
  }) => void;
  dealershipProfile?: DealershipFullProfile;
}

export const PartsCartDrawer: React.FC<PartsCartDrawerProps> = ({
  isOpen,
  onClose,
  items,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
  onSubmitOrder,
  dealershipProfile
}) => {
  const [orderType, setOrderType] = useState<PartsOrderType>('reposicao');
  const [freightMode, setFreightMode] = useState<'CIF' | 'FOB'>('CIF');
  const [paymentMethod, setPaymentMethod] = useState('Boleto Faturado 30/60dd J. Toledo');
  const [notes, setNotes] = useState('');
  const [vinApplication, setVinApplication] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const totalUnits = items.reduce((acc, item) => acc + item.quantity, 0);
  const subtotalAmount = items.reduce((acc, item) => acc + item.totalPrice, 0);
  const totalMSRP = items.reduce((acc, item) => acc + (item.part.msrpPrice * item.quantity), 0);
  const estimatedMargin = totalMSRP - subtotalAmount;
  const marginPercentage = totalMSRP > 0 ? ((estimatedMargin / totalMSRP) * 100).toFixed(1) : '0';

  // Freight logic: CIF is free for orders > R$ 3,000 in replenishment, or R$ 120 for urgent VOR
  const freightCost = freightMode === 'FOB' ? 0 : (orderType === 'urgente_vor' ? 120 : (subtotalAmount >= 3000 ? 0 : 95));
  const finalTotalAmount = subtotalAmount + freightCost;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0) return;

    setIsSubmitting(true);
    setTimeout(() => {
      onSubmitOrder({
        orderType,
        freightMode,
        paymentMethod,
        notes,
        vinApplication: vinApplication.trim() || undefined
      });
      setIsSubmitting(false);
      onClose();
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div 
        onClick={onClose}
        className="fixed inset-0 bg-black/80 backdrop-blur-sm transition-opacity animate-in fade-in duration-200"
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-xl bg-white dark:bg-[#121215] border-l border-neutral-200 dark:border-[#27272a] shadow-2xl flex flex-col relative text-neutral-900 dark:text-neutral-200">
          
          {/* Drawer Header */}
          <div className="p-5 border-b border-neutral-200 dark:border-[#27272a] bg-slate-50 dark:bg-neutral-900 flex items-center justify-between gap-3 shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-600 dark:text-amber-400">
                <ShoppingCart className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-neutral-900 dark:text-white text-base sm:text-lg flex items-center gap-2">
                  Carrinho de Peças Genuínas
                </h3>
                <span className="text-xs text-neutral-500 dark:text-neutral-400">
                  {totalUnits} {totalUnits === 1 ? 'peça selecionada' : 'peças selecionadas'} ({items.length} itens distintos)
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {items.length > 0 && (
                <button
                  onClick={onClearCart}
                  className="text-neutral-500 dark:text-neutral-400 hover:text-red-500 text-xs p-1.5 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors flex items-center gap-1"
                  title="Esvaziar Carrinho"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Limpar</span>
                </button>
              )}
              <button
                onClick={onClose}
                className="w-9 h-9 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white flex items-center justify-center transition-colors border border-slate-200 dark:border-neutral-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Drawer Body (Items & Form) */}
          <div className="flex-1 overflow-y-auto p-5 space-y-5">
            {items.length === 0 ? (
              <div className="text-center py-16 space-y-3">
                <div className="w-16 h-16 rounded-full bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 flex items-center justify-center mx-auto text-neutral-600">
                  <ShoppingCart className="w-8 h-8" />
                </div>
                <h4 className="font-bold text-white text-base">Seu carrinho de peças está vazio</h4>
                <p className="text-xs text-neutral-500 dark:text-neutral-400 max-w-xs mx-auto">
                  Navegue pelo catálogo de peças (EPC), selecione as motocicletas e adicione os itens desejados.
                </p>
              </div>
            ) : (
              <>
                {/* List of Cart Items */}
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between text-xs font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider px-1">
                    <span>Peças Selecionadas</span>
                    <span>Subtotal Fábrica</span>
                  </div>

                  {items.map((item) => (
                    <div
                      key={item.id}
                      className="p-3.5 bg-white dark:bg-neutral-900/80 border border-neutral-200 dark:border-neutral-800 rounded-2xl flex items-start justify-between gap-3 hover:border-neutral-700 transition-colors"
                    >
                      <div className="flex-1 min-w-0 space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] uppercase font-bold font-mono px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">
                            {item.brand} • {item.part.partNumber}
                          </span>
                          <span className="text-[10px] text-neutral-500 dark:text-neutral-400 font-mono">
                            Ref #{item.part.ref} ({item.illustrationCode})
                          </span>
                        </div>
                        <h5 className="font-bold text-white text-xs truncate">
                          {item.part.description}
                        </h5>
                        <div className="text-[11px] text-neutral-500 dark:text-neutral-400">
                          Modelo: <span className="text-neutral-700 dark:text-neutral-300 font-bold">{item.modelName}</span>
                          {item.part.observation && <span className="ml-2 font-mono">({item.part.observation})</span>}
                        </div>
                        <div className="text-[11px] font-mono text-neutral-500 dark:text-neutral-400">
                          Unit: R$ {(item.unitPrice ?? 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          <span className="text-emerald-400 ml-2">
                            (PPS: R$ {(item.part.msrpPrice ?? (item.unitPrice * 1.5) ?? 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })})
                          </span>
                        </div>
                      </div>

                      {/* Right controls: Qtd & Total */}
                      <div className="flex flex-col items-end gap-2 shrink-0">
                        <span className="font-mono font-bold text-white text-sm">
                          R$ {item.totalPrice.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </span>

                        <div className="flex items-center gap-1">
                          <div className="flex items-center bg-neutral-50 dark:bg-neutral-950 border border-neutral-700 rounded-lg p-0.5">
                            <button
                              onClick={() => onUpdateQuantity(item.id, -1)}
                              className="w-5 h-5 flex items-center justify-center text-neutral-500 dark:text-neutral-400 hover:text-white rounded hover:bg-neutral-800"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="w-6 text-center text-xs font-mono font-bold text-white">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => onUpdateQuantity(item.id, 1)}
                              className="w-5 h-5 flex items-center justify-center text-neutral-500 dark:text-neutral-400 hover:text-white rounded hover:bg-neutral-800"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>

                          <button
                            onClick={() => onRemoveItem(item.id)}
                            className="p-1 text-neutral-500 hover:text-red-400 rounded-lg transition-colors"
                            title="Remover peça"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Order Configuration Form */}
                <form onSubmit={handleSubmit} className="space-y-4 pt-2 border-t border-neutral-200 dark:border-neutral-800">
                  
                  {/* Order Type Selection */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-neutral-700 dark:text-neutral-300 block uppercase tracking-wider">
                      Modalidade do Pedido de Peças
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      <button
                        type="button"
                        onClick={() => setOrderType('reposicao')}
                        className={`p-3 rounded-xl border text-left flex flex-col justify-between transition-colors ${
                          orderType === 'reposicao'
                            ? 'bg-blue-600/15 border-blue-500 text-white shadow-md'
                            : 'bg-white dark:bg-neutral-900/80 border-neutral-200 dark:border-neutral-800 text-neutral-500 dark:text-neutral-400 hover:text-white'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <Layers className="w-4 h-4 text-blue-400" />
                          {orderType === 'reposicao' && <CheckCircle2 className="w-3.5 h-3.5 text-blue-400" />}
                        </div>
                        <span className="font-bold text-xs">Reposição Estoque</span>
                        <span className="text-[10px] text-neutral-500 dark:text-neutral-400">Giro Programado</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setOrderType('urgente_vor')}
                        className={`p-3 rounded-xl border text-left flex flex-col justify-between transition-colors ${
                          orderType === 'urgente_vor'
                            ? 'bg-red-600/15 border-red-500 text-white shadow-md'
                            : 'bg-white dark:bg-neutral-900/80 border-neutral-200 dark:border-neutral-800 text-neutral-500 dark:text-neutral-400 hover:text-white'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <Flame className="w-4 h-4 text-red-400" />
                          {orderType === 'urgente_vor' && <CheckCircle2 className="w-3.5 h-3.5 text-red-400" />}
                        </div>
                        <span className="font-bold text-xs">Urgente VOR</span>
                        <span className="text-[10px] text-neutral-500 dark:text-neutral-400">Moto Parada (24h)</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setOrderType('garantia_pos_venda')}
                        className={`p-3 rounded-xl border text-left flex flex-col justify-between transition-colors ${
                          orderType === 'garantia_pos_venda'
                            ? 'bg-emerald-600/15 border-emerald-500 text-white shadow-md'
                            : 'bg-white dark:bg-neutral-900/80 border-neutral-200 dark:border-neutral-800 text-neutral-500 dark:text-neutral-400 hover:text-white'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <Wrench className="w-4 h-4 text-emerald-400" />
                          {orderType === 'garantia_pos_venda' && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
                        </div>
                        <span className="font-bold text-xs">Garantia / Recall</span>
                        <span className="text-[10px] text-neutral-500 dark:text-neutral-400">Pós-Venda Oficial</span>
                      </button>
                    </div>
                  </div>

                  {/* VOR or Warranty Application VIN / Chassi Input */}
                  {(orderType === 'urgente_vor' || orderType === 'garantia_pos_venda') && (
                    <div className="space-y-1.5 bg-white dark:bg-neutral-900/90 border border-neutral-200 dark:border-neutral-800 p-3 rounded-xl">
                      <label className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
                        <AlertCircle className="w-3.5 h-3.5" />
                        Chassi da Motocicleta (VIN) / Número da OS:
                      </label>
                      <input
                        type="text"
                        value={vinApplication}
                        onChange={(e) => setVinApplication(e.target.value)}
                        placeholder="Ex: 95VJS48A9P829104 ou OS-4912"
                        className="w-full bg-neutral-50 dark:bg-neutral-950 border border-neutral-700 rounded-lg px-3 py-1.5 text-xs text-white uppercase font-mono placeholder-neutral-500 focus:outline-none focus:border-amber-400"
                        required={orderType === 'urgente_vor'}
                      />
                      <span className="text-[10px] text-neutral-500 dark:text-neutral-400 block">
                        Necessário para liberação prioritária no Centro de Distribuição da fábrica.
                      </span>
                    </div>
                  )}

                  {/* Freight and Payment Mode */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-bold text-neutral-700 dark:text-neutral-300 block mb-1">
                        Frete & Logística
                      </label>
                      <select
                        value={freightMode}
                        onChange={(e) => setFreightMode(e.target.value as 'CIF' | 'FOB')}
                        className="w-full bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                      >
                        <option value="CIF">Frete CIF (Fábrica Despacha)</option>
                        <option value="FOB">Frete FOB (Retira Concessionária)</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-xs font-bold text-neutral-700 dark:text-neutral-300 block mb-1">
                        Condição de Pagamento
                      </label>
                      <select
                        value={paymentMethod}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                        className="w-full bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                      >
                        <option value="Boleto Faturado 30/60dd J. Toledo">Boleto 30/60dd J. Toledo</option>
                        <option value="Boleto Faturado 30dd">Boleto 30dd à Vista Faturado</option>
                        <option value="Débito Conta Homologada PJ">Débito em Conta Homologada</option>
                        <option value="Compensação Conta Garantia">Compensação de Verba de Garantia</option>
                      </select>
                    </div>
                  </div>

                  {/* Order Notes */}
                  <div>
                    <label className="text-xs font-bold text-neutral-700 dark:text-neutral-300 block mb-1">
                      Observações para a Fábrica (Opcional)
                    </label>
                    <textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      rows={2}
                      placeholder="Instruções de separação, contato do encarregado de peças da oficina..."
                      className="w-full bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-3 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-blue-500 resize-none"
                    />
                  </div>

                  {/* Financial Summary Box */}
                  <div className="bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-4 space-y-2 font-tabular">
                    <div className="flex justify-between text-xs text-neutral-500 dark:text-neutral-400">
                      <span>Subtotal Peças ({totalUnits} un.):</span>
                      <span className="font-mono text-white font-bold">
                        R$ {subtotalAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </span>
                    </div>

                    <div className="flex justify-between text-xs text-neutral-500 dark:text-neutral-400">
                      <span>Frete ({freightMode}):</span>
                      <span className="font-mono text-white">
                        {freightCost === 0 ? (
                          <span className="text-emerald-400 font-bold">Grátis (CIF)</span>
                        ) : (
                          `R$ ${freightCost.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
                        )}
                      </span>
                    </div>

                    <div className="flex justify-between text-xs text-emerald-400">
                      <span>Margem Estimada de Revenda (PPS):</span>
                      <span className="font-mono font-bold">
                        +R$ {estimatedMargin.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} ({marginPercentage}%)
                      </span>
                    </div>

                    <div className="border-t border-neutral-200 dark:border-neutral-800 pt-2 flex justify-between items-center">
                      <span className="font-bold text-white text-sm">Total Faturado Fábrica:</span>
                      <span className="font-black text-amber-400 text-lg font-mono">
                        R$ {finalTotalAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                  </div>

                  {/* Submit Order Button */}
                  <button
                    type="submit"
                    disabled={isSubmitting || items.length === 0}
                    className="w-full py-3.5 bg-amber-500 hover:bg-amber-400 disabled:bg-neutral-800 disabled:text-neutral-500 text-black font-extrabold rounded-2xl text-sm flex items-center justify-center gap-2 transition-all duration-200 shadow-lg shadow-amber-500/20"
                  >
                    {isSubmitting ? (
                      <span>Transmitindo para Fábrica J. Toledo...</span>
                    ) : (
                      <>
                        <span>Transmitir Pedido de Peças para a Fábrica</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>

                  <p className="text-[10px] text-center text-neutral-500">
                    Ao transmitir, o pedido será recebido pela J. Toledo para verificação de estoque nos CDs (Manaus/Jundiaí), análise de crédito e integração com o ERP Protheus.
                  </p>
                </form>
              </>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};
