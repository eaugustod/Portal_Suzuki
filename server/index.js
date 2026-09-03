import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { getDbPool } from './db.js';

// Middlewares
import { authMiddleware, requireMontadora } from './middleware/authMiddleware.js';

// Controllers
import authController from './controllers/authController.js';
import dealershipController from './controllers/dealershipController.js';
import purchaseController from './controllers/purchaseController.js';
import freightController from './controllers/freightController.js';
import reserveFundController from './controllers/reserveFundController.js';
import commitmentController from './controllers/commitmentController.js';
import userController from './controllers/userController.js';
import inventoryController from './controllers/inventoryController.js';
import salesController from './controllers/salesController.js';
import serviceOrderController from './controllers/serviceOrderController.js';
import transitController from './controllers/transitController.js';
import partsController from './controllers/partsController.js';
import paymentConditionController from './controllers/paymentConditionController.js';
import workflowController from './controllers/workflowController.js';
import modelMatrixController from './controllers/modelMatrixController.js';
import proposalController from './controllers/proposalController.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001; // Porta dedicada do backend

app.use(cors());
app.use(express.json());

// ==========================================
// 1. HEALTHCHECK & STATUS DO BANCO
// ==========================================
app.get('/api/health', async (req, res) => {
  try {
    const pool = await getDbPool();
    const result = await pool.request().query('SELECT 1 AS alive, DB_NAME() AS db');
    res.json({
      status: 'ok',
      service: 'Portal Suzuki API Enterprise',
      database: result.recordset[0].db,
      connected: true,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      service: 'Portal Suzuki API',
      database: 'disconnected',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// ==========================================
// 2. AUTENTICAÇÃO E SESSÃO (PÚBLICO)
// ==========================================
app.post('/api/auth/login', authController.login);
app.post('/api/auth/forgot-password', authController.forgotPassword);
app.post('/api/auth/change-password', authMiddleware, authController.changePassword);
app.get('/api/auth/me', authMiddleware, authController.me);

// ==========================================
// 3. GESTÃO DE USUÁRIOS E CONTROLE DE ACESSO
// ==========================================
app.get('/api/users', authMiddleware, userController.getUsers);
app.get('/api/users/metadata', authMiddleware, userController.getMetadata);
app.post('/api/users', authMiddleware, userController.createUser);
app.put('/api/users/:id', authMiddleware, userController.updateUser);
app.post('/api/users/:id/reset-password', authMiddleware, userController.adminResetPassword);
app.patch('/api/users/:id/status', authMiddleware, userController.toggleStatus);

// ==========================================
// 4. CONCESSIONÁRIAS E GESTÃO DA REDE
// ==========================================
app.get('/api/dealerships', authMiddleware, dealershipController.getDealerships);
app.put('/api/dealerships/:id', authMiddleware, requireMontadora, dealershipController.updateDealership);

// ==========================================
// 4. PORTAL DE COMPRAS, MODELOS E PEDIDOS
// ==========================================
app.get('/api/purchase/models', authMiddleware, purchaseController.getPurchaseModels);
app.put('/api/purchase/models/:id', authMiddleware, requireMontadora, purchaseController.updatePurchaseModel);
app.get('/api/purchase/payment-conditions', authMiddleware, purchaseController.getPaymentConditions);
app.get('/api/purchase/freight', authMiddleware, purchaseController.getFreightTable);

// Tabela de fretes — CRUD persistido em dbo.TarifasFrete
app.get('/api/freight', authMiddleware, freightController.getFreightRates);
app.post('/api/freight', authMiddleware, requireMontadora, freightController.createFreightRate);
app.put('/api/freight/:id', authMiddleware, requireMontadora, freightController.updateFreightRate);
app.delete('/api/freight/:id', authMiddleware, requireMontadora, freightController.deleteFreightRate);
app.get('/api/purchase/orders', authMiddleware, purchaseController.getFactoryOrders);
app.post('/api/purchase/orders', authMiddleware, purchaseController.createFactoryOrder);
  app.patch('/api/purchase/orders/:id', authMiddleware, purchaseController.updateFactoryOrder);

  // ==========================================
  // 4.1 ESTOQUE DE VEÍCULOS (CONCESSIONÁRIAS)
  // ==========================================
  app.get('/api/inventory', authMiddleware, inventoryController.getInventory);
  app.post('/api/inventory', authMiddleware, inventoryController.createInventoryItem);
  app.put('/api/inventory/:id', authMiddleware, inventoryController.updateInventoryItem);
  app.delete('/api/inventory/:id', authMiddleware, inventoryController.deleteInventoryItem);

  // ==========================================
  // 4.2 CRM DE VENDAS (PIPELINE + INTERAÇÕES)
  // ==========================================
  app.get('/api/sales/pipeline', authMiddleware, salesController.getPipeline);
  app.post('/api/sales/pipeline', authMiddleware, salesController.createPipelineLead);
  app.patch('/api/sales/pipeline/:id/status', authMiddleware, salesController.movePipelineLead);
  app.delete('/api/sales/pipeline/:id', authMiddleware, salesController.deletePipelineLead);
  app.get('/api/sales/interactions', authMiddleware, salesController.getInteractions);
  app.post('/api/sales/interactions', authMiddleware, salesController.createInteraction);

  // ==========================================
  // 4.3 ORDENS DE SERVIÇO (PÓS-VENDA)
  // ==========================================
  app.get('/api/service-orders', authMiddleware, serviceOrderController.getServiceOrders);
  app.post('/api/service-orders', authMiddleware, serviceOrderController.createServiceOrder);
  app.put('/api/service-orders/:id', authMiddleware, serviceOrderController.updateServiceOrder);
  app.delete('/api/service-orders/:id', authMiddleware, serviceOrderController.deleteServiceOrder);

  // ==========================================
  // 4.4 LOTES EM TRÂNSITO
  // ==========================================
  app.get('/api/transit', authMiddleware, transitController.getTransitOrders);
  app.post('/api/transit', authMiddleware, transitController.createTransitOrder);
  app.delete('/api/transit/:id', authMiddleware, transitController.deleteTransitOrder);

  // ==========================================
  // 4.5 PEDIDOS DE PEÇAS (PORTAL DE PEÇAS)
  // ==========================================
  app.get('/api/parts/orders', authMiddleware, partsController.getPartsOrders);
  app.post('/api/parts/orders', authMiddleware, partsController.createPartsOrder);
  app.patch('/api/parts/orders/:id/status', authMiddleware, partsController.updatePartsOrder);
  app.delete('/api/parts/orders/:id', authMiddleware, partsController.deletePartsOrder);

  // ==========================================
  // 4.6 CONDIÇÕES DE PAGAMENTO (CRUD)
  // ==========================================
  app.get('/api/payment-conditions', authMiddleware, purchaseController.getPaymentConditions);
  app.post('/api/payment-conditions', authMiddleware, requireMontadora, paymentConditionController.createPaymentCondition);
  app.put('/api/payment-conditions/:id', authMiddleware, requireMontadora, paymentConditionController.updatePaymentCondition);
  app.delete('/api/payment-conditions/:id', authMiddleware, requireMontadora, paymentConditionController.deletePaymentCondition);

  // ==========================================
  // 4.7 WORKFLOW DE APROVAÇÕES
  // ==========================================
  app.get('/api/workflow-steps', authMiddleware, workflowController.getWorkflowSteps);
  app.post('/api/workflow-steps', authMiddleware, requireMontadora, workflowController.createWorkflowStep);
  app.put('/api/workflow-steps/:id', authMiddleware, requireMontadora, workflowController.updateWorkflowStep);
  app.delete('/api/workflow-steps/:id', authMiddleware, requireMontadora, workflowController.deleteWorkflowStep);

  // ==========================================
  // 4.8 MATRIZ DE HABILITAÇÃO DE MODELOS
  // ==========================================
  app.get('/api/model-matrix', authMiddleware, modelMatrixController.getModelMatrix);
  app.put('/api/model-matrix', authMiddleware, requireMontadora, modelMatrixController.saveModelMatrix);

  // ==========================================
  // 4.9 PROPOSTAS DE APROVAÇÃO (FICHA JTA/JTZ)
  // ==========================================
  app.get('/api/proposals', authMiddleware, proposalController.getProposals);
  app.post('/api/proposals', authMiddleware, proposalController.createProposal);
  app.put('/api/proposals/:id', authMiddleware, proposalController.updateProposal);
  app.delete('/api/proposals/:id', authMiddleware, proposalController.deleteProposal);

// ==========================================
// 5. FUNDO DE RESERVA (CONTA CORRENTE)
// ==========================================
app.get('/api/reserve-fund/statement', authMiddleware, reserveFundController.getStatement);
app.post('/api/reserve-fund/credit', authMiddleware, requireMontadora, reserveFundController.createCredit);
app.patch('/api/reserve-fund/:id/approve', authMiddleware, requireMontadora, reserveFundController.approveTransaction);

// ==========================================
// 6. COMPROMISSOS TRIMESTRAIS
// ==========================================
app.get('/api/commitments', authMiddleware, commitmentController.getCommitments);
  app.post('/api/commitments', authMiddleware, commitmentController.createCommitment);
  app.put('/api/commitments/:id', authMiddleware, commitmentController.updateCommitment);
  app.delete('/api/commitments/:id', authMiddleware, commitmentController.deleteCommitment);
  app.patch('/api/commitments/:id/status', authMiddleware, requireMontadora, commitmentController.updateStatus);

// ==========================================
// 7. ARQUIVOS ESTÁTICOS (PRODUÇÃO)
// ==========================================
const distPath = path.join(__dirname, '../dist');
app.use(express.static(distPath));

app.get('*', (req, res) => {
  if (req.path.startsWith('/api')) {
    return res.status(404).json({ error: 'Endpoint não encontrado.' });
  }
  res.sendFile(path.join(distPath, 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`[Portal Suzuki Server] Backend REST rodando na porta ${PORT} conectado ao SQL Server 172.16.0.31:1433`);
});
