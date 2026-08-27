# PORTAL SUZUKI — ESPECIFICAÇÃO DE IMPLEMENTAÇÕES E VALIDAÇÃO DO QUE JÁ EXISTE

## 1. Objetivo

Este documento deve ser utilizado como **prompt/especificação para uma Inteligência Artificial de desenvolvimento** responsável por evoluir o Portal Suzuki existente.

### Regra principal — NÃO QUEBRAR O QUE JÁ FUNCIONA

Antes de implementar qualquer item:

1. Analise a estrutura atual do projeto.
2. Identifique frontend, backend, banco de dados, APIs, regras de negócio, componentes, telas, tabelas e integrações já existentes.
3. Verifique se cada requisito abaixo já foi implementado, parcial ou totalmente.
4. **Se já estiver implementado e funcionando corretamente, NÃO refaça, não substitua e não altere sem necessidade.**
5. Se estiver parcialmente implementado, preserve o que está correto e implemente somente o que falta.
6. Se houver implementação aparentemente correta, valide seu comportamento antes de modificá-la.
7. Antes de criar nova tabela, endpoint, componente ou regra, procure primeiro por estruturas equivalentes existentes.
8. Evite duplicidade de funcionalidades, tabelas, campos, APIs ou regras.
9. Preserve compatibilidade com funcionalidades existentes.
10. Não remover dados existentes.
11. Não alterar regras de negócio existentes sem justificar tecnicamente.
12. Faça as alterações de forma incremental e organizada.

### Critério de aceite geral

Uma funcionalidade somente deve ser considerada concluída quando:

- estiver implementada;
- estiver integrada à estrutura existente;
- estiver persistindo/consultando os dados corretamente;
- estiver funcionando na visão correta (Concessionário ou Montadora);
- respeitar permissões e estados;
- não quebrar funcionalidades existentes;
- possuir validações de entrada;
- possuir tratamento de erros;
- puder ser testada pelo fluxo completo.

---

# 2. Módulos a ocultar temporariamente

Por enquanto, ocultar da navegação/interface os seguintes módulos:

- Catálogo EPC & Peças
- Vendas & CRM Rede
- Garantias & Pós Venda

### Importante

Não excluir funcionalidades, tabelas, APIs ou código desses módulos.

Apenas:

- remover/ocultar os acessos na interface;
- preservar os dados;
- preservar o código;
- preservar APIs existentes;
- permitir reativação futura.

---

# 3. PEDIDO DA FÁBRICA (MOTOS) — VISÃO CONCESSIONÁRIO

## 3.1 Alteração da cor da moto na imagem

Ao clicar/selecionar a cor de uma motocicleta, verificar a possibilidade de alterar dinamicamente a imagem apresentada no card para a imagem correspondente à cor selecionada.

### Fonte das imagens

Google Drive:

https://drive.google.com/drive/folders/1EUa7HV_3AuLOE3F2yYAl5CR_Q6IdOZm1

### Requisitos

- Identificar como as imagens estão organizadas.
- Criar ou reutilizar mecanismo de associação:
  - marca;
  - modelo;
  - ano;
  - código da cor;
  - imagem.
- Ao trocar a cor, atualizar a imagem do card.
- Caso não exista imagem específica da cor, utilizar imagem padrão do modelo.
- Não quebrar o carregamento atual dos cards.

### Antes de implementar

Verificar se já existe no projeto:

- cadastro de imagens;
- armazenamento de URL;
- relacionamento modelo/cor;
- componente de seleção de cores;
- mecanismo de troca de imagem.

Se existir, reutilizar.

---

# 4. CUSTO — MEMORIAL DE CÁLCULO

Na informação de custo da motocicleta deverá existir um ícone `?`.

Ao passar/clicar no `?`, apresentar a composição do custo.

### Estrutura esperada

O sistema deverá permitir apresentar algo semelhante a:

- Valor base da moto
- Descontos
- Acréscimos
- Frete
- Fundo de reserva
- Outros componentes aplicáveis
- Custo final

### Observação

Existe uma planilha oficial com o memorial de cálculo, que será utilizada posteriormente.

**Para os testes iniciais, criar um memorial de custo fictício/configurável.**

### Requisito técnico

Não deixar os valores de composição hard-coded no frontend.

Criar/reutilizar estrutura de dados que permita posteriormente substituir o memorial de teste pela regra oficial.

---

# 5. FORMA DE PAGAMENTO NO CARD DA MOTO — CONCESSIONÁRIO

Dentro do card de cada motocicleta deverá existir a seleção da forma de pagamento.

### Regra

A forma de pagamento deverá ser carregada a partir da tabela de condições de pagamento.

Deve existir relacionamento entre:

- ano;
- modelo;
- forma de pagamento;
- vigência;
- desconto, quando aplicável.

### Importante

Não criar uma segunda regra de condição de pagamento se já existir uma estrutura equivalente.

Primeiro localizar e avaliar a tabela/regra existente.

---

# 6. STATUS DA COR / DISPONIBILIDADE

Na área próxima à cor da motocicleta deverá ser apresentado o status de disponibilidade.

Substituir a exibição atual do código da cor, quando aplicável, por:

- Disponível
- Poucas unidades
- Indisponível

### Regras

**Disponível**
- permitir adicionar ao pedido.

**Poucas unidades**
- permitir adicionar ao pedido;
- apresentar claramente o alerta de baixa disponibilidade.

**Indisponível**
- botão `+` desativado;
- impedir inclusão da cor no pedido.

### Observação

O critério de "Poucas unidades" deverá ser configurável ou seguir a regra de estoque já existente.

Não criar regra fixa sem verificar se o projeto já possui parâmetro de estoque.

---

# 7. MODELOS EM LINHA / VIGÊNCIA

Na visão do concessionário, em Pedido da Fábrica (Motos), exibir somente:

- ano;
- modelo;
- cores;

que estejam disponíveis na tabela de condição de pagamento vigente.

### Regra

Um modelo somente deve aparecer se existir uma condição de pagamento válida para a data atual.

Considerar:

- data inicial da vigência;
- data final da vigência;
- ano;
- modelo;
- marca;
- condição ativa.

Não exibir modelos fora da vigência.

---

# 8. HISTÓRICO DE VENDAS E ESTOQUE NO CARD

Na visão do concessionário, cada card de modelo deverá apresentar:

### Informações

**Estoque da concessionária**
- quantidade atual em estoque.

**Média de emplacamentos dos últimos 3 meses**
- calcular com base nos três meses anteriores.

**Quantidade de compras realizadas no mês**
- quantidade de motos/modelos comprados pela concessionária no mês corrente.

**Quantidade do compromisso de compra do mês**
- quantidade comprometida no período vigente.

### Importante

Verificar se essas informações já existem no banco.

Priorizar reutilização das tabelas existentes.

Não duplicar dados de estoque ou vendas.

### Tratamento

Caso não existam dados suficientes:

- apresentar `0`, quando aplicável;
- não apresentar erro;
- não quebrar o card.

---

# 9. COMPROMISSO DE COMPRA MENSAL — VISÃO CONCESSIONÁRIO

Alterar o campo:

`Período / Mês de Referência`

para:

`Trimestre`

### Opções

- 1º Trimestre
- 2º Trimestre
- 3º Trimestre
- 4º Trimestre

### Comportamento automático

Ao selecionar:

**1º Trimestre**
- Janeiro
- Fevereiro
- Março

**2º Trimestre**
- Abril
- Maio
- Junho

**3º Trimestre**
- Julho
- Agosto
- Setembro

**4º Trimestre**
- Outubro
- Novembro
- Dezembro

Os meses devem ser preenchidos automaticamente.

---

# 10. FLUXO DE APROVAÇÃO DO COMPROMISSO

Após o preenchimento pelo concessionário:

1. Concessionário envia o compromisso.
2. Registro fica disponível na visão da Montadora.
3. Montadora analisa.
4. Montadora aprova ou rejeita.
5. Após aprovação:
   - concessionário não pode mais alterar;
   - sistema deve registrar o status;
   - visão do concessionário deve mostrar:
     **Aprovado pela Montadora**.

### Estados sugeridos

- Rascunho
- Enviado para aprovação
- Em análise
- Aprovado
- Rejeitado
- Reaberto, caso exista regra administrativa para isso

### Regra de bloqueio

Compromisso aprovado não pode ser alterado pelo concessionário.

---

# 11. VISÃO MONTADORA — FORMA DE PAGAMENTO E DESCONTO

Criar/reutilizar tabela de formas de pagamento.

A condição deve estar vinculada a:

- marca;
- ano;
- modelo;
- forma de pagamento;
- desconto;
- data inicial da vigência;
- data final da vigência;
- status.

### Regra

Quando a condição selecionada possuir desconto:

- calcular automaticamente o desconto;
- atualizar o valor da motocicleta;
- atualizar o total do item;
- atualizar o resumo do pedido.

### Exemplo

Valor original:
`R$ 20.000,00`

Desconto:
`R$ 1.000,00`

Valor atualizado:
`R$ 19.000,00`

Os valores acima são somente exemplo para testes.

---

# 12. TABELA DE FRETE

Criar/reutilizar uma tabela de frete.

Neste momento, utilizar uma estrutura de exemplo até o recebimento da tabela oficial.

### O frete deverá considerar

- concessionária;
- região;
- origem de faturamento/estoque;
- destino;
- marca/modelo, se aplicável;
- valor;
- vigência;
- status.

---

# 13. ORIGEM DE COMPRA DA CONCESSIONÁRIA

No cadastro da concessionária, adicionar/reutilizar configuração semelhante ao cadastro de usuários para determinar a origem de compra das motocicletas.

### Regra

**Região Sul e Sudeste, exceto ES**
- Empresa 13
- Armazém

**Região Norte, Nordeste, Centro-Oeste e ES**
- Manaus
- Local de Estoque 16
- Empresa 01 e 10
- Matriz no sistema = Filial de Manaus

### Importante

Não colocar essa regra diretamente no frontend.

Ela deve ser uma configuração/regra de negócio centralizada.

### Cadastro

Criar uma área/configuração no cadastro da concessionária para:

- origem de compra;
- empresa;
- filial;
- local de estoque;
- região;
- vigência, se necessário.

A interface deve seguir o padrão visual e funcional já utilizado no cadastro de usuários.

---

# 14. FUNDO DE RESERVA

Próximo ao limite disponível do concessionário, apresentar:

**Saldo disponível no Fundo de Reserva**

### No pedido

Ao incluir um modelo, apresentar:

`Usar Fundo de Reserva?`

Opções:

- Sim
- Não

### Regra

A opção somente poderá ser utilizada se houver saldo disponível.

Se não houver saldo:

- opção deve ficar indisponível ou impedir utilização;
- apresentar mensagem explicativa.

---

# 15. CADASTRO DE FUNDO DE RESERVA

Criar/reutilizar cadastro que relacione:

- marca;
- valor/regra de utilização;
- vigência;
- status;
- demais parâmetros necessários.

Existem regras diferentes de valor por marca.

### Importante

Não fixar os valores no código.

Os valores deverão ser configuráveis no cadastro.

---

# 16. MÓDULO DE FUNDO DE RESERVA — EXTRATO / CONTA CORRENTE

Criar um módulo separado para controlar o Fundo de Reserva.

O comportamento deve ser semelhante a uma conta corrente/extrato.

### Créditos

Podem ser:

- crédito concedido pela Montadora;
- inclusão pela Montadora;
- lançamento originado do RD Station;
- outros créditos autorizados.

### Débitos

Podem ser:

- utilização em pedidos de venda;
- outros débitos permitidos pela regra.

### RD Station

Quando o crédito vier do RD Station:

- lançamento feito pela área Comercial ou Marketing;
- deverá passar por aprovação Financeira;
- somente após aprovação deverá impactar o saldo disponível.

### Cada lançamento deverá possuir

- concessionária;
- tipo: crédito/débito;
- origem;
- valor;
- data;
- usuário responsável;
- status;
- referência do pedido, quando aplicável;
- observação;
- saldo após lançamento.

### Visão do concessionário

Exibir:

- saldo atual;
- extrato;
- créditos;
- débitos;
- histórico.

---

# 17. PEDIDO DE MOTO — MODELO / ANO

O pedido deverá ser estruturado por item.

Cada item deve considerar:

- modelo;
- ano;
- cor;
- quantidade;
- condição de pagamento;
- desconto;
- frete;
- fundo de reserva;
- valor unitário;
- valor total;
- observação.

### Resumo do pedido

Ao transmitir para a fábrica, apresentar:

- itens;
- totais;
- condição de pagamento;
- frete;
- utilização do fundo de reserva;
- observações;
- demais valores aplicáveis.

---

# 18. ALTERAÇÕES FEITAS PELA MONTADORA

Se a Montadora alterar ou adicionar alguma informação em um pedido já enviado:

O item alterado deverá retornar para o concessionário para:

- aprovação; ou
- rejeição.

### Regra importante

A aprovação deve ocorrer por item.

Não aprovar automaticamente o pedido inteiro quando somente um item foi alterado.

---

# 19. APROVAÇÕES POR ITEM — MONTADORA

Na visão da Montadora, aprovações financeiras e comerciais devem ocorrer individualmente por:

- modelo;
- ano;
- cor;
- forma de pagamento.

### Estrutura

Cada item deve possuir seus próprios estados de aprovação.

Exemplo:

| Item | Comercial | Financeiro | Status |
|---|---|---|---|
| Modelo A / 2026 / Azul | Aprovado | Aprovado | Aprovado |
| Modelo B / 2026 / Preto | Aprovado | Pendente | Pendente |

### Regra

O pedido somente poderá avançar para o próximo estágio quando todas as aprovações obrigatórias dos itens estiverem concluídas.

---

# 20. CADASTRO DE REGIONAIS POR MARCA

Criar um cadastro de Regionais.

### Estrutura mínima

- marca;
- regional;
- código;
- descrição;
- status;
- vigência, se necessário.

### Relacionamento

No cadastro da concessionária deverá ser possível vincular:

- marca;
- regional correspondente.

Uma concessionária poderá ter relacionamento conforme as regras de negócio da marca.

---

# 21. REGRAS DE ARQUITETURA E IMPLEMENTAÇÃO

## 21.1 Antes de alterar

A IA deverá fazer uma análise do projeto e produzir internamente um inventário de:

- telas existentes;
- componentes existentes;
- rotas;
- APIs;
- tabelas;
- migrations;
- models/entities;
- serviços;
- regras de negócio;
- permissões;
- integrações;
- campos já existentes.

## 21.2 Matriz de implementação

Para cada requisito deste documento, classificar:

- `JÁ IMPLEMENTADO`
- `PARCIALMENTE IMPLEMENTADO`
- `NÃO IMPLEMENTADO`
- `IMPLEMENTADO, MAS INCORRETO`

Depois:

- manter o que estiver correto;
- corrigir somente o necessário;
- implementar o que faltar.

## 21.3 Não duplicar

Antes de criar:

- tabela;
- coluna;
- endpoint;
- serviço;
- componente;
- tela;
- regra;

pesquisar se já existe algo equivalente.

## 21.4 Banco de dados

Qualquer alteração estrutural deverá ser feita por migration.

Não apagar dados existentes.

Não alterar dados existentes sem necessidade.

Criar índices quando necessário para consultas de:

- concessionária;
- modelo;
- ano;
- cor;
- vigência;
- status;
- pedido;
- trimestre.

---

# 22. SEGURANÇA E PERMISSÕES

Respeitar os perfis existentes.

Diferenciar claramente:

### Concessionário

Pode:

- consultar modelos disponíveis;
- selecionar cor;
- selecionar forma de pagamento;
- montar pedido;
- informar utilização do fundo;
- enviar pedido;
- preencher compromisso;
- aprovar/rejeitar alterações quando solicitado.

Não pode:

- alterar condição definida pela Montadora;
- alterar pedido após aprovação quando bloqueado;
- alterar saldo do Fundo de Reserva;
- aprovar financeiramente/comercialmente seus próprios itens.

### Montadora

Pode:

- cadastrar condições;
- cadastrar frete;
- configurar regras;
- aprovar/rejeitar compromissos;
- alterar itens;
- solicitar aprovação do concessionário;
- executar aprovações comerciais;
- executar aprovações financeiras;
- administrar Fundo de Reserva conforme permissões.

---

# 23. VIGÊNCIA

Todas as regras que dependem de período deverão considerar:

- `data_inicio`
- `data_fim`
- `ativo`

Isso se aplica principalmente a:

- condições de pagamento;
- descontos;
- campanhas;
- fretes;
- regras de fundo de reserva;
- modelos em linha.

### Regra

Não considerar somente `ativo = true`.

A data atual precisa estar dentro da vigência.

---

# 24. CÁLCULO DE VALORES

Centralizar os cálculos no backend/regra de negócio.

O frontend deve apenas apresentar os valores calculados.

Exemplo conceitual:

`Valor Base`
`- Desconto`
`+ Frete`
`- Fundo de Reserva`
`= Valor Final`

A ordem e composição definitiva deverão respeitar a regra oficial da Montadora quando fornecida.

Para os testes, utilizar regras fictícias configuráveis.

---

# 25. LOG E AUDITORIA

Para alterações críticas, registrar:

- usuário;
- perfil;
- data/hora;
- item alterado;
- valor anterior;
- valor novo;
- ação;
- motivo, quando necessário.

Especialmente para:

- alteração de pedido;
- alteração de preço;
- desconto;
- frete;
- fundo de reserva;
- aprovação;
- rejeição;
- compromisso de compra.

---

# 26. TESTES OBRIGATÓRIOS

Criar testes para pelo menos os seguintes cenários:

### Pedido

1. Modelo com condição vigente aparece.
2. Modelo sem condição vigente não aparece.
3. Cor disponível permite inclusão.
4. Cor com poucas unidades permite inclusão e apresenta alerta.
5. Cor indisponível bloqueia inclusão.
6. Troca de cor altera imagem quando houver imagem correspondente.
7. Forma de pagamento altera o valor quando houver desconto.
8. Frete é calculado conforme concessionária/origem.
9. Fundo de reserva pode ser utilizado somente havendo saldo.
10. Pedido mostra composição de valores.
11. Observação é transmitida.

### Aprovação

12. Pedido enviado chega para Montadora.
13. Montadora altera item.
14. Item retorna ao concessionário para aprovação/rejeição.
15. Aprovação ocorre por item.
16. Aprovação financeira é independente da comercial.
17. Item aprovado não pode ser alterado indevidamente.

### Compromisso

18. Seleção do trimestre gera os três meses corretos.
19. Compromisso chega à Montadora.
20. Montadora aprova.
21. Concessionário visualiza "Aprovado pela Montadora".
22. Concessionário não consegue alterar compromisso aprovado.

### Fundo de Reserva

23. Crédito aumenta saldo.
24. Débito reduz saldo.
25. Saldo não pode ficar negativo.
26. Extrato apresenta lançamentos.
27. Crédito de RD Station exige aprovação financeira.
28. Uso do fundo aparece vinculado ao pedido.

---

# 27. ORDEM RECOMENDADA DE IMPLEMENTAÇÃO

Executar nesta ordem:

### Fase 1 — Diagnóstico

- mapear arquitetura;
- mapear banco;
- mapear telas;
- mapear APIs;
- mapear funcionalidades existentes;
- comparar com este documento.

### Fase 2 — Ocultação

- ocultar módulos temporários sem excluir funcionalidades.

### Fase 3 — Cadastros e regras-base

- condições de pagamento;
- descontos;
- frete;
- origem da concessionária;
- regionais;
- fundo de reserva.

### Fase 4 — Pedido da Fábrica

- cards;
- cores;
- imagens;
- disponibilidade;
- condições;
- custo;
- frete;
- fundo;
- histórico;
- resumo.

### Fase 5 — Compromisso de Compra

- trimestre;
- meses;
- fluxo de aprovação;
- bloqueio após aprovação.

### Fase 6 — Aprovações do Pedido

- aprovação comercial;
- aprovação financeira;
- alteração pela Montadora;
- retorno para concessionário;
- aprovação/rejeição por item.

### Fase 7 — Fundo de Reserva

- extrato;
- conta corrente;
- integração com pedidos;
- créditos;
- débitos;
- aprovação financeira.

### Fase 8 — Testes e regressão

- executar testes;
- verificar funcionalidades antigas;
- corrigir regressões;
- validar permissões;
- validar cálculos;
- validar vigências.

---

# 28. ENTREGA ESPERADA DA IA DE DESENVOLVIMENTO

Ao concluir o trabalho, apresentar um relatório contendo:

## A. Diagnóstico inicial

Para cada requisito:

- status encontrado;
- onde está implementado;
- tabela/componente/API relacionado;
- o que precisa ser alterado.

## B. Alterações realizadas

Para cada alteração:

- arquivo;
- componente;
- endpoint;
- tabela/migration;
- regra criada/alterada;
- descrição.

## C. O que NÃO foi alterado

Listar funcionalidades já existentes que foram consideradas corretas e preservadas.

## D. Banco de dados

Informar:

- tabelas novas;
- campos novos;
- migrations;
- relacionamentos;
- índices.

## E. Testes

Informar:

- testes realizados;
- resultado;
- eventuais pendências.

## F. Pendências externas

Separar aquilo que depende de informações ainda não fornecidas, especialmente:

- tabela oficial de frete;
- memorial oficial de custo;
- regras oficiais de fundo de reserva;
- imagens definitivas/estrutura do Google Drive;
- tabela definitiva de condições de pagamento/descontos.

---

# 29. REGRA FINAL PARA A IA

**Não assumir que nada foi feito anteriormente.**

O sistema já possui implementações que podem estar corretas.

Portanto:

> Primeiro investigar.  
> Depois comparar com os requisitos.  
> Depois testar o que já existe.  
> Somente então alterar ou implementar.

**Preservar tudo que estiver correto.**

Quando houver dúvida entre substituir uma implementação existente e adaptá-la, preferir **adaptar a implementação existente**, desde que isso não comprometa a arquitetura ou a regra de negócio.

Não realizar refatorações grandes apenas por preferência de estilo.

Não alterar tecnologias, frameworks ou arquitetura sem necessidade.

Não apagar funcionalidades existentes.

Não remover tabelas existentes.

Não recriar funcionalidades já existentes.

O objetivo é **evoluir o Portal Suzuki existente com o menor impacto possível**, mantendo compatibilidade, segurança, rastreabilidade e consistência dos dados.
