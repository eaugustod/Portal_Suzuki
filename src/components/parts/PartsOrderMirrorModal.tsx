import React, { useRef } from 'react';
import { 
  X, 
  Printer, 
  Download, 
  CheckCircle2, 
  Clock, 
  Building2, 
  ShieldCheck, 
  Truck, 
  FileText, 
  Package, 
  Database, 
  Layers, 
  MapPin, 
  AlertCircle,
  QrCode
} from 'lucide-react';
import { PartsOrder, DealershipFullProfile } from '../../types';

interface PartsOrderMirrorModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: PartsOrder;
  dealershipProfile?: DealershipFullProfile;
  isMontadora?: boolean;
  onApproveStock?: (orderId: string) => void;
  onApproveCredit?: (orderId: string) => void;
  onIntegrateProtheus?: (orderId: string) => void;
  onDispatchOrder?: (orderId: string) => void;
}

export const PartsOrderMirrorModal: React.FC<PartsOrderMirrorModalProps> = ({
  isOpen,
  onClose,
  order,
  dealershipProfile,
  isMontadora = false,
  onApproveStock,
  onApproveCredit,
  onIntegrateProtheus,
  onDispatchOrder
}) => {
  const printRef = useRef<HTMLDivElement>(null);

  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  const getStatusBadge = () => {
    switch (order.status) {
      case 'integrado_protheus':
      case 'faturado_despachado':
        return {
          label: order.status === 'faturado_despachado' ? 'Faturado & Despachado' : 'Integrado TOTVS Protheus ERP',
          bg: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
          icon: CheckCircle2
        };
      case 'em_separacao_cd':
        return {
          label: 'Em Separação no CD Fábrica',
          bg: 'bg-blue-500/15 text-blue-400 border-blue-500/30',
          icon: Package
        };
      case 'aprovado_fabrica':
      case 'em_analise_credito':
        return {
          label: 'Crédito Aprovado / Em Separação',
          bg: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
          icon: Clock
        };
      case 'aguardando_analise':
      default:
        return {
          label: 'Aguardando Análise Fábrica',
          bg: 'bg-purple-500/15 text-purple-400 border-purple-500/30',
          icon: Clock
        };
    }
  };

  const statusInfo = getStatusBadge();
  const StatusIcon = statusInfo.icon;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
      <div className="bg-[#121215] border border-[#27272a] rounded-2xl w-full max-w-4xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Modal Top Bar */}
        <div className="p-4 sm:p-5 bg-[#18181b] border-b border-[#27272a] flex items-center justify-between gap-3 shrink-0 print:hidden">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-white text-base sm:text-lg font-mono">
                  {order.orderNumber}
                </h3>
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border flex items-center gap-1.5 ${statusInfo.bg}`}>
                  <StatusIcon className="w-3.5 h-3.5" />
                  {statusInfo.label}
                </span>
              </div>
              <p className="text-xs text-neutral-400">
                Espelho Oficial B2B • Transmitido em {order.createdAt}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-3 py-2 bg-neutral-800 hover:bg-neutral-700 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors border border-neutral-700"
            >
              <Printer className="w-4 h-4 text-neutral-300" />
              <span className="hidden sm:inline">Imprimir / Salvar PDF</span>
            </button>
            <button
              onClick={onClose}
              className="w-9 h-9 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-400 hover:text-white flex items-center justify-center transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Scrollable Content (Printable Mirror) */}
        <div ref={printRef} className="flex-1 overflow-y-auto p-5 sm:p-7 space-y-6 text-neutral-200 bg-[#0f0f12]">
          
          {/* Printable Header */}
          <div className="border-b border-neutral-800 pb-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <div className="text-xs font-mono uppercase tracking-widest text-amber-400 font-bold">
                J. Toledo Suzuki Motos do Brasil • Divisão de Peças & Pós-Venda
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight mt-1">
                PEDIDO OFICIAL DE PEÇAS GENUÍNAS
              </h2>
              <div className="text-xs text-neutral-400 mt-0.5">
                CD Manaus (AM) • CD Jundiaí (SP) • Sistema B2B Concessionárias
              </div>
            </div>

            <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-3 text-right">
              <div className="text-[10px] text-neutral-400 uppercase font-mono font-bold">Número do Pedido</div>
              <div className="text-base font-mono font-black text-white">{order.orderNumber}</div>
              <div className="text-[11px] text-emerald-400 font-mono font-bold">Modalidade: {order.orderType.toUpperCase()}</div>
            </div>
          </div>

          {/* Dealership & Billing Information Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-neutral-900/70 border border-neutral-800 rounded-2xl p-4 space-y-2">
              <h4 className="text-xs font-bold text-neutral-400 uppercase tracking-wider flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-blue-400" />
                Concessionária Emitente
              </h4>
              <div className="text-sm font-bold text-white">{order.dealershipName}</div>
              <div className="text-xs text-neutral-300 space-y-0.5">
                <div>CNPJ: <span className="font-mono text-neutral-200">{order.dealershipCnpj}</span></div>
                <div>Localização: {order.dealershipCity} - {order.dealershipState} ({order.dealershipRegion})</div>
                <div>Categoria de Rede: <span className="font-bold text-amber-400">{order.dealershipTier || 'Autorizada'}</span></div>
              </div>
            </div>

            <div className="bg-neutral-900/70 border border-neutral-800 rounded-2xl p-4 space-y-2">
              <h4 className="text-xs font-bold text-neutral-400 uppercase tracking-wider flex items-center gap-1.5">
                <Truck className="w-3.5 h-3.5 text-emerald-400" />
                Logística, Frete & Faturamento
              </h4>
              <div className="text-xs text-neutral-300 space-y-1">
                <div>Centro de Distribuição: <span className="font-bold text-white">{order.allocatedWarehouse || 'CD Jundiaí (SP)'}</span></div>
                <div>Frete: <span className="font-bold text-white">{order.freightMode}</span> • Condição: <span className="text-neutral-200">{order.paymentMethod}</span></div>
                {order.vinApplication && (
                  <div className="text-amber-400 font-mono font-bold">
                    Aplicação Chassi/OS: {order.vinApplication}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Workflow Timeline */}
          <div className="bg-neutral-950 border border-neutral-800 rounded-2xl p-4 space-y-3">
            <h4 className="text-xs font-bold text-neutral-400 uppercase tracking-wider flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-blue-400" />
              Status do Atendimento na Fábrica
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
              <div className="p-2.5 rounded-xl bg-neutral-900/80 border border-neutral-800">
                <span className="text-[10px] text-neutral-400 block font-bold">1. Transmissão</span>
                <span className="text-emerald-400 font-bold flex items-center gap-1 mt-0.5">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Transmitido
                </span>
                <span className="text-[10px] text-neutral-400 block mt-0.5">{order.createdAt}</span>
              </div>

              <div className="p-2.5 rounded-xl bg-neutral-900/80 border border-neutral-800">
                <span className="text-[10px] text-neutral-400 block font-bold">2. Estoque CD</span>
                {order.stockVerified ? (
                  <span className="text-emerald-400 font-bold flex items-center gap-1 mt-0.5">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Disponível
                  </span>
                ) : (
                  <span className="text-amber-400 font-bold flex items-center gap-1 mt-0.5">
                    <Clock className="w-3.5 h-3.5" /> Em Verificação
                  </span>
                )}
                <span className="text-[10px] text-neutral-400 block mt-0.5">
                  {order.stockVerifiedAt || 'Aguardando CD'}
                </span>
              </div>

              <div className="p-2.5 rounded-xl bg-neutral-900/80 border border-neutral-800">
                <span className="text-[10px] text-neutral-400 block font-bold">3. Crédito & Margem</span>
                {order.creditApproved ? (
                  <span className="text-emerald-400 font-bold flex items-center gap-1 mt-0.5">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Aprovado
                  </span>
                ) : (
                  <span className="text-purple-400 font-bold flex items-center gap-1 mt-0.5">
                    <Clock className="w-3.5 h-3.5" /> Em Análise
                  </span>
                )}
                <span className="text-[10px] text-neutral-400 block mt-0.5">
                  {order.creditApprovedAt || 'Financeiro JTA'}
                </span>
              </div>

              <div className="p-2.5 rounded-xl bg-neutral-900/80 border border-neutral-800">
                <span className="text-[10px] text-neutral-400 block font-bold">4. ERP TOTVS Protheus</span>
                {order.protheusIntegrated ? (
                  <span className="text-emerald-400 font-bold flex items-center gap-1 mt-0.5">
                    <Database className="w-3.5 h-3.5" /> Integrado SC5
                  </span>
                ) : (
                  <span className="text-neutral-400 font-bold flex items-center gap-1 mt-0.5">
                    <Clock className="w-3.5 h-3.5" /> Pendente
                  </span>
                )}
                <span className="text-[10px] text-neutral-400 block mt-0.5 font-mono">
                  {order.protheusOrderNumber || '—'}
                </span>
              </div>
            </div>

            {/* Protheus NF-e & Tracking Info if available */}
            {order.protheusIntegrated && (
              <div className="p-3 rounded-xl bg-blue-950/40 border border-blue-800/50 flex flex-wrap items-center justify-between gap-3 text-xs">
                <div>
                  <span className="text-blue-300 font-bold">Pedido de Venda Protheus ERP: </span>
                  <span className="font-mono text-white font-bold">{order.protheusOrderNumber}</span>
                  {order.protheusNFeNumber && (
                    <span className="text-neutral-300 ml-3 font-mono">| {order.protheusNFeNumber}</span>
                  )}
                </div>
                {order.protheusTrackingCode && (
                  <div className="flex items-center gap-1.5 text-emerald-400 font-mono font-bold">
                    <Truck className="w-3.5 h-3.5" />
                    <span>Rastreio: {order.protheusTrackingCode} ({order.protheusCarrierName})</span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Detailed Parts List Table */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-neutral-400 uppercase tracking-wider">
              Grade de Peças e Componentes Solicitados ({order.totalPartsCount} unidades)
            </h4>

            <div className="border border-neutral-800 rounded-2xl overflow-hidden">
              <table className="w-full text-left text-xs border-collapse font-tabular">
                <thead className="bg-neutral-900 text-neutral-400 uppercase text-[10px] font-bold border-b border-neutral-800">
                  <tr>
                    <th className="p-3 pl-4">Item / Part Number</th>
                    <th className="p-3">Descrição Técnica</th>
                    <th className="p-3 text-center">Ilustração EPC</th>
                    <th className="p-3 text-center">Qtd</th>
                    <th className="p-3 text-right">Preço Unit. Fábrica</th>
                    <th className="p-3 text-right">PPS Varejo</th>
                    <th className="p-3 pr-4 text-right">Subtotal</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-800">
                  {order.items.map((item, idx) => (
                    <tr key={item.id} className="hover:bg-neutral-900/40">
                      <td className="p-3 pl-4 font-mono font-bold text-white">
                        <div className="flex items-center gap-1.5">
                          <span className="text-neutral-400 text-[10px]">#{idx + 1}</span>
                          <span className="text-amber-400">{item.part.partNumber}</span>
                        </div>
                      </td>
                      <td className="p-3">
                        <div className="font-bold text-neutral-200">{item.part.description}</div>
                        <div className="text-[11px] text-neutral-400">{item.modelName}</div>
                      </td>
                      <td className="p-3 text-center font-mono text-neutral-300">
                        {item.illustrationCode} (Ref {item.part.ref})
                      </td>
                      <td className="p-3 text-center font-bold text-white font-mono">
                        {item.quantity} un.
                      </td>
                      <td className="p-3 text-right font-mono text-neutral-200">
                        R$ {item.unitPrice.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="p-3 text-right font-mono text-neutral-400">
                        R$ {(item.part?.msrpPrice ?? (item.unitPrice * 1.5) ?? 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="p-3 pr-4 text-right font-mono font-bold text-white">
                        R$ {item.totalPrice.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Financial Totals */}
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="text-xs text-neutral-400 space-y-1">
              <div>Condição Comercial: <span className="text-white font-bold">{order.paymentMethod}</span></div>
              {order.notes && <div>Observações: <span className="text-neutral-300">{order.notes}</span></div>}
            </div>

            <div className="text-right space-y-1 self-end sm:self-auto font-tabular">
              <div className="text-xs text-neutral-400">
                Subtotal Peças: <span className="font-mono text-white font-bold">R$ {order.subtotalAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="text-xs text-neutral-400">
                Frete ({order.freightMode}): <span className="font-mono text-white font-bold">{order.freightAmount === 0 ? 'Isento / CIF' : `R$ ${order.freightAmount.toFixed(2)}`}</span>
              </div>
              <div className="text-base sm:text-lg font-black text-amber-400 font-mono pt-1 border-t border-neutral-800">
                Total Faturado: R$ {order.totalAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </div>
            </div>
          </div>

          {/* Montadora Action Buttons (if Montadora scope) */}
          {isMontadora && (
            <div className="bg-neutral-900 border border-neutral-700 p-4 rounded-2xl space-y-3 print:hidden">
              <div className="flex items-center justify-between">
                <span className="text-xs uppercase font-bold text-blue-400 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4" />
                  Painel de Aprovação & Integração Fábrica (J. Toledo)
                </span>
                <span className="text-xs text-neutral-400">Ambiente de Operações & ERP</span>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {!order.stockVerified && onApproveStock && (
                  <button
                    onClick={() => onApproveStock(order.id)}
                    className="px-3.5 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 transition-colors"
                  >
                    <Package className="w-3.5 h-3.5" />
                    Confirmar Saldo nos CDs (Manaus/Jundiaí)
                  </button>
                )}

                {!order.creditApproved && onApproveCredit && (
                  <button
                    onClick={() => onApproveCredit(order.id)}
                    className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 transition-colors"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Aprovar Crédito & Faturamento
                  </button>
                )}

                {order.creditApproved && !order.protheusIntegrated && onIntegrateProtheus && (
                  <button
                    onClick={() => onIntegrateProtheus(order.id)}
                    className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-xs rounded-xl flex items-center gap-1.5 transition-colors shadow-lg shadow-amber-500/20"
                  >
                    <Database className="w-3.5 h-3.5" />
                    Integrar no TOTVS Protheus ERP (Gerar SC5)
                  </button>
                )}

                {order.protheusIntegrated && order.status !== 'faturado_despachado' && onDispatchOrder && (
                  <button
                    onClick={() => onDispatchOrder(order.id)}
                    className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 transition-colors"
                  >
                    <Truck className="w-3.5 h-3.5" />
                    Emitir NF-e & Despachar Peças
                  </button>
                )}
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
};
