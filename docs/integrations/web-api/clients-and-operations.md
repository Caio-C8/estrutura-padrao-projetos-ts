# Clientes e operações HTTP

## Estrutura implementada e expansão prevista

```text
apps/web/
├── lib/
│   └── api/
│       ├── core/
│       │   ├── api-error.ts
│       │   ├── create-api-client.ts
│       │   └── types.ts
│       ├── browser-api-client.ts
│       └── server-api-client.ts
└── features/
    └── <dominio>/
        └── api/
            ├── create-produto.ts
            ├── delete-produto.ts
            ├── get-produto.ts
            ├── get-produtos.ts
            ├── produto-query-keys.ts
            ├── update-produto.ts
            ├── use-*.ts
            └── validar-produto-id.ts
```

A infraestrutura comum e todas as operações do CRUD Web de Produto já existem.
Cada método e endpoint possui uma função própria; os hooks cliente permanecem
separados das operações. Em `WEB-003`, `getAvaliacoesProduto`,
`getAvaliacaoProduto` e `createAvaliacaoProduto` já seguem a mesma regra para o
sub-recurso aninhado e sempre carregam `produtoId`. Update e delete de avaliação
ainda não foram criados. Não crie diretórios vazios nem antecipe arquivos sem
consumidor.

## Abstração comum

`createApiClient` concentra comportamento compartilhado:

- composição segura de base URL e path;
- query params;
- serialização JSON;
- headers comuns não sensíveis;
- signal e timeout;
- parsing de resposta;
- normalização de resposta sem corpo;
- conversão de status não bem-sucedido em `ApiError`;
- validação opcional de response por schema;
- observabilidade permitida.

O timeout padrão implementado é 30 segundos e pode ser substituído em cada
request. A implementação usa `AbortSignal.timeout` e combina o sinal do
consumidor com `AbortSignal.any`, mantendo categorias distintas para timeout e
cancelamento.

Toda resposta de sucesso com corpo exige `responseSchema`. `204 No Content` é
retornado como `undefined` e não aceita schema de response. Respostas de erro
são validadas com `RespostaErroSchema`.

Não inclua nesse núcleo:

- hook React;
- toast;
- redirect;
- mensagem visual;
- regra de negócio;
- permissão;
- cache de uma biblioteca específica;
- token global sem política definida.

## Instância do navegador

`browserApiClient` é a única instância importada por operações executadas no
cliente.

Configuração atual:

```text
base URL: /api/backend
segredos: proibidos
origem: mesma origem do Next.js
credenciais web: cookie HttpOnly enviado pela política do navegador
```

Usar URL relativa aproveita o rewrite existente e evita expor
`API_INTERNAL_URL`. Não leia variável server-only nesse módulo.

Credenciais de autenticação não podem ser lidas para montar headers no cliente.
Defina `credentials`, origem e proteção CSRF em conjunto. Na mesma origem, não
adicione `include` por hábito; em uma topologia cross-origin, documente
explicitamente browser, CORS e atributos do cookie.

## Instância do servidor

`serverApiClient` é importado apenas por Server Components, Server Actions,
Route Handlers ou outro código server-only.

Ele deve:

- importar `server-only`;
- usar `${API_INTERNAL_URL}/api`;
- nunca ser importado por um Client Component;
- encaminhar cookie ou header somente quando a operação exigir;
- receber credenciais por requisição, nunca por estado global mutável;
- filtrar headers hop-by-hop e dados não autorizados;
- não cachear resposta privada como pública;
- respeitar as APIs de cache e revalidação do Next.js conscientemente.

Não encaminhe todos os headers da requisição automaticamente.

Atualmente ele usa `API_INTERNAL_URL` ou o fallback local
`http://localhost:3001`. Ainda não existe operação server-side consumindo essa
instância; ela foi testada quanto à separação de runtime, mas não deve ser
importada no grafo cliente.

## Operação por endpoint e método

Uma operação representa:

```text
método HTTP + path + contrato de entrada + contrato de resposta
```

Exemplos:

```text
GET    /recursos       → getRecursos
GET    /recursos/:id   → getRecurso
POST   /recursos       → createRecurso
PATCH  /recursos/:id   → updateRecurso
DELETE /recursos/:id   → deleteRecurso
```

A mesma URL com métodos diferentes são operações diferentes.

Uma função de operação deve:

- receber parâmetros já tipados;
- montar path, query e body;
- escolher a instância correspondente ao runtime;
- validar input no boundary quando necessário;
- validar a resposta com schema disponível;
- retornar o output do contrato;
- propagar `ApiError` normalizado;
- aceitar `AbortSignal` quando aplicável.

Ela não deve:

- atualizar componente;
- abrir toast;
- navegar;
- armazenar estado React;
- decidir mensagem de interface;
- esconder erro como valor vazio.

## Compartilhamento entre server e client

Evite uma função que importe simultaneamente os dois clientes. Há opções
seguras:

1. manter operações server e browser finas sobre uma função pura que descreve
   request e contratos; ou
2. fornecer o cliente como dependência explícita da operação.

Escolha a alternativa mais simples para a feature. Não use condição baseada em
`typeof window` em módulo que pode carregar segredos.

Produto usa a segunda alternativa: todas as operações recebem `ApiClient` como
dependência. Os hooks fornecem `browserApiClient`; um Server Component poderá
fornecer `serverApiClient` sem duplicar contratos ou montagem da request.

As operações de create e update validam e normalizam o body antes do envio. As
operações por ID compartilham a conversão de falhas de `ProdutoParamsSchema`
para `ApiError`. `deleteProduto` não configura response schema porque o contrato
HTTP bem-sucedido é `204 No Content`.

Nas avaliações, a validação compartilhada distingue params da coleção, que
exigem `produtoId`, dos params do item, que exigem também `avaliacaoId`. Lista,
detalhe e criação validam suas responses com os schemas exportados por
`@repo/contracts`. A criação normaliza o body antes da request; toast e
navegação continuam no formulário consumidor.

## Contratos

- Body, query, params e response usam schemas próprios.
- Use `z.input` antes de transformações e `z.output` depois do parse.
- Não considere response confiável apenas porque a API é interna.
- Se ainda não houver response schema, registre a lacuna; não faça cast cego
  como solução definitiva.
- Formulário pode exigir schema local e mapper antes da operação.
- Erro HTTP usa o contrato público acordado, não a exception interna da API.

## Query params

Use `URLSearchParams` ou abstração equivalente:

- omita somente valores cuja semântica seja ausência;
- não converta `null`, `undefined` e string vazia automaticamente;
- arrays e datas seguem o contrato;
- não concatene input sem encoding;
- mantenha ordem estável quando a chave de cache depender da URL.

## Upload

Para `FormData`:

- não defina manualmente o boundary de `Content-Type`;
- preserve tipos e nomes de campo do contrato;
- valide arquivo no cliente apenas para UX;
- permita cancelamento e progresso quando necessário;
- repita segurança e validação na API.

## Proibições

- `fetch` espalhado por componentes;
- nova instância por hook;
- base URL duplicada em features;
- segredo em `NEXT_PUBLIC_*`;
- `as TipoDaResposta` sem validação quando houver schema;
- retry automático de mutação;
- captura silenciosa que transforma falha em array vazio.
