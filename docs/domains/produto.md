# Domínio Produto

## Objetivo

O domínio `Produto` é o primeiro fluxo completo do projeto. Ele será usado para
exercitar tipos diferentes do Prisma e do Zod sem fazer o contrato HTTP espelhar
automaticamente o model do banco.

Este domínio é um exemplo didático descartável, não parte permanente do
baseline. Ao iniciar um projeto real, seus models, migrations, contratos, API,
página e objetivo de roadmap devem ser removidos e substituídos pelo domínio do
novo projeto.

O resultado planejado inclui:

1. model e migration no PostgreSQL;
2. relação um-para-muitos entre produto e avaliação;
3. contratos Zod compartilhados por API e Web;
4. CRUD na API NestJS;
5. página Next.js com listagem e formulário.

Este documento será atualizado de forma incremental. Uma etapa só deve ser
marcada como concluída depois das verificações correspondentes.

## Estado atual

- [x] enum `StatusProduto` definido no schema Prisma;
- [x] model `Produto` definido no schema Prisma;
- [x] migration inicial `20260905141354_adicionar_produto` aplicada no banco de
      desenvolvimento;
- [x] relação didática `Produto 1:N AvaliacaoProduto` definida no schema;
- [x] schema Prisma validado e Prisma Client gerado;
- [x] lint e typecheck de `@repo/database` aprovados;
- [x] objetivo `CONTRACTS-001` registrado no roadmap de contratos;
- [x] segunda migration criada e aplicada para sincronizar o model atual;
- [x] Zod 4 e runner de testes configurados em `@repo/contracts`;
- [x] contratos de status e params implementados e testados;
- [x] `dataValidade` alinhada como `DATE` no banco e `YYYY-MM-DD` no contrato;
- [x] schemas de campos de Produto extraídos dentro da própria feature;
- [x] contratos de criação e atualização implementados e testados;
- [x] query de listagem com filtros, conversão e paginação implementada e
      testada;
- [x] schemas de resposta comum, detalhada, resumida e paginada implementados;
- [x] testes separados por contrato, com fixtures e helpers privados;
- [x] decisões semânticas dos contratos de Produto confirmadas;
- [x] contratos Zod implementados;
- [x] objetivo `CONTRACTS-002` registrado no roadmap de contratos;
- [x] implementação inicial dos schemas de `AvaliacaoProduto` criada;
- [x] paginação compartilhada extraída para `common`;
- [x] schemas de `AvaliacaoProduto` testados e exportados;
- [x] query de avaliações definida para a coleção aninhada de um produto;
- [x] nomenclatura da response de listagem alinhada ao singular;
- [x] filtro `pesquisa` definido exclusivamente sobre `autorNome`;
- [ ] CRUD da API implementado;
- [ ] página Web implementada.

## Convenções de persistência

- models e campos Prisma usam nomes em português;
- tabelas usam nomes no plural;
- colunas com mais de uma palavra usam `snake_case` por meio de `@map`;
- o package de contratos não importa tipos ou enums de `@repo/database`;
- o model descreve persistência; os contratos descrevem cada operação HTTP.

O model desejado cobre `String`, `Boolean`, `Int`, `Decimal`, `Float`, `BigInt`,
`DateTime`, enum, campos anuláveis e uma relação 1:N. Listas escalares, `Json` e
`Bytes` deixam de ser requisitos desta etapa; devem ser adicionados somente
quando um domínio real precisar deles.

## Representações entre camadas

| Campo Prisma       | Tipo no Prisma     | Representação HTTP planejada                |
| ------------------ | ------------------ | ------------------------------------------- |
| `id`               | `String`/UUID      | string UUID                                 |
| `sku`              | `String`           | string                                      |
| `nome`             | `String`           | string                                      |
| `descricao`        | `String?`          | string ou `null`                            |
| `urlManual`        | `String?`          | URL HTTP/HTTPS ou `null`                    |
| `status`           | `StatusProduto`    | enum textual do contrato                    |
| `emDestaque`       | `Boolean`          | boolean                                     |
| `estoque`          | `Int`              | number inteiro                              |
| `preco`            | `Decimal`          | string decimal maior ou igual a `0.01`      |
| `pesoKg`           | `Float?`           | number finito ou `null`                     |
| `quantidadeVendas` | `BigInt`           | string inteira para preservar precisão JSON |
| `dataValidade`     | `DateTime?`/`Date` | string `YYYY-MM-DD` ou `null`               |
| `disponivelEm`     | `DateTime?`        | string ISO 8601 ou `null`                   |

`Decimal`, `BigInt` e `DateTime` exigem conversão explícita no mapper da API.
Models Prisma não serão retornados diretamente pelos controllers.

## Relação didática: avaliações do produto

### Por que usar 1:N primeiro

Uma avaliação pertence a exatamente um produto, enquanto um produto pode ter
zero ou muitas avaliações. Esse relacionamento permite aprender:

- chave estrangeira e campo de relação no lado filho;
- lista de relações no lado pai;
- relação obrigatória e prevenção de registros órfãos;
- ação referencial ao excluir o pai;
- índice orientado pela consulta planejada;
- criação e listagem por sub-recurso HTTP;
- paginação e responses resumidas versus detalhadas.

Um relacionamento N:N entre `Produto` e `Categoria` também seria realista, mas
acrescentaria uma tabela de junção e decisões sobre criação, associação e ciclo
de vida de categorias. Ele é mais adequado como segundo exemplo. O Prisma
recomenda relação N:N implícita quando a junção não possui metadados e explícita
quando a própria associação armazena campos.

### Schema implementado

```prisma
model Produto {
  // campos escalares atuais

  avaliacoes AvaliacaoProduto[]

  @@map("produtos")
}

model AvaliacaoProduto {
  id          String   @id @default(uuid()) @db.Uuid
  produtoId   String   @map("produto_id") @db.Uuid
  autorNome   String   @map("autor_nome") @db.VarChar(80)
  nota        Int
  comentario  String?  @db.VarChar(1000)
  recomenda   Boolean  @default(true)
  createdAt DateTime @default(now()) @map("created_at") @db.Timestamptz(3)
  updatedAt DateTime @updatedAt @map("updated_at") @db.Timestamptz(3)

  produto Produto @relation(fields: [produtoId], references: [id], onDelete: Cascade)

  @@index([produtoId, createdAt])
  @@map("avaliacoes_produtos")
}
```

O campo `Produto.avaliacoes` existe apenas no Prisma e não cria uma coluna. A
chave estrangeira real é `AvaliacaoProduto.produtoId`, no lado que pode se
repetir. Não se aplica `@unique` nela, pois isso converteria a relação em 1:1.

`produtoId` e `produto` são obrigatórios: uma avaliação não existe sem produto.
`onDelete: Cascade` expressa que as avaliações serão removidas com o produto.
Se avaliações precisarem ser preservadas por auditoria, essa ação referencial
deverá mudar antes da implementação.

O índice composto atende a consulta planejada de avaliações por produto e
ordenação por criação. Relações não serão carregadas automaticamente em toda
consulta de produto.

### Semântica dos contratos

- `nota` aceitará somente inteiros de 1 a 5;
- `autorNome` será obrigatório, terá trim e limite finito;
- `comentario` precisa preservar a diferença entre ausente, `null` e string
  vazia conforme a operação;
- `produtoId` virá do path da rota, não do body de criação;
- a existência do produto será verificada pelo service, não pelo Zod;
- a resposta básica de produto não incluirá uma coleção ilimitada de
  avaliações;
- listagens de avaliações terão paginação, limite e ordenação determinística.

A implementação inicial usa a paginação comum, aceita pesquisa textual e o
filtro case-insensitive `recomenda` com os valores `true`, `false`, `1` e `0`.
Como a coleção pertence ao produto identificado no path, a query e o schema de
response da listagem usam `Produto` no singular. O filtro `pesquisa` consulta
exclusivamente o campo `autorNome`.

Rotas conceituais:

```text
GET    /produtos/:produtoId/avaliacoes
POST   /produtos/:produtoId/avaliacoes
GET    /produtos/:produtoId/avaliacoes/:avaliacaoId
PATCH  /produtos/:produtoId/avaliacoes/:avaliacaoId
DELETE /produtos/:produtoId/avaliacoes/:avaliacaoId
```

Operações que recebem os dois IDs devem confirmar no service que a avaliação
pertence ao produto indicado. Isso evita tratar o path hierárquico apenas como
decoração.

## Contratos de Produto

O primeiro conjunto de contratos foi implementado em
`packages/contracts/src/produto`. A mesma feature agora também contém a
implementação inicial de `AvaliacaoProduto`:

```text
produto/
├── status-produto.schema.ts
├── produto-fields.schema.ts
├── create-produto.schema.ts
├── update-produto.schema.ts
├── list-produtos-query.schema.ts
├── produto-params.schema.ts
├── produto-response.schema.ts
├── avaliacao-produto-fields.schema.ts
├── avaliacao-produto-params.schema.ts
├── create-avaliacao-produto.schema.ts
├── update-avaliacao-produto.schema.ts
├── list-avaliacoes-produto-query.schema.ts
├── avaliacao-produto-response.schema.ts
├── tests/
│   ├── avaliacao-produto.fixtures.ts
│   ├── produto.fixtures.ts
│   ├── status-produto.schema.test.ts
│   ├── produto-fields.schema.test.ts
│   ├── create-produto.schema.test.ts
│   ├── update-produto.schema.test.ts
│   ├── list-produtos-query.schema.test.ts
│   ├── produto-params.schema.test.ts
│   ├── produto-response.schema.test.ts
│   ├── avaliacao-produto-fields.schema.test.ts
│   ├── avaliacao-produto-params.schema.test.ts
│   ├── create-avaliacao-produto.schema.test.ts
│   ├── update-avaliacao-produto.schema.test.ts
│   ├── list-avaliacoes-produto-query.schema.test.ts
│   └── avaliacao-produto-response.schema.test.ts
└── index.ts
```

Os arquivos de avaliação possuem testes próprios e foram adicionados ao barrel
da feature. A paginação compartilhada foi criada em
`src/common/paginacao-query.schema.ts`, possui cobertura própria e é exportada
pelo barrel de `common`. O teste da API pública inclui os novos exports. Lint,
typecheck e os 104 testes do package passam.

Os contratos previstos são:

- `CreateProdutoSchema`;
- `UpdateProdutoSchema`;
- `ListProdutosQuerySchema`;
- `ProdutoParamsSchema`;
- `ProdutoResumoResponseSchema`;
- `ProdutoDetalhadoResponseSchema`;
- `ListProdutosResponseSchema`.

O create não aceitará automaticamente campos controlados pelo servidor, como
`id`, timestamps ou contadores, mesmo que eles existam no model Prisma. O
update será explícito e não será derivado cegamente com `.partial()` do create.
Schemas escalares compartilhados por create e update permanecem no arquivo
interno `produto-fields.schema.ts`, sem export público pelo barrel da feature.

As decisões aplicadas atualmente são:

- SKU de entrada recebe trim e é normalizado para maiúsculas;
- campos opcionais do create não aceitam `null`;
- campos anuláveis do update aceitam `null` como limpeza explícita;
- paginação começa em 1, usa limite padrão 20 e máximo 50;
- preço entra como string decimal e sai com exatamente duas casas;
- preço precisa ser maior ou igual a `0.01`;
- `urlManual` aceita somente URLs HTTP e HTTPS;
- paginação aceita somente strings formadas por dígitos antes da conversão;
- `disponivelEm` aceita UTC ou offset no input e exige UTC com milissegundos na
  response.

### Revisões pendentes de AvaliacaoProduto

- confirmar se os campos da response resumida atendem à futura listagem.

## Alcance das validações

Os schemas validam forma, tipo, limites e relações locais do payload. Exemplos:

- `strictObject` rejeita propriedades não declaradas;
- strings obrigatórias recebem trim antes da verificação de tamanho;
- estoque aceita somente inteiros não negativos;
- datas de validade usam `YYYY-MM-DD`, enquanto instantes exigem timezone;
- create aplica defaults, mas update exige ao menos um campo definido;
- metadados de paginação conferem `ultimaPagina` com `total` e `limite`;
- responses exigem a representação JSON acordada para `Decimal`, `BigInt` e
  `DateTime`.

Os schemas não consultam banco, storage ou permissões. Portanto, não verificam
unicidade ou existência do SKU e do produto, autorização, disponibilidade real
de uma URL, saldo de estoque, nem se uma avaliação pertence ao produto. Essas
regras permanecem nos services e repositories. A validação de response só tem
efeito em runtime se a API realmente executar o schema antes de enviar os
dados.

`dataValidade` representa um dia de calendário, sem horário ou fuso. No Prisma,
o scalar permanece `DateTime`, mas usa o tipo nativo `@db.Date`; no contrato
HTTP, sua representação é `YYYY-MM-DD` validada com `z.iso.date()`.

`AvaliacaoProduto` começará dentro do módulo e da feature `produto`, pois seu
ciclo de vida e suas rotas dependem do pai. Um módulo próprio só será criado se
avaliações passarem a possuir casos de uso independentes, integrações próprias
ou consumidores fora desse domínio. A existência de outra tabela, isoladamente,
não justifica outro módulo.

## Uploads futuros

### Estado e critério de adoção

Uploads estão explicitamente fora do primeiro CRUD. Não serão adicionados agora
model, rota, biblioteca, variável de ambiente, diretório ou volume sem código
que os consuma.

Quando surgir um arquivo real com ciclo de vida próprio, prefira um model
relacionado em vez de adicionar todos os metadados ao `Produto`. O nome do model
deve representar o conceito do domínio, como `FichaTecnica`, enquanto um model
genérico `Arquivo` só se justifica depois de existir reutilização real.

### Fluxo recomendado

```text
arquivo recebido
      ↓
validação e autorização na API
      ↓
storage local ou em nuvem
      ↓
chave estável salva no banco
      ↓
download mediado pela API ou URL temporária
```

O registro relacionado deve guardar metadados como chave de armazenamento,
nome original, tipo verificado, tamanho, timestamps e, quando necessário, hash.
O banco deve guardar preferencialmente uma chave relativa e opaca, como
`produtos/<id>/<identificador-gerado>.pdf`. O diretório raiz local, bucket,
credenciais e base URL pertencem à configuração do provider de storage.

Não guardar como referência principal:

- caminho absoluto do computador do servidor;
- nome ou caminho escolhido diretamente pelo cliente;
- URL assinada, porque ela expira;
- credenciais ou parâmetros secretos do storage.

O nome original é apenas metadado para apresentação e não será usado como
caminho no filesystem. O tipo persistido deve representar o conteúdo verificado
pela API, e não apenas o header enviado pelo cliente.

Excluir a linha relacionada por cascade não remove o objeto do storage. O
service deve coordenar as duas operações e possuir tratamento de compensação ou
limpeza para falhas parciais; banco e filesystem/storage não compartilham a
mesma transação.

### Operações HTTP planejadas

O upload não deve fazer parte do body JSON do CRUD básico de produto. Ele terá
operações próprias quando for implementado, por exemplo:

```text
POST   /produtos/:produtoId/ficha-tecnica
GET    /produtos/:produtoId/ficha-tecnica
DELETE /produtos/:produtoId/ficha-tecnica
```

O contrato do `POST` usará `multipart/form-data`. Contratos de metadados e params
podem permanecer em `@repo/contracts`, mas objetos exclusivos de plataforma,
como `File` e `Express.Multer.File`, não entram no package compartilhado.

### Storage local e Docker

Um primeiro provider poderá armazenar arquivos no filesystem local. A API deve
acessá-lo por uma abstração de storage com operações mínimas, permitindo trocar
o adapter por object storage sem espalhar caminhos pelo domínio.

No container, a aplicação verá um caminho interno estável, por exemplo
`/app/data/uploads`. O caminho escolhido no host pertence somente ao Compose:

```yaml
services:
  api:
    environment:
      STORAGE_DRIVER: local
      UPLOAD_ROOT: /app/data/uploads
    volumes:
      - type: bind
        source: ${UPLOAD_HOST_PATH}
        target: /app/data/uploads
```

Esse bind mount é adequado quando o deploy usa um host conhecido e há intenção
de acessar ou administrar diretamente aquele diretório. Um volume nomeado é
mais portável quando o Docker deve gerenciar a localização física. Nos dois
casos, arquivos não podem permanecer apenas na camada gravável do container.

Como a imagem da API executa com usuário sem privilégios, o diretório montado
deve permitir escrita pelo UID/GID usado no container. Somente serviços que
realmente manipulam os arquivos recebem o mount; `web`, `migrate` e `studio` não
precisam desse acesso.

Storage local impõe uma restrição operacional: todas as réplicas que atendem o
upload e o download precisam enxergar os mesmos arquivos. Em múltiplos hosts,
deve-se usar filesystem compartilhado ou object storage; bind mounts locais não
fornecem essa garantia.

### Entrega do arquivo

`ServeStaticModule` não fará parte do baseline da aplicação. A documentação do
NestJS o apresenta para conteúdo estático; ele só será considerado quando todo
o diretório puder ser público e nenhuma autorização por arquivo for necessária.

Para ficha técnica privada ou sujeita a permissão, um controller carregará os
metadados, aplicará autorização por recurso e retornará um stream, por exemplo
com `StreamableFile`. Um provider em nuvem poderá produzir redirect ou URL
temporária somente depois da mesma autorização.

Essa decisão mantém a política dentro do fluxo de controller, Guard e service.
Arquivos públicos de alto volume poderão ser entregues futuramente por proxy ou
CDN, depois que esse requisito existir.

### Requisitos ainda não definidos

- extensões e tipos de arquivo permitidos;
- tamanho máximo por arquivo e por request;
- se o acesso será público ou autenticado;
- comportamento ao substituir uma ficha existente;
- política de backup, retenção e limpeza de órfãos;
- estratégia de consistência entre backup do banco e dos arquivos;
- provider de object storage, caso deixe de ser local.

O contrato de upload deverá definir quantidade, extensões permitidas, tamanho
máximo e representação `multipart/form-data`. MIME informado pelo cliente não
será tratado como prova suficiente do conteúdo.

## Observações sobre migrations

Os campos `createdAt` e `updatedAt` permanecem em inglês por convenção técnica.
A relação usa definitivamente `onDelete: Cascade` neste exemplo didático, de
modo que excluir um produto também exclui suas avaliações.

A migration `20260905151731_adicionar_avaliacao_corrigir_colunas` adiciona
`updated_at` como coluna obrigatória sem valor default. Ela foi aplicada com
sucesso no banco de desenvolvimento sem produtos existentes. Se a migration
precisar ser executada em outro banco que já possua produtos, será necessário
planejar o preenchimento dos registros existentes antes de tornar a coluna
obrigatória; uma migration já aplicada não deve ser reescrita.

A migration `20260905194655_alterar_tipo_coluna_id` converte as colunas de ID
para o tipo nativo `UUID`. O cast `USING id::uuid` só preserva dados que já
estejam no formato UUID; valores CUID antigos não são convertíveis por esse
cast. Neste exemplo descartável, a migration pressupõe tabelas vazias. Um
projeto com dados reais precisaria definir uma estratégia de remapeamento dos
IDs e das chaves estrangeiras.

## Fontes

- [Prisma Schema Reference](https://docs.prisma.io/docs/orm/reference/prisma-schema-reference)
- [Prisma: relações um-para-muitos](https://docs.prisma.io/docs/orm/prisma-schema/data-model/relations/one-to-many-relations)
- [Prisma: relações muitos-para-muitos](https://docs.prisma.io/docs/orm/v7/prisma-schema/data-model/relations/many-to-many-relations)
- [Microsoft Graph: navigation properties](https://github.com/microsoft/api-guidelines/blob/vNext/graph/patterns/navigation-property.md)
- [Microsoft REST API Guidelines: coleções](https://github.com/microsoft/api-guidelines/blob/vNext/graph/articles/collections.md)
- [Prisma Client: campos e tipos especiais](https://docs.prisma.io/docs/orm/v7/prisma-client/special-fields-and-types)
- [Prisma Migrate: histórico de migrations](https://docs.prisma.io/docs/orm/v7/prisma-migrate/understanding-prisma-migrate/migration-histories)
- [NestJS: upload de arquivos](https://docs.nestjs.com/techniques/file-upload)
- [NestJS: streaming de arquivos](https://docs.nestjs.com/techniques/streaming-files)
- [NestJS: ciclo da requisição](https://docs.nestjs.com/faq/request-lifecycle)
- [OWASP: File Upload Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/File_Upload_Cheat_Sheet.html)
- [AWS: boas práticas para URLs pré-assinadas](https://docs.aws.amazon.com/prescriptive-guidance/latest/presigned-url-best-practices/appendix-a.html)
- [Docker: bind mounts](https://docs.docker.com/engine/storage/bind-mounts/)
- [Docker: volumes](https://docs.docker.com/engine/storage/volumes/)
