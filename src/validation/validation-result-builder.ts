import { ValidationResult, ValidationStatus } from './validation-result';

export class ValidationResultBuilder {
  private validationResult: ValidationResult;

  constructor() {
    this.validationResult = new ValidationResult();
  }

  status(status: ValidationStatus): ValidationResultBuilder {
    this.validationResult.status = status;
    return this;
  }

  entity(entity: NonNullable<any>): ValidationResultBuilder {
    this.validationResult.entity = entity;
    return this;
  }

  info(info: string): ValidationResultBuilder {
    this.validationResult.info = info;
    return this;
  }

  build(): ValidationResult {
    return this.validationResult;
  }
}
