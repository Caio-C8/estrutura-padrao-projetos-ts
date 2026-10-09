# Handoff da aplicação Web

Atualizado em 9 de outubro de 2026 durante `WEB-003`, depois da entrega de
listagem, detalhe, criação e edição de Avaliação de Produto.

Este documento é o retrato operacional para continuar o trabalho. Planejamento
e critérios permanentes ficam no [roadmap](./roadmap.md).

## Estado das entregas

- `WEB-001 — Entregar o baseline da Web e a lista de produtos`: concluída;
- `WEB-002 — Entregar detalhes e CRUD de Produto`: concluída;
- `WEB-003 — Entregar o CRUD aninhado de avaliações`: em andamento;
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
              └── /[avaliacaoId] ────────── consultar avaliação
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
- a criação escreve a response na chave do detalhe criado e invalida somente
  as listas do produto correspondente;
- a atualização substitui o detalhe conhecido e invalida somente as listas do
  mesmo `produtoId`; listas de outros produtos não são invalidadas;
- params, query, body e responses são validados com contratos compartilhados no
  boundary;
- somente delete de avaliação ainda não existe na Web.

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
- a ação de editar aponta para a rota pronta; a ação de excluir permanece
  ausente até que o fluxo destrutivo esteja implementado.

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

Em 9 de outubro de 2026:

- `pnpm --filter @repo/web test`: aprovado, 44 arquivos e 206 testes;
- `pnpm --filter @repo/web typecheck`: aprovado;
- `pnpm --filter @repo/web lint`: aprovado;
- build e `format:check`: ainda não repetidos após esta fatia;
- revisão manual completa de teclado, foco, zoom e viewports do CRUD final de
  avaliações: pendente até delete.

## Próxima etapa de `WEB-003`

Implementar a exclusão de avaliação:

1. criar operação e hook de delete sem response schema, pois o sucesso é
   `204 No Content`;
2. confirmar a exclusão em `AlertDialog`, mantendo o contexto do produto;
3. usar mensagem local de sucesso em toast, remover o detalhe excluído e
   invalidar somente as listas daquele produto;
4. adicionar a ação destrutiva ao detalhe somente quando o diálogo estiver
   pronto e testado;
5. cobrir operação, hook, diálogo, pending, erro recuperável, cancelamento,
   toast e navegação com testes;
6. concluir revisão manual, build, formatação e documentação de `WEB-003`.

## Limites mantidos

- avaliação nunca existe fora do contexto de `produtoId`;
- a response básica de Produto não recebe coleção ilimitada de avaliações;
- não inventar agregados ou estatísticas sem endpoint e contrato;
- não adicionar update otimista sem semântica de conflito definida;
- testes E2E completos pertencem a `WEB-004`;
- autenticação, autorização e CSRF permanecem fora do exemplo público e devem
  ser decididos antes de reutilização real;
- não alterar contratos compartilhados apenas para adaptar controles HTML.
