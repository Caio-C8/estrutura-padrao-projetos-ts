import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, MessagesSquare } from "lucide-react";
import { AvaliacaoProdutoParamsSchema } from "@repo/contracts";
import { Button } from "@/components/ui/button";
import { AvaliacaoProdutoDetalhe } from "./_components/avaliacao-produto-detalhe";

export const metadata: Metadata = {
  title: "Detalhes da avaliação",
  description: "Informações detalhadas da avaliação selecionada.",
};

export default async function AvaliacaoProdutoDetalhePage({
  params,
}: PageProps<"/produtos/[produtoId]/avaliacoes/[avaliacaoId]">) {
  const paramsRecebidos = await params;
  const resultadoParams =
    AvaliacaoProdutoParamsSchema.safeParse(paramsRecebidos);

  if (!resultadoParams.success) {
    notFound();
  }

  const { produtoId, avaliacaoId } = resultadoParams.data;

  return (
    <main className="min-h-svh bg-background">
      <div className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
        <Button asChild variant="ghost">
          <Link href={`/produtos/${produtoId}/avaliacoes`}>
            <ArrowLeft aria-hidden="true" data-icon="inline-start" />
            Voltar para avaliações
          </Link>
        </Button>

        <header className="mt-8">
          <div className="flex size-12 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <MessagesSquare aria-hidden="true" className="size-6" />
          </div>

          <h1 className="mt-6 text-3xl font-semibold tracking-tight sm:text-4xl">
            Detalhes da avaliação
          </h1>

          <p className="mt-3 max-w-2xl text-base leading-7 text-muted-foreground">
            Consulte a nota, o comentário e a recomendação enviada pelo autor.
          </p>
        </header>

        <AvaliacaoProdutoDetalhe
          produtoId={produtoId}
          avaliacaoId={avaliacaoId}
        />
      </div>
    </main>
  );
}
