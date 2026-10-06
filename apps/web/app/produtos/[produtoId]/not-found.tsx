import Link from "next/link";
import { PackageX } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ProdutoNotFound() {
  return (
    <main className="min-h-svh bg-background">
      <div className="mx-auto flex w-full max-w-3xl flex-col items-center px-4 py-20 text-center sm:px-6">
        <PackageX
          aria-hidden="true"
          className="size-12 text-muted-foreground"
        />

        <h1 className="mt-6 text-3xl font-semibold tracking-tight">
          Produto não encontrado
        </h1>

        <p className="mt-3 max-w-md text-muted-foreground">
          O produto pode ter sido removido ou o endereço informado não é válido.
        </p>

        <Button asChild className="mt-8">
          <Link href="/produtos">Voltar para produtos</Link>
        </Button>
      </div>
    </main>
  );
}
