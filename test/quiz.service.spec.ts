import { Test, TestingModule } from '@nestjs/testing';
import { QuizService } from '../src/quiz/quiz.service';
import { QuestionDatabaseFacade } from '../src/database/question-database-facade';
import { QuizDatabaseFacade } from '../src/database/quiz-database-facade';

describe('QuizService', () => {
  let quizDatabaseFacade: QuizDatabaseFacade;
  let questionDatabaseFacade: QuestionDatabaseFacade;
  beforeEach(async () => {
    const testingModule: TestingModule = await Test.createTestingModule({
      providers: [QuizService, QuizDatabaseFacade, QuestionDatabaseFacade],
    }).compile();

    quizDatabaseFacade =
      testingModule.get<QuizDatabaseFacade>(QuizDatabaseFacade);
    questionDatabaseFacade = testingModule.get<QuestionDatabaseFacade>(
      QuestionDatabaseFacade,
    );
  });

  describe('solveQuiz', () => {});
});
