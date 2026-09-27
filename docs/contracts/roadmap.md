# Roadmap do `@repo/contracts`

Este arquivo registra duas coisas:

1. o baseline entregue por esta estrutura padrão;
2. objetivos concretos adicionados pelo projeto que reutilizar a estrutura.

Ele não deve antecipar entidades, features ou regras de um domínio que ainda não
existe. Um projeto novo começa somente com o baseline concluído e adiciona seus
próprios objetivos quando surgir uma necessidade real.

## Baseline da estrutura padrão

Os itens abaixo descrevem capacidades já entregues e verificadas neste
repositório:

- [x] Package compartilhado localizado em `packages/contracts`.
- [x] Nome de workspace definido como `@repo/contracts`.
- [x] Package privado com entrypoint e export público em `src/index.ts`.
- [x] Configurações compartilhadas de TypeScript e ESLint.
- [x] Scripts de lint e typecheck disponíveis no package.
- [x] Dependências `workspace:*` configuradas nos apps web e API.
- [x] Transpilação de `@repo/contracts` configurada no Next.js.
- [x] Package independente de `@repo/database` e de código server-only.
- [x] Tipos neutros mínimos para verificar o compartilhamento entre apps.
- [x] Documentação de arquitetura, convenções, erros, integrações e testes.
- [x] Instruções para agentes apontando para a documentação de contratos.

O baseline deve conter apenas o que qualquer projeto criado a partir desta base
receberá funcionando. Não marque uma capacidade como concluída apenas porque ela
está documentada ou planejada.

## Objetivos específicos do projeto

O objetivo abaixo existe temporariamente para validar, de ponta a ponta, como a
estrutura se comporta. Ao iniciar um projeto real a partir deste repositório, o
exemplo de Produto e este objetivo devem ser removidos; o novo projeto registra
somente objetivos do seu próprio domínio.

### CONTRACTS-001 — Validar contratos do domínio Produto com Zod 4

**Status:** em andamento

**Contexto**

O domínio `Produto` será o primeiro fluxo compartilhado entre banco, API e Web.
Ele precisa validar em runtime tipos e representações diferentes, incluindo
strings formatadas, enums, booleanos, inteiros, decimais, floats, datas, campos
anuláveis e valores que não atravessam JSON como existem no Prisma.

O package passou a depender de Zod 4 e já possui testes próprios com o runner
nativo do Node executado por `tsx`. A API ainda usa Zod 3 e deverá ser alinhada
com Zod 4 antes da integração dos DTOs.

**Escopo**

- adicionar Zod 4 como dependência runtime de `@repo/contracts`;
- alinhar o uso direto de Zod pela API com a versão 4;
- adicionar infraestrutura mínima de testes ao package de contratos;
- criar contratos de body para criação e atualização de produto;
- criar contratos de params e query de listagem;
- criar responses resumida, detalhada e paginada;
- derivar e exportar tipos de input e output a partir dos schemas;
- documentar semântica, limites, serialização e casos de teste;
- validar `@repo/contracts` e os consumidores afetados.

Ficam fora deste objetivo:

- contratos de `AvaliacaoProduto`, que serão a próxima evolução do domínio;
- DTOs, controllers, services e repositories da API;
- formulário, operações HTTP e página Web;
- upload e armazenamento de arquivos;
- autenticação e autorização.

**Consumidores afetados**

- `apps/api`, que usará os schemas nos DTOs e validará os boundaries HTTP;
- `apps/web`, que usará schemas compatíveis nos formulários e validará
  responses externas.

**Critérios de aceite**

- [ ] Zod 4 configurado sem múltiplas majors no fluxo do domínio;
- [x] runner e script de testes disponíveis em `@repo/contracts`;
- [x] contratos e exports públicos revisados;
- [x] tipos de input e output derivados dos schemas;
- [x] create, update, params, query e responses cobertos por testes;
- [x] ausência, `undefined`, `null` e string vazia testados onde aplicável;
- [x] limites de strings e paginação testados;
- [x] `Decimal`, `BigInt` e `DateTime` serializados explicitamente;
- [x] lint, typecheck e testes de contratos aprovados;
- [ ] consumidores afetados validados;
- [x] documentação atualizada.

**Decisões**

- O schema Zod será a fonte de verdade dos contratos runtime.
- Contratos serão nomeados pela operação e pelo boundary.
- `@repo/contracts` permanecerá independente de `@repo/database`.
- O CRUD de Produto será contratado antes do sub-recurso Avaliação.
- Campos internos ou controlados pelo servidor não entrarão no body apenas para
  aumentar cobertura de tipos.
- Responses usarão strings para `Decimal`, `BigInt` e datas ISO 8601 para
  `DateTime`.
- `dataValidade` será uma data de calendário `YYYY-MM-DD`; datas que representam
  instantes continuarão usando ISO 8601 com offset.
- URLs de manual aceitarão somente os protocolos HTTP e HTTPS.
- Booleanos recebidos em query serão interpretados sem diferença entre letras
  maiúsculas e minúsculas, dentro do vocabulário explicitamente permitido.
- Página e limite serão recebidos como strings formadas somente por dígitos e
  convertidos para `number` depois da validação da representação. A página terá
  default 1; o limite terá default 20 e máximo 50.
- `createdAt` e `updatedAt` permanecerão em inglês por convenção técnica.
- Preço representa um valor estritamente positivo, com mínimo de `0.01`.
- `quantidadeVendas` será serializada como string inteira não negativa com no
  máximo 19 dígitos.
- Schemas específicos do domínio permanecerão em `src/produto`; uma primitive
  só irá para `common` depois de reutilização real e testes.
- O SKU será normalizado com trim e letras maiúsculas. Campos anuláveis em
  update usarão `null` para limpeza explícita e propriedade ausente para
  preservar o valor atual.

### CONTRACTS-002 — Criar contratos do sub-recurso AvaliacaoProduto

**Status:** em andamento

**Contexto**

`AvaliacaoProduto` é um sub-recurso de Produto e exercita contratos de rotas
aninhadas, params compostos, relação 1:N e uma segunda listagem paginada. Essa
segunda ocorrência também justificou extrair a semântica compartilhada de
paginação para `common`.

**Estado atual**

- a primitive `PaginacaoQuerySchema` foi criada e já é consumida pelas queries
  de Produto e Avaliação;
- fields, params, create, update, query e responses de avaliação possuem uma
  implementação inicial;
- a paginação comum e os schemas de avaliação possuem testes próprios;
- os novos schemas foram adicionados aos barrels e ao teste da API pública;
- `nota` usa `number` inteiro de 1 a 5 também na response, preservando a
  representação JSON natural do `Int` do Prisma;
- a query e o schema de response da listagem usam o singular `Produto`, pois a
  coleção pertence ao produto identificado no path;
- o type alias da response de listagem também foi alinhado ao singular;
- lint, typecheck e os 104 testes do package passam;
- o filtro `pesquisa` consulta exclusivamente o campo `autorNome`.

**Escopo**

- criar fields semânticos para autor, nota e comentário;
- criar params da coleção e do item aninhado;
- criar contratos de body para criação e atualização;
- criar query paginada de listagem com filtros explícitos;
- criar responses detalhada, resumida, de item e de listagem;
- extrair e testar a paginação compartilhada;
- derivar e exportar tipos de input e output;
- revisar exports públicos e documentar as semânticas.

Ficam fora deste objetivo:

- controllers, services e repositories da API;
- existência do produto e pertencimento da avaliação ao produto;
- autenticação e autorização;
- inclusão automática de avaliações nas responses de Produto.

**Consumidores afetados**

- `apps/api`, nas futuras rotas aninhadas de avaliações;
- `apps/web`, na futura listagem e edição de avaliações.

**Critérios de aceite**

- [x] implementação inicial de fields, params, create e update;
- [x] implementação inicial de query e responses;
- [x] paginação compartilhada extraída para `common`;
- [x] query definida para a coleção aninhada de um produto;
- [x] nomes do schema e dos tipos da query alinhados ao escopo singular;
- [x] nome do type alias da response de listagem alinhado ao escopo singular;
- [x] campos consultados pelo filtro `pesquisa` definidos;
- [x] representação de `nota` corrigida na response;
- [x] paginação comum coberta por testes próprios;
- [x] contratos de avaliação cobertos por testes;
- [x] ausência, `undefined`, `null` e string vazia testados;
- [x] schemas e tipos exportados pelos barrels;
- [x] teste da API pública atualizado;
- [x] lint, typecheck e testes aprovados após a cobertura nova;
- [x] documentação atualizada para o estado da implementação.

**Decisões**

- Os contratos permanecerão dentro da feature `produto`.
- `produtoId` virá do path e não do body de criação.
- Operações de item receberão `produtoId` e `avaliacaoId` como UUIDs.
- `autorNome` terá trim, mínimo de um e máximo de 80 caracteres.
- `nota` será um `number` inteiro de 1 a 5 em bodies e responses.
- `comentario` será opcional no create e anulável no update e na response.
- `recomenda` terá default `true` somente no create.
- Update vazio ou contendo somente propriedades `undefined` será inválido.
- Listagens reutilizarão página default 1, limite default 20 e máximo 50.
- A query e a response de listagem representam avaliações do único produto
  identificado por `produtoId` no path e usam `Produto` no singular.
- A response resumida conterá `id`, `produtoId`, `autorNome`, `nota` e
  `createdAt`; a detalhada também conterá comentário, recomendação e
  `updatedAt`.
- `createdAt` e `updatedAt` permanecerão em inglês e serão strings UTC com
  precisão de milissegundos.
- A existência do produto e o pertencimento da avaliação serão regras do
  service, não dos schemas Zod.
- O filtro `pesquisa` consultará somente `autorNome`.

Ao reutilizar o repositório, adicione aqui somente objetivos necessários ao
contexto real da nova aplicação. Um objetivo pode representar:

- adoção de uma capacidade transversal no package;
- criação ou alteração de um contrato externo;
- integração de validação em um novo tipo de consumidor;
- extração de uma abstração justificada por repetição concreta;
- mudança que exige coordenação entre vários consumidores.

Não crie objetivos hipotéticos “para uso futuro”.

### Modelo de objetivo

```md
### CONTRACTS-001 — <resultado esperado>

**Status:** planejado | em andamento | concluído

**Contexto**

Explique a necessidade concreta e por que ela pertence a @repo/contracts.

**Escopo**

- o que será alterado;
- consumidores afetados;
- o que fica explicitamente fora.

**Critérios de aceite**

- [ ] comportamento implementado;
- [ ] contratos e exports revisados;
- [ ] testes relevantes adicionados;
- [ ] consumidores afetados validados;
- [ ] documentação atualizada.

**Decisões**

Registre semânticas importantes, compatibilidade e links para fontes oficiais.
```

## Ciclo de um objetivo

1. Inspecione o package e todos os consumidores afetados.
2. Registre o objetivo antes de implementar uma nova capacidade relevante.
3. Defina contexto, escopo e critérios de aceite verificáveis.
4. Implemente de forma incremental.
5. Atualize decisões e documentação durante o trabalho.
6. Marque como concluído somente após validar código, tipos, testes e
   consumidores.

Correções pequenas e internas podem ser feitas sem criar um objetivo separado
quando não introduzem capacidade nova nem alteram comportamento externo.

## Promoção para o baseline

Um objetivo específico pode virar parte da estrutura padrão somente quando:

- fizer sentido para qualquer projeto criado a partir da base;
- estiver implementado no repositório-base;
- possuir verificações compatíveis com seu risco;
- estiver documentado sem referências ao domínio que o originou;
- não introduzir dependência desnecessária de framework ou infraestrutura.

Depois da promoção:

1. remova detalhes do domínio original;
2. registre a capacidade na seção de baseline como concluída;
3. mantenha no projeto derivado apenas decisões que continuem específicas dele.

Assim, futuros projetos recebem a capacidade pronta e não uma tarefa
artificialmente marcada como concluída.

## Regras de manutenção

- O roadmap deve refletir o estado real do código.
- Objetivos concluídos preservam contexto e critérios de aceite.
- Objetivos cancelados registram o motivo em vez de desaparecer silenciosamente.
- Mudanças em contratos externos identificam consumidores e compatibilidade.
- A documentação detalhada permanece nos demais arquivos deste diretório; o
  roadmap registra intenção, escopo e progresso.
