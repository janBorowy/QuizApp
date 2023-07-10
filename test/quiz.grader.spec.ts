import { Question, QuestionType } from '../src/entities/question';
import { QuizGrader } from '../src/quiz/quiz.grader';

const firstExpectedResult = [2, 1.5, 0, 2];
const firstAnswers = ['2', '0100', "I don't know", '2130'];

const secondExpectedResult = [0, 0, 1, 1];
const secondAnswers = ['1', '0011', 'ABC', '0132'];

const singleQuestion: Question = {
  id: 1,
  description: 'Answer is C!',
  type: QuestionType.SINGLE,
  possibleScore: 2,
  correctAnswerString: '2',
  answers: [],
  quiz: null,
  quizId: 1,
};

const multipleQuestion: Question = {
  id: 2,
  description: 'A and B',
  type: QuestionType.MULTIPLE,
  possibleScore: 2,
  correctAnswerString: '1100',
  answers: [],
  quiz: null,
  quizId: 1,
};

const plainQuestion: Question = {
  id: 3,
  description: 'ABC is the answer',
  type: QuestionType.PLAIN,
  possibleScore: 1,
  correctAnswerString: 'ABC',
  answers: [],
  quiz: null,
  quizId: 1,
};

const sortQuestion: Question = {
  id: 4,
  description: 'DBAC',
  type: QuestionType.SORT,
  possibleScore: 2,
  correctAnswerString: '2130',
  answers: [],
  quiz: null,
  quizId: 1,
};

const quizExample = {
  id: 1,
  title: 'easy quiz',
  createdBy: 'someone',
  questions: [singleQuestion, multipleQuestion, plainQuestion, sortQuestion],
};

describe('QuizGrader', () => {
  it('Should grade first quiz attempt correctly', () => {
    const result = QuizGrader.gradeQuiz(quizExample, firstAnswers);
    expect(result).toEqual(firstExpectedResult);
  });

  it('Should grade second quiz attempt correctly', () => {
    const result = QuizGrader.gradeQuiz(quizExample, secondAnswers);
    expect(result).toEqual(secondExpectedResult);
  });
});
