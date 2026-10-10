# Handoff da aplicação Web

Atualizado em 10 de outubro de 2026 após a conclusão de `WEB-003`, incluindo a
exclusão de Avaliação de Produto.

Este documento é o retrato operacional para continuar o trabalho. Planejamento
e critérios permanentes ficam no [roadmap](./roadmap.md).

## Estado das entregas

- `WEB-001 — Entregar o baseline da Web e a lista de produtos`: concluída;
- `WEB-002 — Entregar detalhes e CRUD de Produto`: concluída;
- `WEB-003 — Entregar o CRUD aninhado de avaliações`: concluída;
- `WEB-004` e `WEB-005`: planejadas.

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

## Verificações atuais

Em 10 de outubro de 2026:

- `pnpm --filter @repo/web test`: aprovado, 47 arquivos e 214 testes;
- `pnpm --filter @repo/web typecheck`: aprovado;
- `pnpm --filter @repo/web lint`: aprovado;
- `pnpm --filter @repo/web build`: aprovado;
- `pnpm format:check`: aprovado.

## Próxima etapa: `WEB-004`

Ampliar a estratégia de testes de interface e fluxos críticos:

1. confirmar a ferramenta E2E compatível com as versões instaladas;
2. cobrir os fluxos reais de listagem, criação, edição, exclusão e recuperação
   de erro, incluindo o acordo Web → rewrite → API;
3. adicionar verificações automatizadas de acessibilidade onde forem
   confiáveis;
4. documentar os limites da automação e preservar revisão manual de teclado,
   foco, zoom, leitores de tela e viewports.

## Limites mantidos

- avaliação nunca existe fora do contexto de `produtoId`;
- a response básica de Produto não recebe coleção ilimitada de avaliações;
- não inventar agregados ou estatísticas sem endpoint e contrato;
- não adicionar update otimista sem semântica de conflito definida;
- testes E2E completos pertencem a `WEB-004`;
- autenticação, autorização e CSRF permanecem fora do exemplo público e devem
  ser decididos antes de reutilização real;
- não alterar contratos compartilhados apenas para adaptar controles HTML.
