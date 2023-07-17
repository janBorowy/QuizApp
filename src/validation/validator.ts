import { ValidationResult, ValidationStatus } from './validation-result';
import { ValidationResultBuilder } from './validation-result-builder';
import { ValidationPart } from './validation-part';

export class Validator<T> {
  validationParts: ValidationPart<T>[];

  constructor(private quiz: T, validationParts: Array<ValidationPart<T>>) {
    this.validationParts = validationParts;
  }

  validate(): ValidationResult {
    let validationResult;
    this.validationParts.every((validationPart) => {
      if (validationPart.validationFunction(this.quiz) == false) {
        validationResult = this.buildFailureValidationResult(
          validationPart.failureInfo,
        );
        return false;
      }
    });
    if (validationResult != null) {
      return validationResult;
    }
    return this.buildSuccessValidationResult();
  }

  buildFailureValidationResult(info: string): ValidationResult {
    const builder = new ValidationResultBuilder();
    return builder
      .info(info)
      .entity(this.quiz)
      .status(ValidationStatus.FAILURE)
      .build();
  }
  buildSuccessValidationResult(): ValidationResult {
    const builder = new ValidationResultBuilder();
    return builder.status(ValidationStatus.SUCCESS).entity(this.quiz).build();
  }
}
