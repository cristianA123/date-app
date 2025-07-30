import { Injectable } from '@nestjs/common';

export interface WeeklyAvailability {
  availableMonday: boolean;
  availableTuesday: boolean;
  availableWednesday: boolean;
  availableThursday: boolean;
  availableFriday: boolean;
  availableSaturday: boolean;
  availableSunday: boolean;
}

export interface DayAvailability {
  day: string;
  dayName: string;
  available: boolean;
  dayIndex: number;
}

@Injectable()
export class AvailabilityService {
  private readonly DAYS_OF_WEEK = [
    { key: 'availableMonday', name: 'Lunes', index: 1 },
    { key: 'availableTuesday', name: 'Martes', index: 2 },
    { key: 'availableWednesday', name: 'Miércoles', index: 3 },
    { key: 'availableThursday', name: 'Jueves', index: 4 },
    { key: 'availableFriday', name: 'Viernes', index: 5 },
    { key: 'availableSaturday', name: 'Sábado', index: 6 },
    { key: 'availableSunday', name: 'Domingo', index: 0 },
  ];

  /**
   * Convierte la disponibilidad semanal a un formato más legible
   */
  formatWeeklyAvailability(availability: WeeklyAvailability): DayAvailability[] {
    return this.DAYS_OF_WEEK.map(day => ({
      day: day.key,
      dayName: day.name,
      available: availability[day.key as keyof WeeklyAvailability],
      dayIndex: day.index,
    }));
  }

  /**
   * Verifica si un acompañante está disponible en una fecha específica
   */
  isAvailableOnDate(availability: WeeklyAvailability, date: Date): boolean {
    const dayOfWeek = date.getDay(); // 0 = Domingo, 1 = Lunes, etc.
    
    const dayMapping = {
      0: availability.availableSunday,
      1: availability.availableMonday,
      2: availability.availableTuesday,
      3: availability.availableWednesday,
      4: availability.availableThursday,
      5: availability.availableFriday,
      6: availability.availableSaturday,
    };

    return dayMapping[dayOfWeek as keyof typeof dayMapping] || false;
  }

  /**
   * Obtiene los días disponibles de la semana
   */
  getAvailableDays(availability: WeeklyAvailability): string[] {
    return this.DAYS_OF_WEEK
      .filter(day => availability[day.key as keyof WeeklyAvailability])
      .map(day => day.name);
  }

  /**
   * Verifica si tiene al menos un día disponible
   */
  hasAnyAvailableDay(availability: WeeklyAvailability): boolean {
    return Object.values(availability).some(day => day === true);
  }

  /**
   * Obtiene el próximo día disponible desde una fecha dada
   */
  getNextAvailableDate(availability: WeeklyAvailability, fromDate: Date = new Date()): Date | null {
    const maxDaysToCheck = 14; // Buscar hasta 2 semanas adelante
    
    for (let i = 0; i < maxDaysToCheck; i++) {
      const checkDate = new Date(fromDate);
      checkDate.setDate(fromDate.getDate() + i);
      
      if (this.isAvailableOnDate(availability, checkDate)) {
        return checkDate;
      }
    }
    
    return null; // No hay días disponibles en las próximas 2 semanas
  }

  /**
   * Genera un resumen de disponibilidad en texto
   */
  getAvailabilitySummary(availability: WeeklyAvailability): string {
    const availableDays = this.getAvailableDays(availability);
    
    if (availableDays.length === 0) {
      return 'No disponible';
    }
    
    if (availableDays.length === 7) {
      return 'Disponible todos los días';
    }
    
    if (availableDays.length === 5 && 
        !availability.availableSaturday && 
        !availability.availableSunday) {
      return 'Disponible de lunes a viernes';
    }
    
    if (availableDays.length === 2 && 
        availability.availableSaturday && 
        availability.availableSunday) {
      return 'Disponible fines de semana';
    }
    
    return `Disponible: ${availableDays.join(', ')}`;
  }
}