# ICI ON NOTE TOUS LES FICHIERS À MODIFIER POUR ALLER EN PROD

### LE MAIN AFIN D'INCLURE À CHAQUE FOIS L'URL ONLINE `src/main.ts`

ceci est à rajouter en ligne:

```bash
  app.enableCors({
    origin: [
      `http://${ADMIN_PORTAIL_URL}`,
      `http://www.${ADMIN_PORTAIL_URL}`,
      'https://www.finamix.alfyns-group.com',
      'https://finamix.alfyns-group.com',
    ],
    credentials: true });
```

### LA CONFIGURATION DU MAIL DANS SON SERVICE `src/mail/mail.service.ts`

Mettre ceci en commmentaire puisque c'est pour la prod (ou le decommmenter si ce n'est pas en dev mais prod):

```bash
    constructor(private configService: ConfigService) {
        this.transporter = createTransport({
        host: this.configService.get('FINAMIX_SMTP_HOST'),
        port: this.configService.get('FINAMIX_SMTP_PORT'),
        secure: true,
        auth: {
            user: this.configService.get('FINAMIX_SMTP_USER'),
            pass: this.configService.get('FINAMIX_SMTP_PASS'),
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
$ npx prisma migrate dev --create-only --name migrate-to-innodb
```
