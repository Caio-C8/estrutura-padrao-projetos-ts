"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { LoaderCircle, Trash2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button, buttonVariants } from "@/components/ui/button";
import { produtoQueryKeys } from "@/features/produto/api/produto-query-keys";
import { useDeleteProduto } from "@/features/produto/api/use-delete-produto";
import { toast } from "sonner";

type DeleteProdutoDialogProps = Readonly<{
  produtoId: string;
  produtoNome: string;
}>;

export function DeleteProdutoDialog({
  produtoId,
  produtoNome,
}: DeleteProdutoDialogProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const mutation = useDeleteProduto(produtoId);
  const [aberto, setAberto] = useState(false);

  function alterarEstadoDialog(proximoEstado: boolean): void {
    if (mutation.isPending) {
      return;
    }

    mutation.reset();
    setAberto(proximoEstado);
  }

  async function confirmarExclusao(): Promise<void> {
    mutation.reset();

    try {
      await mutation.mutateAsync();

      queryClient.removeQueries({
        queryKey: produtoQueryKeys.detalhe(produtoId),
        exact: true,
      });

      toast.success("Produto excluído com sucesso.", {
        description: "O produto e suas avaliações foram removidos.",
      });

      router.replace("/produtos");
    } catch {
      return;
    }
  }

  return (
    <AlertDialog open={aberto} onOpenChange={alterarEstadoDialog}>
      <AlertDialogTrigger asChild>
        <Button size="sm" variant="destructive">
          <Trash2 aria-hidden="true" />
          Excluir produto
        </Button>
      </AlertDialogTrigger>

      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Excluir este produto?</AlertDialogTitle>

          <AlertDialogDescription>
            Ao excluir “{produtoNome}”, suas avaliações também serão excluídas.
            Essa ação não poderá ser desfeita.
          </AlertDialogDescription>
        </AlertDialogHeader>

        {mutation.isError ? (
          <div
            className="rounded-lg border border-destructive/30 bg-destructive/5 p-4"
            role="alert"
          >
            <p className="font-medium">Não foi possível excluir o produto</p>

            <p className="mt-1 text-sm text-muted-foreground">
              {mutation.error.message}
            </p>

            {mutation.error.requisicaoId ? (
              <p className="mt-2 text-xs text-muted-foreground">
                Referência: {mutation.error.requisicaoId}
              </p>
            ) : null}
          </div>
        ) : null}

        <AlertDialogFooter>
          <AlertDialogCancel disabled={mutation.isPending}>
            Cancelar
          </AlertDialogCancel>

          <AlertDialogAction
            className={buttonVariants({
              variant: "destructive",
            })}
            disabled={mutation.isPending}
            onClick={(event) => {
              event.preventDefault();
              void confirmarExclusao();
            }}
          >
            {mutation.isPending ? (
              <>
                <LoaderCircle aria-hidden="true" className="animate-spin" />
                Excluindo…
              </>
            ) : (
              <>
                <Trash2 aria-hidden="true" />
                Excluir definitivamente
              </>
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
