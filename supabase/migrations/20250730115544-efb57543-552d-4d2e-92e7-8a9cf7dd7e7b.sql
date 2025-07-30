-- ========================================
-- SYSTÈME DE PERMISSIONS STRICT - FINALISATION (CORRIGÉ)
-- ========================================

-- 1. Créer une fonction sécurisée pour vérifier les permissions utilisateur
CREATE OR REPLACE FUNCTION public.user_has_permission(p_menu text, p_submenu text DEFAULT NULL, p_action text DEFAULT 'read')
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 
    FROM utilisateurs_internes ui
    JOIN roles r ON ui.role_id = r.id
    JOIN role_permissions rp ON r.id = rp.role_id
    JOIN permissions p ON rp.permission_id = p.id
    WHERE ui.user_id = auth.uid()
    AND ui.statut = 'actif'
    AND p.menu = p_menu
    AND (p_submenu IS NULL OR p.submenu = p_submenu)
    AND p.action = p_action
    AND rp.can_access = true
  );
$$;

-- 2. Fonction pour obtenir le rôle de l'utilisateur connecté
CREATE OR REPLACE FUNCTION public.get_user_role()
RETURNS text
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT r.name
  FROM utilisateurs_internes ui
  JOIN roles r ON ui.role_id = r.id
  WHERE ui.user_id = auth.uid()
  AND ui.statut = 'actif';
$$;

-- 3. Fonction pour vérifier si l'utilisateur est administrateur
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 
    FROM utilisateurs_internes ui
    JOIN roles r ON ui.role_id = r.id
    WHERE ui.user_id = auth.uid()
    AND ui.statut = 'actif'
    AND r.name = 'Administrateur'
  );
$$;

-- 4. Supprimer l'ancienne vue et la recréer
DROP VIEW IF EXISTS public.vue_permissions_utilisateurs;

CREATE VIEW public.vue_permissions_utilisateurs AS
SELECT 
    ui.user_id,
    p.menu,
    p.submenu,
    p.action,
    rp.can_access
FROM utilisateurs_internes ui
JOIN roles r ON ui.role_id = r.id
JOIN role_permissions rp ON r.id = rp.role_id
JOIN permissions p ON rp.permission_id = p.id
WHERE ui.statut = 'actif'
AND rp.can_access = true;

-- 5. NETTOYER ET APPLIQUER LES RLS STRICTES

-- CLIENTS - Nettoyer toutes les anciennes politiques
DROP POLICY IF EXISTS "Permission-based clients read" ON public.clients;
DROP POLICY IF EXISTS "Permission-based clients write" ON public.clients;
DROP POLICY IF EXISTS "Clients are publicly readable" ON public.clients;
DROP POLICY IF EXISTS "Clients are publicly writable" ON public.clients;
DROP POLICY IF EXISTS "Clients are publicly updatable" ON public.clients;
DROP POLICY IF EXISTS "Clients are publicly deletable" ON public.clients;
DROP POLICY IF EXISTS "select_all_clients" ON public.clients;

CREATE POLICY "Strict clients read access" ON public.clients
FOR SELECT USING (user_has_permission('Clients', NULL, 'read'));

CREATE POLICY "Strict clients write access" ON public.clients
FOR INSERT WITH CHECK (user_has_permission('Clients', NULL, 'write'));

CREATE POLICY "Strict clients update access" ON public.clients
FOR UPDATE USING (user_has_permission('Clients', NULL, 'write'));

CREATE POLICY "Strict clients delete access" ON public.clients
FOR DELETE USING (user_has_permission('Clients', NULL, 'delete'));

-- CATALOGUE - Nettoyer et appliquer strictement
DROP POLICY IF EXISTS "Ultra permissive catalogue access" ON public.catalogue;
DROP POLICY IF EXISTS "Debug: Allow all access to catalogue" ON public.catalogue;
DROP POLICY IF EXISTS "Debug: Allow public read access to catalogue" ON public.catalogue;

CREATE POLICY "Strict catalogue read access" ON public.catalogue
FOR SELECT USING (user_has_permission('Catalogue', NULL, 'read'));

CREATE POLICY "Strict catalogue write access" ON public.catalogue
FOR INSERT WITH CHECK (user_has_permission('Catalogue', NULL, 'write'));

CREATE POLICY "Strict catalogue update access" ON public.catalogue
FOR UPDATE USING (user_has_permission('Catalogue', NULL, 'write'));

CREATE POLICY "Strict catalogue delete access" ON public.catalogue
FOR DELETE USING (user_has_permission('Catalogue', NULL, 'delete'));

-- FACTURES VENTE - Application stricte des permissions
DROP POLICY IF EXISTS "ULTRA_PERMISSIVE_factures_vente" ON public.factures_vente;
DROP POLICY IF EXISTS "Allow insert for authenticated" ON public.factures_vente;
DROP POLICY IF EXISTS "Permission-based factures_vente read" ON public.factures_vente;
DROP POLICY IF EXISTS "Permission-based factures_vente write" ON public.factures_vente;
DROP POLICY IF EXISTS "Permission-based marges access" ON public.factures_vente;
DROP POLICY IF EXISTS "Permission-based rapports access" ON public.factures_vente;

CREATE POLICY "Strict factures_vente read access" ON public.factures_vente
FOR SELECT USING (
  user_has_permission('Ventes', 'Factures', 'read') OR 
  user_has_permission('Rapports', 'Ventes', 'read') OR
  user_has_permission('Rapports', 'Marges', 'read') OR
  user_has_permission('Dashboard', NULL, 'read')
);

CREATE POLICY "Strict factures_vente write access" ON public.factures_vente
FOR INSERT WITH CHECK (user_has_permission('Ventes', 'Factures', 'write'));

CREATE POLICY "Strict factures_vente update access" ON public.factures_vente
FOR UPDATE USING (user_has_permission('Ventes', 'Factures', 'write'));

CREATE POLICY "Strict factures_vente delete access" ON public.factures_vente
FOR DELETE USING (user_has_permission('Ventes', 'Factures', 'write'));

-- LIGNES FACTURE VENTE
DROP POLICY IF EXISTS "Ultra permissive lignes_facture_vente access" ON public.lignes_facture_vente;

CREATE POLICY "Strict lignes_facture_vente read access" ON public.lignes_facture_vente
FOR SELECT USING (
  user_has_permission('Ventes', 'Factures', 'read') OR 
  user_has_permission('Rapports', 'Ventes', 'read') OR
  user_has_permission('Rapports', 'Marges', 'read') OR
  user_has_permission('Dashboard', NULL, 'read')
);

CREATE POLICY "Strict lignes_facture_vente write access" ON public.lignes_facture_vente
FOR INSERT WITH CHECK (user_has_permission('Ventes', 'Factures', 'write'));

CREATE POLICY "Strict lignes_facture_vente update access" ON public.lignes_facture_vente
FOR UPDATE USING (user_has_permission('Ventes', 'Factures', 'write'));

CREATE POLICY "Strict lignes_facture_vente delete access" ON public.lignes_facture_vente
FOR DELETE USING (user_has_permission('Ventes', 'Factures', 'write'));

-- PRECOMMANDES
DROP POLICY IF EXISTS "Permission-based precommandes read" ON public.precommandes;
DROP POLICY IF EXISTS "Permission-based precommandes write" ON public.precommandes;
DROP POLICY IF EXISTS "Protect completed precommandes from deletion" ON public.precommandes;
DROP POLICY IF EXISTS "Protect completed precommandes from modification" ON public.precommandes;

CREATE POLICY "Strict precommandes read access" ON public.precommandes
FOR SELECT USING (user_has_permission('Ventes', 'Précommandes', 'read'));

CREATE POLICY "Strict precommandes write access" ON public.precommandes
FOR INSERT WITH CHECK (user_has_permission('Ventes', 'Précommandes', 'write'));

CREATE POLICY "Strict precommandes update access" ON public.precommandes
FOR UPDATE USING (user_has_permission('Ventes', 'Précommandes', 'write'));

CREATE POLICY "Strict precommandes delete access" ON public.precommandes
FOR DELETE USING (user_has_permission('Ventes', 'Précommandes', 'write'));

-- LIGNES PRECOMMANDE
DROP POLICY IF EXISTS "Dev: Allow all operations on lignes_precommande" ON public.lignes_precommande;

CREATE POLICY "Strict lignes_precommande read access" ON public.lignes_precommande
FOR SELECT USING (user_has_permission('Ventes', 'Précommandes', 'read'));

CREATE POLICY "Strict lignes_precommande write access" ON public.lignes_precommande
FOR INSERT WITH CHECK (user_has_permission('Ventes', 'Précommandes', 'write'));

CREATE POLICY "Strict lignes_precommande update access" ON public.lignes_precommande
FOR UPDATE USING (user_has_permission('Ventes', 'Précommandes', 'write'));

CREATE POLICY "Strict lignes_precommande delete access" ON public.lignes_precommande
FOR DELETE USING (user_has_permission('Ventes', 'Précommandes', 'write'));

-- BONS DE COMMANDE
DROP POLICY IF EXISTS "Permission-based bons_de_commande read" ON public.bons_de_commande;
DROP POLICY IF EXISTS "Permission-based bons_de_commande write" ON public.bons_de_commande;
DROP POLICY IF EXISTS "Authenticated users can access bons_de_commande" ON public.bons_de_commande;
DROP POLICY IF EXISTS "Dev: Allow all operations on bons_de_commande" ON public.bons_de_commande;

CREATE POLICY "Strict bons_de_commande read access" ON public.bons_de_commande
FOR SELECT USING (user_has_permission('Achats', 'Bons de commande', 'read'));

CREATE POLICY "Strict bons_de_commande write access" ON public.bons_de_commande
FOR INSERT WITH CHECK (user_has_permission('Achats', 'Bons de commande', 'write'));

CREATE POLICY "Strict bons_de_commande update access" ON public.bons_de_commande
FOR UPDATE USING (user_has_permission('Achats', 'Bons de commande', 'write'));

CREATE POLICY "Strict bons_de_commande delete access" ON public.bons_de_commande
FOR DELETE USING (user_has_permission('Achats', 'Bons de commande', 'write'));

-- ENTREES STOCK
DROP POLICY IF EXISTS "Permission-based entrees_stock read" ON public.entrees_stock;
DROP POLICY IF EXISTS "Permission-based entrees_stock write" ON public.entrees_stock;

CREATE POLICY "Strict entrees_stock read access" ON public.entrees_stock
FOR SELECT USING (
  user_has_permission('Stock', 'Mouvements', 'read') OR
  user_has_permission('Stock', 'Entrepôts', 'read') OR
  user_has_permission('Stock', 'PDV', 'read')
);

CREATE POLICY "Strict entrees_stock write access" ON public.entrees_stock
FOR INSERT WITH CHECK (
  user_has_permission('Stock', 'Entrepôts', 'write') OR
  user_has_permission('Stock', 'PDV', 'write')
);

CREATE POLICY "Strict entrees_stock update access" ON public.entrees_stock
FOR UPDATE USING (
  user_has_permission('Stock', 'Entrepôts', 'write') OR
  user_has_permission('Stock', 'PDV', 'write')
);

CREATE POLICY "Strict entrees_stock delete access" ON public.entrees_stock
FOR DELETE USING (
  user_has_permission('Stock', 'Entrepôts', 'write') OR
  user_has_permission('Stock', 'PDV', 'write')
);

-- CASH REGISTERS
DROP POLICY IF EXISTS "Allow all operations on cash_registers" ON public.cash_registers;
DROP POLICY IF EXISTS "Dev: Allow all operations on cash_registers" ON public.cash_registers;

CREATE POLICY "Strict cash_registers read access" ON public.cash_registers
FOR SELECT USING (
  user_has_permission('Caisse', 'Opérations', 'read') OR
  user_has_permission('Caisse', 'Clôtures', 'read') OR
  user_has_permission('Caisse', 'États', 'read')
);

CREATE POLICY "Strict cash_registers write access" ON public.cash_registers
FOR INSERT WITH CHECK (user_has_permission('Caisse', 'Opérations', 'write'));

CREATE POLICY "Strict cash_registers update access" ON public.cash_registers
FOR UPDATE USING (user_has_permission('Caisse', 'Opérations', 'write'));

CREATE POLICY "Strict cash_registers delete access" ON public.cash_registers
FOR DELETE USING (user_has_permission('Caisse', 'Opérations', 'write'));

-- CASH OPERATIONS
DROP POLICY IF EXISTS "Tout le monde peut voir les opérations de caisse" ON public.cash_operations;

CREATE POLICY "Strict cash_operations read access" ON public.cash_operations
FOR SELECT USING (user_has_permission('Caisse', 'Opérations', 'read'));

CREATE POLICY "Strict cash_operations write access" ON public.cash_operations
FOR INSERT WITH CHECK (user_has_permission('Caisse', 'Opérations', 'write'));

CREATE POLICY "Strict cash_operations update access" ON public.cash_operations
FOR UPDATE USING (user_has_permission('Caisse', 'Opérations', 'write'));

CREATE POLICY "Strict cash_operations delete access" ON public.cash_operations
FOR DELETE USING (user_has_permission('Caisse', 'Opérations', 'write'));

-- PERMISSIONS ET ROLES (uniquement pour les admins)
DROP POLICY IF EXISTS "Authenticated users can read permissions" ON public.permissions;
DROP POLICY IF EXISTS "Authenticated users can write permissions" ON public.permissions;
DROP POLICY IF EXISTS "Utilisateurs internes peuvent lire les permissions" ON public.permissions;
DROP POLICY IF EXISTS "Seuls les admins peuvent modifier les permissions" ON public.permissions;

CREATE POLICY "Admin only permissions access" ON public.permissions
FOR ALL USING (is_admin()) WITH CHECK (is_admin());

CREATE POLICY "Admin only roles access" ON public.roles
FOR ALL USING (is_admin()) WITH CHECK (is_admin());

CREATE POLICY "Admin only role_permissions access" ON public.role_permissions
FOR ALL USING (is_admin()) WITH CHECK (is_admin());

-- UTILISATEURS INTERNES
CREATE POLICY "Strict utilisateurs_internes read access" ON public.utilisateurs_internes
FOR SELECT USING (user_has_permission('Paramètres', 'Utilisateurs', 'read'));

CREATE POLICY "Strict utilisateurs_internes write access" ON public.utilisateurs_internes
FOR INSERT WITH CHECK (user_has_permission('Paramètres', 'Utilisateurs', 'write'));

CREATE POLICY "Strict utilisateurs_internes update access" ON public.utilisateurs_internes
FOR UPDATE USING (user_has_permission('Paramètres', 'Utilisateurs', 'write'));

CREATE POLICY "Strict utilisateurs_internes delete access" ON public.utilisateurs_internes
FOR DELETE USING (user_has_permission('Paramètres', 'Utilisateurs', 'write'));

-- Assurer que toutes les tables ont RLS activé
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.catalogue ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.factures_vente ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lignes_facture_vente ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.precommandes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lignes_precommande ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bons_de_commande ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.entrees_stock ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cash_registers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cash_operations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.role_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.utilisateurs_internes ENABLE ROW LEVEL SECURITY;

-- Commentaires pour documentation
COMMENT ON FUNCTION public.user_has_permission IS 'Vérifie strictement si l''utilisateur connecté a une permission spécifique selon son rôle actif';
COMMENT ON FUNCTION public.get_user_role IS 'Retourne le rôle de l''utilisateur connecté (utilisateurs actifs uniquement)';
COMMENT ON FUNCTION public.is_admin IS 'Vérifie si l''utilisateur connecté est administrateur actif';