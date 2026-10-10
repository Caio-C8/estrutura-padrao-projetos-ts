"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { MessagesSquare, Pencil, RefreshCw, Star } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useAvaliacaoProduto } from "@/features/produto/api/use-avaliacao-produto";
import { formatarDataHoraProduto } from "@/features/produto/lib/produto-formatters";
import { DeleteAvaliacaoProdutoDialog } from "./delete-avaliacao-produto-dialog";

type AvaliacaoProdutoDetalheProps = Readonly<{
  produtoId: string;
  avaliacaoId: string;
}>;

type CampoDetalheProps = Readonly<{
  rotulo: string;
  children: ReactNode;
  ocuparLinha?: boolean;
}>;

function CampoDetalhe({
  rotulo,
  children,
  ocuparLinha = false,
}: CampoDetalheProps) {
  return (
    <div className={ocuparLinha ? "sm:col-span-2" : undefined}>
      <dt className="text-sm text-muted-foreground">{rotulo}</dt>
      <dd className="mt-1 wrap-break-word font-medium">{children}</dd>
    </div>
  );
}

function AvaliacaoProdutoDetalheLoading() {
  return (
    <section
      className="mt-8 space-y-6"
      aria-label="Carregando avaliação"
      aria-busy="true"
    >
      <div className="rounded-xl border bg-card p-6">
        <Skeleton className="h-8 w-1/2" />
        <Skeleton className="mt-3 h-4 w-1/3" />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {[1, 2].map((item) => (
          <div key={item} className="rounded-xl border bg-card p-6">
            <Skeleton className="h-5 w-1/3" />

            <div className="mt-6 grid gap-5 sm:grid-cols-2">
              {[1, 2, 3, 4].map((campo) => (
                <div key={campo}>
                  <Skeleton className="h-4 w-1/2" />
                  <Skeleton className="mt-2 h-5 w-3/4" />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function RecursoNaoEncontrado({
  produtoId,
  codigo,
}: Readonly<{
  produtoId: string;
  codigo: string;
}>) {
  const produtoNaoEncontrado = codigo === "PRODUTO_NAO_ENCONTRADO";

  return (
    <section
      className="mt-8 rounded-xl border border-dashed p-8 text-center"
      role="alert"
    >
      <MessagesSquare
        aria-hidden="true"
        className="mx-auto size-9 text-muted-foreground"
      />

      <h2 className="mt-4 text-lg font-semibold">
        {produtoNaoEncontrado
          ? "Produto não encontrado"
          : "Avaliação não encontrada"}
      </h2>

      <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
        {produtoNaoEncontrado
          ? "O produto pode ter sido removido ou não corresponde ao endereço informado."
          : "A avaliação pode ter sido removida ou não pertence ao produto informado."}
      </p>

      <Button asChild className="mt-6" variant="outline">
        <Link
          href={
            produtoNaoEncontrado
              ? "/produtos"
              : `/produtos/${produtoId}/avaliacoes`
          }
        >
          {produtoNaoEncontrado
            ? "Voltar para produtos"
            : "Voltar para avaliações"}
        </Link>
      </Button>
    </section>
  );
}

export function AvaliacaoProdutoDetalhe({
  produtoId,
  avaliacaoId,
}: AvaliacaoProdutoDetalheProps) {
  const { data, error, isError, isFetching, isPending, refetch } =
    useAvaliacaoProduto(produtoId, avaliacaoId);

  if (isPending) {
    return <AvaliacaoProdutoDetalheLoading />;
  }

  if (isError && error.status === 404) {
    return <RecursoNaoEncontrado produtoId={produtoId} codigo={error.codigo} />;
  }

  if (isError) {
    return (
      <section
        className="mt-8 rounded-xl border border-destructive/30 bg-destructive/5 p-6"
        role="alert"
      >
        <h2 className="font-semibold">Não foi possível carregar a avaliação</h2>

        <p className="mt-2 text-sm text-muted-foreground">{error.message}</p>

        {error.requisicaoId ? (
          <p className="mt-2 text-xs text-muted-foreground">
            Referência: {error.requisicaoId}
          </p>
        ) : null}

        <Button
          className="mt-5"
          type="button"
          variant="outline"
          onClick={() => void refetch()}
        >
          <RefreshCw aria-hidden="true" />
          Tentar novamente
        </Button>
      </section>
    );
  }

  const avaliacao = data.dados;

  return (
    <section className="mt-8 space-y-6" aria-labelledby="avaliacao-autor">
      <header className="rounded-xl border bg-card p-6 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="text-sm text-muted-foreground">Avaliação de</p>

            <h2
              id="avaliacao-autor"
              className="mt-1 wrap-break-word text-2xl font-semibold tracking-tight"
            >
              {avaliacao.autorNome}
            </h2>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Badge
              variant="secondary"
              aria-label={`Nota ${avaliacao.nota} de 5`}
            >
              <Star aria-hidden="true" className="fill-current" />
              {avaliacao.nota}/5
            </Badge>

            <Button asChild size="sm" variant="outline">
              <Link
                href={`/produtos/${avaliacao.produtoId}/avaliacoes/${avaliacao.id}/editar`}
              >
                <Pencil aria-hidden="true" />
                Editar avaliação
              </Link>
            </Button>

            <DeleteAvaliacaoProdutoDialog
              produtoId={avaliacao.produtoId}
              avaliacaoId={avaliacao.id}
              autorNome={avaliacao.autorNome}
            />
          </div>
        </div>

        {isFetching ? (
          <p className="mt-4 text-sm text-muted-foreground" role="status">
            Atualizando avaliação…
          </p>
        ) : null}
      </header>

      <div className="grid gap-6 lg:grid-cols-2">
        <section
          className="rounded-xl border bg-card p-6"
          aria-labelledby="conteudo-avaliacao-heading"
        >
          <h3 id="conteudo-avaliacao-heading" className="font-semibold">
            Conteúdo
          </h3>

          <dl className="mt-6 grid gap-5 sm:grid-cols-2">
            <CampoDetalhe rotulo="Nota">{avaliacao.nota} de 5</CampoDetalhe>

            <CampoDetalhe rotulo="Recomenda o produto">
              {avaliacao.recomenda ? "Sim" : "Não"}
            </CampoDetalhe>

            <CampoDetalhe rotulo="Comentário" ocuparLinha>
              {avaliacao.comentario ?? "Não informado"}
            </CampoDetalhe>
          </dl>
        </section>

        <section
          className="rounded-xl border bg-card p-6"
          aria-labelledby="registro-avaliacao-heading"
        >
          <h3 id="registro-avaliacao-heading" className="font-semibold">
            Registro
          </h3>

          <dl className="mt-6 grid gap-5 sm:grid-cols-2">
            <CampoDetalhe rotulo="Criada em">
              <time dateTime={avaliacao.createdAt}>
                {formatarDataHoraProduto(avaliacao.createdAt)}
              </time>
            </CampoDetalhe>

            <CampoDetalhe rotulo="Atualizada em">
              <time dateTime={avaliacao.updatedAt}>
                {formatarDataHoraProduto(avaliacao.updatedAt)}
              </time>
            </CampoDetalhe>
          </dl>
        </section>
      </div>
    </section>
  );
}
