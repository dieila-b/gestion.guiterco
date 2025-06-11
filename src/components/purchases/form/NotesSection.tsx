
import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';

interface NotesSectionProps {
  form: UseFormReturn<any>;
}

export const NotesSection = ({ form }: NotesSectionProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Notes</CardTitle>
      </CardHeader>
      <CardContent>
        <Textarea
          {...form.register('observations')}
          placeholder="Notes et observations..."
          rows={3}
        />
      </CardContent>
    </Card>
  );
};
