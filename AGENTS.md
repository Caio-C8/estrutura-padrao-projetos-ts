# Instruções para agentes

## Escopo geral

- Inspecione a estrutura e os usos existentes antes de alterar código.
- Preserve mudanças do usuário que não pertençam à tarefa.
- Faça mudanças pequenas, verificáveis e compatíveis com a arquitetura.
- Não altere contratos externos silenciosamente.
- Explique decisões arquiteturais e trade-offs relevantes.
- Quando a semântica de um campo não puder ser inferida com segurança, pergunte
  antes de decidir.

## Fontes

- Confirme APIs e recomendações nas documentações oficiais das versões usadas.
- Quando houver incerteza, pesquise uma fonte confiável e forneça o link.
- Use issues, discussões e comunidade apenas como evidência secundária.

## Contratos

Antes de modificar `packages/contracts` ou um consumidor de seus contratos,
comece por [docs/contracts/README.md](docs/contracts/README.md) e leia apenas os
documentos relevantes à tarefa.

Regras obrigatórias:

- Use Zod 4 para novos contratos runtime.
- Considere o schema a fonte de verdade e derive tipos dele.
- Diferencie `z.input` de `z.output` quando houver transformação.
- Valide dados externos no boundary.
- Mantenha regras dependentes de banco ou permissões fora dos schemas.
- Não faça `@repo/contracts` depender de `@repo/database` sem decisão
  arquitetural explícita.
- Não crie uma DSL genérica sobre o Zod.
- Preserve a diferença entre propriedade ausente, `undefined`, `null` e
  string vazia.
- Não presuma que Create, Update, formulário, banco e response compartilham o
  mesmo contrato.
- Adicione testes antes de reutilizar primitives, normalizers, codecs ou helpers
  em várias features.

## Roadmap de contratos

Antes de criar uma nova capacidade relevante em `@repo/contracts` ou alterar o
comportamento de um contrato externo, registre um objetivo em
[docs/contracts/roadmap.md](docs/contracts/roadmap.md).

- Inclua contexto, escopo, consumidores afetados e critérios de aceite.
- Não adicione objetivos hipotéticos ou de um domínio inexistente à estrutura
  padrão.
- Atualize o status somente depois das verificações correspondentes.
- Promova uma capacidade ao baseline apenas quando ela estiver implementada,
  validada e for reutilizável em qualquer projeto derivado.
- Correções pequenas que não criam capacidade nem alteram comportamento externo
  não precisam de um objetivo separado.

## Verificação

Depois de modificar somente o package de contratos, execute no mínimo:

```bash
pnpm --filter @repo/contracts lint
pnpm --filter @repo/contracts typecheck
```

Execute os testes do package quando o script `test` existir. Para mudanças que
afetem consumidores, valide também os apps envolvidos ou rode:

```bash
pnpm check
pnpm format:check
```
