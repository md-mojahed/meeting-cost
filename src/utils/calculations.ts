import { Attendee, WorkingHours, CurrencySettings } from '../types';

export function calculateHourlyRate(salary: number, workingHours: WorkingHours): number {
  const totalHoursPerYear = workingHours.hoursPerDay * workingHours.daysPerWeek * workingHours.weeksPerYear;
  return salary / totalHoursPerYear;
}

export function calculateMinuteRate(salary: number, workingHours: WorkingHours): number {
  return calculateHourlyRate(salary, workingHours) / 60;
}

export function calculateMeetingCost(attendees: Attendee[], workingHours: WorkingHours, durationMs: number): number {
  const durationMinutes = durationMs / (1000 * 60);
  return attendees.reduce((total, attendee) => {
    const minuteRate = calculateMinuteRate(attendee.salary, workingHours);
    return total + (minuteRate * durationMinutes);
  }, 0);
}

export function formatTime(milliseconds: number): string {
  const totalSeconds = Math.floor(milliseconds / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

export function formatCurrency(amount: number, currency: CurrencySettings): string {
  const formattedAmount = new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Math.abs(amount));

  return currency.position === 'before' 
    ? `${currency.symbol}${formattedAmount}`
    : `${formattedAmount} ${currency.symbol}`;
}

export function parseSpeechToAttendees(transcript: string): Attendee[] {
  const attendees: Attendee[] = [];
  
  // Enhanced regex patterns to extract numbers that could be salaries
  const patterns = [
    /(\d{4,7})/g, // Basic 4-7 digit numbers
    /(\d{1,3}(?:,\d{3})*)/g, // Numbers with commas
    /(\d+)\s*(?:thousand|k)/gi, // "50 thousand" or "50k"
    /(\d+)\s*(?:million|m)/gi // "1 million" or "1m"
  ];
  
  const salaries = new Set<number>(); // Use Set to avoid duplicates
  
  patterns.forEach(pattern => {
    const matches = transcript.match(pattern);
    if (matches) {
      matches.forEach(match => {
        let salary = parseInt(match.replace(/[,\s]/g, ''), 10);
        
        // Handle thousands and millions
        if (transcript.toLowerCase().includes('thousand') || transcript.toLowerCase().includes('k')) {
          salary *= 1000;
        } else if (transcript.toLowerCase().includes('million') || transcript.toLowerCase().includes('m')) {
          salary *= 1000000;
        }
        
        // Filter reasonable salary ranges
        if (salary >= 10000 && salary <= 10000000) {
          salaries.add(salary);
        }
      });
    }
  });
  
  // Convert Set to Array and create attendees
  Array.from(salaries).forEach((salary, index) => {
    attendees.push({
      id: index + 1,
      salary: salary
    });
  });
  
  return attendees;
}