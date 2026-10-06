import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, PencilLine } from "lucide-react";
import { ProdutoParamsSchema } from "@repo/contracts";
import { Button } from "@/components/ui/button";
import { EditarProduto } from "./_components/editar-produto";

export const metadata: Metadata = {
  title: "Editar produto",
  description: "Atualização dos dados do produto selecionado.",
};

export default async function EditarProdutoPage({
  params,
}: PageProps<"/produtos/[produtoId]/editar">) {
  const { produtoId } = await params;

  const resultadoParams = ProdutoParamsSchema.safeParse({
    id: produtoId,
  });

  if (!resultadoParams.success) {
    notFound();
  }

  return (
    <main className="min-h-svh bg-background">
      <div className="mx-auto w-full max-w-4xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
        <Button asChild variant="ghost">
          <Link href={`/produtos/${resultadoParams.data.id}`}>
            <ArrowLeft aria-hidden="true" data-icon="inline-start" />
            Voltar para o produto
          </Link>
        </Button>

        <header className="mt-8">
          <div className="flex size-12 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <PencilLine aria-hidden="true" className="size-6" />
          </div>

          <h1 className="mt-6 text-3xl font-semibold tracking-tight sm:text-4xl">
            Editar produto
          </h1>

          <p className="mt-3 max-w-2xl text-base leading-7 text-muted-foreground">
            Atualize somente as informações necessárias. Os campos não alterados
            serão preservados.
          </p>
        </header>

        <EditarProduto produtoId={resultadoParams.data.id} />
      </div>
    </main>
  );
}
