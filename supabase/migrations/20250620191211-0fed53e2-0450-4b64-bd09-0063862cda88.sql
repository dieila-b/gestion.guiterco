
-- Ajouter des colonnes pour le suivi des stocks dans les précommandes
ALTER TABLE public.precommandes 
ADD COLUMN IF NOT EXISTS notification_envoyee BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS date_notification TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS bon_livraison_genere BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS bon_livraison_id UUID REFERENCES public.bons_de_livraison(id);

-- Créer une table pour les notifications de précommandes
CREATE TABLE IF NOT EXISTS public.notifications_precommandes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  precommande_id UUID REFERENCES public.precommandes(id) ON DELETE CASCADE,
  type_notification VARCHAR(50) NOT NULL, -- 'stock_disponible', 'livraison_generee', 'livraison_confirmee'
  message TEXT NOT NULL,
  statut VARCHAR(20) DEFAULT 'en_attente', -- 'en_attente', 'envoyee', 'vue'
  date_creation TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  date_envoi TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Créer une fonction pour vérifier la disponibilité des stocks pour les précommandes
CREATE OR REPLACE FUNCTION public.check_precommande_stock_availability()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
    precommande_record RECORD;
    article_disponible BOOLEAN;
    stock_entrepot INTEGER;
    stock_pdv INTEGER;
BEGIN
    -- Vérifier si c'est une entrée de stock qui pourrait satisfaire des précommandes
    IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
        -- Chercher les précommandes en attente pour cet article
        FOR precommande_record IN
            SELECT p.id, p.numero_precommande, p.client_id, p.statut,
                   lp.article_id, lp.quantite
            FROM public.precommandes p
            JOIN public.lignes_precommande lp ON p.id = lp.precommande_id
            WHERE lp.article_id = NEW.article_id 
            AND p.statut IN ('confirmee', 'en_preparation')
            AND p.notification_envoyee = FALSE
        LOOP
            -- Vérifier la disponibilité totale (entrepôt + PDV)
            SELECT COALESCE(SUM(sp.quantite_disponible), 0) INTO stock_entrepot
            FROM public.stock_principal sp
            WHERE sp.article_id = precommande_record.article_id;
            
            SELECT COALESCE(SUM(spv.quantite_disponible), 0) INTO stock_pdv
            FROM public.stock_pdv spv
            WHERE spv.article_id = precommande_record.article_id;
            
            -- Si le stock total est suffisant pour cette précommande
            IF (stock_entrepot + stock_pdv) >= precommande_record.quantite THEN
                -- Mettre à jour le statut de la précommande
                UPDATE public.precommandes 
                SET statut = 'prete', 
                    notification_envoyee = TRUE,
                    date_notification = now(),
                    updated_at = now()
                WHERE id = precommande_record.id;
                
                -- Créer une notification
                INSERT INTO public.notifications_precommandes (
                    precommande_id, 
                    type_notification, 
                    message
                ) VALUES (
                    precommande_record.id,
                    'stock_disponible',
                    'Stock disponible pour la précommande ' || precommande_record.numero_precommande
                );
            END IF;
        END LOOP;
    END IF;
    
    RETURN COALESCE(NEW, OLD);
END;
$$;

-- Créer les triggers sur les tables de stock
DROP TRIGGER IF EXISTS trigger_check_precommande_stock_entrepot ON public.stock_principal;
CREATE TRIGGER trigger_check_precommande_stock_entrepot
    AFTER INSERT OR UPDATE OF quantite_disponible ON public.stock_principal
    FOR EACH ROW
    EXECUTE FUNCTION public.check_precommande_stock_availability();

DROP TRIGGER IF EXISTS trigger_check_precommande_stock_pdv ON public.stock_pdv;
CREATE TRIGGER trigger_check_precommande_stock_pdv
    AFTER INSERT OR UPDATE OF quantite_disponible ON public.stock_pdv
    FOR EACH ROW
    EXECUTE FUNCTION public.check_precommande_stock_availability();

-- Créer une fonction pour générer automatiquement un bon de livraison depuis une précommande
CREATE OR REPLACE FUNCTION public.generer_bon_livraison_precommande(precommande_uuid UUID)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    precommande_data RECORD;
    bon_livraison_id UUID;
    nouveau_numero_bl VARCHAR(50);
BEGIN
    -- Récupérer les données de la précommande
    SELECT * INTO precommande_data
    FROM public.precommandes 
    WHERE id = precommande_uuid AND statut = 'prete';
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Précommande non trouvée ou pas prête pour livraison';
    END IF;
    
    -- Générer un numéro de bon de livraison
    nouveau_numero_bl := 'BL-PRECO-' || TO_CHAR(now(), 'YYMMDD') || '-' || 
                         LPAD((EXTRACT(EPOCH FROM now())::INTEGER % 10000)::TEXT, 4, '0');
    
    -- Créer le bon de livraison
    INSERT INTO public.bons_de_livraison (
        numero_bon,
        fournisseur,
        date_livraison,
        statut,
        observations,
        created_by
    ) VALUES (
        nouveau_numero_bl,
        'Précommande Client',
        now(),
        'en_preparation',
        'Bon de livraison généré automatiquement pour la précommande ' || precommande_data.numero_precommande,
        'system'
    ) RETURNING id INTO bon_livraison_id;
    
    -- Mettre à jour la précommande
    UPDATE public.precommandes 
    SET bon_livraison_genere = TRUE,
        bon_livraison_id = bon_livraison_id,
        statut = 'en_preparation',
        updated_at = now()
    WHERE id = precommande_uuid;
    
    -- Créer une notification
    INSERT INTO public.notifications_precommandes (
        precommande_id,
        type_notification,
        message
    ) VALUES (
        precommande_uuid,
        'livraison_generee',
        'Bon de livraison ' || nouveau_numero_bl || ' généré pour la précommande'
    );
    
    RETURN bon_livraison_id;
END;
$$;

-- Ajouter des triggers pour les mises à jour automatiques
CREATE TRIGGER update_notifications_precommandes_updated_at 
    BEFORE UPDATE ON public.notifications_precommandes 
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_precommandes_statut_notification ON public.precommandes(statut, notification_envoyee);
CREATE INDEX IF NOT EXISTS idx_notifications_precommandes_statut ON public.notifications_precommandes(statut, date_creation);
CREATE INDEX IF NOT EXISTS idx_lignes_precommande_article ON public.lignes_precommande(article_id);
