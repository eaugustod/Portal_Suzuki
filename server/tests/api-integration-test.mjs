// Teste de integração de API — valida CRUD completo contra o SQL Server real
// Uso: node server/tests/api-integration-test.mjs

const BASE = 'http://localhost:3001';
let token = '';
let passed = 0;
let failed = 0;
const failures = [];

function log(name, ok, detail = '') {
  if (ok) { passed++; console.log('  [PASS] ' + name); }
  else { failed++; failures.push(name + ': ' + detail); console.log('  [FAIL] ' + name + ' — ' + detail); }
}

async function waitServer(retries = 15) {
  for (let i = 0; i < retries; i++) {
    try {
      const res = await fetch(BASE + '/api/health');
      if (res.ok) return true;
    } catch { /* retry */ }
    await new Promise(r => setTimeout(r, 2000));
  }
  return false;
}

async function request(path, method = 'GET', body = null) {
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = 'Bearer ' + token;
  const res = await fetch(BASE + path, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined
  });
  let data = null;
  try { data = await res.json(); } catch { data = null; }
  return { status: res.status, data };
}

console.log('\n=== TESTE DE INTEGRACAO PORTAL SUZUKI ===\n');

// 0. AGUARDAR SERVIDOR
const up = await waitServer();
if (!up) {
  console.log('Servidor nao respondeu em /api/health — abortando.');
  process.exit(1);
}
console.log('Servidor OK.\n');

// 1. LOGIN
const login = await request('/api/auth/login', 'POST', { email: 'eduardo.donato@jtoledo.com.br', password: 'Suzuki@2026' });
log('Login montadora', login.status === 200 && !!login.data?.token, 'status=' + login.status);
if (login.data?.token) token = login.data.token;

if (!token) {
  console.log('\nFalha no login — abortando.');
  process.exit(1);
}

// 2. INVENTÁRIO — CRUD completo
console.log('\n--- Inventario ---');
const invPayload = {
  id: 'test-inv-' + Date.now(),
  dealershipId: 'motosul',
  model: 'GSX-R 1000R TESTE',
  year: 2026,
  vin: 'TSTVIN' + Date.now().toString().slice(-8),
  color: 'Azul Teste',
  colorHex: '#0000ff',
  costPrice: 50000,
  retailPrice: 65000,
  status: 'disponivel',
  engineDisplacement: '999 cc',
  power: '202 cv',
  arrivedDate: '01/01/2026'
};
const invCreate = await request('/api/inventory', 'POST', invPayload);
log('Create inventory', invCreate.status === 201, 'status=' + invCreate.status);
const invList = await request('/api/inventory');
const invFound = Array.isArray(invList.data) && invList.data.find(i => i.id === invPayload.id);
log('Read inventory', !!invFound, 'nao encontrado');
if (invFound) {
  const invUpdate = await request('/api/inventory/' + invPayload.id, 'PUT', { ...invPayload, status: 'reservado', retailPrice: 66000 });
  log('Update inventory', invUpdate.status === 200, 'status=' + invUpdate.status);
  const invReRead = await request('/api/inventory');
  const invUpdated = Array.isArray(invReRead.data) && invReRead.data.find(i => i.id === invPayload.id);
  log('Re-read after update', invUpdated?.status === 'reservado' && invUpdated?.retailPrice === 66000, 'status=' + invUpdated?.status);
  const invDel = await request('/api/inventory/' + invPayload.id, 'DELETE');
  log('Delete inventory', invDel.status === 200, 'status=' + invDel.status);
}

// 3. CRM PIPELINE — CRUD
console.log('\n--- CRM Pipeline ---');
const leadPayload = {
  id: 'test-lead-' + Date.now(),
  dealershipId: 'motosul',
  customerName: 'Cliente Teste Integracao',
  type: 'lead',
  vehicleInterest: 'GSX-S1000GX',
  value: 98800,
  phone: '(51) 99999-9999',
  hot: true
};
const leadCreate = await request('/api/sales/pipeline', 'POST', leadPayload);
log('Create lead', leadCreate.status === 201, 'status=' + leadCreate.status);
const leadMove = await request('/api/sales/pipeline/' + leadPayload.id + '/status', 'PATCH', { type: 'proposta' });
log('Move lead', leadMove.status === 200, 'status=' + leadMove.status);
const leadList = await request('/api/sales/pipeline');
const leadFound = Array.isArray(leadList.data) && leadList.data.find(l => l.id === leadPayload.id && l.type === 'proposta');
log('Read moved lead', !!leadFound, 'nao encontrado/movido');
const leadDel = await request('/api/sales/pipeline/' + leadPayload.id, 'DELETE');
log('Delete lead', leadDel.status === 200, 'status=' + leadDel.status);

// 4. INTERACOES
console.log('\n--- Interacoes CRM ---');
const interPayload = { id: 'test-int-' + Date.now(), dealershipId: 'motosul', type: 'call', title: 'Ligacao de teste', description: 'Teste de integracao' };
const interCreate = await request('/api/sales/interactions', 'POST', interPayload);
log('Create interaction', interCreate.status === 201, 'status=' + interCreate.status);

// 5. ORDENS DE SERVICO — CRUD
console.log('\n--- Ordens de Servico ---');
const osPayload = {
  id: 'test-os-' + Date.now(),
  dealershipId: 'motosul',
  osNumber: 'OS-TEST-' + Date.now().toString().slice(-4),
  customerName: 'Cliente OS Teste',
  customerPhone: '(51) 98888-7777',
  vehicleModel: 'V-STROM 650XT',
  vehiclePlate: 'TEST123',
  status: 'em_aberto',
  vehicleKm: 5000,
  priority: 'Normal',
  partsTotal: 100,
  laborTotal: 200
};
const osCreate = await request('/api/service-orders', 'POST', osPayload);
log('Create OS', osCreate.status === 201, 'status=' + osCreate.status);
const osUpdate = await request('/api/service-orders/' + osPayload.id, 'PUT', { ...osPayload, status: 'em_execucao' });
log('Update OS', osUpdate.status === 200, 'status=' + osUpdate.status);
const osList = await request('/api/service-orders');
const osFound = Array.isArray(osList.data) && osList.data.find(o => o.id === osPayload.id && o.status === 'em_execucao');
log('Read OS', !!osFound, 'nao encontrada');
const osDel = await request('/api/service-orders/' + osPayload.id, 'DELETE');
log('Delete OS', osDel.status === 200, 'status=' + osDel.status);

// 6. TRANSITO
console.log('\n--- Lotes em Transito ---');
const transitPayload = { id: 'test-to-' + Date.now(), dealershipId: 'motosul', batchName: 'Lote Teste', eta: 'Previsao: 5 dias', status: 'No Prazo', location: 'BR-116', unitsCount: 3, value: 150000 };
const transCreate = await request('/api/transit', 'POST', transitPayload);
log('Create transit', transCreate.status === 201, 'status=' + transCreate.status);
const transList = await request('/api/transit');
const transFound = Array.isArray(transList.data) && transList.data.find(t => t.id === transitPayload.id);
log('Read transit', !!transFound, 'nao encontrado');
const transDel = await request('/api/transit/' + transitPayload.id, 'DELETE');
log('Delete transit', transDel.status === 200, 'status=' + transDel.status);

// 7. PEDIDOS DE PECAS
console.log('\n--- Pedidos de Pecas ---');
const partsPayload = {
  id: 'test-pp-' + Date.now(),
  orderNumber: 'PED-PEC-TEST-' + Date.now().toString().slice(-4),
  dealershipId: 'motosul',
  orderType: 'reposicao',
  status: 'aguardando_analise',
  items: [{
    id: 'test-ppi-' + Date.now(),
    partNumber: '12345-ABC',
    description: 'Filtro de oleo teste',
    quantity: 2,
    unitPrice: 45.5,
    totalPrice: 91
  }],
  subtotalAmount: 91,
  freightAmount: 0,
  freightMode: 'CIF',
  totalAmount: 91
};
const partsCreate = await request('/api/parts/orders', 'POST', partsPayload);
log('Create parts order', partsCreate.status === 201, 'status=' + partsCreate.status);
const partsUpdate = await request('/api/parts/orders/' + partsPayload.id + '/status', 'PATCH', { status: 'aprovado_fabrica', creditApproved: true, creditAnalyst: 'Teste' });
log('Update parts order', partsUpdate.status === 200, 'status=' + partsUpdate.status);
const partsList = await request('/api/parts/orders');
const partsFound = Array.isArray(partsList.data) && partsList.data.find(p => p.id === partsPayload.id && p.status === 'aprovado_fabrica');
log('Read parts order', !!partsFound, 'nao encontrado');
const partsDel = await request('/api/parts/orders/' + partsPayload.id, 'DELETE');
log('Delete parts order', partsDel.status === 200, 'status=' + partsDel.status);

// 8. CONDICOES DE PAGAMENTO
console.log('\n--- Condicoes de Pagamento ---');
const condPayload = {
  id: 'test-pay-' + Date.now(),
  brand: 'Suzuki',
  modelCode: 'GSX-S1000GX',
  modelYear: '2026',
  paymentMethodName: 'Condicao Teste Integracao',
  discountPercentage: 3,
  installments: 1,
  startDate: '2026-01-01',
  endDate: '2026-12-31',
  inLine: true,
  description: 'Condicao criada por teste de integracao'
};
const condCreate = await request('/api/payment-conditions', 'POST', condPayload);
log('Create condition', condCreate.status === 201, 'status=' + condCreate.status);
const condList = await request('/api/purchase/payment-conditions');
const condFound = Array.isArray(condList.data) && condList.data.find(c => c.id === condPayload.id);
log('Read condition', !!condFound, 'nao encontrada');
const condDel = await request('/api/payment-conditions/' + condPayload.id, 'DELETE');
log('Delete condition', condDel.status === 200, 'status=' + condDel.status);

// 9. WORKFLOW
console.log('\n--- Workflow ---');
const wfPayload = {
  id: 'test-wf-' + Date.now(),
  stepOrder: 9,
  stepName: 'Etapa Teste Integracao',
  department: 'Testes',
  responsibleUser: 'QA Automatizado',
  userEmail: 'qa@jtoledo.com.br',
  targetStatusOnApprove: 'aprovado_comercial',
  autoIntegrateProtheus: false,
  active: true,
  workflowType: 'pedido',
  notes: 'Etapa de teste'
};
const wfCreate = await request('/api/workflow-steps', 'POST', wfPayload);
log('Create workflow step', wfCreate.status === 201, 'status=' + wfCreate.status);
const wfUpdate = await request('/api/workflow-steps/' + wfPayload.id, 'PUT', { ...wfPayload, stepName: 'Etapa Teste Atualizada' });
log('Update workflow step', wfUpdate.status === 200, 'status=' + wfUpdate.status);
const wfList = await request('/api/workflow-steps');
const wfFound = Array.isArray(wfList.data) && wfList.data.find(w => w.id === wfPayload.id && w.stepName === 'Etapa Teste Atualizada');
log('Read workflow step', !!wfFound, 'nao encontrada');
const wfDel = await request('/api/workflow-steps/' + wfPayload.id, 'DELETE');
log('Delete workflow step', wfDel.status === 200, 'status=' + wfDel.status);

// 10. COMPROMISSOS
console.log('\n--- Compromissos Trimestrais ---');
const compPayload = {
  id: 'test-comp-' + Date.now(),
  dealershipId: 'motosul',
  brand: 'Suzuki',
  period: 'SET/NOV/2026',
  periodYear: 2026,
  month1Label: 'SETEMBRO',
  month2Label: 'OUTUBRO',
  month3Label: 'NOVEMBRO',
  regionalComercial: 'Regional Sul',
  avgMonthlyRegistration: 12,
  bikesPerInvoice: 4,
  transporterCode: 'TRP001',
  originCode: 'empresa_13_armazem',
  items: [{
    id: 'test-comp-i-' + Date.now(),
    model: 'GSX-S1000GX',
    brand: 'Suzuki',
    currentStockOwn: 2,
    currentStockBinBlocked: 1,
    currentStockBinLiberated: 3,
    month1Commitment: 2,
    month1Purchase: 2,
    month2Commitment: 3,
    month2Purchase: 3,
    month3Commitment: 2,
    month3Purchase: 2,
    suggestedMSRPUnit: 98800,
    factoryCostUnit: 79040
  }],
  totalUnitsMonth1: 2,
  totalUnitsMonth2: 3,
  totalUnitsMonth3: 2,
  totalEstimatedAmount: 553280
};
const compCreate = await request('/api/commitments', 'POST', compPayload);
log('Create commitment', compCreate.status === 201, 'status=' + compCreate.status);
const compUpdate = await request('/api/commitments/' + compPayload.id, 'PUT', { status: 'enviado' });
log('Update commitment', compUpdate.status === 200, 'status=' + compUpdate.status);
const compList = await request('/api/commitments');
const compFound = Array.isArray(compList.data) && compList.data.find(c => c.id === compPayload.id && c.status === 'enviado');
log('Read commitment', !!compFound, 'nao encontrado');
const compDel = await request('/api/commitments/' + compPayload.id, 'DELETE');
log('Delete non-draft commitment (deve rejeitar)', compDel.status === 422, 'status=' + compDel.status + ' (esperado 422, compromisso foi enviado)');

// 11. MATRIZ DE HABILITACAO
console.log('\n--- Matriz de Habilitacao ---');
const matrixSave = await request('/api/model-matrix', 'PUT', { dealershipId: 'motosul', enabledMap: { 'GSX-S1000GX': true, 'V-STROM-800DE': false } });
log('Save matrix', matrixSave.status === 200, 'status=' + matrixSave.status);
const matrixList = await request('/api/model-matrix?dealershipId=motosul');
log('Read matrix', matrixList.status === 200 && matrixList.data?.enabledMap?.['GSX-S1000GX'] === true, 'status=' + matrixList.status);

// 12. PROPOSTAS DE APROVACAO
console.log('\n--- Propostas de Aprovacao ---');
const propPayload = {
  id: 'test-prop-' + Date.now(),
  proposalNumber: 'PROP-TEST-' + Date.now().toString().slice(-4),
  dealershipId: 'motosul',
  brand: 'Suzuki',
  status: 'em_analise',
  financialApproved: false,
  commercialApproved: true,
  protheusIntegrated: false,
  dealerCode: 'SZX-4109'
};
const propCreate = await request('/api/proposals', 'POST', propPayload);
log('Create proposal', propCreate.status === 201, 'status=' + propCreate.status);
const propList = await request('/api/proposals');
const propFound = Array.isArray(propList.data) && propList.data.find(p => p.id === propPayload.id);
log('Read proposal', !!propFound, 'nao encontrada');
const propDel = await request('/api/proposals/' + propPayload.id, 'DELETE');
log('Delete proposal', propDel.status === 200, 'status=' + propDel.status);

// 13. VALIDACOES NEGATIVAS E AUTORIZACAO
console.log('\n--- Validacoes Negativas e Autorizacao ---');

// 13.1 Login com senha errada
const badLoginRes = await fetch(BASE + '/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email: 'eduardo.donato@jtoledo.com.br', password: 'senha-errada-123' })
});
log('Login com senha errada rejeitado (401)', badLoginRes.status === 401, 'status=' + badLoginRes.status);

// 13.2 Requisicao sem token
const noAuthRes = await fetch(BASE + '/api/inventory');
log('Requisicao sem token rejeitada (401)', noAuthRes.status === 401, 'status=' + noAuthRes.status);

// 13.3 Token invalido
const badTokRes = await fetch(BASE + '/api/inventory', { headers: { Authorization: 'Bearer token-invalido' } });
log('Token invalido rejeitado (401)', badTokRes.status === 401, 'status=' + badTokRes.status);

// 13.4 Payload incompleto
const inv400a = await request('/api/inventory', 'POST', { vin: 'SEM-CAMPOS' });
log('Create inventory sem campos obrigatorios (400)', inv400a.status === 400, 'status=' + inv400a.status);

// 13.5 Status fora da lista permitida
const inv400b = await request('/api/inventory', 'POST', {
  dealershipId: 'motosul', model: 'GSX-NEG', vin: 'NEG' + Date.now().toString().slice(-8),
  year: 2026, color: 'Vermelho', status: 'status_inexistente'
});
log('Create inventory com status invalido (400)', inv400b.status === 400, 'status=' + inv400b.status);

// 13.6 Duplicidade (VIN UNIQUE)
const dupPayload = {
  id: 'test-dup-' + Date.now(), dealershipId: 'motosul', model: 'GSX-DUP TESTE',
  vin: 'DUP' + Date.now().toString().slice(-8), year: 2026, color: 'Preto',
  costPrice: 50000, retailPrice: 65000, status: 'disponivel'
};
const dup1 = await request('/api/inventory', 'POST', dupPayload);
const dup2 = await request('/api/inventory', 'POST', dupPayload);
log('Create inventory duplicado rejeitado (201 + 409)', dup1.status === 201 && dup2.status === 409,
  'primeiro=' + dup1.status + ' segundo=' + dup2.status);
await request('/api/inventory/' + dupPayload.id, 'DELETE'); // cleanup

// 13.7 Registro inexistente — PUT e DELETE (payload completo e valido para isolar o 404)
const up404 = await request('/api/inventory/id-que-nao-existe', 'PUT', {
  dealershipId: 'motosul', model: 'GSX-404 TESTE', vin: 'NAOEXISTE404',
  year: 2026, color: 'Vermelho', status: 'disponivel'
});
log('Update veiculo inexistente (404)', up404.status === 404, 'status=' + up404.status);
const del404 = await request('/api/inventory/id-que-nao-existe', 'DELETE');
log('Delete veiculo inexistente (404)', del404.status === 404, 'status=' + del404.status);

// 13.8 Lote de transito inexistente
const tr404 = await request('/api/transit/lote-que-nao-existe', 'DELETE');
log('Delete lote inexistente (404)', tr404.status === 404, 'status=' + tr404.status);

// 13.9 Usuario dealer NAO pode acessar endpoint exclusivo montadora
const dealerLoginRes = await fetch(BASE + '/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email: 'marcelo@motosul.com.br', password: 'Suzuki@2026' })
});
const dealerData = await dealerLoginRes.json().catch(() => null);
log('Login dealer valido (200)', dealerLoginRes.status === 200 && !!dealerData?.token, 'status=' + dealerLoginRes.status);
if (dealerData?.token) {
  const dealerWfRes = await fetch(BASE + '/api/workflow-steps', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + dealerData.token },
    body: JSON.stringify({ id: 'x-dealer', stepOrder: 1, stepName: 'Tentativa Dealer' })
  });
  log('Dealer bloqueado em endpoint montadora (403)', dealerWfRes.status === 403, 'status=' + dealerWfRes.status);

  // 13.10 Dealer consegue ler dados do proprio escopo
  const dealerInvRes = await fetch(BASE + '/api/inventory', { headers: { Authorization: 'Bearer ' + dealerData.token } });
  log('Dealer le estoque (200)', dealerInvRes.status === 200, 'status=' + dealerInvRes.status);
}

// RESUMO FINAL
console.log('\n=== RESUMO: ' + passed + ' passou | ' + failed + ' falhou ===');
if (failures.length) {
  console.log('\nFALHAS:');
  failures.forEach(f => console.log('  - ' + f));
  process.exit(1);
}
process.exit(0);
