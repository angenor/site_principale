# Rapport Comparatif - Feuille EQUILIBRE

Analyse comparative entre le fichier objectif et le fichier généré pour la feuille EQUILIBRE du Compte Administratif.

---

## 1. FICHIER OBJECTIF - Structure et Organisation

### Informations Générales
- **Chemin**: `/Users/angenor/Documents/projets/2025/TI/collectivites_territoriales/bank/cahier_des_charges/Tableaux_de_Compte_Administratif.xlsx`
- **Titre**: "TABLEAU D'EQUILIBRE DU COMPTE ADMINISTRATIF"
- **Dimensions**: 11 colonnes (A à K) × 36 lignes
- **Plage active**: B2:K36

### Architecture Globale

Le fichier objectif présente une structure classique de Compte Administratif avec:
- **Présentation bilatérale** : Côté gauche = DÉPENSES, Côté droit = RECETTES
- **Deux sections distinctes** : FONCTIONNEMENT (lignes 6-21) et INVESTISSEMENT (lignes 23-35)
- **Format détaillé** : Numéros de compte + Libellés + 3 colonnes de montants (Mandat Admis, Paiement, Reste à Payer)

### Structure de Colonnes

| Colonne | Largeur | Rôle | Contenu |
|---------|---------|------|---------|
| A | 11.55 | Espacement | Vide |
| B | 8.55 | Numéro de compte (Dépenses) | Codes comptables (60, 61, 62, ..., 119) |
| C | 44.44 | Libellé (Dépenses) | Intitulés détaillés |
| D | 16.33 | Mandat Admis (Dépenses) | Montants (vides dans le template) |
| E | 13.55 | Paiement (Dépenses) | Montants (vides dans le template) |
| F | 14.11 | Reste à Payer (Dépenses) | Montants (vides dans le template) |
| G | 8.55 | Numéro de compte (Recettes) | Codes comptables (70, 71, 72, ..., 110) |
| H | 44.44 | Libellé (Recettes) | Intitulés détaillés |
| I | 18.44 | Mandat Admis (Recettes) | Montants (vides dans le template) |
| J | 17.33 | Paiement (Recettes) | Montants (vides dans le template) |
| K | 17.66 | Reste à Payer (Recettes) | Montants (vides dans le template) |

### Section FONCTIONNEMENT (Lignes 6-21)

#### En-têtes (Lignes 6-7)
```
Ligne 6: [VIDE] | DEPENSES | [VIDES] | RECETTES
Ligne 7: [VIDE] | COMPTE | INTITULES | MANDAT ADMIS | PAIEMENT | RESTE A PAYER | COMPTE | INTITULES | MANDAT ADMIS | PAIEMENT | RESTE A PAYER
```

#### Rubriques Dépenses (Lignes 8-16)
| Compte | Libellé |
|--------|---------|
| 60 | CHARGES DE PERSONNEL |
| 61 | ACHATS DE BIENS |
| 62 | ACHATS DE SERVICES ET CHARGES PERMANENTES |
| 63 | DEPENSES D'INTERVENTION |
| 64 | IMPOTS ET TAXES |
| 65 | TRANSFERTS ET SUBVENTIONS |
| 66 | CHARGES FINANCIERES |
| 67 | CHARGES DIVERSES |
| 119 | REPORT A NOUVEAU (DEFICIT) |

#### Rubriques Recettes (Lignes 8-16)
| Compte | Libellé |
|--------|---------|
| 70 | IMPOTS SUR LES REVENUS, BENEFICES ET GAINS |
| 71 | IMPOTS SUR LE PATRIMOINE |
| 72 | IMPOTS SUR LES BIENS ET SERVICES |
| 74 | AUTRES RECETTES FISCALES |
| 75 | CONTRIBUTIONS RECUES DES TIERS |
| 76 | PRODUITS FINANCIERS |
| 77 | RECETTES NON FISCALES |
| 110 | REPORT A NOUVEAU (EXCEDENT) |

#### Totaux et Soldes (Lignes 17-21)
- **Ligne 17**: TOTAL DEPENSES REELLES DE FONCTIONNEMENT (Dépenses) | TOTAL DEPENSES REELLES DE FONCTIONNEMENT (Recettes - intitulé incohérent)
- **Ligne 18**: Compte 12 EXCEDENT DE FONCTIONNEMENT | Compte 774 PRODUCTION IMMOBILISEE
- **Ligne 19**: TOTAL DEPENSES D'ORDRE DE FONCTIONNEMENT | TOTAL DEPENSES D'ORDRE DE FONCTIONNEMENT (incohérent - devrait être RECETTES)
- **Ligne 20**: TOTAL DEPENSES DE FONCTIONNEMENT (2) | TOTAL RECETTES DE FONCTIONNEMENT (1)
- **Ligne 21**: EXCEDENT DE FONCTIONNEMENT (1) - (2) | DEFICIT DE FONCTIONNEMENT (1) - (2)

### Section INVESTISSEMENT (Lignes 23-35)

#### En-têtes (Lignes 23-24)
```
Ligne 23: SECTION INVESTISSEMENT | [VIDES] | SECTION INVESTISSEMENT
Ligne 24: COMPTE | INTITULE | MANDAT ADMIS | PAIEMENT | RESTE A PAYER | COMPTE | INTITULE | MANDAT ADMIS | PAIEMENT | RESTE A PAYER
```

#### Rubriques Dépenses (Lignes 25-32)
| Compte | Libellé |
|--------|---------|
| 16 | EMPRUNTS ET DETTES ASSIMILEES |
| 20 | IMMOBILISATION INCORPORELLES |
| 21 | IMMOBILISATION CORPORELLES |
| [vide] | [vide] |
| 119 | REPORT A NOUVEAU (DEFICIT) |
| 20 | IMMOBILISATION INCORPORELLES |
| 21 | IMMOBILISATION CORPORELLES |

#### Rubriques Recettes (Lignes 25-32)
| Compte | Libellé |
|--------|---------|
| 10 | FONDS, DOTATIONS ET RESERVES |
| 13 | SUBVENTIONS D'EQUIPEMENT |
| 14 | CESSIONS D'IMMOBILISATIONS |
| 16 | EMPRUNTS ET DETTES ASSIMILEES |
| 110 | REPORT A NOUVEAU (EXCEDENT) |
| 1012 | DOTATION DE L'ETAT |
| 1064 | EXCEDENT DE FONCTIONNEMENT CAPITALISE |

#### Totaux et Soldes (Lignes 30-35)
- **Ligne 30**: TOTAL DEPENSES REELLES D'INVESTISSEMENT | TOTAL DEPENSES REELLES D'INVESTISSEMENT (incohérent)
- **Ligne 33**: TOTAL DEPENSES D'ORDRE D'INVESTISSEMENT | TOTAL DEPENSES D'ORDRE D'INVESTISSEMENT (incohérent)
- **Ligne 34**: TOTAL DEPENSES D'INVESTISSEMENT (4) | TOTAL RECETTES D'INVESTISSEMENT (3)
- **Ligne 35**: EXCEDENT D'INVESTISSEMENT (3) - (4) | DEFICIT D'INVESTISSEMENT (3) - (4)

### Format des Données
- **Format des montants**: Aucun (template vide)
- **Formules**: AUCUNE détectée dans le template
- **Valeurs**: Toutes les cellules de données sont vides (c'est un template)
- **Format numérique**: Pas défini dans le template

---

## 2. FICHIER GÉNÉRÉ - Structure et Organisation

### Informations Générales
- **Chemin**: `/Users/angenor/Documents/projets/2025/TI/collectivites_territoriales/bank/cahier_des_charges/CA_COM-TEST_2024_NEW.xlsx`
- **Titre**: "TABLEAU D'ÉQUILIBRE BUDGÉTAIRE"
- **Dimensions**: 8 colonnes (A à H) × 16 lignes
- **Plage active**: B2:H16

### Architecture Globale

Le fichier généré utilise une structure **simplifiée et moderne** avec:
- **Présentation simplifiée** : Format vertical avec sections distinctes
- **Deux sections distinctes** : FONCTIONNEMENT (lignes 7-10) et INVESTISSEMENT (lignes 13-16)
- **Format résumé** : Uniquement Totaux Recettes / Totaux Dépenses / Solde
- **Beaucoup moins de détail** : Pas de rubriques comptables, pas de "Reste à Payer"

### Structure de Colonnes

| Colonne | Largeur | Rôle | Contenu |
|---------|---------|------|---------|
| A | 13.0 | Vide | Espacement |
| B | 5.0 | Très étroit | Espacement/alignement |
| C | 30.0 | Libellé | Textes descriptifs (sections, totaux, soldes) |
| D | 20.0 | Montant | Valeurs numériques |
| E | 13.0 | Vide | Non utilisé |
| F | 13.0 | Vide | Non utilisé |
| G | 13.0 | Vide | Non utilisé |
| H | 13.0 | Vide | Non utilisé |

### Contenu Minimal (Lignes 7-16)

#### Section Fonctionnement (Lignes 7-10)
```
Ligne 7:  SECTION FONCTIONNEMENT
Ligne 8:  Total Recettes              | 49900000
Ligne 9:  Total Dépenses              | 49700000
Ligne 10: SOLDE FONCTIONNEMENT        | 200000
```

#### Section Investissement (Lignes 13-16)
```
Ligne 13: SECTION INVESTISSEMENT
Ligne 14: Total Recettes              | [VIDE]
Ligne 15: Total Dépenses              | [VIDE]
Ligne 16: SOLDE INVESTISSEMENT        | [VIDE]
```

### Format des Données
- **Format des montants**: Nombres entiers simples (49900000)
- **Formules**: Aucune détectée
- **Valeurs**: Présentées en colonne D uniquement
- **Données manquantes**: Section Investissement vide

---

## 3. COMPARAISON DÉTAILLÉE

### Différences Structurelles Principales

| Aspect | Fichier Objectif | Fichier Généré | Différence |
|--------|------------------|-----------------|-----------|
| **Titre** | "TABLEAU D'EQUILIBRE DU COMPTE ADMINISTRATIF" | "TABLEAU D'ÉQUILIBRE BUDGÉTAIRE" | Terminologie différente (Compte Admin vs Budget) |
| **Présentation** | Bilatérale (Dépenses gauche, Recettes droite) | Verticale (sections séquentielles) | Orientation complètement différente |
| **Colonnes** | 11 colonnes (A-K) | 8 colonnes (A-H) | 3 colonnes de moins, structure aplatie |
| **Lignes** | 36 lignes | 16 lignes | 20 lignes de moins, beaucoup moins de détail |
| **Détail Dépenses** | 9 rubriques détaillées par compte | 1 ligne "Total Dépenses" | Complètement agrégé |
| **Détail Recettes** | 8 rubriques détaillées par compte | 1 ligne "Total Recettes" | Complètement agrégé |
| **Colonnes Montants** | 3 colonnes : Mandat Admis, Paiement, Reste à Payer | 1 colonne : Montant unique | Moins de granularité |
| **Section Fonctionnement** | 16 lignes (en-têtes + 9 rubriques dépenses + 8 rubriques recettes + totaux) | 4 lignes (titre + 3 lignes de synthèse) | 12 lignes de moins |
| **Section Investissement** | 13 lignes (en-têtes + rubriques + totaux) | 4 lignes (titre + 3 lignes de synthèse) | 9 lignes de moins |

### Détails Manquants dans le Fichier Généré

Le fichier généré **omet complètement**:

1. **Rubriques comptables détaillées**:
   - Charges de Personnel, Achats de biens, Services
   - Impôts et taxes
   - Transferts et subventions
   - Charges financières
   - Toutes les sources de recettes spécifiques

2. **Numéros de compte**: Aucun numéro (60, 61, 70, 71, etc.) présent

3. **Trois colonnes de montants**: Pas de distinction entre:
   - Mandats admis vs Paiements vs Reste à payer

4. **Ligne de titre collectivité**: Présente en ligne 4 du fichier objectif, partiellement en ligne 4 du fichier généré

5. **Rubriques "d'ordre"** (Excédent de fonctionnement capitalisé, etc.)

6. **Comptes d'ajustement**: 119 (Report à nouveau déficit), 110 (Excédent)

### Données Présentes dans le Fichier Généré

Le fichier généré contient uniquement:
- **Section Fonctionnement**:
  - Total Recettes: 49 900 000
  - Total Dépenses: 49 700 000
  - Solde: 200 000 (Excédent)

- **Section Investissement**: Toutes cellules vides

---

## 4. ANALYSE DES LIBELLÉS ET FORMULATIONS

### Incohérences dans le Fichier Objectif

Plusieurs incohérences détectées dans les libellés du fichier objectif:

**Ligne 17**:
- Côté Dépenses: "TOTAL DEPENSES REELLES DE FONCTIONNEMENT" ✓
- Côté Recettes: "TOTAL DEPENSES REELLES DE FONCTIONNEMENT" ✗ (devrait être TOTAL RECETTES REELLES)

**Ligne 19**:
- Côté Dépenses: "TOTAL DEPENSES D'ORDRE DE FONCTIONNEMENT" ✓
- Côté Recettes: "TOTAL DEPENSES D'ORDRE DE FONCTIONNEMENT" ✗ (devrait être TOTAL RECETTES D'ORDRE)

**Ligne 30 (Investissement)**:
- Côté Dépenses: "TOTAL DEPENSES REELLES D'INVESTISSEMENT" ✓
- Côté Recettes: "TOTAL DEPENSES REELLES D'INVESTISSEMENT" ✗

**Ligne 33 (Investissement)**:
- Côté Dépenses: "TOTAL DEPENSES D'ORDRE D'INVESTISSEMENT" ✓
- Côté Recettes: "TOTAL DEPENSES D'ORDRE D'INVESTISSEMENT" ✗

### Différences de Terminologie

- **Objectif**: "TABLEAU D'EQUILIBRE DU COMPTE ADMINISTRATIF"
- **Généré**: "TABLEAU D'ÉQUILIBRE BUDGÉTAIRE"

Ces termes font référence à des concepts légèrement différents:
- Compte Administratif = Document de synthèse annuelle des dépenses/recettes réelles (après exécution)
- Équilibre budgétaire = Équilibre entre recettes et dépenses

---

## 5. RECOMMANDATIONS DE REFONDATION

Pour refondre le fichier généré selon le format attendu:

### Option 1 : Adaptation Complète au Format Objectif (Recommandé)

Restructurer le fichier généré pour correspondre **exactement** à la structure du fichier objectif:

1. **Augmenter à 11 colonnes** (A à K)
2. **Étendre à 36+ lignes** pour accueillir toutes les rubriques
3. **Mettre en place la présentation bilatérale**:
   - Colonnes A-F pour DÉPENSES
   - Colonnes G-K pour RECETTES
4. **Ajouter toutes les rubriques comptables** détaillées (60-67 pour dépenses, 70-77 pour recettes)
5. **Créer 3 colonnes de montants**: Mandat Admis, Paiement, Reste à Payer
6. **Remplir avec les données réelles** si disponibles
7. **Corriger les libellés incohérents** du fichier objectif (particulièrement lignes 17, 19, 30, 33)

### Option 2 : Enrichissement Progressif

Si l'objectif est de garder un format plus léger:

1. **Conserver 2-3 sections maximum** au lieu de 36 lignes
2. **Ajouter les numéros de compte** (au moins les principaux: 6X pour dépenses, 7X pour recettes)
3. **Structurer en 3 colonnes de montants** pour chaque section
4. **Adapter à 8 colonnes** (structure actuelle) en réorganisant verticalement

### Étapes Prioritaires

1. **Corriger les incohérences de libellés** du fichier objectif
2. **Déterminer quelle version de détail est souhaitée**:
   - Version complète (36 lignes détaillées) ou
   - Version synthétique (16 lignes agrégées)
3. **Implémenter les formules de calcul** pour les totaux et soldes
4. **Formater les montants** avec le bon format numérique (séparateurs, décimales)
5. **Ajouter la mise en forme visuelle**: Bordures, couleurs de fond, police

---

## 6. STRUCTURE PROPOSÉE MINIMALE

Si vous souhaitez garder la structure actuelle mais la compléter:

### Fichier à Générer Minimal Amélioré (24 lignes)

```
Ligne  2: TABLEAU D'EQUILIBRE DU COMPTE ADMINISTRATIF
Ligne  4: COLLECTIVITE : Commune Test (COM-TEST) - ANNÉE 2024
Ligne  6: SECTION FONCTIONNEMENT
Ligne  7: En-têtes colonnes
Ligne  8-15: Rubriques principales (60, 61, 62, 63, 64, 65, 66, 70, 71, 72, 74, 75, 76, 77)
Ligne 16: TOTAL RECETTES REELLES DE FONCTIONNEMENT | TOTAL DEPENSES REELLES DE FONCTIONNEMENT
Ligne 17: SOLDE FONCTIONNEMENT
Ligne 19: SECTION INVESTISSEMENT
Ligne 20: En-têtes colonnes
Ligne 21-23: Rubriques investissement principales (20, 21, 10, 13, 14)
Ligne 24: TOTAL RECETTES D'INVESTISSEMENT | TOTAL DEPENSES D'INVESTISSEMENT
Ligne 25: SOLDE INVESTISSEMENT
```

---

## Conclusion

Le fichier généré utilise un format **drastiquement simplifié** par rapport au fichier objectif. Les deux approches répondent à des besoins différents:

- **Fichier Objectif**: Format officiel de Compte Administratif avec tous les détails comptables
- **Fichier Généré**: Format de synthèse budgétaire pour vue d'ensemble rapide

Pour les rapprocher, il faudrait choisir une cible claire et restructurer en conséquence. La recommandation est d'**adopter le format complet du fichier objectif** pour garantir la conformité réglementaire.
