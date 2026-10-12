# Roadmap da aplicação Web

Este arquivo registra os objetivos concretos da aplicação Next.js. Ele deve
permitir que outra pessoa ou agente continue o trabalho sem inferir escopo,
ordem ou decisões já tomadas.

O domínio `Produto` é didático e descartável. Ao iniciar um projeto real, as
entregas específicas dele devem ser removidas ou substituídas pelo domínio
real. Capacidades que se mostrarem reutilizáveis podem ser promovidas ao
baseline somente depois de implementadas, verificadas e documentadas sem
dependência de Produto.

## Estado antes da primeira entrega

- a página inicial atual é a única tela e deve ser preservada;
- o App Router, o rewrite `/api/backend/:path*` e `@repo/contracts` já estão
  configurados;
- Tailwind CSS e shadcn/ui ainda não estão configurados;
- React Hook Form, `@hookform/resolvers` e TanStack Query ainda não estão
  instalados;
- clientes HTTP, operações, hooks e telas do domínio ainda não existem;
- o CRUD de Produto e o CRUD aninhado de avaliações já existem na API;
- as rotas do exemplo são públicas, sem autenticação ou autorização;
- testes E2E específicos dessas rotas da API ainda estão pendentes.

## Sequência planejada

1. `WEB-001`: baseline da Web, integração de leitura e lista de produtos;
2. `WEB-002`: detalhes, criação, edição e exclusão de produto;
3. `WEB-003`: lista e CRUD de avaliações dentro do produto;
4. `WEB-003A`: criação e edição em modais roteáveis;
5. `WEB-004`: testes de interface e fluxos críticos;
6. `WEB-005`: preparação explícita de segurança, observabilidade e performance
   para uso além do exemplo público.

Cada objetivo deve ser concluído e verificado antes de ampliar o seguinte.
Correções necessárias no objetivo anterior podem ser feitas junto da entrega
que as revelar, desde que sejam registradas.

## Progresso atual

`WEB-001`, `WEB-002`, `WEB-003`, `WEB-003A` e `WEB-004` estão concluídas. A home
foi preservada, o baseline visual, a infraestrutura HTTP e o TanStack Query
foram implementados, e o CRUD Web de Produto cobre listagem, detalhe, criação,
edição e exclusão. Filtros e paginação permanecem na URL; formulários possuem
schemas e mappers locais; a exclusão confirma a remoção em cascata das
avaliações e trata `204 No Content`. Toasts globais confirmam create, update e
delete sem acoplar Sonner às operações ou aos hooks de dados.

O CRUD aninhado de avaliações cobre listagem paginada, filtros na URL, detalhe,
criação, edição e exclusão sem incluir uma coleção ilimitada na response básica
de Produto. As quatro rotas de criação e edição abrem em modais durante
navegação interna e continuam como páginas completas em acesso direto ou
refresh. Playwright automatiza 17 cenários críticos no Chromium, com mock de
rede estrito, acessibilidade automatizável na home e execução no CI. A próxima
entrega é `WEB-005`; o estado exato e a ordem de continuação estão no
[handoff](./handoff.md).

## Rotas implementadas

| Rota                                                    | Responsabilidade                            | Entrega   |
| ------------------------------------------------------- | ------------------------------------------- | --------- |
| `/`                                                     | home atual e acesso ao catálogo             | `WEB-001` |
| `/produtos`                                             | filtros, paginação e lista responsiva       | `WEB-001` |
| `/produtos/novo`                                        | criação de produto                          | `WEB-002` |
| `/produtos/[produtoId]`                                 | detalhes e ações do produto                 | `WEB-002` |
| `/produtos/[produtoId]/editar`                          | edição de produto                           | `WEB-002` |
| `/produtos/[produtoId]/avaliacoes`                      | lista paginada e filtros de avaliações      | `WEB-003` |
| `/produtos/[produtoId]/avaliacoes/nova`                 | criação de avaliação                        | `WEB-003` |
| `/produtos/[produtoId]/avaliacoes/[avaliacaoId]`        | detalhe da avaliação pertencente ao produto | `WEB-003` |
| `/produtos/[produtoId]/avaliacoes/[avaliacaoId]/editar` | edição da avaliação pertencente ao produto  | `WEB-003` |

Exclusões serão ações confirmadas em diálogo, e não páginas próprias. O path de
avaliação continuará carregando `produtoId` e `avaliacaoId`, preservando a
hierarquia e o contrato da API.

`WEB-003A` não alterou essas URLs. As quatro rotas de criação e edição continuam
canônicas e renderizam páginas completas em acesso direto ou refresh; links
internos as interceptam e apresentam em um slot modal durante navegação suave.

## Decisões transversais já tomadas

- manter a página inicial existente e acrescentar uma entrada clara para
  `/produtos`;
- usar Server Components por padrão e limitar Client Components à
  interatividade que realmente precise de hooks, estado ou APIs do navegador;
- usar `fetch` nativo nos dois clientes HTTP centrais, um para navegador e
  outro para servidor;
- usar TanStack Query 5 para cache remoto, estados de leitura, mutações e
  invalidação no grafo cliente;
- usar React Hook Form e o resolver Zod para os formulários;
- usar os schemas de `@repo/contracts` para validar responses da API no
  boundary;
- criar schemas e mappers locais para controles HTML quando a representação do
  formulário for diferente do JSON da API;
- usar Tailwind CSS 4 e componentes shadcn/ui copiados para
  `apps/web/components/ui`, revisando o código gerado antes do commit;
- manter filtros e paginação compartilháveis na URL;
- usar tabela apenas quando ela melhorar a leitura em telas largas e cards ou
  outra composição linear em telas estreitas;
- não repetir automaticamente mutações; retry de leitura deve ser finito e
  condicionado à categoria do erro;
- nunca exibir detalhes internos, stack traces ou conteúdo bruto de responses
  inválidas ao usuário;
- não considerar as rotas públicas do exemplo como precedente para um domínio
  real autenticado.

As justificativas e regras dos clientes estão em
[Integração web–API](../../integrations/web-api/README.md).

### WEB-001 — Entregar o baseline da Web e a lista de produtos

**Status:** concluído em 5 de outubro de 2026

**Contexto**

A aplicação precisa de uma primeira fatia vertical pequena, navegável e útil.
Ela deve provar o design system, o cliente HTTP, a validação de response e os
estados remotos antes de introduzir formulários e mutações.

**Escopo**

- inicializar Tailwind CSS 4 e shadcn/ui sem substituir o conteúdo ou a
  identidade da página inicial por um template de demonstração;
- definir os tokens visuais iniciais e adicionar apenas os componentes usados
  nesta entrega;
- instalar e configurar TanStack Query 5;
- escolher e configurar o mínimo de testes unitários e de componentes
  necessário para verificar esta entrega, confirmando antes a compatibilidade
  com Next.js 16 e React 19;
- criar `ApiError` e clientes `browserApiClient` e `serverApiClient` com
  tratamento central de JSON, erro público, cancelamento e response sem corpo;
- criar a operação de listagem de produtos e validar sua resposta com
  `ListProdutosResponseSchema`;
- criar a convenção de query keys e o hook de listagem de produtos;
- implementar `/produtos` com pesquisa, status, destaque, limite e página na
  URL;
- apresentar estados de carregamento, vazio, erro e sucesso;
- oferecer tabela em telas largas e composição adequada a telas estreitas, sem
  depender de rolagem horizontal como experiência principal;
- ligar a página inicial à lista de produtos;
- declarar metadata coerente com o template da aplicação;
- documentar a estrutura realmente criada e as decisões encontradas durante a
  implementação.

**Fora do escopo**

- detalhes e qualquer mutação de produto;
- telas ou operações de avaliação;
- autenticação, autorização e CSRF;
- identidade visual definitiva;
- cache persistente ou offline;
- abstração genérica de tabelas, formulários ou repositórios de frontend.

**Consumidores afetados**

- `apps/web`, que passa a consumir a API e os contratos compartilhados;
- `@repo/contracts`, somente como dependência consumida, sem alteração prevista;
- `apps/api`, sem alteração de contrato prevista.

**Critérios de aceite**

- [x] a página inicial continua funcionando e possui acesso perceptível a
      `/produtos`;
- [x] Tailwind CSS 4 e shadcn/ui estão configurados e o código gerado foi
      revisado;
- [x] nenhum componente shadcn/ui não utilizado foi adicionado;
- [x] os clientes de navegador e servidor possuem imports compatíveis com seus
      runtimes e não vazam variável privada para o bundle cliente;
- [x] a operação valida a response com `ListProdutosResponseSchema` antes de
      devolver dados à interface;
- [x] erros HTTP conhecidos preservam status, código, mensagem, campo e
      `requisicaoId` quando disponíveis;
- [x] responses inválidas ou indisponibilidade resultam em mensagem segura e
      opção de tentar novamente;
- [x] filtros válidos são serializados na URL e filtros inválidos não são
      encaminhados silenciosamente à API;
- [x] a navegação de página preserva os filtros ativos;
- [x] loading, vazio, erro e sucesso foram exercitados;
- [x] a interface funciona com teclado, foco visível, zoom de 200% e larguras
      estreitas sem perder ações;
- [x] a página não envia o catálogo inteiro ao navegador nem cria trabalho sem
      limite controlado por input;
- [x] `pnpm --filter @repo/web lint`, `typecheck`, `test` e `build` passam;
- [x] `pnpm format:check` passa;
- [x] documentação atualizada para refletir o código entregue.

**Ordem interna recomendada**

1. configurar Tailwind CSS 4 e inicializar shadcn/ui;
2. conferir o diff gerado e adaptar os tokens sem reescrever a home;
3. instalar as dependências de integração e dos testes desta entrega;
4. criar erros, tipos e os dois clientes HTTP centrais;
5. criar a operação e seus testes;
6. criar o provider e o hook de listagem com query keys estáveis;
7. implementar a página e seus estados, começando pela menor largura;
8. ligar a home, revisar acessibilidade e executar as verificações.

### WEB-002 — Entregar detalhes e CRUD de Produto

**Status:** concluído em 6 de outubro de 2026

**Contexto**

Depois que leitura, contratos e estados remotos estiverem provados, a Web deve
permitir administrar o ciclo de vida completo de um produto.

**Escopo**

- implementar detalhe, criação e edição nas rotas planejadas;
- instalar e configurar React Hook Form e `@hookform/resolvers` quando o
  primeiro formulário passar a consumi-los;
- criar uma operação e um hook por endpoint de Produto;
- implementar schemas de formulário e mappers explícitos entre controles HTML,
  `z.input`, `z.output` e payload da API;
- preservar a diferença entre campo ausente, `undefined`, `null` e string
  vazia;
- exibir erros por campo e erro global sem depender do texto para lógica;
- confirmar exclusão em `AlertDialog`, tratar `204 No Content` e devolver o
  usuário a uma tela válida;
- invalidar ou atualizar somente as queries afetadas após cada mutação;
- oferecer feedback de processamento e impedir submissões duplicadas;
- tratar produto inexistente e falhas de carregamento sem mascarar um como o
  outro.

**Fora do escopo**

- CRUD de avaliações;
- upload de ficha técnica;
- edição otimista antes de a semântica de conflito estar definida;
- autenticação e autorização.

**Critérios de aceite**

- [x] detalhes, criação, edição e exclusão funcionam contra a API real;
- [x] campos usam labels, descrição e mensagens associadas semanticamente;
- [x] valores numéricos, booleanos, datas e anuláveis são mapeados
      explicitamente;
- [x] create e update não compartilham um schema de formulário por suposição;
- [x] ações destrutivas exigem confirmação e mantêm contexto suficiente para o
      usuário decidir;
- [x] erros `400`, `404`, `409` e `5xx` possuem experiências distintas quando
      o contrato permitir;
- [x] mutações não são repetidas automaticamente;
- [x] cache é invalidado no menor escopo correto;
- [x] fluxos são responsivos, acessíveis e verificáveis por testes;
- [x] verificações do app Web e documentação passam.

**Ordem interna recomendada**

1. criar `getProduto` e validar `ProdutoDetalhadoResponseSchema`;
2. acrescentar query key de detalhe e `useProduto` incluindo `produtoId`;
3. tornar os itens da listagem navegáveis para `/produtos/[produtoId]`;
4. implementar a página de detalhe somente leitura, seus estados remotos,
   metadata segura e testes;
5. instalar React Hook Form e `@hookform/resolvers` somente ao iniciar o
   primeiro formulário;
6. criar schemas e mappers locais separados para criação e edição;
7. implementar operações, mutations e telas de criação e edição;
8. implementar exclusão com confirmação em `AlertDialog`, tratamento de
   `204 No Content`, invalidação mínima e navegação segura;
9. revisar responsividade, acessibilidade, integração real e verificações.

**Estado entregue**

- o detalhe formata moeda, peso, datas de calendário e data/hora localmente;
- criação e edição reutilizam os controles, mas mantêm schemas e mappers
  compatíveis com a semântica própria de cada operação;
- preço e peso possuem máscara decimal preenchida da direita para a esquerda;
- o update envia somente campos alterados e usa `null` para limpar anuláveis;
- operações e hooks separados cobrem `GET`, `POST`, `PATCH` e `DELETE`;
- a exclusão usa `AlertDialog`, informa a cascata de avaliações, remove o
  detalhe do cache, invalida listas e exibe em toast a confirmação definida pela
  Web;
- criação e atualização exibem em toast a mensagem do envelope de sucesso
  validado; a exclusão mantém texto local porque `204` não possui corpo;
- em 6 de outubro de 2026, lint, typecheck, 25 arquivos com 120 testes e build
  de produção foram aprovados.

### WEB-003 — Entregar o CRUD aninhado de avaliações

**Status:** concluído em 10 de outubro de 2026

**Contexto**

A experiência de Produto deve expor suas avaliações sem transformar a response
básica do produto numa coleção ilimitada. A coleção permanece paginada e
subordinada ao produto selecionado.

**Escopo**

- mostrar no detalhe do produto um resumo e acesso à coleção de avaliações;
- implementar lista paginada com pesquisa por autor e filtro `recomenda` na
  URL;
- implementar detalhe individual, criação, edição e exclusão;
- criar operações, hooks, query keys e invalidações que incluam `produtoId`;
- validar params e responses com os contratos compartilhados;
- criar formulários locais que respeitem nota de 1 a 5, comentário anulável e
  recomendação;
- preservar o contexto do produto nas navegações e mensagens;
- tratar avaliação que não pertence ao produto como recurso não encontrado.

**Fora do escopo**

- avaliações fora do contexto de um produto;
- agregados ou estatísticas não fornecidos pela API;
- carregamento ilimitado de avaliações no detalhe do produto;
- autenticação, moderação ou identidade real do autor.

**Critérios de aceite**

- [x] todas as operações usam `produtoId` e, quando aplicável,
      `avaliacaoId`;
- [x] filtros e paginação sobrevivem a reload e navegação compartilhável;
- [x] criação, edição e exclusão atualizam apenas caches relacionados ao
      produto correto;
- [x] comentário ausente, vazio e `null` seguem a semântica do contrato em
      create e update;
- [x] os estados remotos e de formulário são acessíveis e responsivos;
- [x] exclusão exige confirmação e trata corretamente `204 No Content`;
- [x] fluxos críticos possuem testes;
- [x] verificações do app Web e documentação passam.

**Conclusão verificada em 10 de outubro de 2026**

- o detalhe de Produto possui acesso explícito à coleção aninhada;
- a listagem valida `produtoId`, query e response, mantém pesquisa por autor,
  recomendação, limite e página na URL e cobre loading, vazio, página vazia,
  erro, `404` e sucesso;
- as query keys carregam `produtoId` em raiz, listas e detalhes;
- a consulta individual valida `produtoId` e `avaliacaoId` e diferencia produto
  ausente de avaliação ausente;
- a criação valida params, body e response, atualiza o cache do detalhe criado,
  invalida somente as listas do produto e exibe toast com a mensagem da API;
- o formulário local converte a nota visual para número, omite comentário vazio
  e usa `RadioGroup` com cinco estrelas para seleção acessível;
- a edição valida os dois params, body parcial e response, substitui o detalhe
  conhecido e invalida somente as listas do produto correspondente;
- a rota de edição cobre loading, atualização em segundo plano, `404`, erro
  recuperável e formulário preenchido; o detalhe já expõe a ação de editar;
- o mapper de update envia somente `dirtyFields`, usa `null` ao apagar o
  comentário, omite o comentário intacto e preserva recomendação `false`;
- o toast usa a mensagem validada da API e a navegação retorna ao detalhe
  atualizado;
- a exclusão valida `produtoId` e `avaliacaoId`, não espera body no
  `204 No Content` e invalida somente as listas do produto correspondente;
- o detalhe confirma a ação em `AlertDialog`, mantém o erro público visível,
  remove do cache apenas a avaliação excluída, exibe toast local e retorna à
  coleção do produto com `router.replace`;
- operações, hooks, parsers, schemas, formulários e componentes possuem testes;
- a suíte passa com 47 arquivos e 214 testes; lint, typecheck, build e
  `format:check` também passam.

### WEB-003A — Converter criação e edição em modais roteáveis

**Status:** concluído em 12 de outubro de 2026

**Contexto**

Criação e edição de Produto e Avaliação já possuem rotas completas, validação,
formulários e estados remotos. A experiência interna deve passar a abrir esses
fluxos sobre a tela de origem sem perder URL compartilhável, histórico do
navegador ou fallback de página completa. Essa mudança precisa ocorrer antes de
`WEB-004` para que os testes E2E sejam escritos contra a navegação definitiva.

**Decisão arquitetural**

- combinar Parallel Routes e Intercepting Routes do App Router;
- manter `/produtos/novo`, `/produtos/[produtoId]/editar`,
  `/produtos/[produtoId]/avaliacoes/nova` e
  `/produtos/[produtoId]/avaliacoes/[avaliacaoId]/editar` como rotas canônicas;
- em navegação suave iniciada pelos links da aplicação, renderizar o conteúdo
  interceptado em um slot modal;
- em acesso direto, abertura em nova aba ou refresh, renderizar a página
  completa correspondente;
- usar `Dialog` para formulários e manter `AlertDialog` reservado às
  confirmações destrutivas;
- não importar `page.tsx` como componente reutilizável: página, conteúdo do
  fluxo e invólucro modal permanecem responsabilidades separadas;
- extrair ou promover o conteúdo compartilhado somente onde página completa e
  rota interceptada realmente o reutilizem;
- não alterar endpoints, contratos HTTP, query keys ou semântica de cache.

**Escopo**

- adicionar a primitive `Dialog` quando existir o primeiro consumidor;
- criar o slot paralelo modal, seu `default.tsx` nulo e as rotas interceptadas
  necessárias aos quatro fluxos;
- adaptar os formulários para que submissão e validação não conheçam a forma de
  apresentação, enquanto página e modal controlam cancelamento e navegação;
- manter metadata, validação de params e `notFound()` nas rotas canônicas;
- implementar fechamento por Cancelar, Escape e botão de fechar;
- impedir fechamento pelos controles do modal enquanto a submissão estiver em
  andamento e impedir submissões duplicadas;
- solicitar confirmação antes de descartar alterações realmente modificadas;
- restaurar o foco ao gatilho que abriu o modal quando ele for fechado;
- integrar abrir, fechar, voltar e avançar ao histórico do navegador;
- adaptar formulários extensos a viewport estreita, teclado virtual, zoom e
  áreas seguras, com conteúdo rolável e ações alcançáveis;
- preservar sucesso, erro de API, loading, atualização em segundo plano e
  `404` dos formulários de edição nos dois modos de apresentação;
- adicionar testes de componentes e navegação proporcionais à mudança.

**Fora do escopo**

- transformar exclusões em páginas ou substituir seus `AlertDialog`;
- alterar API, contratos compartilhados ou regras de produto;
- remover as páginas completas existentes;
- escolher ou implementar toda a ferramenta E2E de `WEB-004`;
- criar uma abstração genérica de modal sem consumidores além desses fluxos.

**Critérios de aceite**

- [x] links internos de criar e editar Produto e Avaliação abrem um `Dialog`
      sem substituir visualmente a tela de origem;
- [x] Cancelar, Escape e o botão de fechar encerram o modal quando permitido;
- [x] durante a submissão, controles de fechamento ficam indisponíveis, Escape
      não fecha o modal e uma segunda submissão não é disparada;
- [x] ao tentar fechar um formulário alterado, o usuário escolhe entre continuar
      editando e descartar as mudanças; formulário intacto fecha sem aviso;
- [x] ao fechar, o foco retorna ao gatilho que abriu o modal sempre que ele
      ainda existir;
- [x] Voltar fecha o modal, Avançar o reabre e a URL acompanha o estado sem
      criar entradas artificiais;
- [x] acesso direto, nova aba e refresh das quatro URLs renderizam suas páginas
      completas com metadata e validação preservadas;
- [x] viewport estreita não perde campos ou ações, não cria scroll horizontal
      da página e mantém conteúdo e rodapé do modal utilizáveis;
- [x] sucesso conserva toast, cache e destino já definidos; erro da API mantém
      valores e mensagens; loading, erro recuperável e `404` de edição aparecem
      corretamente também no modal;
- [x] fechamento por clique externo segue a mesma proteção contra pending e
      alterações não salvas, sem descarte silencioso;
- [x] páginas completas continuam funcionando sem duplicar formulários, schemas
      ou regras de integração;
- [x] testes, lint, typecheck, build, formatação e documentação passam.

**Conclusão verificada em 12 de outubro de 2026**

- `app/produtos/layout.tsx` hospeda o slot `@modal` dentro do mesmo provider da
  rota canônica;
- quatro Intercepting Routes cobrem criação e edição de Produto e Avaliação;
- `default.tsx`, `[...catchAll]/page.tsx` e `page.tsx` fornecem os fallbacks
  nulos do slot; o fallback do índice estabiliza a primeira navegação a partir
  de `/produtos`;
- `RouteFormDialog` centraliza fechamento, pending, confirmação de descarte,
  conteúdo rolável e integração com o histórico;
- formulários e carregadores são reutilizados por páginas e modais por meio de
  callbacks opcionais, sem duplicar operações, contratos ou regras de cache;
- a revisão manual confirmou os fluxos de teclado, foco, histórico, hard e soft
  navigation, viewport estreita, sucesso, erro e `404`;
- a suíte passa com 48 arquivos e 230 testes; lint, typecheck, build e
  `format:check` também passam.

**Ordem interna recomendada**

1. instalar e revisar a primitive `Dialog` do shadcn/ui;
2. separar conteúdo reutilizável, shell de página e orquestração de navegação;
3. tornar cancelamento e sucesso configuráveis sem duplicar os formulários;
4. criar o slot paralelo, `default.tsx` e o invólucro modal controlado pela
   rota;
5. interceptar primeiro criação e edição de Avaliação, por serem os formulários
   menores;
6. interceptar criação e edição de Produto com conteúdo rolável e ações
   persistentes;
7. implementar proteção de pending, confirmação de descarte e restauração de
   foco;
8. verificar acesso direto, refresh, nova aba, Voltar, Avançar, erros e `404`;
9. revisar viewport estreita, teclado, foco e executar as verificações.

### WEB-004 — Cobrir a interface e os fluxos críticos com testes

**Status:** concluído em 12 de outubro de 2026

**Contexto**

A primeira entrega deve criar a cobertura mínima da infraestrutura e da lista.
Antes de considerar os CRUDs estáveis, essa base precisa ser ampliada para uma
estratégia completa de componentes e E2E coerente com React 19, Next.js 16 e as
versões instaladas.

**Escopo**

- revisar as escolhas de runner, biblioteca de componentes e mock de rede feitas
  nas entregas anteriores e registrar a ferramenta E2E com links oficiais;
- testar clientes, parsing de contrato, serialização de query e normalização de
  erros sem depender do DOM;
- testar componentes interativos e formulários pelo comportamento observável;
- cobrir ao menos listagem, criação, edição, exclusão e recuperação de erro nos
  fluxos E2E;
- incluir verificações automatizadas de acessibilidade onde forem confiáveis e
  preservar revisão manual de teclado, foco, zoom e leitores de tela.

**Critérios de aceite**

- [x] ferramentas escolhidas são compatíveis com as versões instaladas;
- [x] testes não repetem a implementação do contrato como mocks frágeis;
- [x] requests inesperados falham nos testes de integração;
- [x] mutações destrutivas e falhas da API possuem cobertura;
- [x] testes rodam de forma determinística localmente e no CI;
- [x] limitações da automação de acessibilidade estão documentadas.

**Conclusão verificada em 12 de outubro de 2026**

- Playwright Test foi adotado como runner E2E e configurado inicialmente para
  Chromium;
- a suíte executa contra o build de produção do Next.js e pode usar uma URL
  externa por `PLAYWRIGHT_BASE_URL`;
- o `webServer` usa `PLAYWRIGHT_TEST` para gerar um build compatível com
  `next start`, sem alterar o output standalone dos builds normais;
- fixtures de Produto, Avaliação e erro são validadas pelos schemas de
  `@repo/contracts`;
- `ApiMock` intercepta `/api/backend`, valida método, path, query e body e falha
  ao receber requests inesperadas ou deixar requests esperadas pendentes;
- 17 cenários cobrem home, metadata, listagem, filtros, retry manual, criação,
  edição, exclusão, falha destrutiva, modais, histórico, refresh, foco, pending,
  viewport estreita, `404`, preservação de formulário e CRUD de avaliações;
- `@axe-core/playwright` verifica violações automatizáveis WCAG A e AA na home;
- o CI instala somente Chromium, usa um worker, possui timeout global finito e
  executa a suíte E2E depois das verificações e do build;
- a suíte foi aprovada localmente e no GitHub Actions;
- os E2E atuais interceptam a API e não substituem testes futuros que inicializem
  Web e API reais em conjunto;
- apenas Chromium pertence ao baseline atual; Firefox, WebKit, leitores de tela,
  zoom e revisão completa de teclado continuam como ampliações ou verificações
  manuais.

### WEB-005 — Preparar segurança, observabilidade e performance de produção

**Status:** planejado

**Contexto**

As rotas são públicas apenas por decisão do exemplo didático. Antes de
reutilizar o fluxo em um produto real, autenticação, autorização e proteção de
operações de escrita precisam ser decididas de ponta a ponta. Performance deve
ser medida com cenários equivalentes, e não presumida a partir da arquitetura.

**Escopo**

- definir autenticação, autorização por recurso, emissão de cookie `HttpOnly`,
  política de `credentials` e proteção CSRF;
- definir timeout, retry de leitura, cache e revalidação a partir das
  características reais do ambiente;
- propagar ou registrar `X-Request-Id` sem expor dados sensíveis;
- medir Core Web Vitals, duração das operações, falhas, volume e saturação;
- revisar CSP, headers, dependências, variáveis públicas e conteúdo de erros;
- registrar metas e alertas contextuais depois de obter baseline.

**Critérios de aceite**

- [ ] UI não é usada como mecanismo de autorização;
- [ ] operações protegidas são rejeitadas pela API quando não autorizadas;
- [ ] cookies e CSRF possuem fluxo testado para o modelo escolhido;
- [ ] timeout, retry, cache e invalidação estão documentados por categoria;
- [ ] logs e métricas não usam credenciais, dados pessoais, IDs ou URLs brutas
      como labels;
- [ ] regressões são comparadas em cenários equivalentes por percentis;
- [ ] a revisão de produção do Next.js e da aplicação foi concluída.

## Regras de manutenção

- O status deve refletir o código, não apenas a intenção.
- Um critério só é marcado depois da verificação correspondente.
- Dependências novas devem ser confirmadas na documentação oficial da versão
  instalada antes da adoção.
- Decisões que alterem contratos externos também devem ser registradas na área
  de contratos e na integração Web–API.
- Uma entrega pode ser dividida em commits menores, mas não deve ser marcada
  como concluída enquanto restarem critérios obrigatórios.
- Se a implementação revelar uma semântica não definida, pare e peça a decisão
  antes de codificá-la.
