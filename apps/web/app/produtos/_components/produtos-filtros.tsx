import Form from "next/form";
import Link from "next/link";
import type { ErroCampo } from "@repo/contracts";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import {
  LIMITES_PRODUTOS_POR_PAGINA,
  type ProdutosFiltrosValores,
} from "@/features/produto/lib/list-produtos-search-params";

type ProdutosFiltrosProps = Readonly<{
  valores: ProdutosFiltrosValores;
  erros?: readonly ErroCampo[];
}>;

const selectClassName =
  "h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs outline-none transition-colors focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 aria-invalid:border-destructive aria-invalid:ring-[3px] aria-invalid:ring-destructive/20";

const camposComControle = new Set([
  "pesquisa",
  "status",
  "emDestaque",
  "limite",
]);

function obterErro(
  erros: readonly ErroCampo[],
  campo: string,
): ErroCampo | undefined {
  return erros.find((erro) => erro.campo === campo);
}

function MensagemCampo({
  id,
  erro,
}: Readonly<{
  id: string;
  erro: ErroCampo | undefined;
}>) {
  if (!erro) {
    return null;
  }

  return (
    <p id={id} className="text-sm font-medium text-destructive">
      {erro.mensagem}
    </p>
  );
}

export function ProdutosFiltros({ valores, erros = [] }: ProdutosFiltrosProps) {
  const erroPesquisa = obterErro(erros, "pesquisa");
  const erroStatus = obterErro(erros, "status");
  const erroEmDestaque = obterErro(erros, "emDestaque");
  const erroLimite = obterErro(erros, "limite");

  const errosGerais = erros.filter(
    (erro) => !camposComControle.has(erro.campo),
  );

  return (
    <Form
      action="/produtos"
      className="mt-8 rounded-xl border bg-card p-4 shadow-sm sm:p-6"
    >
      {erros.length > 0 ? (
        <p className="sr-only" role="alert">
          Existem filtros inválidos. Corrija os campos destacados.
        </p>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="space-y-2 sm:col-span-2">
          <label
            htmlFor="pesquisa"
            className={cn(
              "text-sm font-medium",
              erroPesquisa && "text-destructive",
            )}
          >
            Pesquisa
          </label>

          <Input
            id="pesquisa"
            name="pesquisa"
            type="search"
            maxLength={100}
            defaultValue={valores.pesquisa}
            placeholder="SKU, nome ou descrição"
            aria-invalid={erroPesquisa ? true : undefined}
            aria-describedby={erroPesquisa ? "pesquisa-erro" : undefined}
          />

          <MensagemCampo id="pesquisa-erro" erro={erroPesquisa} />
        </div>

        <div className="space-y-2">
          <label
            htmlFor="status"
            className={cn(
              "text-sm font-medium",
              erroStatus && "text-destructive",
            )}
          >
            Status
          </label>

          <select
            id="status"
            name="status"
            defaultValue={valores.status}
            className={selectClassName}
            aria-invalid={erroStatus ? true : undefined}
            aria-describedby={erroStatus ? "status-erro" : undefined}
          >
            <option value="">Todos</option>
            <option value="RASCUNHO">Rascunho</option>
            <option value="ATIVO">Ativo</option>
            <option value="DESCONTINUADO">Descontinuado</option>
          </select>

          <MensagemCampo id="status-erro" erro={erroStatus} />
        </div>

        <div className="space-y-2">
          <label
            htmlFor="emDestaque"
            className={cn(
              "text-sm font-medium",
              erroEmDestaque && "text-destructive",
            )}
          >
            Destaque
          </label>

          <select
            id="emDestaque"
            name="emDestaque"
            defaultValue={valores.emDestaque}
            className={selectClassName}
            aria-invalid={erroEmDestaque ? true : undefined}
            aria-describedby={erroEmDestaque ? "em-destaque-erro" : undefined}
          >
            <option value="">Todos</option>
            <option value="true">Em destaque</option>
            <option value="false">Sem destaque</option>
          </select>

          <MensagemCampo id="em-destaque-erro" erro={erroEmDestaque} />
        </div>

        <div className="space-y-2">
          <label
            htmlFor="limite"
            className={cn(
              "text-sm font-medium",
              erroLimite && "text-destructive",
            )}
          >
            Itens por página
          </label>

          <select
            id="limite"
            name="limite"
            defaultValue={valores.limite}
            className={selectClassName}
            aria-invalid={erroLimite ? true : undefined}
            aria-describedby={erroLimite ? "limite-erro" : undefined}
          >
            {LIMITES_PRODUTOS_POR_PAGINA.map((limite) => (
              <option key={limite} value={limite}>
                {limite}
              </option>
            ))}
          </select>

          <MensagemCampo id="limite-erro" erro={erroLimite} />
        </div>
      </div>

      {errosGerais.length > 0 ? (
        <div
          className="mt-5 rounded-lg border border-destructive/30 bg-destructive/5 p-4"
          role="alert"
        >
          <p className="text-sm font-medium text-destructive">
            Alguns parâmetros da URL são inválidos:
          </p>

          <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-destructive">
            {errosGerais.map((erro) => (
              <li key={`${erro.campo}-${erro.mensagem}`}>{erro.mensagem}</li>
            ))}
          </ul>
        </div>
      ) : null}

      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <Button type="submit">Aplicar filtros</Button>

        <Button asChild type="button" variant="outline">
          <Link href="/produtos">Limpar filtros</Link>
        </Button>
      </div>
    </Form>
  );
}
