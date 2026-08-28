# Integrações

## NestJS

O backend deve validar body, query e params nos boundaries antes de chamar a
camada de aplicação.

A integração prevista é um Pipe personalizado:

```text
HTTP request
      ↓
ZodValidationPipe
      ↓
safeParse
   ↙      ↘
erro 400  output validado
              ↓
          controller
              ↓
           service
```

Exemplo conceitual:

```ts
import {
  BadRequestException,
  Injectable,
  type PipeTransform,
} from "@nestjs/common";
import * as z from "zod";

@Injectable()
export class ZodValidationPipe<T extends z.ZodType> implements PipeTransform<
  unknown,
  z.output<T>
> {
  constructor(private readonly schema: T) {}

  transform(value: unknown): z.output<T> {
    const result = this.schema.safeParse(value);

    if (!result.success) {
      throw new BadRequestException(formatValidationError(result.error));
    }

    return result.data;
  }
}
```

O código definitivo deve:

- usar o formato descrito em [Erros](./errors.md);
- preservar a tipagem do output;
- distinguir body, query e params;
- ser testado com controllers reais;
- não consultar banco durante a validação estrutural.

O `ValidationPipe` nativo do NestJS usa `class-validator` e
`class-transformer`. O Zod será integrado por Pipe personalizado porque este
monorepo precisa compartilhar schemas runtime com o frontend. Pipes são o ponto
oficial do NestJS para validação e transformação antes do route handler.

## Next.js

O frontend pode importar contratos realmente compartilhados:

```ts
import { CreateNoticiaSchema } from "@repo/contracts";
```

Usos possíveis:

- validação de formulários;
- Server Actions;
- Route Handlers;
- parsing de parâmetros;
- validação de respostas externas.

O projeto já inclui `@repo/contracts` em `transpilePackages` no Next.js.

### Formulário não é sempre contrato HTTP

Não force equivalência entre estado de UI e payload da API:

```text
UI FileList
    ↓
FormData
    ↓
API File
```

Pode haver:

```text
NoticiaFormSchema
CreateNoticiaBodySchema
```

Esses schemas podem reutilizar primitives, mesmo quando suas representações
completas são diferentes.

### Segurança

Validação no frontend melhora feedback e evita requests obviamente inválidos,
mas não cria uma fronteira de segurança. O backend deve executar sua própria
validação mesmo quando usa exatamente o mesmo schema.

## Aplicativos móveis e outros consumidores

Um app mobile pode consumir contratos agnósticos de plataforma. Não coloque em
`@repo/contracts`:

- APIs exclusivas do DOM;
- componentes React ou React Native;
- Prisma Client;
- bibliotecas server-only;
- objetos que não possam ser serializados no boundary acordado.

Contratos específicos de um único cliente podem permanecer no próprio app e
reutilizar primitives compartilhadas.
