"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { ExternalLink, PackageX, Pencil, RefreshCw } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useProduto } from "@/features/produto/api/use-produto";
import {
  formatarDataHoraProduto,
  formatarDataProduto,
  formatarPesoProduto,
  formatarPrecoProduto,
  formatarStatusProduto,
} from "@/features/produto/lib/produto-formatters";
import { DeleteProdutoDialog } from "./delete-produto-dialog";

type ProdutoDetalheProps = Readonly<{
  produtoId: string;
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

function ProdutoDetalheLoading() {
  return (
    <section
      className="mt-8 space-y-6"
      aria-label="Carregando produto"
      aria-busy="true"
    >
      <div className="rounded-xl border bg-card p-6">
        <Skeleton className="h-8 w-2/3" />
        <Skeleton className="mt-3 h-4 w-1/3" />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {Array.from({ length: 2 }, (_, index) => (
          <div key={index} className="rounded-xl border bg-card p-6">
            <Skeleton className="h-5 w-1/2" />

            <div className="mt-6 grid gap-5 sm:grid-cols-2">
              {Array.from({ length: 4 }, (_, fieldIndex) => (
                <div key={fieldIndex}>
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

export function ProdutoDetalhe({ produtoId }: ProdutoDetalheProps) {
  const { data, error, isError, isFetching, isPending, refetch } =
    useProduto(produtoId);

  if (isPending) {
    return <ProdutoDetalheLoading />;
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

  const produto = data.dados;

  return (
    <section className="mt-8 space-y-6" aria-labelledby="produto-nome">
      <header className="rounded-xl border bg-card p-6 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0">
            <h2
              id="produto-nome"
              className="wrap-break-word text-2xl font-semibold tracking-tight"
            >
              {produto.nome}
            </h2>

            <p className="mt-2 break-all text-sm text-muted-foreground">
              {produto.sku}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="outline">
              {formatarStatusProduto(produto.status)}
            </Badge>

            <Button asChild size="sm" variant="outline">
              <Link href={`/produtos/${produto.id}/editar`}>
                <Pencil aria-hidden="true" />
                Editar produto
              </Link>
            </Button>

            <DeleteProdutoDialog
              produtoId={produto.id}
              produtoNome={produto.nome}
            />
          </div>
        </div>

        {isFetching ? (
          <p className="mt-4 text-sm text-muted-foreground" role="status">
            Atualizando produto…
          </p>
        ) : null}
      </header>

      <div className="grid gap-6 lg:grid-cols-2">
        <section
          className="rounded-xl border bg-card p-6"
          aria-labelledby="informacoes-heading"
        >
          <h3 id="informacoes-heading" className="font-semibold">
            Informações
          </h3>

          <dl className="mt-6 grid gap-5 sm:grid-cols-2">
            <CampoDetalhe rotulo="Preço">
              {formatarPrecoProduto(produto.preco)}
            </CampoDetalhe>

            <CampoDetalhe rotulo="Peso">
              {formatarPesoProduto(produto.pesoKg)}
            </CampoDetalhe>

            <CampoDetalhe rotulo="Estoque">{produto.estoque}</CampoDetalhe>

            <CampoDetalhe rotulo="Quantidade de vendas">
              {produto.quantidadeVendas}
            </CampoDetalhe>

            <CampoDetalhe rotulo="Em destaque">
              {produto.emDestaque ? "Sim" : "Não"}
            </CampoDetalhe>

            <CampoDetalhe rotulo="Data de validade">
              {formatarDataProduto(produto.dataValidade)}
            </CampoDetalhe>

            <CampoDetalhe rotulo="Disponível em">
              {formatarDataHoraProduto(produto.disponivelEm)}
            </CampoDetalhe>

            <CampoDetalhe rotulo="Manual">
              {produto.urlManual ? (
                <a
                  href={produto.urlManual}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 rounded-sm text-primary underline underline-offset-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  Abrir manual em nova aba
                  <ExternalLink aria-hidden="true" className="size-4" />
                </a>
              ) : (
                "Não informado"
              )}
            </CampoDetalhe>

            <CampoDetalhe rotulo="Descrição" ocuparLinha>
              {produto.descricao ?? "Não informada"}
            </CampoDetalhe>
          </dl>
        </section>

        <section
          className="rounded-xl border bg-card p-6"
          aria-labelledby="registro-heading"
        >
          <h3 id="registro-heading" className="font-semibold">
            Registro
          </h3>

          <dl className="mt-6 grid gap-5 sm:grid-cols-2">
            <CampoDetalhe rotulo="Criado em">
              {formatarDataHoraProduto(produto.createdAt)}
            </CampoDetalhe>

            <CampoDetalhe rotulo="Atualizado em">
              {formatarDataHoraProduto(produto.updatedAt)}
            </CampoDetalhe>
          </dl>
        </section>
      </div>
    </section>
  );
}
