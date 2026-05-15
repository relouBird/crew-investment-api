-- CreateTable
CREATE TABLE `User` (
    `id` VARCHAR(36) NOT NULL,
    `generated_id` VARCHAR(20) NOT NULL,
    `first_name` VARCHAR(50) NOT NULL,
    `last_name` VARCHAR(50) NOT NULL,
    `email` VARCHAR(64) NOT NULL,
    `phone` VARCHAR(15) NULL,
    `country` VARCHAR(50) NULL,
    `password` VARCHAR(191) NOT NULL,
    `type` ENUM('guest', 'admin') NOT NULL DEFAULT 'guest',
    `role` ENUM('unauthenticated', 'authenticated', 'service_role') NOT NULL DEFAULT 'unauthenticated',
    `status` ENUM('Actif', 'Inactif', 'Suspendu') NOT NULL DEFAULT 'Inactif',
    `is_anonymous` BOOLEAN NOT NULL DEFAULT false,
    `email_confirmed_at` DATETIME(3) NULL,
    `phone_confirmed_at` DATETIME(3) NULL,
    `two_factor_enabled` BOOLEAN NOT NULL DEFAULT false,
    `notifications` JSON NOT NULL,
    `last_sign_in_at` DATETIME(3) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    `deleted_at` DATETIME(3) NULL,

    UNIQUE INDEX `User_generated_id_key`(`generated_id`),
    UNIQUE INDEX `User_email_key`(`email`),
    UNIQUE INDEX `User_phone_key`(`phone`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci ENGINE = InnoDB;

-- CreateTable
CREATE TABLE `Session` (
    `id` VARCHAR(36) NOT NULL,
    `user_id` VARCHAR(36) NOT NULL,
    `access_token` TEXT NOT NULL,
    `refresh_token` VARCHAR(50) NOT NULL,
    `token_type` VARCHAR(20) NOT NULL DEFAULT 'bearer',
    `expires_in` INTEGER NOT NULL DEFAULT 3600,
    `expires_at` DATETIME(3) NOT NULL,
    `logged_out` BOOLEAN NOT NULL DEFAULT false,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Session_user_id_key`(`user_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci ENGINE = InnoDB;

-- CreateTable
CREATE TABLE `Otp` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `code` VARCHAR(6) NOT NULL,
    `expires_at` DATETIME(3) NOT NULL,
    `used` BOOLEAN NOT NULL DEFAULT false,
    `user_id` VARCHAR(36) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci ENGINE = InnoDB;

-- CreateTable
CREATE TABLE `Wallet` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `uid` VARCHAR(191) NOT NULL,
    `funds_id` VARCHAR(191) NOT NULL,
    `funds` DOUBLE NOT NULL DEFAULT 0,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Wallet_uid_key`(`uid`),
    UNIQUE INDEX `Wallet_funds_id_key`(`funds_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci ENGINE = InnoDB;

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
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci ENGINE = InnoDB;

-- CreateTable
CREATE TABLE `Sponsoring` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `sponsor_id` VARCHAR(191) NOT NULL,
    `sponsored_id` VARCHAR(191) NOT NULL,
    `first_deposit` BOOLEAN NOT NULL DEFAULT false,

    UNIQUE INDEX `Sponsoring_sponsor_id_key`(`sponsor_id`),
    UNIQUE INDEX `Sponsoring_sponsored_id_key`(`sponsored_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci ENGINE = InnoDB;

-- CreateTable
CREATE TABLE `bets` (
    `id` VARCHAR(191) NOT NULL,
    `score` VARCHAR(191) NOT NULL DEFAULT '',
    `winner` VARCHAR(191) NOT NULL DEFAULT '',
    `home_team` VARCHAR(191) NOT NULL,
    `away_team` VARCHAR(191) NOT NULL,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `is_ended` BOOLEAN NOT NULL DEFAULT false,
    `start_at` DATETIME(3) NOT NULL,
    `end_at` DATETIME(3) NOT NULL,
    `win_percentage` DOUBLE NOT NULL,
    `loss_percentage` DOUBLE NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci ENGINE = InnoDB;

-- CreateTable
CREATE TABLE `user_bets` (
    `id` VARCHAR(191) NOT NULL,
    `uid` VARCHAR(191) NOT NULL,
    `match_id` VARCHAR(191) NOT NULL,
    `prediction` ENUM('home', 'away', 'draw') NOT NULL DEFAULT 'draw',
    `win` BOOLEAN NULL,
    `potential_gain` DOUBLE NOT NULL,
    `potential_loss` DOUBLE NOT NULL,
    `is_delete` BOOLEAN NOT NULL DEFAULT false,
    `is_payed` BOOLEAN NOT NULL DEFAULT false,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `user_bets_uid_idx`(`uid`),
    INDEX `user_bets_match_id_idx`(`match_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci ENGINE = InnoDB;

-- CreateTable
CREATE TABLE `Cat` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(32) NOT NULL,
    `age` SMALLINT NOT NULL DEFAULT 0,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci ENGINE = InnoDB;

-- AddForeignKey
ALTER TABLE `Session` ADD CONSTRAINT `Session_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Otp` ADD CONSTRAINT `Otp_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Wallet` ADD CONSTRAINT `Wallet_uid_fkey` FOREIGN KEY (`uid`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `transaction` ADD CONSTRAINT `transaction_creator_id_fkey` FOREIGN KEY (`creator_id`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Sponsoring` ADD CONSTRAINT `Sponsoring_sponsor_id_fkey` FOREIGN KEY (`sponsor_id`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Sponsoring` ADD CONSTRAINT `Sponsoring_sponsored_id_fkey` FOREIGN KEY (`sponsored_id`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `user_bets` ADD CONSTRAINT `user_bets_uid_fkey` FOREIGN KEY (`uid`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `user_bets` ADD CONSTRAINT `user_bets_match_id_fkey` FOREIGN KEY (`match_id`) REFERENCES `bets`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
