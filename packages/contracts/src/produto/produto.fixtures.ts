import { StatusProduto } from "./status-produto.schema";

export const PRODUTO_ID_VALIDO = "875035dc-7f98-4096-b062-11b72d07c427";

export function criarProdutoMinimoValido() {
  return {
    sku: " produto-001 ",
    nome: " Produto de exemplo ",
    preco: "19.90",
  };
}

export function criarProdutoDetalhadoValido() {
  return {
    id: PRODUTO_ID_VALIDO,
    sku: "PRODUTO-001",
    nome: "Produto de exemplo",
    descricao: "Descrição do produto",
    urlManual: "https://example.com/manual.pdf",
    status: StatusProduto.ATIVO,
    emDestaque: true,
    estoque: 10,
    preco: "19.90",
    pesoKg: 1.5,
    quantidadeVendas: "100",
    dataValidade: "2027-09-05",
    disponivelEm: "2026-09-06T15:00:00.000Z",
    createdAt: "2026-09-05T12:00:00.000Z",
    updatedAt: "2026-09-06T15:00:00.000Z",
  };
}

export function criarProdutoResumoValido() {
  const produto = criarProdutoDetalhadoValido();

  return {
    id: produto.id,
    sku: produto.sku,
    nome: produto.nome,
    status: produto.status,
    emDestaque: produto.emDestaque,
    estoque: produto.estoque,
    preco: produto.preco,
    pesoKg: produto.pesoKg,
    quantidadeVendas: produto.quantidadeVendas,
    dataValidade: produto.dataValidade,
    disponivelEm: produto.disponivelEm,
    createdAt: produto.createdAt,
    updatedAt: produto.updatedAt,
  };
}
