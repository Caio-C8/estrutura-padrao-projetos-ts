/*
  Warnings:

  - You are about to drop the column `ficha_tecnica` on the `produtos` table. All the data in the column will be lost.
  - You are about to drop the column `isAtivo` on the `produtos` table. All the data in the column will be lost.
  - Added the required column `updated_at` to the `produtos` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "produtos" DROP COLUMN "ficha_tecnica",
DROP COLUMN "isAtivo",
ADD COLUMN     "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "is_ativo" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "updated_at" TIMESTAMPTZ(3) NOT NULL,
ALTER COLUMN "quantidade_vendas" SET DEFAULT 0;

-- CreateTable
CREATE TABLE "avaliacoes_produtos" (
    "id" TEXT NOT NULL,
    "autor_nome" VARCHAR(80) NOT NULL,
    "nota" INTEGER NOT NULL,
    "comentario" VARCHAR(1000),
    "recomenda" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,
    "produto_id" TEXT NOT NULL,

    CONSTRAINT "avaliacoes_produtos_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "avaliacoes_produtos_produto_id_created_at_idx" ON "avaliacoes_produtos"("produto_id", "created_at");

-- AddForeignKey
ALTER TABLE "avaliacoes_produtos" ADD CONSTRAINT "avaliacoes_produtos_produto_id_fkey" FOREIGN KEY ("produto_id") REFERENCES "produtos"("id") ON DELETE CASCADE ON UPDATE CASCADE;
