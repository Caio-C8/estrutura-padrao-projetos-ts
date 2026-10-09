"use client";

import Link from "next/link";
import { CalendarDays, Eye, RefreshCw, Star, UserRound } from "lucide-react";
import type { ListAvaliacoesProdutoQueryInput } from "@repo/contracts";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useAvaliacoesProduto } from "@/features/produto/api/use-avaliacoes-produto";
import { formatarDataHoraProduto } from "@/features/produto/lib/produto-formatters";

type AvaliacoesProdutoListagemProps = Readonly<{
  produtoId: string;
  query: ListAvaliacoesProdutoQueryInput;
}>;

function criarHrefPagina(
  produtoId: string,
  query: ListAvaliacoesProdutoQueryInput,
  pagina: number,
): string {
  const searchParams = new URLSearchParams();

  searchParams.set("pagina", String(pagina));
  searchParams.set("limite", query.limite ?? "20");

  if (query.pesquisa) {
    searchParams.set("pesquisa", query.pesquisa);
  }

  if (query.recomenda) {
    searchParams.set("recomenda", query.recomenda);
  }

  return `/produtos/${produtoId}/avaliacoes?${searchParams.toString()}`;
}

function AvaliacoesProdutoLoading() {
  return (
    <div className="mt-8 space-y-4" aria-label="Carregando avaliações">
      {[1, 2, 3].map((item) => (
        <div key={item} className="rounded-xl border p-5">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-3">
              <Skeleton className="h-5 w-40" />
              <Skeleton className="h-4 w-28" />
            </div>

            <Skeleton className="h-6 w-20" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function AvaliacoesProdutoListagem({
  produtoId,
  query,
}: AvaliacoesProdutoListagemProps) {
  const avaliacoesQuery = useAvaliacoesProduto(produtoId, query);

  if (avaliacoesQuery.isPending) {
    return <AvaliacoesProdutoLoading />;
  }

  if (avaliacoesQuery.isError) {
    const produtoNaoEncontrado = avaliacoesQuery.error.status === 404;

    return (
      <div
        className="mt-8 rounded-xl border border-destructive/30 bg-destructive/5 p-5"
        role="alert"
      >
        <h2 className="font-semibold">
          {produtoNaoEncontrado
            ? "Produto não encontrado"
            : "Não foi possível carregar as avaliações"}
        </h2>

        <p className="mt-2 text-sm text-muted-foreground">
          {avaliacoesQuery.error.message}
        </p>

        {avaliacoesQuery.error.requisicaoId ? (
          <p className="mt-2 text-xs text-muted-foreground">
            Referência: {avaliacoesQuery.error.requisicaoId}
          </p>
        ) : null}

        <div className="mt-4">
          {produtoNaoEncontrado ? (
            <Button asChild variant="outline">
              <Link href="/produtos">Voltar para os produtos</Link>
            </Button>
          ) : (
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                void avaliacoesQuery.refetch();
              }}
            >
              <RefreshCw aria-hidden="true" />
              Tentar novamente
            </Button>
          )}
        </div>
      </div>
    );
  }

  const response = avaliacoesQuery.data;

  if (response.meta.total === 0) {
    return (
      <div className="mt-8 rounded-xl border border-dashed p-8 text-center">
        <h2 className="font-semibold">Nenhuma avaliação encontrada</h2>

        <p className="mt-2 text-sm text-muted-foreground">
          Não existem avaliações que correspondam aos filtros informados.
        </p>
      </div>
    );
  }

  if (response.dados.length === 0) {
    return (
      <div className="mt-8 rounded-xl border border-dashed p-8 text-center">
        <h2 className="font-semibold">Esta página não possui avaliações</h2>

        <p className="mt-2 text-sm text-muted-foreground">
          Volte para a primeira página para continuar consultando os resultados.
        </p>

        <Button asChild variant="outline" className="mt-4">
          <Link href={criarHrefPagina(produtoId, query, 1)}>
            Ir para a primeira página
          </Link>
        </Button>
      </div>
    );
  }

  const possuiPaginaAnterior = response.meta.pagina > 1;
  const possuiProximaPagina = response.meta.pagina < response.meta.ultimaPagina;

  return (
    <section className="mt-8" aria-labelledby="avaliacoes-resultados-titulo">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2
            id="avaliacoes-resultados-titulo"
            className="text-xl font-semibold tracking-tight"
          >
            Avaliações
          </h2>

          <p className="mt-1 text-sm text-muted-foreground">
            {response.meta.total}{" "}
            {response.meta.total === 1 ? "avaliação" : "avaliações"}
          </p>
        </div>

        <p className="text-sm text-muted-foreground">
          Página {response.meta.pagina} de {response.meta.ultimaPagina}
        </p>
      </div>

      <ul className="mt-5 space-y-4">
        {response.dados.map((avaliacao) => (
          <li key={avaliacao.id} className="rounded-xl border bg-card p-5">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <UserRound
                    aria-hidden="true"
                    className="size-4 shrink-0 text-muted-foreground"
                  />

                  <p className="wrap-break-word font-medium">
                    {avaliacao.autorNome}
                  </p>
                </div>

                <div className="mt-3 flex items-center gap-2 text-sm text-muted-foreground">
                  <CalendarDays aria-hidden="true" className="size-4" />

                  <time dateTime={avaliacao.createdAt}>
                    {formatarDataHoraProduto(avaliacao.createdAt)}
                  </time>
                </div>
              </div>

              <div className="flex shrink-0 flex-wrap items-center gap-2 self-start">
                <Badge
                  variant="secondary"
                  aria-label={`Nota ${avaliacao.nota} de 5`}
                >
                  <Star aria-hidden="true" className="fill-current" />
                  {avaliacao.nota}/5
                </Badge>

                <Button asChild size="sm" variant="outline">
                  <Link
                    href={`/produtos/${produtoId}/avaliacoes/${avaliacao.id}`}
                    aria-label={`Ver detalhes da avaliação de ${avaliacao.autorNome}`}
                  >
                    <Eye aria-hidden="true" />
                    Ver detalhes
                  </Link>
                </Button>
              </div>
            </div>
          </li>
        ))}
      </ul>

      {response.meta.ultimaPagina > 1 ? (
        <nav
          className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"
          aria-label="Paginação das avaliações"
        >
          <div>
            {possuiPaginaAnterior ? (
              <Button asChild variant="outline">
                <Link
                  href={criarHrefPagina(
                    produtoId,
                    query,
                    response.meta.pagina - 1,
                  )}
                >
                  Página anterior
                </Link>
              </Button>
            ) : (
              <Button type="button" variant="outline" disabled>
                Página anterior
              </Button>
            )}
          </div>

          <p className="text-center text-sm text-muted-foreground">
            Página {response.meta.pagina} de {response.meta.ultimaPagina}
          </p>

          <div className="sm:text-right">
            {possuiProximaPagina ? (
              <Button asChild variant="outline">
                <Link
                  href={criarHrefPagina(
                    produtoId,
                    query,
                    response.meta.pagina + 1,
                  )}
                >
                  Próxima página
                </Link>
              </Button>
            ) : (
              <Button type="button" variant="outline" disabled>
                Próxima página
              </Button>
            )}
          </div>
        </nav>
      ) : null}
    </section>
  );
}
