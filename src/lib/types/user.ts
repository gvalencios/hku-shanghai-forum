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

export interface UserDocument {
  // System fields
  authUid: string;
  role: UserRole;
  email: string;
  createdAt: string;
  updatedAt: string;

  // TA-managed fields (from Excel upload)
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
