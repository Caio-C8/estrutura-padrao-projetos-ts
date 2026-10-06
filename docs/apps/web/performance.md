# Desempenho

“Leve” deve ser observado por bundle, quantidade de JavaScript cliente,
estabilidade visual, tempo de resposta e Core Web Vitals. Não aceite otimização
ou regressão apenas por impressão.

Siga também o [baseline transversal](../../performance/README.md), que define
métricas, percentis, comparação e responsabilidades das demais camadas.

## Estado atual

O provider do TanStack Query permanece limitado ao segmento `/produtos`. A
lista é paginada e o trabalho controlado pela URL possui limite máximo de 50
itens; a interface oferece 10, 20 ou 50. Hooks de leitura encaminham
cancelamento e permitem no máximo uma repetição transitória, enquanto mutations
não possuem retry.

As páginas continuam Server Components. Somente listagem, detalhe,
formulários, diálogo e feedback que usam hooks, eventos ou APIs do navegador
entram no grafo cliente. Operações e campos compartilhados evitam duplicar
infraestrutura ou formulários inteiros, sem adicionar estado global.

Não foi introduzido prefetch no servidor, hydration, `staleTime`, cache
persistente ou virtualização sem um gargalo medido. No build atual, `/` e
`/produtos/novo` são estáticas; `/produtos`, `/produtos/[produtoId]` e
`/produtos/[produtoId]/editar` são dinâmicas.

## Métricas mínimas

Use dados de campo no percentil 75, separados ao menos entre mobile e desktop,
quando houver volume suficiente. O baseline público dos Core Web Vitals é:

| Métrica | Experiência considerada boa |
| ------- | --------------------------- |
| LCP     | até 2,5 segundos            |
| INP     | até 200 milissegundos       |
| CLS     | até 0,1                     |

Esses limites classificam experiência e não substituem metas do projeto.
Acompanhe também:

- TTFB e duração de renderização server quando aplicável;
- JavaScript e bytes transferidos por rota;
- quantidade de requests e chamadas duplicadas;
- duração e falhas das operações de API;
- cache hit/miss no Next.js e no cliente quando esses caches existirem;
- tamanho de imagens, fontes e scripts de terceiros;
- memória e long tasks no navegador em fluxos críticos.

Teste de laboratório ajuda a diagnosticar, mas não substitui dados de campo.
Registre versão ou deploy para relacionar uma regressão à mudança que a causou.

## Renderização

- Prefira Server Components.
- Coloque `"use client"` na menor fronteira interativa.
- Não envolva toda a aplicação em providers quando poucos segmentos precisam
  deles.
- Use layouts para compartilhar UI estável.
- Use Suspense e loading significativo para streaming.
- Inicie operações independentes em paralelo quando a integração permitir.
- Defina cache e revalidação conscientemente; não presuma defaults antigos do
  Next.js.

## JavaScript cliente

- Não adicione biblioteca para uma função pequena da plataforma.
- Importe entrypoints específicos quando a biblioteca permitir.
- Carregue componente pesado somente onde usado.
- Use import dinâmico para editores, gráficos ou recursos raros quando houver
  benefício mensurável.
- Não aplique `useMemo`, `useCallback` ou memoização indiscriminadamente.
- Remova effects usados apenas para derivar estado.
- Evite duplicar a mesma biblioteca por versões ou alternativas diferentes.

## Imagens

- Use `next/image` quando aplicável.
- Informe dimensões ou preserve proporção.
- Use `sizes` coerente com o layout responsivo.
- Não envie imagem muito maior que sua exibição.
- Comprima assets e prefira formatos adequados.
- Defina `priority` somente para conteúdo crítico acima da dobra.
- Use alt significativo sem repetir texto ao redor.

## Fontes

- Use `next/font` para self-host e redução de layout shift.
- Limite famílias, pesos e subconjuntos.
- Defina fallback compatível.
- Não carregue um peso para cada pequena diferença visual.

## Scripts e terceiros

- Use `next/script` e estratégia adequada.
- Não bloqueie a thread principal com script não essencial.
- Adie analytics e widgets quando possível.
- Meça o custo de chat, mapa, editor, captcha e embeds.
- Remova scripts sem uso e revise implicações de privacidade e CSP.

## CSS e layout

- Evite CSS global para comportamento local.
- Reutilize tokens em vez de repetir valores semânticos.
- Preserve espaço para conteúdo assíncrono.
- Evite animações de propriedades que causam layout quando transform e opacity
  atendem o caso.
- Virtualize listas somente quando volume e medição justificarem a complexidade.

## Rede

A estratégia detalhada está na integração, mas a página deve:

- evitar waterfalls causados por dependências sequenciais artificiais;
- não refazer a mesma operação sem necessidade;
- cancelar ou ignorar resultado obsoleto quando aplicável;
- paginar dados volumosos;
- fornecer feedback durante latência;
- não fazer retry agressivo de mutações.

## Medição

Antes de produção:

- execute `next build`;
- inspecione páginas estáticas e dinâmicas inesperadas;
- meça Lighthouse em janela anônima;
- acompanhe Core Web Vitals com dados de campo quando disponíveis;
- analise o bundle após dependência relevante;
- teste rede e CPU limitadas;
- compare antes e depois de uma otimização.

Depois de produção:

- acompanhe p75 de LCP, INP e CLS com dados reais;
- segmente mobile e desktop sem labels sensíveis ou de alta cardinalidade;
- relacione versão, rota normalizada e ambiente;
- investigue regressões junto da API e das dependências, não somente no bundle;
- preserve um orçamento explícito para cada fluxo crítico.

Metas numéricas pertencem ao projeto. O baseline exige medição, justificativa
para regressões e ausência de dependência pesada introduzida sem análise.

## Checklist

- Server Component por padrão;
- Client boundary mínima;
- nenhuma dependência desnecessária;
- imagens e fontes otimizadas;
- script de terceiro justificado;
- loading sem layout shift relevante;
- operações paralelas quando independentes;
- build e bundle revisados;
- fluxo principal medido em condição realista;
- Core Web Vitals medidos ou plano de coleta documentado;
- regressões comparadas por versão ou deploy.
