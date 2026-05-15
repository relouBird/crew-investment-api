/*
  Warnings:

  - You are about to drop the `user_wallet_transactions` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `user_wallet_transactions` DROP FOREIGN KEY `user_wallet_transactions_creator_id_fkey`;

-- DropTable
DROP TABLE `user_wallet_transactions`;

-- CreateTable
CREATE TABLE `transaction` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `transaction_id` VARCHAR(191) NOT NULL,
    `creator_id` VARCHAR(191) NOT NULL,
    `amount` DOUBLE NOT NULL,
    `description` VARCHAR(191) NOT NULL,
    `type` ENUM('deposit', 'withdrawal', 'transfer', 'bet_win', 'bet_loss') NOT NULL,
    `status` ENUM('done', 'pending', 'failed') NOT NULL DEFAULT 'pending',
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `transaction_transaction_id_key`(`transaction_id`),
    INDEX `transaction_creator_id_idx`(`creator_id`),
    INDEX `transaction_transaction_id_idx`(`transaction_id`),
    INDEX `transaction_status_idx`(`status`),
    INDEX `transaction_type_idx`(`type`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Sponsoring` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `sponsor_id` VARCHAR(191) NOT NULL,
    `sponsored_id` VARCHAR(191) NOT NULL,
    `first_deposit` BOOLEAN NOT NULL DEFAULT false,

    UNIQUE INDEX `Sponsoring_sponsor_id_key`(`sponsor_id`),
    UNIQUE INDEX `Sponsoring_sponsored_id_key`(`sponsored_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `transaction` ADD CONSTRAINT `transaction_creator_id_fkey` FOREIGN KEY (`creator_id`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Sponsoring` ADD CONSTRAINT `Sponsoring_sponsor_id_fkey` FOREIGN KEY (`sponsor_id`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Sponsoring` ADD CONSTRAINT `Sponsoring_sponsored_id_fkey` FOREIGN KEY (`sponsored_id`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
