import React, { useState } from 'react';
import { PurchaseModel } from '../types';
import { 
  CheckCircle2, 
  Truck, 
  ShoppingBag, 
  FileText, 
  Printer, 
  DollarSign, 
  ShieldCheck,
  X,
  Bike,
  Sparkles
} from 'lucide-react';

interface OrderConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  purchaseModels: PurchaseModel[];
  freightMode: string;
  totalAmount: number;
  totalUnits: number;
  onConfirmSuccess: () => void;
}

export const OrderConfirmationModal: React.FC<OrderConfirmationModalProps> = ({
  isOpen,
  onClose,
  purchaseModels,
  freightMode,
  totalAmount,
  totalUnits,
  onConfirmSuccess
}) => {
  const [confirmed, setConfirmed] = useState(false);
  const [orderNumber, setOrderNumber] = useState(`JT-2023-${Math.floor(10000 + Math.random() * 90000)}`);

  if (!isOpen) return null;

  // Extract selected items
  const selectedItems: { modelName: string; colorName: string; qty: number; unitPrice: number; total: number }[] = [];

  purchaseModels.forEach(m => {
    m.variants.forEach(v => {
      if (v.quantity > 0) {
        selectedItems.push({
          modelName: m.modelName,
          colorName: v.colorName,
          qty: v.quantity,
          unitPrice: m.factoryCost,
          total: v.quantity * m.factoryCost
        });
      }
    });
  });

  const handleConfirm = () => {
    setConfirmed(true);
    setTimeout(() => {
      onConfirmSuccess();
      setConfirmed(false);
      onClose();
    }, 2500);
  };

  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 backdrop-blur-md">
      <div className="bg-white dark:bg-[#18181b] rounded-3xl max-w-2xl w-full p-6 md:p-8 shadow-2xl border border-neutral-200 dark:border-[#27272a] animate-in fade-in zoom-in-95 max-h-[92vh] overflow-y-auto">
        {confirmed ? (
          <div className="text-center py-10 space-y-4">
            <div className="w-16 h-16 bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-200 dark:border-emerald-800/60 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center mx-auto shadow-md">
              <CheckCircle2 className="w-10 h-10 stroke-[2.5]" />
            </div>
            <h3 className="text-[24px] font-bold text-neutral-900 dark:text-[#fafafa]">Pedido Transmitido com Sucesso!</h3>
            <p className="text-[14px] text-neutral-600 dark:text-neutral-400 max-w-md mx-auto">
              O pedido de lote <strong className="text-neutral-900 dark:text-white font-mono">{orderNumber}</strong> foi gerado e transmitido ao sistema ERP da fábrica J. Toledo Suzuki.
            </p>
            <div className="p-4 bg-neutral-50 dark:bg-neutral-900/80 rounded-2xl border border-neutral-200 dark:border-[#27272a] text-[13px] font-tabular max-w-sm mx-auto space-y-1">
              <p className="text-neutral-600 dark:text-neutral-400">Total Faturado: <strong className="text-emerald-600 dark:text-emerald-400">R$ {totalAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</strong></p>
              <p className="text-neutral-600 dark:text-neutral-400">Previsão Embarque: <strong className="text-blue-600 dark:text-[#60a5fa]">Em até 5 dias úteis</strong></p>
            </div>
          </div>
        ) : (
          <div className="space-y-5">
            {/* Modal Header */}
            <div className="flex justify-between items-start pb-4 border-b border-neutral-200 dark:border-[#27272a]">
              <div>
                <span className="text-[10px] font-bold text-blue-600 dark:text-[#3b82f6] uppercase tracking-widest block mb-0.5">
                  J. Toledo Suzuki Motos do Brasil • Pedido Concessionária
                </span>
                <h3 className="text-[22px] font-bold text-neutral-900 dark:text-[#fafafa]">
                  Confirmar Pedido de Fábrica
                </h3>
                <p className="text-[12px] text-neutral-600 dark:text-neutral-400">Concessionária: MotoSul Suzuki Curitiba (SZX-4109)</p>
              </div>
              <button 
                onClick={onClose}
                className="text-neutral-400 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-white font-bold p-1 text-lg rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
              >
                ✕
              </button>
            </div>

            {/* Order Items Table (Bento) */}
            <div className="border border-neutral-200 dark:border-[#27272a] rounded-2xl overflow-hidden shadow-inner">
              <div className="bg-neutral-100 dark:bg-neutral-900 px-4 py-2.5 border-b border-neutral-200 dark:border-[#27272a] text-[10px] font-bold text-neutral-600 dark:text-neutral-400 uppercase tracking-wider flex justify-between">
                <span>Motocicleta / Versão</span>
                <div className="flex gap-8">
                  <span>Qtd</span>
                  <span className="w-24 text-right">Subtotal</span>
                </div>
              </div>

              <div className="divide-y divide-neutral-200 dark:divide-[#27272a] max-h-52 overflow-y-auto text-[13px] font-tabular bg-white dark:bg-neutral-900/40">
                {selectedItems.length === 0 ? (
                  <div className="p-6 text-center text-neutral-500">
                    Nenhuma motocicleta com quantidade selecionada.
                  </div>
                ) : (
                  selectedItems.map((item, index) => (
                    <div key={index} className="p-3.5 flex justify-between items-center hover:bg-neutral-50 dark:hover:bg-neutral-900/60 transition-colors">
                      <div>
                        <p className="font-bold text-neutral-900 dark:text-[#fafafa]">{item.modelName}</p>
                        <p className="text-[11px] text-neutral-600 dark:text-neutral-400">{item.colorName}</p>
                      </div>
                      <div className="flex items-center gap-8">
                        <span className="font-bold text-neutral-800 dark:text-neutral-200">{item.qty} un.</span>
                        <span className="w-24 text-right font-bold text-blue-600 dark:text-[#60a5fa]">
                          R$ {item.total.toLocaleString('pt-BR')}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Freight & Commercial conditions */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[13px]">
              <div className="bg-neutral-50 dark:bg-neutral-900/60 p-3.5 rounded-2xl border border-neutral-200 dark:border-[#27272a]">
                <span className="text-[10px] font-bold text-neutral-500 dark:text-neutral-400 uppercase block mb-1">
                  Condições de Logística
                </span>
                <p className="font-bold text-neutral-900 dark:text-white flex items-center gap-1.5">
                  <Truck className="w-4 h-4 text-blue-600 dark:text-[#3b82f6]" />
                  {freightMode}
                </p>
                <p className="text-[11px] text-neutral-600 dark:text-neutral-400 mt-1">Entrega no pátio da concessionária em Curitiba/PR.</p>
              </div>

              <div className="bg-neutral-50 dark:bg-neutral-900/60 p-3.5 rounded-2xl border border-neutral-200 dark:border-[#27272a]">
                <span className="text-[10px] font-bold text-neutral-500 dark:text-neutral-400 uppercase block mb-1">
                  Forma de Faturamento
                </span>
                <p className="font-bold text-neutral-900 dark:text-white flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  Crédito Comercial J. Toledo (30/60/90 DDL)
                </p>
                <p className="text-[11px] text-neutral-600 dark:text-neutral-400 mt-1">Garantia integral de fábrica e nota fiscal direta.</p>
              </div>
            </div>

            {/* Total Box */}
            <div className="bg-neutral-50 dark:bg-neutral-900/90 border border-neutral-200 dark:border-[#27272a] rounded-2xl p-4 flex justify-between items-center">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 dark:text-[#3b82f6] block">
                  Total Acumulado ({totalUnits} unidades)
                </span>
                <span className="text-[12px] text-neutral-600 dark:text-neutral-400">Sem incidência de frete adicional</span>
              </div>
              <span className="text-[26px] font-bold text-blue-600 dark:text-[#60a5fa] font-tabular">
                R$ {totalAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </span>
            </div>

            {/* Modal Actions */}
            <div className="flex justify-between items-center pt-2">
              <button 
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 rounded-xl border border-neutral-300 dark:border-[#27272a] font-bold text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-[13px] transition-colors"
              >
                Voltar e Ajustar
              </button>

              <button 
                type="button"
                onClick={handleConfirm}
                disabled={totalUnits === 0}
                className={`
                  px-6 py-2.5 rounded-xl font-bold text-[13px] flex items-center gap-2 transition-all shadow-lg
                  ${totalUnits > 0
                    ? 'bg-blue-600 hover:bg-blue-500 active:scale-[0.98] text-white shadow-blue-500/20'
                    : 'bg-neutral-200 dark:bg-neutral-800 text-neutral-400 dark:text-neutral-500 cursor-not-allowed border border-neutral-300 dark:border-neutral-700'
                  }
                `}
              >
                <ShoppingBag className="w-4 h-4" />
                <span>Confirmar e Transmitir Pedido</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
