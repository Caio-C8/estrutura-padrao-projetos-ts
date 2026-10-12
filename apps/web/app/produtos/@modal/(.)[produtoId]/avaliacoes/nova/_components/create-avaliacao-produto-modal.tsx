"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import type { AvaliacaoProdutoResponse } from "@repo/contracts";
import { RouteFormDialog } from "@/app/produtos/_components/route-form-dialog";
import {
  CreateAvaliacaoProdutoForm,
  type CreateAvaliacaoProdutoFormState,
} from "@/app/produtos/[produtoId]/avaliacoes/nova/_components/create-avaliacao-produto-form";

type CreateAvaliacaoProdutoModalProps = Readonly<{
  produtoId: string;
}>;

const ESTADO_INICIAL: CreateAvaliacaoProdutoFormState = {
  possuiAlteracoes: false,
  enviando: false,
};

export function CreateAvaliacaoProdutoModal({
  produtoId,
}: CreateAvaliacaoProdutoModalProps) {
  const router = useRouter();
  const [estadoFormulario, setEstadoFormulario] =
    useState<CreateAvaliacaoProdutoFormState>(ESTADO_INICIAL);

  const concluirCriacao = useCallback(
    (response: AvaliacaoProdutoResponse) => {
      router.replace(
        `/produtos/${response.dados.produtoId}/avaliacoes/${response.dados.id}`,
      );
    },
    [router],
  );

  return (
    <RouteFormDialog
      titulo="Nova avaliação"
      descricao="Preencha os dados para adicionar uma avaliação ao produto."
      possuiAlteracoes={estadoFormulario.possuiAlteracoes}
      enviando={estadoFormulario.enviando}
    >
      {({ solicitarFechamento }) => (
        <CreateAvaliacaoProdutoForm
          produtoId={produtoId}
          onCancel={solicitarFechamento}
          onSuccess={concluirCriacao}
          onStateChange={setEstadoFormulario}
        />
      )}
    </RouteFormDialog>
  );
}
