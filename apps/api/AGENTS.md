# Instruções para agentes — API

Estas regras complementam o `AGENTS.md` da raiz para qualquer alteração em
`apps/api`.

## Leitura obrigatória

Antes de implementar, leia [a documentação da API](../../docs/apps/api/README.md)
e somente os capítulos relacionados à tarefa.

## Pré-condições

- Confirme primeiro os contratos de request e response em `@repo/contracts`.
- Se um contrato estiver ausente ou ambíguo, pare e avise o usuário antes de
  desenvolver o módulo.
- Confirme o model Prisma, o client gerado, o provider singleton de banco e a
  configuração do `nestjs-zod`.
- Não invente políticas de autenticação, erros, paginação ou transações.

## Arquitetura obrigatória

- Organize cada domínio em `src/modules/<dominio>`.
- Use `dtos`, `mappers` e `types`, além de controller, service, repository e
  module do domínio.
- Crie DTOs como classes que estendem `createZodDto(schema)`; não use o padrão
  de constante mais alias de tipo com o mesmo nome.
- Mantenha repository limitado a operações Prisma mínimas. Não coloque nele
  regras, formatação, mappers ou exceções de domínio.
- Injete um único client Prisma por meio do provider de infraestrutura. Não
  instancie `PrismaClient` no repository.
- Coloque regras e orquestração no service. Um service usa o repository do
  próprio domínio e services, nunca repositories, de outros domínios.
- Mantenha controllers como pontes: recebem DTOs, chamam o service e mapeiam o
  retorno para tipos de `@repo/contracts`.
- Antes de criar um decorator customizado, explique a necessidade e peça
  autorização ao usuário.
- Em cada module, registre controllers e providers, exporte somente services e
  importe os módulos dos services externos.
- Reavalie os limites antes de usar `forwardRef()` para uma dependência circular.
- Ao concluir um domínio, registre seu module no `AppModule`.

## Utilitários

- Uso de um domínio da API: `src/common/utils/<dominio>`.
- Uso de vários módulos, somente na API: `src/common/utils`.
- Uso real por mais de um app e sem dependência de servidor: `packages/utils`.

## Verificação

Execute os checks relevantes descritos em
[workflow e testes](../../docs/apps/api/workflow-and-testing.md). Não encerre a
tarefa com falhas conhecidas sem relatá-las claramente.
