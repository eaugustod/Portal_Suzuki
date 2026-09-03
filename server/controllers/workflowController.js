import { getDbPool } from '../db.js';

const rowToStep = (r) => ({
  id: r.id_etapa,
  stepOrder: r.ordem_etapa,
  stepName: r.nome_etapa,
  department: r.departamento,
  responsibleUser: r.usuario_responsavel,
  userEmail: r.email_responsavel,
  targetStatusOnApprove: r.status_destino_ao_aprovar,
  autoIntegrateProtheus: !!r.integrar_protheus_automatico,
  active: !!r.ativo,
  workflowType: r.tipo_workflow,
  notes: r.observacoes
});

// GET /api/workflow-steps?tipo=
export const getWorkflowSteps = async (req, res) => {
  const tipo = req.query.tipo; // 'pedido' | 'fundo_reserva'
  try {
    const pool = await getDbPool();
    let query = `
      SELECT id_etapa, ordem_etapa, nome_etapa, departamento, usuario_responsavel, email_responsavel,
             status_destino_ao_aprovar, integrar_protheus_automatico, tipo_workflow, ativo, observacoes
      FROM dbo.WorkflowEtapas
      WHERE ativo = 1
    `;
    let request = pool.request();
    if (tipo) {
      query += ` AND tipo_workflow = @tipo`;
      request = request.input('tipo', String(tipo).substring(0, 30));
    }
    query += ` ORDER BY tipo_workflow, ordem_etapa`;
    const result = await request.query(query);
    res.json(result.recordset.map(rowToStep));
  } catch (err) {
    console.error('[Workflow API] Erro ao listar:', err);
    res.status(500).json({ error: 'Erro ao carregar etapas do workflow.' });
  }
};

// POST /api/workflow-steps
export const createWorkflowStep = async (req, res) => {
  const { stepOrder, stepName, department, responsibleUser, userEmail, targetStatusOnApprove, autoIntegrateProtheus, workflowType, notes } = req.body;

  if (!stepName || !department || !responsibleUser || !userEmail) {
    return res.status(400).json({ error: 'Nome, departamento e responsável são obrigatórios.' });
  }
  const tipo = workflowType || 'pedido';
  if (!['pedido', 'fundo_reserva'].includes(tipo)) return res.status(400).json({ error: 'Tipo de workflow inválido.' });

  try {
    const pool = await getDbPool();
    const id = req.body.id || `wf-${Date.now()}`;
    await pool.request()
      .input('id', id)
      .input('ordem', Number(stepOrder) || 1)
      .input('nome', String(stepName).substring(0, 100))
      .input('dep', String(department).substring(0, 50))
      .input('usr', String(responsibleUser).substring(0, 150))
      .input('email', String(userEmail).substring(0, 150))
      .input('destino', String(targetStatusOnApprove || '').substring(0, 50))
      .input('protheus', autoIntegrateProtheus ? 1 : 0)
      .input('tipo', tipo)
      .input('notas', notes ? String(notes).substring(0, 255) : null)
      .query(`
        INSERT INTO dbo.WorkflowEtapas (
          id_etapa, ordem_etapa, nome_etapa, departamento, usuario_responsavel, email_responsavel,
          status_destino_ao_aprovar, integrar_protheus_automatico, tipo_workflow, observacoes
        ) VALUES (
          @id, @ordem, @nome, @dep, @usr, @email,
          @destino, @protheus, @tipo, @notas
        )
      `);
    res.status(201).json({ success: true, message: 'Etapa de workflow criada com sucesso!', id });
  } catch (err) {
    console.error('[Workflow API] Erro ao criar:', err);
    if (/duplicate|UNIQUE|PK/.test(err.message)) return res.status(409).json({ error: 'Já existe uma etapa com este identificador.' });
    res.status(500).json({ error: 'Erro ao criar etapa do workflow.' });
  }
};

// PUT /api/workflow-steps/:id
export const updateWorkflowStep = async (req, res) => {
  const { id } = req.params;
  const { stepOrder, stepName, department, responsibleUser, userEmail, targetStatusOnApprove, autoIntegrateProtheus, workflowType, notes, active } = req.body;

  try {
    const pool = await getDbPool();
    const result = await pool.request()
      .input('id', id)
      .input('ordem', Number(stepOrder))
      .input('nome', String(stepName).substring(0, 100))
      .input('dep', String(department).substring(0, 50))
      .input('usr', String(responsibleUser).substring(0, 150))
      .input('email', String(userEmail).substring(0, 150))
      .input('destino', String(targetStatusOnApprove || '').substring(0, 50))
      .input('protheus', autoIntegrateProtheus ? 1 : 0)
      .input('tipo', String(workflowType || 'pedido').substring(0, 30))
      .input('ativo', active !== false ? 1 : 0)
      .input('notas', notes ? String(notes).substring(0, 255) : null)
      .query(`
        UPDATE dbo.WorkflowEtapas
        SET ordem_etapa = @ordem,
            nome_etapa = @nome,
            departamento = @dep,
            usuario_responsavel = @usr,
            email_responsavel = @email,
            status_destino_ao_aprovar = @destino,
            integrar_protheus_automatico = @protheus,
            tipo_workflow = @tipo,
            ativo = @ativo,
            observacoes = @notas
        WHERE id_etapa = @id
      `);
    if (result.rowsAffected[0] === 0) return res.status(404).json({ error: 'Etapa não localizada.' });
    res.json({ success: true, message: 'Etapa do workflow atualizada com sucesso!' });
  } catch (err) {
    console.error('[Workflow API] Erro ao atualizar:', err);
    res.status(500).json({ error: 'Erro ao atualizar etapa do workflow.' });
  }
};

// DELETE /api/workflow-steps/:id (desativação lógica)
export const deleteWorkflowStep = async (req, res) => {
  const { id } = req.params;
  try {
    const pool = await getDbPool();
    const result = await pool.request().input('id', id).query('UPDATE dbo.WorkflowEtapas SET ativo = 0 WHERE id_etapa = @id');
    if (result.rowsAffected[0] === 0) return res.status(404).json({ error: 'Etapa não localizada.' });
    res.json({ success: true, message: 'Etapa do workflow desativada.' });
  } catch (err) {
    console.error('[Workflow API] Erro ao excluir:', err);
    res.status(500).json({ error: 'Erro ao excluir etapa do workflow.' });
  }
};

export default { getWorkflowSteps, createWorkflowStep, updateWorkflowStep, deleteWorkflowStep };
