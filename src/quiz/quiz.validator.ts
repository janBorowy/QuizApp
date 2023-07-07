import { Quiz } from '../entities/quiz';
import {
  ValidationResult,
  ValidationStatus,
} from '../validation/validation.result';
import { ValidationResultBuilder } from '../validation/validation.result.builder';
import { ValidationPart } from '../validation/validation.part';

export const INVALID_TITLE_LENGTH_MESSAGE = 'Invalid title length';

export class QuizValidator {
  validationParts: ValidationPart<Quiz>[];

  constructor(private quiz: Quiz) {
    this.validationParts = [titleLengthValidationPart];
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

const titleLengthValidationPart = new ValidationPart(
  INVALID_TITLE_LENGTH_MESSAGE,
  (quiz: Quiz): boolean => {
    return quiz.title.length != 0;
  },
);
