# Testes dos contratos

## Estado atual

`@repo/contracts` usa o runner nativo do Node, executado por `tsx`, e mantém os
testes TypeScript próximos aos schemas. Os comandos disponíveis são:

```bash
pnpm --filter @repo/contracts lint
pnpm --filter @repo/contracts typecheck
pnpm --filter @repo/contracts test
```

O script também deve continuar alcançável pelos comandos agregados da raiz.

## Organização dos arquivos

Prefira um arquivo `*.test.ts` por contrato ou por grupo pequeno de primitives
fortemente relacionadas. Mantenha fixtures e helpers de teste em arquivos que
não terminem em `*.test.ts`, para que o runner não os execute como suítes.

Exemplo:

```text
src/
  test-utils.ts
  common/
    resposta.schema.ts
    resposta.schema.test.ts
  produto/
    produto.fixtures.ts
    produto-fields.schema.test.ts
    create-produto.schema.test.ts
    update-produto.schema.test.ts
    list-produtos-query.schema.test.ts
    produto-response.schema.test.ts
```

Os testes unitários devem importar diretamente o módulo sob teste. Adicione um
teste pequeno pelo entrypoint público do package para detectar exports
esquecidos sem acoplar todas as suítes aos arquivos de barrel.

## Estratégia

Teste contratos como caixa-preta. O objetivo não é provar que o Zod funciona,
mas confirmar que o comportamento exposto é o contrato desejado.

Para cada caso, verifique:

- sucesso ou falha;
- output normalizado;
- path e código do erro quando relevantes;
- comportamento de propriedades inesperadas;
- diferença entre ausente, `undefined`, `null` e string vazia.

## Primitives e normalizers

Antes de reutilizar uma abstração em várias features, teste sua matriz de
comportamento.

### Texto obrigatório

| Input       | Resultado esperado |
| ----------- | ------------------ |
| `"abc"`     | `"abc"`            |
| `" abc "`   | `"abc"`            |
| `""`        | erro               |
| `"   "`     | erro               |
| `null`      | erro               |
| `undefined` | erro               |

### Boolean em query

| Input     | Resultado esperado |
| --------- | ------------------ |
| `"true"`  | `true`             |
| `"1"`     | `true`             |
| `"false"` | `false`            |
| `"0"`     | `false`            |
| `"abc"`   | erro               |

### String vazia opcional

| Input       | Resultado esperado            |
| ----------- | ----------------------------- |
| `undefined` | `undefined`                   |
| `""`        | `undefined`                   |
| `"   "`     | `undefined`                   |
| `"teste"`   | `"teste"`                     |
| `null`      | decisão explícita do contrato |

## Contratos de feature

Para um schema de criação, cubra no mínimo:

- payload mínimo válido;
- payload completo válido;
- campo obrigatório ausente;
- string vazia e somente espaços;
- tipo incorreto;
- enum inválido;
- boolean inválido;
- data inválida;
- item aninhado inválido;
- propriedade inesperada;
- defaults;
- `null` onde não é permitido.

Para update/PATCH, acrescente:

- objeto vazio, se permitido;
- campo ausente sem aplicação de default;
- limpeza explícita com `null`, se suportada;
- regras diferentes da criação.

Para responses, teste a representação serializada, principalmente datas e
campos internos que não podem vazar.

## Integrações

Além dos schemas isolados, teste:

- Pipe NestJS retornando output transformado;
- resposta HTTP 400 no formato padronizado;
- mapeamento de paths aninhados;
- formulário ou Server Action usando o contrato correto;
- backend rejeitando payload que tenha passado apenas pela validação do cliente.

## Tipos

O `typecheck` deve confirmar os tipos inferidos de input e output. Quando uma
transformação muda o tipo, inclua uma asserção de tipos ou fixture de compilação
que impeça a regressão.
