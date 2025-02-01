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

export interface Appointment {
  date: string;
  startTime: string;
  patientName: string;
  isFirstConsultation: boolean;
}

export interface Doctor {
  name: string;
  specialization: string;
  consultationFee: {
    amount: number;
    currency: string;
  };
}
