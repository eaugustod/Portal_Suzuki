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

// ---- Tratamento central de sessão expirada (HTTP 401) ----
// Qualquer chamada autenticada que receba 401 limpa as credenciais locais e
// emite 'portal:session-expired'. O App escuta esse evento e força o re-login,
// impedindo que a UI continue exibindo dados de fallback (mock) como se a
// sessão estivesse válida.
const SESSION_EXPIRED_EVENT = 'portal:session-expired';
const AUTH_FREE_URLS = ['/api/auth/login', '/api/auth/forgot-password'];
let sessionExpiryNotified = false;

const notifySessionExpired = () => {
  if (sessionExpiryNotified) return;
  sessionExpiryNotified = true;
  localStorage.removeItem('portal_suzuki_token');
  localStorage.removeItem('portal_suzuki_user');
  window.dispatchEvent(new CustomEvent(SESSION_EXPIRED_EVENT));
  // Rearma o aviso para a próxima sessão (após novo login)
  setTimeout(() => { sessionExpiryNotified = false; }, 2000);
};

const fetchWithAuth = async (url: string, init: RequestInit = {}): Promise<Response> => {
  const res = await globalThis.fetch(url, init);
  if (res.status === 401 && !AUTH_FREE_URLS.some(u => url.includes(u))) {
    notifySessionExpired();
  }
  return res;
};

export const api = {
  // 1. Autenticação
  async login(email: string, password: string) {
    const res = await fetchWithAuth('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Erro ao realizar login.');
    return data;
  },

  async changePassword(currentPassword: string, newPassword: string) {
    const res = await fetchWithAuth('/api/auth/change-password', {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ currentPassword, newPassword })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Erro ao alterar senha.');
    return data;
  },

  async forgotPassword(email: string) {
    const res = await fetchWithAuth('/api/auth/forgot-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Erro ao solicitar recuperação de senha.');
    return data;
  },

  async getMe() {
    const res = await fetchWithAuth('/api/auth/me', {
      headers: getHeaders()
    });
    if (!res.ok) throw new Error('Não autenticado');
    return res.json();
  },

  // 1.1 Gestão de Usuários (RBAC / Login)
  async getUsers(dealershipId?: string) {
    const url = dealershipId ? `/api/users?dealershipId=${dealershipId}` : '/api/users';
    const res = await fetchWithAuth(url, { headers: getHeaders() });
    if (!res.ok) throw new Error('Erro ao carregar usuários.');
    return res.json();
  },

  async getUsersMetadata() {
    const res = await fetchWithAuth('/api/users/metadata', { headers: getHeaders() });
    if (!res.ok) throw new Error('Erro ao carregar departamentos e perfis.');
    return res.json();
  },

  async createUser(payload: any) {
    const res = await fetchWithAuth('/api/users', {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Erro ao cadastrar usuário.');
    return data;
  },

  async updateUser(id: string, payload: any) {
    const res = await fetchWithAuth(`/api/users/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Erro ao atualizar usuário.');
    return data;
  },

  async adminResetPassword(id: string) {
    const res = await fetchWithAuth(`/api/users/${id}/reset-password`, {
      method: 'POST',
      headers: getHeaders()
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Erro ao resetar senha.');
    return data;
  },

  async toggleUserStatus(id: string, status: string) {
    const res = await fetchWithAuth(`/api/users/${id}/status`, {
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
    const res = await fetchWithAuth('/api/dealerships', { headers: getHeaders() });
    if (!res.ok) throw new Error('Erro ao carregar concessionárias.');
    return res.json();
  },

  async updateDealership(id: string, payload: any) {
    const res = await fetchWithAuth(`/api/dealerships/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(payload)
    });
    return res.json();
  },

  async createDealership(payload: any) {
    const res = await fetchWithAuth('/api/dealerships', {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(payload)
    });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      throw new Error(body.error || 'Erro ao cadastrar concessionária.');
    }
    return res.json();
  },

  async deleteDealership(id: string) {
    const res = await fetchWithAuth(`/api/dealerships/${id}`, { method: 'DELETE', headers: getHeaders() });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      throw new Error(body.error || 'Erro ao excluir concessionária.');
    }
    return res.json();
  },

  // 3. Catálogo de Compra de Motos e Pedidos
  async getPurchaseModels() {
    const res = await fetchWithAuth('/api/purchase/models', { headers: getHeaders() });
    if (!res.ok) throw new Error('Erro ao carregar modelos.');
    return res.json();
  },

  async updatePurchaseModel(id: string, modelData: any) {
    const res = await fetchWithAuth(`/api/purchase/models/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(modelData)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Erro ao atualizar modelo.');
    return data;
  },

  async getPaymentConditions() {
    const res = await fetchWithAuth('/api/purchase/payment-conditions', { headers: getHeaders() });
    if (!res.ok) throw new Error('Erro ao carregar condições de pagamento.');
    return res.json();
  },

  async getFactoryOrders() {
    const res = await fetchWithAuth('/api/purchase/orders', { headers: getHeaders() });
    if (!res.ok) throw new Error('Erro ao carregar pedidos.');
    return res.json();
  },

  async createFactoryOrder(orderData: any) {
    const res = await fetchWithAuth('/api/purchase/orders', {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(orderData)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Erro ao criar pedido.');
    return data;
  },

  // 4. Fundo de Reserva
  async getFreightTable() {
    const res = await fetchWithAuth('/api/freight', { headers: getHeaders() });
    if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error || 'Erro ao carregar tarifas de frete');
    return res.json();
  },

  async createFreightRate(payload: any) {
    const res = await fetchWithAuth('/api/freight', {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(payload)
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || 'Erro ao criar regra de frete');
    return data;
  },

  async updateFreightRate(id: string, payload: any) {
    const res = await fetchWithAuth(`/api/freight/${encodeURIComponent(id)}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(payload)
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || 'Erro ao atualizar regra de frete');
    return data;
  },

  async deleteFreightRate(id: string) {
    const res = await fetchWithAuth(`/api/freight/${encodeURIComponent(id)}`, {
      method: 'DELETE',
      headers: getHeaders()
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || 'Erro ao excluir regra de frete');
    return data;
  },

  // Marcas
  async getBrands() {
    const res = await fetchWithAuth('/api/brands', { headers: getHeaders() });
    if (!res.ok) throw new Error('Erro ao carregar marcas.');
    return res.json();
  },

  async getBrandById(id: string) {
    const res = await fetchWithAuth(`/api/brands/${encodeURIComponent(id)}`, { headers: getHeaders() });
    if (!res.ok) throw new Error('Erro ao carregar marca.');
    return res.json();
  },

  async createBrand(payload: any) {
    const res = await fetchWithAuth('/api/brands', {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Erro ao criar marca.');
    return data;
  },

  async updateBrand(id: string, payload: any) {
    const res = await fetchWithAuth(`/api/brands/${encodeURIComponent(id)}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Erro ao atualizar marca.');
    return data;
  },

  async deleteBrand(id: string) {
    const res = await fetchWithAuth(`/api/brands/${encodeURIComponent(id)}`, {
      method: 'DELETE',
      headers: getHeaders()
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Erro ao excluir marca.');
    return data;
  },

  async getReserveFundStatement(dealershipId?: string) {
    const url = dealershipId ? `/api/reserve-fund/statement?dealershipId=${dealershipId}` : '/api/reserve-fund/statement';
    const res = await fetchWithAuth(url, { headers: getHeaders() });
    if (!res.ok) throw new Error('Erro ao carregar extrato do fundo de reserva.');
    return res.json();
  },

  async createReserveFundCredit(payload: any) {
    const res = await fetchWithAuth('/api/reserve-fund/credit', {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Erro ao lançar crédito.');
    return data;
  },

  async approveReserveFundTransaction(id: string) {
    const res = await fetchWithAuth(`/api/reserve-fund/${id}/approve`, {
      method: 'PATCH',
      headers: getHeaders()
    });
    return res.json();
  },

  // Solicitação de Fundo de Reserva pela Concessionária (fluxo de aprovação)
  // Obs.: a concessionária submete a solicitação; a Montadora aprova via workflow fundo_reserva.
  async createReserveFundRequest(payload: any) {
    const res = await fetchWithAuth('/api/reserve-fund/request', {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Erro ao enviar solicitação de fundo de reserva.');
    return data;
  },

  async updateReserveFundWorkflow(id: string, payload: any) {
    const res = await fetchWithAuth(`/api/reserve-fund/${id}/workflow`, {
      method: 'PATCH',
      headers: getHeaders(),
      body: JSON.stringify(payload)
    });
    return res.json();
  },

  async rejectReserveFundTransaction(id: string, reason?: string) {
    const res = await fetchWithAuth(`/api/reserve-fund/${id}/reject`, {
      method: 'PATCH',
      headers: getHeaders(),
      body: JSON.stringify({ reason })
    });
    return res.json();
  },

  // 5. Compromissos Trimestrais
  async getCommitments(dealershipId?: string) {
    const url = dealershipId ? `/api/commitments?dealershipId=${dealershipId}` : '/api/commitments';
    const res = await fetchWithAuth(url, { headers: getHeaders() });
    if (!res.ok) throw new Error('Erro ao carregar compromissos trimestrais.');
    return res.json();
  },

  async updateCommitmentStatus(id: string, status: string, factoryNotes?: string) {
    const res = await fetchWithAuth(`/api/commitments/${id}/status`, {
      method: 'PATCH',
      headers: getHeaders(),
      body: JSON.stringify({ status, factoryNotes })
    });
    return res.json();
  },
  async updateFactoryOrder(id: string, payload: any) {
    const res = await fetchWithAuth('/api/purchase/orders/' + id, {
      method: 'PATCH',
      headers: getHeaders(),
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Erro ao atualizar pedido.');
    return data;
  },

  async createCommitment(payload: any) {
    const res = await fetchWithAuth('/api/commitments', {
      method: 'POST', headers: getHeaders(), body: JSON.stringify(payload)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Erro ao criar compromisso.');
    return data;
  },

  async updateCommitment(id: string, payload: any) {
    const res = await fetchWithAuth('/api/commitments/' + id, {
      method: 'PUT', headers: getHeaders(), body: JSON.stringify(payload)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Erro ao atualizar compromisso.');
    return data;
  },

  async deleteCommitment(id: string) {
    const res = await fetchWithAuth('/api/commitments/' + id, { method: 'DELETE', headers: getHeaders() });
    return res.json();
  },

  async getInventory(dealershipId?: string) {
    const url = dealershipId ? '/api/inventory?dealershipId=' + dealershipId : '/api/inventory';
    const res = await fetchWithAuth(url, { headers: getHeaders() });
    if (!res.ok) throw new Error('Erro ao carregar estoque.');
    return res.json();
  },

  async createInventoryItem(payload: any) {
    const res = await fetchWithAuth('/api/inventory', { method: 'POST', headers: getHeaders(), body: JSON.stringify(payload) });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Erro ao adicionar veículo.');
    return data;
  },

  async updateInventoryItem(id: string, payload: any) {
    const res = await fetchWithAuth('/api/inventory/' + id, { method: 'PUT', headers: getHeaders(), body: JSON.stringify(payload) });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Erro ao atualizar veículo.');
    return data;
  },

  async deleteInventoryItem(id: string) {
    const res = await fetchWithAuth('/api/inventory/' + id, { method: 'DELETE', headers: getHeaders() });
    return res.json();
  },

  async getPipeline(dealershipId?: string) {
    const url = dealershipId ? '/api/sales/pipeline?dealershipId=' + dealershipId : '/api/sales/pipeline';
    const res = await fetchWithAuth(url, { headers: getHeaders() });
    if (!res.ok) throw new Error('Erro ao carregar pipeline de vendas.');
    return res.json();
  },

  async createPipelineLead(payload: any) {
    const res = await fetchWithAuth('/api/sales/pipeline', { method: 'POST', headers: getHeaders(), body: JSON.stringify(payload) });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Erro ao cadastrar lead.');
    return data;
  },

  async movePipelineLead(id: string, type: string) {
    const res = await fetchWithAuth('/api/sales/pipeline/' + id + '/status', { method: 'PATCH', headers: getHeaders(), body: JSON.stringify({ type }) });
    return res.json();
  },

  async deletePipelineLead(id: string) {
    const res = await fetchWithAuth('/api/sales/pipeline/' + id, { method: 'DELETE', headers: getHeaders() });
    return res.json();
  },

  async getInteractions(dealershipId?: string) {
    const url = dealershipId ? '/api/sales/interactions?dealershipId=' + dealershipId : '/api/sales/interactions';
    const res = await fetchWithAuth(url, { headers: getHeaders() });
    if (!res.ok) throw new Error('Erro ao carregar interações.');
    return res.json();
  },

  async createInteraction(payload: any) {
    const res = await fetchWithAuth('/api/sales/interactions', { method: 'POST', headers: getHeaders(), body: JSON.stringify(payload) });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Erro ao registrar interação.');
    return data;
  },

  async getServiceOrders(dealershipId?: string) {
    const url = dealershipId ? '/api/service-orders?dealershipId=' + dealershipId : '/api/service-orders';
    const res = await fetchWithAuth(url, { headers: getHeaders() });
    if (!res.ok) throw new Error('Erro ao carregar ordens de serviço.');
    return res.json();
  },

  async createServiceOrder(payload: any) {
    const res = await fetchWithAuth('/api/service-orders', { method: 'POST', headers: getHeaders(), body: JSON.stringify(payload) });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Erro ao criar ordem de serviço.');
    return data;
  },

  async updateServiceOrder(id: string, payload: any) {
    const res = await fetchWithAuth('/api/service-orders/' + id, { method: 'PUT', headers: getHeaders(), body: JSON.stringify(payload) });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Erro ao atualizar ordem de serviço.');
    return data;
  },

  async deleteServiceOrder(id: string) {
    const res = await fetchWithAuth('/api/service-orders/' + id, { method: 'DELETE', headers: getHeaders() });
    return res.json();
  },

  async getTransitOrders(dealershipId?: string) {
    const url = dealershipId ? '/api/transit?dealershipId=' + dealershipId : '/api/transit';
    const res = await fetchWithAuth(url, { headers: getHeaders() });
    if (!res.ok) throw new Error('Erro ao carregar lotes em trânsito.');
    return res.json();
  },

  async createTransitOrder(payload: any) {
    const res = await fetchWithAuth('/api/transit', { method: 'POST', headers: getHeaders(), body: JSON.stringify(payload) });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Erro ao registrar lote em trânsito.');
    return data;
  },

  async deleteTransitOrder(id: string) {
    const res = await fetchWithAuth('/api/transit/' + id, { method: 'DELETE', headers: getHeaders() });
    return res.json();
  },

  async getPartsOrders(dealershipId?: string) {
    const url = dealershipId ? '/api/parts/orders?dealershipId=' + dealershipId : '/api/parts/orders';
    const res = await fetchWithAuth(url, { headers: getHeaders() });
    if (!res.ok) throw new Error('Erro ao carregar pedidos de peças.');
    return res.json();
  },

  async createPartsOrder(payload: any) {
    const res = await fetchWithAuth('/api/parts/orders', { method: 'POST', headers: getHeaders(), body: JSON.stringify(payload) });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Erro ao transmitir pedido de peças.');
    return data;
  },

  async updatePartsOrder(id: string, payload: any) {
    const res = await fetchWithAuth('/api/parts/orders/' + id + '/status', { method: 'PATCH', headers: getHeaders(), body: JSON.stringify(payload) });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Erro ao atualizar pedido de peças.');
    return data;
  },

  async deletePartsOrder(id: string) {
    const res = await fetchWithAuth('/api/parts/orders/' + id, { method: 'DELETE', headers: getHeaders() });
    return res.json();
  },

  async createPaymentCondition(payload: any) {
    const res = await fetchWithAuth('/api/payment-conditions', { method: 'POST', headers: getHeaders(), body: JSON.stringify(payload) });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Erro ao criar condição de pagamento.');
    return data;
  },

  async updatePaymentCondition(id: string, payload: any) {
    const res = await fetchWithAuth('/api/payment-conditions/' + id, { method: 'PUT', headers: getHeaders(), body: JSON.stringify(payload) });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Erro ao atualizar condição de pagamento.');
    return data;
  },

  async deletePaymentCondition(id: string) {
    const res = await fetchWithAuth('/api/payment-conditions/' + id, { method: 'DELETE', headers: getHeaders() });
    return res.json();
  },

  async getWorkflowSteps(tipo?: string) {
    const url = tipo ? '/api/workflow-steps?tipo=' + tipo : '/api/workflow-steps';
    const res = await fetchWithAuth(url, { headers: getHeaders() });
    if (!res.ok) throw new Error('Erro ao carregar etapas do workflow.');
    return res.json();
  },

  async createWorkflowStep(payload: any) {
    const res = await fetchWithAuth('/api/workflow-steps', { method: 'POST', headers: getHeaders(), body: JSON.stringify(payload) });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Erro ao criar etapa do workflow.');
    return data;
  },

  async updateWorkflowStep(id: string, payload: any) {
    const res = await fetchWithAuth('/api/workflow-steps/' + id, { method: 'PUT', headers: getHeaders(), body: JSON.stringify(payload) });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Erro ao atualizar etapa do workflow.');
    return data;
  },

  async deleteWorkflowStep(id: string) {
    const res = await fetchWithAuth('/api/workflow-steps/' + id, { method: 'DELETE', headers: getHeaders() });
    return res.json();
  },

  async getModelMatrix(dealershipId?: string) {
    const url = dealershipId ? '/api/model-matrix?dealershipId=' + dealershipId : '/api/model-matrix';
    const res = await fetchWithAuth(url, { headers: getHeaders() });
    if (!res.ok) throw new Error('Erro ao carregar matriz de habilitação.');
    return res.json();
  },

  async saveModelMatrix(payload: any) {
    const res = await fetchWithAuth('/api/model-matrix', { method: 'PUT', headers: getHeaders(), body: JSON.stringify(payload) });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Erro ao salvar matriz de habilitação.');
    return data;
  },

  async getProposals(dealershipId?: string) {
    const url = dealershipId ? '/api/proposals?dealershipId=' + dealershipId : '/api/proposals';
    const res = await fetchWithAuth(url, { headers: getHeaders() });
    if (!res.ok) throw new Error('Erro ao carregar propostas.');
    return res.json();
  },

  async createProposal(payload: any) {
    const res = await fetchWithAuth('/api/proposals', { method: 'POST', headers: getHeaders(), body: JSON.stringify(payload) });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Erro ao criar proposta.');
    return data;
  },

  async updateProposal(id: string, payload: any) {
    const res = await fetchWithAuth('/api/proposals/' + id, { method: 'PUT', headers: getHeaders(), body: JSON.stringify(payload) });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Erro ao atualizar proposta.');
    return data;
  },

  async deleteProposal(id: string) {
    const res = await fetchWithAuth('/api/proposals/' + id, { method: 'DELETE', headers: getHeaders() });
    return res.json();
  }

};

export default api;
