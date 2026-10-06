"use client";

import { useState } from "react";
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
import type { ProdutoDetalhadoResponse } from "@repo/contracts";
import { Button } from "@/components/ui/button";
import { isApiError } from "@/lib/api/core/api-error";
import { useUpdateProduto } from "@/features/produto/api/use-update-produto";
import { ProdutoFormFields } from "@/features/produto/forms/produto-form-fields";
import {
  criarUpdateProdutoBody,
  criarUpdateProdutoFormDefaultValues,
} from "@/features/produto/forms/update-produto-form.mapper";
import {
  UpdateProdutoFormSchema,
  type UpdateProdutoFormData,
  type UpdateProdutoFormInput,
} from "@/features/produto/forms/update-produto-form.schema";
import { toast } from "sonner";

type UpdateProdutoFormProps = Readonly<{
  produto: ProdutoDetalhadoResponse;
}>;

const CAMPOS_FORMULARIO = new Set<FieldPath<UpdateProdutoFormInput>>([
  "sku",
  "nome",
  "descricao",
  "urlManual",
  "status",
  "emDestaque",
  "estoque",
  "preco",
  "pesoKg",
  "dataValidade",
  "disponivelEm",
]);

function ehCampoFormulario(
  campo: string,
): campo is FieldPath<UpdateProdutoFormInput> {
  return CAMPOS_FORMULARIO.has(campo as FieldPath<UpdateProdutoFormInput>);
}

export function UpdateProdutoForm({ produto }: UpdateProdutoFormProps) {
  const router = useRouter();
  const mutation = useUpdateProduto(produto.id);
  const [erroGeral, setErroGeral] = useState<string | null>(null);

  const form = useForm<UpdateProdutoFormInput, unknown, UpdateProdutoFormData>({
    resolver: zodResolver(UpdateProdutoFormSchema),
    defaultValues: criarUpdateProdutoFormDefaultValues(produto),
    mode: "onSubmit",
    reValidateMode: "onChange",
  });

  const enviando = form.formState.isSubmitting || mutation.isPending;
  const possuiAlteracoes = form.formState.isDirty;

  const onSubmit: SubmitHandler<UpdateProdutoFormData> = async (dados) => {
    setErroGeral(null);
    mutation.reset();

    const body = criarUpdateProdutoBody(dados, form.formState.dirtyFields);

    try {
      const response = await mutation.mutateAsync(body);

      toast.success(response.mensagem);

      router.replace(`/produtos/${response.dados.id}`);
    } catch (error: unknown) {
      if (!isApiError(error)) {
        setErroGeral("Ocorreu um erro inesperado. Tente novamente.");
        return;
      }

      const camposComErro: FieldPath<UpdateProdutoFormInput>[] = [];

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
            <p className="font-medium">Não foi possível atualizar o produto</p>

            <p className="mt-1 text-sm text-muted-foreground">{erroGeral}</p>
          </div>
        ) : null}

        <ProdutoFormFields disabled={enviando} legend="Dados do produto" />

        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          {enviando ? (
            <Button type="button" variant="outline" disabled>
              Cancelar
            </Button>
          ) : (
            <Button asChild variant="outline">
              <Link href={`/produtos/${produto.id}`}>Cancelar</Link>
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
