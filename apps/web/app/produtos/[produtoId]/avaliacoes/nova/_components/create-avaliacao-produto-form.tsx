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
import type { AvaliacaoProdutoResponse } from "@repo/contracts";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useCreateAvaliacaoProduto } from "@/features/produto/api/use-create-avaliacao-produto";
import { AvaliacaoProdutoFormFields } from "@/features/produto/forms/avaliacao-produto-form-fields";
import {
  CREATE_AVALIACAO_PRODUTO_FORM_DEFAULT_VALUES,
  CreateAvaliacaoProdutoFormSchema,
  type CreateAvaliacaoProdutoFormData,
  type CreateAvaliacaoProdutoFormInput,
} from "@/features/produto/forms/create-avaliacao-produto-form.schema";
import { isApiError } from "@/lib/api/core/api-error";

export type CreateAvaliacaoProdutoFormState = Readonly<{
  possuiAlteracoes: boolean;
  enviando: boolean;
}>;

type CreateAvaliacaoProdutoFormProps = Readonly<{
  produtoId: string;
  onCancel?: () => void;
  onSuccess?: (response: AvaliacaoProdutoResponse) => void;
  onStateChange?: (state: CreateAvaliacaoProdutoFormState) => void;
}>;

const CAMPOS_FORMULARIO = new Set<FieldPath<CreateAvaliacaoProdutoFormInput>>([
  "autorNome",
  "nota",
  "comentario",
  "recomenda",
]);

function ehCampoFormulario(
  campo: string,
): campo is FieldPath<CreateAvaliacaoProdutoFormInput> {
  return CAMPOS_FORMULARIO.has(
    campo as FieldPath<CreateAvaliacaoProdutoFormInput>,
  );
}

export function CreateAvaliacaoProdutoForm({
  produtoId,
  onCancel,
  onSuccess,
  onStateChange,
}: CreateAvaliacaoProdutoFormProps) {
  const router = useRouter();
  const mutation = useCreateAvaliacaoProduto(produtoId);
  const [erroGeral, setErroGeral] = useState<string | null>(null);

  const form = useForm<
    CreateAvaliacaoProdutoFormInput,
    unknown,
    CreateAvaliacaoProdutoFormData
  >({
    resolver: zodResolver(CreateAvaliacaoProdutoFormSchema),
    defaultValues: CREATE_AVALIACAO_PRODUTO_FORM_DEFAULT_VALUES,
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

  const onSubmit: SubmitHandler<CreateAvaliacaoProdutoFormData> = async (
    dados,
  ) => {
    setErroGeral(null);
    mutation.reset();

    try {
      const response = await mutation.mutateAsync(dados);

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

      const camposComErro: FieldPath<CreateAvaliacaoProdutoFormInput>[] = [];

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

  const hrefCancelar = `/produtos/${produtoId}/avaliacoes`;

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
            <p className="font-medium">Não foi possível criar a avaliação</p>

            <p className="mt-1 text-sm text-muted-foreground">{erroGeral}</p>
          </div>
        ) : null}

        <AvaliacaoProdutoFormFields
          disabled={enviando}
          legend="Dados da nova avaliação"
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
              <Link href={hrefCancelar}>Cancelar</Link>
            </Button>
          )}

          <Button type="submit" disabled={enviando}>
            {enviando ? (
              <>
                <LoaderCircle aria-hidden="true" className="animate-spin" />
                Salvando…
              </>
            ) : (
              "Salvar avaliação"
            )}
          </Button>
        </div>
      </form>
    </FormProvider>
  );
}
