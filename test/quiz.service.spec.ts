import { Test, TestingModule } from '@nestjs/testing';
import { QuizService } from '../src/quiz/quiz.service';
import { QuestionDatabaseFacade } from '../src/database/question-database-facade';
import { QuizDatabaseFacade } from '../src/database/quiz-database-facade';
import { exampleQuiz, exampleQuizInput } from './testing.data';

describe('QuizService', () => {
  let quizService: QuizService;
  let quizDatabaseFacade: QuizDatabaseFacade;
  let questionDatabaseFacade: QuestionDatabaseFacade;
  beforeEach(async () => {
    const testingModule: TestingModule = await Test.createTestingModule({
      providers: [
        QuizService,
        {
          provide: QuizDatabaseFacade,
          useValue: {
            findQuizById: () => {},
            findQuizByQuery: () => {},
            saveQuiz: () => {},
          },
        },
        {
          provide: QuestionDatabaseFacade,
          useValue: {
            saveQuestion: () => {},
          },
        },
      ],
    }).compile();

    quizService = testingModule.get<QuizService>(QuizService);
    quizDatabaseFacade =
      testingModule.get<QuizDatabaseFacade>(QuizDatabaseFacade);
    questionDatabaseFacade = testingModule.get<QuestionDatabaseFacade>(
      QuestionDatabaseFacade,
    );
  });

  describe('createQuiz', () => {
    it('Should create quiz correctly', async () => {
      const input = exampleQuizInput;
      const result = exampleQuiz;
      jest.spyOn(quizDatabaseFacade, 'saveQuiz').mockResolvedValue(result);
      jest
        .spyOn(questionDatabaseFacade, 'saveQuestion')
        .mockImplementation(() => null);
      jest.spyOn(quizDatabaseFacade, 'findQuizById').mockResolvedValue(result);

      expect(await quizService.createQuiz(input)).toEqual(result);
    });
  });

  describe('findQuizById', () => {
    it('should find quiz by id', async () => {
      const result = exampleQuiz;
      jest
        .spyOn(quizDatabaseFacade, 'findQuizById')
        .mockResolvedValue(exampleQuiz);
      expect(await quizService.findQuizById(result.id)).toEqual(result);
    });

    it("should return null when quiz doesn't exist", async () => {
      const result = null;
      jest.spyOn(quizDatabaseFacade, 'findQuizById').mockResolvedValue(null);
      expect(await quizService.findQuizById(1)).toEqual(result);
    });
  });

  describe('findQuizByTitle', () => {
    it('Should find all quizzes with given title', async () => {
      const result = [exampleQuiz];
      jest
        .spyOn(quizDatabaseFacade, 'findQuizByQuery')
        .mockResolvedValue(result);
      expect(await quizService.findQuizByTitle('Example quiz')).toEqual(result);
    });

    it('Should return empty array when no quiz with given title exists', async () => {
      const result = [];
      jest
        .spyOn(quizDatabaseFacade, 'findQuizByQuery')
        .mockResolvedValue(result);
      expect(
        await quizService.findQuizByTitle('no quiz with this title'),
      ).toEqual(result);
    });
  });
});
