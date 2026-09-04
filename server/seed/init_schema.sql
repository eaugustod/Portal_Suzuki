-- ============================================================================
-- PORTAL SUZUKI — SCHEMA DDL COMPLETO (MICROSOFT SQL SERVER 2022)
-- Database: PortalSuzukiDB | Schema: dbo
-- ============================================================================

-- ============================================================================
-- 1. SEGURANÇA, AUTENTICAÇÃO E CONTROLE DE ACESSO (RBAC)
-- ============================================================================

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Departamentos')
BEGIN
    CREATE TABLE dbo.Departamentos (
        id_departamento INT IDENTITY(1,1) PRIMARY KEY,
        nome VARCHAR(100) NOT NULL UNIQUE,
        sigla VARCHAR(20) NOT NULL,
        descricao VARCHAR(255) NULL,
        ativo BIT NOT NULL DEFAULT 1,
        criado_em DATETIME2 DEFAULT SYSUTCDATETIME()
    );
END;

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'PerfisAcesso')
BEGIN
    CREATE TABLE dbo.PerfisAcesso (
        id_perfil INT IDENTITY(1,1) PRIMARY KEY,
        codigo_perfil VARCHAR(50) NOT NULL UNIQUE,
        nome VARCHAR(100) NOT NULL,
        tipo_escopo VARCHAR(20) NOT NULL CHECK (tipo_escopo IN ('montadora', 'concessionaria')),
        descricao VARCHAR(255) NULL,
        ativo BIT NOT NULL DEFAULT 1
    );
END;

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Permissoes')
BEGIN
    CREATE TABLE dbo.Permissoes (
        id_permissao INT IDENTITY(1,1) PRIMARY KEY,
        chave_modulo VARCHAR(50) NOT NULL,
        acao VARCHAR(50) NOT NULL,
        descricao VARCHAR(255) NULL,
        CONSTRAINT UQ_Permissao UNIQUE (chave_modulo, acao)
    );
END;

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'PerfilPermissoes')
BEGIN
    CREATE TABLE dbo.PerfilPermissoes (
        id_perfil INT NOT NULL FOREIGN KEY REFERENCES dbo.PerfisAcesso(id_perfil) ON DELETE CASCADE,
        id_permissao INT NOT NULL FOREIGN KEY REFERENCES dbo.Permissoes(id_permissao) ON DELETE CASCADE,
        PRIMARY KEY (id_perfil, id_permissao)
    );
END;

-- ============================================================================
-- 2. REDE DE CONCESSIONÁRIAS E MONTADORA
-- ============================================================================

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Concessionarias')
BEGIN
    CREATE TABLE dbo.Concessionarias (
        id_concessionaria VARCHAR(50) PRIMARY KEY,
        codigo_dealer VARCHAR(20) NOT NULL UNIQUE,
        nome_fantasia VARCHAR(150) NOT NULL,
        nome_curto VARCHAR(60) NOT NULL,
        razao_social VARCHAR(200) NOT NULL,
        slogan VARCHAR(255) NULL,
        cnpj VARCHAR(20) NOT NULL UNIQUE,
        inscricao_estadual VARCHAR(30) NULL,
        inscricao_municipal VARCHAR(30) NULL,
        cnae VARCHAR(30) NULL,
        regime_tributario VARCHAR(50) NULL,
        tipo VARCHAR(20) NOT NULL CHECK (tipo IN ('montadora', 'concessionaria')),
        status VARCHAR(20) NOT NULL DEFAULT 'ativa' CHECK (status IN ('ativa', 'homologacao', 'suspensa', 'bloqueada')),
        classificacao_tier VARCHAR(20) NOT NULL DEFAULT 'Prata' CHECK (classificacao_tier IN ('Diamante', 'Ouro', 'Prata', 'Bronze')),
        numero_contrato VARCHAR(50) NULL,
        validade_contrato DATE NULL,
        data_fundacao DATE NULL,
        meta_mensal_faturamento DECIMAL(18,2) NOT NULL DEFAULT 0,
        limite_credito DECIMAL(18,2) NOT NULL DEFAULT 0,
        limite_credito_utilizado DECIMAL(18,2) NOT NULL DEFAULT 0,
        limite_floor_plan DECIMAL(18,2) NOT NULL DEFAULT 0,
        rating_credito VARCHAR(20) NOT NULL DEFAULT 'A',
        taxa_pontualidade_pagamento DECIMAL(5,2) DEFAULT 100.00,
        saldo_fundo_reserva DECIMAL(18,2) NOT NULL DEFAULT 0,
        cota_alocada INT NOT NULL DEFAULT 0,
        cota_pedida INT NOT NULL DEFAULT 0,
        unidades_estoque_ativo INT NOT NULL DEFAULT 0,
        vendas_mensais_count INT NOT NULL DEFAULT 0,
        percentual_rebate DECIMAL(5,2) DEFAULT 0,
        cor_banner VARCHAR(100) DEFAULT 'from-blue-950 to-neutral-900',
        cor_destaque VARCHAR(20) DEFAULT '#2563eb',
        telefone VARCHAR(30) NOT NULL,
        email_contato VARCHAR(150) NULL,
        gerente_responsavel VARCHAR(100) NULL,
        email_financeiro VARCHAR(150) NULL,
        telefone_financeiro VARCHAR(30) NULL,
        
        -- Endereço e Logística
        cep VARCHAR(10) NULL,
        logradouro VARCHAR(150) NULL,
        numero VARCHAR(20) NULL,
        complemento VARCHAR(100) NULL,
        bairro VARCHAR(100) NULL,
        cidade VARCHAR(100) NOT NULL,
        uf CHAR(2) NOT NULL,
        regiao_brasil VARCHAR(30) NOT NULL CHECK (regiao_brasil IN ('Sul', 'Sudeste', 'Centro-Oeste', 'Nordeste', 'Norte')),
        area_showroom_m2 DECIMAL(10,2) NULL,
        area_oficina_m2 DECIMAL(10,2) NULL,
        possui_baia_descarga BIT DEFAULT 1,
        restricoes_descarga VARCHAR(MAX) NULL,
        
        -- Origem de Faturamento Padronizada (Regra Empresa 13 / Manaus LE 16)
        armazem_origem_padrao VARCHAR(50) NOT NULL DEFAULT 'empresa_13_armazem',
        empresa_origem VARCHAR(20) DEFAULT '13',
        filial_origem VARCHAR(20) DEFAULT '01',
        local_estoque_origem VARCHAR(20) DEFAULT 'Armazém',
        
        notas_credito VARCHAR(MAX) NULL,
        notas_termos_especiais VARCHAR(MAX) NULL,
        ultima_revisao_credito DATE NULL,
        criado_em DATETIME2 DEFAULT SYSUTCDATETIME(),
        atualizado_em DATETIME2 DEFAULT SYSUTCDATETIME()
    );
END;

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Usuarios')
BEGIN
    CREATE TABLE dbo.Usuarios (
        id_usuario VARCHAR(50) PRIMARY KEY,
        id_concessionaria VARCHAR(50) NULL FOREIGN KEY REFERENCES dbo.Concessionarias(id_concessionaria),
        id_departamento INT NOT NULL FOREIGN KEY REFERENCES dbo.Departamentos(id_departamento),
        id_perfil INT NOT NULL FOREIGN KEY REFERENCES dbo.PerfisAcesso(id_perfil),
        nome VARCHAR(150) NOT NULL,
        email VARCHAR(150) NOT NULL UNIQUE,
        senha_hash VARCHAR(255) NOT NULL,
        cpf VARCHAR(14) NULL,
        telefone VARCHAR(30) NULL,
        cargo VARCHAR(100) NOT NULL,
        status VARCHAR(20) NOT NULL DEFAULT 'ativo' CHECK (status IN ('ativo', 'inativo', 'bloqueado')),
        senha_temporaria BIT NOT NULL DEFAULT 0,
        trocar_senha_proximo_login BIT NOT NULL DEFAULT 0,
        tentativas_falhas INT NOT NULL DEFAULT 0,
        data_bloqueio DATETIME2 NULL,
        ultimo_login DATETIME2 NULL,
        criado_em DATETIME2 DEFAULT SYSUTCDATETIME(),
        atualizado_em DATETIME2 DEFAULT SYSUTCDATETIME()
    );
    CREATE INDEX IX_Usuarios_Email ON dbo.Usuarios(email);
    CREATE INDEX IX_Usuarios_Concessionaria ON dbo.Usuarios(id_concessionaria);
END;

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'ConcessionariaContasBancarias')
BEGIN
    CREATE TABLE dbo.ConcessionariaContasBancarias (
        id_conta INT IDENTITY(1,1) PRIMARY KEY,
        id_concessionaria VARCHAR(50) NOT NULL UNIQUE FOREIGN KEY REFERENCES dbo.Concessionarias(id_concessionaria) ON DELETE CASCADE,
        banco_codigo VARCHAR(10) NOT NULL,
        banco_nome VARCHAR(100) NOT NULL,
        agencia VARCHAR(20) NOT NULL,
        conta_numero VARCHAR(30) NOT NULL,
        tipo_conta VARCHAR(30) DEFAULT 'Conta Corrente PJ',
        chave_pix VARCHAR(150) NULL,
        tipo_chave_pix VARCHAR(30) NULL
    );
END;

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

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'ConcessionariaMarcas')
BEGIN
    CREATE TABLE dbo.ConcessionariaMarcas (
        id_concessionaria VARCHAR(50) NOT NULL FOREIGN KEY REFERENCES dbo.Concessionarias(id_concessionaria) ON DELETE CASCADE,
        marca VARCHAR(50) NOT NULL,
        PRIMARY KEY (id_concessionaria, marca)
    );
END;

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'RegionaisMarca')
BEGIN
    CREATE TABLE dbo.RegionaisMarca (
        id_regional VARCHAR(50) PRIMARY KEY,
        codigo_regional VARCHAR(20) NOT NULL UNIQUE,
        nome VARCHAR(100) NOT NULL,
        marca VARCHAR(30) NOT NULL,
        gerente_regional VARCHAR(100) NOT NULL,
        email VARCHAR(150) NOT NULL,
        telefone VARCHAR(30) NULL,
        ufs_atendidas VARCHAR(200) NOT NULL,
        ativo BIT NOT NULL DEFAULT 1
    );
END;

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'ConcessionariaRegionais')
BEGIN
    CREATE TABLE dbo.ConcessionariaRegionais (
        id_concessionaria VARCHAR(50) NOT NULL FOREIGN KEY REFERENCES dbo.Concessionarias(id_concessionaria),
        id_regional VARCHAR(50) NOT NULL FOREIGN KEY REFERENCES dbo.RegionaisMarca(id_regional),
        PRIMARY KEY (id_concessionaria, id_regional)
    );
END;

-- ============================================================================
-- 3. MODELOS, CORES E MATRIZ DE DISPONIBILIDADE
-- ============================================================================

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'ModelosMotos')
BEGIN
    CREATE TABLE dbo.ModelosMotos (
        id_modelo VARCHAR(50) PRIMARY KEY,
        marca VARCHAR(30) NOT NULL,
        nome_modelo VARCHAR(100) NOT NULL,
        nome_comercial VARCHAR(150) NOT NULL,
        ano_modelo VARCHAR(10) NOT NULL,
        categoria VARCHAR(50) NOT NULL,
        cilindrada VARCHAR(20) NOT NULL,
        tipo_motor VARCHAR(150) NULL,
        potencia VARCHAR(50) NULL,
        torque VARCHAR(50) NULL,
        custo_fabrica_base DECIMAL(18,2) NOT NULL,
        preco_publico_sugerido DECIMAL(18,2) NOT NULL,
        imagem_padrao_url VARCHAR(500) NOT NULL,
        url_oficial VARCHAR(500) NULL,
        descricao VARCHAR(MAX) NULL,
        ativo BIT NOT NULL DEFAULT 1,
        criado_em DATETIME2 DEFAULT SYSUTCDATETIME()
    );
END;

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'ModeloVariantesCores')
BEGIN
    CREATE TABLE dbo.ModeloVariantesCores (
        id_variante VARCHAR(60) PRIMARY KEY,
        id_modelo VARCHAR(50) NOT NULL FOREIGN KEY REFERENCES dbo.ModelosMotos(id_modelo) ON DELETE CASCADE,
        nome_cor VARCHAR(60) NOT NULL,
        codigo_cor VARCHAR(30) NULL,
        codigo_hex VARCHAR(10) NOT NULL,
        imagem_especifica_url VARCHAR(500) NULL,
        status_disponibilidade VARCHAR(30) NOT NULL DEFAULT 'disponivel' CHECK (status_disponibilidade IN ('disponivel', 'poucas_unidades', 'indisponivel')),
        quantidade_disponivel_fabrica INT NOT NULL DEFAULT 0,
        ordem_exibicao INT NOT NULL DEFAULT 0,
        ativo BIT NOT NULL DEFAULT 1
    );
    CREATE INDEX IX_Variantes_Modelo ON dbo.ModeloVariantesCores(id_modelo);
END;

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'MatrizHabilitacaoModelos')
BEGIN
    CREATE TABLE dbo.MatrizHabilitacaoModelos (
        id_concessionaria VARCHAR(50) NOT NULL FOREIGN KEY REFERENCES dbo.Concessionarias(id_concessionaria) ON DELETE CASCADE,
        chave_item VARCHAR(100) NOT NULL,
        habilitado BIT NOT NULL DEFAULT 1,
        atualizado_em DATETIME2 DEFAULT SYSUTCDATETIME(),
        PRIMARY KEY (id_concessionaria, chave_item)
    );
END;

-- ============================================================================
-- 4. CONDIÇÕES DE PAGAMENTO, FRETE E PARÂMETROS DE CUSTO
-- ============================================================================

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'CondicoesPagamento')
BEGIN
    CREATE TABLE dbo.CondicoesPagamento (
        id_condicao VARCHAR(50) PRIMARY KEY,
        marca VARCHAR(30) NOT NULL,
        codigo_modelo VARCHAR(50) NOT NULL,
        ano_modelo VARCHAR(10) NOT NULL,
        nome_condicao VARCHAR(150) NOT NULL,
        percentual_desconto DECIMAL(5,2) NOT NULL DEFAULT 0,
        quantidade_parcelas INT NOT NULL DEFAULT 1,
        data_inicio_vigencia DATE NOT NULL,
        data_fim_vigencia DATE NOT NULL,
        em_linha BIT NOT NULL DEFAULT 1,
        ativo BIT NOT NULL DEFAULT 1,
        descricao VARCHAR(255) NULL,
        criado_em DATETIME2 DEFAULT SYSUTCDATETIME()
    );
    CREATE INDEX IX_Condicoes_Vigencia ON dbo.CondicoesPagamento(marca, codigo_modelo, ano_modelo, ativo, data_inicio_vigencia, data_fim_vigencia);
END;

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'TarifasFrete')
BEGIN
    CREATE TABLE dbo.TarifasFrete (
        id_tarifa VARCHAR(50) PRIMARY KEY,
        marca VARCHAR(30) NOT NULL DEFAULT 'Suzuki',
        uf CHAR(2) NOT NULL,
        regiao_brasil VARCHAR(30) NOT NULL,
        armazem_origem VARCHAR(50) NOT NULL,
        descricao_origem VARCHAR(100) NOT NULL,
        custo_por_unidade DECIMAL(18,2) NOT NULL,
        prazo_estimado_dias INT NOT NULL,
        tipo_localidade VARCHAR(20) DEFAULT 'capital' CHECK (tipo_localidade IN ('capital', 'interior')),
        ativo BIT NOT NULL DEFAULT 1,
        atualizado_em DATETIME2 DEFAULT SYSUTCDATETIME()
    );
    CREATE INDEX IX_TarifasFrete_UF ON dbo.TarifasFrete(marca, uf, armazem_origem);
END;

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'ParametrosMemorialCalculo')
BEGIN
    CREATE TABLE dbo.ParametrosMemorialCalculo (
        id_parametro INT IDENTITY(1,1) PRIMARY KEY,
        id_modelo VARCHAR(50) NOT NULL FOREIGN KEY REFERENCES dbo.ModelosMotos(id_modelo),
        aliquota_icms DECIMAL(5,2) NOT NULL DEFAULT 12.00,
        aliquota_pis_cofins DECIMAL(5,2) NOT NULL DEFAULT 9.25,
        outras_taxas DECIMAL(18,2) NOT NULL DEFAULT 0,
        ativo BIT NOT NULL DEFAULT 1
    );
END;

-- ============================================================================
-- 5. FUNDO DE RESERVA (CONFIGURAÇÕES E EXTRATO CONTA CORRENTE)
-- ============================================================================

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'FundoReservaConfigMarcas')
BEGIN
    CREATE TABLE dbo.FundoReservaConfigMarcas (
        id_config VARCHAR(50) PRIMARY KEY,
        marca VARCHAR(30) NOT NULL UNIQUE,
        percentual_contribuicao DECIMAL(5,2) NOT NULL DEFAULT 0,
        valor_fixo_por_unidade DECIMAL(18,2) NOT NULL DEFAULT 0,
        data_inicio DATE NOT NULL,
        data_fim DATE NOT NULL,
        ativo BIT NOT NULL DEFAULT 1,
        observacoes VARCHAR(255) NULL
    );
END;

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'FundoReservaLancamentos')
BEGIN
    CREATE TABLE dbo.FundoReservaLancamentos (
        id_lancamento VARCHAR(50) PRIMARY KEY,
        id_concessionaria VARCHAR(50) NOT NULL FOREIGN KEY REFERENCES dbo.Concessionarias(id_concessionaria),
        tipo VARCHAR(10) NOT NULL CHECK (tipo IN ('credito', 'debito')),
        origem VARCHAR(30) NOT NULL CHECK (origem IN ('montadora_credito', 'rd_station', 'pedido_venda', 'ajuste_direto')),
        marca VARCHAR(30) NOT NULL,
        valor DECIMAL(18,2) NOT NULL,
        referencia VARCHAR(150) NOT NULL,
        nome_modelo VARCHAR(100) NULL,
        chassi VARCHAR(50) NULL,
        id_pedido VARCHAR(50) NULL,
        status VARCHAR(30) NOT NULL DEFAULT 'aprovado' CHECK (status IN ('pendente_financeiro', 'aprovado', 'rejeitado')),
        financeiro_aprovado BIT NOT NULL DEFAULT 1,
        aprovado_por VARCHAR(150) NULL,
        aprovado_em DATETIME2 NULL,
        usuario_responsavel VARCHAR(150) NOT NULL,
        saldo_resultante DECIMAL(18,2) NOT NULL,
        observacao VARCHAR(MAX) NULL,
        data_lancamento DATETIME2 DEFAULT SYSUTCDATETIME()
    );
    CREATE INDEX IX_FundoReserva_Dealer ON dbo.FundoReservaLancamentos(id_concessionaria, data_lancamento DESC);
END;

-- ============================================================================
-- 6. WORKFLOW E PEDIDOS DE FÁBRICA
-- ============================================================================

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'WorkflowEtapas')
BEGIN
    CREATE TABLE dbo.WorkflowEtapas (
        id_etapa VARCHAR(50) PRIMARY KEY,
        ordem_etapa INT NOT NULL,
        nome_etapa VARCHAR(100) NOT NULL,
        departamento VARCHAR(50) NOT NULL,
        usuario_responsavel VARCHAR(150) NOT NULL,
        email_responsavel VARCHAR(150) NOT NULL,
        status_destino_ao_aprovar VARCHAR(50) NOT NULL,
        integrar_protheus_automatico BIT NOT NULL DEFAULT 0,
        tipo_workflow VARCHAR(30) NOT NULL DEFAULT 'pedido' CHECK (tipo_workflow IN ('pedido', 'fundo_reserva')),
        ativo BIT NOT NULL DEFAULT 1,
        observacoes VARCHAR(255) NULL
    );
END;

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'PedidosFabrica')
BEGIN
    CREATE TABLE dbo.PedidosFabrica (
        id_pedido VARCHAR(50) PRIMARY KEY,
        numero_pedido VARCHAR(50) NOT NULL UNIQUE,
        numero_pedido_pai VARCHAR(50) NULL,
        id_concessionaria VARCHAR(50) NOT NULL FOREIGN KEY REFERENCES dbo.Concessionarias(id_concessionaria),
        modalidade_frete VARCHAR(10) NOT NULL CHECK (modalidade_frete IN ('CIF', 'FOB')),
        condicao_pagamento_geral VARCHAR(100) NOT NULL,
        status_pedido VARCHAR(40) NOT NULL DEFAULT 'aguardando_analise' CHECK (status_pedido IN (
            'aguardando_analise',
            'em_analise_credito',
            'credito_reprovado',
            'em_analise_comercial',
            'aprovado_comercial',
            'integrado_protheus',
            'em_producao',
            'faturado_despachado',
            'cancelado'
        )),
        status_aprovacao_geral VARCHAR(40) DEFAULT 'em_analise',
        total_unidades INT NOT NULL,
        valor_total DECIMAL(18,2) NOT NULL,
        pendente_aceite_concessionario BIT NOT NULL DEFAULT 0,
        permite_edicao_concessionario BIT NOT NULL DEFAULT 0,
        
        -- Alçada Crédito
        credito_aprovado BIT NOT NULL DEFAULT 0,
        credito_analista VARCHAR(150) NULL,
        credito_aprovado_em DATETIME2 NULL,
        credito_notas VARCHAR(MAX) NULL,
        score_credito VARCHAR(20) NULL,
        limite_credito_momento DECIMAL(18,2) NOT NULL DEFAULT 0,
        limite_utilizado_momento DECIMAL(18,2) NOT NULL DEFAULT 0,
        
        -- Alçada Comercial
        comercial_aprovado BIT NOT NULL DEFAULT 0,
        comercial_gestor VARCHAR(150) NULL,
        comercial_aprovado_em DATETIME2 NULL,
        comercial_notas VARCHAR(MAX) NULL,
        
        -- Integração TOTVS Protheus (SC5)
        integrado_protheus BIT NOT NULL DEFAULT 0,
        numero_pedido_protheus VARCHAR(50) NULL,
        integrado_protheus_em DATETIME2 NULL,
        armazem_protheus VARCHAR(50) NULL,
        numero_nfe_protheus VARCHAR(50) NULL,
        condicao_pagamento_protheus VARCHAR(50) NULL,
        
        observacoes VARCHAR(MAX) NULL,
        criado_em DATETIME2 DEFAULT SYSUTCDATETIME(),
        atualizado_em DATETIME2 DEFAULT SYSUTCDATETIME()
    );
    CREATE INDEX IX_PedidosFabrica_Dealer ON dbo.PedidosFabrica(id_concessionaria, criado_em DESC);
    CREATE INDEX IX_PedidosFabrica_Status ON dbo.PedidosFabrica(status_pedido);
END;

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'PedidoFabricaItens')
BEGIN
    CREATE TABLE dbo.PedidoFabricaItens (
        id_item VARCHAR(50) PRIMARY KEY,
        id_pedido VARCHAR(50) NOT NULL FOREIGN KEY REFERENCES dbo.PedidosFabrica(id_pedido) ON DELETE CASCADE,
        id_modelo VARCHAR(50) NOT NULL FOREIGN KEY REFERENCES dbo.ModelosMotos(id_modelo),
        nome_modelo VARCHAR(100) NOT NULL,
        marca VARCHAR(30) NOT NULL,
        categoria VARCHAR(50) NOT NULL,
        nome_cor VARCHAR(60) NOT NULL,
        codigo_hex VARCHAR(10) NOT NULL,
        quantidade INT NOT NULL,
        quantidade_original INT NULL,
        quantidade_aprovada INT NULL,
        custo_unitario_fabrica DECIMAL(18,2) NOT NULL,
        preco_publico_unitario DECIMAL(18,2) NOT NULL,
        custo_total_item DECIMAL(18,2) NOT NULL,
        id_condicao_pagamento VARCHAR(50) NULL,
        nome_condicao_pagamento VARCHAR(150) NULL,
        modalidade_frete VARCHAR(10) DEFAULT 'CIF',
        custo_frete DECIMAL(18,2) DEFAULT 0,
        usou_fundo_reserva BIT NOT NULL DEFAULT 0,
        valor_abatimento_fundo DECIMAL(18,2) DEFAULT 0,
        
        -- Status Individuais por Alçada
        status_comercial VARCHAR(20) DEFAULT 'pendente' CHECK (status_comercial IN ('pendente', 'aprovado', 'rejeitado')),
        status_financeiro VARCHAR(20) DEFAULT 'pendente' CHECK (status_financeiro IN ('pendente', 'aprovado', 'rejeitado')),
        status_aceite_dealer VARCHAR(20) DEFAULT 'aprovado' CHECK (status_aceite_dealer IN ('aprovado', 'pendente_aceite', 'rejeitado')),
        status_aprovacao_item VARCHAR(30) DEFAULT 'pendente',
        
        -- Indicadores de Modificação pela Montadora
        modificado_pela_montadora BIT NOT NULL DEFAULT 0,
        nota_modificacao VARCHAR(255) NULL,
        cor_original VARCHAR(60) NULL,
        condicao_pagamento_original VARCHAR(150) NULL,
        motivo_rejeicao VARCHAR(255) NULL,
        autor_rejeicao VARCHAR(150) NULL
    );
    CREATE INDEX IX_PedidoItens_Pedido ON dbo.PedidoFabricaItens(id_pedido);
END;

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'PedidoRejeicaoLogs')
BEGIN
    CREATE TABLE dbo.PedidoRejeicaoLogs (
        id_log INT IDENTITY(1,1) PRIMARY KEY,
        id_pedido VARCHAR(50) NOT NULL FOREIGN KEY REFERENCES dbo.PedidosFabrica(id_pedido) ON DELETE CASCADE,
        estagio VARCHAR(50) NOT NULL CHECK (estagio IN ('Crédito', 'Supervisora', 'Gerente', 'Diretoria', 'Concessionário')),
        autor VARCHAR(150) NOT NULL,
        motivo VARCHAR(MAX) NOT NULL,
        data_registro DATETIME2 DEFAULT SYSUTCDATETIME()
    );
END;

-- ============================================================================
-- 7. COMPROMISSO DE COMPRA TRIMESTRAL
-- ============================================================================

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'CompromissosCompra')
BEGIN
    CREATE TABLE dbo.CompromissosCompra (
        id_compromisso VARCHAR(50) PRIMARY KEY,
        id_concessionaria VARCHAR(50) NOT NULL FOREIGN KEY REFERENCES dbo.Concessionarias(id_concessionaria),
        marca VARCHAR(30) NOT NULL,
        trimestre_referencia VARCHAR(20) NOT NULL,
        periodo_ano INT NOT NULL,
        rotulo_mes1 VARCHAR(30) NOT NULL,
        rotulo_mes2 VARCHAR(30) NOT NULL,
        rotulo_mes3 VARCHAR(30) NOT NULL,
        regional_comercial VARCHAR(100) NULL,
        regional_financeira VARCHAR(100) NULL,
        media_mensal_emplacamentos INT DEFAULT 0,
        motos_por_faturamento INT DEFAULT 4,
        codigo_transportadora VARCHAR(50) NULL,
        codigo_origem VARCHAR(20) NULL,
        status VARCHAR(30) NOT NULL DEFAULT 'rascunho' CHECK (status IN (
            'rascunho',
            'enviado',
            'em_analise',
            'aprovado_fabrica',
            'ajustado_fabrica',
            'rejeitado'
        )),
        total_unidades_mes1 INT NOT NULL DEFAULT 0,
        total_unidades_mes2 INT NOT NULL DEFAULT 0,
        total_unidades_mes3 INT NOT NULL DEFAULT 0,
        valor_total_estimado DECIMAL(18,2) NOT NULL DEFAULT 0,
        notas_fabrica VARCHAR(MAX) NULL,
        notas_dealer VARCHAR(MAX) NULL,
        enviado_por VARCHAR(150) NULL,
        enviado_em DATETIME2 NULL,
        revisado_por VARCHAR(150) NULL,
        revisado_em DATETIME2 NULL,
        criado_em DATETIME2 DEFAULT SYSUTCDATETIME(),
        atualizado_em DATETIME2 DEFAULT SYSUTCDATETIME()
    );
    CREATE INDEX IX_Compromissos_Dealer ON dbo.CompromissosCompra(id_concessionaria, periodo_ano, trimestre_referencia);
END;

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'CompromissoCompraItens')
BEGIN
    CREATE TABLE dbo.CompromissoCompraItens (
        id_item VARCHAR(50) PRIMARY KEY,
        id_compromisso VARCHAR(50) NOT NULL FOREIGN KEY REFERENCES dbo.CompromissosCompra(id_compromisso) ON DELETE CASCADE,
        nome_modelo VARCHAR(100) NOT NULL,
        marca VARCHAR(30) NOT NULL,
        categoria VARCHAR(50) NULL,
        estoque_proprio_atual INT NOT NULL DEFAULT 0,
        estoque_bin_bloqueado INT NOT NULL DEFAULT 0,
        estoque_bin_liberado INT NOT NULL DEFAULT 0,
        compromisso_mes1 INT NOT NULL DEFAULT 0,
        compra_mes1 INT NOT NULL DEFAULT 0,
        compromisso_mes2 INT NOT NULL DEFAULT 0,
        compra_mes2 INT NOT NULL DEFAULT 0,
        compromisso_mes3 INT NOT NULL DEFAULT 0,
        compra_mes3 INT NOT NULL DEFAULT 0,
        preco_publico_sugerido DECIMAL(18,2) NOT NULL DEFAULT 0,
        custo_fabrica_unitario DECIMAL(18,2) NOT NULL DEFAULT 0,
        notas VARCHAR(255) NULL
    );
    CREATE INDEX IX_CompromissoItens ON dbo.CompromissoCompraItens(id_compromisso);
END;

-- ============================================================================
-- 8. ESTOQUE, ORDENS DE TRÂNSITO E DADOS COMPLEMENTARES
-- ============================================================================

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'EstoqueVeiculos')
BEGIN
    CREATE TABLE dbo.EstoqueVeiculos (
        id_veiculo VARCHAR(50) PRIMARY KEY,
        id_concessionaria VARCHAR(50) NOT NULL FOREIGN KEY REFERENCES dbo.Concessionarias(id_concessionaria),
        modelo VARCHAR(100) NOT NULL,
        ano_fabricacao_modelo INT NOT NULL,
        chassi_vin VARCHAR(30) NOT NULL UNIQUE,
        cor VARCHAR(60) NOT NULL,
        codigo_hex VARCHAR(10) NOT NULL,
        preco_custo DECIMAL(18,2) NOT NULL,
        preco_venda_loja DECIMAL(18,2) NOT NULL,
        status VARCHAR(20) NOT NULL DEFAULT 'disponivel' CHECK (status IN ('disponivel', 'reservado', 'vendido')),
        placa VARCHAR(10) NULL,
        cilindrada VARCHAR(20) NULL,
        potencia VARCHAR(50) NULL,
        data_chegada DATE NOT NULL DEFAULT CAST(SYSUTCDATETIME() AS DATE),
        notas VARCHAR(MAX) NULL
    );
    CREATE INDEX IX_Estoque_Dealer ON dbo.EstoqueVeiculos(id_concessionaria, status);
END;

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'OrdensTransito')
BEGIN
    CREATE TABLE dbo.OrdensTransito (
        id_transito VARCHAR(50) PRIMARY KEY,
        id_concessionaria VARCHAR(50) NOT NULL FOREIGN KEY REFERENCES dbo.Concessionarias(id_concessionaria),
        nome_lote VARCHAR(100) NOT NULL,
        previsao_chegada_eta VARCHAR(50) NOT NULL,
        status VARCHAR(30) NOT NULL DEFAULT 'No Prazo' CHECK (status IN ('Chegando', 'Atrasado', 'No Prazo')),
        localizacao_atual VARCHAR(150) NULL,
        quantidade_unidades INT NOT NULL,
        valor_lote DECIMAL(18,2) NOT NULL,
        criado_em DATETIME2 DEFAULT SYSUTCDATETIME()
    );
END;

-- ============================================================================
-- 9. TABELAS DOS MÓDULOS PRESERVADOS (EPC, CRM E SERVIÇO)
-- ============================================================================

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'EpcModelos')
BEGIN
    CREATE TABLE dbo.EpcModelos (
        id_modelo_epc VARCHAR(50) PRIMARY KEY,
        marca VARCHAR(30) NOT NULL,
        nome VARCHAR(100) NOT NULL,
        nome_comercial VARCHAR(150) NOT NULL,
        anos_aplicacao VARCHAR(30) NOT NULL,
        cilindrada VARCHAR(20) NOT NULL,
        categoria VARCHAR(50) NOT NULL,
        imagem_url VARCHAR(500) NOT NULL,
        tipo_motor VARCHAR(150) NOT NULL,
        qtd_diagramas INT NOT NULL DEFAULT 0,
        qtd_pecas INT NOT NULL DEFAULT 0,
        prefixo_chassi VARCHAR(30) NOT NULL,
        preco_inicial DECIMAL(18,2) NULL,
        ativo BIT NOT NULL DEFAULT 1
    );
END;

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'EpcDiagramas')
BEGIN
    CREATE TABLE dbo.EpcDiagramas (
        id_diagrama VARCHAR(60) PRIMARY KEY,
        id_modelo_epc VARCHAR(50) NOT NULL FOREIGN KEY REFERENCES dbo.EpcModelos(id_modelo_epc),
        codigo_grupo VARCHAR(20) NOT NULL,
        nome_grupo VARCHAR(100) NOT NULL,
        codigo_subgrupo VARCHAR(20) NOT NULL,
        codigo_ilustracao VARCHAR(50) NOT NULL,
        titulo VARCHAR(150) NOT NULL,
        imagem_url VARCHAR(500) NOT NULL
    );
END;

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'EpcPecas')
BEGIN
    CREATE TABLE dbo.EpcPecas (
        id_peca VARCHAR(60) PRIMARY KEY,
        id_diagrama VARCHAR(60) NOT NULL FOREIGN KEY REFERENCES dbo.EpcDiagramas(id_diagrama),
        numero_ref INT NOT NULL,
        codigo_part_number VARCHAR(60) NOT NULL,
        descricao VARCHAR(200) NOT NULL,
        unidades_por_conjunto INT NOT NULL DEFAULT 1,
        preco_fabrica DECIMAL(18,2) NOT NULL,
        preco_publico DECIMAL(18,2) NOT NULL,
        estoque_manaus INT NOT NULL DEFAULT 0,
        estoque_jundiai INT NOT NULL DEFAULT 0,
        em_estoque BIT NOT NULL DEFAULT 1
    );
    CREATE INDEX IX_EpcPecas_PartNumber ON dbo.EpcPecas(codigo_part_number);
END;

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'CrmPipelineLeads')
BEGIN
    CREATE TABLE dbo.CrmPipelineLeads (
        id_lead VARCHAR(50) PRIMARY KEY,
        id_concessionaria VARCHAR(50) NOT NULL FOREIGN KEY REFERENCES dbo.Concessionarias(id_concessionaria),
        nome_cliente VARCHAR(150) NOT NULL,
        estagio VARCHAR(30) NOT NULL CHECK (estagio IN ('lead', 'proposta', 'documentacao', 'entrega')),
        veiculo_interesse VARCHAR(100) NOT NULL,
        valor_proposta DECIMAL(18,2) NOT NULL,
        telefone VARCHAR(30) NULL,
        email VARCHAR(150) NULL,
        lead_quente BIT DEFAULT 0,
        criado_em DATETIME2 DEFAULT SYSUTCDATETIME()
    );
END;

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'OficinaOrdensServico')
BEGIN
    CREATE TABLE dbo.OficinaOrdensServico (
        id_os VARCHAR(50) PRIMARY KEY,
        id_concessionaria VARCHAR(50) NOT NULL FOREIGN KEY REFERENCES dbo.Concessionarias(id_concessionaria),
        numero_os VARCHAR(30) NOT NULL UNIQUE,
        nome_cliente VARCHAR(150) NOT NULL,
        telefone_cliente VARCHAR(30) NOT NULL,
        modelo_veiculo VARCHAR(100) NOT NULL,
        placa VARCHAR(10) NOT NULL,
        status VARCHAR(30) NOT NULL DEFAULT 'em_aberto' CHECK (status IN ('em_aberto', 'aguardando_pecas', 'em_execucao', 'finalizado', 'cancelado')),
        total_pecas DECIMAL(18,2) DEFAULT 0,
        total_mao_obra DECIMAL(18,2) DEFAULT 0,
        total_os DECIMAL(18,2) DEFAULT 0,
        mecanico_responsavel VARCHAR(100) NULL,
        criado_em DATETIME2 DEFAULT SYSUTCDATETIME()
    );
END;
