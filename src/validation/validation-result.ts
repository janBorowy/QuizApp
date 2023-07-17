export class ValidationResult {
  status: ValidationStatus;
  info: string;
  entity: NonNullable<unknown>;
}

export enum ValidationStatus {
  SUCCESS,
  FAILURE,
}
