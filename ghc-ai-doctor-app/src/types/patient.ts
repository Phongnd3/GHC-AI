export interface PatientName {
  uuid: string;
  preferred: boolean;
  givenName: string;
  middleName?: string;
  familyName: string;
}

export interface PatientIdentifier {
  uuid: string;
  identifier: string;
  identifierType: { uuid: string; display: string };
  preferred: boolean;
}

export interface Patient {
  uuid: string;
  identifiers: PatientIdentifier[];
  person: {
    uuid: string;
    names: PatientName[];
    gender: string;
    birthdate: string;
    birthdateEstimated: boolean;
    dead: boolean;
    deathDate?: string;
    attributes: Array<{ attributeType: { display: string }; value: string }>;
    addresses: Array<Record<string, string>>;
  };
  voided: boolean;
}

export interface PatientDemographics {
  displayName: string;
  patientId: string;
  age: string;
  gender: string;
}

export interface FilteredPatientData {
  patientUuid: string;
  displayName: string;
  patientId: string;
  age: string;
  gender: string;
  ward: string | null;
  visitUuid: string;
}
