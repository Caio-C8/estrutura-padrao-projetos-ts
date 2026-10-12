import { notFound } from "next/navigation";
import { ProdutoAvaliacoesParamsSchema } from "@repo/contracts";
import { CreateAvaliacaoProdutoModal } from "./_components/create-avaliacao-produto-modal";

export default async function NovaAvaliacaoProdutoModalPage({
  params,
}: PageProps<"/produtos/[produtoId]/avaliacoes/nova">) {
  const paramsRecebidos = await params;
  const resultadoParams =
    ProdutoAvaliacoesParamsSchema.safeParse(paramsRecebidos);

  if (!resultadoParams.success) {
    notFound();
  }

  return (
    <CreateAvaliacaoProdutoModal produtoId={resultadoParams.data.produtoId} />
  );
}
