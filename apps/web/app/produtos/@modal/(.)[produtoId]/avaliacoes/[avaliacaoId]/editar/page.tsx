import { notFound } from "next/navigation";
import { AvaliacaoProdutoParamsSchema } from "@repo/contracts";
import { EditarAvaliacaoProdutoModal } from "./_components/editar-avaliacao-produto-modal";

export default async function EditarAvaliacaoProdutoModalPage({
  params,
}: PageProps<"/produtos/[produtoId]/avaliacoes/[avaliacaoId]/editar">) {
  const paramsRecebidos = await params;

  const resultadoParams =
    AvaliacaoProdutoParamsSchema.safeParse(paramsRecebidos);

  if (!resultadoParams.success) {
    notFound();
  }

  const { produtoId, avaliacaoId } = resultadoParams.data;

  return (
    <EditarAvaliacaoProdutoModal
      produtoId={produtoId}
      avaliacaoId={avaliacaoId}
    />
  );
}
