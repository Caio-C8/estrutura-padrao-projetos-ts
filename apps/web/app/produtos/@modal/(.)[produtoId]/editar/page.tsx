import { notFound } from "next/navigation";
import { ProdutoParamsSchema } from "@repo/contracts";
import { EditarProdutoModal } from "./_components/editar-produto-modal";

export default async function EditarProdutoModalPage({
  params,
}: PageProps<"/produtos/[produtoId]/editar">) {
  const { produtoId } = await params;

  const resultadoParams = ProdutoParamsSchema.safeParse({
    id: produtoId,
  });

  if (!resultadoParams.success) {
    notFound();
  }

  return <EditarProdutoModal produtoId={resultadoParams.data.id} />;
}
