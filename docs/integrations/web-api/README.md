# Integração entre web e API

Este diretório documenta os acordos e a infraestrutura que conectam
`apps/web` e `apps/api`.

## Escopo

Aqui ficam:

- clientes HTTP padronizados;
- diferença entre execução no navegador e no servidor;
- funções que representam operações HTTP;
- hooks usados por Client Components;
- contratos de request e response;
- erros, cancelamento, cache e invalidação;
- autenticação, cookies `HttpOnly`, CSRF e observabilidade;
- testes da fronteira.

Construção visual de páginas, componentes, formulários e responsividade fica em
[Aplicação web](../../apps/web/README.md). Detalhes internos de controllers,
services e repositories ficam em [API](../../apps/api/README.md).

A separação não impede uma tarefa de implementar página e integração juntas.
Nesse caso, leia as duas áreas e valide o fluxo completo.

## Estado atual

No estado atual:

- o Next.js encaminha `/api/backend/:path*` para
  `${API_INTERNAL_URL}/api/:path*`;
- o navegador já pode usar a origem relativa `/api/backend`;
- `@repo/contracts` é compartilhado entre web e API;
- existem clientes HTTP centrais separados para navegador e servidor;
- `createApiClient` usa `fetch` nativo, timeout, cancelamento, validação de
  responses, normalização de erros e tratamento de `204 No Content`;
- listar, consultar, criar, atualizar e excluir Produto possuem operações e
  hooks próprios;
- params e bodies são validados antes da request; responses com corpo são
  validadas com os schemas compartilhados;
- create e update atualizam o detalhe conhecido e invalidam listas; delete
  invalida listas, retorna `undefined` no `204` e tem o detalhe removido pela
  interface ao navegar;
- TanStack Query 5 gerencia o estado remoto no cliente e está limitado ao
  segmento `/produtos`;
- o formato público de erros está definido por `RespostaErroSchema` e aplicado
  pelo filtro global da API;
- o mecanismo de autenticação e o fluxo CSRF continuam pendentes;
- a API gera um UUID por requisição e o devolve em `X-Request-Id`; ela ignora
  esse header quando enviado pelo cliente, e a configuração de CORS permite que
  o navegador leia o header da resposta;
- respostas de erro também incluem o mesmo valor em `requisicaoId`, conforme o
  contrato compartilhado;
- credenciais de autenticação no navegador já possuem o baseline de cookie
  `HttpOnly`, sem Web Storage.

`WEB-001` e `WEB-002` são implementações concretas concluídas para Produto. Os
exemplos genéricos dos documentos complementares continuam sendo orientação
para novos domínios. Avaliações ainda não possuem operações ou hooks na Web e
serão implementadas em `WEB-003`.

## Decisões da primeira integração

### Transporte HTTP

Os clientes centrais usam o `fetch` nativo oferecido pelos runtimes atuais do
Next.js. O projeto não possui requisito concreto de interceptors ou outra
capacidade que justifique Axios ou Ky nesta etapa. Essa escolha reduz uma
dependência, mas não elimina a necessidade de uma abstração pequena para:

- compor URL e query sem concatenação manual insegura;
- enviar e receber JSON;
- aceitar `AbortSignal`;
- tratar `204 No Content`;
- normalizar erros HTTP e responses que não seguem o contrato;
- manter separado o runtime do navegador e o runtime do servidor.

Componentes não chamarão `fetch` diretamente.

### Estado remoto no cliente

TanStack Query 5 é usado nas partes interativas para cache remoto, deduplicação
de requisições concorrentes, loading, erro, mutações e invalidação. O provider
atual fica no layout de `/produtos`, a fronteira cliente mais profunda que
atende os consumidores existentes. A adoção da biblioteca não transforma
layouts e páginas inteiras em Client Components.

Query keys serão fábricas por domínio e incluirão todos os params que alteram o
resultado. Chaves de avaliações sempre incluirão `produtoId`. Mutações não
terão retry automático. Leituras só poderão ter retry finito para falhas
transitórias; erros de contrato, validação, autorização e recurso inexistente
não serão repetidos.

Server Components continuam chamando operações assíncronas comuns. Quando uma
entrega realmente precisar pré-buscar no servidor e hidratar TanStack Query, o
fluxo será implementado de acordo com a documentação oficial e medido antes de
virar uma regra para todas as páginas.

### Contratos e erros

Cada operação conhece o schema de sua response e valida os dados externos no
boundary. `ApiError` preserva os campos públicos estáveis disponíveis em
`RespostaErroSchema`, inclusive status, código, mensagem, campo e
`requisicaoId`, sem apresentar stack, body bruto ou detalhes internos ao
usuário.

Os contratos da API não serão usados cegamente como estado dos inputs HTML.
Formulários terão schemas e mappers locais quando precisarem representar número,
booleano, data, propriedade ausente, string vazia ou `null` de forma diferente
do JSON enviado.

### Cache e segurança nesta etapa

A listagem usa paginação e filtros finitos. A interface oferece limites de 10,
20 e 50, enquanto o contrato compartilhado continua aceitando inteiros entre 1
e 50 para consumidores que precisem dessa flexibilidade.

O cliente HTTP possui timeout padrão de 30 segundos, substituível por request.
O valor é um limite operacional da infraestrutura atual, não uma meta de
latência. TanStack Query repete leituras no máximo uma vez somente para falha de
rede, timeout ou HTTP 5xx; mutations não são repetidas. `staleTime`, cache
persistente, prefetch e hydration permanecem sem configuração global até surgir
necessidade observável.

As rotas de Produto são públicas apenas no exemplo didático atual. O cliente
não enviará segredo ao navegador e usará `/api/backend` na origem relativa. Um
domínio real não poderá avançar para produção sem decidir autenticação,
autorização, cookies, `credentials` e CSRF de ponta a ponta.

## Fluxos

### Server Component

```text
page/layout Server Component
          ↓
função de operação
          ↓
serverApiClient
          ↓
API interna
```

Hooks React não são usados em Server Components.

### Client Component

```text
Client Component
       ↓
hook de uma operação
       ↓
função de operação
       ↓
browserApiClient
       ↓
/api/backend
       ↓
API
```

## Regras centrais

- Uma operação representa um método e endpoint específicos.
- Uma operação não conhece componente, toast, modal ou navegação.
- Um hook cliente representa uma operação remota, não uma URL genérica.
- Componentes não chamam `fetch` ou outra biblioteca diretamente.
- Clientes são centralizados; não crie instâncias por feature.
- Requests e responses usam contratos existentes quando disponíveis.
- Response HTTP é dado não confiável e deve ser validado quando houver schema.
- Hooks existem apenas no grafo Client.
- Server Components chamam funções assíncronas comuns.
- Não invente cache, retry, autenticação ou tratamento de erro sem decisão.
- Credenciais de autenticação do navegador usam cookie `HttpOnly`; detalhes do
  mecanismo e do fluxo CSRF continuam decisões explícitas.

## Por que não existe uma única instância universal

Navegador e servidor têm fronteiras diferentes:

| Runtime       | Base URL                  | Pode acessar segredo   | Cookies/headers          |
| ------------- | ------------------------- | ---------------------- | ------------------------ |
| navegador     | `/api/backend`            | não                    | política do browser      |
| servidor Next | `${API_INTERNAL_URL}/api` | sim, quando autorizado | encaminhamento explícito |

Uma instância que detecta `window` pode misturar código server-only no bundle e
esconder decisões de credencial. O padrão usa a mesma abstração e comportamento,
mas duas instâncias centrais: uma por runtime.

## Documentos

| Assunto                             | Documento                                                      |
| ----------------------------------- | -------------------------------------------------------------- |
| Clientes, operações e contratos     | [Clientes e operações](./clients-and-operations.md)            |
| Um hook por operação cliente        | [Hooks de API](./client-hooks.md)                              |
| Erros, cache, cancelamento e testes | [Erros, cache e testes](./errors-cache-and-testing.md)         |
| Limites e métricas da integração    | [Performance](../../performance/contracts-and-integrations.md) |
| Fontes oficiais                     | [Referências](./references.md)                                 |

## Decisões pendentes

As seguintes decisões continuam dependentes de implementação ou de contexto de
produção:

- revisão do timeout e retry com métricas do ambiente real;
- mecanismo de autenticação e transporte de identidade fora do navegador;
- responsável por emitir o cookie, `credentials`, atributos e fluxo CSRF;
- propagação de correlation ID para futuras dependências e serviços externos;
- `staleTime`, regras de cache, prefetch, hydration e revalidação;
- observabilidade sem vazamento de dados.

Um agente deve apresentar essas decisões quando forem necessárias e não
escolhê-las silenciosamente. Transporte e biblioteca de estado remoto já estão
decididos para o domínio Produto e não devem ser reabertos sem evidência de uma
limitação concreta.
