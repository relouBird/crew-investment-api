# ICI ON NOTE TOUS LES FICHIERS À MODIFIER POUR ALLER EN PROD

### LE MAIN AFIN D'INCLURE À CHAQUE FOIS L'URL ONLINE `src/main.ts`

ceci est à rajouter en ligne:

```bash
  app.enableCors({
    origin: [
      `http://${ADMIN_PORTAIL_URL}`,
      `http://www.${ADMIN_PORTAIL_URL}`,
    ],
    credentials: true });
```

### LA CONFIGURATION DU MAIL DANS SON SERVICE `src/mail/mail.service.ts`

Mettre ceci en commmentaire puisque c'est pour la prod (ou le decommmenter si ce n'est pas en dev mais prod):

```bash
    constructor(private configService: ConfigService) {
        this.transporter = createTransport({
        host: this.configService.get('INVESTIA_SMTP_HOST'),
        port: this.configService.get('INVESTIA_SMTP_PORT'),
        secure: true,
        auth: {
            user: this.configService.get('INVESTIA_SMTP_USER'),
            pass: this.configService.get('INVESTIA_SMTP_PASS'),
        },
    })}
```

Mettre ceci en commentaire si ce ne sommes pas en dev mais en prod:

```bash
  constructor(private configService: ConfigService) {
    this.transporter = createTransport({
      host: this.configService.get('SMTP_HOST'),
      port: Number(this.configService.get('SMTP_PORT')),
    });
  }
```

### ATTENTION MIGRATIONS EN PRODUCTION...

Nous utilisons le moteur InnoDB et non MyISAM donc il faut à chaque fois génerer les migrations en prenant ça en compte dans nos calculs alors en production il faut faire

```bash
$ npx prisma migrate reset
$ npx prisma migrate dev --name init
```

Maintenant sur toutes les tables generer sur la migration.sql rajouter à la fin `ENGINE = InnoDB`
un peu comme ceci : 

```bash
CREATE TABLE `Cat` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(32) NOT NULL,
    `age` SMALLINT NOT NULL DEFAULT 0,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci ENGINE = InnoDB;

```

En suite faire les migrations :
```bash
$ npx prisma migrate deploy
```

Ensuite generer les types :
```bash
$ npx prisma generate
```

Ensuite generer les types :
```bash
$ nm run build
```