import { StatusProduto, type StatusProdutoData } from "@repo/contracts";

const formatadorPreco = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

const formatadorPeso = new Intl.NumberFormat("pt-BR", {
  maximumFractionDigits: 3,
});

const formatadorData = new Intl.DateTimeFormat("pt-BR", {
  dateStyle: "long",
  timeZone: "UTC",
});

const formatadorDataHora = new Intl.DateTimeFormat("pt-BR", {
  dateStyle: "medium",
  timeStyle: "short",
  timeZone: "UTC",
});

export function formatarPrecoProduto(preco: string): string {
  return formatadorPreco.format(Number(preco));
}

export function formatarStatusProduto(status: StatusProdutoData): string {
  switch (status) {
    case StatusProduto.ATIVO:
      return "Ativo";
    case StatusProduto.RASCUNHO:
      return "Rascunho";
    case StatusProduto.DESCONTINUADO:
      return "Descontinuado";
  }
}

export function formatarPesoProduto(pesoKg: number | null): string {
  if (pesoKg === null) {
    return "Não informado";
  }

  return `${formatadorPeso.format(pesoKg)} kg`;
}

export function formatarDataProduto(data: string | null): string {
  if (data === null) {
    return "Não informada";
  }

  return formatadorData.format(new Date(`${data}T00:00:00.000Z`));
}

export function formatarDataHoraProduto(data: string | null): string {
  if (data === null) {
    return "Não informada";
  }

  return `${formatadorDataHora.format(new Date(data))} UTC`;
}
