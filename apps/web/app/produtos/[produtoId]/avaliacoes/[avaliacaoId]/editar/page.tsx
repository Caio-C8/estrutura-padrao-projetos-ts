import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, PencilLine } from "lucide-react";
import { AvaliacaoProdutoParamsSchema } from "@repo/contracts";
import { Button } from "@/components/ui/button";
import { EditarAvaliacaoProduto } from "./_components/editar-avaliacao-produto";

export const metadata: Metadata = {
  title: "Editar avaliação",
  description: "Atualização dos dados da avaliação selecionada.",
};

export default async function EditarAvaliacaoProdutoPage({
  params,
}: PageProps<"/produtos/[produtoId]/avaliacoes/[avaliacaoId]/editar">) {
  const paramsRecebidos = await params;

  const resultadoParams =
    AvaliacaoProdutoParamsSchema.safeParse(paramsRecebidos);

  if (!resultadoParams.success) {
    notFound();
  }

  const { produtoId, avaliacaoId } = resultadoParams.data;

  return (
    <main className="min-h-svh bg-background">
      <div className="mx-auto w-full max-w-4xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
        <Button asChild variant="ghost">
          <Link href={`/produtos/${produtoId}/avaliacoes/${avaliacaoId}`}>
            <ArrowLeft aria-hidden="true" data-icon="inline-start" />
            Voltar para a avaliação
          </Link>
        </Button>

        <header className="mt-8">
          <div className="flex size-12 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <PencilLine aria-hidden="true" className="size-6" />
          </div>

          <h1 className="mt-6 text-3xl font-semibold tracking-tight sm:text-4xl">
            Editar avaliação
          </h1>

          <p className="mt-3 max-w-2xl text-base leading-7 text-muted-foreground">
            Atualize somente as informações necessárias. Os campos não alterados
            serão preservados.
          </p>
        </header>

        <EditarAvaliacaoProduto
          produtoId={produtoId}
          avaliacaoId={avaliacaoId}
        />
      </div>
    </main>
  );
}
