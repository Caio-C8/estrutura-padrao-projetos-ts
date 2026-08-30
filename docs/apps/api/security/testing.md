# Testes de segurança

## Durante a feature

Antes de implementar uma rota, registre uma matriz de acesso:

| Rota                | Pública | Identidade          | Permissão        | Regra do recurso | Campos sensíveis      | Limite especial |
| ------------------- | ------- | ------------------- | ---------------- | ---------------- | --------------------- | --------------- |
| `POST /recursos`    | não     | política do projeto | `recurso:create` | —                | nenhum                | padrão          |
| `GET /recursos/:id` | não     | política do projeto | `recurso:read`   | escopo permitido | campo interno omitido | padrão          |

Substitua os exemplos pelas decisões reais. Uma coluna sem decisão deve ser
tratada como pendência, não como autorização implícita.

## Testes mínimos por controle

### Autenticação

- credencial ausente, inválida, expirada e revogada;
- login e renovação emitem credencial de navegador com `HttpOnly` e os atributos
  `Secure`, `SameSite`, `Path`, `Domain` e prefixo definidos pelo ambiente;
- logout expira a credencial no servidor;
- nenhum fluxo exige ler credencial de autenticação por JavaScript;
- proteção CSRF cobre as operações autenticadas que alteram estado;
- rota pública acessível sem relaxar rotas protegidas;
- identidade anexada à requisição sem campos desnecessários;
- respostas sem enumeração indevida de contas.

### Autorização

- identidade sem permissão;
- acesso a ID pertencente a outro usuário ou tenant;
- leitura e alteração de propriedades proibidas;
- tentativa de enviar owner, role ou status protegido no body;
- mudança de estado fora do fluxo permitido.

### Boundary e disponibilidade

- body, query e params inválidos;
- arrays, strings, uploads e paginações no limite e acima dele;
- rate limiting nas rotas críticas;
- timeout e falha de serviço externo;
- URL ou redirecionamento não permitido quando houver chamadas externas.

### Saída e erros

- mapper não retorna campos internos;
- erro não contém stack, SQL, secrets ou payload sensível;
- logs passam pela política de redaction;
- contrato HTTP permanece estável.

## Escopos de teste

- teste unitário para policy, Guard, Interceptor, Filter e mapper;
- teste de integração para autenticação, persistência e configuração;
- teste E2E para composição real e ordem dos componentes globais;
- revisão de dependências e configuração no CI quando as ferramentas forem
  escolhidas pelo projeto.

Use os recursos de override do módulo de testes NestJS apenas quando o objetivo
for isolar uma unidade. Ao validar segurança E2E, inicialize os componentes reais
que formam a barreira avaliada.

## Conclusão

Não marque uma feature como concluída enquanto houver uma rota sem decisão de
acesso, um controle sem teste proporcional ao risco ou uma exceção de segurança
sem justificativa.
