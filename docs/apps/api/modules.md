# Módulos NestJS

## Composição do domínio

O arquivo `<dominio>.module.ts` registra os componentes daquele domínio:

```ts
@Module({
  imports: [CategoriaModule],
  controllers: [RecursoController],
  providers: [RecursoService, RecursoRepository],
  exports: [RecursoService],
})
export class RecursoModule {}
```

- `controllers`: todos os controllers pertencentes ao domínio;
- `providers`: o service e o repository do domínio, além de providers privados
  realmente necessários;
- `exports`: somente os services que outros módulos podem consumir;
- `imports`: módulos cujos services exportados serão usados.

Não exporte repositories. Não registre o mesmo service em vários módulos para
obter outra instância.

## Banco de dados

O módulo deve importar o módulo de infraestrutura que disponibiliza o client
Prisma singleton, salvo se esse provider for global por decisão explícita do
projeto. A base ainda precisa definir essa integração.

## Dependências entre domínios

Para usar dados ou comportamento de outro domínio:

1. exporte o service no módulo proprietário;
2. importe esse módulo no módulo consumidor;
3. injete o service, não o repository, no consumidor.

Se surgir um ciclo, primeiro considere extrair a orquestração ou revisar os
limites. Use `forwardRef()` apenas quando o ciclo for realmente inevitável e
documente o motivo.

## Registro na aplicação

Ao terminar um novo domínio, adicione seu módulo a `AppModule`:

```ts
@Module({
  imports: [RecursoModule],
})
export class AppModule {}
```

Depois, inicialize a aplicação ou compile o módulo para detectar providers não
resolvidos e imports ausentes.
