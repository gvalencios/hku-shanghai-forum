export type CheckpointCategory =
  | "pre_departure"
  | "day_of"
  | "arrival"
  | "during_trip"
  | "return";

export interface Checkpoint {
  id: string;
  name: string;
  description: string;
  expectedTime: string;
  order: number;
  category: CheckpointCategory;
  isRecurring: boolean;
  createdBy: string;
}

export interface Checkin {
  id: string;
  checkpointId: string;
  userId: string;
  timestamp: string;
  note: string;
  recurringDate?: string;
}

export const CATEGORY_LABELS: Record<CheckpointCategory, string> = {
  pre_departure: "Pre-Departure",
  day_of: "Day of Travel",
  arrival: "Arrival",
  during_trip: "During Trip",
  return: "Return",
};

export const DEFAULT_CHECKPOINTS: Omit<Checkpoint, "id" | "createdBy">[] = [
  { name: "Passport & visa confirmed", description: "Ensure passport validity and visa approval", expectedTime: "", order: 1, category: "pre_departure", isRecurring: false },
  { name: "Flight ticket purchased", description: "Book and confirm round-trip flights", expectedTime: "", order: 2, category: "pre_departure", isRecurring: false },
  { name: "Travel insurance purchased", description: "Obtain travel insurance coverage", expectedTime: "", order: 3, category: "pre_departure", isRecurring: false },
  { name: "Boarded departure flight", description: "Checked in and boarded the flight to Shanghai", expectedTime: "", order: 4, category: "day_of", isRecurring: false },
  { name: "Landed at Shanghai Pudong International Airport", description: "Arrived safely at PVG", expectedTime: "", order: 5, category: "arrival", isRecurring: false },
  { name: "Passed immigration/customs", description: "Cleared immigration and customs at Shanghai", expectedTime: "", order: 6, category: "arrival", isRecurring: false },
  { name: "Arrived at university/dorm", description: "Reached the accommodation", expectedTime: "", order: 7, category: "arrival", isRecurring: false },
  { name: "Checked into dorm room", description: "Room key received and settled in", expectedTime: "", order: 8, category: "arrival", isRecurring: false },
  { name: "Daily check-in", description: "Confirm you are safe and well", expectedTime: "", order: 9, category: "during_trip", isRecurring: true },
  { name: "Boarded return flight", description: "Checked in and boarded the return flight", expectedTime: "", order: 10, category: "return", isRecurring: false },
  { name: "Arrived back in Hong Kong", description: "Safely returned to HK", expectedTime: "", order: 11, category: "return", isRecurring: false },
];
