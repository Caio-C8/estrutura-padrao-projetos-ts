import { RespostaErroSchema, type RespostaErro } from "@repo/contracts";

type CreateErrorResponseOptions = Readonly<{
  status?: number;
  codigo?: string;
  mensagem?: string;
  requisicaoId?: string;
}>;

export function createErrorResponse({
  status = 503,
  codigo = "SERVICO_INDISPONIVEL",
  mensagem = "Serviço temporariamente indisponível.",
  requisicaoId = "e2e-api-error",
}: CreateErrorResponseOptions = {}): RespostaErro {
  return RespostaErroSchema.parse({
    status,
    sucesso: false,
    codigo,
    mensagem,
    erros: [],
    requisicaoId,
  });
}
