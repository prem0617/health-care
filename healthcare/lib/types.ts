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
