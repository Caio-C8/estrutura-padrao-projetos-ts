import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, PackageSearch, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProdutosFiltros } from "./_components/produtos-filtros";
import { ProdutosListagem } from "./_components/produtos-listagem";
import { lerProdutosSearchParams } from "@/features/produto/lib/list-produtos-search-params";

export const metadata: Metadata = {
  title: "Produtos",
  description: "Listagem e gerenciamento dos produtos cadastrados.",
};

export default async function ProdutosPage({
  searchParams,
}: PageProps<"/produtos">) {
  const filtros = lerProdutosSearchParams(await searchParams);
  const errosFiltros = filtros.sucesso ? [] : filtros.erros;

  return (
    <main className="min-h-svh bg-background">
      <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
        <Button asChild variant="ghost">
          <Link href="/">
            <ArrowLeft aria-hidden="true" data-icon="inline-start" />
            Voltar para o início
          </Link>
        </Button>

        <header className="mt-8 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="flex size-12 items-center justify-center rounded-xl bg-primary text-primary-foreground">
              <PackageSearch aria-hidden="true" className="size-6" />
            </div>

            <h1 className="mt-6 text-3xl font-semibold tracking-tight sm:text-4xl">
              Produtos
            </h1>

            <p className="mt-3 max-w-2xl text-base leading-7 text-muted-foreground">
              Consulte o catálogo usando pesquisa, status, destaque e paginação.
            </p>
          </div>

          <Button asChild className="self-start sm:self-auto">
            <Link href="/produtos/novo">
              <Plus aria-hidden="true" />
              Novo produto
            </Link>
          </Button>
        </header>

        <ProdutosFiltros valores={filtros.valores} erros={errosFiltros} />

        {filtros.sucesso ? <ProdutosListagem query={filtros.query} /> : null}
      </div>
    </main>
  );
}
