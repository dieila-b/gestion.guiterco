import React from 'react';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

export interface PeriodSelectorProps {
  startDate: Date;
  endDate: Date;
  onPeriodChange: (startDate: Date, endDate: Date) => void;
}

const PeriodSelector: React.FC<PeriodSelectorProps> = ({
  startDate,
  endDate,
  onPeriodChange
}) => {
  const handleQuickPeriod = (period: string) => {
    const now = new Date();
    let newStartDate: Date;
    let newEndDate: Date;

    switch (period) {
      case 'month':
        newStartDate = new Date(now.getFullYear(), now.getMonth(), 1);
        newEndDate = new Date(now.getFullYear(), now.getMonth() + 1, 0); // Dernier jour du mois
        break;
      case 'quarter':
        const quarterStart = Math.floor(now.getMonth() / 3) * 3;
        newStartDate = new Date(now.getFullYear(), quarterStart, 1);
        newEndDate = new Date(now.getFullYear(), quarterStart + 3, 0); // Dernier jour du trimestre
        break;
      case 'semester':
        const semesterStart = now.getMonth() >= 6 ? 6 : 0;
        newStartDate = new Date(now.getFullYear(), semesterStart, 1);
        newEndDate = new Date(now.getFullYear(), semesterStart + 6, 0); // Dernier jour du semestre
        break;
      case 'year':
        newStartDate = new Date(now.getFullYear(), 0, 1);
        newEndDate = new Date(now.getFullYear(), 12, 0); // Dernier jour de l'année
        break;
      default:
        return;
    }

    onPeriodChange(newStartDate, newEndDate);
  };

  return (
    <div className="flex flex-wrap items-center gap-2 p-4 bg-muted/50 rounded-lg">
      <span className="text-sm font-medium text-muted-foreground">Période :</span>
      
      {/* Raccourcis de période */}
      <div className="flex flex-wrap gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleQuickPeriod('month')}
          className="text-xs"
        >
          Mois en cours
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleQuickPeriod('quarter')}
          className="text-xs"
        >
          Trimestre
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleQuickPeriod('semester')}
          className="text-xs"
        >
          Semestre
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleQuickPeriod('year')}
          className="text-xs"
        >
          Année
        </Button>
      </div>

      {/* Sélection personnalisée */}
      <div className="flex items-center gap-2 ml-4">
        <span className="text-xs text-muted-foreground">Personnalisé :</span>
        
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm" className="text-xs">
              <CalendarIcon className="h-3 w-3 mr-1" />
              {format(startDate, 'dd/MM/yyyy', { locale: fr })}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={startDate}
              onSelect={(date) => date && onPeriodChange(date, endDate)}
              initialFocus
              locale={fr}
            />
          </PopoverContent>
        </Popover>

        <span className="text-xs text-muted-foreground">à</span>

        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm" className="text-xs">
              <CalendarIcon className="h-3 w-3 mr-1" />
              {format(endDate, 'dd/MM/yyyy', { locale: fr })}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={endDate}
              onSelect={(date) => date && onPeriodChange(startDate, date)}
              initialFocus
              locale={fr}
            />
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
};

export default PeriodSelector;