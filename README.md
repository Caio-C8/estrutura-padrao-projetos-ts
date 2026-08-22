# Project Starter

Base neutra para iniciar produtos com múltiplas aplicações em um único monorepo. A estrutura vem com uma aplicação web mínima, uma API mínima, PostgreSQL/Prisma e pacotes compartilhados, sem regras de negócio do projeto que lhe deu origem.

## Tecnologias incluídas

- pnpm workspaces e Turborepo para orquestrar o monorepo;
- Next.js em `apps/web`;
- NestJS em `apps/api`;
- PostgreSQL e Prisma em `packages/database`;
- configurações compartilhadas em `packages/config`;
- contratos TypeScript em `packages/contracts`;
- utilitários agnósticos em `packages/utils`;
- Docker Compose separado para desenvolvimento, homologação (`staging`) e produção;
- CI com lint, tipos, testes, formatação e build.

## Estrutura

```text
.
├── apps/
│   ├── api/                 # API NestJS
│   └── web/                 # aplicação Next.js
├── packages/
│   ├── config/              # ESLint e TypeScript compartilhados
│   ├── database/            # Prisma, migrations e cliente do banco
│   ├── contracts/           # contratos compartilhados
│   └── utils/               # funções sem dependência de framework
├── docker/                  # imagens de produção
├── docs/                    # decisões e guias de expansão
├── compose.yaml             # serviços comuns
├── compose.development.yaml # ajustes de desenvolvimento
├── compose.staging.yaml     # ajustes de homologação
└── compose.production.yaml  # ajustes de produção
```

Qualquer diretório adicionado diretamente em `apps/*` ou `packages/*` é descoberto automaticamente pelo workspace. Consulte [como adicionar apps](docs/adding-apps.md) antes de criar um novo web, worker ou mobile.

## Pré-requisitos

- Node.js 24.19.0;
- pnpm 11.19.0, administrado pelo Corepack;
- Docker com Docker Compose para PostgreSQL e para execução conteinerizada.

As versões são fixadas em `.nvmrc`, `package.json`, Docker e CI. Em uma máquina nova ou depois de trocar a versão do Node, prepare o ambiente com:

```powershell
nvm install 24.19.0
nvm use 24.19.0
corepack enable
corepack prepare pnpm@11.19.0 --activate
node --version
pnpm --version
```

No Windows, se `pnpm --version` ainda mostrar uma instalação global antiga, localize todos os executáveis com `where.exe pnpm`, remova a instalação global com `npm uninstall --global pnpm`, reabra o terminal e execute novamente `corepack enable`. Enquanto o `PATH` não for corrigido, use `corepack pnpm <comando>` para garantir a versão declarada pelo projeto.

## Desenvolvimento local

1. Crie o arquivo local de ambiente:

   ```powershell
   Copy-Item .env.development.example .env.development
   ```

   Em Bash, use `cp .env.development.example .env.development`.

2. Instale as dependências:

   ```bash
   pnpm install
   ```

3. Inicie somente o PostgreSQL:

   ```bash
   pnpm infra:development:up
   ```

4. Gere o Prisma Client e crie a primeira migration depois de adicionar seus modelos:

   ```bash
   pnpm db:generate
   pnpm db:migrate:development
   ```

5. Inicie web e API com hot reload:

   ```bash
   pnpm dev
   ```

- Web: <http://localhost:3000>
- API: <http://localhost:3001/api/health>
- Proxy web para API: <http://localhost:3000/api/backend/health>

Também é possível executar tudo em containers com `pnpm stack:development:up`.

## Homologação

`staging` é o nome técnico adotado para o ambiente de homologação.

```powershell
Copy-Item .env.staging.example .env.staging
```

Troque domínio, credenciais e portas no arquivo criado. Depois execute:

```bash
pnpm stack:staging:up
```

Para encerrar:

```bash
pnpm stack:staging:down
```

## Produção

```powershell
Copy-Item .env.production.example .env.production
```

Preencha segredos fortes e URLs reais. Valide a configuração antes do deploy:

```bash
docker compose --env-file .env.production -f compose.yaml -f compose.production.yaml config
pnpm stack:production:up
```

Por padrão, as portas de produção são publicadas em `127.0.0.1`. Coloque Caddy, Nginx, Traefik, um ingress ou a plataforma de hospedagem na frente dos containers para TLS e domínio público.

## Comandos principais

| Comando                         | Finalidade                                      |
| ------------------------------- | ----------------------------------------------- |
| `pnpm dev`                      | Executa todos os apps que têm script `dev`      |
| `pnpm dev:web` / `pnpm dev:api` | Executa apenas um app                           |
| `pnpm check`                    | Gera Prisma Client, roda lint, tipos e testes   |
| `pnpm build:staging`            | Build local com variáveis de homologação        |
| `pnpm build:production`         | Build local com variáveis de produção           |
| `pnpm db:migrate:development`   | Cria/aplica migrations durante desenvolvimento  |
| `pnpm db:migrate:staging`       | Aplica migrations já versionadas em homologação |
| `pnpm db:migrate:production`    | Aplica migrations já versionadas em produção    |
| `pnpm db:studio`                | Abre o Prisma Studio no ambiente local          |
| `pnpm format`                   | Formata arquivos suportados                     |

## Regras para manter a base reutilizável

- Não coloque regra de negócio em `packages/config`, `contracts` ou `utils`.
- Uma aplicação não deve importar arquivos internos de outra aplicação.
- Compartilhe contratos estáveis por pacotes, usando dependências `workspace:*`.
- Crie migrations somente em desenvolvimento; staging e produção usam `migrate deploy`.
- Não versione `.env.development`, `.env.staging` ou `.env.production`.
- Trate imagens Docker como artefatos imutáveis e use `IMAGE_TAG` por versão/commit.

Mais detalhes estão em [arquitetura](docs/architecture.md) e [ambientes](docs/environments.md).
