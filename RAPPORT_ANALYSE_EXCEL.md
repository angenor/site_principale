# RAPPORT D'ANALYSE - TABLEAUX EXCEL ET COMPATIBILITÉ SQL

**Date:** 2025-11-14
**Fichier analysé:** `/Users/angenor/Documents/projets/2025/TI/collectivites_territoriales/bank/cahier_des_charges/Tableaux_de_Compte_Administratif.xlsx`
**Schéma SQL:** `/Users/angenor/Documents/projets/2025/TI/collectivites_territoriales/bank/modele_de_donnees/schema.sql`

---

## RÉSUMÉ EXÉCUTIF

Le fichier Excel contient **3 feuilles principales** décrivant la structure des comptes administratifs des collectivités territoriales de Madagascar :

1. **RECETTE** : 182 lignes × 13 colonnes
2. **DEPENSES** : 289 lignes × 14 colonnes
3. **EQUILIBRE** : 35 lignes × 11 colonnes

**VERDICT : ✓ Le modèle SQL actuel est COMPATIBLE avec les tableaux Excel**

Le schéma SQL peut reproduire EXACTEMENT les tableaux Excel, avec quelques ajustements mineurs recommandés (détaillés ci-dessous).

---

## 1. STRUCTURE DE LA FEUILLE "RECETTE"

### Organisation
- **Ligne d'en-tête:** Ligne 6
- **Données:** À partir de la ligne 7
- **Structure:** Hiérarchie à 3 niveaux
  - Niveau 1: 2 chiffres (ex: 70, 71, 72)
  - Niveau 2: 3 chiffres (ex: 708, 714, 715)
  - Niveau 3: 4 chiffres (ex: 7080, 7140, 7151)

### Colonnes (13 colonnes au total)

| Col | Nom | Description | Type | Calculé |
|-----|-----|-------------|------|---------|
| 0 | - | Marge gauche | - | - |
| 1 | COMPTE | Niveau 1 (2 chiffres) | Code | Non |
| 2 | COMPTE | Niveau 2 (3 chiffres) | Code | Non |
| 3 | COMPTE | Niveau 3 (4 chiffres) | Code | Non |
| 4 | INTITULES | Description de la rubrique | Texte | Non |
| 5 | BUDGET PRIMITIF | Montant du budget initial | Montant | Non |
| 6 | BUDGET ADDITIONNEL | Montants supplémentaires | Montant | Non |
| 7 | MODIFICATIONS +/- | Ajustements budgétaires | Montant | Non |
| 8 | PREVISIONS DEFINITIVES (1) | Budget total ajusté | Montant | **OUI** |
| 9 | OR ADMIS (2) | Ordres de recettes admis | Montant | Non |
| 10 | RECOUVREMENT | Montants recouvrés | Montant | Non |
| 11 | RESTE A RECOUVRER | Solde à recouvrer | Montant | **OUI** |
| 12 | TAUX D'EXECUTION (2)/(1) | % d'exécution | % | **OUI** |

### Sections

#### Section 1: RECETTES DE FONCTIONNEMENT
- **Compte 70:** IMPOTS SUR LES REVENUS, BENEFICES ET GAINS
- **Compte 71:** IMPOTS SUR LE PATRIMOINE
- **Compte 72:** IMPOTS SUR LES BIENS ET SERVICES
- **Compte 74:** AUTRES RECETTES FISCALES
- **Compte 75:** CONTRIBUTIONS RECUES DES TIERS
- **Compte 76:** PRODUITS FINANCIERS
- **Compte 77:** RECETTES NON FISCALES
- Lignes de totaux: TOTAL RECETTES REELLES DE FONCTIONNEMENT

#### Section 2: RECETTES D'INVESTISSEMENT
- **Compte 13:** SUBVENTIONS D'EQUIPEMENT
- **Compte 14:** CESSIONS D'IMMOBILISATIONS
- **Compte 16:** EMPRUNTS ET DETTES ASSIMILEES
- **Compte 10:** FONDS, DOTATIONS ET RESERVES (section d'ordre)
- Lignes de totaux: TOTAL RECETTES REELLES D'INVESTISSEMENT, RECETTE D'ORDRE, SOUS-TOTAL

### Structure hiérarchique (exemple)

```
70 - IMPOTS SUR LES REVENUS, BENEFICES ET GAINS (Niveau 1)
  ├─ 708 - Autres impôts sur les revenus (Niveau 2)
  │   └─ 7080 - Autres impôts sur les revenus - Impôt synthétique (Niveau 3)
  │
71 - IMPOTS SUR LE PATRIMOINE (Niveau 1)
  ├─ 714 - Impôts fonciers sur les terrains - IFT (Niveau 2)
  │   └─ 7140 - Impôts fonciers sur les terrains - IFT (Niveau 3)
  ├─ 715 - Impôt foncier sur les propriétés bâties – IFPB (Niveau 2)
  │   ├─ 7151 - Impôt foncier sur les propriétés bâties – IFPB (Niveau 3)
  │   └─ 7158 - Autres impôts locaux sur les propriétés baties (Niveau 3)
  └─ 718 - Taxe annuelle sur autres patrimoines (Niveau 2)
      ├─ 7181 - Taxes sur les appareils automatiques ou électroniques (Niveau 3)
      ├─ 7182 - Taxes sur les appareils mecaniques (Niveau 3)
      └─ 7188 - Autres taxes et impots annuels (Niveau 3)
```

---

## 2. STRUCTURE DE LA FEUILLE "DEPENSES"

### Organisation
- **Ligne d'en-tête:** Ligne 8
- **Données:** À partir de la ligne 9
- **Structure:** Hiérarchie à 3 niveaux (identique à RECETTE)

### Colonnes (14 colonnes au total)

| Col | Nom | Description | Type | Calculé |
|-----|-----|-------------|------|---------|
| 0 | - | Marge gauche | - | - |
| 1 | COMPTE | Niveau 1 (2 chiffres) | Code | Non |
| 2 | COMPTE | Niveau 2 (3 chiffres) | Code | Non |
| 3 | COMPTE | Niveau 3 (4 chiffres) | Code | Non |
| 4 | INTITULES | Description de la rubrique | Texte | Non |
| 5 | BUDGET PRIMITIF | Montant du budget initial | Montant | Non |
| 6 | BUDGET ADDITIONNEL | Montants supplémentaires | Montant | Non |
| 7 | MODIFICATIONS +/- | Ajustements budgétaires | Montant | Non |
| 8 | PREVISIONS DEFINITIVES (1) | Budget total ajusté | Montant | **OUI** |
| 9 | ENGAGEMENT | Montants engagés | Montant | Non |
| 10 | MANDAT ADMIS (2) | Mandats de paiement admis | Montant | Non |
| 11 | PAIEMENT | Montants payés | Montant | Non |
| 12 | RESTE A PAYER | Solde à payer | Montant | **OUI** |
| 13 | TAUX D'EXECUTION (2)/(1) | % d'exécution | % | **OUI** |

### Différences par rapport à RECETTE

| Recettes | Dépenses |
|----------|----------|
| OR ADMIS | MANDAT ADMIS |
| RECOUVREMENT | PAIEMENT |
| RESTE A RECOUVRER | RESTE A PAYER |
| 13 colonnes | **14 colonnes** (+ ENGAGEMENT) |

### Sections

#### Section 1: DEPENSES DE FONCTIONNEMENT
- **Compte 60:** CHARGES DE PERSONNEL
- **Compte 61:** ACHATS DE BIENS
- **Compte 62:** ACHATS DE SERVICES ET CHARGES PERMANENTES
- **Compte 63:** DEPENSES D'INTERVENTION
- **Compte 64:** IMPOTS ET TAXES
- **Compte 65:** TRANSFERTS ET SUBVENTIONS
- **Compte 66:** CHARGES FINANCIERES
- **Compte 67:** CHARGES DIVERSES
- Lignes de totaux: TOTAL DEPENSES REELLES DE FONCTIONNEMENT

#### Section 2: DEPENSES D'INVESTISSEMENT
- **Compte 16:** EMPRUNTS ET DETTES ASSIMILEES
- **Compte 20:** IMMOBILISATION INCORPORELLES
- **Compte 21:** IMMOBILISATION CORPORELLES
- Lignes de totaux: TOTAL DEPENSES REELLES D'INVESTISSEMENT, TOTAL D'ORDRE, SOUS-TOTAL

### Structure hiérarchique (exemple)

```
60 - CHARGES DE PERSONNEL (Niveau 1)
  ├─ 601 - Salaires et accessoires (Niveau 2)
  │   ├─ 6011 - Personnel permanent (Niveau 3)
  │   └─ 6012 - Personnel non permanent (Niveau 3)
  ├─ 602 - Indemnités liées à la solde (Niveau 2)
  │   ├─ 6021 - Personnel permanent (Niveau 3)
  │   └─ 6022 - Personnel non permanent (Niveau 3)
  ├─ 603 - Indemnités et avantages liés à la fonction (Niveau 2)
  │   ├─ 6031 - Personnel permanent (Niveau 3)
  │   └─ 6032 - Personnel non permanent (Niveau 3)
  └─ ...
```

---

## 3. STRUCTURE DE LA FEUILLE "EQUILIBRE"

### Organisation
- **Format:** Tableau double (DEPENSES | RECETTES) côte à côte
- **Deux sections:** FONCTIONNEMENT et INVESTISSEMENT
- **Ligne d'en-tête section 1:** Ligne 6
- **Ligne d'en-tête section 2:** Ligne 23

### Colonnes (11 colonnes au total)

#### PARTIE GAUCHE - DEPENSES

| Col | Nom | Description |
|-----|-----|-------------|
| 0 | - | Marge |
| 1 | COMPTE | Code du compte de dépense |
| 2 | INTITULES | Description |
| 3 | MANDAT ADMIS | Mandats admis |
| 4 | PAIEMENT | Paiements effectués |
| 5 | RESTE A PAYER | Solde à payer |

#### PARTIE DROITE - RECETTES

| Col | Nom | Description |
|-----|-----|-------------|
| 6 | COMPTE | Code du compte de recette |
| 7 | INTITULES | Description |
| 8 | MANDAT ADMIS | Ordres de recette admis |
| 9 | PAIEMENT | Recouvrements effectués |
| 10 | RESTE A PAYER | Reste à recouvrer |

### Section 1: FONCTIONNEMENT (lignes 7-20)

#### DEPENSES (gauche)
- 60: Charges de personnel
- 61: Achats de biens
- 62: Achats de services et charges permanentes
- 63: Dépenses d'intervention
- 64: Impôts et taxes
- 65: Transferts et subventions
- 66: Charges financières
- 67: Charges diverses
- 119: Report à nouveau (déficit)
- **TOTAL DEPENSES REELLES DE FONCTIONNEMENT**
- 12: Excédent de fonctionnement
- **TOTAL DEPENSES D'ORDRE DE FONCTIONNEMENT**
- **TOTAL DEPENSES DE FONCTIONNEMENT (2)**

#### RECETTES (droite)
- 70: Impôts sur les revenus, bénéfices et gains
- 71: Impôts sur le patrimoine
- 72: Impôts sur les biens et services
- 74: Autres recettes fiscales
- 75: Contributions reçues des tiers
- 76: Produits financiers
- 77: Recettes non fiscales
- 110: Report à nouveau (excédent)
- **TOTAL RECETTES REELLES DE FONCTIONNEMENT**
- 774: Production immobilisée
- **TOTAL RECETTES D'ORDRE DE FONCTIONNEMENT**
- **TOTAL RECETTES DE FONCTIONNEMENT (1)**

#### ÉQUILIBRE
- **Ligne 20:** EXCEDENT DE FONCTIONNEMENT (1)-(2) | DEFICIT DE FONCTIONNEMENT (1)-(2)

### Section 2: INVESTISSEMENT (lignes 24-34)

#### DEPENSES (gauche)
- 16: Emprunts et dettes assimilées
- 20: Immobilisations incorporelles
- 21: Immobilisations corporelles
- 119: Report à nouveau (déficit)
- **TOTAL DEPENSES REELLES D'INVESTISSEMENT**
- 20: Immobilisations incorporelles
- 21: Immobilisations corporelles
- **TOTAL DEPENSES D'ORDRE D'INVESTISSEMENT**
- **TOTAL DEPENSES D'INVESTISSEMENT (4)**

#### RECETTES (droite)
- 10: Fonds, dotations et réserves
- 13: Subventions d'équipement
- 14: Cessions d'immobilisations
- 16: Emprunts et dettes assimilées
- 110: Report à nouveau (excédent)
- **TOTAL RECETTES REELLES D'INVESTISSEMENT**
- 1012: Dotation de l'État
- 1064: Excédent de fonctionnement capitalisé
- **TOTAL RECETTES D'ORDRE D'INVESTISSEMENT**
- **TOTAL RECETTES D'INVESTISSEMENT (3)**

#### ÉQUILIBRE
- **Ligne 34:** EXCEDENT D'INVESTISSEMENT (3)-(4) | DEFICIT D'INVESTISSEMENT (3)-(4)

### Particularité
- Format côte à côte pour visualiser l'équilibre budgétaire
- Agrégation des comptes au **niveau 1 uniquement** (2 chiffres)
- Calculs d'équilibre: Excédent ou Déficit par section

---

## 4. ÉLÉMENTS CALCULÉS AUTOMATIQUEMENT

### Formules identifiées

#### 1. PREVISIONS DEFINITIVES (1)
```
PREVISIONS DEFINITIVES = BUDGET PRIMITIF + BUDGET ADDITIONNEL + MODIFICATIONS +/-
```

#### 2. RESTE A RECOUVRER (Recettes)
```
RESTE A RECOUVRER = OR ADMIS (2) - RECOUVREMENT
```

#### 3. RESTE A PAYER (Dépenses)
```
RESTE A PAYER = MANDAT ADMIS (2) - PAIEMENT
```

#### 4. TAUX D'EXECUTION (2)/(1)
```
TAUX D'EXECUTION = (OR ADMIS ou MANDAT ADMIS) / PREVISIONS DEFINITIVES × 100
```

#### 5. TOTAUX par section
```
TOTAL RECETTES/DEPENSES REELLES = Σ (comptes réels hors comptes d'ordre)
TOTAL RECETTES/DEPENSES D'ORDRE = Σ (comptes d'ordre)
TOTAL SECTION = TOTAL REELLES + TOTAL D'ORDRE
```

#### 6. ÉQUILIBRE
```
EXCEDENT/DEFICIT FONCTIONNEMENT = TOTAL RECETTES FONCT. - TOTAL DEPENSES FONCT.
EXCEDENT/DEFICIT INVESTISSEMENT = TOTAL RECETTES INVEST. - TOTAL DEPENSES INVEST.
```

---

## 5. COMPARAISON AVEC LE SCHÉMA SQL

### Tables pertinentes dans le schéma

#### 1. `comptes_administratifs`
✓ Stocke l'en-tête du compte (commune, district, région, année)
✓ Gère le statut (brouillon, validé, publié, archivé)
✓ Relations avec les collectivités (commune_id, district_id, region_id)
✓ Constraint CHECK pour s'assurer qu'une seule collectivité est renseignée

#### 2. `rubriques_budgetaires`
✓ Catalogue complet des rubriques (codes et intitulés)
✓ **Hiérarchie avec `parent_id` et `niveau`** → Supporte les 3 niveaux
✓ Type (recette/dépense/équilibre) et section (fonctionnement/investissement/ordre/équilibre)
✓ Champ `est_calculee` pour identifier les rubriques automatiques
✓ Champ `formule_calcul` pour stocker les formules
✓ Champ `ordre` pour l'ordre d'affichage

#### 3. `categories_rubriques`
✓ Catégories de haut niveau pour regroupement
✓ Hiérarchie avec `parent_id`
✓ Type et section
✓ Ordre d'affichage

#### 4. `colonnes_dynamiques`
✓ Configuration des colonnes de données
✓ Types: montant, pourcentage, texte, date, nombre
✓ Colonnes calculées avec formules (`est_calculee`, `formule_calcul`)
✓ Ordre d'affichage
✓ **Déjà pré-remplie avec les colonnes standards** (INSERT dans le schema.sql)

**Colonnes pré-configurées:**
- compte
- budget_primitif
- budget_additionnel
- modifications
- previsions_definitives (calculée)
- engagement
- or_admis
- mandat_admis
- recouvrement
- paiement
- reste_recouvrer (calculée)
- reste_payer (calculée)
- taux_execution (calculée)

#### 5. `lignes_budgetaires`
✓ Stockage des données réelles
✓ Lien avec `compte_administratif_id` et `rubrique_id`
✓ **Valeurs stockées en JSONB flexible** (`valeurs`)
✓ Trigger `trigger_calculer_valeurs_derivees` pour calculer automatiquement les valeurs
✓ Index GIN sur `valeurs` pour performance
✓ UNIQUE constraint sur (compte_administratif_id, rubrique_id)

### Fonction de calcul automatique

Le schéma SQL inclut déjà un **trigger** `calculer_valeurs_derivees()` qui s'exécute automatiquement sur INSERT/UPDATE de `lignes_budgetaires` :

```sql
CREATE OR REPLACE FUNCTION calculer_valeurs_derivees()
RETURNS TRIGGER AS $$
BEGIN
    -- Calcule reste_recouvrer = or_admis - recouvrement
    IF colonnes.code = 'reste_recouvrer' THEN
        NEW.valeurs = jsonb_set(
            NEW.valeurs,
            ARRAY['reste_recouvrer'],
            to_jsonb(
                COALESCE((NEW.valeurs->>'or_admis')::NUMERIC, 0) -
                COALESCE((NEW.valeurs->>'recouvrement')::NUMERIC, 0)
            )
        );
    END IF;

    -- Calcule taux_execution
    IF colonnes.code = 'taux_execution' THEN
        IF COALESCE((NEW.valeurs->>'previsions_definitives')::NUMERIC, 0) != 0 THEN
            NEW.valeurs = jsonb_set(
                NEW.valeurs,
                ARRAY['taux_execution'],
                to_jsonb(
                    ROUND(
                        (COALESCE((NEW.valeurs->>'or_admis')::NUMERIC, 0) /
                        COALESCE((NEW.valeurs->>'previsions_definitives')::NUMERIC, 1)) * 100,
                        2
                    )
                )
            );
        END IF;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

---

## 6. COMPATIBILITÉ DU MODÈLE SQL AVEC LES TABLEAUX EXCEL

### ✓ POINTS COMPATIBLES

#### 1. HIÉRARCHIE DES RUBRIQUES
✓ Le schéma SQL supporte la hiérarchie à 3 niveaux via `parent_id` et `niveau`
✓ Codes de rubriques stockés dans le champ `code` (VARCHAR(50))
✓ Intitulés stockés dans le champ `intitule` (TEXT)
✓ Champ `ordre` pour maintenir l'ordre d'affichage

#### 2. COLONNES DYNAMIQUES
✓ **Toutes les colonnes Excel sont déjà configurées** dans `colonnes_dynamiques`
✓ Support des colonnes calculées (`est_calculee = TRUE`)
✓ Formules de calcul stockées dans `formule_calcul`
✓ Ordre d'affichage avec champ `ordre`

#### 3. SECTIONS ET TYPES
✓ Distinction recette/dépense via champ `type`
✓ Distinction fonctionnement/investissement/ordre/équilibre via champ `section`
✓ Type 'equilibre' disponible pour la feuille EQUILIBRE

#### 4. STOCKAGE DES DONNÉES
✓ Valeurs stockées en **JSONB flexible** dans `lignes_budgetaires.valeurs`
✓ Permet d'ajouter de nouvelles colonnes sans modifier le schéma
✓ Index GIN pour requêtes performantes sur JSON
✓ Format: `{"budget_primitif": 1000000, "recouvrement": 850000, ...}`

#### 5. CALCULS AUTOMATIQUES
✓ Trigger `calculer_valeurs_derivees()` implémenté
✓ Calcule `reste_recouvrer` et `taux_execution`
✓ Extensible pour d'autres formules

#### 6. TOTAUX ET SOUS-TOTAUX
✓ Peuvent être gérés comme des rubriques avec `est_calculee = TRUE`
✓ Formules de calcul peuvent référencer d'autres rubriques

#### 7. RELATIONS AVEC LES COLLECTIVITÉS
✓ Lien avec communes, districts, ou régions
✓ Constraint CHECK garantit qu'une seule collectivité est renseignée

---

## 7. ÉLÉMENTS MANQUANTS OU À CLARIFIER

### ⚠ POINTS À VÉRIFIER

#### 1. GESTION DES TOTAUX

**Question:** Les totaux sont-ils stockés en base ou calculés à la volée ?

**Recommandation:**
- **Option A (Recommandée):** Créer des rubriques spéciales pour les totaux avec `est_calculee = TRUE` et `formule_calcul`
- **Option B:** Calculer les totaux dynamiquement dans les requêtes SQL/vues

**Impact:** Choix architectural à faire. Option A permet de stocker les totaux historiques.

**Exemple Option A:**
```sql
INSERT INTO rubriques_budgetaires (code, intitule, type, section, est_calculee, formule_calcul, ordre)
VALUES ('TOTAL_RECETTE_FONCT', 'TOTAL RECETTES DE FONCTIONNEMENT', 'recette', 'fonctionnement', TRUE,
        'SUM(70,71,72,74,75,76,77)', 999);
```

#### 2. FEUILLE EQUILIBRE

**Question:** Est-ce une vue agrégée ou un tableau distinct à stocker ?

**État actuel:** Pas de table dédiée dans le schéma

**Recommandation:**
- Créer une **vue SQL** (`CREATE VIEW`) pour générer le tableau d'équilibre dynamiquement
- Agréger les données de `lignes_budgetaires` au niveau 1 (2 chiffres)
- Joindre DEPENSES et RECETTES côte à côte

**Impact:** Nécessite la création d'une vue SQL (voir section 8 pour exemple)

#### 3. COLONNES DIFFÉRENTES ENTRE RECETTES ET DÉPENSES

**Observation:**
- Recettes: OR ADMIS, RECOUVREMENT, RESTE A RECOUVRER
- Dépenses: ENGAGEMENT, MANDAT ADMIS, PAIEMENT, RESTE A PAYER

**État actuel:** `colonnes_dynamiques` contient les deux sets de colonnes

**Problème:** Pas de filtre pour savoir quelles colonnes afficher pour les recettes vs dépenses

**Recommandation:** Ajouter un champ `applicable_a` pour filtrer par type
```sql
ALTER TABLE colonnes_dynamiques ADD COLUMN applicable_a VARCHAR(50)[];
```

**Impact:** Modification mineure de la table `colonnes_dynamiques`

#### 4. VALIDATION DES FORMULES

**Question:** Les formules de calcul sont-elles toutes implémentées ?

**État actuel:**
- ✓ Trigger implémente `reste_recouvrer` et `taux_execution`
- ✗ Manquant: `previsions_definitives`, `reste_payer`

**Impact:** Compléter la fonction `calculer_valeurs_derivees()`

#### 5. IMPORT DES DONNÉES EXCEL

**Question:** Comment importer les tableaux Excel existants ?

**État actuel:** Pas de script d'import

**Recommandation:**
1. Créer un script Python pour parser les fichiers Excel
2. Mapper les codes de compte aux `rubriques_budgetaires`
3. Insérer dans `lignes_budgetaires` avec le format JSONB correct

**Impact:** Nécessite un script d'import (non présent actuellement)

#### 6. ORDRE D'AFFICHAGE

**Observation:** L'ordre des lignes dans Excel est crucial pour la lisibilité

**État actuel:** Champ `ordre` présent dans `rubriques_budgetaires`

**Recommandation:** S'assurer que l'ordre est correctement défini lors du remplissage des rubriques

**Impact:** Rigueur nécessaire lors du remplissage du champ `ordre`

---

## 8. RECOMMANDATIONS POUR AJUSTER LE MODÈLE SQL

### MODIFICATIONS PROPOSÉES

#### 1. AMÉLIORER `colonnes_dynamiques`

Ajouter un champ pour filtrer les colonnes applicables aux recettes ou dépenses :

```sql
ALTER TABLE colonnes_dynamiques
ADD COLUMN applicable_a VARCHAR(50)[] DEFAULT ARRAY['recette', 'depense'];

-- Mettre à jour les colonnes communes
UPDATE colonnes_dynamiques
SET applicable_a = ARRAY['recette', 'depense']
WHERE code IN ('compte', 'budget_primitif', 'budget_additionnel', 'modifications', 'previsions_definitives');

-- Colonnes spécifiques aux recettes
UPDATE colonnes_dynamiques
SET applicable_a = ARRAY['recette']
WHERE code IN ('or_admis', 'recouvrement', 'reste_recouvrer');

-- Colonnes spécifiques aux dépenses
UPDATE colonnes_dynamiques
SET applicable_a = ARRAY['depense']
WHERE code IN ('engagement', 'mandat_admis', 'paiement', 'reste_payer');
```

#### 2. COMPLÉTER LES FORMULES DE CALCUL

Mettre à jour les formules dans `colonnes_dynamiques` :

```sql
-- Formule pour previsions_definitives
UPDATE colonnes_dynamiques
SET formule_calcul = 'budget_primitif + budget_additionnel + modifications'
WHERE code = 'previsions_definitives';

-- Formule pour reste_payer
UPDATE colonnes_dynamiques
SET formule_calcul = 'mandat_admis - paiement'
WHERE code = 'reste_payer';

-- Formule pour reste_recouvrer
UPDATE colonnes_dynamiques
SET formule_calcul = 'or_admis - recouvrement'
WHERE code = 'reste_recouvrer';

-- Formule pour taux_execution
UPDATE colonnes_dynamiques
SET formule_calcul = '(or_admis / previsions_definitives) * 100'
WHERE code = 'taux_execution';
```

#### 3. AMÉLIORER LE TRIGGER `calculer_valeurs_derivees()`

Compléter le trigger pour calculer toutes les valeurs dérivées :

```sql
CREATE OR REPLACE FUNCTION calculer_valeurs_derivees()
RETURNS TRIGGER AS $$
DECLARE
    v_budget_primitif NUMERIC;
    v_budget_additionnel NUMERIC;
    v_modifications NUMERIC;
    v_previsions_definitives NUMERIC;
    v_or_admis NUMERIC;
    v_recouvrement NUMERIC;
    v_mandat_admis NUMERIC;
    v_paiement NUMERIC;
BEGIN
    -- Extraire les valeurs existantes
    v_budget_primitif := COALESCE((NEW.valeurs->>'budget_primitif')::NUMERIC, 0);
    v_budget_additionnel := COALESCE((NEW.valeurs->>'budget_additionnel')::NUMERIC, 0);
    v_modifications := COALESCE((NEW.valeurs->>'modifications')::NUMERIC, 0);
    v_or_admis := COALESCE((NEW.valeurs->>'or_admis')::NUMERIC, 0);
    v_recouvrement := COALESCE((NEW.valeurs->>'recouvrement')::NUMERIC, 0);
    v_mandat_admis := COALESCE((NEW.valeurs->>'mandat_admis')::NUMERIC, 0);
    v_paiement := COALESCE((NEW.valeurs->>'paiement')::NUMERIC, 0);

    -- 1. Calculer previsions_definitives
    v_previsions_definitives := v_budget_primitif + v_budget_additionnel + v_modifications;
    NEW.valeurs := jsonb_set(NEW.valeurs, ARRAY['previsions_definitives'], to_jsonb(v_previsions_definitives));

    -- 2. Calculer reste_recouvrer (pour recettes)
    IF v_or_admis > 0 THEN
        NEW.valeurs := jsonb_set(NEW.valeurs, ARRAY['reste_recouvrer'], to_jsonb(v_or_admis - v_recouvrement));
    END IF;

    -- 3. Calculer reste_payer (pour dépenses)
    IF v_mandat_admis > 0 THEN
        NEW.valeurs := jsonb_set(NEW.valeurs, ARRAY['reste_payer'], to_jsonb(v_mandat_admis - v_paiement));
    END IF;

    -- 4. Calculer taux_execution
    IF v_previsions_definitives != 0 THEN
        IF v_or_admis > 0 THEN
            -- Pour recettes
            NEW.valeurs := jsonb_set(NEW.valeurs, ARRAY['taux_execution'],
                to_jsonb(ROUND((v_or_admis / v_previsions_definitives) * 100, 2)));
        ELSIF v_mandat_admis > 0 THEN
            -- Pour dépenses
            NEW.valeurs := jsonb_set(NEW.valeurs, ARRAY['taux_execution'],
                to_jsonb(ROUND((v_mandat_admis / v_previsions_definitives) * 100, 2)));
        END IF;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

#### 4. CRÉER UNE VUE POUR LE TABLEAU D'ÉQUILIBRE

Vue SQL pour générer automatiquement le tableau d'équilibre :

```sql
CREATE OR REPLACE VIEW v_equilibre_compte_administratif AS
WITH
-- Agréger les dépenses de fonctionnement au niveau 1
depenses_fonct AS (
    SELECT
        ca.id as compte_administratif_id,
        SUBSTRING(rb.code, 1, 2) as compte_niveau1,
        MAX(rb.intitule) as intitule,
        SUM(COALESCE((lb.valeurs->>'mandat_admis')::NUMERIC, 0)) as mandat_admis,
        SUM(COALESCE((lb.valeurs->>'paiement')::NUMERIC, 0)) as paiement,
        SUM(COALESCE((lb.valeurs->>'reste_payer')::NUMERIC, 0)) as reste_payer
    FROM comptes_administratifs ca
    JOIN lignes_budgetaires lb ON ca.id = lb.compte_administratif_id
    JOIN rubriques_budgetaires rb ON lb.rubrique_id = rb.id
    WHERE rb.type = 'depense' AND rb.section = 'fonctionnement'
    GROUP BY ca.id, SUBSTRING(rb.code, 1, 2)
),
-- Agréger les recettes de fonctionnement au niveau 1
recettes_fonct AS (
    SELECT
        ca.id as compte_administratif_id,
        SUBSTRING(rb.code, 1, 2) as compte_niveau1,
        MAX(rb.intitule) as intitule,
        SUM(COALESCE((lb.valeurs->>'or_admis')::NUMERIC, 0)) as or_admis,
        SUM(COALESCE((lb.valeurs->>'recouvrement')::NUMERIC, 0)) as recouvrement,
        SUM(COALESCE((lb.valeurs->>'reste_recouvrer')::NUMERIC, 0)) as reste_recouvrer
    FROM comptes_administratifs ca
    JOIN lignes_budgetaires lb ON ca.id = lb.compte_administratif_id
    JOIN rubriques_budgetaires rb ON lb.rubrique_id = rb.id
    WHERE rb.type = 'recette' AND rb.section = 'fonctionnement'
    GROUP BY ca.id, SUBSTRING(rb.code, 1, 2)
)
SELECT
    ca.id as compte_administratif_id,
    ca.annee,
    -- DEPENSES
    df.compte_niveau1 as depense_compte,
    df.intitule as depense_intitule,
    df.mandat_admis as depense_mandat_admis,
    df.paiement as depense_paiement,
    df.reste_payer as depense_reste_payer,
    -- RECETTES
    rf.compte_niveau1 as recette_compte,
    rf.intitule as recette_intitule,
    rf.or_admis as recette_or_admis,
    rf.recouvrement as recette_recouvrement,
    rf.reste_recouvrer as recette_reste_recouvrer
FROM comptes_administratifs ca
LEFT JOIN depenses_fonct df ON ca.id = df.compte_administratif_id
LEFT JOIN recettes_fonct rf ON ca.id = rf.compte_administratif_id
ORDER BY ca.annee, df.compte_niveau1, rf.compte_niveau1;
```

#### 5. AJOUTER DES CHAMPS POUR IDENTIFIER LES TOTAUX

Faciliter la gestion des totaux et sous-totaux :

```sql
ALTER TABLE rubriques_budgetaires
ADD COLUMN est_total BOOLEAN DEFAULT FALSE,
ADD COLUMN rubriques_sources UUID[];

COMMENT ON COLUMN rubriques_budgetaires.est_total IS 'Indique si cette rubrique est un total/sous-total calculé';
COMMENT ON COLUMN rubriques_budgetaires.rubriques_sources IS 'Liste des IDs de rubriques à sommer pour calculer ce total';
```

**Exemple d'utilisation:**

```sql
-- Créer une rubrique pour "TOTAL RECETTES DE FONCTIONNEMENT"
INSERT INTO rubriques_budgetaires (
    code, intitule, type, section, est_calculee, est_total, niveau, ordre
) VALUES (
    'TOTAL_RECETTE_FONCT',
    'TOTAL RECETTES DE FONCTIONNEMENT',
    'recette',
    'fonctionnement',
    TRUE,
    TRUE,
    1,
    999
) RETURNING id;

-- Puis mettre à jour rubriques_sources avec les IDs des rubriques 70-77
UPDATE rubriques_budgetaires
SET rubriques_sources = ARRAY[
    (SELECT id FROM rubriques_budgetaires WHERE code = '70'),
    (SELECT id FROM rubriques_budgetaires WHERE code = '71'),
    (SELECT id FROM rubriques_budgetaires WHERE code = '72'),
    (SELECT id FROM rubriques_budgetaires WHERE code = '74'),
    (SELECT id FROM rubriques_budgetaires WHERE code = '75'),
    (SELECT id FROM rubriques_budgetaires WHERE code = '76'),
    (SELECT id FROM rubriques_budgetaires WHERE code = '77')
]
WHERE code = 'TOTAL_RECETTE_FONCT';
```

#### 6. CRÉER DES FONCTIONS UTILITAIRES

Fonction pour calculer dynamiquement un total :

```sql
CREATE OR REPLACE FUNCTION calculer_total_rubrique(
    p_compte_administratif_id UUID,
    p_rubrique_total_id UUID,
    p_colonne VARCHAR
) RETURNS NUMERIC AS $$
DECLARE
    v_total NUMERIC := 0;
    v_rubrique_source UUID;
    v_rubriques_sources UUID[];
BEGIN
    -- Récupérer la liste des rubriques sources
    SELECT rubriques_sources INTO v_rubriques_sources
    FROM rubriques_budgetaires
    WHERE id = p_rubrique_total_id;

    -- Sommer les valeurs de chaque rubrique source
    IF v_rubriques_sources IS NOT NULL THEN
        FOR v_rubrique_source IN SELECT unnest(v_rubriques_sources)
        LOOP
            SELECT COALESCE((valeurs->>p_colonne)::NUMERIC, 0) INTO v_total
            FROM lignes_budgetaires
            WHERE compte_administratif_id = p_compte_administratif_id
            AND rubrique_id = v_rubrique_source;
        END LOOP;
    END IF;

    RETURN v_total;
END;
$$ LANGUAGE plpgsql;
```

**Utilisation:**
```sql
-- Calculer le total des recettes de fonctionnement pour un compte administratif donné
SELECT calculer_total_rubrique(
    '123e4567-e89b-12d3-a456-426614174000', -- compte_administratif_id
    (SELECT id FROM rubriques_budgetaires WHERE code = 'TOTAL_RECETTE_FONCT'), -- rubrique_total_id
    'or_admis' -- colonne à sommer
);
```

#### 7. PRÉ-REMPLIR `rubriques_budgetaires`

**Méthode recommandée:**

1. Créer un script Python pour parser le fichier Excel
2. Extraire toutes les rubriques avec codes, intitulés, hiérarchie
3. Générer un fichier SQL d'insertion
4. Exécuter l'import

**Script Python (exemple):**

```python
import pandas as pd

excel_file = 'Tableaux_de_Compte_Administratif.xlsx'

# Lire RECETTE
df_recette = pd.read_excel(excel_file, sheet_name='RECETTE', header=None)
header_row = 6

rubriques = []
for idx in range(header_row + 1, len(df_recette)):
    row = df_recette.iloc[idx]
    code_n1 = row[1]
    code_n2 = row[2]
    code_n3 = row[3]
    intitule = row[4]

    if pd.notna(code_n3):
        # Niveau 3
        rubriques.append({
            'code': str(int(code_n3)),
            'intitule': intitule,
            'niveau': 3,
            'parent_code': str(int(code_n2)),
            'type': 'recette'
        })
    elif pd.notna(code_n2):
        # Niveau 2
        rubriques.append({
            'code': str(int(code_n2)),
            'intitule': intitule,
            'niveau': 2,
            'parent_code': str(int(code_n1)),
            'type': 'recette'
        })
    elif pd.notna(code_n1):
        # Niveau 1
        rubriques.append({
            'code': str(int(code_n1)),
            'intitule': intitule,
            'niveau': 1,
            'parent_code': None,
            'type': 'recette'
        })

# Générer SQL
print("-- Import des rubriques de recettes")
for i, r in enumerate(rubriques):
    parent_clause = f"(SELECT id FROM rubriques_budgetaires WHERE code = '{r['parent_code']}')" if r['parent_code'] else 'NULL'
    print(f"""
INSERT INTO rubriques_budgetaires (code, intitule, type, section, niveau, parent_id, ordre)
VALUES ('{r['code']}', '{r['intitule'].replace("'", "''")}', '{r['type']}', 'fonctionnement', {r['niveau']}, {parent_clause}, {i});
""")
```

---

## 9. PLAN D'ACTION PROPOSÉ

### ÉTAPES RECOMMANDÉES

#### □ Phase 1: Ajustements du schéma (1-2 jours)
1. ✓ Ajouter le champ `applicable_a` à `colonnes_dynamiques`
2. ✓ Ajouter les champs `est_total` et `rubriques_sources` à `rubriques_budgetaires`
3. ✓ Mettre à jour les formules de calcul dans `colonnes_dynamiques`
4. ✓ Améliorer le trigger `calculer_valeurs_derivees()`

#### □ Phase 2: Import des rubriques (2-3 jours)
5. ✓ Créer un script Python pour parser le fichier Excel
6. ✓ Extraire toutes les rubriques avec codes, intitulés, hiérarchie
7. ✓ Générer un fichier SQL d'insertion pour `rubriques_budgetaires`
8. ✓ Exécuter l'import et vérifier la cohérence

#### □ Phase 3: Vues et fonctions (1-2 jours)
9. ✓ Créer la vue `v_equilibre_compte_administratif`
10. ✓ Créer les fonctions de calcul de totaux
11. ✓ Tester les requêtes de génération des tableaux

#### □ Phase 4: Interface de saisie (3-5 jours)
12. ✓ Développer l'interface Nuxt pour saisir les données
13. ✓ Implémenter la validation côté client
14. ✓ Tester l'insertion dans `lignes_budgetaires`

#### □ Phase 5: Génération des tableaux Excel (2-3 jours)
15. ✓ Créer une fonction pour exporter en Excel
16. ✓ Reproduire exactement le format des tableaux
17. ✓ Valider avec des données de test

#### □ Phase 6: Import de données existantes (optionnel, 2-3 jours)
18. ✓ Script pour importer des Excel existants
19. ✓ Validation et correction des données
20. ✓ Migration vers la base de données

---

## 10. CONCLUSION

### VERDICT: ✓ Le modèle SQL actuel est **COMPATIBLE** avec les tableaux Excel

Le schéma SQL est **bien conçu** et peut reproduire **EXACTEMENT** les tableaux Excel, avec quelques ajustements mineurs recommandés pour :

1. ✓ Améliorer la flexibilité des colonnes (champ `applicable_a`)
2. ✓ Faciliter la gestion des totaux (champs `est_total` et `rubriques_sources`)
3. ✓ Compléter les formules de calcul automatique
4. ✓ Créer des vues pour le tableau d'équilibre
5. ✓ Pré-remplir le catalogue des rubriques budgétaires

### FORCES DU MODÈLE ACTUEL

✓ **Architecture flexible** avec JSONB pour les valeurs
✓ **Hiérarchie complète** des rubriques avec `parent_id` et `niveau`
✓ **Colonnes dynamiques** configurables
✓ **Triggers** pour calculs automatiques
✓ **Bon support** des sections et types
✓ **Indexation** pour performance (GIN sur JSONB)
✓ **Contraintes** pour garantir l'intégrité

### POINTS D'ATTENTION

⚠ Nécessite le **pré-remplissage complet** de `rubriques_budgetaires`
⚠ Les **totaux** doivent être gérés explicitement
⚠ L'**ordre d'affichage** doit être maintenu rigoureusement
⚠ **Import Excel** nécessite un script dédié
⚠ **Vue pour EQUILIBRE** à créer

### LE DÉVELOPPEMENT PEUT CONTINUER AVEC CONFIANCE SUR CE SCHÉMA ! 🎉

---

## ANNEXES

### A. Statistiques des feuilles

| Feuille | Lignes | Colonnes | Lignes de données | Lignes de totaux |
|---------|--------|----------|-------------------|------------------|
| RECETTE | 182 | 13 | ~168 | 5 |
| DEPENSES | 289 | 14 | ~273 | 6 |
| EQUILIBRE | 35 | 11 | ~20 | 4 |

### B. Exemples de codes de compte

#### RECETTES
- **70-77:** Recettes de fonctionnement
- **10, 13, 14, 16:** Recettes d'investissement

#### DÉPENSES
- **60-67:** Dépenses de fonctionnement
- **16, 20, 21:** Dépenses d'investissement

### C. Mapping colonnes Excel → colonnes_dynamiques

| Colonne Excel | Code dans DB | Calculé | Applicable à |
|---------------|--------------|---------|--------------|
| BUDGET PRIMITIF | budget_primitif | Non | Recette, Dépense |
| BUDGET ADDITIONNEL | budget_additionnel | Non | Recette, Dépense |
| MODIFICATIONS +/- | modifications | Non | Recette, Dépense |
| PREVISIONS DEFINITIVES (1) | previsions_definitives | **OUI** | Recette, Dépense |
| OR ADMIS (2) | or_admis | Non | **Recette** |
| RECOUVREMENT | recouvrement | Non | **Recette** |
| RESTE A RECOUVRER | reste_recouvrer | **OUI** | **Recette** |
| ENGAGEMENT | engagement | Non | **Dépense** |
| MANDAT ADMIS (2) | mandat_admis | Non | **Dépense** |
| PAIEMENT | paiement | Non | **Dépense** |
| RESTE A PAYER | reste_payer | **OUI** | **Dépense** |
| TAUX D'EXECUTION (2)/(1) | taux_execution | **OUI** | Recette, Dépense |

---

**Fin du rapport**
