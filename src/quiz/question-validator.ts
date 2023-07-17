import { ValidationPart } from '../validation/validation-part';
import { Validator } from '../validation/validator';
import { QuestionInput } from './types/question-input';

export const INVALID_DESCRIPTION_LENGTH_MESSAGE =
  "Invalid description length - can't be empty";

const descriptionLengthValidationPart: ValidationPart<QuestionInput> =
  new ValidationPart(
    INVALID_DESCRIPTION_LENGTH_MESSAGE,
    (question: QuestionInput): boolean => {
      return question.description.length != 0;
    },
  );

export class QuestionValidator extends Validator<QuestionInput> {
  constructor(question: QuestionInput) {
    super(question, [descriptionLengthValidationPart]);
  }
}
