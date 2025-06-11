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
          categorie: string | null
          created_at: string
          description: string | null
          id: string
          nom: string
          prix_unitaire: number | null
          reference: string
          seuil_alerte: number | null
          statut: string | null
          unite_mesure: string | null
          updated_at: string
        }
        Insert: {
          categorie?: string | null
          created_at?: string
          description?: string | null
          id?: string
          nom: string
          prix_unitaire?: number | null
          reference: string
          seuil_alerte?: number | null
          statut?: string | null
          unite_mesure?: string | null
          updated_at?: string
        }
        Update: {
          categorie?: string | null
          created_at?: string
          description?: string | null
          id?: string
          nom?: string
          prix_unitaire?: number | null
          reference?: string
          seuil_alerte?: number | null
          statut?: string | null
          unite_mesure?: string | null
          updated_at?: string
        }
        Relationships: []
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
            foreignKeyName: "entrees_stock_entrepot_id_fkey"
            columns: ["entrepot_id"]
            isOneToOne: false
            referencedRelation: "entrepots"
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
          category: Database["public"]["Enums"]["transaction_category"]
          created_at: string
          description: string
          id: string
          payment_method: Database["public"]["Enums"]["payment_method"]
          type: Database["public"]["Enums"]["transaction_type"]
        }
        Insert: {
          amount: number
          cash_register_id: string
          category: Database["public"]["Enums"]["transaction_category"]
          created_at?: string
          description: string
          id?: string
          payment_method: Database["public"]["Enums"]["payment_method"]
          type: Database["public"]["Enums"]["transaction_type"]
        }
        Update: {
          amount?: number
          cash_register_id?: string
          category?: Database["public"]["Enums"]["transaction_category"]
          created_at?: string
          description?: string
          id?: string
          payment_method?: Database["public"]["Enums"]["payment_method"]
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
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
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
