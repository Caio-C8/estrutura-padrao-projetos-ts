# Autenticação

## Responsabilidade

Autenticação estabelece quem ou qual sistema fez a requisição. Ela não decide,
sozinha, se a identidade pode executar uma ação sobre determinado recurso.

Antes de implementar, defina:

- tipo de cliente: navegador, mobile, serviço ou combinação;
- mecanismo: sessão, bearer token, provedor externo ou outro;
- transporte e armazenamento das credenciais;
- expiração, renovação, revogação e rotação;
- proteção contra força bruta e enumeração de contas;
- formato mínimo da identidade anexada à requisição.

Não escolha JWT ou Passport apenas porque aparecem em um exemplo do framework.

## Módulo de autenticação

Quando houver autenticação, mantenha-a como domínio explícito:

```text
apps/api/src/modules/auth/
├── decorators/
├── dtos/
├── guards/
├── strategies/
├── auth.controller.ts
├── auth.module.ts
└── auth.service.ts
```

Crie somente os diretórios utilizados. O módulo pode depender do service que
representa identidades, mas deve respeitar os limites entre domínios.

## Strategies

Strategies são adaptadores de um mecanismo de autenticação. Se Passport for a
solução escolhida, uma strategy deve:

- extrair a credencial no formato configurado;
- verificar sua validade por meio do service apropriado;
- produzir uma identidade mínima e tipada;
- rejeitar credenciais inválidas sem revelar detalhes sensíveis.

O Guard aciona a strategy e decide se a rota pode continuar. Não coloque regras
de negócio extensas, montagem de response ou emissão de credenciais dentro da
strategy.

A integração com Passport é opcional e deve seguir a
[receita oficial do NestJS](https://docs.nestjs.com/recipes/passport) caso seja
adotada.

## Credenciais e respostas

- nunca registre senha, token, cookie ou header de autorização;
- compare secrets e senhas com mecanismos apropriados, não como texto puro;
- não retorne hashes ou informações internas da identidade;
- evite respostas diferentes que permitam enumerar contas sem necessidade;
- mantenha chaves e secrets fora do código e permita rotação;
- documente como web, mobile e outros clientes enviam e renovam credenciais em
  [Integrações](../../../integrations/README.md).

## Status HTTP

Como regra geral:

- `401 Unauthorized`: identidade ausente ou autenticação inválida;
- `403 Forbidden`: identidade reconhecida, mas sem permissão.

O contrato público de erro deve permanecer estável e não revelar o motivo
interno além do necessário.
