# Univ-Share

Donner, échanger, partager le matériel du campus.

Univ-Share est une plateforme d'entraide entre étudiants. On y publie le matériel
universitaire dont on ne se sert plus (livres, cours et TD, composants
électroniques, matériel de labo) et on y trouve celui dont on a besoin, en don,
en échange ou à petit prix en FCFA.

Projet MIAGE L2 - Infographie & Web design.

## En ligne

https://site-d7de1872e7c0463d9dfe600ec86463a8.freebuff.page

## Fonctionnalités

- Liste des annonces avec recherche (les accents ne gênent pas) et filtres par
  catégorie, mode et lieu.
- Fiche annonce : photo, description, contact, partage sur WhatsApp, favori,
  signalement.
- Publication d'une annonce avec photo compressée avant l'envoi.
- Messagerie interne avec compteur de messages non lus.
- Profil : mes annonces, mes favoris, suppression du compte.

## Technologies

React 19, Vite, React Router, Convex (base de données, fonctions serveur et
stockage des photos), Convex Auth pour la connexion par code à 6 chiffres reçu
par e-mail, TypeScript. Le style est écrit en CSS avec des variables, sans
framework CSS.

## Lancer le projet

```bash
bun install
bun convex dev --once
bun run dev
```

Les variables d'environnement se créent à partir du fichier `.env.example`.

Autres commandes : `bun run build`, `bun run test`, `bun run lint`,
`bun run audit:ui`.

## Organisation du code

```
src/pages        les écrans
src/components   composants réutilisables
src/convex       schéma de la base et fonctions serveur
src/styles       variables et feuilles de style
src/lib          formats, recherche, compression des photos
```

## Équipe

- BEUGRE Adompo Chris Emmanuel
- KONAN Amenan Aoundjouet Evangeline
- DOSSO Waidé
- YAPO Atse Phalek

## Documents

- `docs/notes-de-cadrage.txt`
- `docs/compte-rendu-kickoff.txt`
- `docs/repartition-des-taches.txt`
- `docs/choix-graphiques.txt`
- `docs/parcours-utilisateur.txt`
