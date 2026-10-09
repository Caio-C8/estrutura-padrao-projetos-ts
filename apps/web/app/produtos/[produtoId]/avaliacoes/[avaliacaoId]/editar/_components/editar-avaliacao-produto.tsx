"use client";

import Link from "next/link";
import { MessagesSquare, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useAvaliacaoProduto } from "@/features/produto/api/use-avaliacao-produto";
import { UpdateAvaliacaoProdutoForm } from "./update-avaliacao-produto-form";

type EditarAvaliacaoProdutoProps = Readonly<{
  produtoId: string;
  avaliacaoId: string;
}>;

function EditarAvaliacaoProdutoLoading() {
  return (
    <section
      className="mt-8 space-y-6"
      aria-label="Carregando formulário da avaliação"
      aria-busy="true"
    >
      <div className="rounded-xl border bg-card p-5 sm:p-6">
        <Skeleton className="h-5 w-48" />
        <Skeleton className="mt-3 h-4 w-72 max-w-full" />

        <div className="mt-6 grid gap-5 sm:grid-cols-2">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-36 w-full sm:col-span-2" />
          <Skeleton className="h-20 w-full sm:col-span-2" />
        </div>
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

export function EditarAvaliacaoProduto({
  produtoId,
  avaliacaoId,
}: EditarAvaliacaoProdutoProps) {
  const { data, error, isError, isFetching, isPending, refetch } =
    useAvaliacaoProduto(produtoId, avaliacaoId);

  if (isPending) {
    return <EditarAvaliacaoProdutoLoading />;
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

  return (
    <>
      {isFetching ? (
        <p className="mt-8 text-sm text-muted-foreground" role="status">
          Atualizando dados da avaliação…
        </p>
      ) : null}

      <UpdateAvaliacaoProdutoForm avaliacao={data.dados} />
    </>
  );
}
