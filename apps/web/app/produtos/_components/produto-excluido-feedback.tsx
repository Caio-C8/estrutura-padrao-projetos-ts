"use client";

import { useEffect } from "react";
import { CircleCheck } from "lucide-react";

export function ProdutoExcluidoFeedback() {
  useEffect(() => {
    const url = new URL(window.location.href);

    url.searchParams.delete("resultado");

    const query = url.searchParams.toString();

    const proximaUrl = `${url.pathname}${query ? `?${query}` : ""}${url.hash}`;

    window.history.replaceState(null, "", proximaUrl);
  }, []);

  return (
    <div
      className="mt-8 flex items-start gap-3 rounded-xl border border-emerald-600/30 bg-emerald-600/5 p-4"
      role="status"
    >
      <CircleCheck
        aria-hidden="true"
        className="mt-0.5 size-5 shrink-0 text-emerald-600 dark:text-emerald-400"
      />

      <div>
        <p className="font-medium">Produto excluído com sucesso</p>

        <p className="mt-1 text-sm text-muted-foreground">
          O produto e suas avaliações foram removidos.
        </p>
      </div>
    </div>
  );
}
