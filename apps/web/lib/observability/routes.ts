type RotaObservavel = Readonly<{
  pattern: RegExp;
  nome: string;
}>;

const ROTAS_OBSERVAVEIS: readonly RotaObservavel[] = [
  {
    pattern: /^\/$/,
    nome: "inicio",
  },
  {
    pattern: /^\/produtos$/,
    nome: "produto.lista",
  },
  {
    pattern: /^\/produtos\/novo$/,
    nome: "produto.criacao",
  },
  {
    pattern: /^\/produtos\/[^/]+\/editar$/,
    nome: "produto.edicao",
  },
  {
    pattern: /^\/produtos\/[^/]+\/avaliacoes$/,
    nome: "avaliacao.lista",
  },
  {
    pattern: /^\/produtos\/[^/]+\/avaliacoes\/nova$/,
    nome: "avaliacao.criacao",
  },
  {
    pattern: /^\/produtos\/[^/]+\/avaliacoes\/[^/]+\/editar$/,
    nome: "avaliacao.edicao",
  },
  {
    pattern: /^\/produtos\/[^/]+\/avaliacoes\/[^/]+$/,
    nome: "avaliacao.detalhe",
  },
  {
    pattern: /^\/produtos\/[^/]+$/,
    nome: "produto.detalhe",
  },
];

function removerBarrasFinais(pathname: string): string {
  if (pathname === "/") {
    return pathname;
  }

  return pathname.replace(/\/+$/, "");
}

export function normalizarRotaObservavel(pathname: string): string {
  const pathnameNormalizado = removerBarrasFinais(pathname);

  const rota = ROTAS_OBSERVAVEIS.find(({ pattern }) =>
    pattern.test(pathnameNormalizado),
  );

  return rota?.nome ?? "rota.desconhecida";
}
