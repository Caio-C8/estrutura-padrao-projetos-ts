# Segurança da aplicação web

Segurança deve ser considerada durante a construção da página. Este documento
cobre riscos internos do app web. Transporte de identidade, cookies, tokens,
CSRF e respostas da API pertencem também à
[Integração web–API](../../integrations/web-api/README.md).

## Estado atual

As rotas de Produto e Avaliação são públicas somente no exemplo didático. Não
há autenticação, autorização, cookie de sessão ou proteção CSRF implementados.
Isso é uma limitação consciente e não um baseline seguro para produção.

`browserApiClient` usa apenas a origem relativa `/api/backend` e não acessa
`API_INTERNAL_URL`. `serverApiClient` importa `server-only`. A interface valida
responses e apresenta mensagens públicas, sem expor o corpo bruto ou o `cause`
interno dos erros.

`WEB-005` endurecerá e medirá esse exemplo público, mas não implementará login,
usuários, sessão, autenticação, autorização nem CSRF. Essa delimitação não
remove o baseline deste documento: uma aplicação derivada que introduza
identidade ou dados protegidos deve aplicar e testar os controles correspondentes
antes de produção. CORS, CSP e a ocultação de controles na interface não
transformam uma mutação pública em uma operação autorizada.

## Fronteira server e client

- Segredos nunca entram em Client Components.
- Somente valores intencionalmente públicos usam prefixo `NEXT_PUBLIC_`.
- Módulos com credenciais ou URL interna devem importar `server-only`.
- Não faça detecção de `window` para misturar código sensível de servidor e
  navegador no mesmo módulo.
- Props enviadas a Client Components devem conter somente o necessário.
- Não serialize models, sessão inteira ou dados internos por conveniência.

Esconder um segredo em variável sem `NEXT_PUBLIC_` não corrige uma arquitetura
que importa o módulo server-only no cliente. Use fronteiras explícitas.

## Conteúdo não confiável

- React escapa strings por padrão; preserve esse comportamento.
- Não use `dangerouslySetInnerHTML` sem necessidade, sanitização adequada,
  testes e justificativa.
- Valide URLs externas, esquemas e destinos antes de renderizar links, imagens
  ou embeds.
- Não transforme texto de usuário em código, seletor, HTML ou script.
- Arquivos, Markdown e conteúdo rico exigem política específica.
- Mensagens de erro não devem reproduzir conteúdo sensível da API.

## Autorização

Ocultar botão, menu ou rota melhora UX, mas não autoriza uma operação. A API
continua responsável por autenticação e autorização.

Evite revelar por diferenças de tela:

- existência de recurso protegido;
- identificadores internos;
- campos não permitidos;
- distinção desnecessária entre usuário inexistente e credencial incorreta.

## Credenciais e armazenamento

Credenciais de autenticação usadas no navegador devem permanecer exclusivamente
em cookies `HttpOnly`. Não armazene identificador de sessão, access token ou
refresh token em `localStorage`, `sessionStorage`, estado React persistido ou
outro armazenamento legível por JavaScript.

O cliente não lê nem remove a credencial diretamente. Login, renovação e logout
devem passar pelo servidor responsável, e a identidade atual deve ser obtida
por uma operação autenticada, como `GET /auth/me`, quando esse endpoint fizer
parte do contrato do projeto.

Um cookie que não autentica, como preferência visual, não recebe `HttpOnly`
automaticamente se precisar ser lido no navegador. Um token CSRF pode exigir o
mesmo tratamento dependendo do padrão escolhido, mas jamais pode substituir a
credencial `HttpOnly`.

`HttpOnly` não substitui proteção CSRF, `Secure`, `SameSite`, expiração,
revogação ou defesa contra XSS. O fluxo completo pertence à
[Integração web–API](../../integrations/web-api/README.md).

Não registre tokens, cookies, payloads, arquivos pessoais ou headers de
autorização em console, analytics ou relatório de erro.

## Navegação e conteúdo externo

- Links externos devem deixar o destino claro.
- Ao abrir nova aba, preserve proteção contra controle da página de origem.
- Iframes exigem origem permitida, sandbox e política de recursos.
- Scripts de terceiros devem ser mínimos, revisados e carregados com
  `next/script` quando aplicável.
- Analytics e trackers exigem política de consentimento do projeto.

## Headers e CSP

Defina uma política de headers antes da produção:

- Content Security Policy;
- proteção contra framing;
- política de referrer;
- permissions policy;
- content type sniffing;
- HSTS no ponto que termina TLS.

CSP reduz impacto de XSS e injeção, mas sua estratégia afeta renderização,
nonces, cache e scripts de terceiros. Não copie uma política sem testar em
desenvolvimento e produção.

## Dependências

- Adicione somente dependências necessárias.
- Confira fonte, manutenção, licença e vulnerabilidades conhecidas.
- Revise código gerado por CLIs, inclusive shadcn/ui.
- Não use versão flutuante no código instalado.
- Não atualize major automaticamente sem avaliar migração.

## Formulários e upload

Validação cliente é feedback, não controle de segurança. A API deve validar
novamente tamanho, tipo, formato, permissão e regra de negócio.

Evite preencher campos sensíveis indevidamente, preserve autocomplete quando
ele aumenta segurança e não exponha senha em logs ou estado persistente.

## Checklist

No exemplo público, os itens de autenticação, autorização e CSRF abaixo estão
fora do escopo por decisão explícita; eles não devem ser interpretados como
implementados. Os demais itens já se aplicam ao exemplo, e o conjunto completo
passa a ser aplicável quando um projeto derivado introduzir identidade ou dados
protegidos.

- nenhum segredo no bundle;
- dados passados ao cliente minimizados;
- HTML não confiável não renderizado;
- URLs externas validadas;
- autorização não depende da interface;
- mecanismo de autenticação e fluxo CSRF seguem decisão de integração;
- credenciais de autenticação do navegador não são legíveis por JavaScript;
- scripts e embeds revisados;
- headers e CSP avaliados;
- erros sem detalhes internos;
- dependências justificadas.
