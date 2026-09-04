-- ============================================================================
-- PORTAL SUZUKI — MIGRATION: TABELAS OPERACIONAIS ADICIONAIS
-- Database: PortalSuzukiDB | Schema: dbo
-- Adição incremental segura (não destrutiva). Pode ser re-executada.
-- ============================================================================

-- ============================================================================
-- 1. PEDIDOS DE PEÇAS (CONCESSIONÁRIA → CD J.TOLEDO)
-- ============================================================================
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'PedidosPecas')
BEGIN
    CREATE TABLE dbo.PedidosPecas (
        id_pedido_peca VARCHAR(50) PRIMARY KEY,
        numero_pedido VARCHAR(30) NOT NULL UNIQUE,
        id_concessionaria VARCHAR(50) NOT NULL FOREIGN KEY REFERENCES dbo.Concessionarias(id_concessionaria),
        tipo_pedido VARCHAR(30) NOT NULL DEFAULT 'reposicao' CHECK (tipo_pedido IN ('reposicao', 'urgente_vor', 'garantia_pos_venda')),
        status_pedido VARCHAR(40) NOT NULL DEFAULT 'aguardando_analise',
        criado_em DATETIME2 DEFAULT SYSUTCDATETIME(),
        observacoes VARCHAR(MAX) NULL,
        vin_aplicacao VARCHAR(20) NULL,
        subtotal_amount DECIMAL(18,2) NOT NULL DEFAULT 0,
        discount_percentage DECIMAL(5,2) NOT NULL DEFAULT 0,
        freight_amount DECIMAL(18,2) NOT NULL DEFAULT 0,
        freight_mode VARCHAR(10) NOT NULL DEFAULT 'CIF',
        total_amount DECIMAL(18,2) NOT NULL DEFAULT 0,
        payment_method VARCHAR(100) NULL,
        total_pecas INT NOT NULL DEFAULT 0,
        total_itens_unicos INT NOT NULL DEFAULT 0,
        warehouse_alocado VARCHAR(60) NULL,
        estoque_verificado BIT NOT NULL DEFAULT 0,
        estoque_verificado_em DATETIME2 NULL,
        analista_estoque VARCHAR(100) NULL,
        credito_aprovado BIT NOT NULL DEFAULT 0,
        credito_aprovado_em DATETIME2 NULL,
        analista_credito VARCHAR(100) NULL,
        notas_credito VARCHAR(MAX) NULL,
        comercial_aprovado BIT NOT NULL DEFAULT 0,
        comercial_aprovado_em DATETIME2 NULL,
        gestor_comercial VARCHAR(100) NULL,
        notas_comercial VARCHAR(MAX) NULL,
        integrado_protheus BIT NOT NULL DEFAULT 0,
        numero_pedido_protheus VARCHAR(50) NULL,
        integrado_protheus_em DATETIME2 NULL,
        nfe_numero VARCHAR(50) NULL,
        codigo_rastreio VARCHAR(100) NULL,
        transportadora VARCHAR(100) NULL
    );
    CREATE INDEX IX_PedidosPecas_Dealer ON dbo.PedidosPecas(id_concessionaria, status_pedido);
END;
GO

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'PedidoPecaItens')
BEGIN
    CREATE TABLE dbo.PedidoPecaItens (
        id_item VARCHAR(50) PRIMARY KEY,
        id_pedido_peca VARCHAR(50) NOT NULL FOREIGN KEY REFERENCES dbo.PedidosPecas(id_pedido_peca) ON DELETE CASCADE,
        id_modelo VARCHAR(60) NULL,
        nome_modelo VARCHAR(100) NULL,
        marca VARCHAR(30) NULL,
        codigo_ilustracao VARCHAR(50) NULL,
        titulo_diagrama VARCHAR(150) NULL,
        part_number VARCHAR(60) NOT NULL,
        descricao_peca VARCHAR(200) NULL,
        grupo_categoria VARCHAR(60) NULL,
        essencial_manutencao BIT NOT NULL DEFAULT 0,
        quantidade INT NOT NULL DEFAULT 1,
        preco_unitario DECIMAL(18,2) NOT NULL DEFAULT 0,
        preco_total DECIMAL(18,2) NOT NULL DEFAULT 0,
        part_json NVARCHAR(MAX) NULL
    );
    CREATE INDEX IX_PedidoPecaItens_Pedido ON dbo.PedidoPecaItens(id_pedido_peca);
END;
GO

-- ============================================================================
-- 2. INTERAÇÕES DO CRM (LOG DE ATIVIDADES POR CONCESSIONÁRIA)
-- ============================================================================
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'InteracoesCrm')
BEGIN
    CREATE TABLE dbo.InteracoesCrm (
        id_interacao VARCHAR(50) PRIMARY KEY,
        id_concessionaria VARCHAR(50) NOT NULL FOREIGN KEY REFERENCES dbo.Concessionarias(id_concessionaria),
        tipo VARCHAR(30) NOT NULL,
        titulo VARCHAR(200) NOT NULL,
        descricao VARCHAR(MAX) NULL,
        criado_em DATETIME2 DEFAULT SYSUTCDATETIME()
    );
    CREATE INDEX IX_Interacoes_Dealer ON dbo.InteracoesCrm(id_concessionaria);
END;
GO

-- ============================================================================
-- 3. PROPOSTAS DE APROVAÇÃO (FICHA JTA + JTZ) — DOCUMENTO JSON
-- ============================================================================
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'PropostasAprovacao')
BEGIN
    CREATE TABLE dbo.PropostasAprovacao (
        id_proposta VARCHAR(60) PRIMARY KEY,
        numero_proposta VARCHAR(60) NOT NULL UNIQUE,
        id_concessionaria VARCHAR(50) NOT NULL FOREIGN KEY REFERENCES dbo.Concessionarias(id_concessionaria),
        marca VARCHAR(30) NOT NULL,
        status VARCHAR(30) NOT NULL DEFAULT 'em_analise',
        financeiro_aprovado BIT NOT NULL DEFAULT 0,
        comercial_aprovado BIT NOT NULL DEFAULT 0,
        protheus_integrado BIT NOT NULL DEFAULT 0,
        documento_json NVARCHAR(MAX) NOT NULL,
        criado_em DATETIME2 DEFAULT SYSUTCDATETIME(),
        atualizado_em DATETIME2 DEFAULT SYSUTCDATETIME()
    );
    CREATE INDEX IX_Propostas_Dealer ON dbo.PropostasAprovacao(id_concessionaria, status);
END;
GO

-- ============================================================================
-- 4. COLUNAS COMPLEMENTARES (ADIÇÃO IDEMPOTENTE)
-- ============================================================================

-- CRM Pipeline Leads: notas observadas pelo consultor
IF COL_LENGTH('dbo.CrmPipelineLeads', 'notas') IS NULL
BEGIN
    ALTER TABLE dbo.CrmPipelineLeads ADD notas VARCHAR(MAX) NULL;
END;
GO

-- Ordem de Serviço: campos operacionais adicionais da vista ServiceOrder
IF COL_LENGTH('dbo.OficinaOrdensServico', 'vehicle_km') IS NULL
BEGIN
    ALTER TABLE dbo.OficinaOrdensServico ADD
        vehicle_km INT NULL,
        fuel_level VARCHAR(30) NULL,
        entry_date VARCHAR(30) NULL,
        estimated_completion VARCHAR(60) NULL,
        priority VARCHAR(20) NULL,
        reported_symptoms VARCHAR(MAX) NULL;
END;
GO

-- Compromissos: vínculo com a proposta de aprovação gerada
IF COL_LENGTH('dbo.CompromissosCompra', 'id_proposta_aprovacao') IS NULL
BEGIN
    ALTER TABLE dbo.CompromissosCompra ADD id_proposta_aprovacao VARCHAR(60) NULL;
END;
GO

-- TarifasFrete: coluna marca para segmentação de fretes por montadora/marca
IF COL_LENGTH('dbo.TarifasFrete', 'marca') IS NULL
BEGIN
    ALTER TABLE dbo.TarifasFrete ADD marca VARCHAR(30) NOT NULL DEFAULT 'Suzuki';
END;
GO

-- ============================================================================
-- 5. TABELA DE MARCAS (CADASTRO CENTRALIZADO DE MARCAS)
-- ============================================================================
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Marcas')
BEGIN
    CREATE TABLE dbo.Marcas (
        id_marca VARCHAR(50) PRIMARY KEY,
        nome VARCHAR(50) NOT NULL UNIQUE,
        codigo VARCHAR(20) NOT NULL UNIQUE,
        razao_social VARCHAR(150) NULL,
        cnpj VARCHAR(20) NULL,
        cor_primaria VARCHAR(30) NOT NULL DEFAULT '#00428c',
        cor_secundaria VARCHAR(30) NULL DEFAULT '#ffffff',
        logo_url VARCHAR(500) NULL,
        site_oficial VARCHAR(255) NULL,
        descricao VARCHAR(500) NULL,
        pais_origem VARCHAR(50) DEFAULT 'Brasil',
        ativo BIT NOT NULL DEFAULT 1,
        ordem_exibicao INT NOT NULL DEFAULT 0,
        criado_em DATETIME2 DEFAULT SYSUTCDATETIME(),
        atualizado_em DATETIME2 DEFAULT SYSUTCDATETIME()
    );
    CREATE INDEX IX_Marcas_Ativo ON dbo.Marcas(ativo, ordem_exibicao);
END;
GO

-- Carga inicial de marcas padrões caso a tabela esteja vazia
IF EXISTS (SELECT * FROM sys.tables WHERE name = 'Marcas')
BEGIN
    IF NOT EXISTS (SELECT 1 FROM dbo.Marcas WHERE id_marca = 'brand-suzuki')
    BEGIN
        INSERT INTO dbo.Marcas (id_marca, nome, codigo, razao_social, cnpj, cor_primaria, cor_secundaria, logo_url, site_oficial, descricao, pais_origem, ativo, ordem_exibicao)
        VALUES ('brand-suzuki', 'Suzuki', 'SUZ', 'J. Toledo Suzuki Motos do Brasil Ltda.', '61.123.456/0001-90', '#00428c', '#e11d48', '/suzuki-logo.png', 'https://suzukimotos.com.br', 'Motocicletas de alta performance esportiva, tecnologia japonesa de ponta e tradição global.', 'Japão', 1, 1);
    END;

    IF NOT EXISTS (SELECT 1 FROM dbo.Marcas WHERE id_marca = 'brand-haojue')
    BEGIN
        INSERT INTO dbo.Marcas (id_marca, nome, codigo, razao_social, cnpj, cor_primaria, cor_secundaria, logo_url, site_oficial, descricao, pais_origem, ativo, ordem_exibicao)
        VALUES ('brand-haojue', 'Haojue', 'HAO', 'JTZ Indústria e Comércio de Motocicletas Ltda.', '17.382.491/0001-33', '#dc2626', '#171717', '', 'https://haojuemotos.com.br', 'Líder em motocicletas urbanas utilitárias, baixa e média cilindrada com economia, robustez e conforto.', 'China', 1, 2);
    END;

    IF NOT EXISTS (SELECT 1 FROM dbo.Marcas WHERE id_marca = 'brand-zontes')
    BEGIN
        INSERT INTO dbo.Marcas (id_marca, nome, codigo, razao_social, cnpj, cor_primaria, cor_secundaria, logo_url, site_oficial, descricao, pais_origem, ativo, ordem_exibicao)
        VALUES ('brand-zontes', 'Zontes', 'ZON', 'JTZ Indústria e Comércio de Motocicletas Ltda.', '17.382.491/0001-33', '#d97706', '#1e293b', '', 'https://zontesmotos.com.br', 'Design futurista e arrojado, eletrônica de última geração, scooters executivas e motos premium.', 'China', 1, 3);
    END;

    IF NOT EXISTS (SELECT 1 FROM dbo.Marcas WHERE id_marca = 'brand-kymco')
    BEGIN
        INSERT INTO dbo.Marcas (id_marca, nome, codigo, razao_social, cnpj, cor_primaria, cor_secundaria, logo_url, site_oficial, descricao, pais_origem, ativo, ordem_exibicao)
        VALUES ('brand-kymco', 'Kymco', 'KYM', 'JTZ Indústria e Comércio de Motocicletas Ltda.', '17.382.491/0001-33', '#ea580c', '#0f172a', '', 'https://kymcomotos.com.br', 'Referência global consolidada em maxi-scooters premium de alta cilindrada e conforto urbano.', 'Taiwan', 1, 4);
    END;

    IF NOT EXISTS (SELECT 1 FROM dbo.Marcas WHERE id_marca = 'brand-hisun')
    BEGIN
        INSERT INTO dbo.Marcas (id_marca, nome, codigo, razao_social, cnpj, cor_primaria, cor_secundaria, logo_url, site_oficial, descricao, pais_origem, ativo, ordem_exibicao)
        VALUES ('brand-hisun', 'Hisun', 'HIS', 'JTZ Indústria e Comércio de Motocicletas Ltda.', '17.382.491/0001-33', '#16a34a', '#14532d', '', 'https://hisunmotors.com.br', 'Veículos utilitários off-road de alta resistência, ATVs e UTVs para agronegócio e aventura.', 'Estados Unidos / China', 1, 5);
    END;

    IF NOT EXISTS (SELECT 1 FROM dbo.Marcas WHERE id_marca = 'brand-quadriciclos')
    BEGIN
        INSERT INTO dbo.Marcas (id_marca, nome, codigo, razao_social, cnpj, cor_primaria, cor_secundaria, logo_url, site_oficial, descricao, pais_origem, ativo, ordem_exibicao)
        VALUES ('brand-quadriciclos', 'Quadriciclos', 'QUA', 'J. Toledo Distribuidora de Veículos Especiais Ltda.', '61.123.456/0002-71', '#9333ea', '#581c87', '', 'https://suzukimotos.com.br/quadriciclos', 'Linha completa e versátil de quadriciclos recreativos e esportivos para lazer e trabalho no campo.', 'Brasil / Japão', 1, 6);
    END;
END;
GO

-- Remoção segura de qualquer restrição CHECK rígida antiga em ConcessionariaMarcas para suportar marcas dinâmicas
DECLARE @chkName NVARCHAR(256);
SELECT @chkName = cc.name
FROM sys.check_constraints cc
WHERE cc.parent_object_id = OBJECT_ID('dbo.ConcessionariaMarcas');
IF @chkName IS NOT NULL
BEGIN
    EXEC('ALTER TABLE dbo.ConcessionariaMarcas DROP CONSTRAINT [' + @chkName + ']');
END;
GO

