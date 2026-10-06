import { describe, expect, it } from "vitest";
import {
  formatarDecimalParaMascara,
  normalizarEntradaDecimalDaDireita,
} from "../decimal-input-mask";

describe("normalizarEntradaDecimalDaDireita", () => {
  it.each([
    ["1", "0.01"],
    ["12", "0.12"],
    ["123", "1.23"],
    ["37098", "370.98"],
    ["1.234,56", "1234.56"],
    ["", ""],
  ])("converte %s para %s", (entrada, esperado) => {
    expect(normalizarEntradaDecimalDaDireita(entrada)).toBe(esperado);
  });

  it("limita a quantidade de dígitos quando há limite", () => {
    expect(normalizarEntradaDecimalDaDireita("1234567890123", 12)).toBe(
      "1234567890.12",
    );
  });
});

describe("formatarDecimalParaMascara", () => {
  it.each([
    ["0.01", "0,01"],
    ["0.12", "0,12"],
    ["1.23", "1,23"],
    ["370.98", "370,98"],
    ["1234.56", "1.234,56"],
    ["", ""],
  ])("formata %s como %s", (entrada, esperado) => {
    expect(formatarDecimalParaMascara(entrada)).toBe(esperado);
  });
});
