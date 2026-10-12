"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import type { ProdutoResponse } from "@repo/contracts";
import { RouteFormDialog } from "@/app/produtos/_components/route-form-dialog";
import {
  CreateProdutoForm,
  type CreateProdutoFormState,
} from "@/app/produtos/novo/_components/create-produto-form";

const ESTADO_INICIAL: CreateProdutoFormState = {
  possuiAlteracoes: false,
  enviando: false,
};

export function CreateProdutoModal() {
  const router = useRouter();

  const [estadoFormulario, setEstadoFormulario] =
    useState<CreateProdutoFormState>(ESTADO_INICIAL);

  const concluirCriacao = useCallback(
    (response: ProdutoResponse) => {
      router.replace(`/produtos/${response.dados.id}`);
    },
    [router],
  );

  return (
    <RouteFormDialog
      titulo="Novo produto"
      descricao="Preencha os dados para adicionar um produto ao catálogo."
      hrefRetornoFoco="/produtos/novo"
      largura="ampla"
      possuiAlteracoes={estadoFormulario.possuiAlteracoes}
      enviando={estadoFormulario.enviando}
    >
      {({ solicitarFechamento }) => (
        <CreateProdutoForm
          onCancel={solicitarFechamento}
          onSuccess={concluirCriacao}
          onStateChange={setEstadoFormulario}
        />
      )}
    </RouteFormDialog>
  );
}
