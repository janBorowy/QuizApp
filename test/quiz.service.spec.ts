import { Test, TestingModule } from '@nestjs/testing';
import { DatabaseFacade } from '../src/database/database.facade';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Quiz } from '../src/entities/quiz';
import { Repository } from 'typeorm';
import { QuizService } from '../src/quiz/quiz.service';
import { loadTestQuizRepositoryImplementation } from './quiz.repository.test.impl';
import { exampleQuiz, exampleQuizWithId1 } from './testing.data';
import {
  QuizServiceAction,
  ResponseStatus,
} from '../src/quiz/quiz.service.response';
import { find } from 'rxjs';

async function findQuizById(id: number, quizService: QuizService) {
  return (await quizService.findQuizById(id)).quiz;
}

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
            create: jest.fn(),
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

  it('Should find quiz', async () => {
    loadTestQuizRepositoryImplementation(quizRepository, repositoryContents);
    const savedQuiz = await quizRepository.save(exampleQuiz);

    const response = await quizService.findQuizById(savedQuiz.id);
    expect(response.quiz).toEqual(savedQuiz);
    expect(response.responseStatus).toEqual(ResponseStatus.SUCCESS);
    expect(response.action).toEqual(QuizServiceAction.FIND);
  });

  it('Should properly create new quiz', async () => {
    loadTestQuizRepositoryImplementation(quizRepository, repositoryContents);

    const response = await quizService.createNewQuiz(exampleQuiz);
    expect(response.responseStatus).toEqual(ResponseStatus.SUCCESS);
    expect(response.action).toEqual(QuizServiceAction.CREATE);
    expect(await findQuizById(response.quiz.id, quizService)).toEqual(
      response.quiz,
    );
  });

  it('Should return null when trying to save entities not passing validation', async () => {
    loadTestQuizRepositoryImplementation(quizRepository, repositoryContents);

    const quiz = {
      id: 1,
      title: '',
      createdBy: 'SomeoneOut ThereSomewhere',
      questions: [],
    };

    const response = await quizService.createNewQuiz(quiz);

    expect(response.action).toEqual(QuizServiceAction.CREATE);
    expect(response.responseStatus).toEqual(ResponseStatus.FAILURE);
    expect(await findQuizById(response.quiz.id, quizService)).toBeNull();
  });

  it('Should delete quiz properly', async () => {
    loadTestQuizRepositoryImplementation(quizRepository, repositoryContents);

    const saveResponse = await quizService.createNewQuiz(exampleQuiz);
    const response = await quizService.deleteQuizById(exampleQuiz.id);

    expect(response.responseStatus).toEqual(ResponseStatus.SUCCESS);
    expect(response.action).toEqual(QuizServiceAction.DELETE);
    expect(await findQuizById(saveResponse.quiz.id, quizService)).toBeNull();
  });

  it('Should return proper response when trying to delete non existent quiz', async () => {
    loadTestQuizRepositoryImplementation(quizRepository, repositoryContents);

    const response = await quizService.deleteQuizById(1);

    expect(response.responseStatus).toEqual(ResponseStatus.FAILURE);
    expect(response.action).toEqual(QuizServiceAction.DELETE);
  });
});
