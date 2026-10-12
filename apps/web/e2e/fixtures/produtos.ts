import {
  ListProdutosResponseSchema,
  ProdutoResponseSchema,
  StatusProduto,
  type ListProdutosResponse,
  type ProdutoDetalhadoResponse,
  type ProdutoResponse,
  type ProdutoResumoResponse,
} from "@repo/contracts";

export const PRODUTO_NOTEBOOK_ID = "b5c5f7e3-4c5f-4f61-9c67-f9da7a2584e4";

export const PRODUTO_MOUSE_ID = "b0f5c73d-d7f8-47e4-a75a-9bf45e4f9667";

export const PRODUTO_NOTEBOOK = {
  id: PRODUTO_NOTEBOOK_ID,
  sku: "NOTEBOOK-001",
  nome: "Notebook profissional",
  status: StatusProduto.ATIVO,
  emDestaque: true,
  estoque: 12,
  preco: "3799.90",
  pesoKg: 1.5,
  quantidadeVendas: "15",
  dataValidade: null,
  disponivelEm: "2026-10-01T10:00:00.000Z",
  createdAt: "2026-09-01T10:00:00.000Z",
  updatedAt: "2026-10-01T10:00:00.000Z",
} satisfies ProdutoResumoResponse;

export const PRODUTO_MOUSE = {
  id: PRODUTO_MOUSE_ID,
  sku: "MOUSE-001",
  nome: "Mouse sem fio",
  status: StatusProduto.RASCUNHO,
  emDestaque: false,
  estoque: 30,
  preco: "149.90",
  pesoKg: 0.2,
  quantidadeVendas: "4",
  dataValidade: null,
  disponivelEm: null,
  createdAt: "2026-09-10T10:00:00.000Z",
  updatedAt: "2026-09-10T10:00:00.000Z",
} satisfies ProdutoResumoResponse;

type CreateListProdutosResponseOptions = Readonly<{
  dados?: readonly ProdutoResumoResponse[];
  total?: number;
  pagina?: number;
  limite?: number;
}>;

export function createListProdutosResponse({
  dados = [PRODUTO_NOTEBOOK, PRODUTO_MOUSE],
  total = dados.length,
  pagina = 1,
  limite = 20,
}: CreateListProdutosResponseOptions = {}): ListProdutosResponse {
  return ListProdutosResponseSchema.parse({
    status: 200,
    sucesso: true,
    mensagem: "Produtos listados com sucesso.",
    dados: [...dados],
    meta: {
      total,
      pagina,
      ultimaPagina: Math.max(1, Math.ceil(total / limite)),
      limite,
    },
  });
}

export const PRODUTO_TECLADO_ID = "c06d7e7f-4f58-4e1d-9e61-6f8248aa33d4";

export const PRODUTO_TECLADO = {
  id: PRODUTO_TECLADO_ID,
  sku: "TECLADO-001",
  nome: "Teclado mecânico",
  descricao: null,
  urlManual: null,
  status: StatusProduto.RASCUNHO,
  emDestaque: true,
  estoque: 0,
  preco: "199.90",
  pesoKg: null,
  quantidadeVendas: "0",
  dataValidade: null,
  disponivelEm: null,
  createdAt: "2026-10-12T10:00:00.000Z",
  updatedAt: "2026-10-12T10:00:00.000Z",
} satisfies ProdutoDetalhadoResponse;

export const PRODUTO_TECLADO_ATUALIZADO = {
  ...PRODUTO_TECLADO,
  nome: "Teclado mecânico RGB",
  updatedAt: "2026-10-12T11:00:00.000Z",
} satisfies ProdutoDetalhadoResponse;

export const PRODUTO_TECLADO_RESUMO = {
  id: PRODUTO_TECLADO.id,
  sku: PRODUTO_TECLADO.sku,
  nome: PRODUTO_TECLADO.nome,
  status: PRODUTO_TECLADO.status,
  emDestaque: PRODUTO_TECLADO.emDestaque,
  estoque: PRODUTO_TECLADO.estoque,
  preco: PRODUTO_TECLADO.preco,
  pesoKg: PRODUTO_TECLADO.pesoKg,
  quantidadeVendas: PRODUTO_TECLADO.quantidadeVendas,
  dataValidade: PRODUTO_TECLADO.dataValidade,
  disponivelEm: PRODUTO_TECLADO.disponivelEm,
  createdAt: PRODUTO_TECLADO.createdAt,
  updatedAt: PRODUTO_TECLADO.updatedAt,
} satisfies ProdutoResumoResponse;

type CreateProdutoResponseOptions = Readonly<{
  produto?: ProdutoDetalhadoResponse;
  status?: number;
  mensagem?: string;
}>;

export function createProdutoResponse({
  produto = PRODUTO_TECLADO,
  status = 200,
  mensagem = "Produto consultado com sucesso.",
}: CreateProdutoResponseOptions = {}): ProdutoResponse {
  return ProdutoResponseSchema.parse({
    status,
    sucesso: true,
    mensagem,
    dados: produto,
  });
}
