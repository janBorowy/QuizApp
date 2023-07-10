import { ValidationPart } from '../validation/validation.part';
import { Quiz } from '../entities/quiz';
import { QuizInput } from './types/quiz.input';
import { Validator } from '../validation/validator';
import { QuestionInput } from './types/question.input';

export const INVALID_DESCRIPTION_LENGTH_MESSAGE = 'Invalid title length';

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
