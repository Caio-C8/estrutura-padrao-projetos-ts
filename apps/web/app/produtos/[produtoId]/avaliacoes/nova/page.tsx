import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, MessageSquarePlus } from "lucide-react";
import { ProdutoAvaliacoesParamsSchema } from "@repo/contracts";
import { Button } from "@/components/ui/button";
import { CreateAvaliacaoProdutoForm } from "./_components/create-avaliacao-produto-form";

export const metadata: Metadata = {
  title: "Nova avaliação",
  description: "Cadastro de uma nova avaliação para o produto.",
};

export default async function NovaAvaliacaoProdutoPage({
  params,
}: PageProps<"/produtos/[produtoId]/avaliacoes/nova">) {
  const paramsRecebidos = await params;
  const resultadoParams =
    ProdutoAvaliacoesParamsSchema.safeParse(paramsRecebidos);

  if (!resultadoParams.success) {
    notFound();
  }

  const { produtoId } = resultadoParams.data;

  return (
    <main className="min-h-svh bg-background">
      <div className="mx-auto w-full max-w-4xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
        <Button asChild variant="ghost">
          <Link href={`/produtos/${produtoId}/avaliacoes`}>
            <ArrowLeft aria-hidden="true" data-icon="inline-start" />
            Voltar para avaliações
          </Link>
        </Button>

        <header className="mt-8">
          <div className="flex size-12 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <MessageSquarePlus aria-hidden="true" className="size-6" />
          </div>

          <h1 className="mt-6 text-3xl font-semibold tracking-tight sm:text-4xl">
            Nova avaliação
          </h1>

          <p className="mt-3 max-w-2xl text-base leading-7 text-muted-foreground">
            Preencha os dados abaixo para adicionar uma avaliação ao produto.
            Campos marcados com asterisco são obrigatórios.
          </p>
        </header>

        <CreateAvaliacaoProdutoForm produtoId={produtoId} />
      </div>
    </main>
  );
}
