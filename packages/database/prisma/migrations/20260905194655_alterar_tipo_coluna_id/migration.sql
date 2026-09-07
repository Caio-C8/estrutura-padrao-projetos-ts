/*
 Warnings:
 
 - The primary key for the `avaliacoes_produtos` table will be changed. If it partially fails, the table could be left without primary key constraint.
 - The primary key for the `produtos` table will be changed. If it partially fails, the table could be left without primary key constraint.
 - Changed the type of `id` on the `avaliacoes_produtos` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
 - Changed the type of `id` on the `produtos` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
 
 */
-- Remover explicitamente a FK antes de alterar os tipos
ALTER TABLE
  "avaliacoes_produtos" DROP CONSTRAINT "avaliacoes_produtos_produto_id_fkey";

-- Converter sem apagar os identificadores existentes
ALTER TABLE
  "produtos"
ALTER COLUMN
  "id" TYPE UUID USING "id" :: uuid;

ALTER TABLE
  "avaliacoes_produtos"
ALTER COLUMN
  "id" TYPE UUID USING "id" :: uuid,
ALTER COLUMN
  "produto_id" TYPE UUID USING "produto_id" :: uuid;

-- Recriar a FK depois que os dois lados forem UUID
ALTER TABLE
  "avaliacoes_produtos"
ADD
  CONSTRAINT "avaliacoes_produtos_produto_id_fkey" FOREIGN KEY ("produto_id") REFERENCES "produtos"("id") ON DELETE CASCADE ON UPDATE CASCADE;