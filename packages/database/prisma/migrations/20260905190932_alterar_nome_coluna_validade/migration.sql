/*
  Warnings:

  - You are about to drop the column `validade` on the `produtos` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "produtos" DROP COLUMN "validade",
ADD COLUMN     "data_validade" TIMESTAMPTZ(3);
