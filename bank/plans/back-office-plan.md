# PLAN D'IMPLÉMENTATION DU BACK-OFFICE
## Plateforme de Suivi des Revenus Miniers - TI Madagascar

---

## <¯ OBJECTIFS DU BACK-OFFICE

- Interface d'administration sécurisée et intuitive
- Gestion complète du contenu sans intervention technique
- Suivi en temps réel des activités et statistiques
- Gestion des utilisateurs avec contrôle d'accès par rôles
- Outils de communication (newsletter, messagerie sécurisée)
- Tableaux de bord analytiques pour la prise de décision

---

## = 1. AUTHENTIFICATION & SÉCURITÉ

### 1.1 Système d'authentification
- **Login sécurisé** avec email/mot de passe
- **Authentification JWT** (JSON Web Token)
- **Sessions utilisateur** avec timeout automatique
- **Double authentification (2FA)** optionnelle pour administrateurs
- **Gestion des mots de passe**
  - Réinitialisation par email
  - Politique de complexité
  - Expiration périodique
  - Historique des mots de passe

### 1.2 Gestion des rôles et permissions
- **Rôles prédéfinis** :
  - Super Administrateur (accès total)
  - Administrateur (gestion contenu + utilisateurs)
  - Éditeur (gestion contenu uniquement)
  - Gestionnaire Commune (accès limité à sa commune)
  - Visualiseur (lecture seule)

- **Permissions granulaires** :
  - CRUD sur chaque module
  - Export de données
  - Validation de données
  - Gestion des utilisateurs
  - Accès aux statistiques
  - Configuration système

---

## =e 2. GESTION DES UTILISATEURS

### 2.1 Module Utilisateurs
- **Liste des utilisateurs** avec filtres et recherche
  - Filtres : rôle, statut (actif/inactif), commune, date création
  - Recherche : nom, email, username
  - Tri : alphabétique, date création, dernier login

- **Création/Modification d'utilisateur**
  - Informations personnelles (nom, prénom, email, téléphone)
  - Attribution de rôle
  - Rattachement à une commune (optionnel)
  - Activation/Désactivation du compte
  - Envoi automatique d'email de bienvenue

- **Gestion des rôles**
  - Création de rôles personnalisés
  - Configuration des permissions par rôle
  - Affectation de permissions spécifiques

- **Historique des connexions**
  - Date/heure du dernier login
  - Adresse IP
  - Appareil utilisé
  - Tentatives de connexion échouées

---

## =Ê 3. GESTION DES DONNÉES GÉOGRAPHIQUES

### 3.1 Module Régions
- **Liste des régions** de Madagascar
- **CRUD Régions** :
  - Code région (unique)
  - Nom
  - Description
  - Statut (actif/inactif)
- **Statistiques par région** :
  - Nombre de départements
  - Nombre de communes
  - Total des revenus miniers

### 3.2 Module Départements
- **Liste des départements** avec filtrage par région
- **CRUD Départements** :
  - Code département
  - Nom
  - Région de rattachement
  - Description
  - Statut
- **Statistiques par département** :
  - Nombre de communes
  - Projets miniers actifs
  - Revenus collectés

### 3.3 Module Communes
- **Liste des communes** avec filtres multiples
  - Par région
  - Par département
  - Par statut
  - Par présence de projets miniers

- **CRUD Communes** :
  - Code commune
  - Nom
  - Département de rattachement
  - Région de rattachement
  - Population
  - Superficie
  - Description
  - Statut

- **Tableau de bord par commune** :
  - Projets miniers associés
  - Revenus par année
  - Évolution des revenus (graphiques)
  - Documents associés
  - Utilisateurs rattachés

---

## Ï 4. GESTION DES PROJETS MINIERS

### 4.1 Module Types de Minerais
- **Liste des types de minerais** (or, nickel, cobalt, chrome, etc.)
- **CRUD Types de minerais** :
  - Code unique
  - Nom
  - Description
  - Statut

### 4.2 Module Sociétés Minières
- **Liste des sociétés minières**
- **CRUD Sociétés** :
  - Code unique
  - Nom commercial
  - Raison sociale
  - NIF (Numéro d'Identification Fiscale)
  - STAT (numéro statistique)
  - Adresse
  - Téléphone
  - Email
  - Statut

- **Fiche détaillée société** :
  - Projets miniers actifs
  - Historique des projets
  - Revenus générés par projet
  - Documents légaux

### 4.3 Module Projets Miniers
- **Liste des projets** avec filtres :
  - Par société minière
  - Par type de minerai
  - Par commune/région
  - Par statut (actif, suspendu, terminé)
  - Par période

- **CRUD Projets miniers** :
  - Code unique
  - Nom du projet
  - Société minière
  - Type de minerai
  - Commune d'implantation
  - Date de début
  - Date de fin
  - Statut
  - Description

- **Tableau de bord projet** :
  - Revenus générés par période
  - Communes bénéficiaires
  - Évolution temporelle
  - Documents associés

---

## =° 5. GESTION DES REVENUS MINIERS (MODULE CENTRAL)

### 5.1 Module Exercices Fiscaux
- **Liste des exercices** (années fiscales)
- **CRUD Exercices** :
  - Année
  - Date de début
  - Date de fin
  - Statut (ouvert/clôturé)

- **Clôture d'exercice** :
  - Validation des données
  - Verrouillage des modifications
  - Génération de rapports annuels

### 5.2 Module Périodes
- **Gestion des périodes** par exercice
  - Mensuel, Trimestriel, Semestriel, Annuel
- **CRUD Périodes** :
  - Code
  - Nom
  - Exercice de rattachement
  - Date début/fin
  - Type de période
  - Ordre d'affichage

### 5.3 Module Catégories de Rubriques
- **Gestion des catégories** pour organiser les rubriques
- **CRUD Catégories** :
  - Code unique
  - Nom
  - Description
  - Ordre d'affichage

### 5.4 Module Rubriques (FONCTIONNALITÉ CLÉ)
**Interface "sans code" pour gérer les lignes du tableau**

- **Arborescence des rubriques** (structure hiérarchique)
  - Rubriques principales (niveau 1)
  - Sous-rubriques (niveaux 2, 3, etc.)
  - Glisser-déposer pour réorganiser
  - Indentation visuelle

- **CRUD Rubriques** :
  - Code unique
  - Nom de la rubrique
  - Catégorie
  - Rubrique parent (pour hiérarchie)
  - Niveau dans la hiérarchie
  - Ordre d'affichage
  - Type (recette, dépense, solde, autre)
  - Formule de calcul (si rubrique calculée)
  - Afficher total (oui/non)
  - Description
  - Statut

- **Formules de calcul** :
  - Interface visuelle pour créer des formules
  - Référencement d'autres rubriques
  - Opérateurs : +, -, *, /, ()
  - Prévisualisation du résultat
  - Validation de formule

- **Prévisualisation** :
  - Voir le tableau tel qu'il apparaîtra en front-office
  - Tester l'affichage avec données réelles

### 5.5 Module Colonnes Personnalisées
**Ajout de colonnes dynamiques sans coder**

- **Liste des colonnes personnalisées**
- **CRUD Colonnes** :
  - Code unique
  - Nom de la colonne
  - Type de données (texte, nombre, date, booléen, JSON)
  - Ordre d'affichage
  - Obligatoire (oui/non)
  - Visible (oui/non)
  - Éditable (oui/non)
  - Valeur par défaut

- **Aperçu tableau dynamique** :
  - Visualisation des colonnes personnalisées
  - Réorganisation par glisser-déposer
  - Masquer/Afficher colonnes

### 5.6 Module Saisie des Revenus
**Interface de saisie des données financières**

- **Tableau de saisie interactif** :
  - Sélection : Commune + Période + Exercice
  - Affichage automatique des rubriques configurées
  - Saisie en ligne (inline editing)
  - Auto-sauvegarde
  - Calcul automatique des rubriques calculées
  - Validation des données

- **Formulaire de saisie détaillé** :
  - Commune
  - Rubrique
  - Période
  - Projet minier (optionnel)
  - Montant réalisé
  - Montant prévu (budget)
  - Écart (auto-calculé)
  - Taux de réalisation (auto-calculé)
  - Observations
  - Documents justificatifs (upload)

- **Import de données** :
  - Upload fichier Excel
  - Mapping colonnes Excel ’ Rubriques
  - Prévisualisation avant import
  - Validation des données
  - Import en masse

- **Validation des revenus** :
  - Workflow de validation (brouillon ’ validé)
  - Historique des validations
  - Commentaires de validation

### 5.7 Tableaux de Bord Revenus
- **Vue d'ensemble** :
  - Total revenus par exercice
  - Évolution année par année
  - Top 10 communes bénéficiaires
  - Répartition par type de minerai
  - Répartition par région

- **Graphiques interactifs** :
  - Évolution temporelle (courbes)
  - Comparaison communes (barres)
  - Répartition (camemberts)
  - Carte géographique (heatmap)

- **Filtres avancés** :
  - Par commune/département/région
  - Par exercice/période
  - Par projet minier
  - Par rubrique
  - Par statut de validation

---

## =Ä 6. GESTION DES DOCUMENTS

### 6.1 Module Types de Documents
- **Configuration des types** acceptés
- **CRUD Types de documents** :
  - Code unique
  - Nom
  - Description
  - Extensions autorisées (.pdf, .xlsx, .docx, etc.)
  - Taille maximale (Mo)

### 6.2 Module Documents
- **Bibliothèque de documents** :
  - Liste avec miniatures/icônes
  - Filtres : type, commune, exercice, tags
  - Recherche plein texte dans les documents
  - Vue liste / Vue grille

- **Upload de documents** :
  - Upload multiple (drag & drop)
  - Barre de progression
  - Association automatique (commune, exercice, revenu)
  - Indexation automatique du contenu

- **CRUD Documents** :
  - Titre
  - Type de document
  - Commune associée
  - Exercice associé
  - Revenu associé
  - Description
  - Tags (mots-clés)
  - Fichier

- **Prévisualisation** :
  - Lecteur PDF intégré
  - Prévisualisation Office (si possible)
  - Téléchargement

- **Moteur de recherche** :
  - Recherche full-text dans le contenu extrait
  - Recherche par tags
  - Recherche par métadonnées
  - Filtres combinés
  - Résultats avec pertinence

### 6.3 Indexation automatique
- **Extraction de texte** :
  - PDF ’ texte
  - Word ’ texte
  - Excel ’ texte
  - Stockage dans `contenu_texte`

- **Réindexation** :
  - Réindexer un document
  - Réindexation en masse

---

## =ð 7. GESTION DE LA NEWSLETTER

### 7.1 Module Abonnés
- **Liste des abonnés** :
  - Filtres : statut (actif/inactif, confirmé/non confirmé)
  - Recherche : email, nom
  - Export CSV/Excel

- **CRUD Abonnés** :
  - Email
  - Nom
  - Prénom
  - Statut
  - Date de confirmation
  - Date d'inscription

- **Actions en masse** :
  - Activer/Désactiver
  - Supprimer
  - Exporter

- **Validation des abonnements** :
  - Email de confirmation automatique
  - Lien de désabonnement

### 7.2 Module Campagnes Newsletter
- **Liste des campagnes** :
  - Filtres : statut (brouillon, programmée, envoyée)
  - Tri : date création, date envoi

- **Création de campagne** :
  - Titre
  - Sujet de l'email
  - Éditeur WYSIWYG pour le contenu
  - Aperçu email
  - Choix des destinataires (tous, sélection)
  - Programmation d'envoi

- **Statistiques campagne** :
  - Nombre de destinataires
  - Nombre d'envoyés
  - Taux d'ouverture
  - Nombre de clics
  - Graphiques d'engagement

- **Templates d'email** :
  - Modèles prédéfinis
  - Personnalisation (logo, couleurs)
  - Variables dynamiques (nom, commune, etc.)

---

## =¬ 8. MESSAGERIE SÉCURISÉE

### 8.1 Module Messages Sécurisés
- **Boîte de réception** :
  - Messages reçus
  - Messages envoyés
  - Messages archivés
  - Filtres : lu/non lu, priorité, commune

- **Création de message** :
  - Destinataire (utilisateur)
  - Sujet
  - Contenu (éditeur riche)
  - Commune associée
  - Priorité (basse, normale, haute, urgente)
  - Fichiers joints

- **Notifications** :
  - Badge de nouveaux messages
  - Email de notification (optionnel)
  - Notification push (si implémenté)

- **Sécurité** :
  - Chiffrement des messages
  - Audit trail (qui a lu, quand)
  - Possibilité de suppression côté destinataire

### 8.2 Intégration GlobalLeaks (optionnel)
- **Configuration GlobalLeaks** :
  - URL du serveur GlobalLeaks
  - Clés d'API
  - Mapping des catégories

- **Réception de dénonciations** :
  - Synchronisation automatique
  - Affichage dans le back-office
  - Workflow de traitement
  - Anonymat préservé

---

## =Ê 9. STATISTIQUES ET LOGS

### 9.1 Tableau de bord Statistiques
- **Statistiques de visites** :
  - Visites par jour/semaine/mois
  - Pages les plus consultées
  - Durée moyenne de session
  - Géolocalisation des visiteurs (si disponible)
  - Graphiques d'évolution

- **Statistiques de téléchargements** :
  - Nombre de téléchargements par jour/semaine/mois
  - Types d'exports les plus utilisés (Excel, Word, PDF)
  - Documents les plus téléchargés
  - Téléchargements par commune/région
  - Graphiques de tendance

- **Statistiques utilisateurs** :
  - Utilisateurs actifs vs inactifs
  - Connexions par jour
  - Utilisateurs par rôle
  - Utilisateurs par commune

### 9.2 Logs de Visites
- **Consultation des logs** :
  - Liste des visites
  - Filtres : page, utilisateur, date, IP
  - Export CSV

- **Détails d'une visite** :
  - Page visitée
  - Utilisateur (si connecté)
  - Adresse IP
  - User Agent (navigateur)
  - Session ID
  - Durée

### 9.3 Logs de Téléchargements
- **Liste des téléchargements** :
  - Filtres : type d'export, document, commune, exercice, utilisateur, date
  - Export CSV

- **Détails** :
  - Document/export téléchargé
  - Type d'export
  - Commune/exercice concerné
  - Utilisateur
  - IP
  - Date/heure

### 9.4 Logs d'Activités Système
- **Journal d'audit** :
  - Toutes les actions CRUD
  - Connexions/déconnexions
  - Filtres : utilisateur, action, entité, date
  - Recherche

- **Détails d'une activité** :
  - Utilisateur
  - Action (CREATE, UPDATE, DELETE, LOGIN, LOGOUT)
  - Entité concernée (table)
  - ID de l'entité
  - Anciennes valeurs (JSON)
  - Nouvelles valeurs (JSON)
  - IP
  - User Agent
  - Date/heure

- **Analyse comportementale** :
  - Activités suspectes
  - Tentatives d'accès non autorisées
  - Modifications sensibles

---

## ™ 10. CONFIGURATION SYSTÈME

### 10.1 Paramètres Généraux
- **Informations site** :
  - Nom du site
  - Logo
  - Favicon
  - Description
  - Email de contact

- **Configuration email** :
  - Serveur SMTP
  - Port
  - Email expéditeur
  - Nom expéditeur
  - Authentification

- **Maintenance** :
  - Mode maintenance (activer/désactiver)
  - Message de maintenance
  - IPs autorisées en mode maintenance

### 10.2 Sécurité
- **Politique de mot de passe** :
  - Longueur minimale
  - Complexité requise
  - Expiration (jours)
  - Réutilisation interdite

- **Tentatives de connexion** :
  - Nombre max de tentatives
  - Durée de blocage
  - IP blacklist/whitelist

- **Sessions** :
  - Durée de session
  - Timeout d'inactivité

### 10.3 Sauvegardes
- **Configuration backups** :
  - Fréquence automatique
  - Rétention (nombre de backups)
  - Emplacement de stockage

- **Actions manuelles** :
  - Créer backup maintenant
  - Restaurer un backup
  - Télécharger backup
  - Liste des backups

### 10.4 Mise à jour et Maintenance
- **Vérification des mises à jour** :
  - Framework
  - Dépendances
  - Alertes de sécurité

- **Historique des mises à jour** :
  - Version
  - Date
  - Changelog

- **Outils de diagnostic** :
  - État de santé du système
  - Connexion base de données
  - Espace disque
  - Performance

---

## =ñ 11. INTERFACE UTILISATEUR DU BACK-OFFICE

### 11.1 Navigation et Layout
- **Sidebar (menu latéral)** avec sections :
  - <à Tableau de bord (Dashboard)
  - =e Utilisateurs & Rôles
  - =ú Géographie (Régions/Départements/Communes)
  - Ï Projets Miniers
  - =° Revenus Miniers
  - =Ê Rubriques & Tableaux
  - =Ä Documents
  - =ð Newsletter
  - =¬ Messages Sécurisés
  - =È Statistiques & Logs
  - ™ Configuration

- **Top bar (barre supérieure)** :
  - Logo + Nom de l'organisation
  - Notifications (badge)
  - Messages non lus (badge)
  - Profil utilisateur (dropdown)
  - Déconnexion

- **Breadcrumbs** (fil d'Ariane)
  - Navigation contextuelle

### 11.2 Composants Réutilisables
- **DataTables** :
  - Tri multi-colonnes
  - Filtres par colonne
  - Recherche globale
  - Pagination
  - Export (CSV, Excel, PDF)
  - Actions en masse (sélection multiple)
  - Actions par ligne (éditer, supprimer, voir)

- **Formulaires** :
  - Validation en temps réel
  - Messages d'erreur clairs
  - Champs requis marqués
  - Auto-sauvegarde (brouillon)
  - Boutons : Enregistrer, Annuler, Supprimer

- **Modals/Dialogs** :
  - Confirmation de suppression
  - Alertes
  - Prévisualisation
  - Édition rapide

- **Charts/Graphiques** :
  - Courbes d'évolution
  - Barres comparatives
  - Camemberts/Donut
  - Cartes géographiques
  - Interactifs (zoom, filtres)

- **Notifications/Toasts** :
  - Succès (vert)
  - Erreur (rouge)
  - Avertissement (orange)
  - Information (bleu)
  - Position : top-right
  - Auto-dismiss

### 11.3 Responsive Design
- **Tablette** :
  - Sidebar repliable
  - Tableaux avec scroll horizontal

- **Mobile** :
  - Menu burger
  - Cartes au lieu de tableaux
  - Actions swipe
  - Optimisation tactile

### 11.4 Accessibilité
- **Normes WCAG 2.1** :
  - Navigation au clavier
  - Lecteur d'écran compatible
  - Contraste suffisant
  - Textes alternatifs

- **Mode sombre** :
  - Toggle light/dark mode
  - Préférence sauvegardée

---

## = 12. FONCTIONNALITÉS TRANSVERSALES

### 12.1 Recherche Globale
- **Barre de recherche** dans le top bar
- **Recherche dans** :
  - Communes
  - Projets miniers
  - Documents
  - Revenus
  - Utilisateurs
  - Rubriques

- **Résultats groupés** par type
- **Suggestions automatiques** (autocomplete)
- **Accès rapide** au résultat

### 12.2 Export de Données
- **Formats disponibles** :
  - Excel (.xlsx)
  - CSV
  - PDF
  - Word (.docx) pour rapports

- **Options d'export** :
  - Sélection visible
  - Sélection complète
  - Filtres appliqués
  - Tout

- **Personnalisation** :
  - Choix des colonnes
  - Ordre des colonnes
  - Format de date
  - Logo/En-tête

### 12.3 Import de Données
- **Import Excel/CSV** :
  - Upload fichier
  - Détection automatique des colonnes
  - Mapping manuel si nécessaire
  - Validation des données
  - Rapport d'erreurs
  - Aperçu avant import
  - Import ou Annuler

### 12.4 Gestion des Erreurs
- **Messages d'erreur** clairs et actionnables
- **Validation côté client** (temps réel)
- **Validation côté serveur** (sécurité)
- **Retry automatique** pour erreurs réseau
- **Mode offline** (si pertinent)

### 12.5 Aide Contextuelle
- **Tooltips** sur les champs
- **Guide utilisateur** intégré
- **FAQ** par module
- **Vidéos tutoriels** (si disponible)
- **Support contact**

---

## <¨ 13. CHARTE GRAPHIQUE

### 13.1 Identité Visuelle
- **Charte graphique** fournie par TI MG
- **Couleurs principales** :
  - Couleur primaire (TI MG)
  - Couleur secondaire
  - Couleur accent
  - Couleurs de statut (succès, erreur, warning, info)

- **Typographie** :
  - Police principale (titres)
  - Police secondaire (corps de texte)
  - Tailles définies

### 13.2 Composants UI
- **Boutons** :
  - Primaire (action principale)
  - Secondaire (actions secondaires)
  - Tertiaire (actions légères)
  - Danger (actions destructives)
  - Icônes + texte

- **Cartes (Cards)** :
  - Bordures subtiles
  - Ombres légères
  - Espacement cohérent

- **Badges/Pills** :
  - Statuts (actif, inactif, validé, etc.)
  - Compteurs

---

## =Ë 14. WORKFLOW ET PROCESSUS MÉTIER

### 14.1 Workflow Saisie de Revenus
1. **Création brouillon** :
   - Éditeur saisit les données
   - Auto-sauvegarde
   - Validation formelle

2. **Soumission pour validation** :
   - Vérification complétude
   - Notification au validateur

3. **Validation** :
   - Administrateur/Gestionnaire valide
   - Ajout de commentaires si nécessaire
   - Données verrouillées après validation

4. **Publication** :
   - Données visibles en front-office
   - Génération automatique de rapports

### 14.2 Workflow Gestion des Documents
1. **Upload** :
   - Utilisateur upload document
   - Extraction automatique du contenu (indexation)
   - Attribution métadonnées

2. **Modération** (optionnel) :
   - Vérification par administrateur
   - Validation/Rejet

3. **Publication** :
   - Document disponible en recherche
   - Téléchargeable selon permissions

### 14.3 Workflow Newsletter
1. **Création campagne** :
   - Rédaction contenu
   - Sélection destinataires
   - Prévisualisation

2. **Programmation** :
   - Date/heure d'envoi
   - Validation finale

3. **Envoi** :
   - Envoi automatique
   - Tracking des ouvertures/clics

4. **Analyse** :
   - Statistiques de campagne
   - Optimisation futures campagnes

---

## =€ 15. PERFORMANCE ET OPTIMISATION

### 15.1 Optimisations Frontend
- **Lazy loading** des composants
- **Pagination** des listes longues
- **Debouncing** des recherches
- **Mise en cache** des données fréquentes
- **Compression** des assets

### 15.2 Optimisations Backend
- **Indexation** des tables critiques (déjà dans schema.sql)
- **Requêtes optimisées** (éviter N+1)
- **Pagination** côté serveur
- **Cache** Redis (si nécessaire)
- **Compression** des réponses

### 15.3 Monitoring
- **Temps de réponse** des endpoints
- **Utilisation mémoire**
- **Utilisation CPU**
- **Espace disque**
- **Alertes** si seuils dépassés

---

## >ê 16. TESTING ET QUALITÉ

### 16.1 Tests Fonctionnels
- **Tests manuels** :
  - Checklist par module
  - Scénarios utilisateurs
  - Tests de non-régression

- **Tests automatisés** (si ressources disponibles) :
  - Tests unitaires
  - Tests d'intégration
  - Tests end-to-end

### 16.2 Assurance Qualité
- **Validation des données** à tous les niveaux
- **Gestion des droits** stricte
- **Logs complets** pour audit
- **Rollback** en cas d'erreur critique

---

## =Ú 17. DOCUMENTATION ET FORMATION

### 17.1 Documentation Technique
- **Documentation du code** :
  - Commentaires clairs
  - README par module
  - Architecture globale

- **API Documentation** :
  - Swagger/OpenAPI
  - Endpoints documentés
  - Exemples de requêtes

### 17.2 Guide Utilisateur
- **Manuel d'utilisation** :
  - Par rôle (Admin, Éditeur, etc.)
  - Par module
  - Captures d'écran annotées
  - Cas d'usage

- **FAQ** :
  - Questions fréquentes
  - Résolution de problèmes courants

### 17.3 Formation
- **Formation des administrateurs** :
  - Session en présentiel/distanciel
  - Prise en main de chaque module
  - Bonnes pratiques
  - Q&R

- **Formation des éditeurs** :
  - Focus sur saisie de revenus
  - Gestion des documents
  - Workflow de validation

- **Support post-formation** :
  - Assistance par email
  - Sessions de rappel

---

## =' 18. MAINTENANCE ET ÉVOLUTION

### 18.1 Maintenance Préventive
- **Mises à jour régulières** :
  - Framework
  - Dépendances
  - Patches de sécurité

- **Vérifications périodiques** :
  - Intégrité base de données
  - Backups
  - Logs d'erreurs
  - Performance

### 18.2 Maintenance Corrective
- **Correction de bugs** :
  - Système de ticketing
  - Priorisation (critique, haute, normale, basse)
  - Délai de résolution selon priorité

- **Support technique** :
  - Disponibilité 2 ans minimum (sans frais)
  - Temps de réponse < 24h pour bugs critiques
  - Temps de réponse < 48h pour bugs normaux

### 18.3 Évolution
- **Demandes d'évolution** :
  - Collecte des besoins utilisateurs
  - Priorisation
  - Planning de développement

- **Nouvelles fonctionnalités** :
  - Processus de validation
  - Tests en pré-production
  - Déploiement progressif

---

## =Ê 19. MÉTRIQUES DE SUCCÈS

### 19.1 KPIs Back-Office
- **Adoption utilisateurs** :
  - Nombre d'utilisateurs actifs
  - Fréquence de connexion
  - Taux d'utilisation par module

- **Qualité des données** :
  - Taux de complétude
  - Taux de validation
  - Données saisies par mois

- **Performance** :
  - Temps de chargement pages < 2s
  - Disponibilité > 99.5%
  - Temps de réponse API < 500ms

- **Satisfaction utilisateurs** :
  - Enquête de satisfaction
  - Nombre de tickets support
  - Feedbacks positifs/négatifs

### 19.2 KPIs Front-Office (impact indirect)
- **Visites** :
  - Nombre de visiteurs uniques
  - Pages vues
  - Taux de rebond

- **Téléchargements** :
  - Nombre de téléchargements
  - Types d'exports utilisés

- **Engagement** :
  - Abonnés newsletter
  - Taux d'ouverture newsletter
  - Partages sur réseaux sociaux

---

## <¯ 20. PRIORISATION DES FONCTIONNALITÉS

### Phase 1 - MVP (Fonctionnalités Essentielles)
**Priorité CRITIQUE** :
1. Authentification & Gestion des utilisateurs
2. Gestion des Régions/Départements/Communes
3. Gestion des Rubriques (tableau dynamique)
4. Saisie des Revenus
5. Export Excel/Word
6. Dashboard principal avec statistiques de base

### Phase 2 - Fonctionnalités Importantes
**Priorité HAUTE** :
1. Gestion des Projets Miniers
2. Gestion des Documents + Moteur de recherche
3. Gestion des Périodes et Exercices
4. Colonnes personnalisées (extensibilité)
5. Logs de visites et téléchargements
6. Import de données Excel

### Phase 3 - Fonctionnalités Complémentaires
**Priorité MOYENNE** :
1. Newsletter (abonnés + campagnes)
2. Messagerie sécurisée
3. Logs d'activités système
4. Tableaux de bord avancés (graphiques)
5. Configuration système
6. Validation workflow

### Phase 4 - Nice to Have
**Priorité BASSE** :
1. Intégration GlobalLeaks
2. Mode sombre
3. Notifications push
4. Double authentification (2FA)
5. API publique
6. Export PDF avancé

---

##  21. CHECKLIST DE VALIDATION FINALE

### 21.1 Fonctionnalités
- [ ] Tous les modules MVP implémentés et testés
- [ ] Authentification sécurisée fonctionnelle
- [ ] CRUD complet sur toutes les entités
- [ ] Tableau dynamique (rubriques + colonnes) opérationnel
- [ ] Export Excel/Word fonctionnel
- [ ] Moteur de recherche documents opérationnel
- [ ] Newsletter (inscription + envoi) fonctionnelle
- [ ] Statistiques visites/téléchargements disponibles

### 21.2 Sécurité
- [ ] JWT implémenté correctement
- [ ] Permissions par rôle respectées
- [ ] Protection CSRF
- [ ] Validation des inputs
- [ ] Mots de passe hashés (bcrypt)
- [ ] HTTPS activé (production)
- [ ] Logs d'audit activés

### 21.3 Performance
- [ ] Temps de chargement < 2s
- [ ] Pagination implémentée
- [ ] Index base de données créés
- [ ] Requêtes optimisées
- [ ] Cache activé (si nécessaire)

### 21.4 UX/UI
- [ ] Design conforme à la charte graphique
- [ ] Responsive (desktop, tablette, mobile)
- [ ] Navigation intuitive
- [ ] Messages d'erreur clairs
- [ ] Aide contextuelle disponible

### 21.5 Documentation
- [ ] Guide utilisateur complet
- [ ] Documentation technique
- [ ] Code commenté et clair
- [ ] README à jour

### 21.6 Formation
- [ ] Formation administrateurs effectuée
- [ ] Formation éditeurs effectuée
- [ ] Support mis en place

---

## =Þ 22. SUPPORT ET CONTACT

### 22.1 Organisation
- **Client** : PCQVP Madagascar / TI MG
- **Contact** : vramaherison@transparency.mg

### 22.2 Service Après-Vente
- **Durée** : 2 ans minimum (sans frais supplémentaires)
- **Services inclus** :
  - Fluidité et responsivité du site
  - Correction de bugs et erreurs
  - Mises à jour Framework et logiciels
  - Support technique

---

## <Á CONCLUSION

Ce plan couvre l'ensemble des fonctionnalités du back-office conformément au cahier des charges et au modèle de données.

**Points clés de réussite** :
1. **Interface "sans code"** pour la gestion des rubriques et colonnes
2. **Sécurité renforcée** avec authentification et permissions granulaires
3. **Tableaux de bord** pour suivi et prise de décision
4. **Extensibilité** pour futures évolutions
5. **Documentation et formation** pour adoption utilisateur

**Prochaines étapes** :
1. Validation du plan avec TI MG
2. Priorisation des phases de développement
3. Conception des maquettes UI (Adobe XD)
4. Développement itératif par module
5. Tests et ajustements
6. Formation et mise en production
