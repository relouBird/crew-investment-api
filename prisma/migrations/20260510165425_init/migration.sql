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
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

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
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Otp` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `code` VARCHAR(6) NOT NULL,
    `expires_at` DATETIME(3) NOT NULL,
    `used` BOOLEAN NOT NULL DEFAULT false,
    `user_id` VARCHAR(36) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Session` ADD CONSTRAINT `Session_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Otp` ADD CONSTRAINT `Otp_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
