-- Données initiales pour l'Observatoire des Mines de Madagascar
-- À exécuter après la création des tables via Prisma

-- ============================================================================
-- RÉGIONS DE MADAGASCAR (22 régions)
-- ============================================================================

INSERT INTO regions (id, name, code, description, "createdAt") VALUES
  ('reg_diana', 'Diana', 'DIA', 'Région Diana - Nord', NOW()),
  ('reg_sava', 'Sava', 'SAV', 'Région Sava - Nord-Est', NOW()),
  ('reg_itasy', 'Itasy', 'ITA', 'Région Itasy - Centre', NOW()),
  ('reg_analamanga', 'Analamanga', 'ANA', 'Région Analamanga - Centre (Antananarivo)', NOW()),
  ('reg_vakinankaratra', 'Vakinankaratra', 'VAK', 'Région Vakinankaratra - Centre', NOW()),
  ('reg_bongolava', 'Bongolava', 'BON', 'Région Bongolava - Centre-Ouest', NOW()),
  ('reg_sofia', 'Sofia', 'SOF', 'Région Sofia - Nord-Ouest', NOW()),
  ('reg_boeny', 'Boeny', 'BOE', 'Région Boeny - Nord-Ouest (Mahajanga)', NOW()),
  ('reg_betsiboka', 'Betsiboka', 'BET', 'Région Betsiboka - Nord', NOW()),
  ('reg_melaky', 'Melaky', 'MEL', 'Région Melaky - Ouest', NOW()),
  ('reg_alaotra_mangoro', 'Alaotra-Mangoro', 'ALA', 'Région Alaotra-Mangoro - Est', NOW()),
  ('reg_atsinanana', 'Atsinanana', 'ATS', 'Région Atsinanana - Est (Toamasina)', NOW()),
  ('reg_analanjirofo', 'Analanjirofo', 'ANL', 'Région Analanjirofo - Nord-Est', NOW()),
  ('reg_amoron_i_mania', 'Amoron''i Mania', 'AMO', 'Région Amoron''i Mania - Centre', NOW()),
  ('reg_haute_matsiatra', 'Haute Matsiatra', 'HAU', 'Région Haute Matsiatra - Centre-Sud', NOW()),
  ('reg_vatovavy_fitovinany', 'Vatovavy-Fitovinany', 'VAT', 'Région Vatovavy-Fitovinany - Sud-Est', NOW()),
  ('reg_atsimo_atsinanana', 'Atsimo-Atsinanana', 'ASA', 'Région Atsimo-Atsinanana - Sud-Est', NOW()),
  ('reg_ihorombe', 'Ihorombe', 'IHO', 'Région Ihorombe - Sud', NOW()),
  ('reg_menabe', 'Menabe', 'MEN', 'Région Menabe - Ouest', NOW()),
  ('reg_atsimo_andrefana', 'Atsimo-Andrefana', 'ASN', 'Région Atsimo-Andrefana - Sud-Ouest (Toliara)', NOW()),
  ('reg_androy', 'Androy', 'AND', 'Région Androy - Sud', NOW()),
  ('reg_anosy', 'Anosy', 'ANO', 'Région Anosy - Sud-Est (Fort-Dauphin)', NOW());

-- ============================================================================
-- CATÉGORIES THÉMATIQUES
-- ============================================================================

INSERT INTO categories (id, name, slug, description, icon, color, "sortOrder", "createdAt", "updatedAt") VALUES
  ('cat_env', 'Environnement', 'environnement',
   'Impact environnemental : pollution, déforestation, contamination des eaux',
   'fa-solid fa-leaf', '#22c55e', 1, NOW(), NOW()),

  ('cat_foncier', 'Droits fonciers', 'droits-fonciers',
   'Expropriation, compensations, accès aux terres',
   'fa-solid fa-house', '#eab308', 2, NOW(), NOW()),

  ('cat_sante', 'Santé publique', 'sante-publique',
   'Impacts sur la santé des communautés locales',
   'fa-solid fa-heart-pulse', '#ef4444', 3, NOW(), NOW()),

  ('cat_finance', 'Transparence financière', 'transparence-financiere',
   'Gestion des revenus miniers, redevances, taxes',
   'fa-solid fa-coins', '#3b82f6', 4, NOW(), NOW()),

  ('cat_consultation', 'Consultation communautaire', 'consultation-communautaire',
   'Processus de consultation, consentement préalable',
   'fa-solid fa-people-group', '#8b5cf6', 5, NOW(), NOW()),

  ('cat_emploi', 'Emploi local', 'emploi-local',
   'Création d''emplois, conditions de travail',
   'fa-solid fa-briefcase', '#f97316', 6, NOW(), NOW()),

  ('cat_eau', 'Ressources en eau', 'ressources-eau',
   'Accès à l''eau, contamination aquifères',
   'fa-solid fa-droplet', '#06b6d4', 7, NOW(), NOW()),

  ('cat_gouvernance', 'Gouvernance', 'gouvernance',
   'Cadre légal, conformité, permis miniers',
   'fa-solid fa-landmark', '#6b7280', 8, NOW(), NOW());

-- ============================================================================
-- AXES STRATÉGIQUES
-- ============================================================================

INSERT INTO strategic_axes (id, title, description, "backgroundImage", "linkUrl", "sortOrder", "isActive", "createdAt", "updatedAt") VALUES
  ('axe_transparence', 'Transparence',
   'Promouvoir la transparence dans la gestion des ressources minières et des revenus associés',
   '/images/axes/transparence.jpg', '/a-propos#transparence', 1, true, NOW(), NOW()),

  ('axe_redevabilite', 'Redevabilité',
   'Assurer la redevabilité des acteurs miniers et de l''État envers les communautés locales',
   '/images/axes/redevabilite.jpg', '/a-propos#redevabilite', 2, true, NOW(), NOW()),

  ('axe_durabilite', 'Durabilité',
   'Promouvoir des pratiques minières durables et respectueuses de l''environnement',
   '/images/axes/durabilite.jpg', '/a-propos#durabilite', 3, true, NOW(), NOW()),

  ('axe_inclusion', 'Inclusion',
   'Donner une voix aux communautés affectées et assurer leur participation aux décisions',
   '/images/axes/inclusion.jpg', '/a-propos#inclusion', 4, true, NOW(), NOW());

-- ============================================================================
-- PARTENAIRES
-- ============================================================================

INSERT INTO partners (id, name, logo, "websiteUrl", description, "sortOrder", "isActive", "createdAt", "updatedAt") VALUES
  ('partner_timg', 'Transparency International - Initiative Madagascar',
   '/images/partners/timg-logo.png', 'https://transparency.mg',
   'Organisation de lutte contre la corruption', 1, true, NOW(), NOW()),

  ('partner_pcqvp', 'Publiez Ce Que Vous Payez Madagascar',
   '/images/partners/pcqvp-logo.png', 'https://pcqvp.mg',
   'Coalition pour la transparence des industries extractives', 2, true, NOW(), NOW());

-- ============================================================================
-- CONFIGURATION DU SITE
-- ============================================================================

INSERT INTO site_config (id, key, value, description, "updatedAt") VALUES
  ('conf_title', 'site_title', 'Observatoire des Mines de Madagascar', 'Titre principal du site', NOW()),
  ('conf_desc', 'site_description', 'Plateforme de suivi de la gouvernance, transparence et durabilité dans la gestion des ressources minières à Madagascar', 'Description SEO', NOW()),
  ('conf_email', 'contact_email', 'contact@observatoire-mines.mg', 'Email de contact', NOW()),
  ('conf_address', 'contact_address', 'Antananarivo, Madagascar', 'Adresse physique', NOW()),
  ('conf_phone', 'contact_phone', '+261 XX XX XXX XX', 'Numéro de téléphone', NOW());

-- ============================================================================
-- CONTENU PAGE "À PROPOS"
-- ============================================================================

INSERT INTO about_content (id, section, title, content, image, "sortOrder", "isActive", "updatedAt") VALUES
  ('about_mission', 'mission', 'Notre Mission',
   'L''Observatoire des Mines de Madagascar a pour mission de suivre de manière indépendante, rigoureuse et continue la gouvernance, la transparence et la durabilité dans la gestion des ressources minières à Madagascar.',
   '/images/about/mission.jpg', 1, true, NOW()),

  ('about_vision', 'vision', 'Notre Vision',
   'Un secteur minier malagasy transparent, redevable et durable, qui bénéficie équitablement aux communautés locales tout en préservant l''environnement.',
   '/images/about/vision.jpg', 2, true, NOW()),

  ('about_context', 'context', 'Contexte',
   'Le secteur minier malagasy continue de soulever des enjeux majeurs en matière de gouvernance, de transparence et de redevabilité. Les recherches menées ont mis en lumière des impacts négatifs récurrents : pertes de revenus, expropriation, contamination de l''eau, atteintes à la santé, et compensations inéquitables.',
   '/images/about/context.jpg', 3, true, NOW());
