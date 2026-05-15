-- CreateTable
CREATE TABLE `bets` (
    `id` VARCHAR(191) NOT NULL,
    `score` VARCHAR(191) NOT NULL DEFAULT '',
    `winner` VARCHAR(191) NOT NULL DEFAULT '',
    `home_team` VARCHAR(191) NOT NULL,
    `away_team` VARCHAR(191) NOT NULL,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `isEnded` BOOLEAN NOT NULL DEFAULT false,
    `start_at` DATETIME(3) NOT NULL,
    `end_at` DATETIME(3) NOT NULL,
    `winPercentage` DOUBLE NOT NULL,
    `lossPercentage` DOUBLE NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

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
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `user_bets` ADD CONSTRAINT `user_bets_uid_fkey` FOREIGN KEY (`uid`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `user_bets` ADD CONSTRAINT `user_bets_match_id_fkey` FOREIGN KEY (`match_id`) REFERENCES `bets`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
