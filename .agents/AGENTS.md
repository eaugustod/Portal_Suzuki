# AGENTS.md — PORTAL SUZUKI

## 1. OBJETIVO PRINCIPAL DO PROJETO

O objetivo principal deste projeto é transformar o Portal Suzuki de uma aplicação parcialmente baseada em dados mockados em uma aplicação **real, funcional, persistente e testada**, utilizando **SQL Server como banco de dados operacional**.

O agente deve trabalhar para entregar o sistema funcionando de ponta a ponta:

Frontend
   ↓
API / Backend / Services
   ↓
Regras de negócio
   ↓
SQL Server
   ↓
Persistência real
   ↓
Consultas
   ↓
API / Backend
   ↓
Frontend

O projeto NÃO deve ser considerado concluído enquanto funcionalidades que deveriam persistir dados continuarem dependendo de:

* arrays em memória;
* dados mockados;
* `localStorage`;
* respostas falsas;
* stubs;
* endpoints simulados;
* dados hardcoded;
* mensagens de sucesso sem persistência real.

---

# 2. MISSÃO DO AGENTE

O agente é responsável por executar autonomamente:

1. auditoria completa do projeto;
2. levantamento da arquitetura atual;
3. identificação de todos os mocks;
4. identificação das funcionalidades que precisam de banco;
5. desenho da arquitetura de persistência;
6. implementação do SQL Server;
7. criação das tabelas;
8. criação das migrations;
9. criação de índices;
10. criação de constraints;
11. criação de relacionamentos;
12. criação de repositories;
13. criação de services;
14. criação de APIs;
15. integração do frontend com as APIs;
16. substituição dos mocks por dados reais;
17. implementação de CRUD;
18. validação de regras de negócio;
19. criação de testes;
20. execução dos testes;
21. identificação dos erros;
22. correção automática dos erros;
23. execução novamente dos testes;
24. testes de regressão;
25. lint;
26. type-check;
27. build;
28. testes E2E quando disponíveis;
29. atualização do Graphify;
30. revisão do Git;
31. commit;
32. push.

Não limitar o trabalho a uma análise.

**Quando encontrar um problema que possa ser corrigido pelo agente, corrigir o problema.**

---

# 3. REGRA DE AUTONOMIA

O agente possui autorização para realizar autonomamente todas as tarefas normais de desenvolvimento.

Não solicitar confirmação para:

* editar arquivos;
* criar arquivos;
* excluir arquivos obsoletos quando isso for seguro;
* criar componentes;
* criar services;
* criar repositories;
* criar APIs;
* criar endpoints;
* criar migrations;
* criar tabelas;
* alterar tabelas;
* criar índices;
* criar constraints;
* corrigir SQL;
* instalar dependências necessárias;
* criar testes;
* executar testes;
* executar lint;
* executar type-check;
* executar build;
* executar Graphify;
* corrigir bugs;
* refatorar código;
* substituir mocks;
* executar comandos locais;
* criar commits;
* fazer push.

## 3.1 EXCEÇÕES

Solicitar confirmação somente quando houver:

* risco real de perda irreversível de dados de produção;
* DROP de banco de produção;
* DELETE/UPDATE destrutivo em dados reais de produção;
* alteração irreversível de infraestrutura de produção;
* uso de credenciais reais que não estejam disponíveis;
* decisão de negócio que não possa ser determinada tecnicamente;
* operação externa irreversível.

Para desenvolvimento local, ambiente de testes ou banco especificamente destinado ao projeto, o agente deve continuar autonomamente.

---

# 4. REGRA ABSOLUTA SOBRE MOCKS

Os dados mockados existentes são considerados **dados de desenvolvimento**, não persistência definitiva.

O agente deve auditar todos os arquivos de:


src/data/


e identificar quais dados são:

### A. Dados estáticos legítimos

Exemplos:

* informações puramente visuais;
* configurações;
* catálogos estáticos;
* informações que não precisam ser alteradas pelo usuário.

Esses dados podem permanecer estáticos quando tecnicamente justificável.

### B. Dados operacionais

Exemplos:

* concessionárias;
* usuários;
* pedidos;
* pedidos de fábrica;
* pedidos de peças;
* estoque;
* compromissos;
* vendas;
* CRM;
* informações transacionais;
* registros criados pelo usuário.

Esses dados devem ser migrados para persistência real.

---

# 5. PROIBIÇÃO DE "FAKE PERSISTENCE"

Não considerar como persistência:


useState()
useReducer()
arrays
objetos JavaScript
localStorage
sessionStorage
mock API
setTimeout()
Promise.resolve()


quando a funcionalidade exigir banco de dados.

Exemplo proibido:

ts
setOrders([...orders, newOrder]);


como única implementação de criação de pedido.

O correto é:


Frontend
   ↓
POST /api/orders
   ↓
Service
   ↓
Repository
   ↓
SQL Server
   ↓
INSERT
   ↓
Resposta
   ↓
Frontend


---

# 6. SQL SERVER É O BANCO OPERACIONAL

O banco operacional do Portal Suzuki deve ser SQL Server.

A arquitetura deve permitir:


Portal Suzuki
       ↓
API
       ↓
SQL Server Portal
       ↓
Integrações
       ↓
TOTVS Protheus


Não conectar diretamente React ao SQL Server.

O frontend deve acessar o backend/API.

---

# 7. PROTHEUS

O Portal Suzuki possui necessidade futura de integração com TOTVS Protheus.

Essa integração deve ser separada do banco operacional do Portal.

O Protheus não deve ser copiado indiscriminadamente para o banco do Portal.

Quando necessário, utilizar:

* views;
* queries;
* procedures quando justificadas;
* integrações controladas;
* serviços específicos.

Estrutura planejada:


portal.Concessionarias
portal.PedidosFabrica
portal.PedidosPecas
portal.EstoqueRede


Views de integração planejadas:


vw_ClientesProtheus
vw_ProdutosProtheus
vw_PedidosProtheus


Antes de criar qualquer objeto:

1. verificar se já existe;
2. verificar migrations;
3. verificar código;
4. verificar dependências;
5. evitar duplicação.

---

# 8. AUDITORIA INICIAL OBRIGATÓRIA

Antes de implementar a migração, executar uma auditoria completa.

Examinar:


package.json
package-lock.json
src/
public/
configurações
backend
API
services
repositories
database
migrations
tests
e2e
.env.example
AGENTS.md
graphify-out/


Identificar:

* arquitetura;
* frontend;
* backend;
* APIs;
* serviços;
* banco existente;
* ORM/query builder, se houver;
* autenticação;
* autorização;
* modelos;
* tipos;
* mocks;
* endpoints;
* testes.

Não criar uma nova arquitetura sem antes entender a arquitetura existente.

---

# 9. INVENTÁRIO DE FUNCIONALIDADES

Criar internamente um inventário de todas as funcionalidades existentes.

Entre outras:

* Login/autenticação;
* Dashboard;
* Dashboard da montadora;
* Concessionárias;
* Compras;
* Pedidos de fábrica;
* Pedidos de peças;
* Catálogo de peças;
* EPC;
* Estoque;
* Compromisso mensal;
* CRM;
* vendas;
* perfis;
* permissões;
* filtros;
* pesquisas;
* formulários;
* relatórios;
* consultas;
* alterações;
* exclusões.

Para cada funcionalidade, identificar:


Frontend
API
Service
Banco
Persistência
Testes
Status


Classificar:


FUNCIONANDO
PARCIAL
MOCK
QUEBRADO
NÃO IMPLEMENTADO


---

# 10. MIGRAÇÃO DOS DADOS

Para cada entidade operacional:

1. identificar o modelo atual;
2. identificar onde o mock é utilizado;
3. criar modelo de banco;
4. criar tabela;
5. criar migration;
6. criar constraints;
7. criar índices;
8. criar repository;
9. criar service;
10. criar endpoint;
11. conectar frontend;
12. remover dependência do mock;
13. criar testes;
14. testar persistência.

---

# 11. MODELAGEM DO BANCO

As tabelas devem possuir:

* chave primária;
* tipos corretos;
* campos obrigatórios;
* `NOT NULL` quando apropriado;
* `NULL` somente quando necessário;
* índices;
* foreign keys;
* constraints;
* campos de auditoria quando apropriado.

Evitar tabelas sem relacionamento quando existe relação de negócio.

Evitar duplicação desnecessária.

Evitar armazenar informação derivável sem necessidade.

---

# 12. MIGRATIONS

Toda alteração estrutural do banco deve ser versionada.

Não depender de alterações manuais impossíveis de reproduzir.

Migrations devem permitir:


banco vazio
   ↓
migrations
   ↓
banco completo


Quando possível, também permitir rollback seguro em ambiente de desenvolvimento.

---

# 13. DADOS DE SEED

Quando necessário, criar seeds para:

* desenvolvimento;
* testes;
* dados iniciais;
* usuários de teste;
* dados mínimos necessários.

Seeds não devem substituir persistência.

Não utilizar seeds como solução para dados operacionais.

---

# 14. CRUD REAL

Toda entidade operacional deve ter operações reais quando aplicáveis:


CREATE
READ
UPDATE
DELETE


Cada operação deve:

1. receber dados;
2. validar;
3. executar regra de negócio;
4. acessar SQL Server;
5. confirmar resultado;
6. retornar resposta correta.

---

# 15. TESTE DE PERSISTÊNCIA

Para cada entidade importante:

### CREATE


Criar
↓
Receber sucesso
↓
Consultar diretamente pela aplicação
↓
Confirmar existência


### READ


Consultar
↓
Confirmar dados corretos


### UPDATE


Alterar
↓
Consultar novamente
↓
Confirmar alteração persistida


### DELETE


Excluir
↓
Consultar novamente
↓
Confirmar comportamento esperado


Também testar:

* ID inexistente;
* dados inválidos;
* campos obrigatórios;
* duplicidade;
* foreign key inválida;
* constraint;
* erro de conexão;
* timeout;
* rollback;
* concorrência quando relevante.

---

# 16. SQL SEGURO

Nunca concatenar valores recebidos do usuário diretamente em SQL.

Proibido:

ts
const sql = `SELECT * FROM pedidos WHERE id = ${id}`;


Utilizar parâmetros.

Sempre proteger contra SQL Injection.

---

# 17. TRANSAÇÕES

Utilizar transações quando uma operação envolver múltiplas alterações que precisam ser atômicas.

Exemplo:


Criar pedido
+
Criar itens
+
Atualizar estoque


Se uma etapa falhar, a operação deve ser revertida quando a regra de negócio exigir atomicidade.

---

# 18. ESTOQUE

Operações de estoque devem receber atenção especial.

Nunca permitir que a interface simplesmente altere o número mostrado sem persistir no banco.

Validar:

* quantidade;
* produto;
* concessionária;
* disponibilidade;
* movimentação;
* concorrência;
* consistência.

Sempre que houver movimentação de estoque, investigar se é necessário registrar histórico.

---

# 19. PEDIDOS

Pedidos devem possuir persistência real.

Quando aplicável:


Pedido
   ↓
Itens
   ↓
Produto/Peça
   ↓
Quantidade
   ↓
Concessionária
   ↓
Status
   ↓
Datas


Validar relacionamento entre pedido e itens.

Não permitir itens órfãos.

---

# 20. CONCESSIONÁRIAS

Concessionárias devem possuir persistência real quando utilizadas como entidades operacionais.

Considerar:

* identificação;
* dados cadastrais;
* status;
* marca;
* usuários relacionados;
* permissões;
* escopo;
* dados necessários ao negócio.

---

# 21. AUTENTICAÇÃO E AUTORIZAÇÃO

Se já existir autenticação:

* preservar arquitetura existente quando adequada;
* corrigir falhas;
* testar login;
* testar sessão;
* testar logout;
* testar permissões;
* testar acesso indevido.

Esconder botão no frontend não é autorização.

A autorização deve ser validada no backend.

---

# 22. FRONTEND

O frontend deve:

* consumir APIs reais;
* exibir loading;
* exibir erros;
* exibir estados vazios;
* atualizar dados após operações;
* invalidar/refazer consultas quando necessário;
* não manter estado falso de sucesso.

Depois de criar/editar/excluir:


API
↓
Banco
↓
Nova consulta
↓
Frontend atualizado


---

# 23. COMPONENTES ATUAIS

Views conhecidas:

* DashboardView
* MontadoraDashboardView
* PurchasePortalView
* DealershipManagementView
* PartsCatalogView
* InventoryView
* MonthlyCommitmentView
* SalesCrmView

Componentes EPC conhecidos:

* PartsCatalogView
* PartsExplodedDiagram
* PartsTable
* PartsCartDrawer
* PartsDiagramCarousel

Antes de alterar componentes centrais, verificar todos os usos.

---

# 24. EPC

Os hotspots devem possuir:

* `id` único;
* `ref` correspondente.

O mesmo `ref` pode aparecer em mais de um hotspot.

Para hover, utilizar:


hoveredHotspotId


Não utilizar:


hoveredRef


como identificador único de hover.

Preservar essa regra.

---

# 25. IMAGENS

Utilizar a estrutura existente:


BASE_IMG


em:


src/data/mockPartsModels.ts


Não adicionar imagens genéricas ou fontes externas sem necessidade.

---

# 26. TESTES COMPLETOS

Executar todos os testes disponíveis.

Se não houver testes suficientes, criar.

Prioridade:

1. banco;
2. repositories;
3. services;
4. APIs;
5. autenticação;
6. autorização;
7. pedidos;
8. estoque;
9. concessionárias;
10. catálogo;
11. EPC;
12. CRM;
13. componentes críticos;
14. E2E.

---

# 27. TESTES DE BANCO

Os testes de banco devem validar o comportamento real sempre que possível.

Não criar somente testes que mockam o repository para fingir que o SQL funciona.

Quando o objetivo for validar persistência, executar contra um SQL Server de teste/desenvolvimento configurado para isso.

Validar:

* conexão;
* migration;
* schema;
* INSERT;
* SELECT;
* UPDATE;
* DELETE;
* FK;
* constraints;
* índices quando relevante;
* transações;
* rollback;
* erros.

---

# 28. TESTES DE API

Validar:

* status HTTP;
* payload;
* validação;
* autenticação;
* autorização;
* erros;
* banco;
* persistência;
* respostas vazias;
* registros inexistentes.

---

# 29. TESTES E2E

Quando a infraestrutura permitir, testar fluxos reais:


Login
↓
Dashboard
↓
Concessionária
↓
Pedido
↓
Persistência
↓
Consulta
↓
Alteração
↓
Atualização da interface


Também testar os principais fluxos do catálogo, estoque e CRM.

---

# 30. CICLO AUTOMÁTICO DE CORREÇÃO

Este ciclo é obrigatório:


AUDITAR
↓
IMPLEMENTAR
↓
TESTAR
↓
ENCONTRAR ERRO
↓
ANALISAR CAUSA RAIZ
↓
CORRIGIR
↓
TESTAR NOVAMENTE
↓
TESTAR REGRESSÃO
↓
CONTINUAR AUDITORIA
↓
REPETIR


O agente não deve parar após encontrar o primeiro resultado positivo.

---

# 31. PROCURAR BUGS PROATIVAMENTE

Pesquisar por:


TODO
FIXME
HACK
XXX
mock
stub
placeholder
fake
dummy
temporary
console.log
any
@ts-ignore
eslint-disable
localStorage
sessionStorage


Também procurar:

* funções vazias;
* promises sem tratamento;
* endpoints quebrados;
* endpoints inexistentes;
* imports incorretos;
* tipos incorretos;
* estados inconsistentes;
* componentes mortos;
* código duplicado;
* dados hardcoded;
* respostas simuladas;
* mensagens falsas de sucesso;
* erros silenciosos.

Não corrigir cegamente.

Determinar o propósito de cada ocorrência.

---

# 32. NÃO ESCONDER ERROS

Não utilizar:


any
@ts-ignore
eslint-disable
test.skip
describe.skip
it.skip
catch vazio


para esconder problemas.

Só utilizar uma exceção quando houver justificativa técnica documentada.

---

# 33. TYPESCRIPT

Manter TypeScript estrito quando já configurado.

Não utilizar `any` indiscriminadamente.

Corrigir erros de tipo na origem.

---

# 34. TRATAMENTO DE ERROS

Todas as operações assíncronas devem possuir tratamento apropriado.

Não retornar sucesso quando uma operação falhou.

O frontend deve conseguir distinguir:


loading
success
error
empty


---

# 35. SEGURANÇA

Nunca commitar:

* senhas;
* tokens;
* API keys;
* secrets;
* certificados;
* credenciais SQL Server.

Utilizar:


.env
.env.local
.env.example


conforme a arquitetura existente.

Nunca colocar senha do banco diretamente no código.

---

# 36. VARIÁVEIS SQL SERVER

Identificar as variáveis necessárias para conexão.

Exemplo conceitual:


DB_HOST
DB_PORT
DB_NAME
DB_USER
DB_PASSWORD


Os nomes reais devem respeitar a arquitetura existente.

Documentar variáveis necessárias no `.env.example`.

---

# 37. CONEXÃO COM SQL SERVER

A conexão deve possuir:

* pool quando apropriado;
* timeout;
* tratamento de erro;
* fechamento correto;
* reutilização da conexão/pool;
* configuração por ambiente.

Não abrir uma conexão nova indiscriminadamente para cada consulta se a biblioteca utilizada suportar pooling.

---

# 38. OBSERVABILIDADE

Adicionar logs úteis para:

* erro de API;
* erro de banco;
* falha de integração;
* operações importantes.

Não registrar:

* senhas;
* tokens;
* secrets;
* dados sensíveis desnecessários.

---

# 39. PERFORMANCE

Depois de implementar a persistência, verificar:

* queries N+1;
* consultas sem filtros;
* SELECT desnecessário;
* índices ausentes;
* consultas duplicadas;
* chamadas repetidas da API;
* grandes volumes carregados no frontend.

Não fazer otimização prematura.

Primeiro garantir correção.

---

# 40. GRAPHIFY

Existe:


graphify-out/graph.json


Antes de alterações arquiteturais importantes:


graphify query "<pergunta>"


Para relacionamentos:


graphify path "<ComponentA>" "<ComponentB>"


Para conceitos:


graphify explain "<Conceito>"


Após alterações em:


.ts
.tsx


executar:


graphify update .


Se existir lock stale:


rm -f graphify-out/.rebuild.lock


e continuar.

---

# 41. GIT

Repositório:


github.com/eaugustod/Portal_Suzuki


Branch principal:


main


Após alterações significativas e validação:


git status
git diff
git add -A
git commit -m "mensagem descritiva"
git push


Nunca adicionar secrets.

---

# 42. BUILD

O agente deve descobrir os scripts existentes no `package.json`.

Executar os comandos apropriados para:

* testes;
* lint;
* type-check;
* build;
* E2E;
* migrations;
* Graphify.

Não inventar comandos se o projeto já possuir scripts específicos.

---

# 43. DEFINIÇÃO DE "SEM ERROS"

O projeto deve ser considerado estabilizado quando:

* testes existentes passam;
* novos testes críticos passam;
* type-check passa;
* lint passa quando configurado;
* build passa;
* migrations funcionam;
* conexão com SQL Server funciona;
* CRUD crítico funciona;
* persistência funciona;
* consultas funcionam;
* erros são tratados;
* frontend utiliza dados reais;
* mocks operacionais foram removidos;
* não existem bugs críticos conhecidos.

Não declarar "sem erros" se houver falhas conhecidas.

Nesse caso, corrigir primeiro.

---

# 44. CRITÉRIO DE ACEITE DO BANCO

Antes de considerar o projeto concluído, comprovar:


[ ] SQL Server conecta
[ ] Banco existe
[ ] Schema existe
[ ] Migrations executam
[ ] Tabelas existem
[ ] Constraints existem
[ ] Foreign keys funcionam
[ ] Índices necessários existem
[ ] INSERT funciona
[ ] SELECT funciona
[ ] UPDATE funciona
[ ] DELETE funciona quando aplicável
[ ] Transações funcionam quando aplicáveis
[ ] Erros são tratados
[ ] Frontend utiliza dados persistidos
[ ] Dados sobrevivem ao reload da aplicação
[ ] Dados sobrevivem à nova consulta
[ ] Dados não dependem de mock


---

# 45. CRITÉRIO DE ACEITE DO PORTAL

Verificar as funcionalidades existentes e classificá-las:


FUNCIONANDO COM BANCO
FUNCIONANDO SEM NECESSIDADE DE BANCO
IMPLEMENTADO E TESTADO
CORRIGIDO
PENDENTE POR DEPENDÊNCIA EXTERNA


Não classificar como funcionando algo que depende de mock quando deveria utilizar banco.

---

# 46. REGRA PARA DADOS DO PROTHEUS

Quando a funcionalidade depender de dados que pertencem ao Protheus:

1. identificar a origem;
2. verificar se já existe integração;
3. verificar views/queries;
4. não duplicar dados sem necessidade;
5. implementar camada de integração apropriada;
6. tratar indisponibilidade;
7. testar a integração.

Não inventar dados do Protheus.

---

# 47. RELATÓRIO FINAL OBRIGATÓRIO

Ao finalizar a execução, apresentar:

## 1. RESUMO

O que foi feito.

## 2. MOCKS REMOVIDOS

Listar os mocks substituídos por persistência real.

## 3. BANCO SQL SERVER

Listar:

* database;
* schema;
* tabelas;
* migrations;
* views;
* índices;
* constraints;
* relacionamentos.

## 4. API

Listar endpoints criados ou corrigidos.

## 5. FRONTEND

Listar telas conectadas ao banco.

## 6. TESTES

Informar:

* testes unitários;
* integração;
* API;
* banco;
* E2E.

## 7. VALIDAÇÕES

Informar:


Tests: PASS/FAIL
Lint: PASS/FAIL
Type-check: PASS/FAIL
Build: PASS/FAIL
Database: PASS/FAIL
E2E: PASS/FAIL
Graphify: UPDATED/NOT APPLICABLE


## 8. BUGS CORRIGIDOS

Listar os principais.

## 9. GIT

Informar:

* commit;
* branch;
* push.

## 10. PENDÊNCIAS

Somente pendências reais que dependam de algo externo ou de decisão que o agente não possa tomar.

---

# 48. REGRA FINAL

O objetivo deste projeto não é criar uma demonstração.

O objetivo é entregar um **Portal Suzuki funcional e persistente**.

Portanto:

**Não simule persistência.**

**Não esconda erros.**

**Não pare no primeiro teste positivo.**

**Não considere o frontend funcional se o backend estiver quebrado.**

**Não considere o backend funcional se o banco não persistir.**

**Não considere o banco funcional se as migrations não forem reproduzíveis.**

**Não considere uma funcionalidade pronta se os testes críticos não passarem.**

**Não remova testes para fazer o projeto passar.**

**Não peça confirmação para correções normais.**

Execute o ciclo completo:


AUDITORIA
→ ARQUITETURA
→ SQL SERVER
→ MIGRATIONS
→ PERSISTÊNCIA
→ API
→ FRONTEND
→ TESTES
→ BUGS
→ CORREÇÕES
→ REGRESSÃO
→ LINT
→ TYPE-CHECK
→ BUILD
→ E2E
→ GRAPHIFY
→ GIT
→ VALIDAÇÃO FINAL


Continue até atingir o máximo de estabilidade possível dentro do ambiente disponível.
