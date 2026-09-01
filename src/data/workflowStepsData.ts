import { ApprovalWorkflowStep } from '../types';

export const INITIAL_WORKFLOW_STEPS: ApprovalWorkflowStep[] = [
  // Workflow Padrão de Pedidos
  {
    id: 'wf-step-1',
    stepOrder: 1,
    stepName: 'Análise de Crédito & Rating Financeiro',
    department: 'Crédito',
    responsibleUser: 'Fabio Mesquita',
    userEmail: 'fabio.mesquita@jtoledo.com.br',
    targetStatusOnApprove: 'em_analise_comercial',
    autoIntegrateProtheus: false,
    active: true,
    workflowType: 'pedido',
    notes: 'Validação do limite Floor Plan e restritivos da concessionária.'
  },
  {
    id: 'wf-step-2',
    stepOrder: 2,
    stepName: 'Aprovação Comercial Regional J. Toledo',
    department: 'Comercial',
    responsibleUser: 'Carlos Drummond',
    userEmail: 'carlos.drummond@jtoledo.com.br',
    targetStatusOnApprove: 'aprovado_comercial',
    autoIntegrateProtheus: false,
    active: true,
    workflowType: 'pedido',
    notes: 'Validação de cotas trimestrais e distribuição por regional.'
  },
  {
    id: 'wf-step-3',
    stepOrder: 3,
    stepName: 'Aprovação Final Diretoria & Liberação ERP Protheus',
    department: 'Diretoria',
    responsibleUser: 'Roberto Alencar (Diretor Operações)',
    userEmail: 'roberto.alencar@jtoledo.com.br',
    targetStatusOnApprove: 'integrado_protheus',
    autoIntegrateProtheus: true,
    active: true,
    workflowType: 'pedido',
    notes: 'Aprovação que habilita o pedido automaticamente para faturamento e integração ERP Protheus.'
  },

  // Workflow Específico do Fundo de Reserva (Requisito d)
  {
    id: 'wf-res-1',
    stepOrder: 1,
    stepName: 'Aprovação Comercial - Abatimento Fundo de Reserva',
    department: 'Comercial',
    responsibleUser: 'Carlos Drummond (Gerente Comercial)',
    userEmail: 'carlos.drummond@jtoledo.com.br',
    targetStatusOnApprove: 'em_analise_comercial',
    autoIntegrateProtheus: false,
    active: true,
    workflowType: 'fundo_reserva',
    notes: 'Validação do saldo acumulado do Fundo de Reserva e elegibilidade da moto.'
  },
  {
    id: 'wf-res-2',
    stepOrder: 2,
    stepName: 'Aprovação Gerência de Vendas - Fundo de Reserva',
    department: 'Comercial',
    responsibleUser: 'Luciana Paiva (Gerente de Operações Rede)',
    userEmail: 'luciana.paiva@jtoledo.com.br',
    targetStatusOnApprove: 'em_analise_comercial',
    autoIntegrateProtheus: false,
    active: true,
    workflowType: 'fundo_reserva',
    notes: 'Verificação da margem comercial e contrapartida de metas da concessionária.'
  },
  {
    id: 'wf-res-3',
    stepOrder: 3,
    stepName: 'Homologação Diretoria - Liberação do Fundo de Reserva',
    department: 'Diretoria',
    responsibleUser: 'Roberto Alencar (Diretor Executivo)',
    userEmail: 'roberto.alencar@jtoledo.com.br',
    targetStatusOnApprove: 'aprovado_comercial',
    autoIntegrateProtheus: false,
    active: true,
    workflowType: 'fundo_reserva',
    notes: 'Aprovação máxima da Diretoria autorizando o desconto do Fundo de Reserva no faturamento.'
  }
];
