# Integrações entre aplicações

Este diretório receberá a documentação dos fluxos que atravessam a API e uma ou
mais aplicações consumidoras.

Conforme as integrações forem definidas, a documentação poderá abordar:

- responsabilidades de cada lado da comunicação;
- protocolos, endpoints e configuração por ambiente;
- autenticação e propagação de identidade;
- contratos, serialização e formato de erros;
- compatibilidade e versionamento;
- tratamento de falhas;
- testes de integração e observabilidade.

Não duplique aqui detalhes internos da API ou de um app. Este espaço deve
documentar somente acordos, fluxos e dependências entre unidades diferentes.

## Acordos de segurança entre aplicações

Quando uma integração for implementada, documente aqui:

- como identidade e credenciais são transportadas;
- onde tokens ou cookies podem ser armazenados;
- origens CORS e uso de credentials por ambiente;
- necessidade e fluxo de proteção CSRF;
- renovação, expiração, revogação e logout;
- propagação de correlation ID;
- campos sensíveis que não atravessam a integração;
- comportamento do consumidor diante de `401`, `403`, `429` e indisponibilidade;
- limites e timeouts relevantes para web, mobile ou outro cliente.

A implementação interna dos controles continua em
[Segurança da API](../apps/api/security/README.md). O formato compartilhado de
requests, responses e erros continua em [Contratos](../contracts/README.md).
