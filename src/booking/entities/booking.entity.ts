export class Booking {
  id?: number;
  clientId: number;
  companionId: number;
  locationId?: number;
  date: Date;
  startTime: string;
  durationHours: number;
  paymentMethod: string;
}
