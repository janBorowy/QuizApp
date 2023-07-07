import { Test, TestingModule } from '@nestjs/testing';
import { DatabaseFacade } from '../src/database/database.facade';
import { RecordAlreadyExistsError } from '../src/exceptions/recordAlreadyExists.error';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Quiz } from '../src/entities/quiz';
import { Repository } from 'typeorm';
import { loadTestQuizRepositoryImplementation } from './quiz.repository.test.impl';
import {
  anotherExampleQuiz,
  exampleQuiz,
  exampleQuizWithId1,
} from './testing.data';
import { RecordNotFoundError } from '../src/exceptions/recordNotFound.error';

describe('DatabaseFacade', () => {
  let databaseFacade: DatabaseFacade;
  let quizRepository: Repository<Quiz>;
  const quizRepositoryToken = getRepositoryToken(Quiz);
  const repositoryContents = new Map<number, Quiz>();

  beforeEach(async () => {
    const testingModule: TestingModule = await Test.createTestingModule({
      providers: [
        DatabaseFacade,
        {
          provide: quizRepositoryToken,
          useValue: {
            findOneBy: jest.fn(),
            save: jest.fn(),
            delete: jest.fn(),
            create: jest.fn(),
          },
        },
      ],
    }).compile();

    databaseFacade = testingModule.get<DatabaseFacade>(DatabaseFacade);
    quizRepository = testingModule.get<Repository<Quiz>>(quizRepositoryToken);
  });

  afterEach(() => {
    repositoryContents.clear();
  });

  it('Injected providers should be defined', () => {
    expect(databaseFacade).toBeDefined();
    expect(quizRepository).toBeDefined();
  });

  it('Should retrieve existing quiz properly', () => {
    jest.spyOn(quizRepository, 'findOneBy').mockResolvedValue(exampleQuiz);

    expect(databaseFacade.findQuizById(1)).resolves.not.toBeNull();
    expect(databaseFacade.findQuizById(1)).resolves.toEqual(exampleQuiz);
  });

  it('Should return null if no quiz with given id exists', async () => {
    jest.spyOn(quizRepository, 'findOneBy').mockReturnValue(null);

    expect(await databaseFacade.findQuizById(1)).toBeNull();
  });

  it('Should save properly with given id', async () => {
    loadTestQuizRepositoryImplementation(quizRepository, repositoryContents);

    const savedQuiz = await databaseFacade.saveQuiz(exampleQuiz);
    expect(savedQuiz).toEqual(exampleQuiz);
    expect(await databaseFacade.findQuizById(1)).not.toBeNull();
    expect(await databaseFacade.findQuizById(1)).toEqual(exampleQuiz);

    const anotherSavedQuiz = await databaseFacade.saveQuiz(anotherExampleQuiz);
    expect(anotherSavedQuiz).toEqual(anotherExampleQuiz);
    expect(await databaseFacade.findQuizById(2)).not.toBeNull();
    expect(await databaseFacade.findQuizById(2)).toEqual(anotherExampleQuiz);
  });

  it('Should delete record properly', async () => {
    loadTestQuizRepositoryImplementation(quizRepository, repositoryContents);

    const savedQuiz = await databaseFacade.saveQuiz(exampleQuiz);
    await databaseFacade.deleteQuizById(savedQuiz.id);
    expect(await databaseFacade.findQuizById(savedQuiz.id)).toBeNull();
  });

  it('Should throw when trying to delete absent record', () => {
    loadTestQuizRepositoryImplementation(quizRepository, repositoryContents);

    expect(databaseFacade.deleteQuizById(exampleQuiz.id)).rejects.toThrow(
      RecordNotFoundError,
    );
  });
});
