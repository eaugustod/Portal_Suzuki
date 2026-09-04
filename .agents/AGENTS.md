# AGENTS.md

# PORTAL SUZUKI — EXECUÇÃO AUTÔNOMA, QA COMPLETO E CORREÇÃO CONTÍNUA

## 1. MISSÃO PRINCIPAL

Você é o agente responsável por transformar o Portal Suzuki em um sistema **100% funcional, testado, consistente e pronto para uso real**.

Sua responsabilidade NÃO termina quando o código compila.

Sua responsabilidade somente termina quando:

* o projeto inicia corretamente;
* todas as telas funcionam;
* todos os fluxos principais funcionam;
* todos os botões e ações funcionam;
* todos os formulários funcionam;
* todas as validações funcionam;
* frontend, backend e banco estão integrados;
* o SQL Server funciona de verdade;
* dados são realmente gravados no banco;
* dados gravados podem ser consultados posteriormente;
* alterações são persistidas;
* exclusões funcionam corretamente;
* erros são tratados adequadamente;
* não existem mocks operacionais substituindo funcionalidades reais;
* não existem erros conhecidos;
* testes automatizados passam;
* testes de integração passam;
* testes de banco passam;
* testes E2E passam;
* build de produção passa;
* typecheck passa;
* lint passa;
* o sistema foi revisado tela por tela;
* os principais fluxos foram executados do início ao fim.

NÃO considere o trabalho concluído simplesmente porque:

* `npm run build` passou;
* a aplicação abriu no navegador;
* não existem erros aparentes no console;
* alguns testes passaram;
* uma tela está visualmente correta.

O objetivo é **FUNCIONALIDADE REAL**, não apenas código compilando.

---

# 2. REGRA FUNDAMENTAL DE AUTONOMIA

Execute o trabalho de forma autônoma.

NÃO peça confirmação para:

* executar testes;
* analisar erros;
* corrigir código;
* refatorar código;
* criar testes;
* criar migrations;
* corrigir SQL;
* corrigir componentes;
* corrigir APIs;
* corrigir validações;
* corrigir tipos;
* corrigir problemas de integração;
* instalar dependências necessárias;
* executar lint;
* executar typecheck;
* executar build;
* executar testes E2E;
* executar testes de banco;
* executar testes de persistência;
* investigar bugs;
* repetir testes após correções.

Quando encontrar um problema:

1. reproduza;
2. identifique a causa;
3. corrija;
4. execute novamente o teste;
5. execute os testes relacionados;
6. procure regressões;
7. continue a auditoria.

Não pare após a primeira correção.

---

# 3. CICLO OBRIGATÓRIO DE CORREÇÃO

Todo erro deve seguir este ciclo:

```text
DETECTAR
   ↓
REPRODUZIR
   ↓
ANALISAR
   ↓
IDENTIFICAR CAUSA RAIZ
   ↓
CORRIGIR
   ↓
TESTAR NOVAMENTE
   ↓
TESTAR REGRESSÃO
   ↓
AUDITAR FLUXOS RELACIONADOS
   ↓
CONTINUAR
```

Nunca simplesmente esconda um erro.

Nunca faça uma alteração apenas para fazer o teste passar sem corrigir a causa real.

---

# 4. PRIMEIRA ETAPA — AUDITORIA COMPLETA DO PROJETO

Antes de alterar funcionalidades, faça uma auditoria completa.

Analise:

* estrutura de diretórios;
* package.json;
* scripts;
* dependências;
* configuração do Vite;
* TypeScript;
* Tailwind;
* frontend;
* backend;
* API;
* banco de dados;
* migrations;
* seeds;
* variáveis de ambiente;
* autenticação;
* autorização;
* serviços;
* repositories;
* hooks;
* componentes;
* páginas;
* rotas;
* imagens;
* dados mockados;
* testes existentes;
* configuração de testes;
* configuração E2E;
* Docker;
* arquivos de configuração;
* documentação;
* AGENTS.md;
* Graphify.

Procure também:

```text
TODO
FIXME
HACK
TEMP
MOCK
MOCK_DATA
FAKE
STUB
PLACEHOLDER
DUMMY
HARDCODED
console.log
console.error
throw new Error
```

Analise cada ocorrência e determine se ela representa:

* comportamento legítimo;
* código de desenvolvimento;
* código temporário;
* mock operacional;
* código incompleto;
* erro;
* dívida técnica;
* funcionalidade não implementada.

Corrija tudo que impedir o funcionamento real do sistema.

---

# 5. INVENTÁRIO COMPLETO DO SISTEMA

Crie mentalmente e/ou em documentação interna uma matriz de funcionalidades.

Para cada tela identifique:

* rota;
* componente;
* finalidade;
* dados utilizados;
* API utilizada;
* tabelas utilizadas;
* ações disponíveis;
* formulários;
* filtros;
* buscas;
* paginação;
* ordenação;
* botões;
* modais;
* menus;
* navegação;
* estados vazios;
* estados de carregamento;
* estados de erro;
* permissões;
* persistência.

Cada funcionalidade deverá ser classificada como:

```text
[ ] Funcionando
[ ] Funcionando parcialmente
[ ] Com erro
[ ] Mockada
[ ] Não implementada
[ ] Não testada
```

Nenhuma funcionalidade deve permanecer sem validação.

---

# 6. TESTE TELA POR TELA

Faça uma auditoria individual de TODAS as telas.

Para cada tela:

## 6.1 Carregamento

Verifique:

* a rota abre;
* não ocorre crash;
* não ocorre tela branca;
* não existem erros no console;
* não existem requests quebrados;
* loading funciona;
* tratamento de erro funciona;
* dados são carregados corretamente.

## 6.2 Elementos visuais

Verifique:

* títulos;
* textos;
* cards;
* tabelas;
* botões;
* ícones;
* menus;
* dropdowns;
* modais;
* inputs;
* selects;
* filtros;
* paginação;
* responsividade;
* modo claro;
* modo escuro.

## 6.3 Interações

Clique/teste cada ação relevante.

Verifique:

* botão abre o que deveria;
* botão salva;
* botão edita;
* botão exclui;
* botão cancela;
* botão volta;
* filtros funcionam;
* pesquisa funciona;
* ordenação funciona;
* paginação funciona;
* modal abre;
* modal fecha;
* formulário valida;
* mensagens aparecem;
* estados são atualizados.

NÃO assuma que um botão funciona apenas porque existe no JSX.

---

# 7. TESTE PROCESSO POR PROCESSO

Teste os processos completos, e não apenas componentes isolados.

Exemplos:

```text
Login
↓
Dashboard
↓
Consulta
↓
Seleção
↓
Edição
↓
Salvamento
↓
Confirmação
↓
Consulta novamente
```

O teste deve comprovar que o dado realmente percorreu todo o fluxo.

Outro exemplo:

```text
Criar pedido
↓
Validar dados
↓
Salvar
↓
Persistir no SQL Server
↓
Consultar pedido
↓
Editar pedido
↓
Salvar novamente
↓
Consultar novamente
↓
Excluir/cancelar
↓
Confirmar estado final
```

---

# 8. SQL SERVER — FUNCIONAMENTO REAL

O SQL Server é a fonte operacional real do Portal Suzuki.

Não utilize mock para substituir:

* cadastro;
* consulta;
* alteração;
* exclusão;
* pedidos;
* estoque;
* concessionárias;
* usuários;
* relacionamentos;
* histórico;
* qualquer outro dado operacional.

Se existir uma funcionalidade que atualmente utiliza dados mockados, substitua por implementação real quando fizer parte do funcionamento do sistema.

---

# 9. TESTE REAL DE PERSISTÊNCIA

Para cada CRUD relevante, obrigatoriamente teste:

### CREATE

1. criar registro;
2. confirmar resposta;
3. consultar diretamente ou através da API;
4. confirmar que o registro existe no SQL Server.

### READ

1. consultar registro;
2. verificar dados;
3. verificar relacionamentos;
4. verificar filtros;
5. verificar paginação.

### UPDATE

1. alterar registro;
2. salvar;
3. consultar novamente;
4. confirmar alteração no SQL Server.

### DELETE

1. excluir/cancelar;
2. confirmar operação;
3. consultar novamente;
4. confirmar comportamento esperado.

Não considere persistência válida apenas porque a interface exibiu uma mensagem de sucesso.

---

# 10. TESTES DE BANCO DE DADOS

Teste:

* conexão;
* autenticação;
* migrations;
* tabelas;
* constraints;
* foreign keys;
* índices;
* tipos;
* nullable;
* defaults;
* transações;
* rollback;
* concorrência quando relevante;
* integridade referencial;
* queries;
* procedures, se existirem;
* views, se existirem;
* tratamento de erros;
* timeouts;
* reconexão.

Procure:

* SQL inválido;
* nomes incorretos;
* colunas inexistentes;
* joins incorretos;
* conversões inválidas;
* problemas de encoding;
* problemas de timezone;
* problemas de decimal;
* problemas de NULL;
* problemas de identidade/sequence;
* queries N+1;
* ausência de índices;
* conexões não encerradas.

---

# 11. API / BACKEND

Teste todos os endpoints.

Para cada endpoint valide:

* método HTTP;
* parâmetros;
* body;
* headers;
* autenticação;
* autorização;
* validação;
* status HTTP;
* resposta;
* tratamento de erro;
* persistência;
* transação;
* rollback;
* performance básica.

Teste também:

* dados ausentes;
* dados inválidos;
* IDs inexistentes;
* registros duplicados;
* valores extremos;
* requisições simultâneas quando relevante;
* erros do banco;
* timeout;
* indisponibilidade do banco.

---

# 12. FRONTEND ↔ API ↔ SQL SERVER

Teste a cadeia completa:

```text
INTERFACE
   ↓
FRONTEND
   ↓
API
   ↓
SERVICE
   ↓
REPOSITORY
   ↓
SQL SERVER
```

E o retorno:

```text
SQL SERVER
   ↓
REPOSITORY
   ↓
SERVICE
   ↓
API
   ↓
FRONTEND
   ↓
INTERFACE
```

Verifique se nenhum ponto está utilizando dados falsos ou estado local para simular persistência.

---

# 13. TESTES E2E

Execute testes End-to-End sempre que possível.

Os testes devem simular um usuário real.

Inclua:

* abertura do sistema;
* login;
* navegação;
* consulta;
* filtros;
* criação;
* edição;
* salvamento;
* confirmação;
* exclusão/cancelamento;
* navegação entre telas;
* retorno;
* logout.

Teste também cenários negativos.

---

# 14. TESTES DE ERRO

Não teste somente o caminho feliz.

Teste:

* campo obrigatório vazio;
* formato inválido;
* valor inválido;
* registro inexistente;
* duplicidade;
* banco indisponível;
* API indisponível;
* timeout;
* erro 400;
* erro 401;
* erro 403;
* erro 404;
* erro 409;
* erro 500;
* sessão expirada;
* usuário sem permissão.

O sistema deve apresentar comportamento controlado e mensagens adequadas.

---

# 15. TESTES DE REGRESSÃO

Após cada correção:

1. execute o teste que falhou;
2. execute os testes da funcionalidade;
3. execute os testes das funcionalidades relacionadas;
4. execute a suíte geral.

Uma correção não pode quebrar outra parte do sistema.

---

# 16. TESTES AUTOMATIZADOS

Execute todos os testes disponíveis.

Identifique automaticamente os scripts existentes no `package.json`.

Execute, quando disponíveis:

```bash
npm test
npm run test
npm run test:unit
npm run test:integration
npm run test:e2e
npm run lint
npm run typecheck
npm run build
```

Não execute cegamente scripts que não existem.

Primeiro descubra os scripts disponíveis.

Se não existirem testes suficientes, crie os testes necessários para validar as funcionalidades críticas.

---

# 17. TESTE DE BUILD

O projeto deve obrigatoriamente passar pelo build.

Verifique:

* TypeScript;
* imports;
* exports;
* assets;
* environment variables;
* aliases;
* bundling;
* dependências;
* warnings relevantes.

Warnings relevantes devem ser investigados.

Não ignore erro de build.

---

# 18. TYPESCRIPT

Não deixe:

* `any` desnecessário;
* casts perigosos;
* tipos inconsistentes;
* propriedades inexistentes;
* parâmetros incompatíveis;
* promises não tratadas;
* possíveis `undefined`;
* possíveis `null`;
* interfaces divergentes.

Corrija a origem do problema.

---

# 19. CONSOLE E LOGS

Investigue:

```text
console.error
console.warn
Unhandled Promise Rejection
Uncaught Error
Network Error
Failed to fetch
404
500
CORS
TypeError
ReferenceError
```

Não esconda erros simplesmente removendo logs.

Determine a causa.

---

# 20. DADOS MOCKADOS

Dados mockados podem existir somente quando forem claramente utilizados para:

* testes automatizados;
* desenvolvimento controlado;
* demonstração explicitamente separada;
* fixtures.

Dados mockados NÃO podem permanecer como mecanismo operacional de:

* salvar;
* editar;
* excluir;
* consultar;
* movimentar estoque;
* registrar pedidos;
* administrar concessionárias;
* autenticar usuários.

Se uma funcionalidade real ainda depender de mock, ela deve ser identificada e migrada.

---

# 21. AUTENTICAÇÃO E AUTORIZAÇÃO

Teste:

* login;
* logout;
* sessão;
* usuário inválido;
* senha inválida;
* sessão expirada;
* acesso sem autenticação;
* permissões;
* acesso indevido;
* proteção de endpoints;
* proteção de telas.

Nunca deixe credenciais reais dentro do código.

---

# 22. VALIDAÇÃO E SEGURANÇA

Verifique:

* SQL Injection;
* inputs não validados;
* comandos SQL concatenados;
* exposição de secrets;
* tokens no frontend;
* dados sensíveis em logs;
* endpoints sem autorização;
* CORS;
* validação server-side;
* validação client-side.

Use queries parametrizadas.

Nunca concatene entrada do usuário diretamente em SQL.

---

# 23. TRANSAÇÕES

Quando uma operação envolver múltiplas alterações relacionadas:

```text
BEGIN TRANSACTION
    operação 1
    operação 2
    operação 3
COMMIT
```

Em caso de erro:

```text
ROLLBACK
```

Não deixe o banco em estado parcialmente atualizado.

---

# 24. INTERFACE E UX

Durante a auditoria, procure também:

* botões sem ação;
* links quebrados;
* textos cortados;
* componentes sobrepostos;
* modais impossíveis de fechar;
* scroll quebrado;
* loading infinito;
* estado vazio incorreto;
* mensagens de erro ausentes;
* dados incorretos;
* labels inconsistentes;
* problemas de responsividade;
* problemas de modo escuro.

Corrija problemas reais encontrados.

Não faça alterações cosméticas desnecessárias.

---

# 25. FLUXOS CRÍTICOS

Teste especialmente todos os fluxos de negócio.

No mínimo:

## Concessionárias

* listar;
* pesquisar;
* filtrar;
* visualizar;
* cadastrar;
* editar;
* salvar;
* consultar novamente.

## Pedidos

* criar;
* adicionar itens;
* remover itens;
* alterar quantidade;
* calcular valores;
* salvar;
* consultar;
* editar;
* cancelar;
* confirmar persistência.

## Peças

* catálogo;
* pesquisa;
* filtros;
* modelo;
* diagrama;
* hotspot;
* peça;
* quantidade;
* carrinho;
* pedido.

## Estoque

* consulta;
* filtros;
* disponibilidade;
* movimentação quando aplicável;
* atualização;
* persistência.

## Dashboard

* carregamento;
* indicadores;
* filtros;
* dados reais;
* atualização.

---

# 26. EPC / CATÁLOGO DE PEÇAS

Preservar as regras existentes do projeto.

Hotspots devem possuir:

* `id` único;
* `ref` correspondente;
* possibilidade de múltiplos hotspots com o mesmo `ref`.

O estado visual deve utilizar o identificador único do hotspot.

Não substituir a lógica por `hoveredRef` quando houver hotspots duplicados.

Preservar:

* imagens oficiais existentes;
* `BASE_IMG`;
* diagramas;
* hotspots;
* referências;
* peças;
* relacionamento entre diagrama e peça.

Não substituir imagens existentes por imagens genéricas.

---

# 27. GRAPHIFY

Antes de alterações arquiteturais ou relacionais:

1. verificar `graphify-out/graph.json`;
2. utilizar `graphify query`;
3. utilizar `graphify path` quando necessário;
4. utilizar `graphify explain` quando necessário.

Após modificar `.ts` ou `.tsx`:

```bash
graphify update .
```

Se existir lock obsoleto:

```bash
rm -f graphify-out/.rebuild.lock
```

e continue.

---

# 28. DETECÇÃO PROATIVA DE BUGS

Não espere que um teste encontre todos os problemas.

Procure ativamente:

* race conditions;
* estados inconsistentes;
* chamadas duplicadas;
* memory leaks;
* listeners não removidos;
* promises sem tratamento;
* estados impossíveis;
* dados desatualizados;
* cache incorreto;
* problemas de concorrência;
* erros de paginação;
* problemas de timezone;
* problemas de arredondamento;
* problemas de ordenação;
* problemas de filtros;
* inconsistência entre frontend e banco;
* inconsistência entre telas.

---

# 29. REGRA DE CAUSA RAIZ

Para cada erro encontrado, responda internamente:

1. O que aconteceu?
2. Onde aconteceu?
3. Por que aconteceu?
4. Qual é a causa raiz?
5. A correção resolve somente o sintoma ou a causa?
6. Que outras funcionalidades podem possuir o mesmo problema?
7. Qual teste impedirá que isso volte a acontecer?

Sempre que possível, adicione ou melhore um teste de regressão.

---

# 30. LOOP AUTÔNOMO

Continue executando:

```text
AUDITAR
↓
TESTAR
↓
ENCONTRAR ERROS
↓
CORRIGIR
↓
TESTAR
↓
ENCONTRAR NOVOS ERROS
↓
CORRIGIR
↓
TESTAR
↓
REGRESSÃO
↓
AUDITAR NOVAMENTE
```

Repita até atingir todos os critérios de aceite.

NÃO pare porque:

* o primeiro erro foi corrigido;
* o build passou;
* os testes unitários passaram;
* uma tela passou;
* o sistema abriu.

---

# 31. DEFINIÇÃO DE "100% FUNCIONAL"

Considere o projeto aprovado somente quando:

### Código

* [ ] TypeScript sem erros
* [ ] lint sem erros
* [ ] build funcionando
* [ ] imports corretos
* [ ] dependências corretas

### Frontend

* [ ] todas as rotas funcionando
* [ ] todas as telas carregando
* [ ] botões funcionando
* [ ] formulários funcionando
* [ ] filtros funcionando
* [ ] pesquisas funcionando
* [ ] modais funcionando
* [ ] navegação funcionando
* [ ] tratamento de erro funcionando

### Backend

* [ ] API funcionando
* [ ] endpoints funcionando
* [ ] validações funcionando
* [ ] autenticação funcionando
* [ ] autorização funcionando
* [ ] tratamento de erros funcionando

### Banco

* [ ] SQL Server conectado
* [ ] migrations funcionando
* [ ] tabelas corretas
* [ ] relacionamentos corretos
* [ ] constraints funcionando
* [ ] CRUD funcionando
* [ ] transações funcionando
* [ ] persistência comprovada

### Integração

* [ ] Frontend → API funcionando
* [ ] API → SQL Server funcionando
* [ ] SQL Server → API funcionando
* [ ] API → Frontend funcionando

### Testes

* [ ] testes unitários
* [ ] testes de integração
* [ ] testes de API
* [ ] testes de banco
* [ ] testes E2E
* [ ] testes de regressão
* [ ] build
* [ ] lint
* [ ] typecheck

---

# 32. CRITÉRIO ESPECIAL DE PERSISTÊNCIA

Para considerar uma funcionalidade como funcionando:

> O dado precisa sobreviver ao encerramento/reabertura da aplicação.

Exemplo:

```text
Cadastrar concessionária
↓
Salvar
↓
Confirmar no SQL Server
↓
Fechar aplicação
↓
Abrir aplicação novamente
↓
Pesquisar concessionária
↓
Registro continua existindo
```

Se isso não ocorrer, a funcionalidade NÃO está funcionando.

---

# 33. NÃO UTILIZAR HACKS

É proibido:

* comentar código quebrado;
* remover funcionalidade para eliminar erro;
* esconder exceções;
* ignorar testes;
* marcar teste como skip sem justificativa;
* usar `any` para esconder erro;
* usar valores fixos para simular resposta;
* retornar sucesso falso;
* criar mocks para mascarar problemas;
* capturar exceção e ignorar;
* remover validação para fazer teste passar.

A solução deve corrigir o problema real.

---

# 34. DOCUMENTAÇÃO DOS PROBLEMAS

Mantenha registro dos problemas encontrados durante a execução.

Para cada problema:

```text
Problema:
Causa:
Arquivo:
Correção:
Teste utilizado:
Resultado:
```

Ao final, não devem existir problemas conhecidos sem tratamento, exceto bloqueios externos explicitamente documentados.

---

# 35. BLOQUEIOS EXTERNOS

Se um teste não puder ser executado por depender de algo externo:

* identifique exatamente o bloqueio;
* não invente resultado;
* não marque como aprovado;
* tente todas as alternativas seguras disponíveis;
* documente o bloqueio.

Exemplos:

* SQL Server inacessível;
* credencial inexistente;
* serviço externo indisponível;
* infraestrutura inexistente.

Não simule aprovação.

---

# 36. SQL SERVER E CREDENCIAIS

Nunca invente credenciais.

Nunca commite:

* senha;
* token;
* secret;
* connection string com credencial real;
* chave privada.

Utilize variáveis de ambiente.

Exemplo:

```env
DB_HOST=
DB_PORT=
DB_NAME=
DB_USER=
DB_PASSWORD=
```

Se as variáveis forem necessárias e não estiverem disponíveis, identifique o bloqueio claramente.

---

# 37. GIT

Após alterações significativas:

```bash
git status
git diff
```

Revise as alterações.

Depois:

```bash
git add -A
git commit -m "fix: complete system audit and corrections"
git push
```

Não faça commit de:

* secrets;
* `.env`;
* arquivos temporários;
* logs;
* artefatos desnecessários;
* credenciais.

---

# 38. CHECKPOINTS

Após grandes blocos de trabalho:

1. salvar alterações;
2. executar testes;
3. verificar diff;
4. confirmar que não houve regressão;
5. continuar.

---

# 39. ORDEM DE EXECUÇÃO OBRIGATÓRIA

Execute nesta ordem:

## FASE 1 — AUDITORIA

* analisar arquitetura;
* analisar código;
* analisar telas;
* analisar banco;
* analisar APIs;
* analisar mocks;
* analisar testes.

## FASE 2 — INFRAESTRUTURA

* garantir configuração;
* garantir SQL Server;
* garantir migrations;
* garantir API;
* garantir conexão.

## FASE 3 — FUNCIONALIDADES

* corrigir backend;
* corrigir banco;
* corrigir frontend;
* remover mocks operacionais;
* implementar persistência real.

## FASE 4 — TESTES

Executar:

```text
TypeScript
↓
Lint
↓
Unit
↓
API
↓
Integration
↓
Database
↓
E2E
↓
Build
```

## FASE 5 — AUDITORIA VISUAL/INTERATIVA

Tela por tela.

Processo por processo.

Botão por botão.

## FASE 6 — CORREÇÕES

Para cada problema:

```text
Encontrar
→ reproduzir
→ analisar
→ corrigir
→ testar
→ regressão
```

## FASE 7 — TESTE FINAL

Executar novamente toda a suíte.

## FASE 8 — ENTREGA

Somente finalizar quando os critérios de aceite forem atendidos.

---

# 40. REGRA FINAL

Você não está aqui apenas para escrever código.

Você está aqui para:

> **AUDITAR → TESTAR → ENCONTRAR → ENTENDER → CORRIGIR → VALIDAR → REPETIR**

até que o Portal Suzuki esteja realmente funcional.

Não declare sucesso antecipadamente.

Não considere "sem erros aparentes" como "100% funcional".

A conclusão deve ser baseada em evidências de testes.

Se encontrar um problema, corrija.

Se a correção gerar outro problema, corrija.

Se um teste revelar outro problema, corrija.

Continue até que:

**O SISTEMA ESTEJA FUNCIONAL, PERSISTENTE, TESTADO E SEM ERROS CONHECIDOS.**
