import assert from "node:assert/strict";
import { describe, it } from "node:test";
import type * as z from "zod";
import { CreateProdutoSchema } from "../create-produto.schema";
import { UpdateProdutoSchema } from "../update-produto.schema";

function obterMensagensPorCampo(
  schema: z.ZodType,
  entrada: unknown,
): ReadonlyMap<string, string> {
  const resultado = schema.safeParse(entrada);

  if (resultado.success) {
    assert.fail("Era esperado que a validação falhasse.");
  }

  const mensagens = new Map<string, string>();

  for (const issue of resultado.error.issues) {
    const campo = issue.path.join(".");

    if (!mensagens.has(campo)) {
      mensagens.set(campo, issue.message);
    }
  }

  return mensagens;
}

function esperarMensagem(
  mensagens: ReadonlyMap<string, string>,
  campo: string,
  mensagemEsperada: string,
): void {
  assert.equal(
    mensagens.get(campo),
    mensagemEsperada,
    `Mensagem inesperada para o campo "${campo}".`,
  );
}

function verificarAusenciaDeMensagemTecnica(
  mensagens: ReadonlyMap<string, string>,
): void {
  for (const [campo, mensagem] of mensagens) {
    assert.doesNotMatch(
      mensagem,
      /invalid input|expected|received|string|boolean/i,
      `O campo "${campo}" expôs uma mensagem técnica: "${mensagem}".`,
    );
  }
}

describe("mensagens de validação de Produto", () => {
  it("produz mensagens amigáveis para o payload exercitado na API", () => {
    const mensagens = obterMensagensPorCampo(CreateProdutoSchema, {
      sku: "produto123",
      nome: "Produto 123",
      descricao: "Este é um produto 123",
      urlManual: "teste",
      status: "RASCUNHO",
      emDestaque: "false",
      estoque: "10",
      preco: "370.988",
      pesoKg: "0.1",
      dataValidade: "2029-10-01",
      disponivelEm: "2026-12-02",
    });

    assert.equal(mensagens.size, 6);

    esperarMensagem(
      mensagens,
      "urlManual",
      "A URL do manual deve ser uma URL HTTP ou HTTPS válida.",
    );

    esperarMensagem(
      mensagens,
      "emDestaque",
      "Selecione se o produto deve ficar em destaque.",
    );

    esperarMensagem(
      mensagens,
      "estoque",
      "Informe um estoque válido usando um número inteiro.",
    );

    esperarMensagem(
      mensagens,
      "preco",
      "O preço deve ser um decimal positivo com até 10 dígitos inteiros e 2 casas decimais.",
    );

    esperarMensagem(
      mensagens,
      "pesoKg",
      "Informe um peso válido usando um número maior que zero.",
    );

    esperarMensagem(
      mensagens,
      "disponivelEm",
      "A data de disponibilidade deve estar em um formato válido.",
    );

    verificarAusenciaDeMensagemTecnica(mensagens);
  });

  it("personaliza os erros de tipo de todos os campos de entrada", () => {
    const mensagens = obterMensagensPorCampo(CreateProdutoSchema, {
      sku: 123,
      nome: true,
      descricao: [],
      urlManual: 42,
      status: "EXCLUIDO",
      emDestaque: "true",
      estoque: "10",
      preco: 370.99,
      pesoKg: "0.1",
      dataValidade: new Date("2029-10-01T00:00:00.000Z"),
      disponivelEm: new Date("2026-12-02T10:00:00.000Z"),
    });

    assert.equal(mensagens.size, 11);

    esperarMensagem(mensagens, "sku", "Informe um SKU válido.");

    esperarMensagem(mensagens, "nome", "Informe um nome válido.");

    esperarMensagem(mensagens, "descricao", "Informe uma descrição válida.");

    esperarMensagem(
      mensagens,
      "urlManual",
      "A URL do manual deve ser uma URL HTTP ou HTTPS válida.",
    );

    esperarMensagem(
      mensagens,
      "status",
      "Selecione um status válido para o produto.",
    );

    esperarMensagem(
      mensagens,
      "emDestaque",
      "Selecione se o produto deve ficar em destaque.",
    );

    esperarMensagem(
      mensagens,
      "estoque",
      "Informe um estoque válido usando um número inteiro.",
    );

    esperarMensagem(
      mensagens,
      "preco",
      "Informe um preço válido com no máximo duas casas decimais.",
    );

    esperarMensagem(
      mensagens,
      "pesoKg",
      "Informe um peso válido usando um número maior que zero.",
    );

    esperarMensagem(
      mensagens,
      "dataValidade",
      "A data de validade deve estar em um formato válido.",
    );

    esperarMensagem(
      mensagens,
      "disponivelEm",
      "A data de disponibilidade deve estar em um formato válido.",
    );

    verificarAusenciaDeMensagemTecnica(mensagens);
  });

  it("reutiliza as mensagens amigáveis na atualização", () => {
    const mensagens = obterMensagensPorCampo(UpdateProdutoSchema, {
      emDestaque: "false",
      estoque: "10",
      pesoKg: "0.1",
    });

    assert.equal(mensagens.size, 3);

    esperarMensagem(
      mensagens,
      "emDestaque",
      "Selecione se o produto deve ficar em destaque.",
    );

    esperarMensagem(
      mensagens,
      "estoque",
      "Informe um estoque válido usando um número inteiro.",
    );

    esperarMensagem(
      mensagens,
      "pesoKg",
      "Informe um peso válido usando um número maior que zero.",
    );

    verificarAusenciaDeMensagemTecnica(mensagens);
  });
});
