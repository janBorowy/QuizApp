import { QuizGrader } from '../src/quiz/quiz-grader';
import {
  multipleQuestion,
  plainQuestion,
  singleQuestion,
  sortQuestion,
} from './testing.data';

const firstExpectedResult = [2, 1.5, 0, 2];
const firstAnswers = ['2', '0100', "I don't know", '2130'];

const secondExpectedResult = [0, 0, 1, 1];
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
