# Erros de validação

## Objetivo

Um erro de validação deve permitir que o consumidor responda:

1. qual campo está incorreto;
2. qual regra falhou;
3. como corrigir o valor.

Mensagens técnicas do Zod não devem chegar diretamente ao usuário final.

## Mensagens globais

Use a configuração global para mensagens genéricas e reutilizáveis:

```ts
z.config({
  customError: (issue) => {
    if (issue.code === "invalid_type") {
      return "Formato ou tipo de dado inválido.";
    }

    return undefined;
  },
});
```

Retornar `undefined` delega a mensagem para a próxima camada de customização.
Consulte a
[documentação oficial de customização de erros](https://zod.dev/error-customization)
antes de definir o mapa definitivo.

Exemplos de categorias globais:

| Categoria     | Mensagem possível                     |
| ------------- | ------------------------------------- |
| tipo inválido | Formato ou tipo de dado inválido.     |
| string curta  | Deve possuir pelo menos X caracteres. |
| string longa  | Deve possuir no máximo X caracteres.  |
| enum inválido | Opção inválida.                       |

## Mensagens específicas

Uma regra específica mantém sua mensagem junto ao schema:

```ts
const SenhaSchema = z.string().min(8, {
  error: "A senha deve possuir pelo menos 8 caracteres.",
});
```

Evite repetir o nome do campo quando a própria interface já fornece esse
contexto. Para campos comuns, “Este campo é obrigatório.” costuma ser suficiente.

## Contrato de erro da aplicação

Não exponha `ZodError` diretamente como resposta HTTP. Converta-o para um
formato estável da aplicação:

```json
{
  "code": "VALIDATION_ERROR",
  "errors": [
    {
      "path": "titulo",
      "code": "too_small",
      "message": "Este campo é obrigatório."
    }
  ]
}
```

Preserve no mínimo:

- `path`: campo ou posição que pode ser corrigida;
- `code`: categoria estável do erro;
- `message`: orientação legível.

O formatter pode usar as ferramentas de
[formatação de erros do Zod](https://zod.dev/error-formatting), mas o contrato
externo pertence à aplicação e não deve variar acidentalmente após uma
atualização da biblioteca.

## Paths

Para objetos aninhados e arrays, defina uma convenção única. Exemplos possíveis:

```text
documentos.0.nome
documentos[0].nome
```

Escolha uma representação e cubra-a com testes. Refinements devem apontar, quando
possível, para o campo em que o usuário consegue corrigir o problema.

## Frontend

O frontend deve mapear erros por `path` e apresentar uma mensagem próxima ao
campo correspondente. Erros sem campo específico podem aparecer em uma área
geral do formulário.

O frontend não deve depender de propriedades internas de `ZodError` recebidas
pela rede. Ele depende apenas do contrato de erro da aplicação.

## Logs e dados sensíveis

Não registre indiscriminadamente o payload inválido. Por padrão, o Zod não inclui
o input nas issues para reduzir o risco de exposição acidental de dados
sensíveis. Ative esse comportamento somente com necessidade e política de
redação claras.

Nunca inclua em logs ou respostas:

- senhas e tokens;
- cookies ou cabeçalhos de autorização;
- documentos pessoais completos;
- conteúdo sigiloso enviado em formulários.
