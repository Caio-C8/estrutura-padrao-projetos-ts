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
import { Button } from "@/components/ui/button";
import { isApiError } from "@/lib/api/core/api-error";
import { useCreateProduto } from "@/features/produto/api/use-create-produto";
import {
  CREATE_PRODUTO_FORM_DEFAULT_VALUES,
  CreateProdutoFormSchema,
  type CreateProdutoFormData,
  type CreateProdutoFormInput,
} from "@/features/produto/forms/create-produto-form.schema";
import { ProdutoFormFields } from "@/features/produto/forms/produto-form-fields";
import { toast } from "sonner";

const CAMPOS_FORMULARIO = new Set<FieldPath<CreateProdutoFormInput>>([
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
): campo is FieldPath<CreateProdutoFormInput> {
  return CAMPOS_FORMULARIO.has(campo as FieldPath<CreateProdutoFormInput>);
}

export function CreateProdutoForm() {
  const router = useRouter();
  const mutation = useCreateProduto();
  const [erroGeral, setErroGeral] = useState<string | null>(null);

  const form = useForm<CreateProdutoFormInput, unknown, CreateProdutoFormData>({
    resolver: zodResolver(CreateProdutoFormSchema),
    defaultValues: CREATE_PRODUTO_FORM_DEFAULT_VALUES,
    mode: "onSubmit",
    reValidateMode: "onChange",
  });

  const enviando = form.formState.isSubmitting || mutation.isPending;

  const onSubmit: SubmitHandler<CreateProdutoFormData> = async (dados) => {
    setErroGeral(null);
    mutation.reset();

    try {
      const response = await mutation.mutateAsync(dados);

      toast.success(response.mensagem);

      router.replace(`/produtos/${response.dados.id}`);
    } catch (error: unknown) {
      if (!isApiError(error)) {
        setErroGeral("Ocorreu um erro inesperado. Tente novamente.");
        return;
      }

      const camposComErro: FieldPath<CreateProdutoFormInput>[] = [];

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
            <p className="font-medium">Não foi possível criar o produto</p>

            <p className="mt-1 text-sm text-muted-foreground">{erroGeral}</p>
          </div>
        ) : null}

        <ProdutoFormFields disabled={enviando} legend="Dados do novo produto" />

        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          {enviando ? (
            <Button type="button" variant="outline" disabled>
              Cancelar
            </Button>
          ) : (
            <Button asChild variant="outline">
              <Link href="/produtos">Cancelar</Link>
            </Button>
          )}

          <Button type="submit" disabled={enviando}>
            {enviando ? (
              <>
                <LoaderCircle aria-hidden="true" className="animate-spin" />
                Salvando…
              </>
            ) : (
              "Salvar produto"
            )}
          </Button>
        </div>
      </form>
    </FormProvider>
  );
}
