
import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { useCreateCashRegister } from '@/hooks/useCashRegisters';

// Define the schema for form validation
const formSchema = z.object({
  name: z.string().min(2, {
    message: "Le nom de la caisse doit contenir au moins 2 caractères",
  }),
  initialBalance: z.string().refine((val) => !isNaN(Number(val)) && Number(val) >= 0, {
    message: "Le solde initial doit être un nombre positif",
  }),
});

type FormValues = z.infer<typeof formSchema>;

interface AddCashRegisterFormProps {
  onSuccess?: (data: { name: string; initialBalance: number }) => void;
}

const AddCashRegisterForm: React.FC<AddCashRegisterFormProps> = ({ onSuccess }) => {
  const { toast } = useToast();
  const createCashRegister = useCreateCashRegister();
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      initialBalance: "0",
    },
  });

  const onSubmit = async (data: FormValues) => {
    try {
      const newRegister = {
        name: data.name,
        balance: Number(data.initialBalance),
        status: 'closed' as const,
      };
      
      await createCashRegister.mutateAsync(newRegister);
      
      toast({
        title: "Caisse créée",
        description: `La caisse '${data.name}' a été créée avec un solde initial de ${data.initialBalance}€`,
      });
      
      if (onSuccess) {
        onSuccess({
          name: data.name,
          initialBalance: Number(data.initialBalance)
        });
      }
      
      form.reset();
    } catch (error) {
      console.error('Error creating cash register:', error);
      toast({
        title: "Erreur",
        description: "Impossible de créer la caisse. Veuillez réessayer.",
        variant: "destructive",
      });
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nom de la caisse</FormLabel>
              <FormControl>
                <Input placeholder="Caisse principale" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="initialBalance"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Solde initial (€)</FormLabel>
              <FormControl>
                <Input type="number" min="0" step="0.01" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <Button 
          type="submit" 
          className="w-full" 
          disabled={createCashRegister.isPending}
        >
          {createCashRegister.isPending ? "Création..." : "Créer la caisse"}
        </Button>
      </form>
    </Form>
  );
};

export default AddCashRegisterForm;
