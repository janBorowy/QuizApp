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
  return (await quizService.findQuizById(id)).quizDto;
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
    expect(response.quizDto).toEqual(savedQuiz);
    expect(response.responseStatus).toEqual(ResponseStatus.SUCCESS);
    expect(response.action).toEqual(QuizServiceAction.FIND);
  });

  it('Should properly create new quiz', async () => {
    loadTestQuizRepositoryImplementation(quizRepository, repositoryContents);

    const response = await quizService.createNewQuiz(exampleQuiz);
    expect(response.responseStatus).toEqual(ResponseStatus.SUCCESS);
    expect(response.action).toEqual(QuizServiceAction.CREATE);
    expect(await findQuizById(response.quizDto.id, quizService)).toEqual(
      response.quizDto,
    );
  });

  it('Should not allow creating quiz that exists', async () => {
    loadTestQuizRepositoryImplementation(quizRepository, repositoryContents);

    const response = await quizService.createNewQuiz(exampleQuiz);
    const shouldFailResponse = await quizService.createNewQuiz(
      exampleQuizWithId1,
    );

    expect(shouldFailResponse.responseStatus).toEqual(ResponseStatus.FAILURE);
    expect(shouldFailResponse.action).toEqual(QuizServiceAction.CREATE);
    expect(
      await findQuizById(shouldFailResponse.quizDto.id, quizService),
    ).toEqual(response.quizDto);
  });

  it('Should allow updating quiz', async () => {
    loadTestQuizRepositoryImplementation(quizRepository, repositoryContents);

    const response = await quizService.createNewQuiz(exampleQuiz);
    const anotherResponse = await quizService.createOrUpdateQuiz(
      exampleQuizWithId1,
    );
    expect(anotherResponse.responseStatus).toEqual(ResponseStatus.SUCCESS);
    expect(anotherResponse.action).toEqual(QuizServiceAction.UPDATE);
    expect(await findQuizById(anotherResponse.quizDto.id, quizService)).toEqual(
      exampleQuizWithId1,
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
    expect(await findQuizById(response.quizDto.id, quizService)).toBeNull();
  });

  it('Should delete quiz properly', async () => {
    loadTestQuizRepositoryImplementation(quizRepository, repositoryContents);

    const saveResponse = await quizService.createNewQuiz(exampleQuiz);
    const response = await quizService.deleteQuizById(exampleQuiz.id);

    expect(response.responseStatus).toEqual(ResponseStatus.SUCCESS);
    expect(response.action).toEqual(QuizServiceAction.DELETE);
    expect(await findQuizById(saveResponse.quizDto.id, quizService)).toBeNull();
  });

  it('Should return proper response when trying to delete non existent quiz', async () => {
    loadTestQuizRepositoryImplementation(quizRepository, repositoryContents);

    const response = await quizService.deleteQuizById(1);

    expect(response.responseStatus).toEqual(ResponseStatus.FAILURE);
    expect(response.action).toEqual(QuizServiceAction.DELETE);
  });
});
