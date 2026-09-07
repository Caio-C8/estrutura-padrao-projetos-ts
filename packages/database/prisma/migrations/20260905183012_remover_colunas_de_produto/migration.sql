/*
  Warnings:

  - You are about to drop the column `atributos` on the `produtos` table. All the data in the column will be lost.
  - You are about to drop the column `email` on the `produtos` table. All the data in the column will be lost.
  - You are about to drop the column `is_ativo` on the `produtos` table. All the data in the column will be lost.
  - You are about to drop the column `tags` on the `produtos` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "produtos" DROP COLUMN "atributos",
DROP COLUMN "email",
DROP COLUMN "is_ativo",
DROP COLUMN "tags",
ADD COLUMN     "em_destaque" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "validade" TIMESTAMPTZ(3);
