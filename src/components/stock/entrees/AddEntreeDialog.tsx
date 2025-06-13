
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { AddEntreeForm } from './AddEntreeForm';

interface AddEntreeDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export const AddEntreeDialog = ({ isOpen, onOpenChange }: AddEntreeDialogProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button variant="default">
          <Plus className="mr-2 h-4 w-4" />
          Nouvelle entrée
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Ajouter une entrée de stock</DialogTitle>
        </DialogHeader>
        <AddEntreeForm onSuccess={() => onOpenChange(false)} />
      </DialogContent>
    </Dialog>
  );
};
