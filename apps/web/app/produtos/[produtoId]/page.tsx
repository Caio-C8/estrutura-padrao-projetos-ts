import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, PackageSearch } from "lucide-react";
import { ProdutoParamsSchema } from "@repo/contracts";
import { Button } from "@/components/ui/button";
import { ProdutoDetalhe } from "./_components/produto-detalhe";

export const metadata: Metadata = {
  title: "Detalhes do produto",
  description: "Informações detalhadas do produto selecionado.",
};

export default async function ProdutoDetalhePage({
  params,
}: PageProps<"/produtos/[produtoId]">) {
  const { produtoId } = await params;

  const resultadoParams = ProdutoParamsSchema.safeParse({
    id: produtoId,
  });

  if (!resultadoParams.success) {
    notFound();
  }

  return (
    <main className="min-h-svh bg-background">
      <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
        <Button asChild variant="ghost">
          <Link href="/produtos">
            <ArrowLeft aria-hidden="true" data-icon="inline-start" />
            Voltar para produtos
          </Link>
        </Button>

        <header className="mt-8">
          <div className="flex size-12 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <PackageSearch aria-hidden="true" className="size-6" />
          </div>

          <h1 className="mt-6 text-3xl font-semibold tracking-tight sm:text-4xl">
            Detalhes do produto
          </h1>

          <p className="mt-3 max-w-2xl text-base leading-7 text-muted-foreground">
            Consulte as informações comerciais, disponibilidade e dados de
            registro do produto.
          </p>
        </header>

        <ProdutoDetalhe produtoId={resultadoParams.data.id} />
      </div>
    </main>
  );
}
