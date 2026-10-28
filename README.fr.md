# INKA
### Jeux traditionnels d'adresse

> **« Jouer. Se détendre l'esprit. Rivaliser par l'adresse. Rencontrer d'autres joueurs. »**

**INKA** est un prototype d'interface pour une plateforme de jeux d'adresse inspirée du patrimoine rwandais, de l'amitié, de la réflexion et du respect mutuel.

**Langues :** [Kinyarwanda](README.rw.md) · [English](README.md) · [Français](README.fr.md)

---

## 1. Objectif et principes d'INKA

- **Jeux gratuits :** aucun pari d'argent, aucune mise en bétail ou autre bien, aucun transfert d'argent et aucun retrait d'argent.
- **Adresse et fair-play :** les points représentent les performances et le comportement sportif ; ils ne sont pas de l'argent et ne peuvent pas être convertis en argent.
- **Trois jeux :** Dame, Igisoro et Biyari.
- **Trois langues :** kinyarwanda (`rw`), anglais (`en`) et français (`fr`). Les messages, descriptions, actions et libellés d'accessibilité prennent en charge le changement de langue.
- **Limites du prototype :** le dépôt contient une interface front-end, des données de démonstration et un comportement local simulant un adversaire. Il ne fournit pas encore de système complet d'authentification, de base de données côté serveur, de matchmaking réel ni de jeu multijoueur en temps réel.
- **Profils de démonstration :** les noms, scores et informations affichés sont des exemples ; il ne s'agit pas de comptes réels vérifiés.

## 2. Les jeux

### Dame
- Plateau de 8 × 8 cases et 10 pièces par joueur.
- Les prises de pièces modifient l'indicateur d'avantage.
- La partie se termine lorsqu'une victoire valide est obtenue ou qu'un joueur choisit de conclure la partie.

### Igisoro
- Plateau de 4 rangées comportant chacune 8 trous, soit 32 trous.
- Le prototype commence avec 64 graines.
- Les joueurs sèment les graines selon le parcours du jeu ; les captures sont simulées par la logique actuelle.

### Biyari (billard à huit)
- Table de billard rendue sur canvas, avec collisions entre les billes, rebonds sur les bandes et six poches.
- Le jeu standard utilise 15 billes de jeu : 7 pleines, 7 rayées et la bille numéro 8.
- Un joueur doit empocher les 7 billes de son groupe avant de pouvoir gagner en empochant légalement la bille 8.
- L'adversaire est une simulation locale simple ; l'option **Pass and Play** permet à deux personnes de jouer à tour de rôle sur le même appareil.
- Il s'agit d'une simulation visuelle qui doit être testée et améliorée avant d'être considérée comme une implémentation complète des règles du billard.

## 3. Contenu du prototype

- `src/components/brand/InkaLogo.tsx` — emblème INKA en SVG.
- `src/components/games/` — jeux Dame, Igisoro et Biyari, ainsi que les interfaces de score.
- `src/components/views/` — lobby, profils de démonstration, disponibilité, règles, distinctions et espace spectateurs.
- `src/context/PlatformContext.tsx` — état local des parties, données de démonstration et langue sélectionnée.
- `src/utils/i18n.ts` — dictionnaires des trois langues.
- `src/utils/i18n.test.ts` — tests vérifiant la parité des clés entre les langues, l'absence de traductions vides et la cohérence des paramètres dynamiques.
- `src/utils/matchScoring.ts` — calcul de l'avantage et des points de fair-play.
- `.github/workflows/verify-inka.yml` — vérification automatisée de TypeScript, des tests et de la compilation.

## 4. Lancer le projet en local

Installez Node.js et npm, puis exécutez les commandes suivantes depuis le dossier du projet :

```bash
npm install
npm run dev
```

Le serveur de développement est accessible à `http://localhost:3000`.

### Tests et vérifications

```bash
npm run lint
npm test
npm run build
```

- `npm run lint` vérifie les types TypeScript.
- `npm test` lance les tests du calcul d'avantage et de la localisation.
- `npm run build` construit la version de démonstration.

## 5. Avant un lancement réel

**INKA n'est pas encore une plateforme complète permettant de jouer en ligne avec de vrais adversaires.** Avant une ouverture au public, il faudra ajouter et tester une base de données persistante, une authentification sécurisée, un matchmaking réel, la synchronisation des parties, la validation côté serveur, la protection des données personnelles, des tests approfondis des règles et un audit de sécurité. Le déploiement du seul front-end ne fournit pas ces fonctions.
