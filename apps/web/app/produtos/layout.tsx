import type { ReactNode } from "react";
import { ProdutosQueryProvider } from "./query-provider";

type ProdutosLayoutProps = Readonly<{
  children: ReactNode;
}>;

export default function ProdutosLayout({ children }: ProdutosLayoutProps) {
  return <ProdutosQueryProvider>{children}</ProdutosQueryProvider>;
}
