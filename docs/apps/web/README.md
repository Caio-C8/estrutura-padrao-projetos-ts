# Desenvolvimento da aplicação web

Este diretório documenta o padrão de construção da aplicação Next.js
`apps/web` para pessoas e agentes. O foco é a estrutura interna das páginas,
seus componentes, formulários, estados visuais, acessibilidade, segurança,
desempenho e testes.

## Escopo

Esta documentação responde como uma página deve ser construída. A comunicação
entre a aplicação web e a API possui documentação própria em
[Integração web–API](../../integrations/web-api/README.md).

A separação é documental, não uma restrição de execução. Uma mesma tarefa pode
implementar a interface e sua integração em sequência ou em paralelo. Nesse
caso, todas as instruções das duas áreas devem ser lidas e aplicadas.

## Estado atual

No estado atual da base:

- o app usa Next.js 16, React 19 e App Router;
- páginas e layouts são Server Components por padrão;
- `@repo/contracts` já é dependência e está em `transpilePackages`;
- existe somente a página inicial da estrutura padrão;
- React Hook Form e `@hookform/resolvers` ainda não estão instalados;
- shadcn/ui ainda não foi inicializado e não existe `components.json`;
- a estratégia de testes de componentes e E2E ainda não foi implementada;
- o cliente padronizado da API e os hooks de integração ainda não existem.

As regras descritas nestes documentos representam o baseline desejado. Não
presuma que uma dependência, diretório ou componente já exista sem conferir o
código.

## Princípios

- Prefira Server Components e crie a menor fronteira Client necessária.
- Componentize por responsabilidade, reutilização ou isolamento de
  complexidade, não para eliminar qualquer repetição de JSX.
- Use componentes padronizados antes de criar uma nova primitive.
- Trate responsividade, UX, acessibilidade, segurança e desempenho como parte da
  implementação, não como revisão posterior.
- Modele estados de carregamento, vazio, erro, sucesso e indisponibilidade.
- Validação no navegador melhora a experiência, mas não substitui a API.
- Não introduza biblioteca, estado global ou abstração sem necessidade
  concreta.
- Meça desempenho; não use “leve” como critério subjetivo.

## Metadata obrigatória

Toda página deve produzir o título:

```text
Nome da página | Nome do projeto
```

O nome do projeto vem de `NEXT_PUBLIC_APP_NAME`. O layout raiz deve definir
`title.default` e `title.template`, e cada página deve declarar apenas seu
nome específico quando estiver sob esse template. A página do mesmo segmento
do layout que declara o template exige tratamento explícito, pois o Next.js não
aplica o template ao `page.tsx` do mesmo segmento.

Detalhes e exemplos estão em [Páginas e rotas](./pages-and-routing.md).

## Documentos

| Assunto                                       | Documento                                                                   |
| --------------------------------------------- | --------------------------------------------------------------------------- |
| Organização, renderização e estado            | [Arquitetura](./architecture.md)                                            |
| Rotas, layouts, metadata e estados de página  | [Páginas e rotas](./pages-and-routing.md)                                   |
| Componentização, shadcn/ui e design system    | [Componentes e design system](./components-and-design-system.md)            |
| React Hook Form e contratos Zod               | [Formulários e validação](./forms-and-validation.md)                        |
| Layout adaptável, UX e acessibilidade         | [Responsividade, UX e acessibilidade](./responsive-ux-and-accessibility.md) |
| Controles do navegador e código client/server | [Segurança](./security.md)                                                  |
| Bundle, imagens, fontes e métricas            | [Desempenho](./performance.md)                                              |
| Ordem de trabalho e verificações              | [Testes e workflow](./testing-and-workflow.md)                              |
| Fontes oficiais                               | [Referências](./references.md)                                              |

## Decisões que continuam dependentes do projeto

Não escolha antecipadamente sem contexto:

- identidade visual, temas e tokens definitivos;
- breakpoints específicos além do baseline da ferramenta de estilos;
- biblioteca de cache remoto para Client Components;
- runner de testes, ferramenta E2E e serviço de observabilidade;
- mecanismo de autenticação, autorização e proteção CSRF; credenciais no
  navegador já seguem o baseline de cookie `HttpOnly`;
- política de analytics, consentimento e rastreamento;
- internacionalização e idiomas suportados;
- metas numéricas de bundle e Core Web Vitals;
- suporte PWA, offline ou navegadores além do baseline do Next.js.

Quando uma decisão afetar API, autenticação, contratos ou comportamento entre
aplicações, registre-a também na documentação de
[Integrações](../../integrations/README.md).
