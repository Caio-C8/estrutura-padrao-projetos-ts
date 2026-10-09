import Link from "next/link";
import { Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  LIMITES_AVALIACOES_PRODUTO,
  type AvaliacoesProdutoFiltrosValores,
  type ErroFiltroAvaliacoesProduto,
} from "@/features/produto/lib/list-avaliacoes-produto-search-params";

type AvaliacoesProdutoFiltrosProps = Readonly<{
  produtoId: string;
  valores: AvaliacoesProdutoFiltrosValores;
  erros: readonly ErroFiltroAvaliacoesProduto[];
}>;

function obterErro(
  erros: readonly ErroFiltroAvaliacoesProduto[],
  campo: keyof AvaliacoesProdutoFiltrosValores,
): ErroFiltroAvaliacoesProduto | undefined {
  return erros.find((erro) => erro.campo === campo);
}

export function AvaliacoesProdutoFiltros({
  produtoId,
  valores,
  erros,
}: AvaliacoesProdutoFiltrosProps) {
  const erroPesquisa = obterErro(erros, "pesquisa");
  const erroRecomenda = obterErro(erros, "recomenda");
  const erroLimite = obterErro(erros, "limite");

  const recomendaPossuiOpcao =
    valores.recomenda === "" ||
    valores.recomenda === "true" ||
    valores.recomenda === "false";

  const limitePossuiOpcao = LIMITES_AVALIACOES_PRODUTO.some(
    (limite) => String(limite) === valores.limite,
  );

  return (
    <form
      action={`/produtos/${produtoId}/avaliacoes`}
      method="get"
      className="mt-8 rounded-xl border bg-card p-4 sm:p-6"
      aria-label="Filtros das avaliações"
    >
      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_14rem_11rem]">
        <div className="space-y-2">
          <Label
            htmlFor="avaliacoes-pesquisa"
            className={erroPesquisa ? "text-destructive" : undefined}
          >
            Pesquisar autor
          </Label>

          <Input
            id="avaliacoes-pesquisa"
            name="pesquisa"
            type="search"
            maxLength={100}
            defaultValue={valores.pesquisa}
            placeholder="Nome do autor"
            aria-invalid={Boolean(erroPesquisa)}
            aria-describedby={
              erroPesquisa ? "avaliacoes-pesquisa-erro" : undefined
            }
          />

          {erroPesquisa ? (
            <p
              id="avaliacoes-pesquisa-erro"
              className="text-sm text-destructive"
            >
              {erroPesquisa.mensagem}
            </p>
          ) : null}
        </div>

        <div className="space-y-2">
          <Label
            htmlFor="avaliacoes-recomenda"
            className={erroRecomenda ? "text-destructive" : undefined}
          >
            Recomendação
          </Label>

          <select
            id="avaliacoes-recomenda"
            name="recomenda"
            defaultValue={valores.recomenda}
            aria-invalid={Boolean(erroRecomenda)}
            aria-describedby={
              erroRecomenda ? "avaliacoes-recomenda-erro" : undefined
            }
            className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs outline-none transition-colors focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 aria-invalid:border-destructive aria-invalid:ring-[3px] aria-invalid:ring-destructive/20"
          >
            {!recomendaPossuiOpcao ? (
              <option value={valores.recomenda}>Valor inválido</option>
            ) : null}

            <option value="">Todas</option>
            <option value="true">Recomendam</option>
            <option value="false">Não recomendam</option>
          </select>

          {erroRecomenda ? (
            <p
              id="avaliacoes-recomenda-erro"
              className="text-sm text-destructive"
            >
              {erroRecomenda.mensagem}
            </p>
          ) : null}
        </div>

        <div className="space-y-2">
          <Label
            htmlFor="avaliacoes-limite"
            className={erroLimite ? "text-destructive" : undefined}
          >
            Por página
          </Label>

          <select
            id="avaliacoes-limite"
            name="limite"
            defaultValue={valores.limite}
            aria-invalid={Boolean(erroLimite)}
            aria-describedby={erroLimite ? "avaliacoes-limite-erro" : undefined}
            className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs outline-none transition-colors focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 aria-invalid:border-destructive aria-invalid:ring-[3px] aria-invalid:ring-destructive/20"
          >
            {!limitePossuiOpcao ? (
              <option value={valores.limite}>Valor inválido</option>
            ) : null}

            {LIMITES_AVALIACOES_PRODUTO.map((limite) => (
              <option key={limite} value={String(limite)}>
                {limite} avaliações
              </option>
            ))}
          </select>

          {erroLimite ? (
            <p id="avaliacoes-limite-erro" className="text-sm text-destructive">
              {erroLimite.mensagem}
            </p>
          ) : null}
        </div>
      </div>

      <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <Button asChild variant="outline">
          <Link href={`/produtos/${produtoId}/avaliacoes`}>
            <X aria-hidden="true" />
            Limpar filtros
          </Link>
        </Button>

        <Button type="submit">
          <Search aria-hidden="true" />
          Aplicar filtros
        </Button>
      </div>
    </form>
  );
}
