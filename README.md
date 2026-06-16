# 🏍️ LibreExpress - Portail SaaS Premium de Livraison Express à Dakar

LibreExpress est une Progressive Web Application (PWA) monopage (SPA) haut de gamme conçue pour simuler un service de livraison express à Dakar, Sénégal. Construit avec des technologies web natives et Tailwind CSS v4, ce projet offre une expérience utilisateur fluide, immersive et interactive avec des animations avancées, un système de parrainage, une simulation GPS en temps réel et un portail d'administration pour les coursiers.

---

## 🚀 Fonctionnalités Clés

### 🎨 Design & Immersion UX
* **Preloader / Splash Screen** : Chargement immersif sombre avec logo pulsant et barre de progression fluide.
* **Thème Sombre / Clair** : Gestion intelligente du mode sombre avec persistance locale (`localStorage`) et transition fluide sans scintillement.
* **Scroll-to-Top** : Bouton d'action flottant pour remonter rapidement la page après un défilement de 500px.
* **Navbar Adaptative (Shrink)** : Réduction de la hauteur et des tailles de police au défilement pour maximiser l'espace de lecture.
* **Scroll Reveal Animations** : Effets de fondu synchronisés au défilement grâce à l'API `IntersectionObserver`.
* **Toast Notifications** : Retours visuels élégants pour chaque interaction de l'utilisateur (succès de réservation, newsletter, parrainage, etc.).

### 📱 Fonctionnalités SaaS & Gamification
* **Simulateur de Tarif Dynamique** : Calcul automatique du tarif basé sur le poids du colis, la zone géographique et l'urgence (Standard ou Express).
* **Tunnel de Commande Multi-étapes (Wizard)** : Formulaire de réservation en 3 étapes avec validation stricte du numéro de téléphone sénégalais (+221 70/75/76/77/78).
* **Historique Local de Commandes** : Panneau récapitulatif permettant de revoir toutes les réservations précédentes stockées dans le navigateur.
* **Suivi de Colis & Animation GPS** : Visualisation du colis avec une ligne de progression et icône de moto simulant un déplacement GPS en direct.
* **Portail Admin / Coursier** : Interface interactive permettant de modifier le statut d'un colis (Reçu, Collecté, En route, Livré) pour mettre à jour en direct le suivi client.
* **Notifications SMS Simulées** : Bannières push de style iOS se déclenchant à chaque changement d'état du colis.
* **Système d'Évaluation (Rating)** : Boîte modale de notation par étoiles apparaissant dès qu'un colis suivi passe à l'état "Livré".
* **Système de Codes Promo** : Validation de coupons (ex: `BIENVENUE`, `DAKAR20`) appliquant des réductions en temps réel.
* **Parrainage (Referral)** : Génération d'un code unique à partager avec des liens préconfigurés pour WhatsApp, Facebook et X.
* **Live Chat Widget** : Assistant de messagerie interactif simulant des réponses automatiques pour guider l'utilisateur.
* **Carte Interactive (OpenStreetMap)** : Représentation du siège à Dakar (Point E) avec géolocalisation et bouton d'itinéraire.

### ⚙️ Technologie & Hors ligne (PWA)
* **Offline Ready** : Service Worker (`sw.js`) pour la mise en cache des ressources critiques et fonctionnement hors ligne.
* **Installable (PWA)** : Fichier `manifest.json` configuré pour permettre l'installation sur smartphones et ordinateurs.
* **Audio SFX natif** : Effets sonores intégrés via l'API **Web Audio** (aucun fichier externe requis, possibilité de couper le son depuis la navbar).

---

## 🛠️ Stack Technique

* **Structure & UI** : HTML5 sémantique, Tailwind CSS v4.
* **Logique client** : Vanilla JavaScript ES6 (zéro dépendance externe).
* **Cartographie** : Leaflet.js & OpenStreetMap.
* **Polices & Icônes** : Google Fonts (Plus Jakarta Sans & Outfit), FontAwesome v6.

---

## 💻 Installation & Lancement Local

1. **Cloner ou récupérer le dossier du projet** :
   ```bash
   cd /chemin/vers/test_antigravity
   ```

2. **Lancer un serveur de développement local** (ex: via Node.js static server ou extension VS Code Live Server) :
   ```bash
   npx http-server -p 3000
   ```
   *Ou si vous préférez Python :*
   ```bash
   python3 -m http.server 3000
   ```

3. **Ouvrir le projet dans le navigateur** :
   Rendez-vous sur `http://localhost:3000`.

---

## 📁 Structure du Projet

```text
├── index.html         # Structure principale et modales
├── style.css          # Styles personnalisés et animations CSS
├── script.js          # Moteur JS (Logique, État, Audio, GPS, Confettis)
├── manifest.json      # Configuration PWA pour l'installation
├── sw.js              # Service Worker pour le cache hors ligne
└── LICENSE            # Licence MIT du projet
```

---

## 🛡️ Raccourci Clavier Utile
* Appuyez sur **`Ctrl + K`** (ou `Cmd + K` sur macOS) à tout moment pour ouvrir la **Command Palette** et naviguer instantanément à travers les différentes sections ou ouvrir le **Portail Admin / Coursier**.
# LibreExpress
