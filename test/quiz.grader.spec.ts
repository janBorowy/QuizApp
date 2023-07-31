import { QuizGrader } from '../src/quiz/quiz-grader';
import {
  multipleQuestion,
  plainQuestion,
  singleQuestion,
  sortQuestion,
} from './testing.data';
import { AnswerResult } from '../src/entities/answer-result';
import { Test, TestingModule } from '@nestjs/testing';
import { QuizService } from '../src/quiz/quiz.service';
import AnswerInput from '../src/quiz/types/answer-input';

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
const firstAnswers: AnswerInput[] = [
  {
    answer: '2',
    questionId: 1,
  },
  {
    answer: '0100',
    questionId: 2,
  },
  {
    answer: 'I don\'t know"',
    questionId: 3,
  },
  {
    answer: '2130',
    questionId: 4,
  },
];

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
const secondAnswers: AnswerInput[] = [
  {
    answer: '1',
    questionId: 1,
  },
  {
    answer: '0011',
    questionId: 2,
  },
  {
    answer: 'AbC',
    questionId: 3,
  },
  {
    answer: '0132',
    questionId: 4,
  },
];

const quizExample = {
  id: 1,
  title: 'easy quiz',
  createdBy: 'someone',
  questions: [singleQuestion, multipleQuestion, plainQuestion, sortQuestion],
};

describe('QuizGrader', () => {
  let quizGrader: QuizGrader;
  let quizService: QuizService;

  beforeEach(async () => {
    const testingModule: TestingModule = await Test.createTestingModule({
      providers: [
        QuizGrader,
        {
          provide: QuizService,
          useValue: {
            findAllQuizQuestions: () => {},
            existsQuizInDatabaseById: () => {},
          },
        },
      ],
    }).compile();

    quizGrader = testingModule.get<QuizGrader>(QuizGrader);
    quizService = testingModule.get<QuizService>(QuizService);
  });

  describe('solveQuiz', () => {
    it('Should grade first quiz attempt correctly', async () => {
      jest
        .spyOn(quizService, 'findAllQuizQuestions')
        .mockResolvedValue(quizExample.questions);
      jest
        .spyOn(quizService, 'existsQuizInDatabaseById')
        .mockResolvedValue(true);
      const result = await quizGrader.solveQuiz({
        quizId: quizExample.id,
        answerInputs: firstAnswers,
      });
      expect(result.results).toEqual(firstExpectedResult);
    });

    it('Should grade second quiz attempt correctly', async () => {
      jest
        .spyOn(quizService, 'findAllQuizQuestions')
        .mockResolvedValue(quizExample.questions);
      jest
        .spyOn(quizService, 'existsQuizInDatabaseById')
        .mockResolvedValue(true);
      const result = await quizGrader.solveQuiz({
        quizId: quizExample.id,
        answerInputs: secondAnswers,
      });
      expect(result.results).toEqual(secondExpectedResult);
    });
  });
});
