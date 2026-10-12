"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import type { AvaliacaoProdutoResponse } from "@repo/contracts";
import { RouteFormDialog } from "@/app/produtos/_components/route-form-dialog";
import { EditarAvaliacaoProduto } from "@/app/produtos/[produtoId]/avaliacoes/[avaliacaoId]/editar/_components/editar-avaliacao-produto";
import type { UpdateAvaliacaoProdutoFormState } from "@/app/produtos/[produtoId]/avaliacoes/[avaliacaoId]/editar/_components/update-avaliacao-produto-form";

type EditarAvaliacaoProdutoModalProps = Readonly<{
  produtoId: string;
  avaliacaoId: string;
}>;

const ESTADO_INICIAL: UpdateAvaliacaoProdutoFormState = {
  possuiAlteracoes: false,
  enviando: false,
};

export function EditarAvaliacaoProdutoModal({
  produtoId,
  avaliacaoId,
}: EditarAvaliacaoProdutoModalProps) {
  const router = useRouter();

  const [estadoFormulario, setEstadoFormulario] =
    useState<UpdateAvaliacaoProdutoFormState>(ESTADO_INICIAL);

  const concluirAtualizacao = useCallback(
    (response: AvaliacaoProdutoResponse) => {
      router.replace(
        `/produtos/${response.dados.produtoId}/avaliacoes/${response.dados.id}`,
      );
    },
    [router],
  );

  return (
    <RouteFormDialog
      titulo="Editar avaliação"
      descricao="Atualize somente as informações necessárias. Os campos não alterados serão preservados."
      hrefRetornoFoco={`/produtos/${produtoId}/avaliacoes/${avaliacaoId}/editar`}
      possuiAlteracoes={estadoFormulario.possuiAlteracoes}
      enviando={estadoFormulario.enviando}
    >
      {({ solicitarFechamento }) => (
        <EditarAvaliacaoProduto
          produtoId={produtoId}
          avaliacaoId={avaliacaoId}
          onCancel={solicitarFechamento}
          onSuccess={concluirAtualizacao}
          onStateChange={setEstadoFormulario}
        />
      )}
    </RouteFormDialog>
  );
}
