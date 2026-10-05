# Handoff da aplicação Web

Atualizado em 5 de outubro de 2026 após a conclusão de `WEB-001`.

Este documento é o retrato operacional para iniciar `WEB-002`. O planejamento
e os critérios permanentes estão no [roadmap](./roadmap.md).

## Entrega concluída

`WEB-001 — Entregar o baseline da Web e a lista de produtos` está concluída.

A fatia vertical validada é:

```text
home
  ↓
/produtos
  ↓
parser e validação dos filtros da URL
  ↓
useProdutos + TanStack Query
  ↓
getProdutos
  ↓
browserApiClient
  ↓
/api/backend/produtos
  ↓
API NestJS
```

## Estado implementado

### Baseline visual

- Tailwind CSS 4 usa `@tailwindcss/postcss`;
- shadcn/ui usa o estilo `radix-nova`, tokens `neutral`, CSS variables e
  ícones Lucide;
- a fonte Geist está ligada ao token `--font-geist-sans`;
- a home original foi preservada e adaptada aos tokens semânticos;
- as primitives presentes são `Badge`, `Button`, `Input`, `Skeleton` e
  `Table`, todas com consumidor atual;
- a home possui a ação “Ver produtos”.

### Infraestrutura HTTP

- `createApiClient` usa `fetch` nativo;
- o timeout padrão atual é 30 segundos e pode ser substituído por request;
- path e timeout inválidos são rejeitados como erro de configuração;
- query params possuem serialização estável e omitem apenas `undefined`;
- GET com body é rejeitado;
- body JSON não serializável é rejeitado antes da chamada;
- `AbortSignal.timeout` e `AbortSignal.any` distinguem timeout e cancelamento;
- respostas de sucesso exigem schema, salvo `204 No Content`;
- respostas e erros validam seus contratos, inclusive a consistência entre o
  status HTTP e o status presente no envelope;
- `ApiError` diferencia `http`, `rede`, `timeout`, `cancelada`, `validacao`,
  `resposta_invalida` e `configuracao`;
- `browserApiClient` importa `client-only` e usa `/api/backend`;
- `serverApiClient` importa `server-only` e usa
  `${API_INTERNAL_URL}/api`, com fallback local para a porta 3001.

### TanStack Query

- o provider está no layout de `/produtos`, não no layout raiz;
- servidor recebe um `QueryClient` novo por chamada;
- navegador reutiliza um singleton;
- leituras repetem no máximo uma vez somente para rede, timeout ou HTTP 5xx;
- mutations não terão retry automático;
- não há `staleTime`, persistência, prefetch ou hydration definidos sem uma
  necessidade medida.

### Lista de produtos

- `getProdutos` valida a query com `ListProdutosQuerySchema` e a response com
  `ListProdutosResponseSchema`;
- `produtoQueryKeys` inclui todos os filtros relevantes;
- `useProdutos` encaminha o sinal de cancelamento do TanStack Query;
- `/produtos` lê `searchParams` no Server Component;
- filtros de pesquisa, status, destaque e limite ficam na URL;
- valores vazios de status e destaque significam ausência do filtro;
- valores repetidos ou inválidos não são encaminhados à API;
- a interface admite somente 10, 20 ou 50 itens por página, embora o contrato
  genérico da API aceite qualquer inteiro entre 1 e 50;
- erros de filtro aparecem abaixo do controle correspondente com
  `aria-invalid` e `aria-describedby`;
- a listagem possui loading, erro com retry, vazio, sucesso e página sem itens;
- filtros ativos sobrevivem à paginação;
- telas estreitas usam cards e telas largas usam tabela;
- os dados atuais são buscados no cliente; prefetch no servidor não foi
  introduzido sem necessidade demonstrada.

## Verificações de `WEB-001`

Em 5 de outubro de 2026:

- `pnpm --filter @repo/web lint`: aprovado;
- `pnpm --filter @repo/web typecheck`: aprovado após `next typegen`;
- `pnpm --filter @repo/web test`: 8 arquivos e 49 testes aprovados;
- `pnpm --filter @repo/web build`: aprovado;
- formatação dos arquivos da Web: aprovada;
- home, rewrite e API responderam com sucesso no ambiente local;
- filtros foram exercitados contra a API real;
- viewport estreita não apresentou rolagem horizontal e usou cards;
- navegação por teclado apresentou foco visível.

O NVM pode bloquear `pnpm` no sandbox com `NVM4306`. Isso é uma restrição do
ambiente de execução do agente, não uma falha dos scripts do projeto.

## Próxima entrega

`WEB-002 — Entregar detalhes e CRUD de Produto` é a próxima entrega. Começar
pela leitura evita misturar o primeiro formulário com uma operação de detalhe
ainda não provada.

### Primeira etapa: detalhe somente leitura

1. confirmar o contrato e a rota `GET /api/produtos/:produtoId`;
2. criar `get-produto.ts`, recebendo `ApiClient` por dependência e validando
   `ProdutoDetalhadoResponseSchema`;
3. acrescentar `produtoQueryKeys.detalhes()` e
   `produtoQueryKeys.detalhe(produtoId)`;
4. criar `use-produto.ts` com execução condicionada a um UUID válido;
5. transformar nome e/ou ação de cada item da lista em link para
   `/produtos/[produtoId]`;
6. criar a rota dinâmica com detalhe responsivo, loading, erro recuperável e
   tratamento distinto para `404`;
7. definir metadata segura sem expor identificador bruto quando o produto não
   puder ser carregado;
8. testar operação, query key, hook, componentes e navegação;
9. validar o fluxo contra a API real antes de iniciar criação.

### Etapas seguintes de `WEB-002`

Depois do detalhe:

1. instalar React Hook Form e `@hookform/resolvers`;
2. implementar criação com schema e mapper locais;
3. implementar edição com defaults vindos do detalhe e mapper próprio;
4. mapear erros de campo da API para os controles sem depender do texto;
5. implementar exclusão confirmada em `AlertDialog`;
6. tratar `204 No Content`, mostrar confirmação definida pela Web, invalidar
   somente as queries afetadas e navegar para `/produtos`;
7. concluir revisão manual, testes, documentação e verificações.

## Limites mantidos

- avaliações pertencem a `WEB-003`;
- testes E2E completos pertencem a `WEB-004`;
- autenticação, autorização e CSRF permanecem fora do exemplo público e devem
  ser decididos antes de qualquer reutilização real;
- não criar componentes, abstrações ou dependências para etapas futuras sem
  consumidor atual;
- não alterar contratos compartilhados apenas para adaptar controles HTML;
- não implementar atualização otimista sem semântica de conflito definida.
