### documentation a l'implementation et l'integration des contraintes sur les tables dans la base de donnees
lorsqu'on intègre les contraintes dans les tables (onDelete: Restrict), lors des tests,
prisma ne prenait paas ca en compte car par defaut MySQL tourne sur le moteur "MyISAM"
Malgré le fait quil cree correctement les cles etrangeres, Ce moteur ne considere pas les contraintes
liees aux cles etrangeres. ce qui posait un probleme lors de lintégrite des données: Donc nous
nous sommes obligés de basculer sur le moteur "InnoDB", qui lui apporte beaucoup plus davantages
que le moteur MyISAM


### CHANGER LE MOTEUR MYSQL DE MYISAM VERS INNODB en deux methodes

### premiere methode : dans mysql executez, pour connaitre le statut de votre moteur
SQL-> SHOW TABLE STATUS
SQL-> SHOW TABLE STATUS WHERE Name = 'Initiative';
regardez la colonne "engine" si vous voyez "MYISAM" alors il faut basculer sur "InnoDB"

### convertir une table
ALTER TABLE Dataset ENGINE=InnoDB;
faites le sur toutes vos tables

### verifiez le statut par defaut
SHOW VARIABLES LIKE 'default_storage_engine';
si c'est InnoDB qui s'affiche sur la colonne engine alors c'est ok

### deuxieme methode: la plus sur
allez dans le fichier de configuration de mysql dans votre xampp ou wamp

### configuration dans wamp
-faites un clic gauche sur l'icone de wamp presente dans votre barre de tache
-ensuite, cliquez sur MySQL
-ensuite ouvrez le fichier my.ini
-a la fin du fichier configurez InnoDB comme le moteur par defaut de mysql en ajoutant la ligne suivante puis enregistrez
-default-storage-engine=InnoDB 
-puis redemarrez wamp
-supprimez votre base de donnees depuis MySQL
-supprimez votre dossier migrations dans prisma
-puis relancez vos migrations
-apres avoir relance vos migrations, reconnectez vous a votre interface phpmyadmin
-retapez les commandes:
        SQL-> SHOW TABLE STATUS
        SQL-> SHOW TABLE STATUS WHERE Name = 'Initiative';

        si la colonne "engine" affiche "InnoDB" alors tout est OK

