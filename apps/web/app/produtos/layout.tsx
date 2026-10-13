import type { ReactNode } from "react";
import { TriangleAlert } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ProdutosQueryProvider } from "./query-provider";

type ProdutosLayoutProps = Readonly<{
  children: ReactNode;
  modal: ReactNode;
}>;

export default function ProdutosLayout({
  children,
  modal,
}: ProdutosLayoutProps) {
  return (
    <ProdutosQueryProvider>
      <div className="border-b bg-muted/30">
        <div className="mx-auto w-full max-w-6xl px-4 py-4 sm:px-6 lg:px-8">
          <Alert
            role="note"
            aria-labelledby="aviso-exemplo-publico-titulo"
            className="border-amber-300 bg-amber-50 text-amber-950 [&>svg]:text-amber-700"
          >
            <TriangleAlert aria-hidden="true" />

            <AlertTitle id="aviso-exemplo-publico-titulo">
              Exemplo público e didático
            </AlertTitle>

            <AlertDescription>
              Este CRUD não exige autenticação. Qualquer cliente com acesso à
              API pode criar, editar ou excluir registros. Use apenas dados
              fictícios; o exemplo não é adequado para informações reais,
              privadas ou sensíveis.
            </AlertDescription>
          </Alert>
        </div>
      </div>

      {children}
      {modal}
    </ProdutosQueryProvider>
  );
}
