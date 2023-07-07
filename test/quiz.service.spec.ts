import { Test, TestingModule } from '@nestjs/testing';
import { DatabaseFacade } from '../src/database/database.facade';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Quiz } from '../src/entities/quiz';
import { Repository } from 'typeorm';
import { QuizService } from '../src/quiz/quiz.service';
import { loadTestQuizRepositoryImplementation } from './quiz.repository.test.impl';
import { exampleQuiz, exampleQuizWithId1 } from './testing.data';

describe('QuizService', () => {
  let quizRepository: Repository<Quiz>;
  let quizService: QuizService;
  const quizRepositoryToken = getRepositoryToken(Quiz);
  const repositoryContents = new Map<number, Quiz>();

  beforeEach(async () => {
    const testingModule: TestingModule = await Test.createTestingModule({
      providers: [
        QuizService,
        DatabaseFacade,
        {
          provide: quizRepositoryToken,
          useValue: {
            findOneBy: jest.fn(),
            save: jest.fn(),
          },
        },
      ],
    }).compile();

    quizService = testingModule.get<QuizService>(QuizService);
    quizRepository = testingModule.get<Repository<Quiz>>(quizRepositoryToken);
  });

  afterEach(() => {
    repositoryContents.clear();
  });

  it('Should properly create new quiz', async () => {
    loadTestQuizRepositoryImplementation(quizRepository, repositoryContents);

    const saveResult = quizService.createNewQuiz(exampleQuiz);
  });

  it('Should throw error when trying to create quiz that exists', async () => {
    loadTestQuizRepositoryImplementation(quizRepository, repositoryContents);

    const createdQuiz = await quizService.createNewQuiz(exampleQuiz);
    const createdQuizWithSameId = await quizService.createNewQuiz(
      exampleQuizWithId1,
    );
    expect(await quizService.findQuizById(exampleQuiz.id)).toEqual(exampleQuiz);
    expect(createdQuizWithSameId).toBeNull();
  });
});
