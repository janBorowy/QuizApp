import { Quiz } from '../src/entities/quiz';
import { Question, QuestionType } from '../src/entities/question';
import { QuestionInput } from '../src/quiz/types/question.input';

export const exampleQuiz: Quiz = {
  id: 1,
  title: 'Example quiz',
  createdBy: 'SomeoneOut ThereSomewhere',
  questions: [],
};
export const exampleQuizWithId1: Quiz = {
  id: 1,
  title: 'Example quiz update',
  createdBy: 'SomeoneOut ThereSomewhere',
  questions: [],
};

export const anotherExampleQuiz: Quiz = {
  id: 2,
  title: 'Another example quiz',
  createdBy: 'Somebody Elsewhere',
  questions: [],
};

export const singleQuestion: Question = {
  id: 1,
  description: 'Answer is C!',
  type: QuestionType.SINGLE,
  possibleScore: 2,
  correctAnswerString: '2',
  answers: [],
  quiz: null,
  quizId: 1,
};

export const singleQuestionInput = {
  description: 'Answer is C!',
  type: QuestionType.SINGLE,
  possibleScore: 2,
  correctAnswerString: '2',
  answers: ['a', 'b', 'c', 'd'],
};

export const multipleQuestion: Question = {
  id: 2,
  description: 'A and B',
  type: QuestionType.MULTIPLE,
  possibleScore: 2,
  correctAnswerString: '1100',
  answers: ['a', 'b', 'c', 'd'],
  quiz: null,
  quizId: 1,
};

export const plainQuestion: Question = {
  id: 3,
  description: 'ABC is the answer',
  type: QuestionType.PLAIN,
  possibleScore: 1,
  correctAnswerString: 'ABC',
  answers: [],
  quiz: null,
  quizId: 1,
};

export const sortQuestion: Question = {
  id: 4,
  description: 'DBAC',
  type: QuestionType.SORT,
  possibleScore: 2,
  correctAnswerString: '2130',
  answers: ['a', 'b', 'c', 'd'],
  quiz: null,
  quizId: 1,
};
