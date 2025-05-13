-- CreateTable
CREATE TABLE `pokemons` (
    `id` INTEGER NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `types` JSON NOT NULL,
    `stats` JSON NOT NULL,
    `image` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `pokemons_name_key`(`name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
