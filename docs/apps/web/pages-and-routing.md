# Páginas, rotas e metadata

## Rotas

Use as convenções do App Router:

- `page.tsx` torna um segmento acessível;
- `layout.tsx` compartilha estrutura persistente;
- route groups organizam áreas sem alterar a URL;
- `loading.tsx` cria fallback de navegação e streaming;
- `error.tsx` trata erro inesperado no segmento;
- `not-found.tsx` trata conteúdo inexistente;
- `global-error.tsx` e `global-not-found.tsx` cobrem falhas globais quando
  necessários.

Não crie um sistema paralelo de roteamento, loading ou erro quando a convenção
do Next.js atende o caso.

No estado atual, `/` e `/produtos/novo` são estáticas. `/produtos` é dinâmica
porque lê `searchParams`; `/produtos/[produtoId]`,
`/produtos/[produtoId]/editar`, `/produtos/[produtoId]/avaliacoes`,
`/produtos/[produtoId]/avaliacoes/nova` e
`/produtos/[produtoId]/avaliacoes/[avaliacaoId]` recebem params, e a listagem de
avaliações também lê `searchParams`. Todas mantêm o `page.tsx` como Server
Component e isolam TanStack Query, formulários e diálogos nas menores
fronteiras cliente necessárias.

As rotas dinâmicas validam `produtoId` com `ProdutoParamsSchema` antes de
renderizar seus consumidores. O detalhe diferencia loading, `404`, erro
recuperável e sucesso. A criação e a edição possuem metadata própria e a
exclusão retorna diretamente à listagem. As três mutations exibem confirmação
no `Toaster` global durante a navegação interna, sem acrescentar marcador
transitório à URL.

As rotas aninhadas de avaliações validam `produtoId` e, no detalhe,
`avaliacaoId` antes de renderizar o consumidor cliente. A coleção preserva
filtros e paginação na URL; o detalhe diferencia produto ausente, avaliação
ausente e falha recuperável; a criação exibe toast de sucesso e navega para o
detalhe criado. Edição e exclusão de avaliação ainda estão pendentes.

## Metadata e título obrigatório

Toda página deve resultar em:

```text
Nome da página | Nome do projeto
```

Centralize o nome do projeto e o template no layout:

```ts
import type { Metadata } from "next";

const appName = process.env.NEXT_PUBLIC_APP_NAME ?? "Project Starter";

export const metadata: Metadata = {
  title: {
    default: appName,
    template: `%s | ${appName}`,
  },
};
```

Em páginas filhas, informe somente o nome específico:

```ts
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Página de exemplo",
};
```

Resultado:

```text
Página de exemplo | Project Starter
```

### Página do mesmo segmento

O `title.template` de um layout não se aplica ao `page.tsx` do mesmo
segmento. Para a página raiz atual, use uma destas estratégias:

1. colocar as páginas sob um route group com layout que declara o template; ou
2. construir explicitamente o título completo da página raiz.

Não deixe a home como exceção silenciosa. O resultado visível no documento
deve seguir a mesma regra.

### Metadata dinâmica

Use `generateMetadata` quando o nome depende de parâmetros ou conteúdo. Valide
o valor recebido e forneça fallback previsível. Não inclua dados sensíveis,
identificadores internos ou conteúdo não confiável sem normalização.

Use `title.absolute` somente quando a página precisar conscientemente ignorar
o template. Isso é exceção e deve ser justificável.

Além do título, avalie:

- descrição única;
- canonical;
- Open Graph e Twitter image;
- `robots` e sitemap;
- ícones e manifest;
- metadata que não deva indexar páginas privadas.

## Estrutura mínima de página

Toda página deve:

- possuir `main`;
- ter título principal descritivo;
- manter hierarquia correta de headings;
- identificar a ação principal;
- usar componentes semânticos antes de ARIA;
- definir metadata;
- considerar todos os estados aplicáveis;
- funcionar com teclado e em telas pequenas.

## Estados visuais

Projete explicitamente:

| Estado            | Resultado esperado                        |
| ----------------- | ----------------------------------------- |
| carregando        | feedback estável e significativo          |
| sucesso com dados | conteúdo e ações disponíveis              |
| sucesso vazio     | explicação e próximo passo possível       |
| erro recuperável  | mensagem clara e ação de tentar novamente |
| erro permanente   | navegação segura para outra área          |
| sem permissão     | conteúdo protegido não é revelado         |
| ação em andamento | controles protegidos contra repetição     |

Skeleton deve representar aproximadamente o layout final; não use skeleton
genérico apenas para produzir movimento. Preserve espaço de imagens e conteúdo
assíncrono para evitar layout shift.

## Navegação

- Use `Link` para navegação interna.
- Use botão para ações e link para navegação.
- Não coloque elementos interativos dentro de outros elementos interativos.
- Mantenha o destino perceptível e o foco visível.
- Considere o comportamento de voltar e avançar.
- Coloque filtros compartilháveis na URL.
- Use rotas interceptadas para modais somente quando a URL compartilhável e a
  navegação do histórico realmente fizerem parte da experiência.

## Colocação

Componentes exclusivos podem permanecer em `_components` junto da rota.
Schemas, hooks e componentes reutilizados dentro de uma feature ficam em
`features/<dominio>`. Primitives visuais ficam em `components/ui`.

Não coloque tudo em `app` nem mova tudo para diretórios globais. A estrutura
deve comunicar alcance e responsabilidade.

## Critério de conclusão

Antes de concluir uma página, confirme:

- título no formato obrigatório;
- descrição quando aplicável;
- estados de loading, vazio e erro;
- responsividade;
- navegação por teclado;
- foco e mensagens acessíveis;
- ausência de segredo no bundle;
- uso consciente de Client Components;
- imagens, fontes e scripts otimizados;
- lint, typecheck, testes e build.
