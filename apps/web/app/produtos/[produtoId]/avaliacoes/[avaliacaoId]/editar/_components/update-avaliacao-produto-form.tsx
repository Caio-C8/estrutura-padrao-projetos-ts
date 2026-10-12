"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  FormProvider,
  useForm,
  type FieldPath,
  type SubmitHandler,
} from "react-hook-form";
import { LoaderCircle } from "lucide-react";
import { toast } from "sonner";
import type {
  AvaliacaoProdutoDetalhadoResponse,
  AvaliacaoProdutoResponse,
} from "@repo/contracts";
import { Button } from "@/components/ui/button";
import { useUpdateAvaliacaoProduto } from "@/features/produto/api/use-update-avaliacao-produto";
import { AvaliacaoProdutoFormFields } from "@/features/produto/forms/avaliacao-produto-form-fields";
import {
  criarUpdateAvaliacaoProdutoBody,
  criarUpdateAvaliacaoProdutoFormDefaultValues,
} from "@/features/produto/forms/update-avaliacao-produto-form.mapper";
import {
  UpdateAvaliacaoProdutoFormSchema,
  type UpdateAvaliacaoProdutoFormData,
  type UpdateAvaliacaoProdutoFormInput,
} from "@/features/produto/forms/update-avaliacao-produto-form.schema";
import { isApiError } from "@/lib/api/core/api-error";

export type UpdateAvaliacaoProdutoFormState = Readonly<{
  possuiAlteracoes: boolean;
  enviando: boolean;
}>;

type UpdateAvaliacaoProdutoFormProps = Readonly<{
  avaliacao: AvaliacaoProdutoDetalhadoResponse;
  onCancel?: () => void;
  onSuccess?: (response: AvaliacaoProdutoResponse) => void;
  onStateChange?: (state: UpdateAvaliacaoProdutoFormState) => void;
}>;

const CAMPOS_FORMULARIO = new Set<FieldPath<UpdateAvaliacaoProdutoFormInput>>([
  "autorNome",
  "nota",
  "comentario",
  "recomenda",
]);

function ehCampoFormulario(
  campo: string,
): campo is FieldPath<UpdateAvaliacaoProdutoFormInput> {
  return CAMPOS_FORMULARIO.has(
    campo as FieldPath<UpdateAvaliacaoProdutoFormInput>,
  );
}

export function UpdateAvaliacaoProdutoForm({
  avaliacao,
  onCancel,
  onSuccess,
  onStateChange,
}: UpdateAvaliacaoProdutoFormProps) {
  const router = useRouter();

  const mutation = useUpdateAvaliacaoProduto(avaliacao.produtoId, avaliacao.id);

  const [erroGeral, setErroGeral] = useState<string | null>(null);

  const form = useForm<
    UpdateAvaliacaoProdutoFormInput,
    unknown,
    UpdateAvaliacaoProdutoFormData
  >({
    resolver: zodResolver(UpdateAvaliacaoProdutoFormSchema),
    defaultValues: criarUpdateAvaliacaoProdutoFormDefaultValues(avaliacao),
    mode: "onSubmit",
    reValidateMode: "onChange",
  });

  const enviando = form.formState.isSubmitting || mutation.isPending;
  const possuiAlteracoes = form.formState.isDirty;

  useEffect(() => {
    onStateChange?.({
      possuiAlteracoes,
      enviando,
    });
  }, [enviando, onStateChange, possuiAlteracoes]);

  const onSubmit: SubmitHandler<UpdateAvaliacaoProdutoFormData> = async (
    dados,
  ) => {
    setErroGeral(null);
    mutation.reset();

    const body = criarUpdateAvaliacaoProdutoBody(
      dados,
      form.formState.dirtyFields,
    );

    try {
      const response = await mutation.mutateAsync(body);

      toast.success(response.mensagem);

      if (onSuccess) {
        onSuccess(response);
        return;
      }

      router.replace(
        `/produtos/${response.dados.produtoId}/avaliacoes/${response.dados.id}`,
      );
    } catch (error: unknown) {
      if (!isApiError(error)) {
        setErroGeral("Ocorreu um erro inesperado. Tente novamente.");
        return;
      }

      const camposComErro: FieldPath<UpdateAvaliacaoProdutoFormInput>[] = [];

      for (const erro of error.erros) {
        if (!ehCampoFormulario(erro.campo)) {
          continue;
        }

        form.setError(erro.campo, {
          type: "server",
          message: erro.mensagem,
        });

        camposComErro.push(erro.campo);
      }

      const primeiroCampoComErro = camposComErro[0];

      if (primeiroCampoComErro) {
        form.setFocus(primeiroCampoComErro);
        return;
      }

      setErroGeral(error.message);
    }
  };

  const hrefDetalhe = `/produtos/${avaliacao.produtoId}/avaliacoes/${avaliacao.id}`;

  return (
    <FormProvider {...form}>
      <form
        className="mt-8 space-y-6"
        noValidate
        aria-busy={enviando}
        onSubmit={form.handleSubmit(onSubmit)}
      >
        {erroGeral ? (
          <div
            className="rounded-xl border border-destructive/30 bg-destructive/5 p-4"
            role="alert"
          >
            <p className="font-medium">
              Não foi possível atualizar a avaliação
            </p>

            <p className="mt-1 text-sm text-muted-foreground">{erroGeral}</p>
          </div>
        ) : null}

        <AvaliacaoProdutoFormFields
          disabled={enviando}
          legend="Dados da avaliação"
        />

        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          {enviando ? (
            <Button type="button" variant="outline" disabled>
              Cancelar
            </Button>
          ) : onCancel ? (
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancelar
            </Button>
          ) : (
            <Button asChild variant="outline">
              <Link href={hrefDetalhe}>Cancelar</Link>
            </Button>
          )}

          <Button type="submit" disabled={enviando || !possuiAlteracoes}>
            {enviando ? (
              <>
                <LoaderCircle aria-hidden="true" className="animate-spin" />
                Salvando…
              </>
            ) : (
              "Salvar alterações"
            )}
          </Button>
        </div>

        {!possuiAlteracoes && !enviando ? (
          <p className="text-right text-sm text-muted-foreground" role="status">
            Altere pelo menos um campo para salvar.
          </p>
        ) : null}
      </form>
    </FormProvider>
  );
}
