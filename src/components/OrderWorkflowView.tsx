import React, { useState } from 'react';
import { ApprovalWorkflowStep, FactoryOrderStatus } from '../types';
import { ShieldCheck, Plus, Search, Edit3, Trash2, CheckCircle2, ArrowRight, UserCheck, Building2, Zap } from 'lucide-react';

import { INITIAL_WORKFLOW_STEPS } from '../data/workflowStepsData';
export { INITIAL_WORKFLOW_STEPS };

interface OrderWorkflowViewProps {
  workflowSteps: ApprovalWorkflowStep[];
  onSaveWorkflowStep: (step: ApprovalWorkflowStep) => void;
  onDeleteWorkflowStep: (id: string) => void;
}

export const OrderWorkflowView: React.FC<OrderWorkflowViewProps> = ({
  workflowSteps,
  onSaveWorkflowStep,
  onDeleteWorkflowStep
}) => {
  const [activeWorkflowType, setActiveWorkflowType] = useState<'pedido' | 'fundo_reserva'>('pedido');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStep, setEditingStep] = useState<ApprovalWorkflowStep | null>(null);

  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const currentSteps = workflowSteps.filter(s => (s.workflowType || 'pedido') === activeWorkflowType);

  const handleOpenAdd = () => {
    setEditingStep({
      id: `wf-step-${Date.now()}`,
      stepOrder: currentSteps.length + 1,
      stepName: activeWorkflowType === 'fundo_reserva' ? 'Nova Aprovação - Fundo de Reserva' : 'Nova Etapa de Aprovação',
      department: 'Comercial',
      responsibleUser: 'Analista Responsável',
      userEmail: 'analista@jtoledo.com.br',
      targetStatusOnApprove: 'aprovado_comercial',
      autoIntegrateProtheus: false,
      active: true,
      workflowType: activeWorkflowType,
      targetDealershipId: 'todos',
      notes: 'Descreva a regra dessa etapa de aprovação...'
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (step: ApprovalWorkflowStep) => {
    setEditingStep({ ...step });
    setIsModalOpen(true);
  };

  const handleSave = () => {
    if (!editingStep) return;
    onSaveWorkflowStep(editingStep);
    setIsModalOpen(false);
    showToast('Etapa do workflow salva com sucesso!');
  };

  const handleDelete = (id: string) => {
    onDeleteWorkflowStep(id);
    showToast('Etapa removida do workflow.');
  };

  return (
    <div className="space-y-6">
      {/* Toast Feedback */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-emerald-600 text-white px-5 py-3 rounded-xl shadow-2xl font-bold text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-[#18181b] border border-[#27272a] rounded-3xl p-6 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-2xl border border-emerald-500/20">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <span>Cadastro de Workflow de Aprovação</span>
              <span className="text-xs font-mono font-bold bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-500/30">
                ERP Protheus Sync
              </span>
            </h2>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
              Defina os fluxos independentes para Pedidos de Fábrica e solicitações de Fundo de Reserva, amarrando etapas por rede ou loja.
            </p>
          </div>
        </div>

        <button
          onClick={handleOpenAdd}
          className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs flex items-center gap-2 shadow-lg shadow-emerald-600/20 transition-all"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>Nova Etapa do Workflow</span>
        </button>
      </div>

      {/* Workflow Tabs: Pedido Padrão vs Fundo de Reserva (Requisito d) */}
      <div className="flex items-center gap-3 bg-[#18181b] border border-[#27272a] p-1.5 rounded-2xl">
        <button
          onClick={() => setActiveWorkflowType('pedido')}
          className={`flex-1 py-3 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
            activeWorkflowType === 'pedido'
              ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20'
              : 'text-neutral-500 dark:text-neutral-400 hover:text-white hover:bg-neutral-800'
          }`}
        >
          <Zap className="w-4 h-4" />
          <span>Workflow Padrão de Pedidos de Fábrica</span>
        </button>

        <button
          onClick={() => setActiveWorkflowType('fundo_reserva')}
          className={`flex-1 py-3 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
            activeWorkflowType === 'fundo_reserva'
              ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/20'
              : 'text-neutral-500 dark:text-neutral-400 hover:text-white hover:bg-neutral-800'
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span>Workflow Específico: Fundo de Reserva (Comercial → Gerência → Diretoria)</span>
        </button>
      </div>

      {/* Workflow Diagram Preview */}
      <div className="bg-[#18181b] border border-[#27272a] rounded-3xl p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-neutral-700 dark:text-neutral-300 flex items-center gap-2">
            <Zap className="w-4 h-4 text-emerald-400" />
            <span>
              {activeWorkflowType === 'pedido'
                ? `Fluxo Padrão de Pedidos (${currentSteps.length} Etapas)`
                : `Fluxo de Fundo de Reserva (${currentSteps.length} Etapas)`}
            </span>
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {currentSteps.sort((a, b) => a.stepOrder - b.stepOrder).map((step) => (
            <div key={step.id} className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-4 space-y-3 relative overflow-hidden">
              <div className="flex items-center justify-between">
                <span className="w-7 h-7 bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 rounded-full font-mono font-bold text-xs flex items-center justify-center">
                  {step.stepOrder}
                </span>
                <div className="flex items-center gap-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-neutral-800 text-neutral-500 dark:text-neutral-400">
                    {step.department}
                  </span>
                  {step.targetDealershipId && step.targetDealershipId !== 'todos' && (
                    <span className="text-[9px] font-bold uppercase px-1.5 py-0.5 rounded bg-purple-950 text-purple-300 border border-purple-800">
                      {step.targetDealershipId}
                    </span>
                  )}
                </div>
              </div>

              <div>
                <h4 className="text-sm font-bold text-white">{step.stepName}</h4>
                <p className="text-xs text-emerald-400 font-semibold flex items-center gap-1 mt-1">
                  <UserCheck className="w-3.5 h-3.5" />
                  <span>{step.responsibleUser}</span>
                </p>
              </div>

              <div className="bg-neutral-50 dark:bg-neutral-950 p-2.5 rounded-xl text-xs space-y-1 text-neutral-500 dark:text-neutral-400">
                <div className="flex items-center justify-between">
                  <span>Status Destino:</span>
                  <span className="font-bold text-white font-mono text-[11px]">{step.targetStatusOnApprove}</span>
                </div>
                {step.autoIntegrateProtheus && (
                  <div className="pt-1 text-emerald-400 font-bold text-[10px] flex items-center gap-1">
                    <Zap className="w-3 h-3 fill-emerald-400" />
                    <span>Apto para Integração Automática ERP Protheus</span>
                  </div>
                )}
              </div>

              <div className="pt-2 border-t border-neutral-200 dark:border-neutral-800 flex items-center justify-end gap-2">
                <button
                  onClick={() => handleOpenEdit(step)}
                  className="px-2.5 py-1 bg-neutral-800 hover:bg-neutral-700 text-neutral-700 dark:text-neutral-300 rounded-lg text-xs font-bold transition-colors flex items-center gap-1"
                >
                  <Edit3 className="w-3 h-3" />
                  <span>Editar</span>
                </button>
                <button
                  onClick={() => handleDelete(step.id)}
                  className="p-1 bg-neutral-800 hover:bg-rose-950 text-neutral-500 hover:text-rose-400 rounded-lg transition-colors"
                  title="Excluir"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modal: Add / Edit Step */}
      {isModalOpen && editingStep && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-[#18181b] border border-[#27272a] rounded-2xl p-6 max-w-lg w-full space-y-4 shadow-2xl">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
              <span>Configurar Etapa de Aprovação do Workflow</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="text-neutral-500 dark:text-neutral-400 font-semibold block mb-1">Tipo de Workflow (Requisito d)</label>
                <select
                  value={editingStep.workflowType || 'pedido'}
                  onChange={(e) => setEditingStep({ ...editingStep, workflowType: e.target.value as 'pedido' | 'fundo_reserva' })}
                  className="w-full bg-white dark:bg-neutral-900 border border-neutral-700 rounded-xl px-3 py-2 text-white font-bold"
                >
                  <option value="pedido">Workflow Padrão de Pedidos</option>
                  <option value="fundo_reserva">Workflow Fundo de Reserva</option>
                </select>
              </div>

              <div>
                <label className="text-neutral-500 dark:text-neutral-400 font-semibold block mb-1">Amarrar a Concessionária/Rede</label>
                <select
                  value={editingStep.targetDealershipId || 'todos'}
                  onChange={(e) => setEditingStep({ ...editingStep, targetDealershipId: e.target.value })}
                  className="w-full bg-white dark:bg-neutral-900 border border-neutral-700 rounded-xl px-3 py-2 text-white font-bold"
                >
                  <option value="todos">Todas as Concessionárias (Rede)</option>
                  <option value="motosul">MotoSul Suzuki RS</option>
                  <option value="novamotor">Nova Motor Suzuki SP</option>
                  <option value="rotabsb">Rota BSB Suzuki DF</option>
                  <option value="nortemotos">Norte Motos AM</option>
                </select>
              </div>

              <div>
                <label className="text-neutral-500 dark:text-neutral-400 font-semibold block mb-1">Ordem da Etapa no Fluxo</label>
                <input
                  type="number"
                  value={editingStep.stepOrder}
                  onChange={(e) => setEditingStep({ ...editingStep, stepOrder: Number(e.target.value) })}
                  className="w-full bg-white dark:bg-neutral-900 border border-neutral-700 rounded-xl px-3 py-2 text-white font-bold"
                />
              </div>

              <div>
                <label className="text-neutral-500 dark:text-neutral-400 font-semibold block mb-1">Departamento Responsável</label>
                <select
                  value={editingStep.department}
                  onChange={(e) => setEditingStep({ ...editingStep, department: e.target.value as any })}
                  className="w-full bg-white dark:bg-neutral-900 border border-neutral-700 rounded-xl px-3 py-2 text-white font-bold"
                >
                  <option value="Crédito">Crédito</option>
                  <option value="Comercial">Comercial</option>
                  <option value="Financeiro">Financeiro</option>
                  <option value="Diretoria">Diretoria</option>
                  <option value="Logística">Logística</option>
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="text-neutral-500 dark:text-neutral-400 font-semibold block mb-1">Nome da Etapa *</label>
                <input
                  type="text"
                  value={editingStep.stepName}
                  onChange={(e) => setEditingStep({ ...editingStep, stepName: e.target.value })}
                  className="w-full bg-white dark:bg-neutral-900 border border-neutral-700 rounded-xl px-3 py-2 text-white font-bold"
                />
              </div>

              <div>
                <label className="text-neutral-500 dark:text-neutral-400 font-semibold block mb-1">Usuário Responsável *</label>
                <input
                  type="text"
                  value={editingStep.responsibleUser}
                  onChange={(e) => setEditingStep({ ...editingStep, responsibleUser: e.target.value })}
                  className="w-full bg-white dark:bg-neutral-900 border border-neutral-700 rounded-xl px-3 py-2 text-white font-bold"
                />
              </div>

              <div>
                <label className="text-neutral-500 dark:text-neutral-400 font-semibold block mb-1">E-mail do Responsável</label>
                <input
                  type="email"
                  value={editingStep.userEmail}
                  onChange={(e) => setEditingStep({ ...editingStep, userEmail: e.target.value })}
                  className="w-full bg-white dark:bg-neutral-900 border border-neutral-700 rounded-xl px-3 py-2 text-white font-mono text-[11px]"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="text-neutral-500 dark:text-neutral-400 font-semibold block mb-1">Status Destino ao Aprovar *</label>
                <select
                  value={editingStep.targetStatusOnApprove}
                  onChange={(e) => setEditingStep({ ...editingStep, targetStatusOnApprove: e.target.value as any })}
                  className="w-full bg-white dark:bg-neutral-900 border border-neutral-700 rounded-xl px-3 py-2 text-white font-bold"
                >
                  <option value="em_analise_credito">Em Análise de Crédito</option>
                  <option value="em_analise_comercial">Em Análise Comercial</option>
                  <option value="aprovado_comercial">Aprovado Comercial</option>
                  <option value="integrado_protheus">Integrado ERP Protheus</option>
                </select>
              </div>

              <div className="sm:col-span-2 bg-white dark:bg-neutral-900 p-3 rounded-xl border border-neutral-200 dark:border-neutral-800 space-y-2">
                <label className="flex items-center gap-2 text-white font-bold cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editingStep.autoIntegrateProtheus}
                    onChange={(e) => setEditingStep({ ...editingStep, autoIntegrateProtheus: e.target.checked })}
                    className="rounded border-neutral-700 text-emerald-500"
                  />
                  <span>Habilitar Integração Automática com ERP Protheus ao Aprovar</span>
                </label>
                <p className="text-[11px] text-neutral-500 dark:text-neutral-400">
                  Se marcado, a aprovação desta pessoa mudará o pedido diretamente para o status pronto para faturamento/integração.
                </p>
              </div>

              <div className="sm:col-span-2">
                <label className="text-neutral-500 dark:text-neutral-400 font-semibold block mb-1">Observações da Regra</label>
                <textarea
                  rows={2}
                  value={editingStep.notes || ''}
                  onChange={(e) => setEditingStep({ ...editingStep, notes: e.target.value })}
                  className="w-full bg-white dark:bg-neutral-900 border border-neutral-700 rounded-xl p-2 text-white"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-neutral-200 dark:border-neutral-800">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 bg-neutral-800 text-neutral-700 dark:text-neutral-300 font-bold rounded-xl text-xs"
              >
                Cancelar
              </button>
              <button
                onClick={handleSave}
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs shadow-lg shadow-emerald-600/20"
              >
                Salvar Etapa
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
