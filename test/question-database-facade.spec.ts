import { Test, TestingModule } from '@nestjs/testing';
import { QuizDatabaseFacade } from '../src/database/quiz-database-facade';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Question } from '../src/entities/question';
import { Quiz } from '../src/entities/quiz';
import {
  exampleQuiz,
  plainQuestion,
  singleQuestion,
  singleQuestionInput,
} from './testing.data';
import { Repository } from 'typeorm';
import { QuestionDatabaseFacade } from '../src/database/question-database-facade';

describe('QuizDatabaseFacade', () => {
  let questionDatabaseFacade: QuestionDatabaseFacade;
  let quizRepository: Repository<Quiz>;
  let questionRepository: Repository<Question>;
  beforeEach(async () => {
    const testingModule: TestingModule = await Test.createTestingModule({
      providers: [
        QuestionDatabaseFacade,
        {
          provide: getRepositoryToken(Question),
          useValue: {
            findBy: () => {},
            create: () => {},
            findOneBy: () => {},
          },
        },
        {
          provide: getRepositoryToken(Quiz),
          useValue: {
            findOne: () => {},
            save: () => {},
          },
        },
      ],
    }).compile();
    questionDatabaseFacade = testingModule.get<QuestionDatabaseFacade>(
      QuestionDatabaseFacade,
    );
    quizRepository = testingModule.get<Repository<Quiz>>(
      getRepositoryToken(Quiz),
    );
    questionRepository = testingModule.get<Repository<Question>>(
      getRepositoryToken(Question),
    );
  });

  describe('findAllQuizQuestions', () => {
    it('Should file all questions associated with id', async () => {
      const result = [singleQuestion, plainQuestion];

      jest.spyOn(questionRepository, 'findBy').mockResolvedValue(result);
      expect(await questionDatabaseFacade.findAllQuizQuestions(1)).toEqual(
        result,
      );
    });
    it('Should return empty array for no questions associated with given id', async () => {
      jest.spyOn(questionRepository, 'findBy').mockResolvedValue([]);
      expect(await questionDatabaseFacade.findAllQuizQuestions(1)).toEqual([]);
    });
  });

  describe('saveQuestion', () => {
    it('Should save question correctly', async () => {
      const questionInput = singleQuestionInput;
      const result = exampleQuiz;
      result.questions = [singleQuestion];

      jest.spyOn(quizRepository, 'findOne').mockResolvedValue(exampleQuiz);
      jest.spyOn(questionRepository, 'create').mockReturnValue(singleQuestion);
      jest.spyOn(quizRepository, 'save').mockResolvedValue(result);

      expect(
        await questionDatabaseFacade.saveQuestion(
          singleQuestionInput,
          exampleQuiz.id,
        ),
      ).toEqual(result);
    });

    describe('existsQuestionInDatabaseById', () => {
      it('Should return true if exists', async () => {
        jest
          .spyOn(questionRepository, 'findOneBy')
          .mockResolvedValue(singleQuestion);
        expect(
          await questionDatabaseFacade.existsQuestionInDatabaseById(1),
        ).toBeTruthy();
      });

      it('Should return false if record does not exist', async () => {
        jest.spyOn(questionRepository, 'findOneBy').mockResolvedValue(null);
        expect(
          await questionDatabaseFacade.existsQuestionInDatabaseById(1),
        ).toBeFalsy();
      });
    });
  });
});
