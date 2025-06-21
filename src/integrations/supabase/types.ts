export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
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
            referencedRelation: "vue_marges_articles"
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
            referencedRelation: "vue_marges_articles"
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
            referencedRelation: "vue_marges_articles"
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
            referencedRelation: "vue_marges_articles"
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
            referencedRelation: "vue_marges_articles"
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
          statut_livraison: string | null
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
          statut_livraison?: string | null
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
          statut_livraison?: string | null
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
            referencedRelation: "vue_marges_articles"
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
            referencedRelation: "vue_marges_articles"
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
          article_id: string | null
          created_at: string
          facture_vente_id: string | null
          id: string
          montant_ligne: number
          prix_unitaire: number
          quantite: number
          quantite_livree: number | null
          statut_livraison: string | null
        }
        Insert: {
          article_id?: string | null
          created_at?: string
          facture_vente_id?: string | null
          id?: string
          montant_ligne?: number
          prix_unitaire?: number
          quantite?: number
          quantite_livree?: number | null
          statut_livraison?: string | null
        }
        Update: {
          article_id?: string | null
          created_at?: string
          facture_vente_id?: string | null
          id?: string
          montant_ligne?: number
          prix_unitaire?: number
          quantite?: number
          quantite_livree?: number | null
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
            referencedRelation: "vue_marges_articles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lignes_facture_vente_facture_vente_id_fkey"
            columns: ["facture_vente_id"]
            isOneToOne: false
            referencedRelation: "factures_vente"
            referencedColumns: ["id"]
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
            referencedRelation: "vue_marges_articles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lignes_precommande_precommande_id_fkey"
            columns: ["precommande_id"]
            isOneToOne: false
            referencedRelation: "precommandes"
            referencedColumns: ["id"]
          },
        ]
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
        ]
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
          reste_a_payer: number | null
          statut: string
          taux_tva: number | null
          total_commande: number | null
          tva: number
          updated_at: string
        }
        Insert: {
          acompte_verse?: number | null
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
          reste_a_payer?: number | null
          statut?: string
          taux_tva?: number | null
          total_commande?: number | null
          tva?: number
          updated_at?: string
        }
        Update: {
          acompte_verse?: number | null
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
          reste_a_payer?: number | null
          statut?: string
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
      roles_utilisateurs: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          nom: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          nom: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          nom?: string
          updated_at?: string | null
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
            referencedRelation: "vue_marges_articles"
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
            referencedRelation: "vue_marges_articles"
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
            referencedRelation: "vue_marges_articles"
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
            referencedRelation: "vue_marges_articles"
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
      utilisateurs_internes: {
        Row: {
          adresse: string | null
          created_at: string | null
          doit_changer_mot_de_passe: boolean | null
          email: string
          id: string
          nom: string
          photo_url: string | null
          prenom: string
          role_id: string | null
          statut: string | null
          telephone: string | null
          type_compte: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          adresse?: string | null
          created_at?: string | null
          doit_changer_mot_de_passe?: boolean | null
          email: string
          id?: string
          nom: string
          photo_url?: string | null
          prenom: string
          role_id?: string | null
          statut?: string | null
          telephone?: string | null
          type_compte?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          adresse?: string | null
          created_at?: string | null
          doit_changer_mot_de_passe?: boolean | null
          email?: string
          id?: string
          nom?: string
          photo_url?: string | null
          prenom?: string
          role_id?: string | null
          statut?: string | null
          telephone?: string | null
          type_compte?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "utilisateurs_internes_role_id_fkey"
            columns: ["role_id"]
            isOneToOne: false
            referencedRelation: "roles_utilisateurs"
            referencedColumns: ["id"]
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
            referencedRelation: "vue_marges_articles"
            referencedColumns: ["id"]
          },
        ]
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
      vue_solde_caisse: {
        Row: {
          cash_register_id: string | null
          derniere_operation: string | null
          nombre_operations: number | null
          solde_actif: number | null
        }
        Relationships: []
      }
    }
    Functions: {
      convert_precommande_to_sale: {
        Args: { precommande_uuid: string }
        Returns: string
      }
      debug_auth_info: {
        Args: Record<PropertyKey, never>
        Returns: {
          current_user_id: string
          current_email: string
          is_authenticated: boolean
          is_internal_active: boolean
        }[]
      }
      debug_current_user: {
        Args: Record<PropertyKey, never>
        Returns: {
          user_id: string
          email: string
          raw_jwt: Json
          is_authenticated: boolean
        }[]
      }
      debug_frais_articles: {
        Args: Record<PropertyKey, never>
        Returns: {
          article_nom: string
          bon_commande_numero: string
          frais_livraison: number
          frais_logistique: number
          transit_douane: number
          montant_ht: number
          quantite: number
          prix_unitaire: number
          montant_ligne: number
        }[]
      }
      debug_frais_articles_detaille: {
        Args: Record<PropertyKey, never>
        Returns: {
          article_nom: string
          article_id: string
          bon_commande_numero: string
          bc_statut: string
          frais_livraison: number
          frais_logistique: number
          transit_douane: number
          montant_ht: number
          quantite: number
          prix_unitaire: number
          montant_ligne: number
          frais_total_bc: number
          part_frais: number
        }[]
      }
      debug_vue_marges_frais: {
        Args: Record<PropertyKey, never>
        Returns: {
          article_nom: string
          frais_bon_commande: number
          cout_total_unitaire: number
          nb_bons_commande: number
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
      generate_product_reference: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      generer_bon_livraison_precommande: {
        Args: { precommande_uuid: string }
        Returns: string
      }
      get_client_statistics: {
        Args: Record<PropertyKey, never>
        Returns: {
          client_id: string
          client_nom: string
          client_email: string
          client_telephone: string
          nombre_ventes: number
          total_facture: number
          total_paye: number
          reste_a_payer: number
        }[]
      }
      get_clients_endettes: {
        Args: Record<PropertyKey, never>
        Returns: {
          client_id: string
          client_nom: string
          client_email: string
          client_telephone: string
          facture_id: string
          numero_facture: string
          date_facture: string
          montant_total: number
          montant_paye: number
          reste_a_payer: number
          statut_paiement: string
        }[]
      }
      get_factures_avec_marges: {
        Args: Record<PropertyKey, never>
        Returns: {
          facture_id: string
          numero_facture: string
          date_facture: string
          client_nom: string
          montant_ttc: number
          cout_total: number
          benefice_total: number
          taux_marge_global: number
        }[]
      }
      get_factures_vente_with_details: {
        Args: Record<PropertyKey, never>
        Returns: Json
      }
      get_rapport_marges_periode: {
        Args: { date_debut: string; date_fin: string }
        Returns: {
          total_ventes: number
          total_couts: number
          benefice_total: number
          taux_marge_moyen: number
          nombre_factures: number
        }[]
      }
      get_user_role_for_rls: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      is_internal_user_active: {
        Args: { user_id: string }
        Returns: boolean
      }
      refresh_marges_view: {
        Args: Record<PropertyKey, never>
        Returns: undefined
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
    }
    Enums: {
      payment_method: "cash" | "card" | "transfer" | "check"
      register_status: "open" | "closed"
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

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      payment_method: ["cash", "card", "transfer", "check"],
      register_status: ["open", "closed"],
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
