# Handoff da aplicação Web

Atualizado em 6 de outubro de 2026 após a conclusão de `WEB-002`.

Este documento é o retrato operacional para iniciar `WEB-003`. O planejamento
e os critérios permanentes estão no [roadmap](./roadmap.md).

## Entregas concluídas

- `WEB-001 — Entregar o baseline da Web e a lista de produtos`;
- `WEB-002 — Entregar detalhes e CRUD de Produto`.

A fatia vertical atual é:

```text
home
  ↓
/produtos ─────────────── listar, filtrar e paginar
  ├── /novo ───────────── criar
  └── /[produtoId] ────── consultar e excluir
        └── /editar ───── atualizar
              ↓
hooks TanStack Query por operação
              ↓
operações HTTP tipadas e validadas
              ↓
browserApiClient → /api/backend → API NestJS
```

## Estado implementado

### Baseline e renderização

- Next.js 16, React 19, App Router e Tailwind CSS 4;
- shadcn/ui no estilo `radix-nova`, tokens `neutral`, CSS variables, pacote
  unificado `radix-ui` e ícones Lucide;
- páginas e layouts permanecem Server Components;
- TanStack Query fica restrito ao layout de `/produtos`;
- Client Components existem somente para hooks, formulários, diálogo, eventos e
  APIs do navegador;
- a home original foi preservada e possui a ação “Ver produtos”.

### Infraestrutura HTTP e estado remoto

- `createApiClient` usa `fetch` nativo e timeout padrão de 30 segundos;
- path, timeout, body, JSON, contrato da response e consistência de status são
  validados;
- `204 No Content` retorna `undefined` e não recebe response schema;
- `ApiError` preserva categoria, status, código público, erros de campo e
  `requisicaoId` sem exibir `cause` interno;
- navegador usa somente `/api/backend`; o cliente server-only usa
  `${API_INTERNAL_URL}/api` com fallback local na porta 3001;
- leituras repetem no máximo uma vez apenas para rede, timeout ou HTTP 5xx;
- mutations usam `retry: false`;
- não existem `staleTime`, persistência, prefetch ou hydration sem necessidade
  medida.

### Operações e hooks de Produto

- `getProdutos` + `useProdutos`;
- `getProduto` + `useProduto`;
- `createProduto` + `useCreateProduto`;
- `updateProduto` + `useUpdateProduto`;
- `deleteProduto` + `useDeleteProduto`;
- todas as operações recebem `ApiClient` por dependência e usam os contratos de
  `@repo/contracts` no boundary;
- a validação e normalização de `produtoId` é compartilhada somente depois de
  possuir múltiplos consumidores reais;
- query keys distinguem raiz, listas, lista por filtros, detalhes e detalhe por
  `produtoId`;
- create e update atualizam o detalhe conhecido e invalidam as listas; delete
  invalida listas e a interface remove o detalhe excluído do cache.

### Listagem e detalhe

- pesquisa procura por SKU, nome e descrição conforme o contrato da API;
- status, destaque, limite e página permanecem na URL;
- a interface oferece limites de 10, 20 ou 50 itens;
- filtros inválidos aparecem junto ao controle e não são encaminhados à API;
- telas estreitas usam cards e telas largas usam tabela;
- loading, vazio, página vazia, erro recuperável e sucesso possuem estados
  próprios;
- `/produtos/[produtoId]` valida UUID, diferencia `404` de erro recuperável e
  apresenta edição e exclusão;
- preço, peso, data de calendário e data/hora possuem formatadores próprios;
- datas com horário são exibidas no fuso local do navegador, embora o contrato
  continue usando ISO 8601 UTC.

### Criação e edição

- React Hook Form, `zodResolver` e schemas Zod locais estão instalados e em uso;
- `ProdutoFormFields` compartilha os controles, não o contrato completo das
  operações;
- create e update possuem schemas próprios;
- o mapper do update envia somente campos alterados e transforma campos
  anuláveis apagados em `null`;
- preço e peso usam máscara decimal preenchida da direita para a esquerda, com
  apresentação em reais e quilogramas;
- `datetime-local` trabalha em horário local e o mapper envia ISO 8601 UTC;
- erros públicos da API são associados aos campos quando possível; o primeiro
  recebe foco e erros sem campo conhecido permanecem no feedback geral;
- o formulário usa `fieldset disabled` durante a mutation e impede submissão
  duplicada;
- criação navega para o produto criado e edição retorna ao detalhe atualizado.

### Exclusão

- `AlertDialog` confirma a ação e informa que avaliações serão removidas pela
  cascata do banco;
- cancelar e confirmar ficam indisponíveis durante a mutation;
- erro mantém o diálogo aberto, mostra mensagem pública e `requisicaoId` quando
  disponível;
- sucesso inicia `router.replace` para `/produtos`, remove o detalhe do cache e
  deixa a lista invalidada;
- o `204` não possui body; a mensagem “Produto excluído com sucesso” é definida
  pela Web;
- o marcador `resultado=produto-excluido` é removido com
  `history.replaceState`, evitando repetir a confirmação após reload.

## Verificações atuais

Em 6 de outubro de 2026:

- lint do app Web: aprovado;
- `next typegen` e `tsc --noEmit`: aprovados;
- Vitest: 26 arquivos e 121 testes aprovados;
- build de produção do Next.js: aprovado;
- rotas geradas: `/`, `/produtos`, `/produtos/novo`,
  `/produtos/[produtoId]` e `/produtos/[produtoId]/editar`;
- testes E2E em navegador continuam pendentes.

O NVM pode bloquear `pnpm` no sandbox com `NVM4306`. Nesse ambiente, as
ferramentas locais em `node_modules/.bin` foram executadas fora do isolamento;
isso não indica falha nos scripts do projeto.

## Próxima entrega

`WEB-003 — Entregar o CRUD aninhado de avaliações` é a próxima entrega.

### Primeira etapa recomendada: leitura paginada

1. confirmar os endpoints sob
   `/api/produtos/:produtoId/avaliacoes` e os contratos já exportados;
2. criar query keys de avaliações que sempre incluam `produtoId` e, nas listas,
   todos os filtros;
3. criar `getAvaliacoesProduto`, validando params, query e
   `ListAvaliacoesProdutoResponseSchema`;
4. criar `useAvaliacoesProduto` com cancelamento e a mesma política finita de
   retry das leituras;
5. acrescentar no detalhe do produto um resumo e um link para
   `/produtos/[produtoId]/avaliacoes`, sem embutir coleção ilimitada na response
   de Produto;
6. implementar a página de avaliações com paginação, pesquisa por autor e
   filtro `recomenda` na URL;
7. cobrir loading, vazio, erro, página vazia, `404` do produto e sucesso;
8. testar operação, keys, hook, parser de URL e componente antes das mutations.

### Etapas seguintes de `WEB-003`

1. consultar avaliação individual dentro do produto;
2. criar formulário de avaliação com autor, nota de 1 a 5, comentário opcional
   e recomendação;
3. editar enviando somente alterações e usando `null` para limpar comentário;
4. excluir em confirmação destrutiva e tratar `204` com mensagem da Web;
5. invalidar somente as listas e detalhes do mesmo `produtoId`;
6. preservar o contexto do produto em links, erros e navegação;
7. concluir revisão manual, documentação e verificações.

## Limites mantidos

- avaliação nunca existe fora do contexto de `produtoId`;
- o resumo do produto não recebe uma coleção ilimitada de avaliações;
- agregados e estatísticas não serão inventados sem endpoint e contrato;
- testes E2E completos pertencem a `WEB-004`;
- autenticação, autorização e CSRF permanecem fora do exemplo público e devem
  ser decididos antes de reutilização real;
- não criar componentes, cache, abstrações ou dependências para etapas futuras
  sem consumidor atual;
- não alterar contratos compartilhados apenas para adaptar controles HTML;
- não implementar atualização otimista sem semântica de conflito definida.
