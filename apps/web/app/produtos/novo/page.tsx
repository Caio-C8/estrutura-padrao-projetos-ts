import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, PackagePlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CreateProdutoForm } from "./_components/create-produto-form";

export const metadata: Metadata = {
  title: "Novo produto",
  description: "Cadastro de um novo produto.",
};

export default function NovoProdutoPage() {
  return (
    <main className="min-h-svh bg-background">
      <div className="mx-auto w-full max-w-4xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
        <Button asChild variant="ghost">
          <Link href="/produtos">
            <ArrowLeft aria-hidden="true" data-icon="inline-start" />
            Voltar para produtos
          </Link>
        </Button>

        <header className="mt-8">
          <div className="flex size-12 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <PackagePlus aria-hidden="true" className="size-6" />
          </div>

          <h1 className="mt-6 text-3xl font-semibold tracking-tight sm:text-4xl">
            Novo produto
          </h1>

          <p className="mt-3 max-w-2xl text-base leading-7 text-muted-foreground">
            Preencha os dados abaixo para adicionar um produto ao catálogo.
            Campos marcados com asterisco são obrigatórios.
          </p>
        </header>

        <CreateProdutoForm />
      </div>
    </main>
  );
}
