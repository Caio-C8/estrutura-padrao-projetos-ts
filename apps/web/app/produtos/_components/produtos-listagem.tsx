"use client";

import Link from "next/link";
import {
  ChevronLeft,
  ChevronRight,
  PackageOpen,
  RefreshCw,
} from "lucide-react";
import {
  type ListProdutosQueryInput,
  type ProdutoResumoResponse,
} from "@repo/contracts";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useProdutos } from "@/features/produto/api/use-produtos";
import {
  formatarPrecoProduto,
  formatarStatusProduto,
} from "@/features/produto/lib/produto-formatters";

type ProdutosListagemProps = Readonly<{
  query: ListProdutosQueryInput;
}>;

function criarHrefPagina(
  query: ListProdutosQueryInput,
  pagina: number,
): string {
  const params = new URLSearchParams();

  params.set("pagina", String(pagina));
  params.set("limite", query.limite ?? "20");

  if (query.pesquisa) {
    params.set("pesquisa", query.pesquisa);
  }

  if (query.status) {
    params.set("status", query.status);
  }

  if (query.emDestaque) {
    params.set("emDestaque", query.emDestaque);
  }

  return `/produtos?${params.toString()}`;
}

function ProdutosLoading() {
  return (
    <section
      className="mt-8 space-y-3"
      aria-label="Carregando produtos"
      aria-busy="true"
    >
      {Array.from({ length: 4 }, (_, index) => (
        <div key={index} className="rounded-xl border bg-card p-5">
          <Skeleton className="h-5 w-2/3" />
          <Skeleton className="mt-3 h-4 w-1/3" />
          <Skeleton className="mt-5 h-8 w-full" />
        </div>
      ))}
    </section>
  );
}

function ProdutoMobile({
  produto,
}: Readonly<{ produto: ProdutoResumoResponse }>) {
  return (
    <li>
      <article className="rounded-xl border bg-card p-5 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="wrap-break-word font-semibold">
              <Link
                href={`/produtos/${produto.id}`}
                className="rounded-sm underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                {produto.nome}
              </Link>
            </h3>

            <p className="mt-1 break-all text-sm text-muted-foreground">
              {produto.sku}
            </p>
          </div>

          <Badge variant="outline">
            {formatarStatusProduto(produto.status)}
          </Badge>
        </div>

        <dl className="mt-5 grid grid-cols-2 gap-4 text-sm">
          <div>
            <dt className="text-muted-foreground">Preço</dt>
            <dd className="mt-1 font-medium">
              {formatarPrecoProduto(produto.preco)}
            </dd>
          </div>

          <div>
            <dt className="text-muted-foreground">Estoque</dt>
            <dd className="mt-1 font-medium">{produto.estoque}</dd>
          </div>

          <div>
            <dt className="text-muted-foreground">Destaque</dt>
            <dd className="mt-1 font-medium">
              {produto.emDestaque ? "Sim" : "Não"}
            </dd>
          </div>

          <div>
            <dt className="text-muted-foreground">Vendas</dt>
            <dd className="mt-1 font-medium">{produto.quantidadeVendas}</dd>
          </div>
        </dl>
      </article>
    </li>
  );
}

export function ProdutosListagem({ query }: ProdutosListagemProps) {
  const { data, error, isError, isFetching, isPending, refetch } =
    useProdutos(query);

  if (isPending) {
    return <ProdutosLoading />;
  }

  if (isError) {
    return (
      <section
        className="mt-8 rounded-xl border border-destructive/30 bg-destructive/5 p-6"
        role="alert"
      >
        <h2 className="font-semibold">Não foi possível carregar os produtos</h2>

        <p className="mt-2 text-sm text-muted-foreground">{error.message}</p>

        {error.requisicaoId ? (
          <p className="mt-2 text-xs text-muted-foreground">
            Referência: {error.requisicaoId}
          </p>
        ) : null}

        <Button
          className="mt-5"
          variant="outline"
          onClick={() => void refetch()}
        >
          <RefreshCw aria-hidden="true" />
          Tentar novamente
        </Button>
      </section>
    );
  }

  if (data.meta.total === 0) {
    return (
      <section className="mt-8 rounded-xl border border-dashed p-8 text-center">
        <PackageOpen
          aria-hidden="true"
          className="mx-auto size-8 text-muted-foreground"
        />

        <h2 className="mt-4 font-semibold">Nenhum produto encontrado</h2>

        <p className="mt-2 text-sm text-muted-foreground">
          Ajuste os filtros ou cadastre o primeiro produto.
        </p>
      </section>
    );
  }

  const temPaginaAnterior = data.meta.pagina > 1;
  const temProximaPagina = data.meta.pagina < data.meta.ultimaPagina;

  return (
    <section className="mt-8" aria-labelledby="catalogo-heading">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 id="catalogo-heading" className="font-semibold">
          Catálogo
        </h2>

        <div className="flex items-center gap-3 text-sm text-muted-foreground">
          <span>
            {data.meta.total} {data.meta.total === 1 ? "produto" : "produtos"}
          </span>

          {isFetching ? <span role="status">Atualizando…</span> : null}
        </div>
      </div>

      {data.dados.length === 0 ? (
        <div className="mt-5 rounded-xl border border-dashed p-6">
          <p className="font-medium">Esta página não possui resultados.</p>
          <p className="mt-2 text-sm text-muted-foreground">
            Volte para uma página anterior ou revise os filtros.
          </p>
        </div>
      ) : (
        <>
          <ul className="mt-5 grid gap-4 md:hidden">
            {data.dados.map((produto) => (
              <ProdutoMobile key={produto.id} produto={produto} />
            ))}
          </ul>

          <div className="mt-5 hidden overflow-hidden rounded-xl border md:block">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Produto</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Preço</TableHead>
                  <TableHead className="text-right">Estoque</TableHead>
                  <TableHead className="text-right">Destaque</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {data.dados.map((produto) => (
                  <TableRow key={produto.id}>
                    <TableCell>
                      <Link
                        href={`/produtos/${produto.id}`}
                        className="rounded-sm font-medium underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      >
                        {produto.nome}
                      </Link>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {produto.sku}
                      </p>
                    </TableCell>

                    <TableCell>
                      <Badge variant="outline">
                        {formatarStatusProduto(produto.status)}
                      </Badge>
                    </TableCell>

                    <TableCell className="text-right">
                      {formatarPrecoProduto(produto.preco)}
                    </TableCell>

                    <TableCell className="text-right">
                      {produto.estoque}
                    </TableCell>

                    <TableCell className="text-right">
                      {produto.emDestaque ? "Sim" : "Não"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </>
      )}

      <nav
        className="mt-6 flex flex-col items-center justify-between gap-4 sm:flex-row"
        aria-label="Paginação dos produtos"
      >
        <p className="text-sm text-muted-foreground">
          Página {data.meta.pagina} de {data.meta.ultimaPagina}
        </p>

        <div className="flex gap-2">
          {temPaginaAnterior ? (
            <Button asChild variant="outline">
              <Link href={criarHrefPagina(query, data.meta.pagina - 1)}>
                <ChevronLeft aria-hidden="true" />
                Anterior
              </Link>
            </Button>
          ) : (
            <Button variant="outline" disabled>
              <ChevronLeft aria-hidden="true" />
              Anterior
            </Button>
          )}

          {temProximaPagina ? (
            <Button asChild variant="outline">
              <Link href={criarHrefPagina(query, data.meta.pagina + 1)}>
                Próxima
                <ChevronRight aria-hidden="true" />
              </Link>
            </Button>
          ) : (
            <Button variant="outline" disabled>
              Próxima
              <ChevronRight aria-hidden="true" />
            </Button>
          )}
        </div>
      </nav>
    </section>
  );
}
