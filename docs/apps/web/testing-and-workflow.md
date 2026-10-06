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

## Ferramentas atuais

A base usa:

- Vitest 5 como runner;
- React Testing Library para hooks e componentes;
- `jsdom` somente nos testes que precisam de DOM;
- ambiente `node` como padrão para infraestrutura, parsers e operações;
- `resolve.tsconfigPaths` nativo do Vite 8 para os aliases do TypeScript.

O script de typecheck executa `next typegen` antes de `tsc --noEmit`, evitando
que tipos de rota antigos em `.next` sejam usados pela verificação.

Playwright ou outra ferramenta E2E, axe e MSW continuam pendentes. Não os
instale antecipadamente: `WEB-004` deve escolher a cobertura E2E e de
acessibilidade, enquanto MSW só se justifica se mocks no nível de rede
trouxerem benefício sobre a injeção atual de `ApiClient` e os mocks dos hooks.

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

O script `test` executa `vitest run`. Em 6 de outubro de 2026, a suíte de
`WEB-001` e `WEB-002` possui 25 arquivos e 120 testes. Ela cobre cliente HTTP,
query client, operações e hooks do CRUD, query keys, parser de filtros,
formatadores, máscaras, schemas e mappers de formulário, listagem, detalhe,
criação, edição, diálogo de exclusão e os toasts de sucesso. Os testes dos
componentes simulam somente `toast.success` e verificam a mensagem emitida:
create e update recebem a mensagem da response, enquanto delete usa o conteúdo
local correspondente ao `204`.

Testes E2E continuam pendentes e a revisão manual permanece obrigatória. O
`ResizeObserver` ausente no jsdom possui um mock mínimo no setup porque as
primitives Radix o utilizam; o mock não substitui testes reais de layout, foco e
teclado no navegador.

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
