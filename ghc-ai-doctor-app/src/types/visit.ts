import type { Patient } from './patient';

export interface EncounterProvider {
  uuid: string;
  provider: { uuid: string; person: { uuid: string; display: string } };
  encounterRole: { uuid: string; display: string };
}

export interface Observation {
  uuid: string;
  concept: { uuid: string; display: string };
  value: string | number | { display: string };
  obsDatetime: string;
}

export interface Order {
  uuid: string;
  orderType: { display: string };
  drug?: { display: string };
  dose?: number;
  doseUnits?: { display: string };
  frequency?: { display: string };
  route?: { display: string };
  dateActivated: string;
  autoExpireDate?: string;
  voided: boolean;
}

export interface Encounter {
  uuid: string;
  encounterDatetime: string;
  encounterType: { uuid: string; display: string };
  encounterProviders: EncounterProvider[];
  obs: Observation[];
  orders: Order[];
  voided: boolean;
}

export interface Visit {
  uuid: string;
  display: string;
  patient: Patient;
  visitType: { uuid: string; display: string };
  location: { uuid: string; display: string };
  startDatetime: string;
  stopDatetime: string | null;
  encounters: Encounter[];
  attributes: Array<{ attributeType: { display: string }; value: string }>;
  voided: boolean;
  auditInfo?: {
    creator: { uuid: string; display: string };
    dateCreated: string;
    changedBy?: { uuid: string; display: string };
    dateChanged?: string;
  };
}
