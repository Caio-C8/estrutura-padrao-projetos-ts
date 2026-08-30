# Testes e workflow

## Antes de implementar

Confirme:

- objetivo, usuário e ação principal da página;
- rotas e metadata;
- estados de loading, vazio, erro, sucesso e permissão;
- contratos realmente disponíveis;
- componentes e tokens existentes;
- comportamento responsivo;
- requisitos de teclado e foco;
- riscos de segurança;
- necessidade de Client Components;
- se a tarefa também inclui integração com a API.

Se a integração fizer parte do trabalho, leia
[Integração web–API](../../integrations/web-api/README.md). Não invente
endpoint, autenticação, formato de erro ou cache para desbloquear uma tela.

## Ordem recomendada

1. descrever estados e fluxo do usuário;
2. definir rota, layout e metadata;
3. desenhar estrutura semântica e responsiva;
4. localizar primitives existentes;
5. implementar a composição server-first;
6. criar fronteiras Client somente onde necessárias;
7. implementar formulários e validação;
8. implementar hooks e operações se a integração estiver no escopo;
9. revisar segurança, acessibilidade e desempenho;
10. testar estados, viewports e teclado;
11. executar verificações automatizadas e build.

## Estratégia de testes

| Alvo                  | Verificação principal                                |
| --------------------- | ---------------------------------------------------- |
| primitive             | variantes, semântica, teclado e foco                 |
| componente de feature | comportamento, eventos e estados                     |
| formulário            | defaults, validação, transformação e submissão       |
| hook remoto           | parâmetros, estados, cancelamento e erro normalizado |
| operação HTTP         | URL, método, payload, contrato e resposta            |
| página                | composição, metadata e estados visuais               |
| E2E                   | fluxo real, navegação e integração                   |
| responsividade        | reflow, toque, zoom e conteúdo longo                 |
| acessibilidade        | semântica, teclado, foco, contraste e anúncios       |
| desempenho            | build, bundle e métricas                             |

## Ferramentas pendentes

A base ainda não escolheu a stack de testes da interface. Antes de adicionar,
avalie:

- React Testing Library para comportamento de componentes;
- Vitest ou Jest como runner;
- Playwright para E2E, viewports e navegação;
- axe para apoio automatizado de acessibilidade;
- MSW para simular HTTP na fronteira quando houver integração.

Não instale todas automaticamente. A escolha deve atender os testes reais do
projeto e ser registrada quando se tornar baseline.

## Teste visual e manual

Automação não substitui inspeção. Verifique:

- viewport estreita, intermediária e ampla;
- retrato e paisagem quando relevante;
- zoom;
- teclado;
- foco;
- reduced motion;
- loading, vazio, erro, disabled e sucesso;
- conteúdo curto e excessivamente longo;
- rede lenta e falha quando houver integração.

## Metadata

Todo teste ou revisão de página deve confirmar o título:

```text
Nome da página | Nome do projeto
```

Para metadata dinâmica, cubra sucesso, conteúdo ausente e fallback. Não gere
título com valor `undefined`, identificador bruto ou dado sensível.

## Comandos atuais

Para alteração localizada:

```bash
pnpm --filter @repo/web lint
pnpm --filter @repo/web typecheck
pnpm --filter @repo/web test
pnpm --filter @repo/web build
pnpm format:check
```

O script `test` atual não possui testes de interface; ele executa o runner
nativo do Node. Não considere a saída “zero testes” como cobertura da feature.

Para mudança transversal:

```bash
pnpm check
pnpm format:check
pnpm build
```

No Next.js 16, `next build` não substitui o lint. Execute ambos.

## Definition of done

Uma página só está concluída quando:

- requisitos e estados estão implementados;
- metadata segue o padrão;
- responsividade foi verificada;
- teclado e foco funcionam;
- formulário preserva e comunica erros;
- integração, se presente, usa clientes e hooks padronizados;
- não há segredo ou HTML inseguro no cliente;
- dependências e Client Components foram minimizados;
- testes relevantes existem e passam;
- lint, typecheck, formatação e build passam;
- limitações conhecidas foram relatadas.
