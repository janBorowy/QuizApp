import { ValidationPart } from '../validation/validation.part';
import { Quiz } from '../entities/quiz';
import { QuizInput } from './types/quiz.input';
import { Validator } from '../validation/validator';

export const INVALID_TITLE_LENGTH_MESSAGE = 'Invalid title length';

const titleLengthValidationPart: ValidationPart<Quiz> = new ValidationPart(
  INVALID_TITLE_LENGTH_MESSAGE,
  (quiz: QuizInput): boolean => {
    return quiz.title.length != 0;
  },
);

export class QuizValidator extends Validator<QuizInput> {
  constructor(quiz: QuizInput) {
    super(quiz, [titleLengthValidationPart]);
  }
}
