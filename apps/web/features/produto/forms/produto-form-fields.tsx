"use client";

import { Controller, useFormContext } from "react-hook-form";
import { StatusProduto } from "@repo/contracts";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  formatarDecimalParaMascara,
  normalizarEntradaDecimalDaDireita,
} from "./decimal-input-mask";
import type { ProdutoFormFieldsInput } from "./produto-form-fields.schema";

type ProdutoFormFieldsProps = Readonly<{
  disabled: boolean;
  legend: string;
}>;

function posicionarCursorNoFim(input: HTMLInputElement): void {
  requestAnimationFrame(() => {
    const posicao = input.value.length;

    input.setSelectionRange(posicao, posicao);
  });
}

export function ProdutoFormFields({
  disabled,
  legend,
}: ProdutoFormFieldsProps) {
  const form = useFormContext<ProdutoFormFieldsInput>();

  return (
    <fieldset className="space-y-6" disabled={disabled}>
      <legend className="sr-only">{legend}</legend>

      <section
        className="rounded-xl border bg-card p-5 sm:p-6"
        aria-labelledby="identificacao-heading"
      >
        <h2 id="identificacao-heading" className="font-semibold">
          Identificação
        </h2>

        <p className="mt-1 text-sm text-muted-foreground">
          Informe os dados usados para identificar e apresentar o produto.
        </p>

        <div className="mt-6 grid gap-5 sm:grid-cols-2">
          <Field data-invalid={Boolean(form.formState.errors.sku)}>
            <FieldLabel htmlFor="sku">
              SKU <span aria-hidden="true">*</span>
            </FieldLabel>

            <Input
              id="sku"
              autoComplete="off"
              maxLength={64}
              aria-required="true"
              aria-invalid={Boolean(form.formState.errors.sku)}
              aria-describedby={
                form.formState.errors.sku
                  ? "sku-description sku-error"
                  : "sku-description"
              }
              {...form.register("sku")}
            />

            <FieldDescription id="sku-description">
              Código único do produto. Ele será salvo em letras maiúsculas.
            </FieldDescription>

            {form.formState.errors.sku ? (
              <FieldError id="sku-error" errors={[form.formState.errors.sku]} />
            ) : null}
          </Field>

          <Field data-invalid={Boolean(form.formState.errors.nome)}>
            <FieldLabel htmlFor="nome">
              Nome <span aria-hidden="true">*</span>
            </FieldLabel>

            <Input
              id="nome"
              autoComplete="off"
              maxLength={64}
              aria-required="true"
              aria-invalid={Boolean(form.formState.errors.nome)}
              aria-describedby={
                form.formState.errors.nome ? "nome-error" : undefined
              }
              {...form.register("nome")}
            />

            {form.formState.errors.nome ? (
              <FieldError
                id="nome-error"
                errors={[form.formState.errors.nome]}
              />
            ) : null}
          </Field>

          <Field
            className="sm:col-span-2"
            data-invalid={Boolean(form.formState.errors.descricao)}
          >
            <FieldLabel htmlFor="descricao">Descrição</FieldLabel>

            <Textarea
              id="descricao"
              rows={5}
              maxLength={2_000}
              aria-invalid={Boolean(form.formState.errors.descricao)}
              aria-describedby={
                form.formState.errors.descricao
                  ? "descricao-description descricao-error"
                  : "descricao-description"
              }
              {...form.register("descricao")}
            />

            <FieldDescription id="descricao-description">
              Campo opcional com até 2.000 caracteres.
            </FieldDescription>

            {form.formState.errors.descricao ? (
              <FieldError
                id="descricao-error"
                errors={[form.formState.errors.descricao]}
              />
            ) : null}
          </Field>

          <Field
            className="sm:col-span-2"
            data-invalid={Boolean(form.formState.errors.urlManual)}
          >
            <FieldLabel htmlFor="urlManual">URL do manual</FieldLabel>

            <Input
              id="urlManual"
              type="url"
              inputMode="url"
              autoComplete="url"
              placeholder="https://exemplo.com/manual"
              aria-invalid={Boolean(form.formState.errors.urlManual)}
              aria-describedby={
                form.formState.errors.urlManual
                  ? "urlManual-description urlManual-error"
                  : "urlManual-description"
              }
              {...form.register("urlManual")}
            />

            <FieldDescription id="urlManual-description">
              Use uma URL completa iniciada por HTTP ou HTTPS.
            </FieldDescription>

            {form.formState.errors.urlManual ? (
              <FieldError
                id="urlManual-error"
                errors={[form.formState.errors.urlManual]}
              />
            ) : null}
          </Field>
        </div>
      </section>

      <section
        className="rounded-xl border bg-card p-5 sm:p-6"
        aria-labelledby="comercial-heading"
      >
        <h2 id="comercial-heading" className="font-semibold">
          Informações comerciais
        </h2>

        <p className="mt-1 text-sm text-muted-foreground">
          Defina status, preço, estoque e peso do produto.
        </p>

        <div className="mt-6 grid gap-5 sm:grid-cols-2">
          <Controller
            control={form.control}
            name="status"
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="status">
                  Status <span aria-hidden="true">*</span>
                </FieldLabel>

                <Select
                  name={field.name}
                  value={field.value}
                  disabled={disabled}
                  onValueChange={field.onChange}
                >
                  <SelectTrigger
                    id="status"
                    ref={field.ref}
                    onBlur={field.onBlur}
                    aria-required="true"
                    aria-invalid={fieldState.invalid}
                    aria-describedby={
                      fieldState.invalid ? "status-error" : undefined
                    }
                  >
                    <SelectValue placeholder="Selecione um status" />
                  </SelectTrigger>

                  <SelectContent>
                    <SelectItem value={StatusProduto.RASCUNHO}>
                      Rascunho
                    </SelectItem>

                    <SelectItem value={StatusProduto.ATIVO}>Ativo</SelectItem>

                    <SelectItem value={StatusProduto.DESCONTINUADO}>
                      Descontinuado
                    </SelectItem>
                  </SelectContent>
                </Select>

                {fieldState.error ? (
                  <FieldError id="status-error" errors={[fieldState.error]} />
                ) : null}
              </Field>
            )}
          />

          <Controller
            control={form.control}
            name="preco"
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="preco">
                  Preço <span aria-hidden="true">*</span>
                </FieldLabel>

                <div className="relative">
                  <span
                    aria-hidden="true"
                    className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-sm text-muted-foreground"
                  >
                    R$
                  </span>

                  <Input
                    id="preco"
                    ref={field.ref}
                    name={field.name}
                    type="text"
                    inputMode="numeric"
                    autoComplete="off"
                    placeholder="0,00"
                    className="pr-3 pl-10 text-right font-medium tabular-nums"
                    value={formatarDecimalParaMascara(field.value)}
                    aria-required="true"
                    aria-invalid={fieldState.invalid}
                    aria-describedby={
                      fieldState.invalid
                        ? "preco-description preco-error"
                        : "preco-description"
                    }
                    onBlur={field.onBlur}
                    onFocus={(event) => {
                      posicionarCursorNoFim(event.currentTarget);
                    }}
                    onClick={(event) => {
                      posicionarCursorNoFim(event.currentTarget);
                    }}
                    onChange={(event) => {
                      field.onChange(
                        normalizarEntradaDecimalDaDireita(
                          event.currentTarget.value,
                          12,
                        ),
                      );
                    }}
                  />
                </div>

                <FieldDescription id="preco-description">
                  Digite somente os números. Os centavos são preenchidos
                  automaticamente da direita para a esquerda.
                </FieldDescription>

                {fieldState.error ? (
                  <FieldError id="preco-error" errors={[fieldState.error]} />
                ) : null}
              </Field>
            )}
          />

          <Field data-invalid={Boolean(form.formState.errors.estoque)}>
            <FieldLabel htmlFor="estoque">
              Estoque <span aria-hidden="true">*</span>
            </FieldLabel>

            <Input
              id="estoque"
              type="number"
              inputMode="numeric"
              min="0"
              step="1"
              aria-required="true"
              aria-invalid={Boolean(form.formState.errors.estoque)}
              aria-describedby={
                form.formState.errors.estoque ? "estoque-error" : undefined
              }
              {...form.register("estoque")}
            />

            {form.formState.errors.estoque ? (
              <FieldError
                id="estoque-error"
                errors={[form.formState.errors.estoque]}
              />
            ) : null}
          </Field>

          <Controller
            control={form.control}
            name="pesoKg"
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="pesoKg">Peso</FieldLabel>

                <div className="relative">
                  <Input
                    id="pesoKg"
                    ref={field.ref}
                    name={field.name}
                    type="text"
                    inputMode="numeric"
                    autoComplete="off"
                    placeholder="0,00"
                    className="pr-11 pl-3 text-right font-medium tabular-nums"
                    value={formatarDecimalParaMascara(field.value)}
                    aria-invalid={fieldState.invalid}
                    aria-describedby={
                      fieldState.invalid
                        ? "pesoKg-description pesoKg-error"
                        : "pesoKg-description"
                    }
                    onBlur={field.onBlur}
                    onFocus={(event) => {
                      posicionarCursorNoFim(event.currentTarget);
                    }}
                    onClick={(event) => {
                      posicionarCursorNoFim(event.currentTarget);
                    }}
                    onChange={(event) => {
                      field.onChange(
                        normalizarEntradaDecimalDaDireita(
                          event.currentTarget.value,
                        ),
                      );
                    }}
                  />

                  <span
                    aria-hidden="true"
                    className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-sm text-muted-foreground"
                  >
                    kg
                  </span>
                </div>

                <FieldDescription id="pesoKg-description">
                  Campo opcional. Digite somente os números.
                </FieldDescription>

                {fieldState.error ? (
                  <FieldError id="pesoKg-error" errors={[fieldState.error]} />
                ) : null}
              </Field>
            )}
          />
        </div>
      </section>

      <section
        className="rounded-xl border bg-card p-5 sm:p-6"
        aria-labelledby="disponibilidade-heading"
      >
        <h2 id="disponibilidade-heading" className="font-semibold">
          Disponibilidade
        </h2>

        <p className="mt-1 text-sm text-muted-foreground">
          Configure destaque e datas opcionais do produto.
        </p>

        <div className="mt-6 grid gap-5 sm:grid-cols-2">
          <Field data-invalid={Boolean(form.formState.errors.dataValidade)}>
            <FieldLabel htmlFor="dataValidade">Data de validade</FieldLabel>

            <Input
              id="dataValidade"
              type="date"
              aria-invalid={Boolean(form.formState.errors.dataValidade)}
              aria-describedby={
                form.formState.errors.dataValidade
                  ? "dataValidade-error"
                  : undefined
              }
              {...form.register("dataValidade")}
            />

            {form.formState.errors.dataValidade ? (
              <FieldError
                id="dataValidade-error"
                errors={[form.formState.errors.dataValidade]}
              />
            ) : null}
          </Field>

          <Field data-invalid={Boolean(form.formState.errors.disponivelEm)}>
            <FieldLabel htmlFor="disponivelEm">Disponível em</FieldLabel>

            <Input
              id="disponivelEm"
              type="datetime-local"
              step="60"
              aria-invalid={Boolean(form.formState.errors.disponivelEm)}
              aria-describedby={
                form.formState.errors.disponivelEm
                  ? "disponivelEm-description disponivelEm-error"
                  : "disponivelEm-description"
              }
              {...form.register("disponivelEm")}
            />

            <FieldDescription id="disponivelEm-description">
              Selecione a data e hora em que o produto deve ficar disponível.
            </FieldDescription>

            {form.formState.errors.disponivelEm ? (
              <FieldError
                id="disponivelEm-error"
                errors={[form.formState.errors.disponivelEm]}
              />
            ) : null}
          </Field>

          <Controller
            control={form.control}
            name="emDestaque"
            render={({ field, fieldState }) => (
              <Field
                className="sm:col-span-2"
                data-invalid={fieldState.invalid}
              >
                <div className="flex items-start gap-3 rounded-lg border p-4">
                  <Checkbox
                    id="emDestaque"
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
                        ? "emDestaque-description emDestaque-error"
                        : "emDestaque-description"
                    }
                  />

                  <div className="min-w-0">
                    <FieldLabel htmlFor="emDestaque">
                      Produto em destaque
                    </FieldLabel>

                    <FieldDescription id="emDestaque-description">
                      Marque para indicar que o produto deve receber destaque no
                      catálogo.
                    </FieldDescription>
                  </div>
                </div>

                {fieldState.error ? (
                  <FieldError
                    id="emDestaque-error"
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
