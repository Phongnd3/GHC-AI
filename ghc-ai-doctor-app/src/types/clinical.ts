export interface Medication {
  uuid: string;
  drugName: string;
  dosage: string;
  frequency: string;
}

export interface Allergy {
  uuid: string;
  allergenDisplay: string;
  allergenType: string;
  severity: string | null;
  reactions: string[];
  comment?: string;
}
