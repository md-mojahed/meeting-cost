export interface Attendee {
  id: number;
  salary: number;
}

export interface WorkingHours {
  hoursPerDay: number;
  daysPerWeek: number;
  weeksPerYear: number;
}

export interface MeetingState {
  isRunning: boolean;
  startTime: number | null;
  duration: number;
  totalCost: number;
}

export interface CurrencySettings {
  symbol: string;
  code: string;
  position: 'before' | 'after';
}

export interface AppState {
  attendees: Attendee[];
  workingHours: WorkingHours;
  meeting: MeetingState;
  currency: CurrencySettings;
}