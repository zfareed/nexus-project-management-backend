/*
  Warnings:

  - You are about to drop the `task_history` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "task_history" DROP CONSTRAINT "task_history_task_id_fkey";

-- DropForeignKey
ALTER TABLE "task_history" DROP CONSTRAINT "task_history_updated_by_id_fkey";

-- DropTable
DROP TABLE "task_history";
