"use client";

import { useCallback, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type RouteFormDialogControls = Readonly<{
  solicitarFechamento: () => void;
}>;

type RouteFormDialogProps = Readonly<{
  titulo: string;
  descricao: string;
  possuiAlteracoes: boolean;
  enviando: boolean;
  hrefRetornoFoco: string;
  largura?: "normal" | "ampla";
  children: (controls: RouteFormDialogControls) => ReactNode;
}>;

export function RouteFormDialog({
  titulo,
  descricao,
  possuiAlteracoes,
  enviando,
  hrefRetornoFoco,
  largura = "normal",
  children,
}: RouteFormDialogProps) {
  const router = useRouter();
  const [confirmacaoAberta, setConfirmacaoAberta] = useState(false);

  const solicitarFechamento = useCallback(() => {
    if (enviando) {
      return;
    }

    if (possuiAlteracoes) {
      setConfirmacaoAberta(true);
      return;
    }

    router.back();
  }, [enviando, possuiAlteracoes, router]);

  const descartarAlteracoes = useCallback(() => {
    setConfirmacaoAberta(false);
    router.back();
  }, [router]);

  return (
    <>
      <Dialog
        open
        onOpenChange={(aberto) => {
          if (!aberto) {
            solicitarFechamento();
          }
        }}
      >
        <DialogContent
          className={`max-h-[calc(100svh-2rem)] overflow-y-auto ${
            largura === "ampla" ? "max-w-4xl" : "max-w-2xl"
          }`}
          closeDisabled={enviando}
          onCloseAutoFocus={(event) => {
            event.preventDefault();

            const gatilho = document.querySelector<HTMLAnchorElement>(
              `a[href="${hrefRetornoFoco}"]`,
            );

            gatilho?.focus({
              preventScroll: true,
            });
          }}
          onEscapeKeyDown={(event) => {
            if (enviando) {
              event.preventDefault();
            }
          }}
          onInteractOutside={(event) => {
            if (enviando) {
              event.preventDefault();
            }
          }}
        >
          <DialogHeader className="pr-8">
            <DialogTitle>{titulo}</DialogTitle>
            <DialogDescription>{descricao}</DialogDescription>
          </DialogHeader>

          {children({
            solicitarFechamento,
          })}
        </DialogContent>
      </Dialog>

      <AlertDialog open={confirmacaoAberta} onOpenChange={setConfirmacaoAberta}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Descartar alterações?</AlertDialogTitle>

            <AlertDialogDescription>
              As informações preenchidas ainda não foram salvas. Se continuar,
              essas alterações serão perdidas.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter>
            <AlertDialogCancel>Continuar editando</AlertDialogCancel>

            <AlertDialogAction
              variant="destructive"
              onClick={descartarAlteracoes}
            >
              Descartar alterações
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
