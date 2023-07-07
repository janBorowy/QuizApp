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
            delete: jest.fn(),
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

    const saveResult = await quizService.createNewQuiz(exampleQuiz);
    expect(saveResult).toEqual(exampleQuiz);
    expect(await quizService.findQuizById(saveResult.id)).toEqual(saveResult);
  });

  it('Should not allow creating quiz that exists', async () => {
    loadTestQuizRepositoryImplementation(quizRepository, repositoryContents);

    const createdQuiz = await quizService.createNewQuiz(exampleQuiz);
    const createdQuizWithSameId = await quizService.createNewQuiz(
      exampleQuizWithId1,
    );
    expect(await quizService.findQuizById(exampleQuiz.id)).toEqual(exampleQuiz);
    expect(createdQuizWithSameId).toBeNull();
  });

  it('Should allow updating quiz', async () => {
    loadTestQuizRepositoryImplementation(quizRepository, repositoryContents);

    const createdQuiz = await quizService.createNewQuiz(exampleQuiz);
    const createdQuizWithSameId = await quizService.createOrUpdateQuiz(
      exampleQuizWithId1,
    );
    expect(await quizService.findQuizById(exampleQuiz.id)).toEqual(
      exampleQuizWithId1,
    );
    expect(createdQuizWithSameId).toEqual(exampleQuizWithId1);
  });

  it('Should return null when trying to save entities not passing validation', async () => {
    loadTestQuizRepositoryImplementation(quizRepository, repositoryContents);

    const quiz = {
      id: 1,
      title: '',
      createdBy: 'SomeoneOut ThereSomewhere',
      questions: [],
    };

    const createdQuiz = await quizService.createNewQuiz(quiz);

    expect(createdQuiz).toBeNull();
    expect(await quizService.findQuizById(quiz.id)).toBeNull();
  });

  it('Should delete quiz properly', async () => {
    loadTestQuizRepositoryImplementation(quizRepository, repositoryContents);

    const savedQuiz = await quizService.createNewQuiz(exampleQuiz);
    const deleteResult = await quizService.deleteQuizById(exampleQuiz.id);

    expect(await quizService.findQuizById(savedQuiz.id)).toBeNull();
  });
});
