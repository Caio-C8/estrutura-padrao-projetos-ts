# Erros, cache, cancelamento e testes

## ApiError

O cliente deve normalizar falhas HTTP em um tipo interno previsível, por
exemplo:

```text
ApiError
├── status
├── code público, quando existir
├── message segura
├── fieldErrors, quando acordado
├── correlationId, quando permitido
└── cause interno não exibido
```

O formato definitivo depende do contrato público de erros. Não exponha stack,
query, path interno, credencial ou mensagem bruta de infraestrutura.

## Categorias para a interface

A integração deve permitir distinguir:

- falha de validação;
- não autenticado;
- não autorizado;
- não encontrado;
- conflito;
- limite de requisições;
- indisponibilidade;
- timeout ou cancelamento;
- response inválida;
- erro inesperado.

A página escolhe como apresentar. Não transforme todas em “Algo deu errado” na
infraestrutura, nem revele detalhes internos.

## Responses

- Trate somente `response.ok` como sucesso, salvo contrato explícito.
- Respostas `204` ou sem corpo não devem tentar fazer parse JSON.
- Valide JSON com schema de response quando disponível.
- Falha de parse ou schema é erro de integração, não dado vazio.
- Preserve status e correlation ID permitidos.
- Não faça cast para esconder incompatibilidade.

## Timeout e cancelamento

Use `AbortSignal` ou capacidade equivalente:

- timeout não é igual a resposta HTTP;
- cancelamento solicitado pelo consumidor pode não exigir mensagem de erro;
- uma resposta obsoleta não deve sobrescrever estado atual;
- hooks devem limpar subscriptions e requisições quando a biblioteca exigir;
- operações longas precisam de UX adequada, não apenas timeout maior.

## Retry

Não aplique a mesma política a tudo:

- leitura idempotente pode ter retry limitado;
- mutation pode causar duplicidade;
- `429` deve respeitar política e, quando aplicável, `Retry-After`;
- erro de validação, autenticação ou autorização não deve entrar em loop;
- backoff e limite precisam ser definidos.

## Cache

Antes de cachear, determine:

- público ou privado;
- escopo de usuário;
- tolerância a desatualização;
- evento de invalidação;
- comportamento após mutation;
- diferença entre cache do Next.js e cache da biblioteca cliente;
- risco de servir dados de uma identidade a outra.

Não marque response autenticada como cache público. Não invalide toda a
aplicação por conveniência.

## Autenticação e CSRF

O baseline para navegadores é obrigatório: credenciais de autenticação ficam em
cookies `HttpOnly` e nunca em `localStorage`, `sessionStorage` ou estado
persistido legível por JavaScript. O mecanismo de autenticação ainda pode ser
sessão, token ou provedor externo; essa escolha não altera a proteção do local
em que a credencial é mantida no navegador.

Documente:

- onde a credencial existe;
- qual servidor cria, renova e expira o cookie;
- quem encaminha a credencial entre Next.js e API;
- uso de `credentials` e comportamento por origem;
- `SameSite`, `Secure`, `HttpOnly`, `Path`, `Domain` e prefixo do cookie;
- proteção CSRF;
- renovação, expiração, revogação e logout;
- comportamento em `401` e `403`;
- concorrência de múltiplas renovações;
- redirecionamento sem loop.

O browser não lê a credencial para montar `Authorization`. Para operações no
cliente, o navegador envia o cookie conforme a política de origem. Em Server
Components, Server Actions e Route Handlers, encaminhe somente o cookie ou
header necessário para a operação; o `fetch` server não herda automaticamente
as credenciais recebidas pelo Next.js.

Não coloque credencial por usuário nos headers mutáveis de uma instância HTTP
global, pois requisições concorrentes poderiam compartilhar identidade. Passe a
credencial no escopo da requisição ou crie um cliente request-scoped quando a
arquitetura exigir.

`HttpOnly` não elimina CSRF. Se um token CSRF precisar ser lido pelo JavaScript,
ele pode usar um cookie separado e não `HttpOnly`, mas nunca pode autenticar a
sessão. A credencial continua protegida. Não implemente refresh interceptor ou
fluxo CSRF antes de definir expiração, concorrência, rotação e responsabilidade
entre web e API.

## Observabilidade

Registre somente:

- operação;
- status;
- duração;
- correlation ID permitido;
- categoria de falha;
- contexto não sensível necessário.

Nunca registre body completo por padrão, token, cookie, senha, arquivo ou
response pessoal. O browser não é local seguro para segredos.

## Testes de operação

Confirme:

- base URL e path;
- método;
- query encoded;
- headers necessários;
- body e FormData;
- response válida;
- response incompatível com schema;
- cada status relevante;
- resposta sem corpo;
- timeout e cancelamento;
- ausência de segredo.

## Testes de hook

Confirme:

- parâmetros e query key;
- estados;
- cancelamento;
- retry;
- invalidação;
- chamadas duplicadas;
- erro normalizado;
- comportamento depois de unmount.

## Testes E2E

Cubra fluxos críticos:

- sucesso;
- validação;
- sessão ausente ou expirada;
- cookie de autenticação com `HttpOnly` e demais atributos esperados;
- renovação e logout sem exposição da credencial ao JavaScript;
- rejeição de mutation sem proteção CSRF válida quando aplicável;
- sem permissão;
- conflito;
- limite;
- indisponibilidade;
- retry manual;
- navegação e preservação de estado;
- ausência de vazamento em erro.

Mocks não substituem pelo menos uma verificação real do acordo entre contratos,
web e API.
