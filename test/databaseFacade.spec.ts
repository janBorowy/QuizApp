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
  singleQuestion,
  singleQuestionInput,
} from './testing.data';
import { RecordNotFoundError } from '../src/exceptions/recordNotFound.error';
import { Question } from '../src/entities/question';
import { loadTestQuestionRepositoryImplementation } from './question.repository.test.impl';
import { QuestionInput } from '../src/quiz/types/question.input';

describe('DatabaseFacade', () => {
  let databaseFacade: DatabaseFacade;
  let quizRepository: Repository<Quiz>;
  let questionRepository: Repository<Question>;
  const quizRepositoryToken = getRepositoryToken(Quiz);
  const questionRepositoryToken = getRepositoryToken(Question);
  const quizRepositoryContents = new Map<number, Quiz>();
  const questionRepositoryContents = new Map<number, Question>();

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
            findBy: jest.fn(),
          },
        },
        {
          provide: questionRepositoryToken,
          useValue: {
            findOneBy: jest.fn(),
            save: jest.fn(),
            delete: jest.fn(),
            create: jest.fn(),
            findBy: jest.fn(),
          },
        },
      ],
    }).compile();

    databaseFacade = testingModule.get<DatabaseFacade>(DatabaseFacade);
    quizRepository = testingModule.get<Repository<Quiz>>(quizRepositoryToken);
    questionRepository = testingModule.get<Repository<Question>>(
      questionRepositoryToken,
    );
  });

  afterEach(() => {
    quizRepositoryContents.clear();
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
    loadTestQuizRepositoryImplementation(
      quizRepository,
      quizRepositoryContents,
    );

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
    loadTestQuizRepositoryImplementation(
      quizRepository,
      quizRepositoryContents,
    );

    const savedQuiz = await databaseFacade.saveQuiz(exampleQuiz);
    await databaseFacade.deleteQuizById(savedQuiz.id);
    expect(await databaseFacade.findQuizById(savedQuiz.id)).toBeNull();
  });

  it('Should throw when trying to delete absent record', () => {
    loadTestQuizRepositoryImplementation(
      quizRepository,
      quizRepositoryContents,
    );

    expect(databaseFacade.deleteQuizById(exampleQuiz.id)).rejects.toThrow(
      RecordNotFoundError,
    );
  });

  it('Should find quiz by query', async () => {
    loadTestQuizRepositoryImplementation(
      quizRepository,
      quizRepositoryContents,
    );

    const response = await databaseFacade.saveQuiz(exampleQuiz);
    const found = (
      await databaseFacade.findQuizByQuery({
        title: exampleQuiz.title,
      })
    )[0];

    expect(found).not.toBeNull();
    expect(found).toEqual(response);
  });

  it('Should add question to quiz correctly', async () => {
    loadTestQuizRepositoryImplementation(
      quizRepository,
      quizRepositoryContents,
    );
    loadTestQuestionRepositoryImplementation(
      questionRepository,
      questionRepositoryContents,
    );

    const savedQuiz = await databaseFacade.saveQuiz(exampleQuiz);
    const questionToSave = {
      ...singleQuestionInput,
      quizId: savedQuiz.id,
    };

    const savedQuestionQuiz = await databaseFacade.saveQuestion(questionToSave);

    expect(savedQuestionQuiz.questions[0].description).toEqual(
      questionToSave.description,
    );
  });
});
