import {
  ValidationResult,
  ValidationStatus,
} from '../validation/validation.result';
import { ValidationResultBuilder } from '../validation/validation.result.builder';
import { ValidationPart } from '../validation/validation.part';
import { QuizInput } from './types/quiz.input';

export const INVALID_TITLE_LENGTH_MESSAGE = 'Invalid title length';

export class QuizValidator {
  validationParts: ValidationPart<QuizInput>[];

  constructor(private quiz: QuizInput) {
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
  (quiz: QuizInput): boolean => {
    return quiz.title.length != 0;
  },
);
