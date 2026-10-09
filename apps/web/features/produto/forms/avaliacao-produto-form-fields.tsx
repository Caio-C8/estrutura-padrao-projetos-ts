"use client";

import { Controller, useFormContext } from "react-hook-form";
import { Star } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import type { AvaliacaoProdutoFormFieldsInput } from "./avaliacao-produto-form-fields.schema";

type AvaliacaoProdutoFormFieldsProps = Readonly<{
  disabled: boolean;
  legend: string;
}>;

const NOTAS = [1, 2, 3, 4, 5] as const;

function formatarQuantidadeEstrelas(nota: number): string {
  return nota === 1 ? "1 estrela" : `${nota} estrelas`;
}

export function AvaliacaoProdutoFormFields({
  disabled,
  legend,
}: AvaliacaoProdutoFormFieldsProps) {
  const form = useFormContext<AvaliacaoProdutoFormFieldsInput>();

  return (
    <fieldset className="space-y-6" disabled={disabled}>
      <legend className="sr-only">{legend}</legend>

      <section
        className="rounded-xl border bg-card p-5 sm:p-6"
        aria-labelledby="dados-avaliacao-heading"
      >
        <h2 id="dados-avaliacao-heading" className="font-semibold">
          Dados da avaliação
        </h2>

        <p className="mt-1 text-sm text-muted-foreground">
          Informe o autor, a nota e sua recomendação sobre o produto.
        </p>

        <div className="mt-6 grid gap-5 sm:grid-cols-2">
          <Field data-invalid={Boolean(form.formState.errors.autorNome)}>
            <FieldLabel htmlFor="autorNome">
              Nome do autor <span aria-hidden="true">*</span>
            </FieldLabel>

            <Input
              id="autorNome"
              type="text"
              autoComplete="name"
              maxLength={80}
              aria-required="true"
              aria-invalid={Boolean(form.formState.errors.autorNome)}
              aria-describedby={
                form.formState.errors.autorNome
                  ? "autorNome-description autorNome-error"
                  : "autorNome-description"
              }
              {...form.register("autorNome")}
            />

            <FieldDescription id="autorNome-description">
              Nome que será exibido junto à avaliação.
            </FieldDescription>

            {form.formState.errors.autorNome ? (
              <FieldError
                id="autorNome-error"
                errors={[form.formState.errors.autorNome]}
              />
            ) : null}
          </Field>

          <Controller
            control={form.control}
            name="nota"
            render={({ field, fieldState }) => {
              const notaSelecionada = Number(field.value);

              return (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel id="nota-label">
                    Nota <span aria-hidden="true">*</span>
                  </FieldLabel>

                  <RadioGroup
                    value={field.value}
                    disabled={disabled}
                    className="flex flex-wrap gap-1"
                    aria-labelledby="nota-label"
                    aria-required="true"
                    aria-invalid={fieldState.invalid}
                    aria-describedby={
                      fieldState.invalid
                        ? "nota-description nota-value nota-error"
                        : "nota-description nota-value"
                    }
                    onValueChange={field.onChange}
                    onBlur={field.onBlur}
                  >
                    {NOTAS.map((nota) => {
                      const selecionada = nota <= notaSelecionada;
                      const descricao = formatarQuantidadeEstrelas(nota);

                      return (
                        <div key={nota} className="relative size-11">
                          <RadioGroupItem
                            id={`nota-${nota}`}
                            ref={nota === 1 ? field.ref : undefined}
                            value={String(nota)}
                            title={descricao}
                            aria-label={descricao}
                            aria-invalid={fieldState.invalid}
                            className="peer inset-0 z-10 cursor-pointer"
                            style={{
                              position: "absolute",
                              width: "100%",
                              height: "100%",
                              opacity: 0,
                            }}
                          />

                          <span
                            aria-hidden="true"
                            className={[
                              "flex size-11 items-center justify-center rounded-lg transition-colors",
                              "peer-hover:bg-accent peer-hover:text-amber-500",
                              "peer-focus-visible:ring-3 peer-focus-visible:ring-ring/50",
                              "peer-disabled:cursor-not-allowed peer-disabled:opacity-50",
                              selecionada
                                ? "text-amber-500"
                                : "text-muted-foreground",
                            ].join(" ")}
                          >
                            <Star
                              className={[
                                "size-7 transition-colors",
                                selecionada
                                  ? "fill-amber-400"
                                  : "fill-transparent",
                              ].join(" ")}
                            />
                          </span>
                        </div>
                      );
                    })}
                  </RadioGroup>

                  <FieldDescription id="nota-description">
                    Selecione de 1 a 5 estrelas.
                  </FieldDescription>

                  <p
                    id="nota-value"
                    className="text-sm text-muted-foreground"
                    aria-live="polite"
                  >
                    {field.value
                      ? `${formatarQuantidadeEstrelas(notaSelecionada)} selecionadas`
                      : "Nenhuma estrela selecionada"}
                  </p>

                  {fieldState.error ? (
                    <FieldError id="nota-error" errors={[fieldState.error]} />
                  ) : null}
                </Field>
              );
            }}
          />

          <Field
            className="sm:col-span-2"
            data-invalid={Boolean(form.formState.errors.comentario)}
          >
            <FieldLabel htmlFor="comentario">Comentário</FieldLabel>

            <Textarea
              id="comentario"
              rows={6}
              maxLength={1_000}
              placeholder="Conte como foi sua experiência com o produto."
              aria-invalid={Boolean(form.formState.errors.comentario)}
              aria-describedby={
                form.formState.errors.comentario
                  ? "comentario-description comentario-error"
                  : "comentario-description"
              }
              {...form.register("comentario")}
            />

            <FieldDescription id="comentario-description">
              Campo opcional com até 1.000 caracteres.
            </FieldDescription>

            {form.formState.errors.comentario ? (
              <FieldError
                id="comentario-error"
                errors={[form.formState.errors.comentario]}
              />
            ) : null}
          </Field>

          <Controller
            control={form.control}
            name="recomenda"
            render={({ field, fieldState }) => (
              <Field
                className="sm:col-span-2"
                data-invalid={fieldState.invalid}
              >
                <div className="flex items-start gap-3 rounded-lg border p-4">
                  <Checkbox
                    id="recomenda"
                    ref={field.ref}
                    checked={field.value}
                    disabled={disabled}
                    onBlur={field.onBlur}
                    onCheckedChange={(checked) => {
                      field.onChange(checked === true);
                    }}
                    aria-invalid={fieldState.invalid}
                    aria-describedby={
                      fieldState.invalid
                        ? "recomenda-description recomenda-error"
                        : "recomenda-description"
                    }
                  />

                  <div className="min-w-0">
                    <FieldLabel htmlFor="recomenda">
                      Recomenda o produto
                    </FieldLabel>

                    <FieldDescription id="recomenda-description">
                      Desmarque caso você não recomende este produto.
                    </FieldDescription>
                  </div>
                </div>

                {fieldState.error ? (
                  <FieldError
                    id="recomenda-error"
                    errors={[fieldState.error]}
                  />
                ) : null}
              </Field>
            )}
          />
        </div>
      </section>
    </fieldset>
  );
}
