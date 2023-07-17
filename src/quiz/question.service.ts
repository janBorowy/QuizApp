import { Inject, Injectable, Logger } from '@nestjs/common';
import { Quiz } from '../entities/quiz';
import { QuizNotFoundError } from '../exceptions/quiz-not-found.error';
import { QuestionInput } from './types/question-input';
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

  async addQuestionToQuiz(question: QuestionInput): Promise<Quiz> {
    await this.checkIfQuizExists(question.quizId);
    return this.addQuestion(question);
  }

  async deleteQuestion(questionId: number): Promise<boolean> {
    return await this.questionDatabaseFacade.deleteQuestionById(questionId);
  }

  private async addQuestion(questionInput: QuestionInput): Promise<Quiz> {
    const savedQuiz = await this.questionDatabaseFacade.saveQuestion(
      questionInput,
    );
    return savedQuiz;
  }

  private async checkIfQuizExists(quizId: number) {
    const exists = await this.quizDatabaseFacade.existsQuizInDatabaseById(
      quizId,
    );
    if (!exists) {
      throw new QuizNotFoundError("quiz with given id doesn't exist");
    }
  }
}
