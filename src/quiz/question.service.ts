import { Inject, Injectable, Logger } from '@nestjs/common';
import { QuizDatabaseFacade } from '../database/quiz-database-facade';
import { QuestionDatabaseFacade } from '../database/question-database-facade';

@Injectable()
export class QuestionService {
  private readonly logger = new Logger(QuestionService.name);
  private static readonly NO_QUIZ_WITH_GIVEN_ID_MESSAGE: string =
    'could not find quiz with given id';

  constructor(
    @Inject(QuizDatabaseFacade)
    private quizDatabaseFacade: QuizDatabaseFacade,
    @Inject(QuestionDatabaseFacade)
    private questionDatabaseFacade: QuestionDatabaseFacade,
  ) {}
}
