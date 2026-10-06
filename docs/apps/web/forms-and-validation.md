# Formulários e validação

## Baseline

Formulários interativos devem usar:

- React Hook Form para estado, registro, submissão e erros;
- `@hookform/resolvers` com `zodResolver`;
- schemas de `@repo/contracts` quando formulário e operação compartilham
  verdadeiramente a mesma representação e semântica;
- primitives de formulário do design system.

Essas dependências estão instaladas no `@repo/web` e foram validadas com React
19 e Zod 4 nos formulários de criação e edição de Produto. Os filtros GET de
`/produtos` continuam sem React Hook Form: são controles nativos submetidos por
`next/form` e validados a partir da URL no Server Component.

## Implementação atual de Produto

- `ProdutoFormFields` concentra apenas os controles e grupos semânticos comuns;
- criação e edição mantêm schemas próprios, pois seus payloads e a semântica de
  ausência são diferentes;
- o formulário de edição envia somente campos marcados como alterados pelo
  React Hook Form;
- apagar um campo anulável no update produz `null`; deixar um campo intacto o
  mantém ausente do `PATCH`;
- erros da API cujo `campo` corresponde a um controle são exibidos junto dele e
  recebem foco; erros sem correspondência permanecem no feedback geral;
- `preco` e `pesoKg` usam máscara decimal preenchida da direita para a esquerda,
  com apresentação em reais e quilogramas;
- `datetime-local` representa a data no fuso local do navegador e o mapper a
  converte para ISO 8601 UTC no payload;
- datas e horários recebidos são formatados no fuso local para apresentação;
- o formulário inteiro fica protegido por `fieldset disabled` durante a
  mutation, evitando submissão duplicada sem propagar `disabled` manualmente a
  cada controle.

## Contrato não é automaticamente formulário

Não presuma:

```text
estado do formulário = body HTTP = output Zod = model do banco
```

Um formulário pode conter:

- confirmação de campo;
- seleção visual temporária;
- `FileList`, preview e estado de upload;
- etapas de wizard;
- switches que alteram campos exibidos;
- strings vazias que serão normalizadas;
- datas ou números representados como texto.

Quando a representação divergir, use schema ou tipo local de formulário e uma
conversão explícita para o contrato da operação. Reutilize primitives dos
contratos em vez de forçar equivalência do objeto inteiro.

## Input e output

Quando o schema transforma, aplica default, coercion, preprocess, pipe ou codec,
diferencie:

- `z.input<typeof Schema>`: valor aceito antes da validação;
- `z.output<typeof Schema>`: valor validado e normalizado.

O `defaultValues` do React Hook Form normalmente representa o input visual.
A função que executa a operação deve receber o output produzido pelo parse.

Não trate automaticamente como equivalentes:

| Valor               | Significado possível         |
| ------------------- | ---------------------------- |
| propriedade ausente | não informado ou não alterar |
| `undefined`         | ausência implícita           |
| `null`              | limpar ou ausência explícita |
| `""`                | controle textual vazio       |

## Estrutura

Um formulário de feature pode ser organizado em:

```text
features/<dominio>/
├── forms/
│   ├── recurso-form.tsx
│   ├── recurso-form.schema.ts
│   ├── recurso-form.mapper.ts
│   └── recurso-form.types.ts
└── api/
    ├── create-recurso.ts
    └── use-create-recurso.ts
```

Não crie mapper ou schema local se o contrato já atender exatamente o
formulário. Também não coloque chamada HTTP diretamente no componente visual;
use a operação e o hook documentados na integração.

## Submissão

Durante a submissão:

- valide pelo resolver;
- transforme para o contrato quando necessário;
- impeça submissões duplicadas;
- mantenha feedback perceptível;
- preserve valores diante de erro recuperável;
- mapeie erros de campos somente quando o formato estiver acordado;
- apresente erro geral quando não houver campo correspondente;
- não limpe o formulário antes da confirmação de sucesso;
- restaure foco ou navegue de forma previsível.

Não capture silenciosamente erros. A interface precisa diferenciar, quando
possível, validação, autenticação, autorização, conflito, limite e
indisponibilidade.

## Acessibilidade

Todo campo deve ter:

- label programaticamente associado;
- instrução antes do erro quando necessária;
- mensagem de erro vinculada ao controle;
- `aria-invalid` no controle inválido;
- foco visível;
- ordem de tabulação lógica;
- agrupamento semântico com `fieldset` e `legend` quando aplicável.

Ao falhar a submissão, direcione o foco ao primeiro campo inválido ou anuncie um
resumo de erros. Não use apenas cor, tooltip ou placeholder como explicação.

## Campos dinâmicos

- Preserve dados somente quando isso fizer sentido para o usuário.
- Não registre campos ocultos que possam enviar valores inesperados.
- Defina o comportamento de `shouldUnregister` conscientemente.
- Use identificadores estáveis em listas de campos.
- Confirme como defaults e reset funcionam no modo edição.
- Não use effects para sincronizar valores quando uma derivação ou API do React
  Hook Form resolver de forma mais clara.

## Arquivos

Valide no cliente tipo, quantidade e tamanho para feedback rápido, mas repita a
validação na API. Nunca confie no MIME informado pelo navegador como barreira de
segurança. Preview de arquivo deve liberar URLs temporárias quando não forem
mais usadas.

## Segurança

Validação cliente não autoriza operação nem torna o payload confiável. O backend
deve validar novamente o contrato e aplicar regras de negócio e permissão.

Não renderize conteúdo retornado pelo usuário como HTML. Não registre valores,
tokens, arquivos ou payloads sensíveis em console.

## Testes

Cubra:

- defaults;
- valores válidos;
- cada erro corrigível;
- transformação entre input e output;
- campos condicionais;
- submissão duplicada;
- erro geral e erro de campo;
- reset e edição;
- teclado e foco;
- arquivo, quando aplicável.
