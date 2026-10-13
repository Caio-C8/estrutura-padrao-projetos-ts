# Handoff da aplicação Web

Atualizado em 13 de outubro de 2026 após a conclusão e verificação de
`WEB-005`, que endureceu e instrumentou o exemplo público sem introduzir
identidade no domínio didático.

Este documento é o retrato operacional para continuar o trabalho. Planejamento
e critérios permanentes ficam no [roadmap](./roadmap.md).

## Estado das entregas

- `WEB-001 — Entregar o baseline da Web e a lista de produtos`: concluída;
- `WEB-002 — Entregar detalhes e CRUD de Produto`: concluída;
- `WEB-003 — Entregar o CRUD aninhado de avaliações`: concluída;
- `WEB-003A — Converter criação e edição em modais roteáveis`: concluída;
- `WEB-004 — Cobrir a interface e os fluxos críticos com testes`: concluída;
- `WEB-005 — Endurecer e medir o exemplo público`: concluída.

A navegação implementada é:

```text
home
  ↓
/produtos ───────────────────────────────── listar, filtrar e paginar
  ├── /novo ─────────────────────────────── criar produto
  └── /[produtoId] ──────────────────────── consultar e excluir produto
        ├── /editar ─────────────────────── atualizar produto
        └── /avaliacoes ─────────────────── listar e filtrar avaliações
              ├── /nova ─────────────────── criar avaliação
              └── /[avaliacaoId] ────────── consultar e excluir avaliação
                    └── /editar ──────────── atualizar avaliação
```

Todas as operações cliente seguem:

```text
componente cliente
       ↓
hook TanStack Query por operação
       ↓
operação HTTP tipada e validada
       ↓
browserApiClient → /api/backend → API NestJS
```

## Baseline preservado

- Next.js 16, React 19, App Router e Tailwind CSS 4;
- shadcn/ui no estilo `radix-nova`, tokens `neutral`, pacote `radix-ui` e
  ícones Lucide;
- páginas e layouts permanecem Server Components; hooks, formulários, diálogo,
  toast e eventos ficam nas menores fronteiras cliente;
- TanStack Query permanece restrito ao layout `/produtos`;
- `createApiClient` usa `fetch`, timeout padrão de 30 segundos, cancelamento,
  validação de response e normalização de `ApiError`;
- leituras repetem no máximo uma vez somente em falha transitória; mutations
  não possuem retry automático;
- o `Toaster` do Sonner existe uma vez no layout raiz;
- não há autenticação no exemplo didático; isso não é baseline de produção.

## CRUD de Produto concluído

- lista responsiva com pesquisa por SKU, nome e descrição, filtros e paginação
  na URL;
- detalhe com datas locais, preço e peso formatados;
- criação e edição com React Hook Form, schemas locais, erros por campo,
  máscaras e toast com a mensagem validada da API;
- update envia somente campos alterados e usa `null` para limpar anuláveis;
- exclusão usa `AlertDialog`, trata `204 No Content`, remove o detalhe, invalida
  listas e exibe mensagem local em toast.

## Avaliações implementadas em `WEB-003`

### Integração e cache

- `avaliacaoProdutoQueryKeys` separa raiz, listas, lista por filtros, detalhes e
  detalhe individual; todas as chaves incluem `produtoId`;
- `validarProdutoAvaliacoesParams` valida a coleção por `produtoId`;
- `validarAvaliacaoProdutoParams` valida o item por `produtoId` e
  `avaliacaoId`;
- `getAvaliacoesProduto` + `useAvaliacoesProduto` implementam a coleção;
- `getAvaliacaoProduto` + `useAvaliacaoProduto` implementam o detalhe;
- `createAvaliacaoProduto` + `useCreateAvaliacaoProduto` implementam criação;
- `updateAvaliacaoProduto` + `useUpdateAvaliacaoProduto` implementam edição;
- `deleteAvaliacaoProduto` + `useDeleteAvaliacaoProduto` implementam exclusão
  e tratam o sucesso sem body;
- a criação escreve a response na chave do detalhe criado e invalida somente
  as listas do produto correspondente;
- a atualização substitui o detalhe conhecido e invalida somente as listas do
  mesmo `produtoId`; listas de outros produtos não são invalidadas;
- a exclusão invalida somente as listas do mesmo `produtoId`; o diálogo remove
  a chave exata do detalhe excluído sem afetar outras avaliações;
- params, query, body e responses são validados com contratos compartilhados no
  boundary; delete não configura response schema porque retorna
  `204 No Content`.

### Listagem

- `/produtos/[produtoId]/avaliacoes` valida o UUID antes de renderizar;
- pesquisa por autor, filtro de recomendação, limite e página permanecem na
  URL;
- filtros inválidos aparecem junto ao controle e não chegam à API;
- estados de loading, vazio, página vazia, erro recuperável, produto ausente e
  sucesso estão implementados;
- cada item mostra autor, data local, nota e acesso ao detalhe;
- o cabeçalho oferece acesso a “Nova avaliação”.

### Detalhe

- `/produtos/[produtoId]/avaliacoes/[avaliacaoId]` valida os dois UUIDs;
- a tela mostra autor, nota, recomendação, comentário e datas locais;
- `PRODUTO_NAO_ENCONTRADO` retorna ao catálogo;
- `AVALIACAO_PRODUTO_NAO_ENCONTRADA` retorna à coleção do produto;
- falha recuperável preserva mensagem, `requisicaoId` e retry manual;
- as ações de editar e excluir estão disponíveis no cabeçalho;
- a exclusão usa `AlertDialog`, impede fechamento durante a mutation, mantém
  erros recuperáveis no diálogo, exibe toast local e volta à coleção com
  `router.replace`.

### Criação e seletor de nota

- `/produtos/[produtoId]/avaliacoes/nova` valida o produto e mantém seu contexto
  no cancelamento e no sucesso;
- `AvaliacaoProdutoFormFields` contém os controles reutilizados por create e
  update;
- o schema visual valida autor, nota, comentário e recomendação antes de
  transformar e aplicar `CreateAvaliacaoProdutoSchema`;
- a nota visual é string de `"1"` a `"5"` e vira número no payload;
- comentário vazio é omitido; comentário presente é normalizado;
- `RadioGroup` sustenta cinco estrelas com seleção exclusiva, teclado, nomes
  acessíveis, foco visível e anúncio textual do valor;
- cada radio transparente é absoluto e cobre sua estrela, mantendo semântica e
  removendo espaço visual extra;
- sucesso usa `toast.success(response.mensagem)` e navega para o detalhe criado;
- falhas por campo ficam junto ao controle; falhas sem campo conhecido ficam no
  alerta geral.

### Edição

- `/produtos/[produtoId]/avaliacoes/[avaliacaoId]/editar` valida os dois UUIDs
  antes de renderizar e carrega a avaliação pelo hook de detalhe existente;
- loading inicial, atualização em segundo plano, produto ausente, avaliação
  ausente e erro recuperável possuem estados próprios;
- o formulário inicia preenchido, bloqueia envio sem alterações e desabilita o
  `fieldset` durante a mutation;
- schema local converte a nota visual para número e comentário vazio para
  `null`; o mapper usa `dirtyFields` para enviar somente campos alterados;
- comentário intacto permanece ausente do `PATCH`, enquanto recomendação
  alterada para `false` é preservada;
- sucesso usa `toast.success(response.mensagem)` e volta ao detalhe atualizado;
- erros públicos por campo ficam junto ao respectivo controle e recebem foco;
  falhas sem campo conhecido permanecem no alerta geral.

## Modais roteáveis implementados em `WEB-003A`

- links internos para criar e editar Produto ou Avaliação abrem um `Dialog`
  sobre a tela de origem por Parallel Routes e Intercepting Routes;
- as quatro URLs continuam canônicas e renderizam página completa em acesso
  direto, nova aba ou refresh;
- `app/produtos/layout.tsx` renderiza `children` e o slot `@modal` dentro do
  mesmo `ProdutosQueryProvider`;
- o slot possui `default.tsx`, `[...catchAll]/page.tsx` e `page.tsx` nulos; o
  último cobre o índice `/produtos`, que não corresponde ao catch-all;
- `RouteFormDialog` compõe a primitive `Dialog`, usa `router.back()` para
  fechar e centraliza Cancelar, Escape, botão de fechar e clique externo;
- pending bloqueia fechamento e submissão duplicada; alterações não salvas
  exigem confirmação em `AlertDialog` antes do descarte;
- o foco retorna ao gatilho quando ele ainda existe, e Voltar e Avançar
  acompanham URL e estado visual;
- os formulários recebem callbacks opcionais de cancelamento, sucesso e estado,
  preservando a mesma validação, integração e cache nos dois modos;
- criação e edição de Produto usam a largura ampla; os formulários de Avaliação
  usam a largura normal; ambos limitam altura por `svh` e mantêm conteúdo
  rolável em viewport estreita;
- loading, atualização em segundo plano, erro recuperável, `404`, toast e
  destinos de sucesso das páginas completas foram preservados nos modais.

## Testes E2E implementados em `WEB-004`

- Playwright Test executa 20 cenários no Chromium;
- o servidor de teste usa o build de produção do Next.js;
- `PLAYWRIGHT_BASE_URL` permite apontar a suíte para um ambiente externo;
- fixtures de sucesso e erro são validadas por `@repo/contracts`;
- o mock de rede exige contagens exatas e rejeita requests não configuradas;
- listagem, filtros, retry, criação, edição, exclusão e falhas da API possuem
  cobertura;
- os modais cobrem soft navigation, refresh, Voltar, Avançar, restauração de
  foco, descarte de alterações, pending e viewport estreita;
- o CRUD de avaliações é exercitado da listagem até a exclusão;
- axe verifica na home problemas automatizáveis de acessibilidade WCAG A e AA;
- o CI instala somente Chromium, usa um worker e executa a suíte completa;
- os testes interceptam a API; uma verificação futura com Web e API reais ainda
  é necessária para provar o boundary completo entre os processos;
- Chromium é o navegador automatizado atual; outros motores e testes manuais de
  acessibilidade permanecem fora desse baseline.

## Endurecimento e medição implementados em `WEB-005`

- o catálogo informa que Produto e Avaliação formam um CRUD público de
  demonstração e que somente dados fictícios devem ser usados;
- a API usa allowlist de `CORS_ORIGINS`, não permite credenciais, limita métodos
  e headers e expõe `X-Request-Id` ao navegador;
- o Next.js remove `X-Powered-By` e aplica CSP, `Permissions-Policy`,
  `Referrer-Policy`, `X-Content-Type-Options` e proteção contra framing;
- a CSP de produção não contém `'unsafe-eval'`; `instrumentation-client.ts`
  configura o Zod com `jitless: true`, conforme a opção oficial para ambientes
  com CSP sem avaliação dinâmica;
- `NEXT_PUBLIC_APP_ENV` aceita somente ambientes conhecidos e possui fallback
  explícito; nenhuma variável pública é tratada como local para segredo;
- `WebVitalsReporter` registra FID, FCP, LCP, TTFB, INP e CLS com nome de rota
  normalizado;
- as operações da API registram nome conhecido, origem, método, resultado,
  duração, concorrência, status e categoria de erro quando aplicáveis;
- observação e métricas não incluem IDs, URL bruta, payload, credencial nem
  `X-Request-Id` como dimensão;
- o console recebe os eventos somente fora de produção; um projeto derivado
  deve escolher seu provedor, retenção, alertas e metas conforme o contexto;
- falha do observador não altera o resultado da operação de negócio;
- o E2E verifica os headers em `/` e `/api/health`, ausência de
  `'unsafe-eval'` na CSP de produção e ausência de violações CSP em
  `/produtos`.

## Verificações atuais

Em 13 de outubro de 2026:

- `pnpm --filter @repo/web test`: aprovado, 52 arquivos e 257 testes;
- `pnpm --filter @repo/web test:e2e`: aprovado, 20 testes no Chromium;
- `pnpm --filter @repo/web typecheck`: aprovado;
- `pnpm --filter @repo/web lint`: aprovado;
- `pnpm --filter @repo/web build`: aprovado;
- `pnpm format:check`: aprovado;
- workflow `validate` do GitHub Actions: aprovado, incluindo instalação do
  Chromium e execução dos E2E;
- health checks reais aprovados na API (`:3001/api/health`), na Web
  (`:3000/api/health`) e no proxy Web–API (`:3000/api/backend/health`);
- revisão manual aprovada para as rotas e ações, CSP e execução standalone com
  os diretórios `public` e `.next/static` copiados para o artefato.

Os health checks integrados retornaram:

| Endpoint                   | Serviço           | Ambiente      | Versão  | Timestamp UTC              |
| -------------------------- | ----------------- | ------------- | ------- | -------------------------- |
| `:3001/api/health`         | `project-starter` | `development` | `0.1.0` | `2026-10-13T02:50:34.757Z` |
| `:3000/api/health`         | `web`             | `development` | `0.1.0` | `2026-10-13T02:50:36.789Z` |
| `:3000/api/backend/health` | `project-starter` | `development` | `0.1.0` | `2026-10-13T02:50:36.809Z` |

A revisão manual continua responsável por aspectos não completamente cobertos
pela automação, incluindo leitores de tela, zoom, teclado em todos os fluxos,
motores de navegador adicionais e a repetição automatizada da integração com a
API real.

## Continuação do roadmap

Não há outra entrega Web planejada depois de `WEB-005`. Uma nova capacidade
deve ser registrada no roadmap com contexto, escopo e critérios próprios antes
da implementação.

Login, usuários, sessão, autenticação, autorização e CSRF não foram
implementados porque o exemplo atual não possui identidade nem dados
protegidos. O baseline correspondente continua documentado e deve ser aplicado
por qualquer aplicação derivada que introduza esses requisitos; os checklists
de segurança autenticada permanecem intencionalmente abertos.

A amostra manual de performance de 13 de outubro é evidência de smoke test em
desenvolvimento. Ela não constitui baseline estatístico, meta, SLO nem teste de
capacidade. Quando houver ambiente e volume representativos, agregue Core Web
Vitals por p75 e operações por p50/p95/p99, separando versão, ambiente e rota ou
operação normalizada sem dimensões sensíveis ou de alta cardinalidade.

## Limites mantidos

- avaliação nunca existe fora do contexto de `produtoId`;
- a response básica de Produto não recebe coleção ilimitada de avaliações;
- não inventar agregados ou estatísticas sem endpoint e contrato;
- não adicionar update otimista sem semântica de conflito definida;
- os E2E atuais usam Chromium e API interceptada; outros navegadores e uma
  execução integrada com a API real continuam ampliações explícitas;
- autenticação, autorização e CSRF permanecem fora do exemplo público, mas o
  baseline documentado continua obrigatório quando uma aplicação derivada
  introduzir identidade ou dados protegidos;
- não alterar contratos compartilhados apenas para adaptar controles HTML.
