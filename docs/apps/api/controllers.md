# Controllers

## Responsabilidade

O controller é a ponte entre HTTP e o caso de uso. Cada método deve:

1. receber body, query e params já descritos por DTOs;
2. encaminhar os valores ao service;
3. passar o retorno pelo mapper;
4. declarar um tipo de response proveniente de `@repo/contracts`.

Ele não deve implementar regras de negócio, consultar Prisma, acessar um
repository, formatar manualmente dados complexos ou usar `try/catch` para
substituir a política central de erros.

## Exemplo

```ts
import type { RecursoResponse } from "@repo/contracts";

@Controller("recursos")
export class RecursoController {
  constructor(private readonly recursoService: RecursoService) {}

  @Post()
  async create(@Body() body: CreateRecursoDto): Promise<RecursoResponse> {
    const recurso = await this.recursoService.create(body);

    return RecursoResponseMapper.toHttp(recurso);
  }
}
```

O exemplo presume que o DTO foi criado como classe por `createZodDto` e que o
Pipe de validação está ativo.

## Paginação

Quando o service retornar dados e metadados, mapeie apenas os itens:

```ts
const result = await this.recursoService.list(query);

return {
  data: result.items.map(RecursoResponseMapper.toHttp),
  meta: {
    total: result.total,
    page: result.page,
    limit: result.limit,
  },
};
```

O formato exato precisa existir em `@repo/contracts`; não invente `data`,
`items`, `meta` ou nomes de campos somente no controller.

## Decorators, Pipes e Guards

Use decorators existentes para declarar rota, status, autenticação, autorização
ou tratamento de entrada. Pipes validam e transformam dados de entrada; Guards
decidem se a requisição pode alcançar o handler.

Antes de um agente criar um decorator customizado, ele deve explicar a
necessidade e pedir autorização ao usuário. Não crie abstrações para um único
uso quando decorators nativos ou já existentes resolverem o problema.

Rotas públicas e regras de permissão devem seguir a política de autenticação do
projeto. Enquanto ela não estiver documentada, não presuma nomes de decorators
nem comportamentos de autorização.
