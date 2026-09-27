import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { esperaInvalidos, parseValido } from "../../contract-assertions";
import {
  DataValidadeProdutoSchema,
  DescricaoProdutoSchema,
  DisponivelEmProdutoSchema,
  EstoqueProdutoSchema,
  NomeProdutoSchema,
  PesoKgProdutoSchema,
  PrecoProdutoSchema,
  SkuProdutoSchema,
  UrlManualProdutoSchema,
} from "../produto-fields.schema";

describe("SkuProdutoSchema", () => {
  it("remove espaços externos e converte para maiúsculas", () => {
    assert.equal(parseValido(SkuProdutoSchema, " produto-001 "), "PRODUTO-001");
  });

  it("valida obrigatoriedade, tipo e limite", () => {
    esperaInvalidos(SkuProdutoSchema, [
      "",
      "   ",
      "a".repeat(65),
      123,
      null,
      undefined,
    ]);
  });
});

describe("NomeProdutoSchema", () => {
  it("remove espaços externos", () => {
    assert.equal(parseValido(NomeProdutoSchema, " Produto "), "Produto");
  });

  it("valida obrigatoriedade e limite", () => {
    assert.equal(
      parseValido(NomeProdutoSchema, "a".repeat(64)),
      "a".repeat(64),
    );

    esperaInvalidos(NomeProdutoSchema, [
      "",
      "   ",
      "a".repeat(65),
      null,
      undefined,
    ]);
  });
});

describe("DescricaoProdutoSchema", () => {
  it("aceita uma descrição válida e aplica trim", () => {
    assert.equal(
      parseValido(DescricaoProdutoSchema, " Descrição "),
      "Descrição",
    );
  });

  it("rejeita string vazia e valores acima do limite", () => {
    esperaInvalidos(DescricaoProdutoSchema, [
      "",
      "   ",
      "a".repeat(2_001),
      null,
    ]);
  });
});

describe("UrlManualProdutoSchema", () => {
  it("aceita uma URL válida", () => {
    const url = "https://example.com/manual.pdf";

    assert.equal(parseValido(UrlManualProdutoSchema, url), url);
  });

  it("rejeita uma referência que não seja URL ou URL HTTP/HTTPS válida", () => {
    esperaInvalidos(UrlManualProdutoSchema, [
      "",
      "manual.pdf",
      "/uploads/manual.pdf",
      "ftp://example.com/manual.pdf",
      "mailto:suporte@example.com",
      123,
      null,
    ]);
  });
});

describe("EstoqueProdutoSchema", () => {
  it("aceita zero e inteiros positivos", () => {
    assert.equal(parseValido(EstoqueProdutoSchema, 0), 0);
    assert.equal(parseValido(EstoqueProdutoSchema, 10), 10);
  });

  it("rejeita negativos, decimais e tipos incorretos", () => {
    esperaInvalidos(EstoqueProdutoSchema, [
      -1,
      1.5,
      Number.NaN,
      Number.POSITIVE_INFINITY,
      "10",
      null,
    ]);
  });
});

describe("PrecoProdutoSchema", () => {
  it("aceita as representações decimais definidas", () => {
    const casos = [
      ["0.01", "0.01"],
      ["19.9", "19.9"],
      [" 19.90 ", "19.90"],
      ["9999999999.99", "9999999999.99"],
    ] as const;

    for (const [entrada, saida] of casos) {
      assert.equal(parseValido(PrecoProdutoSchema, entrada), saida);
    }
  });

  it("rejeita representações ambíguas ou fora dos limites", () => {
    esperaInvalidos(PrecoProdutoSchema, [
      "",
      "0",
      "0.00",
      "-1.00",
      "19,90",
      "19.999",
      "00.10",
      "01.00",
      "1e2",
      "10000000000.00",
      19.9,
      null,
    ]);
  });
});

describe("PesoKgProdutoSchema", () => {
  it("aceita números positivos", () => {
    assert.equal(parseValido(PesoKgProdutoSchema, 0.001), 0.001);
    assert.equal(parseValido(PesoKgProdutoSchema, 1.5), 1.5);
  });

  it("rejeita zero, negativos e valores não finitos", () => {
    esperaInvalidos(PesoKgProdutoSchema, [
      0,
      -1,
      Number.NaN,
      Number.POSITIVE_INFINITY,
      "1.5",
      null,
    ]);
  });
});

describe("DataValidadeProdutoSchema", () => {
  it("aceita datas de calendário válidas", () => {
    assert.equal(
      parseValido(DataValidadeProdutoSchema, "2027-09-05"),
      "2027-09-05",
    );

    assert.equal(
      parseValido(DataValidadeProdutoSchema, "2028-02-29"),
      "2028-02-29",
    );
  });

  it("rejeita datas impossíveis, horários e formatos diferentes", () => {
    esperaInvalidos(DataValidadeProdutoSchema, [
      "2027-02-29",
      "2027-13-01",
      "2027-09-05T00:00:00Z",
      "05/09/2027",
      new Date(),
      null,
    ]);
  });
});

describe("DisponivelEmProdutoSchema", () => {
  it("aceita UTC ou offset explícito", () => {
    const valores = [
      "2026-09-05T10:00:00Z",
      "2026-09-05T10:00:00.123Z",
      "2026-09-05T10:00:00-03:00",
    ];

    for (const valor of valores) {
      assert.equal(parseValido(DisponivelEmProdutoSchema, valor), valor);
    }
  });

  it("rejeita data sem timezone e offsets incompletos", () => {
    esperaInvalidos(DisponivelEmProdutoSchema, [
      "2026-09-05",
      "2026-09-05T10:00:00",
      "2026-09-05T10:00:00-03",
      "2026-09-05T10:00:00-0300",
      new Date(),
      null,
    ]);
  });
});
