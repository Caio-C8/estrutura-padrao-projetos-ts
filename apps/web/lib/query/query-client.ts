import { environmentManager, QueryClient } from "@tanstack/react-query";
import { isApiError } from "@/lib/api/core/api-error";

export function deveRepetirLeitura(
  failureCount: number,
  error: unknown,
): boolean {
  if (failureCount >= 1 || !isApiError(error)) {
    return false;
  }

  if (error.categoria === "rede" || error.categoria === "timeout") {
    return true;
  }

  return (
    error.categoria === "http" && error.status !== null && error.status >= 500
  );
}

export function criarQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: deveRepetirLeitura,
      },
      mutations: {
        retry: false,
      },
    },
  });
}

let browserQueryClient: QueryClient | undefined;

export function obterQueryClient(): QueryClient {
  if (environmentManager.isServer()) {
    return criarQueryClient();
  }

  browserQueryClient ??= criarQueryClient();

  return browserQueryClient;
}
