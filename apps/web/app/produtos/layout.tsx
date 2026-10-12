import type { ReactNode } from "react";
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
      {children}
      {modal}
    </ProdutosQueryProvider>
  );
}
