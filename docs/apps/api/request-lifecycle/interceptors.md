# Interceptors

## Quando usar

Interceptors executam lógica antes e depois do handler e podem observar ou
transformar o fluxo baseado em `Observable`.

Usos apropriados incluem:

- correlação, métricas e tracing;
- timeout;
- cache quando semanticamente seguro;
- transformação transversal de response já definida pelo contrato;
- auditoria sem conteúdo sensível.

Consulte [Interceptors no NestJS](https://docs.nestjs.com/interceptors).

## Limites

Não use Interceptor como principal mecanismo de autenticação ou autorização;
Guards executam antes e representam essa decisão. Também não esconda nele regras
específicas de um domínio.

Um Interceptor não deve:

- registrar body, headers ou response completos indiscriminadamente;
- alterar silenciosamente o contrato de todas as rotas;
- converter qualquer erro sem respeitar a política de Exception Filters;
- manter estado mutável compartilhado entre requisições;
- aplicar cache a respostas dependentes de identidade sem chave e isolamento
  corretos.

## Ordem

Na entrada, Interceptors seguem a ordem global, controller e rota. Na saída, o
encadeamento é resolvido em ordem inversa. Ao combinar logging, timeout, cache e
transformação, documente e teste a ordem esperada.

Para componentes globais que usam injeção de dependência, prefira registro por
`APP_INTERCEPTOR` no módulo correspondente.
