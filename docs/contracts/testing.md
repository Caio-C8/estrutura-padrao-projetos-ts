# Testes dos contratos

## Estado atual

`@repo/contracts` ainda não possui runner nem script de testes. Antes de
implementar primitives, normalizers e schemas em escala, adicione a
infraestrutura de testes ao package e ao pipeline do Turborepo.

Enquanto isso, os comandos disponíveis são:

```bash
pnpm --filter @repo/contracts lint
pnpm --filter @repo/contracts typecheck
```

Depois que o script `test` for criado, ele também deve ser alcançado por
`pnpm test` e `pnpm check` na raiz.

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
