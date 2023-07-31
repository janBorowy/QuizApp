import { Test, TestingModule } from '@nestjs/testing';
import { QuizService } from '../src/quiz/quiz.service';
import { exampleQuiz, exampleQuizInput } from './testing.data';
import { DataSource, Repository } from 'typeorm';
import { Quiz } from '../src/entities/quiz';
import { getRepositoryToken } from '@nestjs/typeorm';
import { MockType, repositoryMockFactory } from './repository-mock-factory';
import { Question } from '../src/entities/question';

describe('QuizService', () => {
  let quizService: QuizService;
  let quizRepository: MockType<Repository<Quiz>>;
  let questionRepository: MockType<Repository<Question>>;
  const quizRepositoryToken = getRepositoryToken(Quiz);
  const questionRepositoryToken = getRepositoryToken(Question);
  beforeEach(async () => {
    const testingModule: TestingModule = await Test.createTestingModule({
      providers: [
        QuizService,
        {
          provide: quizRepositoryToken,
          useFactory: repositoryMockFactory,
        },
        {
          provide: questionRepositoryToken,
          useFactory: repositoryMockFactory,
        },
        {
          provide: DataSource,
          useValue: {
            transaction: jest.fn().mockImplementation((fun) => fun()),
          },
        },
      ],
    }).compile();

    quizService = testingModule.get<QuizService>(QuizService);
    quizRepository = testingModule.get(quizRepositoryToken);
    questionRepository = testingModule.get(questionRepositoryToken);
  });

  describe('createQuiz', () => {
    it('Should create quiz correctly', async () => {
      quizRepository.create.mockReturnValue(exampleQuiz);
      questionRepository.create.mockReturnValue(null);
      quizRepository.save.mockReturnValue(exampleQuiz);

      expect(await quizService.createQuiz(exampleQuizInput)).toEqual(
        exampleQuiz,
      );
    });
  });

  /*describe('findQuizById', () => {
    it('should find quiz by id', async () => {
      const result = exampleQuiz;
      jest
        .spyOn(quizDatabaseFacade, 'findQuizById')
        .mockResolvedValue(exampleQuiz);
      expect(await quizService.findQuizById(result.id)).toEqual(result);
    });

    it("should throw if quiz doesn't exist", async () => {
      jest
        .spyOn(quizDatabaseFacade, 'findQuizById')
        .mockRejectedValue(new QuizNotFoundError(''));
      await expect(quizService.findQuizById(1)).rejects.toThrow(
        QuizNotFoundError,
      );
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

  describe('deleteQuizById', () => {
    it('Should throw error when trying to delete nonexistent quiz', async () => {
      jest
        .spyOn(quizDatabaseFacade, 'deleteQuizById')
        .mockRejectedValue(new RecordNotFoundError(1));
      await expect(quizService.deleteQuizById(1)).rejects.toThrow(
        RecordNotFoundError,
      );
    });
  });

  describe('findAllQuizQuestions', () => {
    it('Should correctly return all quiz questions', async () => {
      const result = [singleQuestion, plainQuestion];
      jest
        .spyOn(questionDatabaseFacade, 'findAllQuizQuestions')
        .mockResolvedValue(result);
      expect(await quizService.findAllQuizQuestions(1)).toEqual(result);
    });
  });

  describe('findAllQuizQuestions', () => {
    it('Should correctly return all quiz questions', async () => {
      const result = [singleQuestion, plainQuestion];
      jest
        .spyOn(questionDatabaseFacade, 'findAllQuizQuestions')
        .mockResolvedValue(result);
      expect(await quizService.findAllQuizQuestions(1)).toEqual(result);
    });

    it('Should return empty array if questions is null', async () => {
      jest
        .spyOn(questionDatabaseFacade, 'findAllQuizQuestions')
        .mockResolvedValue(null);
      expect(await quizService.findAllQuizQuestions(1)).toEqual([]);
    });
  });

  describe('solveQuiz', () => {
    it('Should correctly grade quiz', async () => {
      const input: SolveQuizInput = {
        quizId: 1,
        answerInputs: [
          {
            answer: '1100',
            questionId: 2,
          },
          {
            answer: 'ABC',
            questionId: 3,
          },
        ],
      };
      const result: SolveResult = {
        sum: 4,
        percent: 100,
        results: [
          {
            questionId: 2,
            pointsAcquired: 2,
          },
          {
            questionId: 3,
            pointsAcquired: 2,
          },
        ],
      };

      jest
        .spyOn(quizDatabaseFacade, 'existsQuizInDatabaseById')
        .mockImplementation(async () => true);
      jest
        .spyOn(questionDatabaseFacade, 'findAllQuizQuestions')
        .mockResolvedValue(exampleQuizToSolveQuestions);

      expect(await quizService.solveQuiz(input)).toEqual(result);
    });

    it('Should throw when not all questions where answered', async () => {
      const input: SolveQuizInput = {
        quizId: 1,
        answerInputs: [
          {
            answer: '1100',
            questionId: 2,
          },
        ],
      };

      jest
        .spyOn(quizDatabaseFacade, 'existsQuizInDatabaseById')
        .mockImplementation(async () => true);
      jest
        .spyOn(questionDatabaseFacade, 'findAllQuizQuestions')
        .mockResolvedValue(exampleQuizToSolveQuestions);

      await expect(quizService.solveQuiz(input)).rejects.toThrow(
        InvalidAnswerInputError,
      );
    });

    it('Should throw when answering non existent question', async () => {
      const input: SolveQuizInput = {
        quizId: 1,
        answerInputs: [
          {
            answer: '1100',
            questionId: 2,
          },
          {
            answer: 'ABC',
            questionId: 4,
          },
        ],
      };

      jest
        .spyOn(quizDatabaseFacade, 'existsQuizInDatabaseById')
        .mockImplementation(async () => true);
      jest
        .spyOn(questionDatabaseFacade, 'findAllQuizQuestions')
        .mockResolvedValue(exampleQuizToSolveQuestions);

      await expect(quizService.solveQuiz(input)).rejects.toThrow(
        InvalidAnswerInputError,
      );
    });
    it('Should throw when answering the same question twice', async () => {
      const input: SolveQuizInput = {
        quizId: 1,
        answerInputs: [
          {
            answer: '1100',
            questionId: 2,
          },
          {
            answer: 'ABC',
            questionId: 3,
          },
          {
            answer: 'CBA',
            questionId: 3,
          },
        ],
      };

      jest
        .spyOn(quizDatabaseFacade, 'existsQuizInDatabaseById')
        .mockImplementation(async () => true);
      jest
        .spyOn(questionDatabaseFacade, 'findAllQuizQuestions')
        .mockResolvedValue(exampleQuizToSolveQuestions);

      await expect(quizService.solveQuiz(input)).rejects.toThrow(
        InvalidAnswerInputError,
      );
    });
  });*/
});
