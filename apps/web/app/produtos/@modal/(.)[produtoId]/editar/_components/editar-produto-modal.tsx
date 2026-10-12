"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import type { ProdutoResponse } from "@repo/contracts";
import { RouteFormDialog } from "@/app/produtos/_components/route-form-dialog";
import { EditarProduto } from "@/app/produtos/[produtoId]/editar/_components/editar-produto";
import type { UpdateProdutoFormState } from "@/app/produtos/[produtoId]/editar/_components/update-produto-form";

type EditarProdutoModalProps = Readonly<{
  produtoId: string;
}>;

const ESTADO_INICIAL: UpdateProdutoFormState = {
  possuiAlteracoes: false,
  enviando: false,
};

export function EditarProdutoModal({ produtoId }: EditarProdutoModalProps) {
  const router = useRouter();

  const [estadoFormulario, setEstadoFormulario] =
    useState<UpdateProdutoFormState>(ESTADO_INICIAL);

  const concluirAtualizacao = useCallback(
    (response: ProdutoResponse) => {
      router.replace(`/produtos/${response.dados.id}`);
    },
    [router],
  );

  return (
    <RouteFormDialog
      titulo="Editar produto"
      descricao="Atualize somente as informações necessárias. Os campos não alterados serão preservados."
      largura="ampla"
      hrefRetornoFoco={`/produtos/${produtoId}/editar`}
      possuiAlteracoes={estadoFormulario.possuiAlteracoes}
      enviando={estadoFormulario.enviando}
    >
      {({ solicitarFechamento }) => (
        <EditarProduto
          produtoId={produtoId}
          onCancel={solicitarFechamento}
          onSuccess={concluirAtualizacao}
          onStateChange={setEstadoFormulario}
        />
      )}
    </RouteFormDialog>
  );
}
