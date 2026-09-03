-- ============================================================================
-- PORTAL SUZUKI — TRIGGERS, VIEWS E STORED PROCEDURES
-- Database: PortalSuzukiDB | Schema: dbo
-- ============================================================================

-- ============================================================================
-- 1. TRIGGERS
-- ============================================================================

-- Trigger 1: Atualização Automática de Saldo do Fundo de Reserva
CREATE OR ALTER TRIGGER dbo.TRG_FundoReserva_AtualizaSaldo
ON dbo.FundoReservaLancamentos
AFTER INSERT, UPDATE, DELETE
AS
BEGIN
    SET NOCOUNT ON;

    -- Concessionárias impactadas
    DECLARE @DealersImpactados TABLE (id_concessionaria VARCHAR(50));
    
    INSERT INTO @DealersImpactados (id_concessionaria)
    SELECT DISTINCT id_concessionaria FROM inserted WHERE id_concessionaria IS NOT NULL
    UNION
    SELECT DISTINCT id_concessionaria FROM deleted WHERE id_concessionaria IS NOT NULL;

    UPDATE c
    SET c.saldo_fundo_reserva = ISNULL((
        SELECT SUM(CASE WHEN f.tipo = 'credito' THEN f.valor ELSE -f.valor END)
        FROM dbo.FundoReservaLancamentos f
        WHERE f.id_concessionaria = c.id_concessionaria
          AND f.status = 'aprovado'
    ), 0),
    c.atualizado_em = SYSUTCDATETIME()
    FROM dbo.Concessionarias c
    INNER JOIN @DealersImpactados d ON c.id_concessionaria = d.id_concessionaria;
END;
GO

-- Trigger 2: Auditoria de Modificações da Montadora em Itens de Pedido
CREATE OR ALTER TRIGGER dbo.TRG_PedidoItens_AuditoriaAlteracao
ON dbo.PedidoFabricaItens
AFTER UPDATE
AS
BEGIN
    SET NOCOUNT ON;

    IF UPDATE(quantidade) OR UPDATE(nome_cor) OR UPDATE(id_condicao_pagamento)
    BEGIN
        UPDATE pi
        SET pi.modificado_pela_montadora = 1,
            pi.status_aceite_dealer = 'pendente_aceite',
            pi.status_aprovacao_item = 'alterado_montadora'
        FROM dbo.PedidoFabricaItens pi
        INNER JOIN inserted i ON pi.id_item = i.id_item
        INNER JOIN deleted d ON pi.id_item = d.id_item
        WHERE (ISNULL(i.quantidade, 0) <> ISNULL(d.quantidade, 0) 
            OR ISNULL(i.nome_cor, '') <> ISNULL(d.nome_cor, '') 
            OR ISNULL(i.id_condicao_pagamento, '') <> ISNULL(d.id_condicao_pagamento, ''));

        -- Sinaliza no cabeçalho do pedido que há pendência de aceite da concessionária
        UPDATE p
        SET p.pendente_aceite_concessionario = 1,
            p.atualizado_em = SYSUTCDATETIME()
        FROM dbo.PedidosFabrica p
        INNER JOIN inserted i ON p.id_pedido = i.id_pedido;
    END;
END;
GO

-- ============================================================================
-- 2. VIEWS
-- ============================================================================

-- View 1: Cockpit Consolidado da Montadora
CREATE OR ALTER VIEW dbo.vw_CockpitMontadoraConsolidado
AS
SELECT 
    COUNT(DISTINCT c.id_concessionaria) AS total_concessionarias_ativas,
    ISNULL(SUM(p.valor_total), 0) AS faturamento_pedidos_total,
    ISNULL(SUM(p.total_unidades), 0) AS total_motos_pedidas,
    (SELECT COUNT(*) FROM dbo.PedidosFabrica WHERE status_pedido = 'aguardando_analise') AS pedidos_pendentes_analise,
    (SELECT COUNT(*) FROM dbo.PedidosFabrica WHERE status_pedido = 'integrado_protheus') AS pedidos_faturados_erp,
    ISNULL(SUM(c.saldo_fundo_reserva), 0) AS saldo_fundo_reserva_rede,
    (SELECT COUNT(*) FROM dbo.EstoqueVeiculos WHERE status = 'disponivel') AS estoque_motos_patios_rede
FROM dbo.Concessionarias c
LEFT JOIN dbo.PedidosFabrica p ON c.id_concessionaria = p.id_concessionaria
WHERE c.tipo = 'concessionaria' AND c.status = 'ativa';
GO

-- View 2: Indicadores Consolidados por Card de Compra (Dealer x Modelo)
CREATE OR ALTER VIEW dbo.vw_IndicadoresCardCompra
AS
SELECT 
    c.id_concessionaria,
    m.id_modelo,
    m.nome_modelo,
    m.ano_modelo,
    m.marca,
    -- 1. Estoque atual no pátio do dealer
    ISNULL((
        SELECT COUNT(*) 
        FROM dbo.EstoqueVeiculos e 
        WHERE e.id_concessionaria = c.id_concessionaria 
          AND e.modelo = m.nome_modelo 
          AND e.status = 'disponivel'
    ), 0) AS estoque_concessionaria,
    
    -- 2. Compras realizadas no mês corrente
    ISNULL((
        SELECT SUM(pi.quantidade)
        FROM dbo.PedidoFabricaItens pi
        INNER JOIN dbo.PedidosFabrica pf ON pi.id_pedido = pf.id_pedido
        WHERE pf.id_concessionaria = c.id_concessionaria
          AND pi.id_modelo = m.id_modelo
          AND MONTH(pf.criado_em) = MONTH(SYSUTCDATETIME())
          AND YEAR(pf.criado_em) = YEAR(SYSUTCDATETIME())
          AND pf.status_pedido NOT IN ('cancelado', 'credito_reprovado')
    ), 0) AS compras_mes_corrente,
    
    -- 3. Quantidade do compromisso vigente
    ISNULL((
        SELECT TOP 1 cmi.compra_mes1
        FROM dbo.CompromissoCompraItens cmi
        INNER JOIN dbo.CompromissosCompra cc ON cmi.id_compromisso = cc.id_compromisso
        WHERE cc.id_concessionaria = c.id_concessionaria
          AND cmi.nome_modelo = m.nome_modelo
          AND cc.periodo_ano = YEAR(SYSUTCDATETIME())
        ORDER BY cc.criado_em DESC
    ), 0) AS compromisso_mes_vigente
FROM dbo.Concessionarias c
CROSS JOIN dbo.ModelosMotos m
WHERE c.tipo = 'concessionaria';
GO

-- ============================================================================
-- 3. STORED PROCEDURES
-- ============================================================================

-- Procedure 1: Autenticação Segura de Usuário
CREATE OR ALTER PROCEDURE dbo.sp_AutenticarUsuario
    @Email VARCHAR(150)
AS
BEGIN
    SET NOCOUNT ON;

    SELECT 
        u.id_usuario,
        u.id_concessionaria,
        c.codigo_dealer,
        c.nome_curto AS nome_concessionaria,
        c.tipo AS tipo_entidade,
        c.uf AS concessionaria_uf,
        c.armazem_origem_padrao,
        u.nome,
        u.email,
        u.senha_hash,
        u.cargo,
        u.status,
        u.senha_temporaria,
        u.trocar_senha_proximo_login,
        u.tentativas_falhas,
        u.data_bloqueio,
        p.codigo_perfil,
        p.tipo_escopo,
        d.nome AS nome_departamento
    FROM dbo.Usuarios u
    INNER JOIN dbo.PerfisAcesso p ON u.id_perfil = p.id_perfil
    INNER JOIN dbo.Departamentos d ON u.id_departamento = d.id_departamento
    LEFT JOIN dbo.Concessionarias c ON u.id_concessionaria = c.id_concessionaria
    WHERE u.email = @Email;
END;
GO

-- Procedure 2: Transmissão Atômica de Pedido de Fábrica com Fundo de Reserva
CREATE OR ALTER PROCEDURE dbo.sp_CriarPedidoFabrica
    @IdPedido VARCHAR(50),
    @NumeroPedido VARCHAR(50),
    @IdConcessionaria VARCHAR(50),
    @ModalidadeFrete VARCHAR(10),
    @CondicaoPagamentoGeral VARCHAR(100),
    @TotalUnidades INT,
    @ValorTotal DECIMAL(18,2),
    @Observacoes VARCHAR(MAX) = NULL,
    @UsouFundoReserva BIT = 0,
    @ValorAbatimentoFundo DECIMAL(18,2) = 0,
    @UsuarioEmail VARCHAR(150)
AS
BEGIN
    SET NOCOUNT ON;
    BEGIN TRANSACTION;

    BEGIN TRY
        -- 1. Se usou fundo de reserva, valida se há saldo disponível suficiente
        IF @UsouFundoReserva = 1 AND @ValorAbatimentoFundo > 0
        BEGIN
            DECLARE @SaldoAtual DECIMAL(18,2);
            SELECT @SaldoAtual = saldo_fundo_reserva 
            FROM dbo.Concessionarias WITH (UPDLOCK)
            WHERE id_concessionaria = @IdConcessionaria;

            IF @SaldoAtual < @ValorAbatimentoFundo
            BEGIN
                RAISERROR('Saldo de Fundo de Reserva insuficiente para este abatimento.', 16, 1);
            END

            -- Registra o lançamento de débito no Fundo de Reserva
            INSERT INTO dbo.FundoReservaLancamentos (
                id_lancamento, id_concessionaria, tipo, origem, marca, valor, 
                referencia, id_pedido, status, financeiro_aprovado, 
                usuario_responsavel, saldo_resultante, observacao
            )
            VALUES (
                'rf-deb-' + CONVERT(VARCHAR(36), NEWID()),
                @IdConcessionaria,
                'debito',
                'pedido_venda',
                'Suzuki',
                @ValorAbatimentoFundo,
                'Abatimento no Pedido ' + @NumeroPedido,
                @IdPedido,
                'aprovado',
                1,
                @UsuarioEmail,
                (@SaldoAtual - @ValorAbatimentoFundo),
                'Débito automático efetuado na transmissão do pedido'
            );
        END

        -- 2. Insere cabeçalho do pedido
        INSERT INTO dbo.PedidosFabrica (
            id_pedido, numero_pedido, id_concessionaria, modalidade_frete,
            condicao_pagamento_geral, status_pedido, total_unidades, valor_total,
            observacoes
        )
        VALUES (
            @IdPedido, @NumeroPedido, @IdConcessionaria, @ModalidadeFrete,
            @CondicaoPagamentoGeral, 'aguardando_analise', @TotalUnidades, @ValorTotal,
            @Observacoes
        );

        COMMIT TRANSACTION;
    END TRY
    BEGIN CATCH
        ROLLBACK TRANSACTION;
        THROW;
    END CATCH
END;
GO
