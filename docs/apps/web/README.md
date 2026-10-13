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
- a página inicial foi preservada e possui acesso ao catálogo em `/produtos`;
- React Hook Form, `@hookform/resolvers` e Zod 4 sustentam os formulários de
  criação e edição de Produto e Avaliação de Produto;
- Tailwind CSS 4 e shadcn/ui formam o baseline visual;
- `components.json` usa o estilo `radix-nova`, tokens `neutral` e aliases locais;
- as primitives instaladas possuem consumidores atuais e incluem `AlertDialog`,
  `Badge`, `Button`, `Checkbox`, `Dialog`, `Field`, `Input`, `Label`,
  `RadioGroup`, `Select`, `Separator`, `Skeleton`, `Table`, `Textarea` e o
  `Toaster` do Sonner;
- TanStack Query 5 está configurado no segmento `/produtos`, com provider na
  menor fronteira cliente atual;
- existem clientes HTTP separados para navegador e servidor, operações e hooks
  próprios para listar, consultar, criar, atualizar e excluir Produto;
- `/produtos` possui filtros e paginação na URL, validação dos parâmetros,
  estados de loading, vazio, erro e sucesso, cards em telas estreitas e tabela
  em telas largas;
- `/produtos/novo`, `/produtos/[produtoId]` e
  `/produtos/[produtoId]/editar` completam o CRUD de Produto, incluindo
  formulários responsivos, máscaras decimais, datas locais, erros por campo,
  confirmação destrutiva e toasts de sucesso; create e update exibem a mensagem
  validada da API, enquanto delete usa mensagem local após `204 No Content`;
- o CRUD aninhado de avaliações está concluído: a Web lista avaliações com
  filtros e paginação na URL, consulta o detalhe individual, cria, edita e
  exclui uma avaliação;
- criação e edição usam seletor acessível de 1 a 5 estrelas, erros por campo,
  invalidação restrita ao `produtoId`, toast com a mensagem validada da API e
  navegação ao detalhe;
- a edição envia somente campos alterados, representa a limpeza do comentário
  com `null` e preserva `false` para recomendação;
- a exclusão valida os dois identificadores, confirma a ação em `AlertDialog`,
  trata `204 No Content`, remove somente o detalhe excluído, invalida apenas as
  listas do produto correspondente, usa toast local e retorna à coleção;
- links internos de criação e edição de Produto e Avaliação usam Parallel
  Routes e Intercepting Routes para abrir `Dialog` sobre a tela de origem;
  acesso direto e refresh das mesmas URLs preservam as páginas completas;
- o invólucro compartilhado protege pending e alterações não salvas, integra
  fechamento e histórico do navegador e mantém os estados dos formulários sem
  duplicar schemas, operações ou regras de cache;
- Vitest 5 e React Testing Library cobrem a infraestrutura HTTP, query client,
  operações, hooks, schemas, mappers, máscaras, listagem, detalhe, formulários,
  diálogos de formulário e exclusão e disparo dos toasts;
- Playwright Test cobre 17 cenários E2E no Chromium, incluindo home, listagem,
  criação, edição, exclusão, recuperação de falhas, modais roteáveis, histórico,
  refresh, foco, pending, viewport estreita e o CRUD de avaliações;
- `@axe-core/playwright` verifica na home violações automatizáveis de
  acessibilidade WCAG A e AA; teclado, zoom, leitores de tela e demais aspectos
  não automatizáveis continuam dependendo de revisão manual;
- os E2E usam fixtures validadas por `@repo/contracts` e um mock de rede estrito
  que falha quando uma request esperada não ocorre ou uma request inesperada é
  enviada;
- a suíte E2E executa contra o build de produção do Next.js, localmente e no CI.

O trabalho do domínio Produto foi dividido em entregas verificáveis.
`WEB-001`, `WEB-002`, `WEB-003`, `WEB-003A` e `WEB-004` estão concluídas. A
próxima entrega é `WEB-005`, dedicada a endurecer e medir o exemplo público sem
adicionar login, usuários, sessão ou autorização ao domínio didático, conforme
o [roadmap da aplicação Web](./roadmap.md). Os requisitos para aplicações
derivadas autenticadas permanecem no baseline de segurança e não serão tratados
como concluídos pelo exemplo público. O estado operacional e a ordem exata de
continuação estão no [handoff](./handoff.md).

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
| Entregas, estado e critérios de aceite        | [Roadmap](./roadmap.md)                                                     |
| Estado atual e próxima entrega                | [Handoff](./handoff.md)                                                     |
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
- navegadores E2E adicionais e serviço de observabilidade; Vitest e React
  Testing Library formam o baseline unitário e de componentes, enquanto
  Playwright com Chromium forma o baseline E2E atual;
- mecanismo de autenticação, autorização e proteção CSRF; credenciais no
  navegador já seguem o baseline de cookie `HttpOnly`;
- política de analytics, consentimento e rastreamento;
- internacionalização e idiomas suportados;
- metas numéricas de bundle e Core Web Vitals;
- suporte PWA, offline ou navegadores além do baseline do Next.js.

Quando uma decisão afetar API, autenticação, contratos ou comportamento entre
aplicações, registre-a também na documentação de
[Integrações](../../integrations/README.md).
