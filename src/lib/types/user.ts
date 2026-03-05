export type UserRole = "student" | "ta";

export interface FlightInfo {
  date: string;
  time: string;
  flightNumber: string;
}

export interface EmergencyContact {
  name: string;
  relationship: string;
  phone: string;
  email: string;
}

export interface Accommodation {
  checkInDate: string;   // e.g. "March 8, 12pm - 9pm"
  checkOutDate: string;  // e.g. "March 14, by 12:00 noon"
  roomType: string;      // "single" or "double"
  roomInfo: string;      // e.g. "Bldg 9, 705" (will be "TBC" initially)
  bookingConfirmation: string; // e.g. "20260304100"
}

export interface UserDocument {
  // System fields
  authUid: string;
  role: UserRole;
  email: string;
  createdAt: string;
  updatedAt: string;

  // TA-managed fields (from Excel upload)
  accommodation?: Accommodation;
  familyNameEn: string;
  firstNameEn: string;
  fullChineseName: string;
  gender: string;
  faculty: string;
  studentId: string;
  passportCountry: string;
  hasChinaBankAccount: boolean;
  telephone: string;
  specialRequest: string;

  // Student-managed fields
  flightTicketStatus: string;
  departureFlight: FlightInfo;
  arrivalFlight: FlightInfo;
  visaStatus: string;
  visaNotes: string;
  emergencyContact: EmergencyContact;
  dietaryRestrictions: string;
  medicalConditions: string;
}

export interface EmailStudentMap {
  email: string;
  familyNameEn: string;
  firstNameEn: string;
  fullChineseName: string;
  gender: string;
  faculty: string;
  studentId: string;
  passportCountry: string;
  hasChinaBankAccount: boolean;
  telephone: string;
  specialRequest: string;
}
