
-- Corriger la structure de base de données pour unifier le système de rôles
-- =======================================================================

-- 1. D'abord, vérifier et créer la relation manquante
-- Ajouter une clé étrangère directe de utilisateurs_internes vers roles
ALTER TABLE public.utilisateurs_internes 
ADD COLUMN IF NOT EXISTS role_id_unified uuid REFERENCES public.roles(id);

-- 2. Migrer les données existantes
-- Mettre à jour les role_id_unified en fonction des données existantes
UPDATE public.utilisateurs_internes ui
SET role_id_unified = r.id
FROM public.roles_utilisateurs ru
JOIN public.roles r ON r.name = ru.nom
WHERE ui.role_id = ru.id;

-- 3. Créer une vue temporaire pour la transition
CREATE OR REPLACE VIEW public.vue_utilisateurs_internes_complets AS
SELECT 
  ui.*,
  COALESCE(r_direct.id, r_via_roles_utilisateurs.id) as unified_role_id,
  COALESCE(r_direct.name, r_via_roles_utilisateurs.name) as role_name,
  COALESCE(r_direct.description, r_via_roles_utilisateurs.description) as role_description
FROM public.utilisateurs_internes ui
LEFT JOIN public.roles r_direct ON ui.role_id_unified = r_direct.id
LEFT JOIN public.roles_utilisateurs ru ON ui.role_id = ru.id
LEFT JOIN public.roles r_via_roles_utilisateurs ON r_via_roles_utilisateurs.name = ru.nom;

-- 4. Assurer la cohérence des données dans user_roles
-- Insérer les relations manquantes dans user_roles
INSERT INTO public.user_roles (user_id, role_id, is_active)
SELECT DISTINCT 
  ui.user_id,
  COALESCE(ui.role_id_unified, r.id) as role_id,
  true as is_active
FROM public.utilisateurs_internes ui
LEFT JOIN public.roles_utilisateurs ru ON ui.role_id = ru.id
LEFT JOIN public.roles r ON r.name = ru.nom
WHERE ui.user_id IS NOT NULL
AND NOT EXISTS (
  SELECT 1 FROM public.user_roles ur 
  WHERE ur.user_id = ui.user_id 
  AND ur.role_id = COALESCE(ui.role_id_unified, r.id)
)
ON CONFLICT (user_id, role_id) DO NOTHING;

-- 5. Forcer le rechargement du cache PostgREST
NOTIFY pgrst, 'reload schema';
