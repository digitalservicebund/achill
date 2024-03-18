export type CalculationPosition = {
  name: string;
  id: number;
  isBillable: boolean;
  subprojectId: number;
};

export type ProjectTime = {
  id: number;
  date: string;
  hours: number;
  description: string;
  isBillable: boolean;
  isInvoiced: boolean;
  calculationPositionId: number;
};

export type CalendarEventType = "R" | "H" | "G" | "P" | "T";
export type CalendarEvent = {
  id: string;
  startDate: string;
  endDate: string;
  subject: string;
  type: CalendarEventType;
};
