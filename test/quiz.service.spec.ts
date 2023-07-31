import { Test, TestingModule } from '@nestjs/testing';
import { QuizService } from '../src/quiz/quiz.service';
import {
  exampleQuiz,
  exampleQuizInput,
  plainQuestion,
  singleQuestion,
} from './testing.data';
import { DataSource, Repository } from 'typeorm';
import { Quiz } from '../src/entities/quiz';
import { getRepositoryToken } from '@nestjs/typeorm';
import { MockType, repositoryMockFactory } from './repository-mock-factory';
import { Question } from '../src/entities/question';
import { QuizNotFoundError } from '../src/exceptions/quiz-not-found.error';
import { RecordNotFoundError } from '../src/exceptions/record-not-found.error';

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

  describe('findQuizById', () => {
    it('should find quiz by id', async () => {
      quizRepository.findOneBy.mockReturnValue(exampleQuiz);
      expect(await quizService.findQuizById(exampleQuiz.id)).toEqual(
        exampleQuiz,
      );
    });

    it("should throw if quiz doesn't exist", async () => {
      quizRepository.findOneBy.mockReturnValue(null);
      await expect(quizService.findQuizById(1)).rejects.toThrow(
        QuizNotFoundError,
      );
    });
  });

  describe('findQuizByTitle', () => {
    it('Should find all quizzes with given title', async () => {
      const result = [exampleQuiz];
      quizRepository.findBy.mockReturnValue(result);
      expect(await quizService.findQuizByTitle('Example quiz')).toEqual(result);
    });

    it('Should return empty array when no quiz with given title exists', async () => {
      const result = [];
      quizRepository.findBy.mockReturnValue(result);
      expect(
        await quizService.findQuizByTitle('no quiz with this title'),
      ).toEqual(result);
    });
  });

  describe('deleteQuizById', () => {
    it('Should throw error when trying to delete nonexistent quiz', async () => {
      quizRepository.findOneBy.mockReturnValue(null);
      await expect(quizService.deleteQuizById(1)).rejects.toThrow(
        RecordNotFoundError,
      );
    });
  });

  describe('findAllQuizQuestions', () => {
    it('Should correctly return all quiz questions', async () => {
      const result = [singleQuestion, plainQuestion];
      questionRepository.findBy.mockReturnValue(result);
      expect(await quizService.findAllQuizQuestions(1)).toEqual(result);
    });

    it('Should return empty array if questions is null', async () => {
      questionRepository.findBy.mockReturnValue(null);
      expect(await quizService.findAllQuizQuestions(1)).toEqual([]);
    });
  });
});
