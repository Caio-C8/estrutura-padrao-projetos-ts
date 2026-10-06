import {
  UpdateProdutoSchema,
  type ProdutoDetalhadoResponse,
  type UpdateProdutoData,
} from "@repo/contracts";
import type {
  UpdateProdutoFormData,
  UpdateProdutoFormInput,
} from "./update-produto-form.schema";

export type UpdateProdutoDirtyFields = Readonly<
  Partial<Record<keyof UpdateProdutoFormInput, boolean>>
>;

function preencherComZero(valor: number, tamanho = 2): string {
  return String(valor).padStart(tamanho, "0");
}

function formatarDataHoraParaInput(valor: string | null): string {
  if (valor === null) {
    return "";
  }

  const data = new Date(valor);

  const ano = preencherComZero(data.getFullYear(), 4);
  const mes = preencherComZero(data.getMonth() + 1);
  const dia = preencherComZero(data.getDate());
  const hora = preencherComZero(data.getHours());
  const minuto = preencherComZero(data.getMinutes());

  return `${ano}-${mes}-${dia}T${hora}:${minuto}`;
}

export function criarUpdateProdutoFormDefaultValues(
  produto: ProdutoDetalhadoResponse,
): UpdateProdutoFormInput {
  return {
    sku: produto.sku,
    nome: produto.nome,
    descricao: produto.descricao ?? "",
    urlManual: produto.urlManual ?? "",
    status: produto.status,
    emDestaque: produto.emDestaque,
    estoque: String(produto.estoque),
    preco: produto.preco,
    pesoKg: produto.pesoKg === null ? "" : produto.pesoKg.toFixed(2),
    dataValidade: produto.dataValidade ?? "",
    disponivelEm: formatarDataHoraParaInput(produto.disponivelEm),
  };
}

export function criarUpdateProdutoBody(
  valores: UpdateProdutoFormData,
  camposAlterados: UpdateProdutoDirtyFields,
): UpdateProdutoData {
  return UpdateProdutoSchema.parse({
    ...(camposAlterados.sku ? { sku: valores.sku } : {}),
    ...(camposAlterados.nome ? { nome: valores.nome } : {}),
    ...(camposAlterados.descricao ? { descricao: valores.descricao } : {}),
    ...(camposAlterados.urlManual ? { urlManual: valores.urlManual } : {}),
    ...(camposAlterados.status ? { status: valores.status } : {}),
    ...(camposAlterados.emDestaque ? { emDestaque: valores.emDestaque } : {}),
    ...(camposAlterados.estoque ? { estoque: valores.estoque } : {}),
    ...(camposAlterados.preco ? { preco: valores.preco } : {}),
    ...(camposAlterados.pesoKg ? { pesoKg: valores.pesoKg } : {}),
    ...(camposAlterados.dataValidade
      ? { dataValidade: valores.dataValidade }
      : {}),
    ...(camposAlterados.disponivelEm
      ? { disponivelEm: valores.disponivelEm }
      : {}),
  });
}
