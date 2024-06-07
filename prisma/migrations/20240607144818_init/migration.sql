/*
  Warnings:

  - The primary key for the `GPSData` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `latitude` on the `GPSData` table. All the data in the column will be lost.
  - You are about to drop the column `longitude` on the `GPSData` table. All the data in the column will be lost.
  - Added the required column `deviceId` to the `GPSData` table without a default value. This is not possible if the table is not empty.
  - Added the required column `lat` to the `GPSData` table without a default value. This is not possible if the table is not empty.
  - Added the required column `lng` to the `GPSData` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `GPSData` DROP PRIMARY KEY,
    DROP COLUMN `latitude`,
    DROP COLUMN `longitude`,
    ADD COLUMN `deviceId` VARCHAR(191) NOT NULL,
    ADD COLUMN `lat` DOUBLE NOT NULL,
    ADD COLUMN `lng` DOUBLE NOT NULL,
    MODIFY `id` VARCHAR(191) NOT NULL,
    ADD PRIMARY KEY (`id`);
