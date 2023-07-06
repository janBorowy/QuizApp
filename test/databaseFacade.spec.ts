import { Test, TestingModule } from '@nestjs/testing';
import { DatabaseFacade } from '../src/database.facade';
import { QuizDto } from '../src/dtos/quiz.dto';
import { RecordAlreadyExistsError } from '../src/exceptions/recordAlreadyExists.error';
import { getRepositoryToken, TypeOrmModule } from '@nestjs/typeorm';
import { Quiz } from '../src/entities/quiz';
import { Repository } from 'typeorm';
import { FindOptions } from '@nestjs/schematics';
import { extend } from '@nestjs/graphql';

interface FindOneByFindOptions extends FindOptions {
  id: number;
}

function loadTestQuizRepositoryImplementation(
  quizRepository: Repository<Quiz>,
  repositoryContents: Map<number, Quiz>,
) {
  jest.spyOn(quizRepository, 'save').mockImplementation(async (quiz: Quiz) => {
    await repositoryContents.set(quiz.id, quiz);
    return quiz;
  });

  jest
    .spyOn(quizRepository, 'findOneBy')
    .mockImplementation(async (findOptions: FindOneByFindOptions) => {
      return repositoryContents.get(findOptions.id);
    });
}

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
          provide: getRepositoryToken(Quiz),
          useValue: {
            findOneBy: jest.fn(),
            save: jest.fn(),
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

  const exampleQuiz: QuizDto = {
    id: 1,
    name: 'Example quiz',
    createdBy: 'SomeoneOut ThereSomewhere',
    questions: [],
  };
  const exampleQuizUpdate: QuizDto = {
    id: 1,
    name: 'Example quiz update',
    createdBy: 'SomeoneOut ThereSomewhere',
    questions: [],
  };

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

  it('Should save properly', async () => {
    loadTestQuizRepositoryImplementation(quizRepository, repositoryContents);

    const savedQuiz = await databaseFacade.saveQuiz(exampleQuiz);
    expect(savedQuiz).toEqual(exampleQuiz);
    expect(await databaseFacade.findQuizById(1)).not.toBeNull();
    expect(await databaseFacade.findQuizById(1)).toEqual(exampleQuiz);
  });

  it('Should save properly and update', async () => {
    loadTestQuizRepositoryImplementation(quizRepository, repositoryContents);

    const quizFromDatabase = await databaseFacade.saveOrUpdateQuiz(exampleQuiz);
    expect(quizFromDatabase).toEqual(exampleQuiz);
    expect(await databaseFacade.findQuizById(1)).not.toBeNull();
    expect(await databaseFacade.findQuizById(1)).toEqual(exampleQuiz);

    const quizSequelFromDatabase = await databaseFacade.saveOrUpdateQuiz(
      exampleQuizUpdate,
    );
    expect(quizSequelFromDatabase).toEqual(exampleQuizUpdate);
    expect(await databaseFacade.findQuizById(1)).not.toBeNull();
    expect(await databaseFacade.findQuizById(1)).toEqual(exampleQuizUpdate);
  });

  it('Should throw exepction when trying to create quiz with existing id', async () => {
    loadTestQuizRepositoryImplementation(quizRepository, repositoryContents);

    await databaseFacade.saveQuiz(exampleQuiz);

    await expect(() => {
      return databaseFacade.saveQuiz(exampleQuiz);
    }).rejects.toThrow(RecordAlreadyExistsError);
  });
});
