import { ValidationStatus } from '../src/validation/validation.result';
import {
  INVALID_TITLE_LENGTH_MESSAGE,
  QuizValidator,
} from '../src/quiz/quiz.validator';

describe('QuizValidator', () => {
  let quiz;
  beforeEach(() => {
    quiz = {
      id: 1,
      title: 'Example quiz',
      createdBy: 'SomeoneOut ThereSomewhere',
      questions: [],
    };
  });

  it('Should reject empty title quiz', () => {
    quiz.title = '';
    const result = new QuizValidator(quiz).validate();

    expect(result.status).toBe(ValidationStatus.FAILURE);
    expect(result.info).toBe(INVALID_TITLE_LENGTH_MESSAGE);
    expect(result.entity).toBe(quiz);
  });

  it('Should reject too long title quiz', () => {
    quiz.title =
      'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa';
    const result = new QuizValidator(quiz).validate();

    expect(result.status).toBe(ValidationStatus.FAILURE);
    expect(result.info).toBe(INVALID_TITLE_LENGTH_MESSAGE);
    expect(result.entity).toBe(quiz);
  });
});
