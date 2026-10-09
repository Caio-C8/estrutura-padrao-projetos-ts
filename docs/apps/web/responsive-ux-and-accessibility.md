# Responsividade, UX e acessibilidade

## Responsividade como requisito

Toda tela deve funcionar em viewport estreita, intermediária e ampla. Adote
mobile-first e expanda o layout conforme houver espaço.

Responsividade não significa apenas diminuir elementos. O conteúdo deve:

- reordenar quando necessário;
- quebrar linhas sem sobreposição;
- preservar leitura e ação principal;
- evitar scroll horizontal da página;
- adaptar tabelas, dialogs e navegação;
- suportar zoom e fontes maiores;
- considerar teclado virtual e safe areas em dispositivos móveis.

Não escolha breakpoints por modelos específicos de aparelho. Use o ponto em que
o conteúdo deixa de funcionar como critério e mantenha os tokens definidos pelo
sistema visual.

## Estado atual dos fluxos de Produto e Avaliação

- filtros empilham em telas estreitas e expandem progressivamente;
- produtos usam cards abaixo do breakpoint da tabela;
- a página não depende de rolagem horizontal para a experiência principal;
- paginação e ações permanecem acessíveis por teclado;
- foco é visível;
- campos de filtro inválidos usam borda, label e mensagem em cor destrutiva,
  além de `aria-invalid` e `aria-describedby`;
- valores informados são preservados após erro de URL.
- detalhe e formulários usam grids que voltam a uma coluna antes de comprometer
  labels, mensagens e ações;
- criação e edição associam erros a seus campos com `aria-invalid` e
  `aria-describedby` e movem o foco para o primeiro erro retornado pela API;
- campos monetários e de peso apresentam unidade visível sem alterar o valor
  semântico enviado ao backend;
- datas com horário são apresentadas no fuso local, sem exigir que o usuário
  conheça a representação UTC da integração;
- a exclusão usa `AlertDialog`, informa que as avaliações também serão
  removidas, bloqueia repetição durante o pending e mantém o erro recuperável no
  próprio contexto;
- confirmações de criação e atualização usam a mensagem de sucesso validada da
  API em toast; após o `204`, a exclusão usa título e descrição definidos pela
  Web;
- criação e edição de avaliação reutilizam o mesmo grupo responsivo de campos;
  as ações empilham em telas estreitas e o conteúdo volta a uma coluna antes de
  comprometer labels ou mensagens;
- o seletor de nota mantém alvos de 44 px, seleção exclusiva, nomes acessíveis,
  foco visível, teclado e anúncio textual da quantidade de estrelas;
- a edição de avaliação preserva valores em falha recuperável, impede envio sem
  mudanças e mantém erros da API junto ao respectivo campo;
- o `Toaster` global preserva a confirmação durante a navegação interna sem
  inserir estado transitório na URL.

## Padrões adaptáveis

- Grids reduzem colunas progressivamente.
- Formulários empilham campos antes de comprometer labels e alvos.
- Tabelas precisam de estratégia explícita: scroll controlado, colunas
  prioritárias, cards ou outra representação adequada.
- Dialogs extensos podem se tornar drawers ou páginas em telas pequenas.
- Sidebars precisam de alternativa navegável por toque e teclado.
- Ação apenas em hover também deve existir por foco, toque ou controle visível.
- Imagens preservam proporção e espaço reservado.

## Estados e feedback

Toda interação deve comunicar o que aconteceu:

- loading;
- progresso quando mensurável;
- sucesso;
- erro e forma de recuperação;
- estado vazio;
- disabled e motivo quando não for evidente;
- confirmação antes de ação destrutiva;
- conclusão de ação assíncrona.

Não desabilite controles sem explicação. Não use toast como único lugar para
uma informação necessária à correção do formulário.

Toast é adequado para confirmar uma ação concluída que não exige decisão nem
correção. Erros por campo, falhas que exigem nova tentativa e consequências de
ações destrutivas continuam visíveis no contexto em que o usuário pode agir.

## UX de formulários

- Preserve valores após erro recuperável.
- Impeça submissão repetida sem bloquear navegação desnecessariamente.
- Use tipos de input e autocomplete apropriados.
- Não valide agressivamente a cada tecla quando isso gerar ruído.
- Posicione erros junto ao campo e ofereça resumo quando o formulário for
  extenso.
- Informe requisitos antes da submissão.
- Confirme ações destrutivas de acordo com o risco.
- Avise sobre perda de alterações somente quando houver dados realmente
  modificados.

## HTML semântico

Prefira elementos nativos:

- `button` para ação;
- `a` ou `Link` para navegação;
- `nav`, `main`, `header`, `footer`, `section` e `aside` conforme
  significado;
- headings em hierarquia lógica;
- `label`, `fieldset` e `legend` em formulários;
- listas e tabelas quando os dados possuírem essa estrutura.

Use ARIA para complementar uma semântica existente. Não use ARIA como primeira
opção para reconstruir comportamento que um elemento nativo já oferece.

## Teclado e foco

- Toda ação deve funcionar sem mouse.
- A ordem de foco acompanha a ordem visual e semântica.
- Não use `tabIndex` positivo.
- O foco precisa ser visível.
- Dialogs prendem foco enquanto abertos e o devolvem ao gatilho.
- Após navegação, erro ou remoção, mova o foco somente quando melhorar a
  compreensão.
- Skip link deve ser considerado em layouts com navegação repetitiva.

## Conteúdo e percepção

- Não transmita significado somente por cor.
- Mantenha contraste adequado em texto, bordas e foco.
- Ações apenas com ícone exigem nome acessível.
- Imagens informativas exigem texto alternativo; decorativas usam alt vazio.
- Mensagens devem explicar problema e recuperação em linguagem direta.
- Respeite `prefers-reduced-motion`.
- Animação não pode impedir leitura ou interação.

## Títulos e anúncios de rota

Cada página deve ter metadata e `h1` descritivos. O Next.js usa o título do
documento, depois o `h1`, para anunciar mudanças de rota a tecnologias
assistivas. Isso reforça a regra de título:

```text
Nome da página | Nome do projeto
```

## Validação

Verifique ao menos:

- viewport estreita, intermediária e ampla;
- zoom de 200%;
- teclado;
- focus visible;
- conteúdo muito curto e muito longo;
- loading, vazio, erro e disabled;
- orientação retrato e paisagem quando relevante;
- reduced motion;
- contraste;
- leitor de tela nos fluxos críticos quando a ferramenta estiver disponível.

Automação ajuda, mas não substitui inspeção visual, navegação por teclado e
avaliação do fluxo.
