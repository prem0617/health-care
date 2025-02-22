export interface Fee {
  amount: number;
  currency: string;
}

export interface Doctor {
  _id: string;
  chatFee: Fee;
  consultationFee: Fee;
  email: string;
  name: string;
  password: string;
  specialization: string;
}

export interface BookedSlot {
  date: string;
  startTime: string;
}
// lib/types.ts
export interface Appointment {
  _id: string;
  date: string;
  patientId: {
    profile: {
      firstName: string;
      lastName: string;
    };
  };
  doctorId: string;
  zoomLink?: string;
  isFirstConsultation: boolean;
  prescriptionId?: string; // Add this field
  hasPrescription?: boolean; // You can remove this field since we'll use prescriptionId
}

export interface Prescription {
  diagnosis: string;
  medications: string;
  physicalActivities: string;
  notes: string;
}

export interface Doctor {
  name: string;
  specialization: string;
  consultationFee: {
    amount: number;
    currency: string;
  };
}
