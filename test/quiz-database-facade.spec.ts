import { Test, TestingModule } from '@nestjs/testing';
import { QuizDatabaseFacade } from '../src/database/quiz-database-facade';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Question } from '../src/entities/question';
import { Quiz } from '../src/entities/quiz';
import { exampleQuiz, exampleQuizInput } from './testing.data';
import { DataSource, Repository } from 'typeorm';
import { RecordNotFoundError } from '../src/exceptions/record-not-found.error';

describe('QuizDatabaseFacade', () => {
  let quizDatabaseFacade: QuizDatabaseFacade;
  let quizRepository: Repository<Quiz>;
  let questionRepository: Repository<Question>;
  beforeEach(async () => {
    const testingModule: TestingModule = await Test.createTestingModule({
      providers: [
        QuizDatabaseFacade,
        {
          provide: getRepositoryToken(Quiz),
          useValue: {
            create: () => {},
            save: () => {},
            findOneBy: () => {},
            findBy: () => {},
            delete: () => {},
          },
        },
        {
          provide: getRepositoryToken(Question),
          useValue: {
            delete: () => {},
          },
        },
        {
          provide: DataSource,
          useValue: {
            transaction: jest.fn().mockImplementation((fun) => fun()),
          },
        },
      ],
    }).compile();
    quizDatabaseFacade =
      testingModule.get<QuizDatabaseFacade>(QuizDatabaseFacade);
    quizRepository = testingModule.get<Repository<Quiz>>(
      getRepositoryToken(Quiz),
    );
    questionRepository = testingModule.get<Repository<Question>>(
      getRepositoryToken(Question),
    );
  });

  describe('saveQuiz', () => {
    it('Should save quiz properly', async () => {
      const input = exampleQuizInput;
      const result = exampleQuiz;

      jest.spyOn(quizRepository, 'create').mockReturnValue(result);
      jest.spyOn(quizRepository, 'save').mockResolvedValue(result);
      expect(await quizDatabaseFacade.saveQuiz(input)).toEqual(result);
    });
  });

  describe('findQuizById', () => {
    it('Should find quiz by id correctly', async () => {
      const result = exampleQuiz;

      jest.spyOn(quizRepository, 'findOneBy').mockResolvedValue(exampleQuiz);
      expect(await quizDatabaseFacade.findQuizById(result.id)).toEqual(result);
    });

    it('Should return null when quiz was not found', async () => {
      jest.spyOn(quizRepository, 'findOneBy').mockResolvedValue(null);
      expect(await quizDatabaseFacade.findQuizById(1)).toEqual(null);
    });
  });

  describe('findQuizByQuery', () => {
    it('Should find quizzes by title correctly', async () => {
      const result = exampleQuiz;

      jest.spyOn(quizRepository, 'findBy').mockResolvedValue([exampleQuiz]);
      expect(await quizDatabaseFacade.findQuizByQuery('Example quiz')).toEqual([
        result,
      ]);
    });

    it('Should return empty array when no quizzes where found', async () => {
      jest.spyOn(quizRepository, 'findBy').mockResolvedValue([]);
      expect(await quizDatabaseFacade.findQuizByQuery('Example quiz')).toEqual(
        [],
      );
    });
  });

  describe('deleteQuizById', () => {
    it('Should delete quiz correctly', async () => {
      jest
        .spyOn(quizDatabaseFacade, 'existsQuizInDatabaseById')
        .mockResolvedValue(true);
      jest.spyOn(quizRepository, 'delete').mockResolvedValue(null);
      jest.spyOn(questionRepository, 'delete').mockResolvedValue(null);
      await expect(quizDatabaseFacade.deleteQuizById(1)).resolves;
    });

    it('Should if quiz does not exist in database', async () => {
      jest
        .spyOn(quizDatabaseFacade, 'existsQuizInDatabaseById')
        .mockResolvedValue(false);
      jest.spyOn(quizRepository, 'delete').mockResolvedValue(null);
      jest.spyOn(questionRepository, 'delete').mockResolvedValue(null);
      await expect(quizDatabaseFacade.deleteQuizById(1)).rejects.toThrow(
        RecordNotFoundError,
      );
    });
  });

  describe('existsQuizInDatabaseById', () => {
    it('Should return true if exists', async () => {
      jest.spyOn(quizRepository, 'findOneBy').mockResolvedValue(exampleQuiz);
      expect(await quizDatabaseFacade.existsQuizInDatabaseById(1)).toBeTruthy();
    });

    it('Should return false if record does not exist', async () => {
      jest.spyOn(quizRepository, 'findOneBy').mockResolvedValue(null);
      expect(await quizDatabaseFacade.existsQuizInDatabaseById(1)).toBeFalsy();
    });
  });
});
