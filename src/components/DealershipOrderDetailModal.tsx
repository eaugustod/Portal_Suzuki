import React, { useRef } from 'react';
import { 
  X, 
  Printer, 
  Copy, 
  CheckCircle2, 
  Clock, 
  Building2, 
  Truck, 
  FileText, 
  Database, 
  ShieldCheck, 
  TrendingUp, 
  Calendar, 
  AlertCircle,
  ExternalLink,
  ChevronRight,
  PackageCheck,
  CreditCard,
  MapPin,
  Barcode
} from 'lucide-react';
import { FactoryOrder, DealershipFullProfile } from '../types';

interface DealershipOrderDetailModalProps {
  order: FactoryOrder | null;
  isOpen: boolean;
  onClose: () => void;
  dealershipProfile?: DealershipFullProfile;
  onNavigateToTransit?: () => void;
}

export const DealershipOrderDetailModal: React.FC<DealershipOrderDetailModalProps> = ({
  order,
  isOpen,
  onClose,
  dealershipProfile,
  onNavigateToTransit
}) => {
  const [copied, setCopied] = React.useState(false);
  const printRef = useRef<HTMLDivElement>(null);

  if (!isOpen || !order) return null;

  const handleCopyOrderNumber = () => {
    navigator.clipboard.writeText(order.orderNumber);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  // Calculate gross retail sum and potential margin
  const totalMSRP = order.items.reduce((acc, item) => acc + (item.unitMSRP * item.quantity), 0);
  const totalMarginAmount = totalMSRP - order.totalAmount;
  const marginPercent = totalMSRP > 0 ? ((totalMarginAmount / totalMSRP) * 100).toFixed(1) : '0';

  // Step Status Resolver
  const getStepStatus = (stepIndex: number) => {
    // 1: Transmitido
    // 2: Análise de Crédito
    // 3: Aprovação Comercial
    // 4: Protheus ERP
    // 5: Faturamento / Expedição
    if (stepIndex === 1) return 'completed';
    
    if (stepIndex === 2) {
      if (order.creditApproved) return 'completed';
      if (order.status === 'credito_reprovado') return 'error';
      return order.status === 'em_analise_credito' || order.status === 'aguardando_analise' ? 'current' : 'pending';
    }

    if (stepIndex === 3) {
      if (order.commercialApproved) return 'completed';
      if (order.status === 'em_analise_comercial') return 'current';
      return order.creditApproved ? 'current' : 'pending';
    }

    if (stepIndex === 4) {
      if (order.protheusIntegrated) return 'completed';
      return (order.creditApproved && order.commercialApproved) ? 'current' : 'pending';
    }

    if (stepIndex === 5) {
      if (order.status === 'faturado_despachado') return 'completed';
      if (order.status === 'em_producao') return 'current';
      return order.protheusIntegrated ? 'current' : 'pending';
    }

    return 'pending';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 md:p-6 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-[#121215] border border-[#27272a] rounded-3xl max-w-5xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden relative">
        
        {/* Modal Top Header */}
        <div className="p-5 sm:p-6 border-b border-[#27272a] flex items-center justify-between gap-4 bg-gradient-to-r from-neutral-900 via-[#18181b] to-neutral-900 shrink-0">
          <div className="flex items-center gap-3.5 min-w-0">
            <div className="w-11 h-11 rounded-2xl bg-blue-600/15 border border-blue-500/30 flex items-center justify-center text-blue-400 shrink-0 shadow-inner">
              <FileText className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[11px] uppercase font-mono font-bold tracking-widest text-blue-400 bg-blue-500/10 px-2.5 py-0.5 rounded-full border border-blue-500/20">
                  Espelho do Pedido de Fábrica
                </span>
                <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${
                  order.protheusIntegrated 
                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' 
                    : order.creditApproved && order.commercialApproved
                    ? 'bg-purple-500/10 text-purple-400 border-purple-500/30'
                    : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                }`}>
                  {order.protheusIntegrated 
                    ? 'Integrado ERP Protheus' 
                    : order.creditApproved && order.commercialApproved
                    ? 'Aprovado Fábrica (Aguardando Faturamento)'
                    : 'Em Análise de Fábrica J. Toledo'}
                </span>
              </div>

              <div className="flex items-center gap-2.5 mt-1">
                <h2 className="text-lg sm:text-2xl font-black text-white tracking-tight truncate font-mono">
                  {order.orderNumber}
                </h2>
                <button
                  onClick={handleCopyOrderNumber}
                  className="text-neutral-500 dark:text-neutral-400 hover:text-white p-1 rounded-lg hover:bg-neutral-800 transition-colors"
                  title="Copiar número do pedido"
                >
                  {copied ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>

          {/* Action Buttons & Close */}
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-3.5 py-2 bg-neutral-800 hover:bg-neutral-700 text-white rounded-xl text-xs font-bold border border-neutral-700 flex items-center gap-2 transition-colors shadow-sm hidden sm:flex"
              title="Imprimir espelho oficial do pedido de fábrica"
            >
              <Printer className="w-4 h-4 text-blue-400" />
              <span>Imprimir / PDF</span>
            </button>

            <button
              onClick={onClose}
              className="w-10 h-10 rounded-2xl bg-neutral-800 hover:bg-neutral-700 text-neutral-500 dark:text-neutral-400 hover:text-white flex items-center justify-center transition-colors border border-neutral-700"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Content Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6 flex-1 text-neutral-200">
          
          {/* Tracking Stepper / Status Progress */}
          <div className="bg-white dark:bg-neutral-900/90 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-4 sm:p-5">
            <div className="flex items-center justify-between mb-4">
              <span className="text-[11px] uppercase font-bold text-neutral-500 dark:text-neutral-400 tracking-wider flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-blue-400" />
                Linha do Tempo de Aprovação & Atendimento Fábrica
              </span>
              <span className="text-xs text-neutral-500 dark:text-neutral-400">
                Transmitido em: <strong className="text-white font-mono">{order.createdAt}</strong>
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
              {/* Step 1: Transmissão */}
              <div className="p-3 bg-neutral-50 dark:bg-neutral-950/80 rounded-xl border border-emerald-500/30 flex sm:flex-col items-center sm:items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-emerald-500 text-black flex items-center justify-center font-bold text-xs">
                    ✓
                  </div>
                  <span className="text-xs font-bold text-white">1. Transmissão</span>
                </div>
                <span className="text-[10px] text-emerald-400 font-mono">
                  Enviado com Sucesso
                </span>
              </div>

              {/* Step 2: Análise de Crédito */}
              <div className={`p-3 bg-neutral-50 dark:bg-neutral-950/80 rounded-xl border flex sm:flex-col items-center sm:items-start justify-between gap-2 ${
                getStepStatus(2) === 'completed' ? 'border-emerald-500/30 text-emerald-400' :
                getStepStatus(2) === 'current' ? 'border-blue-500/50 bg-blue-950/20 text-blue-300' : 'border-neutral-200 dark:border-neutral-800 text-neutral-500'
              }`}>
                <div className="flex items-center gap-2">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs ${
                    getStepStatus(2) === 'completed' ? 'bg-emerald-500 text-black' :
                    getStepStatus(2) === 'current' ? 'bg-blue-600 text-white animate-pulse' : 'bg-neutral-800 text-neutral-500 dark:text-neutral-400'
                  }`}>
                    {getStepStatus(2) === 'completed' ? '✓' : '2'}
                  </div>
                  <span className="text-xs font-bold text-white">2. Crédito JTA</span>
                </div>
                <span className="text-[10px] font-mono">
                  {order.creditApproved ? 'Aprovado' : 'Em Análise Financeira'}
                </span>
              </div>

              {/* Step 3: Aprovação Comercial */}
              <div className={`p-3 bg-neutral-50 dark:bg-neutral-950/80 rounded-xl border flex sm:flex-col items-center sm:items-start justify-between gap-2 ${
                getStepStatus(3) === 'completed' ? 'border-emerald-500/30 text-emerald-400' :
                getStepStatus(3) === 'current' ? 'border-blue-500/50 bg-blue-950/20 text-blue-300' : 'border-neutral-200 dark:border-neutral-800 text-neutral-500'
              }`}>
                <div className="flex items-center gap-2">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs ${
                    getStepStatus(3) === 'completed' ? 'bg-emerald-500 text-black' :
                    getStepStatus(3) === 'current' ? 'bg-blue-600 text-white animate-pulse' : 'bg-neutral-800 text-neutral-500 dark:text-neutral-400'
                  }`}>
                    {getStepStatus(3) === 'completed' ? '✓' : '3'}
                  </div>
                  <span className="text-xs font-bold text-white">3. Comercial JTZ</span>
                </div>
                <span className="text-[10px] font-mono">
                  {order.commercialApproved ? 'Aprovado Mix/Cota' : 'Pendente Diretoria'}
                </span>
              </div>

              {/* Step 4: Protheus ERP */}
              <div className={`p-3 bg-neutral-50 dark:bg-neutral-950/80 rounded-xl border flex sm:flex-col items-center sm:items-start justify-between gap-2 ${
                getStepStatus(4) === 'completed' ? 'border-purple-500/40 bg-purple-950/20 text-purple-300' :
                getStepStatus(4) === 'current' ? 'border-blue-500/50 bg-blue-950/20 text-blue-300' : 'border-neutral-200 dark:border-neutral-800 text-neutral-500'
              }`}>
                <div className="flex items-center gap-2">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs ${
                    getStepStatus(4) === 'completed' ? 'bg-purple-600 text-white' :
                    getStepStatus(4) === 'current' ? 'bg-blue-600 text-white' : 'bg-neutral-800 text-neutral-500 dark:text-neutral-400'
                  }`}>
                    {getStepStatus(4) === 'completed' ? '✓' : '4'}
                  </div>
                  <span className="text-xs font-bold text-white">4. ERP Protheus</span>
                </div>
                <span className="text-[10px] font-mono truncate max-w-[120px]">
                  {order.protheusIntegrated ? order.protheusOrderNumber || 'Integrado' : 'Aguardando Sincronia'}
                </span>
              </div>

              {/* Step 5: Faturamento & Despacho */}
              <div className={`p-3 bg-neutral-50 dark:bg-neutral-950/80 rounded-xl border flex sm:flex-col items-center sm:items-start justify-between gap-2 ${
                getStepStatus(5) === 'completed' ? 'border-emerald-500/30 text-emerald-400' :
                getStepStatus(5) === 'current' ? 'border-blue-500/50 bg-blue-950/20 text-blue-300' : 'border-neutral-200 dark:border-neutral-800 text-neutral-500'
              }`}>
                <div className="flex items-center gap-2">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs ${
                    getStepStatus(5) === 'completed' ? 'bg-emerald-500 text-black' :
                    getStepStatus(5) === 'current' ? 'bg-blue-600 text-white' : 'bg-neutral-800 text-neutral-500 dark:text-neutral-400'
                  }`}>
                    {getStepStatus(5) === 'completed' ? '✓' : '5'}
                  </div>
                  <span className="text-xs font-bold text-white">5. Faturamento</span>
                </div>
                <span className="text-[10px] font-mono">
                  {order.status === 'faturado_despachado' ? 'Despachado' : order.protheusIntegrated ? 'Em Programação CD' : 'Pendente'}
                </span>
              </div>
            </div>
          </div>

          {/* Dealership and Manufacturer Info Banners */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Concessionária Emissora */}
            <div className="bg-white dark:bg-neutral-900/80 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-4 space-y-2">
              <div className="flex items-center justify-between border-b border-neutral-200 dark:border-neutral-800 pb-2">
                <span className="text-[10px] uppercase font-bold text-neutral-500 dark:text-neutral-400 tracking-wider flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5 text-blue-400" />
                  Concessionária Emitente
                </span>
                <span className="text-[10px] bg-neutral-800 text-neutral-700 dark:text-neutral-300 px-2 py-0.5 rounded-full font-bold">
                  Tier {order.dealershipTier || 'Diamante'}
                </span>
              </div>
              <div>
                <h4 className="font-bold text-white text-sm">{order.dealershipName}</h4>
                <div className="text-xs text-neutral-500 dark:text-neutral-400 space-y-0.5 mt-1 font-mono">
                  <p>CNPJ: {order.dealershipCnpj}</p>
                  <p>Localização: {order.dealershipCity} - {order.dealershipState} ({order.dealershipRegion})</p>
                  {dealershipProfile?.financialContactEmail && (
                    <p className="text-neutral-500 font-sans">Contato: {dealershipProfile.financialContactEmail}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Montadora & Faturamento */}
            <div className="bg-white dark:bg-neutral-900/80 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-4 space-y-2">
              <div className="flex items-center justify-between border-b border-neutral-200 dark:border-neutral-800 pb-2">
                <span className="text-[10px] uppercase font-bold text-neutral-500 dark:text-neutral-400 tracking-wider flex items-center gap-1.5">
                  <Truck className="w-3.5 h-3.5 text-emerald-400" />
                  Origem / Faturamento Fábrica
                </span>
                <span className="text-[10px] bg-red-600/20 text-red-300 border border-red-500/30 px-2 py-0.5 rounded-full font-bold">
                  J. Toledo Suzuki Brasil
                </span>
              </div>
              <div>
                <h4 className="font-bold text-white text-sm">J. Toledo da Amazônia Indústria e Comércio de Veículos Ltda.</h4>
                <div className="text-xs text-neutral-500 dark:text-neutral-400 space-y-0.5 mt-1 font-mono">
                  <p>Origem: Polo Industrial de Manaus / CD Logístico Jundiaí-SP</p>
                  <p>Modalidade de Frete: <strong className="text-white">{order.freightMode === 'CIF' ? 'Frete CIF (Incluso no Faturamento)' : 'Frete FOB (Retira Concessionária)'}</strong></p>
                </div>
              </div>
            </div>
          </div>

          {/* Detailed Items Table */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Barcode className="w-4 h-4 text-blue-400" />
                Motocicletas e Lotes do Pedido ({order.totalUnits} unidades)
              </h3>
              <span className="text-xs text-neutral-500 dark:text-neutral-400 font-mono">
                Subtotal Faturado: <strong className="text-blue-400 font-bold">R$ {order.totalAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</strong>
              </span>
            </div>

            <div className="bg-white dark:bg-neutral-900/90 border border-neutral-200 dark:border-neutral-800 rounded-2xl overflow-hidden shadow-inner">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs font-tabular">
                  <thead>
                    <tr className="bg-neutral-50 dark:bg-neutral-950/80 border-b border-neutral-200 dark:border-neutral-800 text-[10px] uppercase font-bold text-neutral-500 dark:text-neutral-400 tracking-wider">
                      <th className="p-3.5 pl-4">Modelo / Marca</th>
                      <th className="p-3.5">Cor Oficial & Código</th>
                      <th className="p-3.5 text-center">Qtd Solicitada / Aprovada</th>
                      <th className="p-3.5 text-right">Custo Concessionária Unit.</th>
                      <th className="p-3.5 text-right">Total Faturado</th>
                      <th className="p-3.5">Condição de Pagamento</th>
                      <th className="p-3.5 pr-4 text-center">Status / Obs. Rejeição</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800/80">
                    {order.items.map((item, idx) => {
                      const isItemApproved = item.directorStatus === 'aprovado' || item.itemApprovalStatus === 'aprovado_montadora' || item.itemApprovalStatus === 'aprovado_rede' || order.commercialApproved;
                      const isItemRejected = item.directorStatus === 'rejeitado' || item.supervisorStatus === 'rejeitado' || item.managerStatus === 'rejeitado' || item.itemApprovalStatus === 'rejeitado_rede';

                      return (
                        <tr key={item.id || idx} className="hover:bg-neutral-800/40 transition-colors">
                          {/* Modelo */}
                          <td className="p-3.5 pl-4">
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-black text-white text-sm">
                                  {item.modelName}
                                </span>
                                <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded uppercase ${
                                  item.brand === 'Suzuki' ? 'bg-red-600/20 text-red-300 border border-red-500/30' :
                                  item.brand === 'Zontes' ? 'bg-amber-600/20 text-amber-300 border border-amber-500/30' :
                                  item.brand === 'Haojue' ? 'bg-blue-600/20 text-blue-300 border border-blue-500/30' : 'bg-neutral-800 text-neutral-700 dark:text-neutral-300'
                                }`}>
                                  {item.brand}
                                </span>
                              </div>
                              <span className="text-[11px] text-neutral-500 dark:text-neutral-400 block mt-0.5 font-mono">
                                {item.category} • ERP #{item.childOrderNumber || `${order.orderNumber.replace('PED-', '')}${String(idx + 1).padStart(2, '0')}`}
                              </span>
                            </div>
                          </td>

                          {/* Cor */}
                          <td className="p-3.5">
                            <div className="flex items-center gap-2">
                              <span 
                                className="w-3.5 h-3.5 rounded-full border border-white/20 shrink-0 shadow-sm"
                                style={{ backgroundColor: item.colorHex || '#3b82f6' }}
                              />
                              <span className="font-bold text-white text-xs">
                                {item.colorName}
                              </span>
                            </div>
                          </td>

                          {/* Quantidade */}
                          <td className="p-3.5 text-center font-mono">
                            <span className="inline-block px-2.5 py-1 rounded-lg bg-neutral-800 border border-neutral-700 text-white font-black text-xs">
                              {item.approvedQuantity !== undefined ? item.approvedQuantity : item.quantity} / {item.quantity} un.
                            </span>
                          </td>

                          {/* Custo Concessionária Unitário */}
                          <td className="p-3.5 text-right font-mono text-neutral-200 font-bold">
                            R$ {item.unitFactoryCost.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          </td>

                          {/* Total Faturado */}
                          <td className="p-3.5 text-right font-mono font-black text-white text-sm">
                            R$ {item.totalItemCost.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          </td>

                          {/* Condição Pagamento Item */}
                          <td className="p-3.5 text-amber-400 font-bold text-xs">
                            {item.paymentConditionName || order.paymentMethod || 'À Vista'}
                          </td>

                          {/* Status & Obs Rejeição */}
                          <td className="p-3.5 pr-4 text-center">
                            {isItemRejected ? (
                              <div className="space-y-1">
                                <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-rose-950 text-rose-300 border border-rose-800">
                                  Rejeitado Montadora
                                </span>
                                {(item.rejectionReason || item.supervisorNote || item.managerNote || item.directorNote) && (
                                  <p className="text-[10px] text-rose-300 italic bg-rose-950/60 p-1.5 rounded border border-rose-900 max-w-[200px] mx-auto text-left">
                                    "{item.rejectionReason || item.directorNote || item.managerNote || item.supervisorNote}"
                                    {item.rejectionAuthor && <span className="block text-[9px] text-neutral-500 dark:text-neutral-400 not-italic">— {item.rejectionAuthor}</span>}
                                  </p>
                                )}
                              </div>
                            ) : isItemApproved ? (
                              <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-950 text-emerald-300 border border-emerald-800">
                                ✓ Item Aprovado
                              </span>
                            ) : (
                              <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-amber-950 text-amber-300 border border-amber-800">
                                Em Análise
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                  <tfoot>
                    <tr className="bg-neutral-50 dark:bg-neutral-950 border-t border-neutral-200 dark:border-neutral-800 text-xs">
                      <td colSpan={2} className="p-4 pl-4 font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                        Totais do Pedido de Fábrica
                      </td>
                      <td className="p-4 text-center font-black text-white text-sm font-mono">
                        {order.totalUnits} motocicletas
                      </td>
                      <td colSpan={3} className="p-4 text-right font-bold text-neutral-700 dark:text-neutral-300">
                        VALOR TOTAL DO PEDIDO:
                      </td>
                      <td className="p-4 pr-4 text-right font-black text-blue-400 text-base font-mono">
                        R$ {order.totalAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          </div>

          {/* Financial summary and ERP Info Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            
            {/* Parecer de Crédito JTA */}
            <div className="p-4 bg-white dark:bg-neutral-900/80 border border-neutral-200 dark:border-neutral-800 rounded-2xl space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase font-bold text-neutral-500 dark:text-neutral-400 tracking-wider flex items-center gap-1.5">
                  <CreditCard className="w-3.5 h-3.5 text-blue-400" />
                  Parecer Financeiro & Crédito
                </span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  order.creditApproved ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : order.status === 'credito_reprovado' ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' : 'bg-amber-500/20 text-amber-400'
                }`}>
                  {order.creditApproved ? 'Crédito Aprovado' : order.status === 'credito_reprovado' ? 'Reprovado Crédito' : 'Em Análise'}
                </span>
              </div>
              <div className="text-xs space-y-1">
                <p className="text-neutral-700 dark:text-neutral-300">
                  Analista: <strong>{order.creditAnalyst || 'Fábio Mesquita (J. Toledo Finance)'}</strong>
                </p>
                {order.creditApprovedAt && (
                  <p className="text-neutral-500 font-mono text-[11px]">Data: {order.creditApprovedAt}</p>
                )}
                <p className="text-neutral-500 dark:text-neutral-400 text-[11px] italic bg-neutral-50 dark:bg-neutral-950/60 p-2 rounded-lg border border-neutral-200 dark:border-neutral-800">
                  "{order.creditNotes || 'Crédito sob limite financeiro homologado da concessionária.'}"
                </p>
              </div>
            </div>

            {/* Parecer Comercial JTZ & Diretoria */}
            <div className="p-4 bg-white dark:bg-neutral-900/80 border border-neutral-200 dark:border-neutral-800 rounded-2xl space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase font-bold text-neutral-500 dark:text-neutral-400 tracking-wider flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-purple-400" />
                  Parecer Comercial & Diretoria
                </span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  order.overallApprovalStatus === 'aprovado_total' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                  order.overallApprovalStatus === 'aprovado_parcial' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' :
                  order.overallApprovalStatus?.startsWith('rejeitado') ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' : 'bg-amber-500/20 text-amber-400'
                }`}>
                  {order.overallApprovalStatus === 'aprovado_total' ? 'Aprovado Total' :
                   order.overallApprovalStatus === 'aprovado_parcial' ? 'Aprovado Parcial' :
                   order.overallApprovalStatus?.startsWith('rejeitado') ? 'Rejeitado Fábrica' : 'Em Análise'}
                </span>
              </div>
              <div className="text-xs space-y-1">
                <p className="text-neutral-700 dark:text-neutral-300">
                  Responsável: <strong>{order.commercialManager || 'Alçada de Aprovação (Supervisão / Gerência / Diretoria)'}</strong>
                </p>
                {order.commercialApprovedAt && (
                  <p className="text-neutral-500 font-mono text-[11px]">Data: {order.commercialApprovedAt}</p>
                )}
                <p className="text-neutral-500 dark:text-neutral-400 text-[11px] italic bg-neutral-50 dark:bg-neutral-950/60 p-2 rounded-lg border border-neutral-200 dark:border-neutral-800">
                  "{order.commercialNotes || 'Mix de modelos avaliado para atendimento da cota da rede.'}"
                </p>
              </div>
            </div>

            {/* Integração TOTVS Protheus ERP */}
            <div className="p-4 bg-white dark:bg-neutral-900/80 border border-neutral-200 dark:border-neutral-800 rounded-2xl space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase font-bold text-neutral-500 dark:text-neutral-400 tracking-wider flex items-center gap-1.5">
                  <Database className="w-3.5 h-3.5 text-emerald-400" />
                  TOTVS Protheus ERP
                </span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  order.protheusIntegrated ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-neutral-800 text-neutral-500 dark:text-neutral-400'
                }`}>
                  {order.protheusIntegrated ? 'Integrado SC5' : 'Pendente'}
                </span>
              </div>
              <div className="text-xs space-y-1">
                {order.protheusIntegrated ? (
                  <>
                    <p className="text-neutral-700 dark:text-neutral-300 font-mono">
                      SC5 ERP: <strong className="text-emerald-400">{order.protheusOrderNumber}</strong>
                    </p>
                    <p className="text-neutral-500 dark:text-neutral-400 text-[11px]">
                      Armazém: {order.protheusWarehouse || 'Armazém 01 Manaus'}
                    </p>
                    {order.protheusIntegratedAt && (
                      <p className="text-neutral-500 font-mono text-[11px]">Data: {order.protheusIntegratedAt}</p>
                    )}
                  </>
                ) : (
                  <p className="text-neutral-500 dark:text-neutral-400 text-[11px] py-2">
                    Após aprovação final da Diretoria Comercial, os pedidos de venda e chassi do Protheus serão gerados individualmente por item.
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Historic Rejection Logs section if present */}
          {order.rejectionLogs && order.rejectionLogs.length > 0 && (
            <div className="p-4 bg-rose-950/40 border border-rose-800/60 rounded-2xl space-y-2 text-xs">
              <div className="flex items-center gap-2 text-rose-300 font-bold">
                <AlertCircle className="w-4 h-4" />
                <span>Histórico de Pareceres e Observações de Rejeição</span>
              </div>
              <div className="space-y-1.5">
                {order.rejectionLogs.map(log => (
                  <div key={log.id} className="p-2.5 bg-neutral-50 dark:bg-neutral-950/80 rounded-xl border border-rose-900/40 text-[11px]">
                    <div className="flex items-center justify-between text-rose-400 font-bold mb-1">
                      <span>Alçada: {log.stage} ({log.author})</span>
                      <span className="font-mono text-neutral-500">{log.date}</span>
                    </div>
                    <p className="text-neutral-700 dark:text-neutral-300 italic font-mono">"{log.reason}"</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Notes and observations if present */}
          {order.notes && (
            <div className="p-3.5 bg-white dark:bg-neutral-900/60 border border-neutral-200 dark:border-neutral-800 rounded-xl text-xs text-neutral-500 dark:text-neutral-400 flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
              <div>
                <strong className="text-neutral-700 dark:text-neutral-300 block mb-0.5">Observações da Concessionária:</strong>
                <span>{order.notes}</span>
              </div>
            </div>
          )}

        </div>

        {/* Print Styles Optimization */}
        <style dangerouslySetInnerHTML={{ __html: `
          @media print {
            body { background: white !important; color: black !important; }
            .no-print, button { display: none !important; }
            table, tr, td, th, div { page-break-inside: avoid !important; break-inside: avoid !important; }
          }
        ` }} />

        {/* Modal Footer Bar */}
        <div className="p-4 sm:p-5 border-t border-[#27272a] bg-white dark:bg-neutral-900/90 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2 text-xs text-neutral-500 dark:text-neutral-400">
            <span className="w-2 h-2 rounded-full bg-blue-400" />
            <span>Documento oficial de acompanhamento B2B Suzuki • Protocolo Seguro</span>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            {order.protheusIntegrated && onNavigateToTransit && (
              <button
                onClick={() => {
                  onClose();
                  onNavigateToTransit();
                }}
                className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-colors shadow-md shadow-emerald-600/20 flex-1 sm:flex-initial"
              >
                <Truck className="w-4 h-4" />
                <span>Acompanhar Despacho / Trânsito</span>
              </button>
            )}

            <button
              onClick={handlePrint}
              className="px-4 py-2.5 bg-neutral-800 hover:bg-neutral-700 text-white rounded-xl text-xs font-bold border border-neutral-700 flex items-center justify-center gap-2 transition-colors flex-1 sm:flex-initial sm:hidden"
            >
              <Printer className="w-4 h-4 text-blue-400" />
              <span>Imprimir</span>
            </button>

            <button
              onClick={onClose}
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition-colors shadow-md shadow-blue-600/20 flex-1 sm:flex-initial"
            >
              Fechar
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
