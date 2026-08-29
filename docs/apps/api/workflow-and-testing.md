# Workflow e testes

## Verificação antes de implementar

Antes de criar um módulo, confirme:

- schemas de request e response em `@repo/contracts`;
- tipos derivados e semântica de input/output;
- model, relações e identificadores no Prisma;
- Prisma Client gerado;
- provider singleton do banco disponível para injeção;
- `nestjs-zod` e `ZodValidationPipe` configurados;
- política aplicável de autenticação, erros e paginação.

Se os contratos necessários não existirem, um agente deve parar e avisar o
usuário. A criação dos contratos é uma etapa anterior e deve seguir
[docs/contracts](../../contracts/README.md).

## Ordem recomendada

1. confirmar os contratos e o schema Prisma;
2. gerar o Prisma Client quando o schema tiver mudado;
3. criar a estrutura do módulo;
4. definir tipos de payload Prisma;
5. implementar repository;
6. implementar service;
7. implementar mappers;
8. criar DTOs a partir dos schemas existentes;
9. implementar controller;
10. configurar o módulo e registrá-lo no `AppModule`;
11. adicionar testes e executar as verificações.

A ordem pode variar quando testes forem escritos antes da implementação, mas as
responsabilidades das camadas não mudam.

## Estratégia de testes

| Alvo       | Verificação principal                                      |
| ---------- | ---------------------------------------------------------- |
| Mapper     | conversão exata para o contrato de response                |
| Service    | regras e orquestração com repositories/services simulados  |
| Controller | encaminhamento de parâmetros e escolha do mapper           |
| Repository | query e payload reais em banco de teste controlado         |
| Module     | resolução de providers, imports e exports                  |
| E2E        | validação do boundary, autorização, status e response HTTP |

Casos importantes incluem sucesso, ausência de registro, conflitos de regra,
paginação, relações opcionais e valores que exigem serialização.

## Comandos de verificação

Use os scripts disponíveis no estado atual do monorepo:

```bash
pnpm --filter @repo/database db:generate
pnpm --filter @repo/api lint
pnpm --filter @repo/api typecheck
pnpm --filter @repo/api test
pnpm --filter @repo/api build
pnpm format:check
```

Execute `db:generate` apenas quando o schema ou a geração do client exigir. Para
uma mudança localizada, comece pelos comandos do package afetado; antes de
entregar uma mudança transversal, amplie a validação aos consumidores.

Não declare a implementação concluída se os testes relevantes falharem ou se o
grafo de injeção de dependências não inicializar.
