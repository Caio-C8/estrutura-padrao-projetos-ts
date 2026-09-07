-- CreateEnum
CREATE TYPE "StatusProduto" AS ENUM ('RASCUNHO', 'ATIVO', 'DESCONTINUADO');

-- CreateTable
CREATE TABLE "produtos" (
    "id" TEXT NOT NULL,
    "sku" VARCHAR(64) NOT NULL,
    "nome" VARCHAR(64) NOT NULL,
    "descricao" TEXT,
    "email" VARCHAR(254),
    "url_manual" VARCHAR(2048),
    "status" "StatusProduto" NOT NULL DEFAULT 'RASCUNHO',
    "isAtivo" BOOLEAN NOT NULL DEFAULT true,
    "estoque" INTEGER NOT NULL DEFAULT 0,
    "preco" DECIMAL(12,2) NOT NULL,
    "peso_kg" DOUBLE PRECISION,
    "quantidade_vendas" BIGINT NOT NULL,
    "disponivel_em" TIMESTAMPTZ(3),
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "atributos" JSONB,
    "ficha_tecnica" BYTEA,

    CONSTRAINT "produtos_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "produtos_sku_key" ON "produtos"("sku");
