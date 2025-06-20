
import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Package, DollarSign, Truck } from 'lucide-react';

const editProductSchema = z.object({
  nom: z.string().min(1, 'Le nom est requis'),
  reference: z.string().min(1, 'La référence est requise'),
  description: z.string().optional(),
  prix_achat: z.coerce.number().min(0, 'Le prix d\'achat doit être positif').optional(),
  prix_vente: z.coerce.number().min(0, 'Le prix de vente doit être positif').optional(),
  frais_logistique: z.coerce.number().min(0, 'Les frais de logistique doivent être positifs').optional(),
  frais_douane: z.coerce.number().min(0, 'Les frais de douane doivent être positifs').optional(),
  frais_transport: z.coerce.number().min(0, 'Les frais de transport doivent être positifs').optional(),
  autres_frais: z.coerce.number().min(0, 'Les autres frais doivent être positifs').optional(),
  seuil_alerte: z.coerce.number().min(0, 'Le seuil d\'alerte doit être positif').optional(),
});

type EditProductFormValues = z.infer<typeof editProductSchema>;

interface EditProductFormProps {
  article: any;
  onSubmit: (data: EditProductFormValues) => void;
  isLoading: boolean;
}

const EditProductForm = ({ article, onSubmit, isLoading }: EditProductFormProps) => {
  const form = useForm<EditProductFormValues>({
    resolver: zodResolver(editProductSchema),
    defaultValues: {
      nom: article.nom || '',
      reference: article.reference || '',
      description: article.description || '',
      prix_achat: article.prix_achat || 0,
      prix_vente: article.prix_vente || 0,
      frais_logistique: article.frais_logistique || 0,
      frais_douane: article.frais_douane || 0,
      frais_transport: article.frais_transport || 0,
      autres_frais: article.autres_frais || 0,
      seuil_alerte: article.seuil_alerte || 10,
    },
  });

  const prixAchat = form.watch('prix_achat') || 0;
  const fraisLogistique = form.watch('frais_logistique') || 0;
  const fraisDouane = form.watch('frais_douane') || 0;
  const fraisTransport = form.watch('frais_transport') || 0;
  const autresFrais = form.watch('autres_frais') || 0;
  const prixVente = form.watch('prix_vente') || 0;

  const coutTotal = prixAchat + fraisLogistique + fraisDouane + fraisTransport + autresFrais;
  const margeUnitaire = prixVente - coutTotal;
  const tauxMarge = coutTotal > 0 ? (margeUnitaire / coutTotal) * 100 : 0;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Informations de base */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Package className="h-4 w-4" />
            <h3 className="text-sm font-medium">Informations de base</h3>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="nom"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nom du produit</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="reference"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Référence</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <Textarea {...field} rows={2} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <Separator />

        {/* Prix et coûts */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <DollarSign className="h-4 w-4" />
            <h3 className="text-sm font-medium">Structure des coûts</h3>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="prix_achat"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Prix d'achat (GNF)</FormLabel>
                  <FormControl>
                    <Input type="number" step="0.01" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="prix_vente"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Prix de vente (GNF)</FormLabel>
                  <FormControl>
                    <Input type="number" step="0.01" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        <Separator />

        {/* Frais additionnels */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Truck className="h-4 w-4" />
            <h3 className="text-sm font-medium">Frais additionnels</h3>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="frais_logistique"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Frais de logistique (GNF)</FormLabel>
                  <FormControl>
                    <Input type="number" step="0.01" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="frais_douane"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Frais de douane (GNF)</FormLabel>
                  <FormControl>
                    <Input type="number" step="0.01" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="frais_transport"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Frais de transport (GNF)</FormLabel>
                  <FormControl>
                    <Input type="number" step="0.01" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="autres_frais"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Autres frais (GNF)</FormLabel>
                  <FormControl>
                    <Input type="number" step="0.01" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        <Separator />

        {/* Calculs de marge */}
        <div className="bg-muted/50 p-4 rounded-lg space-y-2">
          <h3 className="text-sm font-medium">Calculs automatiques</h3>
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">Coût total unitaire:</span>
              <p className="font-medium">{coutTotal.toLocaleString()} GNF</p>
            </div>
            <div>
              <span className="text-muted-foreground">Marge unitaire:</span>
              <p className={`font-medium ${margeUnitaire >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {margeUnitaire.toLocaleString()} GNF
              </p>
            </div>
            <div>
              <span className="text-muted-foreground">Taux de marge:</span>
              <p className={`font-medium ${tauxMarge >= 20 ? 'text-green-600' : tauxMarge >= 10 ? 'text-yellow-600' : 'text-red-600'}`}>
                {tauxMarge.toFixed(1)}%
              </p>
            </div>
          </div>
        </div>

        <Separator />

        <FormField
          control={form.control}
          name="seuil_alerte"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Seuil d'alerte stock</FormLabel>
              <FormControl>
                <Input type="number" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-2">
          <Button type="submit" disabled={isLoading}>
            {isLoading ? 'Modification...' : 'Modifier le produit'}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default EditProductForm;
