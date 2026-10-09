import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, MessageSquarePlus, MessagesSquare } from "lucide-react";
import { ProdutoAvaliacoesParamsSchema } from "@repo/contracts";
import { Button } from "@/components/ui/button";
import { lerAvaliacoesProdutoSearchParams } from "@/features/produto/lib/list-avaliacoes-produto-search-params";
import { AvaliacoesProdutoFiltros } from "./_components/avaliacoes-produto-filtros";
import { AvaliacoesProdutoListagem } from "./_components/avaliacoes-produto-listagem";

export const metadata: Metadata = {
  title: "Avaliações do produto",
  description: "Listagem e gerenciamento das avaliações do produto.",
};

export default async function AvaliacoesProdutoPage({
  params,
  searchParams,
}: PageProps<"/produtos/[produtoId]/avaliacoes">) {
  const paramsRecebidos = await params;
  const resultadoParams =
    ProdutoAvaliacoesParamsSchema.safeParse(paramsRecebidos);

  if (!resultadoParams.success) {
    notFound();
  }

  const parametrosBusca = await searchParams;
  const filtros = lerAvaliacoesProdutoSearchParams(parametrosBusca);
  const errosFiltros = filtros.sucesso ? [] : filtros.erros;

  const { produtoId } = resultadoParams.data;

  return (
    <main className="min-h-svh bg-background">
      <div className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
        <Button asChild variant="ghost">
          <Link href={`/produtos/${produtoId}`}>
            <ArrowLeft aria-hidden="true" data-icon="inline-start" />
            Voltar para o produto
          </Link>
        </Button>

        <header className="mt-8">
          <div className="flex size-12 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <MessagesSquare aria-hidden="true" className="size-6" />
          </div>

          <div className="mt-6 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
                Avaliações do produto
              </h1>

              <p className="mt-3 max-w-2xl text-base leading-7 text-muted-foreground">
                Consulte as avaliações por autor, recomendação e página.
              </p>
            </div>

            <Button asChild className="self-start sm:self-auto">
              <Link href={`/produtos/${produtoId}/avaliacoes/nova`}>
                <MessageSquarePlus aria-hidden="true" />
                Nova avaliação
              </Link>
            </Button>
          </div>
        </header>

        {!filtros.sucesso ? (
          <div
            className="mt-8 rounded-xl border border-destructive/30 bg-destructive/5 p-4"
            role="alert"
          >
            <h2 className="font-medium">Não foi possível aplicar os filtros</h2>

            <ul className="mt-2 list-inside list-disc space-y-1 text-sm text-muted-foreground">
              {filtros.erros.map((erro, indice) => (
                <li key={`${erro.campo}-${indice}`}>{erro.mensagem}</li>
              ))}
            </ul>
          </div>
        ) : null}

        <AvaliacoesProdutoFiltros
          produtoId={produtoId}
          valores={filtros.valores}
          erros={errosFiltros}
        />

        {filtros.sucesso ? (
          <AvaliacoesProdutoListagem
            produtoId={produtoId}
            query={filtros.query}
          />
        ) : null}
      </div>
    </main>
  );
}
