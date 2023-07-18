import { Quiz } from '../src/entities/quiz';
import { Question, QuestionType } from '../src/entities/question';
import { QuizInput } from '../src/quiz/types/quiz-input';

export const exampleQuizInput: QuizInput = {
  title: 'Example quiz',
  createdBy: 'SomeoneOut ThereSomewhere',
  questionInputs: [],
};

export const exampleQuiz: Quiz = {
  id: 1,
  title: 'Example quiz',
  createdBy: 'SomeoneOut ThereSomewhere',
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

export const exampleQuizToSolve: Quiz = {
  id: 1,
  title: 'examle quiz to solve',
  createdBy: 'admin',
  questions: [],
};

export const exampleQuizToSolveQuestions: Array<Question> = [
  {
    id: 3,
    type: QuestionType.PLAIN,
    answers: [],
    possibleScore: 2,
    description: 'Answer is ABC',
    correctAnswerString: 'ABC',
    quiz: exampleQuizToSolve,
    quizId: 1,
  },
  {
    id: 2,
    type: QuestionType.MULTIPLE,
    answers: ['A', 'B', 'C', 'D'],
    possibleScore: 2,
    description: 'Answer is A and B',
    correctAnswerString: '1100',
    quiz: exampleQuizToSolve,
    quizId: 1,
  },
];
