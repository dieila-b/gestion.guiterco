export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      articles_bon_commande: {
        Row: {
          article_id: string | null
          bon_commande_id: string | null
          created_at: string
          id: string
          montant_ligne: number
          prix_unitaire: number
          quantite: number
        }
        Insert: {
          article_id?: string | null
          bon_commande_id?: string | null
          created_at?: string
          id?: string
          montant_ligne?: number
          prix_unitaire?: number
          quantite?: number
        }
        Update: {
          article_id?: string | null
          bon_commande_id?: string | null
          created_at?: string
          id?: string
          montant_ligne?: number
          prix_unitaire?: number
          quantite?: number
        }
        Relationships: [
          {
            foreignKeyName: "articles_bon_commande_article_id_fkey"
            columns: ["article_id"]
            isOneToOne: false
            referencedRelation: "catalogue"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "articles_bon_commande_article_id_fkey"
            columns: ["article_id"]
            isOneToOne: false
            referencedRelation: "vue_catalogue_optimise"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "articles_bon_commande_article_id_fkey"
            columns: ["article_id"]
            isOneToOne: false
            referencedRelation: "vue_marges_articles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "articles_bon_commande_article_id_fkey"
            columns: ["article_id"]
            isOneToOne: false
            referencedRelation: "vue_marges_frais"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "articles_bon_commande_article_id_fkey"
            columns: ["article_id"]
            isOneToOne: false
            referencedRelation: "vue_marges_globales_stock"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "articles_bon_commande_bon_commande_id_fkey"
            columns: ["bon_commande_id"]
            isOneToOne: false
            referencedRelation: "bons_de_commande"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_articles_bon_commande_bon_id"
            columns: ["bon_commande_id"]
            isOneToOne: false
            referencedRelation: "bons_de_commande"
            referencedColumns: ["id"]
          },
        ]
      }
      articles_bon_livraison: {
        Row: {
          article_id: string | null
          bon_livraison_id: string | null
          created_at: string
          id: string
          montant_ligne: number
          prix_unitaire: number
          quantite_commandee: number
          quantite_recue: number | null
          updated_at: string
        }
        Insert: {
          article_id?: string | null
          bon_livraison_id?: string | null
          created_at?: string
          id?: string
          montant_ligne?: number
          prix_unitaire?: number
          quantite_commandee?: number
          quantite_recue?: number | null
          updated_at?: string
        }
        Update: {
          article_id?: string | null
          bon_livraison_id?: string | null
          created_at?: string
          id?: string
          montant_ligne?: number
          prix_unitaire?: number
          quantite_commandee?: number
          quantite_recue?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "articles_bon_livraison_article_id_fkey"
            columns: ["article_id"]
            isOneToOne: false
            referencedRelation: "catalogue"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "articles_bon_livraison_article_id_fkey"
            columns: ["article_id"]
            isOneToOne: false
            referencedRelation: "vue_catalogue_optimise"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "articles_bon_livraison_article_id_fkey"
            columns: ["article_id"]
            isOneToOne: false
            referencedRelation: "vue_marges_articles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "articles_bon_livraison_article_id_fkey"
            columns: ["article_id"]
            isOneToOne: false
            referencedRelation: "vue_marges_frais"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "articles_bon_livraison_article_id_fkey"
            columns: ["article_id"]
            isOneToOne: false
            referencedRelation: "vue_marges_globales_stock"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "articles_bon_livraison_bon_livraison_id_fkey"
            columns: ["bon_livraison_id"]
            isOneToOne: false
            referencedRelation: "bons_de_livraison"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_articles_bon_livraison_bon_id"
            columns: ["bon_livraison_id"]
            isOneToOne: false
            referencedRelation: "bons_de_livraison"
            referencedColumns: ["id"]
          },
        ]
      }
      articles_facture_achat: {
        Row: {
          article_id: string | null
          created_at: string
          facture_achat_id: string | null
          id: string
          montant_ligne: number
          prix_unitaire: number
          quantite: number
        }
        Insert: {
          article_id?: string | null
          created_at?: string
          facture_achat_id?: string | null
          id?: string
          montant_ligne?: number
          prix_unitaire?: number
          quantite?: number
        }
        Update: {
          article_id?: string | null
          created_at?: string
          facture_achat_id?: string | null
          id?: string
          montant_ligne?: number
          prix_unitaire?: number
          quantite?: number
        }
        Relationships: [
          {
            foreignKeyName: "articles_facture_achat_article_id_fkey"
            columns: ["article_id"]
            isOneToOne: false
            referencedRelation: "catalogue"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "articles_facture_achat_article_id_fkey"
            columns: ["article_id"]
            isOneToOne: false
            referencedRelation: "vue_catalogue_optimise"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "articles_facture_achat_article_id_fkey"
            columns: ["article_id"]
            isOneToOne: false
            referencedRelation: "vue_marges_articles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "articles_facture_achat_article_id_fkey"
            columns: ["article_id"]
            isOneToOne: false
            referencedRelation: "vue_marges_frais"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "articles_facture_achat_article_id_fkey"
            columns: ["article_id"]
            isOneToOne: false
            referencedRelation: "vue_marges_globales_stock"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "articles_facture_achat_facture_achat_id_fkey"
            columns: ["facture_achat_id"]
            isOneToOne: false
            referencedRelation: "factures_achat"
            referencedColumns: ["id"]
          },
        ]
      }
      articles_retour_client: {
        Row: {
          article_id: string | null
          created_at: string
          etat_article: string | null
          id: string
          montant_ligne: number
          prix_unitaire: number
          quantite: number
          retour_id: string | null
        }
        Insert: {
          article_id?: string | null
          created_at?: string
          etat_article?: string | null
          id?: string
          montant_ligne: number
          prix_unitaire: number
          quantite: number
          retour_id?: string | null
        }
        Update: {
          article_id?: string | null
          created_at?: string
          etat_article?: string | null
          id?: string
          montant_ligne?: number
          prix_unitaire?: number
          quantite?: number
          retour_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "articles_retour_client_article_id_fkey"
            columns: ["article_id"]
            isOneToOne: false
            referencedRelation: "catalogue"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "articles_retour_client_article_id_fkey"
            columns: ["article_id"]
            isOneToOne: false
            referencedRelation: "vue_catalogue_optimise"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "articles_retour_client_article_id_fkey"
            columns: ["article_id"]
            isOneToOne: false
            referencedRelation: "vue_marges_articles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "articles_retour_client_article_id_fkey"
            columns: ["article_id"]
            isOneToOne: false
            referencedRelation: "vue_marges_frais"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "articles_retour_client_article_id_fkey"
            columns: ["article_id"]
            isOneToOne: false
            referencedRelation: "vue_marges_globales_stock"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "articles_retour_client_retour_id_fkey"
            columns: ["retour_id"]
            isOneToOne: false
            referencedRelation: "retours_clients"
            referencedColumns: ["id"]
          },
        ]
      }
      bons_de_commande: {
        Row: {
          created_at: string
          created_by: string | null
          date_commande: string
          date_livraison_prevue: string | null
          fournisseur: string
          fournisseur_id: string | null
          frais_livraison: number | null
          frais_logistique: number | null
          id: string
          montant_ht: number
          montant_paye: number | null
          montant_total: number
          numero_bon: string
          observations: string | null
          remise: number | null
          statut: string
          statut_paiement: string | null
          surestaries: number | null
          taux_tva: number | null
          transit_douane: number | null
          tva: number | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          date_commande?: string
          date_livraison_prevue?: string | null
          fournisseur: string
          fournisseur_id?: string | null
          frais_livraison?: number | null
          frais_logistique?: number | null
          id?: string
          montant_ht?: number
          montant_paye?: number | null
          montant_total?: number
          numero_bon: string
          observations?: string | null
          remise?: number | null
          statut?: string
          statut_paiement?: string | null
          surestaries?: number | null
          taux_tva?: number | null
          transit_douane?: number | null
          tva?: number | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          date_commande?: string
          date_livraison_prevue?: string | null
          fournisseur?: string
          fournisseur_id?: string | null
          frais_livraison?: number | null
          frais_logistique?: number | null
          id?: string
          montant_ht?: number
          montant_paye?: number | null
          montant_total?: number
          numero_bon?: string
          observations?: string | null
          remise?: number | null
          statut?: string
          statut_paiement?: string | null
          surestaries?: number | null
          taux_tva?: number | null
          transit_douane?: number | null
          tva?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "bons_de_commande_fournisseur_id_fkey"
            columns: ["fournisseur_id"]
            isOneToOne: false
            referencedRelation: "fournisseurs"
            referencedColumns: ["id"]
          },
        ]
      }
      bons_de_livraison: {
        Row: {
          bon_commande_id: string | null
          created_at: string
          created_by: string | null
          date_livraison: string
          date_reception: string | null
          entrepot_destination_id: string | null
          fournisseur: string
          id: string
          numero_bon: string
          numero_suivi: string | null
          observations: string | null
          point_vente_destination_id: string | null
          statut: string
          taux_tva: number | null
          transit_douane: number | null
          transporteur: string | null
          updated_at: string
        }
        Insert: {
          bon_commande_id?: string | null
          created_at?: string
          created_by?: string | null
          date_livraison?: string
          date_reception?: string | null
          entrepot_destination_id?: string | null
          fournisseur: string
          id?: string
          numero_bon: string
          numero_suivi?: string | null
          observations?: string | null
          point_vente_destination_id?: string | null
          statut?: string
          taux_tva?: number | null
          transit_douane?: number | null
          transporteur?: string | null
          updated_at?: string
        }
        Update: {
          bon_commande_id?: string | null
          created_at?: string
          created_by?: string | null
          date_livraison?: string
          date_reception?: string | null
          entrepot_destination_id?: string | null
          fournisseur?: string
          id?: string
          numero_bon?: string
          numero_suivi?: string | null
          observations?: string | null
          point_vente_destination_id?: string | null
          statut?: string
          taux_tva?: number | null
          transit_douane?: number | null
          transporteur?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "bons_de_livraison_bon_commande_id_fkey"
            columns: ["bon_commande_id"]
            isOneToOne: false
            referencedRelation: "bons_de_commande"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bons_de_livraison_entrepot_destination_id_fkey"
            columns: ["entrepot_destination_id"]
            isOneToOne: false
            referencedRelation: "entrepots"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bons_de_livraison_point_vente_destination_id_fkey"
            columns: ["point_vente_destination_id"]
            isOneToOne: false
            referencedRelation: "points_de_vente"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_bons_livraison_bon_commande_id"
            columns: ["bon_commande_id"]
            isOneToOne: false
            referencedRelation: "bons_de_commande"
            referencedColumns: ["id"]
          },
        ]
      }
      cash_operations: {
        Row: {
          commentaire: string | null
          created_at: string | null
          id: string
          montant: number
          point_vente_id: string | null
          type: string
          utilisateur_id: string | null
        }
        Insert: {
          commentaire?: string | null
          created_at?: string | null
          id?: string
          montant: number
          point_vente_id?: string | null
          type: string
          utilisateur_id?: string | null
        }
        Update: {
          commentaire?: string | null
          created_at?: string | null
          id?: string
          montant?: number
          point_vente_id?: string | null
          type?: string
          utilisateur_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "cash_operations_point_vente_id_fkey"
            columns: ["point_vente_id"]
            isOneToOne: false
            referencedRelation: "points_de_vente"
            referencedColumns: ["id"]
          },
        ]
      }
      cash_registers: {
        Row: {
          balance: number
          created_at: string
          id: string
          name: string
          status: Database["public"]["Enums"]["register_status"]
          updated_at: string
        }
        Insert: {
          balance?: number
          created_at?: string
          id?: string
          name: string
          status?: Database["public"]["Enums"]["register_status"]
          updated_at?: string
        }
        Update: {
          balance?: number
          created_at?: string
          id?: string
          name?: string
          status?: Database["public"]["Enums"]["register_status"]
          updated_at?: string
        }
        Relationships: []
      }
      catalogue: {
        Row: {
          autres_frais: number | null
          categorie: string | null
          categorie_id: string | null
          created_at: string
          description: string | null
          frais_bon_commande: number | null
          frais_douane: number | null
          frais_logistique: number | null
          frais_transport: number | null
          id: string
          image_url: string | null
          nom: string
          prix_achat: number | null
          prix_unitaire: number | null
          prix_vente: number | null
          reference: string
          seuil_alerte: number | null
          statut: string | null
          unite_id: string | null
          unite_mesure: string | null
          updated_at: string
        }
        Insert: {
          autres_frais?: number | null
          categorie?: string | null
          categorie_id?: string | null
          created_at?: string
          description?: string | null
          frais_bon_commande?: number | null
          frais_douane?: number | null
          frais_logistique?: number | null
          frais_transport?: number | null
          id?: string
          image_url?: string | null
          nom: string
          prix_achat?: number | null
          prix_unitaire?: number | null
          prix_vente?: number | null
          reference: string
          seuil_alerte?: number | null
          statut?: string | null
          unite_id?: string | null
          unite_mesure?: string | null
          updated_at?: string
        }
        Update: {
          autres_frais?: number | null
          categorie?: string | null
          categorie_id?: string | null
          created_at?: string
          description?: string | null
          frais_bon_commande?: number | null
          frais_douane?: number | null
          frais_logistique?: number | null
          frais_transport?: number | null
          id?: string
          image_url?: string | null
          nom?: string
          prix_achat?: number | null
          prix_unitaire?: number | null
          prix_vente?: number | null
          reference?: string
          seuil_alerte?: number | null
          statut?: string | null
          unite_id?: string | null
          unite_mesure?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "catalogue_categorie_id_fkey"
            columns: ["categorie_id"]
            isOneToOne: false
            referencedRelation: "categories_catalogue"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "catalogue_unite_id_fkey"
            columns: ["unite_id"]
            isOneToOne: false
            referencedRelation: "unites"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_catalogue_categorie"
            columns: ["categorie_id"]
            isOneToOne: false
            referencedRelation: "categories_catalogue"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_catalogue_unite"
            columns: ["unite_id"]
            isOneToOne: false
            referencedRelation: "unites"
            referencedColumns: ["id"]
          },
        ]
      }
      categories_catalogue: {
        Row: {
          couleur: string | null
          created_at: string
          description: string | null
          id: string
          nom: string
          statut: string | null
          updated_at: string
        }
        Insert: {
          couleur?: string | null
          created_at?: string
          description?: string | null
          id?: string
          nom: string
          statut?: string | null
          updated_at?: string
        }
        Update: {
          couleur?: string | null
          created_at?: string
          description?: string | null
          id?: string
          nom?: string
          statut?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      categories_depenses: {
        Row: {
          couleur: string | null
          created_at: string | null
          description: string | null
          id: string
          nom: string
          updated_at: string | null
        }
        Insert: {
          couleur?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          nom: string
          updated_at?: string | null
        }
        Update: {
          couleur?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          nom?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      categories_financieres: {
        Row: {
          couleur: string | null
          created_at: string | null
          description: string | null
          id: string
          nom: string
          type: string
          updated_at: string | null
        }
        Insert: {
          couleur?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          nom: string
          type: string
          updated_at?: string | null
        }
        Update: {
          couleur?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          nom?: string
          type?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      clients: {
        Row: {
          adresse: string | null
          code_postal: string | null
          created_at: string
          email: string | null
          id: string
          limite_credit: number | null
          nom: string
          nom_entreprise: string | null
          pays: string | null
          prenom: string | null
          statut_client: string | null
          telephone: string | null
          type_client: string | null
          updated_at: string
          ville: string | null
          whatsapp: string | null
        }
        Insert: {
          adresse?: string | null
          code_postal?: string | null
          created_at?: string
          email?: string | null
          id?: string
          limite_credit?: number | null
          nom: string
          nom_entreprise?: string | null
          pays?: string | null
          prenom?: string | null
          statut_client?: string | null
          telephone?: string | null
          type_client?: string | null
          updated_at?: string
          ville?: string | null
          whatsapp?: string | null
        }
        Update: {
          adresse?: string | null
          code_postal?: string | null
          created_at?: string
          email?: string | null
          id?: string
          limite_credit?: number | null
          nom?: string
          nom_entreprise?: string | null
          pays?: string | null
          prenom?: string | null
          statut_client?: string | null
          telephone?: string | null
          type_client?: string | null
          updated_at?: string
          ville?: string | null
          whatsapp?: string | null
        }
        Relationships: []
      }
      clotures_caisse: {
        Row: {
          balance_jour: number
          cash_register_id: string
          created_at: string | null
          date_cloture: string
          heure_cloture: string
          id: string
          nb_transactions: number
          observations: string | null
          solde_debut: number
          solde_fin: number
          total_entrees: number
          total_sorties: number
          updated_at: string | null
          utilisateur_cloture: string | null
        }
        Insert: {
          balance_jour?: number
          cash_register_id: string
          created_at?: string | null
          date_cloture?: string
          heure_cloture?: string
          id?: string
          nb_transactions?: number
          observations?: string | null
          solde_debut?: number
          solde_fin?: number
          total_entrees?: number
          total_sorties?: number
          updated_at?: string | null
          utilisateur_cloture?: string | null
        }
        Update: {
          balance_jour?: number
          cash_register_id?: string
          created_at?: string | null
          date_cloture?: string
          heure_cloture?: string
          id?: string
          nb_transactions?: number
          observations?: string | null
          solde_debut?: number
          solde_fin?: number
          total_entrees?: number
          total_sorties?: number
          updated_at?: string | null
          utilisateur_cloture?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "clotures_caisse_cash_register_id_fkey"
            columns: ["cash_register_id"]
            isOneToOne: false
            referencedRelation: "cash_registers"
            referencedColumns: ["id"]
          },
        ]
      }
      commandes_clients: {
        Row: {
          client_id: string | null
          created_at: string
          date_commande: string
          id: string
          mode_paiement: string | null
          montant_ht: number
          montant_ttc: number
          numero_commande: string
          observations: string | null
          statut: string
          taux_tva: number | null
          tva: number
          updated_at: string
        }
        Insert: {
          client_id?: string | null
          created_at?: string
          date_commande?: string
          id?: string
          mode_paiement?: string | null
          montant_ht?: number
          montant_ttc?: number
          numero_commande: string
          observations?: string | null
          statut?: string
          taux_tva?: number | null
          tva?: number
          updated_at?: string
        }
        Update: {
          client_id?: string | null
          created_at?: string
          date_commande?: string
          id?: string
          mode_paiement?: string | null
          montant_ht?: number
          montant_ttc?: number
          numero_commande?: string
          observations?: string | null
          statut?: string
          taux_tva?: number | null
          tva?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "commandes_clients_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      comptages_caisse: {
        Row: {
          cash_register_id: string
          created_at: string | null
          date_comptage: string
          details_coupures: Json | null
          ecart: number | null
          id: string
          montant_reel: number
          montant_theorique: number
          observations: string | null
          type_comptage: string | null
          utilisateur_comptage: string | null
        }
        Insert: {
          cash_register_id: string
          created_at?: string | null
          date_comptage?: string
          details_coupures?: Json | null
          ecart?: number | null
          id?: string
          montant_reel?: number
          montant_theorique?: number
          observations?: string | null
          type_comptage?: string | null
          utilisateur_comptage?: string | null
        }
        Update: {
          cash_register_id?: string
          created_at?: string | null
          date_comptage?: string
          details_coupures?: Json | null
          ecart?: number | null
          id?: string
          montant_reel?: number
          montant_theorique?: number
          observations?: string | null
          type_comptage?: string | null
          utilisateur_comptage?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "comptages_caisse_cash_register_id_fkey"
            columns: ["cash_register_id"]
            isOneToOne: false
            referencedRelation: "cash_registers"
            referencedColumns: ["id"]
          },
        ]
      }
      devis_vente: {
        Row: {
          client_id: string
          created_at: string
          date_devis: string
          date_validite: string | null
          id: string
          montant_ht: number
          montant_ttc: number
          numero_devis: string
          observations: string | null
          statut: string
          taux_tva: number | null
          tva: number
          updated_at: string
        }
        Insert: {
          client_id: string
          created_at?: string
          date_devis?: string
          date_validite?: string | null
          id?: string
          montant_ht?: number
          montant_ttc?: number
          numero_devis: string
          observations?: string | null
          statut?: string
          taux_tva?: number | null
          tva?: number
          updated_at?: string
        }
        Update: {
          client_id?: string
          created_at?: string
          date_devis?: string
          date_validite?: string | null
          id?: string
          montant_ht?: number
          montant_ttc?: number
          numero_devis?: string
          observations?: string | null
          statut?: string
          taux_tva?: number | null
          tva?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "devis_vente_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      entrees_stock: {
        Row: {
          article_id: string | null
          created_at: string
          created_by: string | null
          entrepot_id: string | null
          fournisseur: string | null
          id: string
          numero_bon: string | null
          observations: string | null
          point_vente_id: string | null
          prix_unitaire: number | null
          quantite: number
          type_entree: string
        }
        Insert: {
          article_id?: string | null
          created_at?: string
          created_by?: string | null
          entrepot_id?: string | null
          fournisseur?: string | null
          id?: string
          numero_bon?: string | null
          observations?: string | null
          point_vente_id?: string | null
          prix_unitaire?: number | null
          quantite: number
          type_entree: string
        }
        Update: {
          article_id?: string | null
          created_at?: string
          created_by?: string | null
          entrepot_id?: string | null
          fournisseur?: string | null
          id?: string
          numero_bon?: string | null
          observations?: string | null
          point_vente_id?: string | null
          prix_unitaire?: number | null
          quantite?: number
          type_entree?: string
        }
        Relationships: [
          {
            foreignKeyName: "entrees_stock_article_id_fkey"
            columns: ["article_id"]
            isOneToOne: false
            referencedRelation: "catalogue"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "entrees_stock_article_id_fkey"
            columns: ["article_id"]
            isOneToOne: false
            referencedRelation: "vue_catalogue_optimise"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "entrees_stock_article_id_fkey"
            columns: ["article_id"]
            isOneToOne: false
            referencedRelation: "vue_marges_articles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "entrees_stock_article_id_fkey"
            columns: ["article_id"]
            isOneToOne: false
            referencedRelation: "vue_marges_frais"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "entrees_stock_article_id_fkey"
            columns: ["article_id"]
            isOneToOne: false
            referencedRelation: "vue_marges_globales_stock"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "entrees_stock_entrepot_id_fkey"
            columns: ["entrepot_id"]
            isOneToOne: false
            referencedRelation: "entrepots"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "entrees_stock_point_vente_id_fkey"
            columns: ["point_vente_id"]
            isOneToOne: false
            referencedRelation: "points_de_vente"
            referencedColumns: ["id"]
          },
        ]
      }
      entrepots: {
        Row: {
          adresse: string | null
          capacite_max: number | null
          created_at: string
          gestionnaire: string | null
          id: string
          nom: string
          statut: string | null
          updated_at: string
        }
        Insert: {
          adresse?: string | null
          capacite_max?: number | null
          created_at?: string
          gestionnaire?: string | null
          id?: string
          nom: string
          statut?: string | null
          updated_at?: string
        }
        Update: {
          adresse?: string | null
          capacite_max?: number | null
          created_at?: string
          gestionnaire?: string | null
          id?: string
          nom?: string
          statut?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      etats_caisse: {
        Row: {
          cash_register_id: string
          created_at: string | null
          date_etat: string
          donnees_etat: Json
          heure_generation: string
          id: string
          type_etat: string
          utilisateur_generation: string | null
        }
        Insert: {
          cash_register_id: string
          created_at?: string | null
          date_etat?: string
          donnees_etat: Json
          heure_generation?: string
          id?: string
          type_etat: string
          utilisateur_generation?: string | null
        }
        Update: {
          cash_register_id?: string
          created_at?: string | null
          date_etat?: string
          donnees_etat?: Json
          heure_generation?: string
          id?: string
          type_etat?: string
          utilisateur_generation?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "etats_caisse_cash_register_id_fkey"
            columns: ["cash_register_id"]
            isOneToOne: false
            referencedRelation: "cash_registers"
            referencedColumns: ["id"]
          },
        ]
      }
      factures_achat: {
        Row: {
          bon_commande_id: string | null
          bon_livraison_id: string | null
          created_at: string
          created_by: string | null
          date_echeance: string | null
          date_facture: string
          date_paiement: string | null
          fournisseur: string
          fournisseur_id: string | null
          id: string
          mode_paiement: string | null
          montant_ht: number
          montant_ttc: number
          numero_facture: string
          observations: string | null
          statut_paiement: string
          taux_tva: number | null
          transit_douane: number | null
          tva: number
          updated_at: string
        }
        Insert: {
          bon_commande_id?: string | null
          bon_livraison_id?: string | null
          created_at?: string
          created_by?: string | null
          date_echeance?: string | null
          date_facture?: string
          date_paiement?: string | null
          fournisseur: string
          fournisseur_id?: string | null
          id?: string
          mode_paiement?: string | null
          montant_ht?: number
          montant_ttc?: number
          numero_facture: string
          observations?: string | null
          statut_paiement?: string
          taux_tva?: number | null
          transit_douane?: number | null
          tva?: number
          updated_at?: string
        }
        Update: {
          bon_commande_id?: string | null
          bon_livraison_id?: string | null
          created_at?: string
          created_by?: string | null
          date_echeance?: string | null
          date_facture?: string
          date_paiement?: string | null
          fournisseur?: string
          fournisseur_id?: string | null
          id?: string
          mode_paiement?: string | null
          montant_ht?: number
          montant_ttc?: number
          numero_facture?: string
          observations?: string | null
          statut_paiement?: string
          taux_tva?: number | null
          transit_douane?: number | null
          tva?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "factures_achat_bon_commande_id_fkey"
            columns: ["bon_commande_id"]
            isOneToOne: false
            referencedRelation: "bons_de_commande"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "factures_achat_bon_livraison_id_fkey"
            columns: ["bon_livraison_id"]
            isOneToOne: false
            referencedRelation: "bons_de_livraison"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_factures_achat_fournisseur"
            columns: ["fournisseur_id"]
            isOneToOne: false
            referencedRelation: "fournisseurs"
            referencedColumns: ["id"]
          },
        ]
      }
      factures_precommandes: {
        Row: {
          client_id: string
          created_at: string
          date_facture: string
          id: string
          montant_ht: number
          montant_ttc: number
          numero_facture: string
          observations: string | null
          precommande_id: string
          statut_paiement: string
          tva: number
          type_facture: string
          updated_at: string
        }
        Insert: {
          client_id: string
          created_at?: string
          date_facture?: string
          id?: string
          montant_ht?: number
          montant_ttc?: number
          numero_facture: string
          observations?: string | null
          precommande_id: string
          statut_paiement?: string
          tva?: number
          type_facture?: string
          updated_at?: string
        }
        Update: {
          client_id?: string
          created_at?: string
          date_facture?: string
          id?: string
          montant_ht?: number
          montant_ttc?: number
          numero_facture?: string
          observations?: string | null
          precommande_id?: string
          statut_paiement?: string
          tva?: number
          type_facture?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "factures_precommandes_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "factures_precommandes_precommande_id_fkey"
            columns: ["precommande_id"]
            isOneToOne: false
            referencedRelation: "precommandes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "factures_precommandes_precommande_id_fkey"
            columns: ["precommande_id"]
            isOneToOne: false
            referencedRelation: "vue_precommandes_pretes"
            referencedColumns: ["id"]
          },
        ]
      }
      factures_vente: {
        Row: {
          client_id: string
          commande_id: string | null
          created_at: string
          date_echeance: string | null
          date_facture: string
          date_paiement: string | null
          id: string
          mode_paiement: string | null
          montant_ht: number
          montant_ttc: number
          numero_facture: string
          observations: string | null
          remise_totale: number | null
          statut_livraison:
            | Database["public"]["Enums"]["statut_livraison_enum"]
            | null
          statut_livraison_id: number
          statut_paiement: string
          taux_tva: number | null
          tva: number
          updated_at: string
        }
        Insert: {
          client_id: string
          commande_id?: string | null
          created_at?: string
          date_echeance?: string | null
          date_facture?: string
          date_paiement?: string | null
          id?: string
          mode_paiement?: string | null
          montant_ht?: number
          montant_ttc?: number
          numero_facture: string
          observations?: string | null
          remise_totale?: number | null
          statut_livraison?:
            | Database["public"]["Enums"]["statut_livraison_enum"]
            | null
          statut_livraison_id: number
          statut_paiement?: string
          taux_tva?: number | null
          tva?: number
          updated_at?: string
        }
        Update: {
          client_id?: string
          commande_id?: string | null
          created_at?: string
          date_echeance?: string | null
          date_facture?: string
          date_paiement?: string | null
          id?: string
          mode_paiement?: string | null
          montant_ht?: number
          montant_ttc?: number
          numero_facture?: string
          observations?: string | null
          remise_totale?: number | null
          statut_livraison?:
            | Database["public"]["Enums"]["statut_livraison_enum"]
            | null
          statut_livraison_id?: number
          statut_paiement?: string
          taux_tva?: number | null
          tva?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "factures_vente_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "factures_vente_commande_id_fkey"
            columns: ["commande_id"]
            isOneToOne: false
            referencedRelation: "commandes_clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_factures_vente_statut_livraison"
            columns: ["statut_livraison_id"]
            isOneToOne: false
            referencedRelation: "livraison_statut"
            referencedColumns: ["id"]
          },
        ]
      }
      fournisseurs: {
        Row: {
          adresse: string | null
          adresse_complete: string | null
          boite_postale: string | null
          contact_principal: string | null
          created_at: string
          email: string | null
          id: string
          nom: string | null
          nom_entreprise: string | null
          pays_id: string | null
          site_web: string | null
          statut: string | null
          telephone: string | null
          telephone_fixe: string | null
          telephone_mobile: string | null
          updated_at: string
          ville_id: string | null
          ville_personnalisee: string | null
        }
        Insert: {
          adresse?: string | null
          adresse_complete?: string | null
          boite_postale?: string | null
          contact_principal?: string | null
          created_at?: string
          email?: string | null
          id?: string
          nom?: string | null
          nom_entreprise?: string | null
          pays_id?: string | null
          site_web?: string | null
          statut?: string | null
          telephone?: string | null
          telephone_fixe?: string | null
          telephone_mobile?: string | null
          updated_at?: string
          ville_id?: string | null
          ville_personnalisee?: string | null
        }
        Update: {
          adresse?: string | null
          adresse_complete?: string | null
          boite_postale?: string | null
          contact_principal?: string | null
          created_at?: string
          email?: string | null
          id?: string
          nom?: string | null
          nom_entreprise?: string | null
          pays_id?: string | null
          site_web?: string | null
          statut?: string | null
          telephone?: string | null
          telephone_fixe?: string | null
          telephone_mobile?: string | null
          updated_at?: string
          ville_id?: string | null
          ville_personnalisee?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fournisseurs_pays_id_fkey"
            columns: ["pays_id"]
            isOneToOne: false
            referencedRelation: "pays"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fournisseurs_ville_id_fkey"
            columns: ["ville_id"]
            isOneToOne: false
            referencedRelation: "villes"
            referencedColumns: ["id"]
          },
        ]
      }
      lignes_commande: {
        Row: {
          article_id: string | null
          commande_id: string | null
          created_at: string
          id: string
          montant_ligne: number
          prix_unitaire: number
          quantite: number
        }
        Insert: {
          article_id?: string | null
          commande_id?: string | null
          created_at?: string
          id?: string
          montant_ligne: number
          prix_unitaire: number
          quantite: number
        }
        Update: {
          article_id?: string | null
          commande_id?: string | null
          created_at?: string
          id?: string
          montant_ligne?: number
          prix_unitaire?: number
          quantite?: number
        }
        Relationships: [
          {
            foreignKeyName: "lignes_commande_article_id_fkey"
            columns: ["article_id"]
            isOneToOne: false
            referencedRelation: "catalogue"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lignes_commande_article_id_fkey"
            columns: ["article_id"]
            isOneToOne: false
            referencedRelation: "vue_catalogue_optimise"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lignes_commande_article_id_fkey"
            columns: ["article_id"]
            isOneToOne: false
            referencedRelation: "vue_marges_articles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lignes_commande_article_id_fkey"
            columns: ["article_id"]
            isOneToOne: false
            referencedRelation: "vue_marges_frais"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lignes_commande_article_id_fkey"
            columns: ["article_id"]
            isOneToOne: false
            referencedRelation: "vue_marges_globales_stock"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lignes_commande_commande_id_fkey"
            columns: ["commande_id"]
            isOneToOne: false
            referencedRelation: "commandes_clients"
            referencedColumns: ["id"]
          },
        ]
      }
      lignes_devis: {
        Row: {
          article_id: string | null
          created_at: string
          devis_id: string | null
          id: string
          montant_ligne: number
          prix_unitaire: number
          quantite: number
        }
        Insert: {
          article_id?: string | null
          created_at?: string
          devis_id?: string | null
          id?: string
          montant_ligne: number
          prix_unitaire: number
          quantite: number
        }
        Update: {
          article_id?: string | null
          created_at?: string
          devis_id?: string | null
          id?: string
          montant_ligne?: number
          prix_unitaire?: number
          quantite?: number
        }
        Relationships: [
          {
            foreignKeyName: "lignes_devis_article_id_fkey"
            columns: ["article_id"]
            isOneToOne: false
            referencedRelation: "catalogue"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lignes_devis_article_id_fkey"
            columns: ["article_id"]
            isOneToOne: false
            referencedRelation: "vue_catalogue_optimise"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lignes_devis_article_id_fkey"
            columns: ["article_id"]
            isOneToOne: false
            referencedRelation: "vue_marges_articles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lignes_devis_article_id_fkey"
            columns: ["article_id"]
            isOneToOne: false
            referencedRelation: "vue_marges_frais"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lignes_devis_article_id_fkey"
            columns: ["article_id"]
            isOneToOne: false
            referencedRelation: "vue_marges_globales_stock"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lignes_devis_devis_id_fkey"
            columns: ["devis_id"]
            isOneToOne: false
            referencedRelation: "devis_vente"
            referencedColumns: ["id"]
          },
        ]
      }
      lignes_facture_vente: {
        Row: {
          article_id: string
          created_at: string | null
          facture_vente_id: string
          id: string
          montant_ligne: number | null
          prix_unitaire_brut: number
          quantite: number
          quantite_livree: number | null
          remise_unitaire: number | null
          statut_livraison: string | null
        }
        Insert: {
          article_id: string
          created_at?: string | null
          facture_vente_id: string
          id?: string
          montant_ligne?: number | null
          prix_unitaire_brut?: number
          quantite?: number
          quantite_livree?: number | null
          remise_unitaire?: number | null
          statut_livraison?: string | null
        }
        Update: {
          article_id?: string
          created_at?: string | null
          facture_vente_id?: string
          id?: string
          montant_ligne?: number | null
          prix_unitaire_brut?: number
          quantite?: number
          quantite_livree?: number | null
          remise_unitaire?: number | null
          statut_livraison?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "lignes_facture_vente_article_id_fkey"
            columns: ["article_id"]
            isOneToOne: false
            referencedRelation: "catalogue"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lignes_facture_vente_article_id_fkey"
            columns: ["article_id"]
            isOneToOne: false
            referencedRelation: "vue_catalogue_optimise"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lignes_facture_vente_article_id_fkey"
            columns: ["article_id"]
            isOneToOne: false
            referencedRelation: "vue_marges_articles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lignes_facture_vente_article_id_fkey"
            columns: ["article_id"]
            isOneToOne: false
            referencedRelation: "vue_marges_frais"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lignes_facture_vente_article_id_fkey"
            columns: ["article_id"]
            isOneToOne: false
            referencedRelation: "vue_marges_globales_stock"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lignes_facture_vente_facture_vente_id_fkey"
            columns: ["facture_vente_id"]
            isOneToOne: false
            referencedRelation: "factures_vente"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lignes_facture_vente_facture_vente_id_fkey"
            columns: ["facture_vente_id"]
            isOneToOne: false
            referencedRelation: "vue_facture_vente_detaillee"
            referencedColumns: ["facture_id"]
          },
          {
            foreignKeyName: "lignes_facture_vente_facture_vente_id_fkey"
            columns: ["facture_vente_id"]
            isOneToOne: false
            referencedRelation: "vue_factures_vente_summary"
            referencedColumns: ["facture_id"]
          },
        ]
      }
      lignes_precommande: {
        Row: {
          article_id: string | null
          created_at: string
          id: string
          montant_ligne: number
          precommande_id: string | null
          prix_unitaire: number
          quantite: number
          quantite_livree: number | null
          statut_ligne: string | null
          updated_at: string | null
        }
        Insert: {
          article_id?: string | null
          created_at?: string
          id?: string
          montant_ligne: number
          precommande_id?: string | null
          prix_unitaire: number
          quantite: number
          quantite_livree?: number | null
          statut_ligne?: string | null
          updated_at?: string | null
        }
        Update: {
          article_id?: string | null
          created_at?: string
          id?: string
          montant_ligne?: number
          precommande_id?: string | null
          prix_unitaire?: number
          quantite?: number
          quantite_livree?: number | null
          statut_ligne?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "lignes_precommande_article_id_fkey"
            columns: ["article_id"]
            isOneToOne: false
            referencedRelation: "catalogue"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lignes_precommande_article_id_fkey"
            columns: ["article_id"]
            isOneToOne: false
            referencedRelation: "vue_catalogue_optimise"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lignes_precommande_article_id_fkey"
            columns: ["article_id"]
            isOneToOne: false
            referencedRelation: "vue_marges_articles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lignes_precommande_article_id_fkey"
            columns: ["article_id"]
            isOneToOne: false
            referencedRelation: "vue_marges_frais"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lignes_precommande_article_id_fkey"
            columns: ["article_id"]
            isOneToOne: false
            referencedRelation: "vue_marges_globales_stock"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lignes_precommande_precommande_id_fkey"
            columns: ["precommande_id"]
            isOneToOne: false
            referencedRelation: "precommandes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lignes_precommande_precommande_id_fkey"
            columns: ["precommande_id"]
            isOneToOne: false
            referencedRelation: "vue_precommandes_pretes"
            referencedColumns: ["id"]
          },
        ]
      }
      livraison_statut: {
        Row: {
          id: number
          nom: string
        }
        Insert: {
          id?: number
          nom: string
        }
        Update: {
          id?: number
          nom?: string
        }
        Relationships: []
      }
      menus: {
        Row: {
          created_at: string | null
          icone: string | null
          id: string
          nom: string
          ordre: number | null
          statut: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          icone?: string | null
          id?: string
          nom: string
          ordre?: number | null
          statut?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          icone?: string | null
          id?: string
          nom?: string
          ordre?: number | null
          statut?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      notifications_precommandes: {
        Row: {
          created_at: string
          date_creation: string
          date_envoi: string | null
          id: string
          message: string
          precommande_id: string | null
          statut: string | null
          type_notification: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          date_creation?: string
          date_envoi?: string | null
          id?: string
          message: string
          precommande_id?: string | null
          statut?: string | null
          type_notification: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          date_creation?: string
          date_envoi?: string | null
          id?: string
          message?: string
          precommande_id?: string | null
          statut?: string | null
          type_notification?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_precommandes_precommande_id_fkey"
            columns: ["precommande_id"]
            isOneToOne: false
            referencedRelation: "precommandes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notifications_precommandes_precommande_id_fkey"
            columns: ["precommande_id"]
            isOneToOne: false
            referencedRelation: "vue_precommandes_pretes"
            referencedColumns: ["id"]
          },
        ]
      }
      paiements_vente: {
        Row: {
          created_at: string | null
          date_paiement: string | null
          facture_vente_id: string
          id: string
          montant: number
          moyen_paiement: string | null
        }
        Insert: {
          created_at?: string | null
          date_paiement?: string | null
          facture_vente_id: string
          id?: string
          montant: number
          moyen_paiement?: string | null
        }
        Update: {
          created_at?: string | null
          date_paiement?: string | null
          facture_vente_id?: string
          id?: string
          montant?: number
          moyen_paiement?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "paiements_vente_facture_vente_id_fkey"
            columns: ["facture_vente_id"]
            isOneToOne: false
            referencedRelation: "factures_vente"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "paiements_vente_facture_vente_id_fkey"
            columns: ["facture_vente_id"]
            isOneToOne: false
            referencedRelation: "vue_facture_vente_detaillee"
            referencedColumns: ["facture_id"]
          },
          {
            foreignKeyName: "paiements_vente_facture_vente_id_fkey"
            columns: ["facture_vente_id"]
            isOneToOne: false
            referencedRelation: "vue_factures_vente_summary"
            referencedColumns: ["facture_id"]
          },
        ]
      }
      password_reset_requests: {
        Row: {
          created_at: string | null
          expires_at: string | null
          id: string
          new_password_hash: string
          require_change: boolean | null
          used: boolean | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          expires_at?: string | null
          id?: string
          new_password_hash: string
          require_change?: boolean | null
          used?: boolean | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          expires_at?: string | null
          id?: string
          new_password_hash?: string
          require_change?: boolean | null
          used?: boolean | null
          user_id?: string
        }
        Relationships: []
      }
      pays: {
        Row: {
          code_iso: string
          created_at: string
          id: string
          indicatif_tel: string | null
          nom: string
        }
        Insert: {
          code_iso: string
          created_at?: string
          id?: string
          indicatif_tel?: string | null
          nom: string
        }
        Update: {
          code_iso?: string
          created_at?: string
          id?: string
          indicatif_tel?: string | null
          nom?: string
        }
        Relationships: []
      }
      permissions: {
        Row: {
          action: string
          created_at: string
          description: string | null
          id: string
          menu: string
          menu_id: string | null
          sous_menu_id: string | null
          submenu: string | null
        }
        Insert: {
          action: string
          created_at?: string
          description?: string | null
          id?: string
          menu: string
          menu_id?: string | null
          sous_menu_id?: string | null
          submenu?: string | null
        }
        Update: {
          action?: string
          created_at?: string
          description?: string | null
          id?: string
          menu?: string
          menu_id?: string | null
          sous_menu_id?: string | null
          submenu?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "permissions_menu_id_fkey"
            columns: ["menu_id"]
            isOneToOne: false
            referencedRelation: "menus"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "permissions_sous_menu_id_fkey"
            columns: ["sous_menu_id"]
            isOneToOne: false
            referencedRelation: "sous_menus"
            referencedColumns: ["id"]
          },
        ]
      }
      points_de_vente: {
        Row: {
          adresse: string | null
          created_at: string
          id: string
          nom: string
          responsable: string | null
          statut: string | null
          type_pdv: string | null
          updated_at: string
        }
        Insert: {
          adresse?: string | null
          created_at?: string
          id?: string
          nom: string
          responsable?: string | null
          statut?: string | null
          type_pdv?: string | null
          updated_at?: string
        }
        Update: {
          adresse?: string | null
          created_at?: string
          id?: string
          nom?: string
          responsable?: string | null
          statut?: string | null
          type_pdv?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      precommandes: {
        Row: {
          acompte_verse: number | null
          amount_due: number | null
          amount_paid: number | null
          bon_livraison_genere: boolean | null
          bon_livraison_id: string | null
          client_id: string
          created_at: string
          date_livraison_prevue: string | null
          date_notification: string | null
          date_precommande: string
          id: string
          montant_ht: number
          montant_ttc: number
          notification_envoyee: boolean | null
          numero_precommande: string
          observations: string | null
          payment_status: string | null
          prete_pour_conversion: boolean | null
          reste_a_payer: number | null
          statut: string
          statut_livraison: string | null
          stock_status: string | null
          taux_tva: number | null
          total_commande: number | null
          tva: number
          updated_at: string
        }
        Insert: {
          acompte_verse?: number | null
          amount_due?: number | null
          amount_paid?: number | null
          bon_livraison_genere?: boolean | null
          bon_livraison_id?: string | null
          client_id: string
          created_at?: string
          date_livraison_prevue?: string | null
          date_notification?: string | null
          date_precommande?: string
          id?: string
          montant_ht?: number
          montant_ttc?: number
          notification_envoyee?: boolean | null
          numero_precommande: string
          observations?: string | null
          payment_status?: string | null
          prete_pour_conversion?: boolean | null
          reste_a_payer?: number | null
          statut?: string
          statut_livraison?: string | null
          stock_status?: string | null
          taux_tva?: number | null
          total_commande?: number | null
          tva?: number
          updated_at?: string
        }
        Update: {
          acompte_verse?: number | null
          amount_due?: number | null
          amount_paid?: number | null
          bon_livraison_genere?: boolean | null
          bon_livraison_id?: string | null
          client_id?: string
          created_at?: string
          date_livraison_prevue?: string | null
          date_notification?: string | null
          date_precommande?: string
          id?: string
          montant_ht?: number
          montant_ttc?: number
          notification_envoyee?: boolean | null
          numero_precommande?: string
          observations?: string | null
          payment_status?: string | null
          prete_pour_conversion?: boolean | null
          reste_a_payer?: number | null
          statut?: string
          statut_livraison?: string | null
          stock_status?: string | null
          taux_tva?: number | null
          total_commande?: number | null
          tva?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "precommandes_bon_livraison_id_fkey"
            columns: ["bon_livraison_id"]
            isOneToOne: false
            referencedRelation: "bons_de_livraison"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "precommandes_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          created_at: string
          id: string
          nom: string | null
          prenom: string | null
          telephone: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          id?: string
          nom?: string | null
          prenom?: string | null
          telephone?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          id?: string
          nom?: string | null
          prenom?: string | null
          telephone?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      reglements_achat: {
        Row: {
          created_at: string
          created_by: string | null
          date_reglement: string
          facture_achat_id: string
          id: string
          mode_paiement: string
          montant: number
          observations: string | null
          reference_paiement: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          date_reglement?: string
          facture_achat_id: string
          id?: string
          mode_paiement: string
          montant?: number
          observations?: string | null
          reference_paiement?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          date_reglement?: string
          facture_achat_id?: string
          id?: string
          mode_paiement?: string
          montant?: number
          observations?: string | null
          reference_paiement?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_reglements_achat_facture"
            columns: ["facture_achat_id"]
            isOneToOne: false
            referencedRelation: "factures_achat"
            referencedColumns: ["id"]
          },
        ]
      }
      retours_clients: {
        Row: {
          client_id: string
          created_at: string
          date_remboursement: string | null
          date_retour: string
          facture_id: string | null
          id: string
          mode_remboursement: string | null
          montant_retour: number
          motif_retour: string
          numero_retour: string
          observations: string | null
          statut: string
          updated_at: string
        }
        Insert: {
          client_id: string
          created_at?: string
          date_remboursement?: string | null
          date_retour?: string
          facture_id?: string | null
          id?: string
          mode_remboursement?: string | null
          montant_retour?: number
          motif_retour: string
          numero_retour: string
          observations?: string | null
          statut?: string
          updated_at?: string
        }
        Update: {
          client_id?: string
          created_at?: string
          date_remboursement?: string | null
          date_retour?: string
          facture_id?: string | null
          id?: string
          mode_remboursement?: string | null
          montant_retour?: number
          motif_retour?: string
          numero_retour?: string
          observations?: string | null
          statut?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "retours_clients_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "retours_clients_facture_id_fkey"
            columns: ["facture_id"]
            isOneToOne: false
            referencedRelation: "factures_vente"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "retours_clients_facture_id_fkey"
            columns: ["facture_id"]
            isOneToOne: false
            referencedRelation: "vue_facture_vente_detaillee"
            referencedColumns: ["facture_id"]
          },
          {
            foreignKeyName: "retours_clients_facture_id_fkey"
            columns: ["facture_id"]
            isOneToOne: false
            referencedRelation: "vue_factures_vente_summary"
            referencedColumns: ["facture_id"]
          },
        ]
      }
      retours_fournisseurs: {
        Row: {
          created_at: string
          created_by: string | null
          date_remboursement: string | null
          date_retour: string
          facture_achat_id: string | null
          fournisseur: string
          id: string
          mode_remboursement: string | null
          montant_retour: number
          motif_retour: string
          numero_retour: string
          observations: string | null
          statut: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          date_remboursement?: string | null
          date_retour?: string
          facture_achat_id?: string | null
          fournisseur: string
          id?: string
          mode_remboursement?: string | null
          montant_retour?: number
          motif_retour: string
          numero_retour: string
          observations?: string | null
          statut?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          date_remboursement?: string | null
          date_retour?: string
          facture_achat_id?: string | null
          fournisseur?: string
          id?: string
          mode_remboursement?: string | null
          montant_retour?: number
          motif_retour?: string
          numero_retour?: string
          observations?: string | null
          statut?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "retours_fournisseurs_facture_achat_id_fkey"
            columns: ["facture_achat_id"]
            isOneToOne: false
            referencedRelation: "factures_achat"
            referencedColumns: ["id"]
          },
        ]
      }
      role_permissions: {
        Row: {
          can_access: boolean | null
          created_at: string
          id: string
          permission_id: string
          role_id: string
        }
        Insert: {
          can_access?: boolean | null
          created_at?: string
          id?: string
          permission_id: string
          role_id: string
        }
        Update: {
          can_access?: boolean | null
          created_at?: string
          id?: string
          permission_id?: string
          role_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "role_permissions_permission_id_fkey"
            columns: ["permission_id"]
            isOneToOne: false
            referencedRelation: "permissions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "role_permissions_role_id_fkey"
            columns: ["role_id"]
            isOneToOne: false
            referencedRelation: "roles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "role_permissions_role_id_fkey"
            columns: ["role_id"]
            isOneToOne: false
            referencedRelation: "vue_permissions_utilisateurs"
            referencedColumns: ["role_id"]
          },
        ]
      }
      roles: {
        Row: {
          created_at: string
          description: string | null
          id: string
          is_system: boolean
          is_system_role: boolean | null
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          is_system?: boolean
          is_system_role?: boolean | null
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          is_system?: boolean
          is_system_role?: boolean | null
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      sorties_financieres: {
        Row: {
          categorie_id: string | null
          created_at: string | null
          date_sortie: string
          description: string
          id: string
          montant: number
          updated_at: string | null
        }
        Insert: {
          categorie_id?: string | null
          created_at?: string | null
          date_sortie?: string
          description: string
          id?: string
          montant: number
          updated_at?: string | null
        }
        Update: {
          categorie_id?: string | null
          created_at?: string | null
          date_sortie?: string
          description?: string
          id?: string
          montant?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "sorties_financieres_categorie_id_fkey"
            columns: ["categorie_id"]
            isOneToOne: false
            referencedRelation: "categories_depenses"
            referencedColumns: ["id"]
          },
        ]
      }
      sorties_stock: {
        Row: {
          article_id: string | null
          created_at: string
          created_by: string | null
          destination: string | null
          entrepot_id: string | null
          id: string
          numero_bon: string | null
          observations: string | null
          quantite: number
          type_sortie: string
        }
        Insert: {
          article_id?: string | null
          created_at?: string
          created_by?: string | null
          destination?: string | null
          entrepot_id?: string | null
          id?: string
          numero_bon?: string | null
          observations?: string | null
          quantite: number
          type_sortie: string
        }
        Update: {
          article_id?: string | null
          created_at?: string
          created_by?: string | null
          destination?: string | null
          entrepot_id?: string | null
          id?: string
          numero_bon?: string | null
          observations?: string | null
          quantite?: number
          type_sortie?: string
        }
        Relationships: [
          {
            foreignKeyName: "sorties_stock_article_id_fkey"
            columns: ["article_id"]
            isOneToOne: false
            referencedRelation: "catalogue"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sorties_stock_article_id_fkey"
            columns: ["article_id"]
            isOneToOne: false
            referencedRelation: "vue_catalogue_optimise"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sorties_stock_article_id_fkey"
            columns: ["article_id"]
            isOneToOne: false
            referencedRelation: "vue_marges_articles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sorties_stock_article_id_fkey"
            columns: ["article_id"]
            isOneToOne: false
            referencedRelation: "vue_marges_frais"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sorties_stock_article_id_fkey"
            columns: ["article_id"]
            isOneToOne: false
            referencedRelation: "vue_marges_globales_stock"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sorties_stock_entrepot_id_fkey"
            columns: ["entrepot_id"]
            isOneToOne: false
            referencedRelation: "entrepots"
            referencedColumns: ["id"]
          },
        ]
      }
      sous_menus: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          menu_id: string
          nom: string
          ordre: number | null
          statut: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          menu_id: string
          nom: string
          ordre?: number | null
          statut?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          menu_id?: string
          nom?: string
          ordre?: number | null
          statut?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "sous_menus_menu_id_fkey"
            columns: ["menu_id"]
            isOneToOne: false
            referencedRelation: "menus"
            referencedColumns: ["id"]
          },
        ]
      }
      stock_pdv: {
        Row: {
          article_id: string | null
          created_at: string
          derniere_livraison: string | null
          id: string
          point_vente_id: string | null
          quantite_disponible: number
          quantite_minimum: number | null
          updated_at: string
        }
        Insert: {
          article_id?: string | null
          created_at?: string
          derniere_livraison?: string | null
          id?: string
          point_vente_id?: string | null
          quantite_disponible?: number
          quantite_minimum?: number | null
          updated_at?: string
        }
        Update: {
          article_id?: string | null
          created_at?: string
          derniere_livraison?: string | null
          id?: string
          point_vente_id?: string | null
          quantite_disponible?: number
          quantite_minimum?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_stock_pdv_article"
            columns: ["article_id"]
            isOneToOne: false
            referencedRelation: "catalogue"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_stock_pdv_article"
            columns: ["article_id"]
            isOneToOne: false
            referencedRelation: "vue_catalogue_optimise"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_stock_pdv_article"
            columns: ["article_id"]
            isOneToOne: false
            referencedRelation: "vue_marges_articles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_stock_pdv_article"
            columns: ["article_id"]
            isOneToOne: false
            referencedRelation: "vue_marges_frais"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_stock_pdv_article"
            columns: ["article_id"]
            isOneToOne: false
            referencedRelation: "vue_marges_globales_stock"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_stock_pdv_point_vente"
            columns: ["point_vente_id"]
            isOneToOne: false
            referencedRelation: "points_de_vente"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stock_pdv_article_id_fkey"
            columns: ["article_id"]
            isOneToOne: false
            referencedRelation: "catalogue"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stock_pdv_article_id_fkey"
            columns: ["article_id"]
            isOneToOne: false
            referencedRelation: "vue_catalogue_optimise"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stock_pdv_article_id_fkey"
            columns: ["article_id"]
            isOneToOne: false
            referencedRelation: "vue_marges_articles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stock_pdv_article_id_fkey"
            columns: ["article_id"]
            isOneToOne: false
            referencedRelation: "vue_marges_frais"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stock_pdv_article_id_fkey"
            columns: ["article_id"]
            isOneToOne: false
            referencedRelation: "vue_marges_globales_stock"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stock_pdv_point_vente_id_fkey"
            columns: ["point_vente_id"]
            isOneToOne: false
            referencedRelation: "points_de_vente"
            referencedColumns: ["id"]
          },
        ]
      }
      stock_principal: {
        Row: {
          article_id: string | null
          created_at: string
          derniere_entree: string | null
          derniere_sortie: string | null
          emplacement: string | null
          entrepot_id: string | null
          id: string
          quantite_disponible: number
          quantite_reservee: number
          updated_at: string
        }
        Insert: {
          article_id?: string | null
          created_at?: string
          derniere_entree?: string | null
          derniere_sortie?: string | null
          emplacement?: string | null
          entrepot_id?: string | null
          id?: string
          quantite_disponible?: number
          quantite_reservee?: number
          updated_at?: string
        }
        Update: {
          article_id?: string | null
          created_at?: string
          derniere_entree?: string | null
          derniere_sortie?: string | null
          emplacement?: string | null
          entrepot_id?: string | null
          id?: string
          quantite_disponible?: number
          quantite_reservee?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_stock_principal_article"
            columns: ["article_id"]
            isOneToOne: false
            referencedRelation: "catalogue"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_stock_principal_article"
            columns: ["article_id"]
            isOneToOne: false
            referencedRelation: "vue_catalogue_optimise"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_stock_principal_article"
            columns: ["article_id"]
            isOneToOne: false
            referencedRelation: "vue_marges_articles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_stock_principal_article"
            columns: ["article_id"]
            isOneToOne: false
            referencedRelation: "vue_marges_frais"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_stock_principal_article"
            columns: ["article_id"]
            isOneToOne: false
            referencedRelation: "vue_marges_globales_stock"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_stock_principal_entrepot"
            columns: ["entrepot_id"]
            isOneToOne: false
            referencedRelation: "entrepots"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stock_principal_article_id_fkey"
            columns: ["article_id"]
            isOneToOne: false
            referencedRelation: "catalogue"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stock_principal_article_id_fkey"
            columns: ["article_id"]
            isOneToOne: false
            referencedRelation: "vue_catalogue_optimise"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stock_principal_article_id_fkey"
            columns: ["article_id"]
            isOneToOne: false
            referencedRelation: "vue_marges_articles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stock_principal_article_id_fkey"
            columns: ["article_id"]
            isOneToOne: false
            referencedRelation: "vue_marges_frais"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stock_principal_article_id_fkey"
            columns: ["article_id"]
            isOneToOne: false
            referencedRelation: "vue_marges_globales_stock"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stock_principal_entrepot_id_fkey"
            columns: ["entrepot_id"]
            isOneToOne: false
            referencedRelation: "entrepots"
            referencedColumns: ["id"]
          },
        ]
      }
      transactions: {
        Row: {
          amount: number
          cash_register_id: string
          categorie_id: string | null
          category: Database["public"]["Enums"]["transaction_category"]
          commentaire: string | null
          created_at: string
          date_operation: string | null
          description: string
          id: string
          montant: number | null
          payment_method: Database["public"]["Enums"]["payment_method"]
          source: string | null
          type: Database["public"]["Enums"]["transaction_type"]
        }
        Insert: {
          amount: number
          cash_register_id: string
          categorie_id?: string | null
          category: Database["public"]["Enums"]["transaction_category"]
          commentaire?: string | null
          created_at?: string
          date_operation?: string | null
          description: string
          id?: string
          montant?: number | null
          payment_method: Database["public"]["Enums"]["payment_method"]
          source?: string | null
          type: Database["public"]["Enums"]["transaction_type"]
        }
        Update: {
          amount?: number
          cash_register_id?: string
          categorie_id?: string | null
          category?: Database["public"]["Enums"]["transaction_category"]
          commentaire?: string | null
          created_at?: string
          date_operation?: string | null
          description?: string
          id?: string
          montant?: number | null
          payment_method?: Database["public"]["Enums"]["payment_method"]
          source?: string | null
          type?: Database["public"]["Enums"]["transaction_type"]
        }
        Relationships: [
          {
            foreignKeyName: "transactions_cash_register_id_fkey"
            columns: ["cash_register_id"]
            isOneToOne: false
            referencedRelation: "cash_registers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_categorie_id_fkey"
            columns: ["categorie_id"]
            isOneToOne: false
            referencedRelation: "categories_financieres"
            referencedColumns: ["id"]
          },
        ]
      }
      transferts: {
        Row: {
          article_id: string | null
          created_at: string
          created_by: string | null
          date_expedition: string | null
          date_reception: string | null
          entrepot_destination_id: string | null
          entrepot_source_id: string | null
          id: string
          numero_transfert: string | null
          observations: string | null
          pdv_destination_id: string | null
          quantite: number
          reference: string | null
          statut: string | null
        }
        Insert: {
          article_id?: string | null
          created_at?: string
          created_by?: string | null
          date_expedition?: string | null
          date_reception?: string | null
          entrepot_destination_id?: string | null
          entrepot_source_id?: string | null
          id?: string
          numero_transfert?: string | null
          observations?: string | null
          pdv_destination_id?: string | null
          quantite: number
          reference?: string | null
          statut?: string | null
        }
        Update: {
          article_id?: string | null
          created_at?: string
          created_by?: string | null
          date_expedition?: string | null
          date_reception?: string | null
          entrepot_destination_id?: string | null
          entrepot_source_id?: string | null
          id?: string
          numero_transfert?: string | null
          observations?: string | null
          pdv_destination_id?: string | null
          quantite?: number
          reference?: string | null
          statut?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "transferts_article_id_fkey"
            columns: ["article_id"]
            isOneToOne: false
            referencedRelation: "catalogue"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transferts_article_id_fkey"
            columns: ["article_id"]
            isOneToOne: false
            referencedRelation: "vue_catalogue_optimise"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transferts_article_id_fkey"
            columns: ["article_id"]
            isOneToOne: false
            referencedRelation: "vue_marges_articles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transferts_article_id_fkey"
            columns: ["article_id"]
            isOneToOne: false
            referencedRelation: "vue_marges_frais"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transferts_article_id_fkey"
            columns: ["article_id"]
            isOneToOne: false
            referencedRelation: "vue_marges_globales_stock"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transferts_entrepot_destination_id_fkey"
            columns: ["entrepot_destination_id"]
            isOneToOne: false
            referencedRelation: "entrepots"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transferts_entrepot_source_id_fkey"
            columns: ["entrepot_source_id"]
            isOneToOne: false
            referencedRelation: "entrepots"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transferts_pdv_destination_id_fkey"
            columns: ["pdv_destination_id"]
            isOneToOne: false
            referencedRelation: "points_de_vente"
            referencedColumns: ["id"]
          },
        ]
      }
      unites: {
        Row: {
          created_at: string
          id: string
          nom: string
          statut: string | null
          symbole: string
          type_unite: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          nom: string
          statut?: string | null
          symbole: string
          type_unite?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          nom?: string
          statut?: string | null
          symbole?: string
          type_unite?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          assigned_at: string | null
          assigned_by: string | null
          created_at: string | null
          id: string
          is_active: boolean | null
          role_id: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          assigned_at?: string | null
          assigned_by?: string | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          role_id: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          assigned_at?: string | null
          assigned_by?: string | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          role_id?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_roles_role_id_fkey"
            columns: ["role_id"]
            isOneToOne: false
            referencedRelation: "roles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_roles_role_id_fkey"
            columns: ["role_id"]
            isOneToOne: false
            referencedRelation: "vue_permissions_utilisateurs"
            referencedColumns: ["role_id"]
          },
        ]
      }
      utilisateurs_internes: {
        Row: {
          created_at: string
          date_embauche: string | null
          department: string | null
          email: string
          id: string
          matricule: string | null
          nom: string
          password_hash: string | null
          photo_url: string | null
          prenom: string
          role_id: string | null
          statut: string
          telephone: string | null
          type_compte: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          date_embauche?: string | null
          department?: string | null
          email: string
          id?: string
          matricule?: string | null
          nom: string
          password_hash?: string | null
          photo_url?: string | null
          prenom: string
          role_id?: string | null
          statut?: string
          telephone?: string | null
          type_compte?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          date_embauche?: string | null
          department?: string | null
          email?: string
          id?: string
          matricule?: string | null
          nom?: string
          password_hash?: string | null
          photo_url?: string | null
          prenom?: string
          role_id?: string | null
          statut?: string
          telephone?: string | null
          type_compte?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "utilisateurs_internes_role_id_fkey"
            columns: ["role_id"]
            isOneToOne: false
            referencedRelation: "roles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "utilisateurs_internes_role_id_fkey"
            columns: ["role_id"]
            isOneToOne: false
            referencedRelation: "vue_permissions_utilisateurs"
            referencedColumns: ["role_id"]
          },
        ]
      }
      versements_clients: {
        Row: {
          client_id: string
          created_at: string
          date_versement: string
          facture_id: string | null
          id: string
          mode_paiement: string
          montant: number
          numero_versement: string
          observations: string | null
          reference_paiement: string | null
          updated_at: string
        }
        Insert: {
          client_id: string
          created_at?: string
          date_versement?: string
          facture_id?: string | null
          id?: string
          mode_paiement: string
          montant: number
          numero_versement: string
          observations?: string | null
          reference_paiement?: string | null
          updated_at?: string
        }
        Update: {
          client_id?: string
          created_at?: string
          date_versement?: string
          facture_id?: string | null
          id?: string
          mode_paiement?: string
          montant?: number
          numero_versement?: string
          observations?: string | null
          reference_paiement?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "versements_clients_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      villes: {
        Row: {
          code_postal: string | null
          created_at: string
          id: string
          nom: string
          pays_id: string | null
        }
        Insert: {
          code_postal?: string | null
          created_at?: string
          id?: string
          nom: string
          pays_id?: string | null
        }
        Update: {
          code_postal?: string | null
          created_at?: string
          id?: string
          nom?: string
          pays_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "villes_pays_id_fkey"
            columns: ["pays_id"]
            isOneToOne: false
            referencedRelation: "pays"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      repartition_frais_bc: {
        Row: {
          article_id: string | null
          total_frais: number | null
          total_ligne: number | null
        }
        Relationships: [
          {
            foreignKeyName: "lignes_commande_article_id_fkey"
            columns: ["article_id"]
            isOneToOne: false
            referencedRelation: "catalogue"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lignes_commande_article_id_fkey"
            columns: ["article_id"]
            isOneToOne: false
            referencedRelation: "vue_catalogue_optimise"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lignes_commande_article_id_fkey"
            columns: ["article_id"]
            isOneToOne: false
            referencedRelation: "vue_marges_articles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lignes_commande_article_id_fkey"
            columns: ["article_id"]
            isOneToOne: false
            referencedRelation: "vue_marges_frais"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lignes_commande_article_id_fkey"
            columns: ["article_id"]
            isOneToOne: false
            referencedRelation: "vue_marges_globales_stock"
            referencedColumns: ["id"]
          },
        ]
      }
      vue_catalogue_optimise: {
        Row: {
          autres_frais: number | null
          categorie: string | null
          categorie_couleur: string | null
          categorie_id: string | null
          categories: Json | null
          created_at: string | null
          description: string | null
          frais_douane: number | null
          frais_logistique: number | null
          frais_transport: number | null
          id: string | null
          image_url: string | null
          nom: string | null
          prix_achat: number | null
          prix_unitaire: number | null
          prix_vente: number | null
          reference: string | null
          seuil_alerte: number | null
          statut: string | null
          unite_id: string | null
          unite_mesure: string | null
          unite_symbole: string | null
          unites: Json | null
          updated_at: string | null
        }
        Relationships: [
          {
            foreignKeyName: "catalogue_categorie_id_fkey"
            columns: ["categorie_id"]
            isOneToOne: false
            referencedRelation: "categories_catalogue"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "catalogue_unite_id_fkey"
            columns: ["unite_id"]
            isOneToOne: false
            referencedRelation: "unites"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_catalogue_categorie"
            columns: ["categorie_id"]
            isOneToOne: false
            referencedRelation: "categories_catalogue"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_catalogue_unite"
            columns: ["unite_id"]
            isOneToOne: false
            referencedRelation: "unites"
            referencedColumns: ["id"]
          },
        ]
      }
      vue_facture_vente_detaillee: {
        Row: {
          article_nom: string | null
          client_entreprise: string | null
          client_nom: string | null
          client_prenom: string | null
          date_facture: string | null
          facture_id: string | null
          ligne_id: string | null
          montant_brut_ligne: number | null
          montant_net_ligne: number | null
          numero_facture: string | null
          prix_unitaire_brut: number | null
          quantite: number | null
          remise_totale_ligne: number | null
          remise_unitaire: number | null
          statut_livraison:
            | Database["public"]["Enums"]["statut_livraison_enum"]
            | null
          statut_paiement: string | null
        }
        Relationships: []
      }
      vue_factures_vente_summary: {
        Row: {
          articles: number | null
          client: string | null
          date: string | null
          date_iso: string | null
          facture_id: string | null
          numero_facture: string | null
          paye: number | null
          restant: number | null
          statut_livraison: string | null
          statut_paiement: string | null
          total: number | null
        }
        Relationships: []
      }
      vue_marges_articles: {
        Row: {
          autres_frais: number | null
          cout_total_unitaire: number | null
          created_at: string | null
          frais_bon_commande: number | null
          frais_douane: number | null
          frais_logistique: number | null
          frais_transport: number | null
          id: string | null
          marge_unitaire: number | null
          nom: string | null
          prix_achat: number | null
          prix_vente: number | null
          reference: string | null
          taux_marge: number | null
          updated_at: string | null
        }
        Relationships: []
      }
      vue_marges_frais: {
        Row: {
          autres_frais: number | null
          cout_total_unitaire: number | null
          created_at: string | null
          frais_bon_commande: number | null
          frais_douane: number | null
          frais_logistique: number | null
          frais_transport: number | null
          id: string | null
          marge_unitaire: number | null
          nom: string | null
          prix_achat: number | null
          prix_vente: number | null
          reference: string | null
          taux_marge: number | null
          updated_at: string | null
        }
        Insert: {
          autres_frais?: number | null
          cout_total_unitaire?: never
          created_at?: string | null
          frais_bon_commande?: never
          frais_douane?: number | null
          frais_logistique?: number | null
          frais_transport?: number | null
          id?: string | null
          marge_unitaire?: never
          nom?: string | null
          prix_achat?: number | null
          prix_vente?: number | null
          reference?: string | null
          taux_marge?: never
          updated_at?: string | null
        }
        Update: {
          autres_frais?: number | null
          cout_total_unitaire?: never
          created_at?: string | null
          frais_bon_commande?: never
          frais_douane?: number | null
          frais_logistique?: number | null
          frais_transport?: number | null
          id?: string | null
          marge_unitaire?: never
          nom?: string | null
          prix_achat?: number | null
          prix_vente?: number | null
          reference?: string | null
          taux_marge?: never
          updated_at?: string | null
        }
        Relationships: []
      }
      vue_marges_globales_stock: {
        Row: {
          cout_total_unitaire: number | null
          id: string | null
          marge_totale_article: number | null
          marge_unitaire: number | null
          nom: string | null
          prix_achat: number | null
          prix_vente: number | null
          reference: string | null
          stock_total: number | null
          taux_marge: number | null
          valeur_stock_cout: number | null
          valeur_stock_vente: number | null
        }
        Relationships: []
      }
      vue_mon_profil_employe: {
        Row: {
          created_at: string | null
          department: string | null
          email: string | null
          id: string | null
          matricule: string | null
          nom: string | null
          photo_url: string | null
          prenom: string | null
          statut: string | null
          telephone: string | null
          type_compte: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          department?: string | null
          email?: string | null
          id?: string | null
          matricule?: string | null
          nom?: string | null
          photo_url?: string | null
          prenom?: string | null
          statut?: string | null
          telephone?: string | null
          type_compte?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          department?: string | null
          email?: string | null
          id?: string | null
          matricule?: string | null
          nom?: string | null
          photo_url?: string | null
          prenom?: string | null
          statut?: string | null
          telephone?: string | null
          type_compte?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      vue_permissions_utilisateurs: {
        Row: {
          action: string | null
          can_access: boolean | null
          description: string | null
          email: string | null
          menu: string | null
          nom: string | null
          prenom: string | null
          role_id: string | null
          role_name: string | null
          submenu: string | null
          user_id: string | null
          utilisateur_interne_id: string | null
        }
        Relationships: []
      }
      vue_precommandes_pretes: {
        Row: {
          acompte_verse: number | null
          bon_livraison_genere: boolean | null
          bon_livraison_id: string | null
          client_email: string | null
          client_id: string | null
          client_nom: string | null
          created_at: string | null
          date_livraison_prevue: string | null
          date_notification: string | null
          date_precommande: string | null
          id: string | null
          montant_ht: number | null
          montant_total: number | null
          montant_ttc: number | null
          nb_lignes: number | null
          nb_lignes_livrees: number | null
          notification_envoyee: boolean | null
          numero_precommande: string | null
          observations: string | null
          prete_pour_conversion: boolean | null
          reste_a_payer: number | null
          statut: string | null
          taux_tva: number | null
          total_commande: number | null
          tva: number | null
          updated_at: string | null
        }
        Relationships: [
          {
            foreignKeyName: "precommandes_bon_livraison_id_fkey"
            columns: ["bon_livraison_id"]
            isOneToOne: false
            referencedRelation: "bons_de_livraison"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "precommandes_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      vue_remise_totale_par_facture: {
        Row: {
          facture_id: string | null
          remise_totale: number | null
        }
        Relationships: [
          {
            foreignKeyName: "lignes_facture_vente_facture_vente_id_fkey"
            columns: ["facture_id"]
            isOneToOne: false
            referencedRelation: "factures_vente"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lignes_facture_vente_facture_vente_id_fkey"
            columns: ["facture_id"]
            isOneToOne: false
            referencedRelation: "vue_facture_vente_detaillee"
            referencedColumns: ["facture_id"]
          },
          {
            foreignKeyName: "lignes_facture_vente_facture_vente_id_fkey"
            columns: ["facture_id"]
            isOneToOne: false
            referencedRelation: "vue_factures_vente_summary"
            referencedColumns: ["facture_id"]
          },
        ]
      }
      vue_solde_caisse: {
        Row: {
          cash_register_id: string | null
          derniere_operation: string | null
          nombre_operations: number | null
          solde_actif: number | null
        }
        Relationships: []
      }
      vue_stock_complet: {
        Row: {
          article_id: string | null
          article_nom: string | null
          article_reference: string | null
          article_statut: string | null
          categorie_nom: string | null
          categories: Json | null
          created_at: string | null
          derniere_entree: string | null
          derniere_sortie: string | null
          emplacement: string | null
          entrepot_id: string | null
          id: string | null
          location_nom: string | null
          point_vente_id: string | null
          prix_achat: number | null
          prix_vente: number | null
          quantite_disponible: number | null
          quantite_reservee: number | null
          type_stock: string | null
          unite_nom: string | null
          unite_symbole: string | null
          unites: Json | null
          updated_at: string | null
        }
        Relationships: []
      }
      vue_utilisateurs_avec_roles: {
        Row: {
          created_at: string | null
          date_embauche: string | null
          department: string | null
          email: string | null
          id: string | null
          matricule: string | null
          nom: string | null
          photo_url: string | null
          prenom: string | null
          role_description: string | null
          role_id: string | null
          role_name: string | null
          statut: string | null
          telephone: string | null
          type_compte: string | null
          updated_at: string | null
          user_id: string | null
        }
        Relationships: [
          {
            foreignKeyName: "utilisateurs_internes_role_id_fkey"
            columns: ["role_id"]
            isOneToOne: false
            referencedRelation: "roles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "utilisateurs_internes_role_id_fkey"
            columns: ["role_id"]
            isOneToOne: false
            referencedRelation: "vue_permissions_utilisateurs"
            referencedColumns: ["role_id"]
          },
        ]
      }
    }
    Functions: {
      assign_all_permissions_to_admin: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      assign_user_role_admin: {
        Args: { p_role_id: string; p_user_id: string }
        Returns: boolean
      }
      assign_user_role_secure: {
        Args: { new_role_id: string; target_user_id: string }
        Returns: Json
      }
      assign_user_role_simple: {
        Args: { p_role_id: string; p_user_id: string }
        Returns: boolean
      }
      audit_entrees_stock_propres: {
        Args: Record<PropertyKey, never>
        Returns: {
          details: string
          nombre_entrees: number
          rapport: string
        }[]
      }
      check_orphaned_stock: {
        Args: Record<PropertyKey, never>
        Returns: {
          article_id: string
          entrepot_id: string
          quantite_disponible: number
        }[]
      }
      check_user_permission: {
        Args: {
          p_action?: string
          p_menu: string
          p_submenu?: string
          p_user_id: string
        }
        Returns: boolean
      }
      check_user_permission_strict: {
        Args: { p_action?: string; p_menu: string; p_submenu?: string }
        Returns: boolean
      }
      complete_precommande_payment: {
        Args: {
          mode_paiement?: string
          montant_final: number
          precommande_uuid: string
        }
        Returns: string
      }
      convert_precommande_to_sale: {
        Args: { precommande_uuid: string }
        Returns: string
      }
      create_precommande_cash_transaction: {
        Args: {
          mode_paiement?: string
          montant_acompte: number
          precommande_uuid: string
        }
        Returns: string
      }
      diagnostic_permissions_system: {
        Args: Record<PropertyKey, never>
        Returns: {
          check_name: string
          count_value: number
          details: string
          status: string
        }[]
      }
      diagnostic_user_system_complet: {
        Args: Record<PropertyKey, never>
        Returns: {
          composant: string
          details: string
          recommandation: string
          statut: string
        }[]
      }
      generate_bon_commande_number: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      generate_bon_livraison_number: {
        Args: { bon_commande_numero: string }
        Returns: string
      }
      generate_facture_vente_number: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      generate_matricule: {
        Args: { p_nom: string; p_prenom: string }
        Returns: string
      }
      generate_precommande_number: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      generate_product_reference: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      generate_transfert_reference: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      generer_bon_livraison_precommande: {
        Args: { precommande_uuid: string }
        Returns: string
      }
      get_all_internal_users: {
        Args: Record<PropertyKey, never>
        Returns: {
          adresse: string
          created_at: string
          doit_changer_mot_de_passe: boolean
          email: string
          id: string
          matricule: string
          nom: string
          photo_url: string
          prenom: string
          role_id: string
          role_name: string
          statut: string
          telephone: string
          updated_at: string
          user_id: string
        }[]
      }
      get_client_statistics: {
        Args: Record<PropertyKey, never>
        Returns: {
          client_email: string
          client_id: string
          client_nom: string
          client_telephone: string
          nombre_ventes: number
          reste_a_payer: number
          total_facture: number
          total_paye: number
        }[]
      }
      get_clients_endettes: {
        Args: Record<PropertyKey, never>
        Returns: {
          client_email: string
          client_id: string
          client_nom: string
          client_telephone: string
          date_facture: string
          facture_id: string
          montant_paye: number
          montant_total: number
          numero_facture: string
          reste_a_payer: number
          statut_paiement: string
        }[]
      }
      get_current_user_role: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_dashboard_complete_stats: {
        Args: Record<PropertyKey, never>
        Returns: {
          marge_globale_stock: number
          marge_pourcentage: number
          nb_clients: number
          nb_entrepots: number
          nb_fournisseurs: number
          nb_pdv: number
          stock_global: number
          total_catalogue: number
          valeur_stock_achat: number
          valeur_stock_vente: number
        }[]
      }
      get_factures_avec_marges: {
        Args: Record<PropertyKey, never>
        Returns: {
          benefice_total: number
          client_nom: string
          cout_total: number
          date_facture: string
          facture_id: string
          montant_ttc: number
          numero_facture: string
          taux_marge_global: number
        }[]
      }
      get_factures_vente: {
        Args: Record<PropertyKey, never>
        Returns: {
          articles: number
          client: string
          date_iso: string
          facture_id: string
          numero_facture: string
          paye: number
          restant: number
          statut_livraison: string
          statut_paiement: string
          total: number
        }[]
      }
      get_factures_vente_with_details: {
        Args: Record<PropertyKey, never>
        Returns: {
          articles: number
          client: string
          date: string
          facture_id: string
          numero_facture: string
          paye: number
          restant: number
          statut_livraison: string
          statut_paiement: string
          total: number
        }[]
      }
      get_margin_debug_data: {
        Args: Record<PropertyKey, never>
        Returns: {
          article_nom: string
          cout_total_unitaire: number
          frais_bon_commande: number
          nb_bons_commande: number
        }[]
      }
      get_permissions_structure: {
        Args: Record<PropertyKey, never>
        Returns: {
          action: string
          menu_icone: string
          menu_id: string
          menu_nom: string
          menu_ordre: number
          permission_description: string
          permission_id: string
          sous_menu_description: string
          sous_menu_id: string
          sous_menu_nom: string
          sous_menu_ordre: number
        }[]
      }
      get_precommande_quantities: {
        Args: { p_article_id: string }
        Returns: {
          en_attente: number
          total_livre: number
          total_precommande: number
        }[]
      }
      get_precommandes_info_for_article: {
        Args: { p_article_id: string }
        Returns: {
          article_nom: string
          nb_precommandes: number
          reste_a_livrer: number
          total_deja_livre: number
          total_en_precommande: number
        }[]
      }
      get_quick_stats: {
        Args: Record<PropertyKey, never>
        Returns: {
          total_articles: number
          total_entrepots: number
          total_pdv: number
          total_stock_entrepots: number
          total_stock_pdv: number
        }[]
      }
      get_rapport_marges_periode: {
        Args: { date_debut: string; date_fin: string }
        Returns: {
          benefice_total: number
          nombre_factures: number
          taux_marge_moyen: number
          total_couts: number
          total_ventes: number
        }[]
      }
      get_resume_marges_globales_stock: {
        Args: Record<PropertyKey, never>
        Returns: {
          marge_totale_globale: number
          taux_marge_moyen_pondere: number
          total_articles_en_stock: number
          valeur_totale_stock_cout: number
          valeur_totale_stock_vente: number
        }[]
      }
      get_total_stock_available: {
        Args: { p_article_id: string }
        Returns: number
      }
      get_user_permissions: {
        Args: { user_uuid: string }
        Returns: {
          action: string
          can_access: boolean
          menu: string
          submenu: string
        }[]
      }
      get_users_by_role: {
        Args: { role_uuid: string }
        Returns: {
          created_at: string
          email: string
          matricule: string
          nom: string
          prenom: string
          statut: string
          user_id: string
        }[]
      }
      has_user_permission: {
        Args: { p_action?: string; p_menu: string; p_submenu?: string }
        Returns: boolean
      }
      is_admin_or_manager: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      is_internal_user: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      is_internal_user_active: {
        Args: { user_id: string }
        Returns: boolean
      }
      is_user_admin: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      log_business_data_access: {
        Args: { operation: string; table_name: string }
        Returns: undefined
      }
      log_client_access_attempt: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      rapport_nettoyage_doublons: {
        Args: Record<PropertyKey, never>
        Returns: {
          message: string
          nombre: number
          statut: string
        }[]
      }
      refresh_marges_view: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      refresh_materialized_views: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      refresh_stock_views: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      refresh_user_session: {
        Args: Record<PropertyKey, never>
        Returns: Json
      }
      reset_internal_user_password: {
        Args: { new_password: string; user_email: string }
        Returns: Json
      }
      secure_password_update: {
        Args: {
          force_change?: boolean
          new_password: string
          target_user_id: string
        }
        Returns: Json
      }
      secure_role_assignment: {
        Args: { new_role_id: string; target_user_id: string }
        Returns: Json
      }
      test_rls_permissions: {
        Args: Record<PropertyKey, never>
        Returns: {
          details: string
          result: string
          test_name: string
        }[]
      }
      unaccent: {
        Args: { "": string }
        Returns: string
      }
      unaccent_init: {
        Args: { "": unknown }
        Returns: unknown
      }
      update_internal_user_secure: {
        Args: { user_data: Json; user_internal_id: string }
        Returns: Json
      }
      update_stock_pdv: {
        Args: {
          p_article_id: string
          p_point_vente_id: string
          p_quantite: number
        }
        Returns: undefined
      }
      update_stock_principal: {
        Args: {
          p_article_id: string
          p_entrepot_id: string
          p_quantite: number
        }
        Returns: undefined
      }
      update_user_profile: {
        Args: {
          p_adresse?: string
          p_doit_changer_mot_de_passe?: boolean
          p_email: string
          p_matricule?: string
          p_nom: string
          p_photo_url?: string
          p_prenom: string
          p_statut?: string
          p_telephone?: string
          p_user_id: string
        }
        Returns: boolean
      }
      update_user_simple: {
        Args: {
          p_adresse?: string
          p_doit_changer_mot_de_passe?: boolean
          p_email: string
          p_matricule?: string
          p_nom: string
          p_photo_url?: string
          p_prenom: string
          p_statut?: string
          p_telephone?: string
          p_user_id: string
        }
        Returns: boolean
      }
      user_has_permission: {
        Args:
          | {
              action_name?: string
              menu_name: string
              submenu_name?: string
              user_uuid: string
            }
          | { permission_name: string; user_id: string }
        Returns: boolean
      }
      user_has_permission_direct: {
        Args: { p_action?: string; p_menu: string; p_submenu?: string }
        Returns: boolean
      }
      validate_admin_system: {
        Args: Record<PropertyKey, never>
        Returns: {
          check_name: string
          count_result: number
          message: string
          status: string
        }[]
      }
      validate_system_sync: {
        Args: Record<PropertyKey, never>
        Returns: {
          check_name: string
          details: string
          status: string
        }[]
      }
      verifier_integrite_entrees_stock: {
        Args: Record<PropertyKey, never>
        Returns: {
          article_nom: string
          nombre_entrees: number
          statut_verification: string
          total_quantite: number
          types_entrees: string
        }[]
      }
      verifier_nettoyage_corrections: {
        Args: Record<PropertyKey, never>
        Returns: {
          nombre: number
          statut: string
          type_verification: string
        }[]
      }
    }
    Enums: {
      payment_method: "cash" | "card" | "transfer" | "check"
      register_status: "open" | "closed"
      statut_livraison_enum: "En attente" | "Partiellement livrée" | "Livrée"
      transaction_category:
        | "sales"
        | "supplies"
        | "entertainment"
        | "utilities"
        | "other"
      transaction_type: "income" | "expense"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      payment_method: ["cash", "card", "transfer", "check"],
      register_status: ["open", "closed"],
      statut_livraison_enum: ["En attente", "Partiellement livrée", "Livrée"],
      transaction_category: [
        "sales",
        "supplies",
        "entertainment",
        "utilities",
        "other",
      ],
      transaction_type: ["income", "expense"],
    },
  },
} as const
