# Arquitetura da aplicação web

## Organização por responsabilidade

O App Router define rotas dentro de `app`, mas nem todo código da aplicação
deve permanecer nesse diretório. Use a proximidade com a rota e o alcance real
da responsabilidade para decidir a localização.

```text
apps/web/
├── app/
│   ├── (grupo-de-rotas)/
│   │   └── recurso/
│   │       ├── _components/
│   │       ├── loading.tsx
│   │       ├── error.tsx
│   │       └── page.tsx
│   ├── layout.tsx
│   └── globals.css
├── components/
│   ├── ui/
│   └── shared/
├── features/
│   └── <dominio>/
│       ├── api/
│       ├── components/
│       ├── forms/
│       ├── hooks/
│       ├── schemas/
│       └── types/
└── lib/
    └── api/
```

Crie diretórios somente quando houver conteúdo e responsabilidade concreta.
Uma estrutura vazia não melhora a arquitetura.

## Critérios de localização

| Local                    | Conteúdo                                         |
| ------------------------ | ------------------------------------------------ |
| `app/<rota>/_components` | componente exclusivo da rota                     |
| `features/<dominio>`     | UI e comportamento reutilizados no mesmo domínio |
| `components/shared`      | composição usada por domínios diferentes         |
| `components/ui`          | primitives do design system e shadcn/ui          |
| `lib`                    | infraestrutura interna agnóstica de domínio      |

Não mova um componente para `shared` porque ele pode ser reutilizado no
futuro. Faça isso depois que a reutilização e a semântica comum existirem.

## Server e Client Components

Páginas e layouts permanecem Server Components por padrão. Use Client
Components somente quando precisar de:

- estado ou event handlers;
- hooks;
- effects;
- Context;
- APIs do navegador;
- biblioteca que dependa do ambiente cliente.

Coloque `"use client"` na menor fronteira possível. Tudo que um Client
Component importa passa a fazer parte do grafo cliente; marcar uma página
inteira por conveniência aumenta hidratação e JavaScript enviado ao navegador.

Um Server Component pode renderizar um Client Component e passar conteúdo
server-rendered por props ou `children`. Não converta toda a árvore para Client
apenas porque um botão, formulário ou dialog é interativo.

## Páginas e composição

`page.tsx` deve revelar a estrutura da tela. Extraia blocos quando isso:

- nomeia uma responsabilidade visual;
- isola interatividade;
- reduz complexidade relevante;
- permite reutilização real;
- facilita testes;
- cria uma fronteira Client menor.

Não extraia automaticamente cada `div`, título ou trecho curto usado uma única
vez. Componentização excessiva dificulta acompanhar o fluxo da página.

## Estado

Mantenha o estado no local mais próximo que atende os consumidores:

1. valor derivado não deve virar estado;
2. estado exclusivo permanece no componente;
3. estado da feature permanece na feature;
4. filtros, ordenação, busca e paginação compartilháveis preferem a URL;
5. Context atende estado transversal com consumidores conhecidos;
6. uma biblioteca global exige necessidade concreta e decisão registrada.

Não copie respostas remotas para vários estados locais. TanStack Query é a
fonte do estado remoto nos Client Components atuais. O provider deve continuar
na menor fronteira que cubra os consumidores; hoje ele pertence ao layout de
`/produtos`, não ao layout raiz.

## Tipos e schemas locais

Use `@repo/contracts` somente quando a representação atravessar realmente a
integração. Tipos exclusivos de apresentação, props e estado visual permanecem
no app.

Um formulário pode precisar de campos auxiliares, previews ou representações do
DOM que não pertencem ao contrato HTTP. Nesses casos, mantenha schema ou tipo
local e converta explicitamente para a operação da integração.

## Dependências

Antes de adicionar uma dependência:

- confirme que a plataforma não oferece a capacidade;
- estime impacto no bundle cliente;
- confirme compatibilidade com React 19 e Server Components;
- verifique manutenção, licença e segurança;
- determine se ela será carregada apenas onde necessária;
- registre a decisão quando ela estabelecer um padrão transversal.

Não crie wrappers genéricos sobre toda biblioteca. Crie uma fronteira quando
ela centraliza configuração, protege uma regra do projeto ou permite trocar uma
dependência sem espalhar seu uso.

## Limite com a integração

A página escolhe composição e apresenta estados. Operações HTTP, clientes,
serialização, validação de responses e hooks remotos seguem
[Integração web–API](../../integrations/web-api/README.md).

Uma tarefa pode trabalhar nas duas áreas, mas a arquitetura continua separada:

```text
page/component
      ↓
hook cliente ou operação servidor
      ↓
cliente HTTP padronizado
      ↓
API
```

## Implementação atual do domínio Produto

`WEB-001`, `WEB-002` e `WEB-003` materializam a
separação desta forma:

```text
apps/web/
├── app/produtos/
│   ├── _components/
│   │   ├── produtos-filtros.tsx
│   │   └── produtos-listagem.tsx
│   ├── [produtoId]/
│   │   ├── _components/
│   │   │   ├── delete-produto-dialog.tsx
│   │   │   └── produto-detalhe.tsx
│   │   ├── editar/
│   │   │   ├── _components/
│   │   │   └── page.tsx
│   │   ├── avaliacoes/
│   │   │   ├── _components/
│   │   │   ├── [avaliacaoId]/
│   │   │   │   ├── _components/
│   │   │   │   ├── editar/
│   │   │   │   │   ├── _components/
│   │   │   │   │   └── page.tsx
│   │   │   │   └── page.tsx
│   │   │   ├── nova/
│   │   │   │   ├── _components/
│   │   │   │   └── page.tsx
│   │   │   └── page.tsx
│   │   ├── not-found.tsx
│   │   └── page.tsx
│   ├── layout.tsx
│   ├── novo/
│   │   ├── _components/
│   │   └── page.tsx
│   ├── page.tsx
│   └── query-provider.tsx
├── components/ui/
│   ├── radio-group.tsx
│   └── sonner.tsx
├── features/produto/
│   ├── api/
│   │   ├── avaliacao-produto-query-keys.ts
│   │   ├── create-avaliacao-produto.ts
│   │   ├── create-produto.ts
│   │   ├── delete-avaliacao-produto.ts
│   │   ├── delete-produto.ts
│   │   ├── get-produto.ts
│   │   ├── get-produtos.ts
│   │   ├── get-avaliacao-produto.ts
│   │   ├── get-avaliacoes-produto.ts
│   │   ├── produto-query-keys.ts
│   │   ├── update-avaliacao-produto.ts
│   │   ├── update-produto.ts
│   │   ├── use-*.ts
│   │   ├── validar-avaliacao-produto-params.ts
│   │   └── validar-produto-id.ts
│   ├── forms/
│   │   ├── avaliacao-produto-form-fields.schema.ts
│   │   ├── avaliacao-produto-form-fields.tsx
│   │   ├── create-avaliacao-produto-form.schema.ts
│   │   ├── create-produto-form.schema.ts
│   │   ├── decimal-input-mask.ts
│   │   ├── produto-form-fields.schema.ts
│   │   ├── produto-form-fields.tsx
│   │   ├── update-avaliacao-produto-form.mapper.ts
│   │   ├── update-avaliacao-produto-form.schema.ts
│   │   ├── update-produto-form.mapper.ts
│   │   └── update-produto-form.schema.ts
│   └── lib/
│       ├── list-avaliacoes-produto-search-params.ts
│       ├── list-produtos-search-params.ts
│       └── produto-formatters.ts
└── lib/
    ├── api/
    │   ├── core/
    │   ├── browser-api-client.ts
    │   └── server-api-client.ts
    └── query/
        └── query-client.ts
```

Os arquivos `page.tsx` permanecem Server Components e validam params ou
`searchParams`. Listagens, detalhes, formulários e diálogo destrutivo são as
fronteiras Client que realmente precisam de hooks, estado ou APIs do navegador.
O `Toaster` é uma única fronteira Client renderizada pelo layout raiz; isso não
converte o layout nem seus `children` em Client Components. Os filtros usam
navegação GET e continuam renderizáveis no servidor.

Os campos compartilhados por criação e edição vivem na feature, enquanto os
componentes que orquestram cada tela permanecem próximos das rotas. Isso ocorre
no CRUD de Produto e nos formulários de criação e edição de Avaliação. O schema
do formulário não substitui os contratos HTTP: mappers explícitos preservam a
diferença entre string vazia, `null`, propriedade ausente e campo não alterado.
