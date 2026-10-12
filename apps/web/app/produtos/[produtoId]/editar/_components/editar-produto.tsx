"use client";

import { useEffect } from "react";
import type { ProdutoResponse } from "@repo/contracts";
import Link from "next/link";
import { PackageX, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useProduto } from "@/features/produto/api/use-produto";
import {
  UpdateProdutoForm,
  type UpdateProdutoFormState,
} from "./update-produto-form";

type EditarProdutoProps = Readonly<{
  produtoId: string;
  onCancel?: () => void;
  onSuccess?: (response: ProdutoResponse) => void;
  onStateChange?: (state: UpdateProdutoFormState) => void;
}>;

function EditarProdutoLoading() {
  return (
    <section
      className="mt-8 space-y-6"
      aria-label="Carregando formulário do produto"
      aria-busy="true"
    >
      {Array.from({ length: 3 }, (_, index) => (
        <div key={index} className="rounded-xl border bg-card p-5 sm:p-6">
          <Skeleton className="h-5 w-48" />
          <Skeleton className="mt-3 h-4 w-72 max-w-full" />

          <div className="mt-6 grid gap-5 sm:grid-cols-2">
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
          </div>
        </div>
      ))}
    </section>
  );
}

function ProdutoNaoEncontrado() {
  return (
    <section
      className="mt-8 rounded-xl border border-dashed p-8 text-center"
      role="alert"
    >
      <PackageX
        aria-hidden="true"
        className="mx-auto size-9 text-muted-foreground"
      />

      <h2 className="mt-4 text-lg font-semibold">Produto não encontrado</h2>

      <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
        O produto pode ter sido removido ou o endereço informado não corresponde
        a um produto existente.
      </p>

      <Button asChild className="mt-6" variant="outline">
        <Link href="/produtos">Voltar para produtos</Link>
      </Button>
    </section>
  );
}

export function EditarProduto({
  produtoId,
  onCancel,
  onSuccess,
  onStateChange,
}: EditarProdutoProps) {
  const { data, error, isError, isFetching, isPending, refetch } =
    useProduto(produtoId);

  useEffect(() => {
    if (!isPending && !isError) {
      return;
    }

    onStateChange?.({
      possuiAlteracoes: false,
      enviando: false,
    });
  }, [isError, isPending, onStateChange]);

  if (isPending) {
    return <EditarProdutoLoading />;
  }

  if (isError && error.status === 404) {
    return <ProdutoNaoEncontrado />;
  }

  if (isError) {
    return (
      <section
        className="mt-8 rounded-xl border border-destructive/30 bg-destructive/5 p-6"
        role="alert"
      >
        <h2 className="font-semibold">Não foi possível carregar o produto</h2>

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

  return (
    <>
      {isFetching ? (
        <p className="mt-8 text-sm text-muted-foreground" role="status">
          Atualizando dados do produto…
        </p>
      ) : null}

      <UpdateProdutoForm
        produto={data.dados}
        onCancel={onCancel}
        onSuccess={onSuccess}
        onStateChange={onStateChange}
      />
    </>
  );
}
