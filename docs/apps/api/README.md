# Desenvolvimento da API

Este diretório documenta o padrão de desenvolvimento da aplicação NestJS
`apps/api` para pessoas e agentes.

## Objetivo

A API é organizada em módulos por domínio. Cada camada possui uma
responsabilidade clara:

```text
requisição HTTP
      ↓
DTO + validação Zod
      ↓
controller
      ↓
service
      ↓
repository
      ↓
Prisma
```

O retorno percorre o caminho inverso e é convertido para o contrato HTTP por um
mapper antes de sair do controller.

Segurança e performance participam desse fluxo desde os contratos e queries até
a resposta e a observabilidade; não são revisões executadas somente ao final.

## Estado atual da base

No estado atual:

- a API expõe o health check e o CRUD de Produto sob o prefixo global `/api`;
- `apps/api/src/modules/produto` possui module, controller, service, repository,
  tipos Prisma, mappers, DTOs de entrada e response e testes unitários das
  camadas com comportamento próprio;
- o `ProdutoModule` está registrado no `AppModule`, importa o `DatabaseModule`
  e disponibiliza as rotas `POST /produtos`, `GET /produtos`,
  `GET /produtos/:id`, `PATCH /produtos/:id` e `DELETE /produtos/:id`;
- `apps/api` usa Zod 4 e depende de `nestjs-zod` 5;
- `@repo/contracts` usa Zod 4 e já possui contratos runtime de `Produto` e do
  sub-recurso `AvaliacaoProduto`;
- o schema Prisma já possui os models `Produto` e `AvaliacaoProduto`;
- `@repo/database` expõe o namespace `Prisma`, o `PrismaClient` e os tipos dos
  models didáticos `Produto` e `AvaliacaoProduto`;
- a API já possui um `DatabaseModule` que cria, injeta e encerra um único
  Prisma Client por processo;
- `ZodValidationPipe` e `ZodSerializerInterceptor` já estão registrados
  globalmente no `AppModule`;
- o filtro responsável por converter exceções para `RespostaErroSchema` está
  implementado em `src/common/filters` e registrado globalmente no `AppModule`;
- o middleware funcional de `requisicaoId` está implementado em
  `src/common/middleware` e registrado no `AppModule` para todos os métodos e
  caminhos;
- a API gera seu próprio UUID por requisição, ignora `X-Request-Id` enviado pelo
  cliente, devolve o identificador nesse header e o expõe pela configuração de
  CORS;
- os caminhos do filtro e do middleware possuem testes unitários; testes E2E
  confirmam o header em sucesso, o mesmo identificador no header e no corpo de
  erro e a rejeição do identificador enviado pelo cliente;
- os mappers de persistência e response de `Produto` possuem testes unitários
  que cobrem campos opcionais e anuláveis, filtros, conversões de tipos do
  Prisma e validação das respostas pelos contratos compartilhados;
- o `ProdutoService` possui testes isolados de orquestração, paginação e
  tradução dos erros Prisma `P2002` e `P2025`;
- o controller usa `@ZodSerializerDto`, envelopes explícitos nas respostas com
  corpo e `204 No Content` na exclusão;
- as mensagens amigáveis dos contratos de Produto já chegam ao filtro sem
  alterar os tipos aceitos pelo body JSON;
- lint, typecheck, as 7 suítes com 60 testes e o build da API passam;
- `AvaliacaoProduto` já possui model Prisma e contratos compartilhados, mas
  ainda não possui tipos, mappers, repository, service, DTOs ou controller na
  API;
- a próxima etapa é implementar o CRUD aninhado de `AvaliacaoProduto` dentro do
  `ProdutoModule`; a integração Web foi adiada para depois desse CRUD;
- testes E2E específicos das rotas de Produto permanecem como pendência e não
  devem ser confundidos com os testes unitários já aprovados;
- o `DatabaseModule` é importado pelo `ProdutoModule`; o `AppModule` registra apenas o módulo de domínio, evitando uma dependência redundante de infraestrutura.

Os exemplos desta documentação representam o padrão desejado, não código já
implementado.

## Pré-requisitos para um módulo

Antes de desenvolver rotas de um domínio:

1. confirme que os schemas de request e response existem em
   `@repo/contracts`;
2. confirme que os tipos de input e output foram derivados desses schemas;
3. confirme que o model e os tipos necessários existem no Prisma;
4. confirme que o client Prisma foi gerado;
5. confirme que o provider singleton de banco pode ser injetado;
6. confirme que `nestjs-zod` e o Pipe de validação estão configurados.

Se os contratos ainda não existirem, um agente deve interromper a implementação
do módulo e avisar o usuário. Não crie silenciosamente contratos ou semânticas de
campos para desbloquear a API.

## Documentos

| Assunto                                  | Documento                                            |
| ---------------------------------------- | ---------------------------------------------------- |
| Estrutura, fluxo e limites entre camadas | [Arquitetura](./architecture.md)                     |
| DTOs e validação de entrada              | [DTOs](./dtos.md)                                    |
| Tipos Prisma e mapeamento de resposta    | [Tipos e mappers](./types-and-mappers.md)            |
| Acesso ao banco                          | [Repositories](./repositories.md)                    |
| Regras de negócio e orquestração         | [Services](./services.md)                            |
| Rotas e respostas HTTP                   | [Controllers](./controllers.md)                      |
| Composição e dependências de módulos     | [Módulos](./modules.md)                              |
| Posicionamento de funções utilitárias    | [Utilitários](./utilities.md)                        |
| Ordem de implementação e testes          | [Workflow e testes](./workflow-and-testing.md)       |
| Políticas e validações de segurança      | [Segurança](./security/README.md)                    |
| Limites, métricas e eficiência           | [Performance](./performance.md)                      |
| Guards, Interceptors, Filters e Pipes    | [Ciclo da requisição](./request-lifecycle/README.md) |
| Documentações oficiais                   | [Referências](./references.md)                       |

Assuntos que definem a comunicação entre API e consumidores devem ser
documentados também em [Integrações](../../integrations/README.md). Contratos
compartilhados seguem as regras de
[docs/contracts](../../contracts/README.md).

## Decisões pendentes por projeto

Esta estrutura não deve escolher antecipadamente políticas que dependem do
produto. Antes de implementar recursos relacionados, documente:

- autenticação, autorização e significado de rota pública;
- catálogo de erros, exceptions e filtros HTTP;
- formato comum de paginação;
- limites e propagação de transações entre services e repositories;
- upload, armazenamento e entrega de arquivos;
- logging, observabilidade e dados sensíveis;
- metas, limites e alertas de performance para os fluxos críticos;
- versionamento de API e geração de OpenAPI.

As decisões de segurança devem seguir o processo descrito em
[Segurança da API](./security/README.md). Elas são definidas durante o baseline
e a implementação de cada rota, não somente em uma revisão posterior.

Quando uma dessas decisões afetar os consumidores, registre-a também em
[Integrações](../../integrations/README.md) e, se mudar formatos compartilhados,
em [Contratos](../../contracts/README.md).
