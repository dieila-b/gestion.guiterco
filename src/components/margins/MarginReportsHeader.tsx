
import React from 'react';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, TrendingUp } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { cn } from '@/lib/utils';

interface MarginReportsHeaderProps {
  dateDebut: Date;
  dateFin: Date;
  onDateDebutChange: (date: Date) => void;
  onDateFinChange: (date: Date) => void;
}

const MarginReportsHeader = ({ 
  dateDebut, 
  dateFin, 
  onDateDebutChange, 
  onDateFinChange 
}: MarginReportsHeaderProps) => {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Analyse des Marges Commerciales
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Suivi détaillé des coûts, marges et bénéfices
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className={cn("justify-start text-left font-normal")}>
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {format(dateDebut, 'dd/MM/yyyy', { locale: fr })}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={dateDebut}
                  onSelect={(date) => date && onDateDebutChange(date)}
                  initialFocus
                  locale={fr}
                />
              </PopoverContent>
            </Popover>
            <span className="text-muted-foreground">à</span>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className={cn("justify-start text-left font-normal")}>
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {format(dateFin, 'dd/MM/yyyy', { locale: fr })}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={dateFin}
                  onSelect={(date) => date && onDateFinChange(date)}
                  initialFocus
                  locale={fr}
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>
      </CardHeader>
    </Card>
  );
};

export default MarginReportsHeader;
