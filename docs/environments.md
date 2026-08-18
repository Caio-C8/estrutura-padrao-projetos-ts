# Ambientes

## Convenções

- `NODE_ENV` controla otimizações dos frameworks e deve ser `development`, `test` ou `production`.
- `APP_ENV` identifica o ambiente de negócio e pode ser `development`, `staging`, `production` ou `test`.
- Homologação usa `NODE_ENV=production` e `APP_ENV=staging`.
- Variáveis `NEXT_PUBLIC_*` são incorporadas ao bundle do navegador e nunca podem conter segredos.

## Arquivos locais

| Ambiente        | Template versionado        | Arquivo ignorado   |
| --------------- | -------------------------- | ------------------ |
| Desenvolvimento | `.env.development.example` | `.env.development` |
| Homologação     | `.env.staging.example`     | `.env.staging`     |
| Produção        | `.env.production.example`  | `.env.production`  |

Os templates são documentação e devem usar valores fictícios seguros. Os arquivos sem `.example` nunca devem ser commitados.

## Portas

`WEB_PORT` e `API_PORT` são portas internas dos processos. `WEB_PUBLISHED_PORT`, `API_PUBLISHED_PORT` e `DATABASE_PUBLISHED_PORT` são portas publicadas pelo Docker no host. Manter essa distinção evita quebrar comunicação interna quando uma porta externa muda.

## Segredos em deploy real

Em uma plataforma gerenciada, prefira o cofre de segredos da plataforma em vez de copiar arquivos `.env`. O Compose aceita as mesmas variáveis injetadas pelo processo de deploy.

Senhas usadas em `DATABASE_URL` precisam estar codificadas como URL quando contêm caracteres reservados. O valor de `POSTGRES_PASSWORD` continua sendo a senha original.
