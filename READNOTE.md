# BON À SAVOIR

## POUR DEMARRER LE PROJET

### INSTALLER LES DEPENDANCES

Pour installer les dependances du projet:

```bash
$ npm install
```

### CHARGER LES MODELES ET TYPES DEJA EXISTANT

Afin de génerer les types pour chaque modèles et les import de base de Prisma:

```bash
$ npx prisma generate
```

### GENERER LES MIGRATIONS A PARTIR DES MODELES

Afin de generer les migrations et adapter les modifications dans le schema:

```bash
$ npx prisma migrate dev --name init
```

### RESET LES MIGRATIONS PRESENTES ET REPARTIR DE ZERO

Afin de generer vider toutes les données de la Database et generer de nouvelles migration:

```bash
$ npx prisma migrate reset
```

## POUR GENERER DES TABLES

### Ecrire(créer) le model/class de ta table dans:

Pour generer des tables il faut:

1. Creer ses modèles dans le fichier:
   `./prisma/schema.prisma`

```bash
$ model Cat {
  id        Int      @id @default(autoincrement())
  name      String   @db.VarChar(32)
  createdAt DateTime @map("created_at")
}
```

(Je te conseille d'une extension pour mieux voir)

### Génerer les migrations et les mouvements dans la table

```bash
$ npx prisma migrate dev --name init
```

ou

```bash
$ npx prisma migrate dev
```

### Génerer des types pour les models et les nouveaux changements

```bash
$ npx prisma generate
```

### Reset toutes les migrations et les données de la base de données

```bash
$ npx prisma migrate reset
```

## COMMENT CREER UN MODULE ET SON PROCESSUS COMPLET

### Créer le module

Cette commande cree le module

```bash
$ npx nest g module nom_module
```

ou

```bash
$ npx nest g mo nom_module
```

### Créer le controlleur (SI VOUS EN AVEZ BESOIN)

Cette commande cree le controlleur sans les specifications
(les spécifications sont utiles lors des tests)

```bash
$ npx nest g controller nom_controller
```

ou

```bash
$ npx nest g co nom_controller
```

Si vous voulez aucun specification de test

```bash
$ npx nest g co nom_controller --no-spec
```

### Créer le service

Cette commande cree le service et le lie directement au controlleur et au module

```bash
$ npx nest g service nom_service
```

ou

```bash
$ npx nest s nom_service
```

Si vous voulez aucun specification de test

```bash
$ npx nest g s nom_service --no-spec

```

## CREATION DE DONNEES FICTIVES

### CREATION DU FACTORY

Toutes données fictives depend du factory prenom le cas de l'indicateur...

```bash
import { BaseFactory } from './base.factory';
import { faker } from '@faker-js/faker';
import { Prisma } from '@prisma/client';

// Type pour faciliter l'utilisation
type CREATIONTYPE = Prisma.IndicateurCreateInput;

export class IndicateurFactory extends BaseFactory<CREATIONTYPE> {
  constructor() {
    super('indicateur'); // 'user' correspond au nom du modèle Prisma
  }

  protected async getDefaultData(
    overrideData: Partial<CREATIONTYPE>,
  ): Promise<CREATIONTYPE> {
    const defaultData: CREATIONTYPE = {
      label: faker.finance.transactionDescription(),
      code: faker.finance.currencyNumericCode(),
      type: faker.finance.transactionType(),
    };

    // Fusionne les valeurs par défaut avec les données personnalisées
    return { ...defaultData, ...overrideData };
  }
}

```

Prompt avec chatGpt pour savoir le faire....

### GENERATION DES DONNEES
Taper la commande:

```bash
  npx prisma db seed
```
