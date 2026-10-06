export function normalizarEntradaDecimalDaDireita(
  valor: string,
  maximoDigitos?: number,
): string {
  let digitos = valor.replace(/\D/g, "");

  if (maximoDigitos !== undefined && digitos.length > maximoDigitos) {
    digitos = digitos.slice(0, maximoDigitos);
  }

  if (digitos === "") {
    return "";
  }

  const digitosNormalizados = digitos.replace(/^0+(?=\d)/, "");

  const valorPreenchido = digitosNormalizados.padStart(3, "0");
  const inteiros = valorPreenchido.slice(0, -2);
  const decimais = valorPreenchido.slice(-2);

  return `${inteiros}.${decimais}`;
}

export function formatarDecimalParaMascara(valor: string): string {
  const valorNormalizado = valor.trim().replace(",", ".");

  if (valorNormalizado === "") {
    return "";
  }

  const [inteirosRecebidos = "0", decimaisRecebidos = ""] =
    valorNormalizado.split(".");

  const inteiros =
    inteirosRecebidos.replace(/\D/g, "").replace(/^0+(?=\d)/, "") || "0";

  const decimais = decimaisRecebidos
    .replace(/\D/g, "")
    .padEnd(2, "0")
    .slice(0, 2);

  const inteirosAgrupados = inteiros.replace(/\B(?=(\d{3})+(?!\d))/g, ".");

  return `${inteirosAgrupados},${decimais}`;
}
