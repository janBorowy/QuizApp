import { QuizGrader } from '../src/quiz/quiz-grader';
import {
  multipleQuestion,
  plainQuestion,
  singleQuestion,
  sortQuestion,
} from './testing.data';
import { AnswerResult } from '../src/entities/answer-result';

const firstExpectedResult: AnswerResult[] = [
  {
    questionId: 1,
    pointsAcquired: 2,
  },
  {
    questionId: 2,
    pointsAcquired: 1.5,
  },
  {
    questionId: 3,
    pointsAcquired: 0,
  },
  {
    questionId: 4,
    pointsAcquired: 2,
  },
];
const firstAnswers = ['2', '0100', "I don't know", '2130'];

const secondExpectedResult: AnswerResult[] = [
  {
    questionId: 1,
    pointsAcquired: 0,
  },
  {
    questionId: 2,
    pointsAcquired: 0,
  },
  {
    questionId: 3,
    pointsAcquired: 1,
  },
  {
    questionId: 4,
    pointsAcquired: 1,
  },
];
const secondAnswers = ['1', '0011', 'AbC', '0132'];

const quizExample = {
  id: 1,
  title: 'easy quiz',
  createdBy: 'someone',
  questions: [singleQuestion, multipleQuestion, plainQuestion, sortQuestion],
};

describe('QuizGrader', () => {
  it('Should grade first quiz attempt correctly', () => {
    const result = QuizGrader.gradeQuiz(quizExample.questions, firstAnswers);
    expect(result).toEqual(firstExpectedResult);
  });

  it('Should grade second quiz attempt correctly', () => {
    const result = QuizGrader.gradeQuiz(quizExample.questions, secondAnswers);
    expect(result).toEqual(secondExpectedResult);
  });
});
