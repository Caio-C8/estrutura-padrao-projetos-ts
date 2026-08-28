# Roadmap do `@repo/contracts`

Este arquivo registra duas coisas:

1. o baseline entregue por esta estrutura padrão;
2. objetivos concretos adicionados pelo projeto que reutilizar a estrutura.

Ele não deve antecipar entidades, features ou regras de um domínio que ainda não
existe. Um projeto novo começa somente com o baseline concluído e adiciona seus
próprios objetivos quando surgir uma necessidade real.

## Baseline da estrutura padrão

Os itens abaixo descrevem capacidades já entregues e verificadas neste
repositório:

- [x] Package compartilhado localizado em `packages/contracts`.
- [x] Nome de workspace definido como `@repo/contracts`.
- [x] Package privado com entrypoint e export público em `src/index.ts`.
- [x] Configurações compartilhadas de TypeScript e ESLint.
- [x] Scripts de lint e typecheck disponíveis no package.
- [x] Dependências `workspace:*` configuradas nos apps web e API.
- [x] Transpilação de `@repo/contracts` configurada no Next.js.
- [x] Package independente de `@repo/database` e de código server-only.
- [x] Tipos neutros mínimos para verificar o compartilhamento entre apps.
- [x] Documentação de arquitetura, convenções, erros, integrações e testes.
- [x] Instruções para agentes apontando para a documentação de contratos.

O baseline deve conter apenas o que qualquer projeto criado a partir desta base
receberá funcionando. Não marque uma capacidade como concluída apenas porque ela
está documentada ou planejada.

## Objetivos específicos do projeto

Esta seção permanece vazia na estrutura padrão.

Ao reutilizar o repositório, adicione aqui somente objetivos necessários ao
contexto real da nova aplicação. Um objetivo pode representar:

- adoção de uma capacidade transversal no package;
- criação ou alteração de um contrato externo;
- integração de validação em um novo tipo de consumidor;
- extração de uma abstração justificada por repetição concreta;
- mudança que exige coordenação entre vários consumidores.

Não crie objetivos hipotéticos “para uso futuro”.

### Modelo de objetivo

```md
### CONTRACTS-001 — <resultado esperado>

**Status:** planejado | em andamento | concluído

**Contexto**

Explique a necessidade concreta e por que ela pertence a @repo/contracts.

**Escopo**

- o que será alterado;
- consumidores afetados;
- o que fica explicitamente fora.

**Critérios de aceite**

- [ ] comportamento implementado;
- [ ] contratos e exports revisados;
- [ ] testes relevantes adicionados;
- [ ] consumidores afetados validados;
- [ ] documentação atualizada.

**Decisões**

Registre semânticas importantes, compatibilidade e links para fontes oficiais.
```

## Ciclo de um objetivo

1. Inspecione o package e todos os consumidores afetados.
2. Registre o objetivo antes de implementar uma nova capacidade relevante.
3. Defina contexto, escopo e critérios de aceite verificáveis.
4. Implemente de forma incremental.
5. Atualize decisões e documentação durante o trabalho.
6. Marque como concluído somente após validar código, tipos, testes e
   consumidores.

Correções pequenas e internas podem ser feitas sem criar um objetivo separado
quando não introduzem capacidade nova nem alteram comportamento externo.

## Promoção para o baseline

Um objetivo específico pode virar parte da estrutura padrão somente quando:

- fizer sentido para qualquer projeto criado a partir da base;
- estiver implementado no repositório-base;
- possuir verificações compatíveis com seu risco;
- estiver documentado sem referências ao domínio que o originou;
- não introduzir dependência desnecessária de framework ou infraestrutura.

Depois da promoção:

1. remova detalhes do domínio original;
2. registre a capacidade na seção de baseline como concluída;
3. mantenha no projeto derivado apenas decisões que continuem específicas dele.

Assim, futuros projetos recebem a capacidade pronta e não uma tarefa
artificialmente marcada como concluída.

## Regras de manutenção

- O roadmap deve refletir o estado real do código.
- Objetivos concluídos preservam contexto e critérios de aceite.
- Objetivos cancelados registram o motivo em vez de desaparecer silenciosamente.
- Mudanças em contratos externos identificam consumidores e compatibilidade.
- A documentação detalhada permanece nos demais arquivos deste diretório; o
  roadmap registra intenção, escopo e progresso.
