
-- Vérifier et créer les politiques RLS pour les utilisateurs internes sur la table clients
CREATE POLICY "Internal users can view all clients" 
  ON public.clients 
  FOR SELECT 
  TO authenticated
  USING (public.is_internal_user_active(auth.uid()));

CREATE POLICY "Internal users can insert clients" 
  ON public.clients 
  FOR INSERT 
  TO authenticated
  WITH CHECK (public.is_internal_user_active(auth.uid()));

CREATE POLICY "Internal users can update clients" 
  ON public.clients 
  FOR UPDATE 
  TO authenticated
  USING (public.is_internal_user_active(auth.uid()));

CREATE POLICY "Internal users can delete clients" 
  ON public.clients 
  FOR DELETE 
  TO authenticated
  USING (public.is_internal_user_active(auth.uid()));

-- Activer RLS sur la table clients si ce n'est pas déjà fait
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;

-- Politiques pour factures_vente (pour les onglets clients endettés et meilleurs clients)
CREATE POLICY "Internal users can view all factures_vente" 
  ON public.factures_vente 
  FOR SELECT 
  TO authenticated
  USING (public.is_internal_user_active(auth.uid()));

-- Activer RLS sur factures_vente si pas déjà fait
ALTER TABLE public.factures_vente ENABLE ROW LEVEL SECURITY;

-- Politiques pour versements_clients (pour calculer les montants payés)
CREATE POLICY "Internal users can view all versements_clients" 
  ON public.versements_clients 
  FOR SELECT 
  TO authenticated
  USING (public.is_internal_user_active(auth.uid()));

-- Activer RLS sur versements_clients si pas déjà fait
ALTER TABLE public.versements_clients ENABLE ROW LEVEL SECURITY;

-- Fonction pour calculer les statistiques clients
CREATE OR REPLACE FUNCTION public.get_client_statistics()
RETURNS TABLE(
  client_id UUID,
  client_nom TEXT,
  client_email TEXT,
  client_telephone TEXT,
  nombre_ventes BIGINT,
  total_facture NUMERIC,
  total_paye NUMERIC,
  reste_a_payer NUMERIC
)
LANGUAGE SQL
SECURITY DEFINER
AS $$
  SELECT 
    c.id as client_id,
    c.nom as client_nom,
    c.email as client_email,
    c.telephone as client_telephone,
    COUNT(fv.id) as nombre_ventes,
    COALESCE(SUM(fv.montant_ttc), 0) as total_facture,
    COALESCE(SUM(v.total_paye), 0) as total_paye,
    COALESCE(SUM(fv.montant_ttc), 0) - COALESCE(SUM(v.total_paye), 0) as reste_a_payer
  FROM public.clients c
  LEFT JOIN public.factures_vente fv ON c.id = fv.client_id
  LEFT JOIN (
    SELECT 
      facture_id,
      SUM(montant) as total_paye
    FROM public.versements_clients
    GROUP BY facture_id
  ) v ON fv.id = v.facture_id
  GROUP BY c.id, c.nom, c.email, c.telephone
  ORDER BY total_facture DESC;
$$;

-- Fonction pour obtenir les clients endettés avec détail des factures
CREATE OR REPLACE FUNCTION public.get_clients_endettes()
RETURNS TABLE(
  client_id UUID,
  client_nom TEXT,
  client_email TEXT,
  client_telephone TEXT,
  facture_id UUID,
  numero_facture TEXT,
  date_facture TIMESTAMP WITH TIME ZONE,
  montant_total NUMERIC,
  montant_paye NUMERIC,
  reste_a_payer NUMERIC,
  statut_paiement TEXT
)
LANGUAGE SQL
SECURITY DEFINER
AS $$
  SELECT 
    c.id as client_id,
    c.nom as client_nom,
    c.email as client_email,
    c.telephone as client_telephone,
    fv.id as facture_id,
    fv.numero_facture,
    fv.date_facture,
    fv.montant_ttc as montant_total,
    COALESCE(v.total_paye, 0) as montant_paye,
    fv.montant_ttc - COALESCE(v.total_paye, 0) as reste_a_payer,
    CASE 
      WHEN COALESCE(v.total_paye, 0) = 0 THEN 'non_paye'
      WHEN COALESCE(v.total_paye, 0) < fv.montant_ttc THEN 'partiel'
      ELSE 'paye'
    END as statut_paiement
  FROM public.clients c
  INNER JOIN public.factures_vente fv ON c.id = fv.client_id
  LEFT JOIN (
    SELECT 
      facture_id,
      SUM(montant) as total_paye
    FROM public.versements_clients
    GROUP BY facture_id
  ) v ON fv.id = v.facture_id
  WHERE fv.montant_ttc > COALESCE(v.total_paye, 0)
  ORDER BY c.nom, fv.date_facture DESC;
$$;
