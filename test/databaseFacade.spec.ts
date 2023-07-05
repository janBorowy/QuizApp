import { getRepositoryToken, TypeOrmModule } from '@nestjs/typeorm';
import { Test, TestingModule } from '@nestjs/testing';
import { Quiz } from '../src/entities/quiz';
import { Repository } from 'typeorm';
import { DatabaseFacade } from '../src/database.facade';

const databaseTestConnection = 'test';

describe('DatabaseFacade', () => {
  let quizRepository: Repository<Quiz>;
  let databaseFacade: DatabaseFacade;

  const QUIZ_REPOSITORY_TOKEN = getRepositoryToken(Quiz);

  beforeEach(async () => {
    const testingModule: TestingModule = await Test.createTestingModule({
      providers: [
        DatabaseFacade,
        {
          provide: QUIZ_REPOSITORY_TOKEN,
          useValue: {
            create: jest.fn(),
            save: jest.fn(),
            findOne: jest.fn(),
            findOneBy: jest.fn(),
          },
        },
      ],
    }).compile();

    databaseFacade = testingModule.get<DatabaseFacade>(DatabaseFacade);
    quizRepository = testingModule.get<Repository<Quiz>>(QUIZ_REPOSITORY_TOKEN);
  });

  it('Injected providers should be defined', () => {
    expect(databaseFacade).toBeDefined();
    expect(quizRepository).toBeDefined();
  });
});
