# Spécifications Techniques de Refondation - Feuille EQUILIBRE

## Document de Reference pour la Restructuration

Ce document fournit les spécifications techniques détaillées pour refondre la feuille EQUILIBRE du fichier généré afin qu'elle corresponde au format du fichier objectif.

---

## 1. STRUCTURE EXCEL CIBLE

### 1.1 Configuration Générale

```
Fichier: CA_COM-TEST_2024_NEW.xlsx
Feuille: EQUILIBRE
Dimensions cibles: 11 colonnes (A à K) × 36+ lignes
Plage active: B2:K36 (minimum)
```

### 1.2 Configuration des Colonnes

| Colonne | Largeur (Excel) | Rôle | Type | Alignement |
|---------|-----------------|------|------|-----------|
| A | 11.55 | Espacement | Texte | - |
| B | 8.55 | Numéro compte (Dépenses) | Texte/Nombre | Centre |
| C | 44.44 | Libellé (Dépenses) | Texte | Gauche |
| D | 16.33 | Mandat Admis | Nombre | Droite |
| E | 13.55 | Paiement | Nombre | Droite |
| F | 14.11 | Reste à Payer | Nombre | Droite |
| G | 8.55 | Numéro compte (Recettes) | Texte/Nombre | Centre |
| H | 44.44 | Libellé (Recettes) | Texte | Gauche |
| I | 18.44 | Mandat Admis | Nombre | Droite |
| J | 17.33 | Paiement | Nombre | Droite |
| K | 17.66 | Reste à Payer | Nombre | Droite |

### 1.3 Hauteurs de Lignes Recommandées

- **Ligne 2** (Titre): 30 pixels
- **Lignes 6-7** (En-têtes sections): 25 pixels
- **Lignes 8-16** (Rubriques): 20 pixels
- **Lignes 17-21** (Totaux/Soldes): 22 pixels
- **Ligne 23** (Section investissement): 25 pixels
- **Autres**: 20 pixels (défaut)

---

## 2. CONTENU DÉTAILLÉ REQUIS

### 2.1 En-tête et Métadonnées

```
Ligne 2:  [Colonne B-K, fusionné] = "TABLEAU D'EQUILIBRE DU COMPTE ADMINISTRATIF"
Ligne 4:  [Colonne C onwards]     = "COLLECTIVITE : [Nom] - ANNÉE [Année]"
```

Exemple pour COM-TEST 2024:
```
COLLECTIVITE : Commune Test (COM-TEST) - ANNÉE 2024
```

### 2.2 Section FONCTIONNEMENT

#### Ligne 6: En-têtes des sections
```
Colonne C: "DEPENSES"
Colonne H: "RECETTES"
```

#### Ligne 7: En-têtes des colonnes
```
Colonne B: "COMPTE"
Colonne C: "INTITULES"
Colonne D: "MANDAT ADMIS"
Colonne E: "PAIEMENT"
Colonne F: "RESTE A PAYER"
Colonne G: "COMPTE"
Colonne H: "INTITULES"
Colonne I: "MANDAT ADMIS"
Colonne J: "PAIEMENT"
Colonne K: "RESTE A PAYER"
```

#### Lignes 8-16: Rubriques Détaillées

**DÉPENSES (Colonnes B-F)**:

| Ligne | Compte | Libellé |
|-------|--------|---------|
| 8 | 60 | CHARGES DE PERSONNEL |
| 9 | 61 | ACHATS DE BIENS |
| 10 | 62 | ACHATS DE SERVICES ET CHARGES PERMANENTES |
| 11 | 63 | DEPENSES D'INTERVENTION |
| 12 | 64 | IMPOTS ET TAXES |
| 13 | 65 | TRANSFERTS ET SUBVENTIONS |
| 14 | 66 | CHARGES FINANCIERES |
| 15 | 67 | CHARGES DIVERSES |
| 16 | 119 | REPORT A NOUVEAU (DEFICIT) |

**RECETTES (Colonnes G-K)**:

| Ligne | Compte | Libellé |
|-------|--------|---------|
| 8 | 70 | IMPOTS SUR LES REVENUS, BENEFICES ET GAINS |
| 9 | 71 | IMPOTS SUR LE PATRIMOINE |
| 10 | 72 | IMPOTS SUR LES BIENS ET SERVICES |
| 11 | 74 | AUTRES RECETTES FISCALES |
| 12 | 75 | CONTRIBUTIONS RECUES DES TIERS |
| 13 | 76 | PRODUITS FINANCIERS |
| 14 | 77 | RECETTES NON FISCALES |
| 15 | 110 | REPORT A NOUVEAU (EXCEDENT) |

#### Lignes 17-21: Totaux et Soldes

| Ligne | Colonne C (Dépenses) | Colonne H (Recettes) | Notes |
|-------|----------------------|----------------------|-------|
| 17 | TOTAL DEPENSES REELLES DE FONCTIONNEMENT | TOTAL RECETTES REELLES DE FONCTIONNEMENT | Somme des rubriques 60-67, 119 |
| 18 | Compte 12: EXCEDENT DE FONCTIONNEMENT | Compte 774: PRODUCTION IMMOBILISEE | Rubriques d'ordre |
| 19 | TOTAL RECETTES D'ORDRE DE FONCTIONNEMENT | TOTAL RECETTES D'ORDRE DE FONCTIONNEMENT | Somme rubriques d'ordre |
| 20 | TOTAL DEPENSES DE FONCTIONNEMENT (2) | TOTAL RECETTES DE FONCTIONNEMENT (1) | Total global fonctionnement |
| 21 | EXCEDENT DE FONCTIONNEMENT (1) - (2) | DEFICIT DE FONCTIONNEMENT (1) - (2) | Solde final |

**CORRECTION REQUISE** :
- Ligne 19, Colonne H: Devrait être "TOTAL RECETTES D'ORDRE DE FONCTIONNEMENT" au lieu de "TOTAL DEPENSES D'ORDRE"

### 2.3 Section INVESTISSEMENT

#### Ligne 23: En-têtes des sections
```
Colonne C: "SECTION INVESTISSEMENT"
Colonne H: "SECTION INVESTISSEMENT"
```

#### Ligne 24: En-têtes des colonnes
```
Même structure que ligne 7, mais colonne C renommée "INTITULE" (singulier)
```

#### Lignes 25-32: Rubriques Détaillées

**DÉPENSES (Colonnes B-F)**:

| Ligne | Compte | Libellé |
|-------|--------|---------|
| 25 | 16 | EMPRUNTS ET DETTES ASSIMILEES |
| 26 | 20 | IMMOBILISATION INCORPORELLES |
| 27 | 21 | IMMOBILISATION CORPORELLES |
| 28 | [vide] | [vide] |
| 29 | 119 | REPORT A NOUVEAU (DEFICIT) |
| 30 | [vide] | [vide] |
| 31 | [vide] | [vide] |

**RECETTES (Colonnes G-K)**:

| Ligne | Compte | Libellé |
|-------|--------|---------|
| 25 | 10 | FONDS, DOTATIONS ET RESERVES |
| 26 | 13 | SUBVENTIONS D'EQUIPEMENT |
| 27 | 14 | CESSIONS D'IMMOBILISATIONS |
| 28 | 16 | EMPRUNTS ET DETTES ASSIMILEES |
| 29 | 110 | REPORT A NOUVEAU (EXCEDENT) |
| 30 | 1012 | DOTATION DE L'ETAT |
| 31 | 1064 | EXCEDENT DE FONCTIONNEMENT CAPITALISE |

Note: Lignes non-correspondantes tolérées (investissement souvent asymétrique)

#### Lignes 30-35: Totaux et Soldes

| Ligne | Colonne C (Dépenses) | Colonne H (Recettes) | Notes |
|-------|----------------------|----------------------|-------|
| 30 | TOTAL DEPENSES REELLES D'INVESTISSEMENT | TOTAL RECETTES REELLES D'INVESTISSEMENT | Somme rubriques réelles |
| 31-32 | [Rubriques d'ordre] | [Rubriques d'ordre] | Généralement vides |
| 33 | TOTAL DEPENSES D'ORDRE D'INVESTISSEMENT | TOTAL RECETTES D'ORDRE D'INVESTISSEMENT | Somme rubriques d'ordre |
| 34 | TOTAL DEPENSES D'INVESTISSEMENT (4) | TOTAL RECETTES D'INVESTISSEMENT (3) | Total global investissement |
| 35 | EXCEDENT D'INVESTISSEMENT (3) - (4) | DEFICIT D'INVESTISSEMENT (3) - (4) | Solde final |

---

## 3. DONNÉES NUMÉRIQUES

### 3.1 Données Actuelles (Fichier Généré)

À intégrer dans les cellules appropriées:

```
Section Fonctionnement:
- Total Recettes: 49 900 000
- Total Dépenses: 49 700 000
- Solde: 200 000 (Excédent)

Section Investissement:
- À compléter/vérifier
```

### 3.2 Disposition des Montants

Les données numériques doivent être distribuées comme suit:

Pour chaque rubrique, créer 3 colonnes:
- **Colonne D/I**: Mandat Admis
- **Colonne E/J**: Paiement
- **Colonne F/K**: Reste à Payer

Les données actuelles (49.9M, 49.7M) doivent être décomposées dans ces colonnes ou placées dans la colonne "Mandat Admis".

---

## 4. FORMULES À IMPLÉMENTER

### 4.1 Totaux Dépenses Fonctionnement

**Cellule D17** (Mandat Admis):
```excel
=SUM(D8:D16)
```

**Cellule E17** (Paiement):
```excel
=SUM(E8:E16)
```

**Cellule F17** (Reste à Payer):
```excel
=SUM(F8:F16)
```

### 4.2 Totaux Recettes Fonctionnement

**Cellule I17** (Mandat Admis):
```excel
=SUM(I8:I16)
```

**Cellule J17** (Paiement):
```excel
=SUM(J8:J16)
```

**Cellule K17** (Reste à Payer):
```excel
=SUM(K8:K16)
```

### 4.3 Total Dépenses De Fonctionnement

**Cellule D20** (Mandat Admis):
```excel
=D17+D19
```
(Total réel + Total d'ordre)

### 4.4 Total Recettes De Fonctionnement

**Cellule I20** (Mandat Admis):
```excel
=I17+I19
```

### 4.5 Solde Fonctionnement

**Cellule D21** (Mandat Admis) - Excédent:
```excel
=MAX(0, I20-D20)
```

**Cellule I21** (Mandat Admis) - Déficit:
```excel
=MAX(0, D20-I20)
```

### 4.6 Formules Investissement (Similaires)

Appliquer le même pattern pour l'investissement:
- Lignes 30 pour totaux réels
- Lignes 33 pour totaux d'ordre
- Lignes 34 pour totaux généraux
- Ligne 35 pour soldes

---

## 5. FORMATAGE VISUEL

### 5.1 Styles de Police

| Élément | Police | Taille | Gras | Couleur |
|---------|--------|--------|------|---------|
| Titre (Ligne 2) | Arial/Calibri | 12 | Oui | Noir |
| En-têtes sections (Ligne 6) | Arial/Calibri | 11 | Oui | Noir |
| En-têtes colonnes (Ligne 7, 24) | Arial/Calibri | 11 | Oui | Blanc |
| Rubriques (8-16, 25-32) | Arial/Calibri | 10 | Non | Noir |
| Totaux (17, 30) | Arial/Calibri | 10 | Oui | Noir |
| Soldes (21, 35) | Arial/Calibri | 11 | Oui | Noir |

### 5.2 Remplissage de Couleur (Fill)

| Élément | Couleur RGB | Hex | Usage |
|---------|-------------|-----|-------|
| En-têtes colonnes | Gris moyen-clair | #E8E8E8 | Lignes 7, 24 |
| En-têtes sections | Gris clair | #F0F0F0 | Lignes 6, 23 |
| Totaux/Soldes | Jaune clair | #FFF2CC | Lignes 17, 19, 20, 21, 30, 33, 34, 35 |
| Titre | Gris foncé | #D3D3D3 | Ligne 2 |

### 5.3 Bordures

**Type**: Bordure fine (0,5pt) sur toutes les cellules contenant du contenu

- Appliquer à: Colonnes B-K, Lignes 7-21, 24-35
- Style: Continu, noir, 0,5pt

### 5.4 Alignement

| Colonne | Type | Alignement |
|---------|------|-----------|
| B, G | Numéro de compte | Centre |
| C, H | Libellé | Gauche, retour à la ligne |
| D, E, F, I, J, K | Montants | Droite |

### 5.5 Format des Nombres

| Type | Format | Exemple |
|------|--------|---------|
| Montants | # ##0 (sans décimales) | 49 900 000 |
| Comptes | Texte | 60, 61, 1012 |
| Comptes spéciaux | Texte | 119, 110 |

---

## 6. CHECKLIST D'IMPLÉMENTATION

### Phase 1: Structure de Base
- [ ] Élargir les colonnes à 11 (A à K)
- [ ] Définir les hauteurs de lignes
- [ ] Fusionner les cellules pour le titre (B2:K2)
- [ ] Ajouter la ligne collectivité/année (Ligne 4)

### Phase 2: Section Fonctionnement
- [ ] Ajouter les en-têtes section (Ligne 6)
- [ ] Ajouter les en-têtes colonnes (Ligne 7)
- [ ] Remplir les 9 rubriques dépenses (Lignes 8-16)
- [ ] Remplir les 8 rubriques recettes (Lignes 8-16)
- [ ] Ajouter les lignes de totaux/soldes (Lignes 17-21)

### Phase 3: Section Investissement
- [ ] Ajouter les en-têtes section (Ligne 23)
- [ ] Ajouter les en-têtes colonnes (Ligne 24)
- [ ] Remplir les rubriques investissement (Lignes 25-32)
- [ ] Ajouter les lignes de totaux/soldes (Lignes 30-35)

### Phase 4: Données Numériques
- [ ] Intégrer les montants fonctionnement (49.9M, 49.7M)
- [ ] Compléter les rubriques individuelles si données disponibles
- [ ] Remplir investissement si données disponibles

### Phase 5: Formules
- [ ] Implémenter les formules SUM pour totaux
- [ ] Implémenter les formules pour soldes
- [ ] Vérifier les calculs
- [ ] Ajouter formules conditionnelles si nécessaire

### Phase 6: Formatage
- [ ] Appliquer les couleurs de remplissage
- [ ] Appliquer les bordures
- [ ] Formater les nombres
- [ ] Ajuster les polices et styles
- [ ] Vérifier l'alignement

### Phase 7: Validation
- [ ] Vérifier que tous les libellés correspondent
- [ ] Valider les totaux manuellement
- [ ] Tester les formules
- [ ] Comparer avec le fichier objectif
- [ ] Test impression/export PDF

---

## 7. CORRECTIFS REQUIS SUR LE FICHIER OBJECTIF

Le fichier objectif contient plusieurs incohérences qui devraient être corrigées:

### 7.1 Ligne 17 - Côté Recettes
**Actuel**: "TOTAL DEPENSES REELLES DE FONCTIONNEMENT"
**À corriger**: "TOTAL RECETTES REELLES DE FONCTIONNEMENT"

### 7.2 Ligne 19 - Côté Recettes
**Actuel**: "TOTAL DEPENSES D'ORDRE DE FONCTIONNEMENT"
**À corriger**: "TOTAL RECETTES D'ORDRE DE FONCTIONNEMENT"

### 7.3 Ligne 30 (Investissement) - Côté Recettes
**Actuel**: "TOTAL DEPENSES REELLES D'INVESTISSEMENT"
**À corriger**: "TOTAL RECETTES REELLES D'INVESTISSEMENT"

### 7.4 Ligne 33 (Investissement) - Côté Recettes
**Actuel**: "TOTAL DEPENSES D'ORDRE D'INVESTISSEMENT"
**À corriger**: "TOTAL RECETTES D'ORDRE D'INVESTISSEMENT"

---

## 8. NOTES DE CONFORMITÉ

### 8.1 Normes Comptables

Ce format respecte:
- **Plan Comptable Général (PCG)** pour les collectivités territoriales
- **Normes IRES/TIOUCHE** pour les tableaux de compte administratif
- **Directive comptable du DGCL** (Direction Générale des Collectivités Locales)

### 8.2 Codes Comptables Utilisés

Les codes comptables utilisés appartiennent aux classes suivantes:

**Dépenses**:
- Classe 6x: Comptes de charges
- 119: Report à nouveau (déficit)
- 12: Compte d'ordre (excédent fonctionnement)

**Recettes**:
- Classe 7x: Comptes de produits
- 110: Report à nouveau (excédent)
- 10xx: Comptes de financement et d'ordre

---

## 9. ANNEXES

### 9.1 Références de Fichiers

1. **Fichier Objectif**:
   `/Users/angenor/Documents/projets/2025/TI/collectivites_territoriales/bank/cahier_des_charges/Tableaux_de_Compte_Administratif.xlsx`

2. **Fichier Généré (À Modifier)**:
   `/Users/angenor/Documents/projets/2025/TI/collectivites_territoriales/bank/cahier_des_charges/CA_COM-TEST_2024_NEW.xlsx`

3. **Exemple de Structure Proposée**:
   `/Users/angenor/Documents/projets/2025/TI/collectivites_territoriales/EXEMPLE_STRUCTURE_EQUILIBRE.xlsx`

### 9.2 Documents de Reference

- Cahier des Charges: `bank/cahier_des_charges/TIMG_PCQVP_TdR_Prestataire-Conception-Plateforme-Web.pdf`
- Schéma Base de Données: `bank/modele_de_donnees/schema.sql`
- Modèle Conceptuel: `bank/modele_de_donnees/mcd.md`

---

## Conclusion

La refondation de la feuille EQUILIBRE est un changement **structurel majeur** mais **techniquement réalisable**. Les étapes proposées permettent une migration progressive sans risque de perte de données.

**Priorité**: Phase 2 (Section Fonctionnement) car elle contient les données critiques actuelles.
**Timeline**: 1-2 jours de développement + testing
