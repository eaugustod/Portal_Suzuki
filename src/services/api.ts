// src/services/api.ts
// Cliente HTTP centralizado para comunicação com a API SQL Server do Portal Suzuki

const getAuthToken = () => {
  return localStorage.getItem('portal_suzuki_token') || '';
};

const getHeaders = (isJson = true) => {
  const headers: Record<string, string> = {};
  if (isJson) {
    headers['Content-Type'] = 'application/json';
  }
  const token = getAuthToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
};

export const api = {
  // 1. Autenticação
  async login(email: string, password: string) {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Erro ao realizar login.');
    return data;
  },

  async changePassword(currentPassword: string, newPassword: string) {
    const res = await fetch('/api/auth/change-password', {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ currentPassword, newPassword })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Erro ao alterar senha.');
    return data;
  },

  async forgotPassword(email: string) {
    const res = await fetch('/api/auth/forgot-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Erro ao solicitar recuperação de senha.');
    return data;
  },

  async getMe() {
    const res = await fetch('/api/auth/me', {
      headers: getHeaders()
    });
    if (!res.ok) throw new Error('Não autenticado');
    return res.json();
  },

  // 1.1 Gestão de Usuários (RBAC / Login)
  async getUsers(dealershipId?: string) {
    const url = dealershipId ? `/api/users?dealershipId=${dealershipId}` : '/api/users';
    const res = await fetch(url, { headers: getHeaders() });
    if (!res.ok) throw new Error('Erro ao carregar usuários.');
    return res.json();
  },

  async getUsersMetadata() {
    const res = await fetch('/api/users/metadata', { headers: getHeaders() });
    if (!res.ok) throw new Error('Erro ao carregar departamentos e perfis.');
    return res.json();
  },

  async createUser(payload: any) {
    const res = await fetch('/api/users', {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Erro ao cadastrar usuário.');
    return data;
  },

  async updateUser(id: string, payload: any) {
    const res = await fetch(`/api/users/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Erro ao atualizar usuário.');
    return data;
  },

  async adminResetPassword(id: string) {
    const res = await fetch(`/api/users/${id}/reset-password`, {
      method: 'POST',
      headers: getHeaders()
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Erro ao resetar senha.');
    return data;
  },

  async toggleUserStatus(id: string, status: string) {
    const res = await fetch(`/api/users/${id}/status`, {
      method: 'PATCH',
      headers: getHeaders(),
      body: JSON.stringify({ status })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Erro ao alterar status.');
    return data;
  },

  // 2. Concessionárias
  async getDealerships() {
    const res = await fetch('/api/dealerships', { headers: getHeaders() });
    if (!res.ok) throw new Error('Erro ao carregar concessionárias.');
    return res.json();
  },

  async updateDealership(id: string, payload: any) {
    const res = await fetch(`/api/dealerships/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(payload)
    });
    return res.json();
  },

  // 3. Catálogo de Compra de Motos e Pedidos
  async getPurchaseModels() {
    const res = await fetch('/api/purchase/models', { headers: getHeaders() });
    if (!res.ok) throw new Error('Erro ao carregar modelos.');
    return res.json();
  },

  async updatePurchaseModel(id: string, modelData: any) {
    const res = await fetch(`/api/purchase/models/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(modelData)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Erro ao atualizar modelo.');
    return data;
  },

  async getPaymentConditions() {
    const res = await fetch('/api/purchase/payment-conditions', { headers: getHeaders() });
    if (!res.ok) throw new Error('Erro ao carregar condições de pagamento.');
    return res.json();
  },

  async getFreightTable() {
    const res = await fetch('/api/purchase/freight', { headers: getHeaders() });
    if (!res.ok) throw new Error('Erro ao carregar fretes.');
    return res.json();
  },

  async getFactoryOrders() {
    const res = await fetch('/api/purchase/orders', { headers: getHeaders() });
    if (!res.ok) throw new Error('Erro ao carregar pedidos.');
    return res.json();
  },

  async createFactoryOrder(orderData: any) {
    const res = await fetch('/api/purchase/orders', {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(orderData)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Erro ao criar pedido.');
    return data;
  },

  // 4. Fundo de Reserva
  async getReserveFundStatement(dealershipId?: string) {
    const url = dealershipId ? `/api/reserve-fund/statement?dealershipId=${dealershipId}` : '/api/reserve-fund/statement';
    const res = await fetch(url, { headers: getHeaders() });
    if (!res.ok) throw new Error('Erro ao carregar extrato do fundo de reserva.');
    return res.json();
  },

  async createReserveFundCredit(payload: any) {
    const res = await fetch('/api/reserve-fund/credit', {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Erro ao lançar crédito.');
    return data;
  },

  async approveReserveFundTransaction(id: string) {
    const res = await fetch(`/api/reserve-fund/${id}/approve`, {
      method: 'PATCH',
      headers: getHeaders()
    });
    return res.json();
  },

  // 5. Compromissos Trimestrais
  async getCommitments(dealershipId?: string) {
    const url = dealershipId ? `/api/commitments?dealershipId=${dealershipId}` : '/api/commitments';
    const res = await fetch(url, { headers: getHeaders() });
    if (!res.ok) throw new Error('Erro ao carregar compromissos trimestrais.');
    return res.json();
  },

  async updateCommitmentStatus(id: string, status: string, factoryNotes?: string) {
    const res = await fetch(`/api/commitments/${id}/status`, {
      method: 'PATCH',
      headers: getHeaders(),
      body: JSON.stringify({ status, factoryNotes })
    });
    return res.json();
  },
  async updateFactoryOrder(id: string, payload: any) {
    const res = await fetch('/api/purchase/orders/' + id, {
      method: 'PATCH',
      headers: getHeaders(),
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Erro ao atualizar pedido.');
    return data;
  },

  async createCommitment(payload: any) {
    const res = await fetch('/api/commitments', {
      method: 'POST', headers: getHeaders(), body: JSON.stringify(payload)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Erro ao criar compromisso.');
    return data;
  },

  async updateCommitment(id: string, payload: any) {
    const res = await fetch('/api/commitments/' + id, {
      method: 'PUT', headers: getHeaders(), body: JSON.stringify(payload)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Erro ao atualizar compromisso.');
    return data;
  },

  async deleteCommitment(id: string) {
    const res = await fetch('/api/commitments/' + id, { method: 'DELETE', headers: getHeaders() });
    return res.json();
  },

  async getInventory(dealershipId?: string) {
    const url = dealershipId ? '/api/inventory?dealershipId=' + dealershipId : '/api/inventory';
    const res = await fetch(url, { headers: getHeaders() });
    if (!res.ok) throw new Error('Erro ao carregar estoque.');
    return res.json();
  },

  async createInventoryItem(payload: any) {
    const res = await fetch('/api/inventory', { method: 'POST', headers: getHeaders(), body: JSON.stringify(payload) });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Erro ao adicionar veículo.');
    return data;
  },

  async updateInventoryItem(id: string, payload: any) {
    const res = await fetch('/api/inventory/' + id, { method: 'PUT', headers: getHeaders(), body: JSON.stringify(payload) });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Erro ao atualizar veículo.');
    return data;
  },

  async deleteInventoryItem(id: string) {
    const res = await fetch('/api/inventory/' + id, { method: 'DELETE', headers: getHeaders() });
    return res.json();
  },

  async getPipeline(dealershipId?: string) {
    const url = dealershipId ? '/api/sales/pipeline?dealershipId=' + dealershipId : '/api/sales/pipeline';
    const res = await fetch(url, { headers: getHeaders() });
    if (!res.ok) throw new Error('Erro ao carregar pipeline de vendas.');
    return res.json();
  },

  async createPipelineLead(payload: any) {
    const res = await fetch('/api/sales/pipeline', { method: 'POST', headers: getHeaders(), body: JSON.stringify(payload) });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Erro ao cadastrar lead.');
    return data;
  },

  async movePipelineLead(id: string, type: string) {
    const res = await fetch('/api/sales/pipeline/' + id + '/status', { method: 'PATCH', headers: getHeaders(), body: JSON.stringify({ type }) });
    return res.json();
  },

  async deletePipelineLead(id: string) {
    const res = await fetch('/api/sales/pipeline/' + id, { method: 'DELETE', headers: getHeaders() });
    return res.json();
  },

  async getInteractions(dealershipId?: string) {
    const url = dealershipId ? '/api/sales/interactions?dealershipId=' + dealershipId : '/api/sales/interactions';
    const res = await fetch(url, { headers: getHeaders() });
    if (!res.ok) throw new Error('Erro ao carregar interações.');
    return res.json();
  },

  async createInteraction(payload: any) {
    const res = await fetch('/api/sales/interactions', { method: 'POST', headers: getHeaders(), body: JSON.stringify(payload) });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Erro ao registrar interação.');
    return data;
  },

  async getServiceOrders(dealershipId?: string) {
    const url = dealershipId ? '/api/service-orders?dealershipId=' + dealershipId : '/api/service-orders';
    const res = await fetch(url, { headers: getHeaders() });
    if (!res.ok) throw new Error('Erro ao carregar ordens de serviço.');
    return res.json();
  },

  async createServiceOrder(payload: any) {
    const res = await fetch('/api/service-orders', { method: 'POST', headers: getHeaders(), body: JSON.stringify(payload) });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Erro ao criar ordem de serviço.');
    return data;
  },

  async updateServiceOrder(id: string, payload: any) {
    const res = await fetch('/api/service-orders/' + id, { method: 'PUT', headers: getHeaders(), body: JSON.stringify(payload) });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Erro ao atualizar ordem de serviço.');
    return data;
  },

  async deleteServiceOrder(id: string) {
    const res = await fetch('/api/service-orders/' + id, { method: 'DELETE', headers: getHeaders() });
    return res.json();
  },

  async getTransitOrders(dealershipId?: string) {
    const url = dealershipId ? '/api/transit?dealershipId=' + dealershipId : '/api/transit';
    const res = await fetch(url, { headers: getHeaders() });
    if (!res.ok) throw new Error('Erro ao carregar lotes em trânsito.');
    return res.json();
  },

  async createTransitOrder(payload: any) {
    const res = await fetch('/api/transit', { method: 'POST', headers: getHeaders(), body: JSON.stringify(payload) });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Erro ao registrar lote em trânsito.');
    return data;
  },

  async deleteTransitOrder(id: string) {
    const res = await fetch('/api/transit/' + id, { method: 'DELETE', headers: getHeaders() });
    return res.json();
  },

  async getPartsOrders(dealershipId?: string) {
    const url = dealershipId ? '/api/parts/orders?dealershipId=' + dealershipId : '/api/parts/orders';
    const res = await fetch(url, { headers: getHeaders() });
    if (!res.ok) throw new Error('Erro ao carregar pedidos de peças.');
    return res.json();
  },

  async createPartsOrder(payload: any) {
    const res = await fetch('/api/parts/orders', { method: 'POST', headers: getHeaders(), body: JSON.stringify(payload) });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Erro ao transmitir pedido de peças.');
    return data;
  },

  async updatePartsOrder(id: string, payload: any) {
    const res = await fetch('/api/parts/orders/' + id + '/status', { method: 'PATCH', headers: getHeaders(), body: JSON.stringify(payload) });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Erro ao atualizar pedido de peças.');
    return data;
  },

  async deletePartsOrder(id: string) {
    const res = await fetch('/api/parts/orders/' + id, { method: 'DELETE', headers: getHeaders() });
    return res.json();
  },

  async createPaymentCondition(payload: any) {
    const res = await fetch('/api/payment-conditions', { method: 'POST', headers: getHeaders(), body: JSON.stringify(payload) });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Erro ao criar condição de pagamento.');
    return data;
  },

  async updatePaymentCondition(id: string, payload: any) {
    const res = await fetch('/api/payment-conditions/' + id, { method: 'PUT', headers: getHeaders(), body: JSON.stringify(payload) });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Erro ao atualizar condição de pagamento.');
    return data;
  },

  async deletePaymentCondition(id: string) {
    const res = await fetch('/api/payment-conditions/' + id, { method: 'DELETE', headers: getHeaders() });
    return res.json();
  },

  async getWorkflowSteps(tipo?: string) {
    const url = tipo ? '/api/workflow-steps?tipo=' + tipo : '/api/workflow-steps';
    const res = await fetch(url, { headers: getHeaders() });
    if (!res.ok) throw new Error('Erro ao carregar etapas do workflow.');
    return res.json();
  },

  async createWorkflowStep(payload: any) {
    const res = await fetch('/api/workflow-steps', { method: 'POST', headers: getHeaders(), body: JSON.stringify(payload) });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Erro ao criar etapa do workflow.');
    return data;
  },

  async updateWorkflowStep(id: string, payload: any) {
    const res = await fetch('/api/workflow-steps/' + id, { method: 'PUT', headers: getHeaders(), body: JSON.stringify(payload) });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Erro ao atualizar etapa do workflow.');
    return data;
  },

  async deleteWorkflowStep(id: string) {
    const res = await fetch('/api/workflow-steps/' + id, { method: 'DELETE', headers: getHeaders() });
    return res.json();
  },

  async getModelMatrix(dealershipId?: string) {
    const url = dealershipId ? '/api/model-matrix?dealershipId=' + dealershipId : '/api/model-matrix';
    const res = await fetch(url, { headers: getHeaders() });
    if (!res.ok) throw new Error('Erro ao carregar matriz de habilitação.');
    return res.json();
  },

  async saveModelMatrix(payload: any) {
    const res = await fetch('/api/model-matrix', { method: 'PUT', headers: getHeaders(), body: JSON.stringify(payload) });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Erro ao salvar matriz de habilitação.');
    return data;
  },

  async getProposals(dealershipId?: string) {
    const url = dealershipId ? '/api/proposals?dealershipId=' + dealershipId : '/api/proposals';
    const res = await fetch(url, { headers: getHeaders() });
    if (!res.ok) throw new Error('Erro ao carregar propostas.');
    return res.json();
  },

  async createProposal(payload: any) {
    const res = await fetch('/api/proposals', { method: 'POST', headers: getHeaders(), body: JSON.stringify(payload) });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Erro ao criar proposta.');
    return data;
  },

  async updateProposal(id: string, payload: any) {
    const res = await fetch('/api/proposals/' + id, { method: 'PUT', headers: getHeaders(), body: JSON.stringify(payload) });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Erro ao atualizar proposta.');
    return data;
  },

  async deleteProposal(id: string) {
    const res = await fetch('/api/proposals/' + id, { method: 'DELETE', headers: getHeaders() });
    return res.json();
  }

};

export default api;
