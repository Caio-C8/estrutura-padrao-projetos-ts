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
- ainda não existe cliente HTTP central;
- ainda não existem operações ou hooks de API;
- não foi escolhida biblioteca de cache remoto como TanStack Query ou SWR;
- o mecanismo de autenticação, o fluxo CSRF e o formato público de erros
  continuam pendentes;
- credenciais de autenticação no navegador já possuem o baseline de cookie
  `HttpOnly`, sem Web Storage.

Os exemplos são o padrão planejado, não código já implementado.

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

Antes de implementar a primeira integração real, definir:

- native `fetch`, Axios, Ky ou outra implementação do cliente;
- biblioteca de cache remoto no cliente;
- formato público de erro;
- política de timeout e retry;
- mecanismo de autenticação e transporte de identidade fora do navegador;
- responsável por emitir o cookie, `credentials`, atributos e fluxo CSRF;
- propagação de correlation ID;
- regras de cache e revalidação;
- observabilidade sem vazamento de dados.

Um agente deve apresentar essas decisões quando forem necessárias e não
escolhê-las silenciosamente.
