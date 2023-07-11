import { Inject, Injectable, Logger } from '@nestjs/common';
import { DatabaseFacade } from '../database/database.facade';
import { ValidationStatus } from '../validation/validation.result';
import { RecordNotFoundError } from '../exceptions/recordNotFound.error';
import {
  QuizServiceAction,
  QuizServiceMultipleResponse,
  QuizServiceMultipleResponseBuilder,
  QuizServiceResponse,
  QuizServiceResponseBuilder,
  ResponseStatus,
} from './quiz.service.response';
import { Quiz } from '../entities/quiz';
import { QuizInput } from './types/quiz.input';
import { QuizNotFoundError } from '../exceptions/QuizNotFound.error';
import { QuizValidator } from './quiz.validator';
import { QuestionInput } from './types/question.input';
import { QuestionValidator } from './question.validator';
import { Question } from '../entities/question';

@Injectable()
export class QuizService {
  private readonly logger = new Logger(QuizService.name);
  private static readonly NO_QUIZ_WITH_GIVEN_ID_MESSAGE: string =
    'could not find quiz with given id';

  constructor(
    @Inject(DatabaseFacade)
    private databaseFacade: DatabaseFacade,
  ) {}

  async findQuizById(quizId: number): Promise<QuizServiceResponse> {
    const quiz = await this.databaseFacade.findQuizById(quizId);
    return this.createFindResponse(quiz);
  }

  async findAllQuizQuestion(quizId: number): Promise<Question[]> {
    const quizzes = await this.databaseFacade.findAllQuizQuestions(quizId);
    return quizzes;
  }

  async findQuizByTitle(
    quizTitle: string,
  ): Promise<QuizServiceMultipleResponse> {
    const quiz = await this.databaseFacade.findQuizByQuery({
      title: quizTitle,
    });
    return this.createFindByQueryResponse(quiz);
  }

  async createNewQuiz(quiz: QuizInput): Promise<QuizServiceResponse> {
    const validationResult = this.validateQuiz(quiz);
    if (validationResult.status == ValidationStatus.FAILURE) {
      return this.createCreateValidationFailedResponse(
        quiz,
        validationResult.info,
      );
    }
    return this.createQuiz(quiz);
  }

  /*deleteQuiz(quizDto: QuizDto): void {
    this.deleteQuizById(quizDto.id);
  }*/

  async deleteQuizById(quizId: number): Promise<QuizServiceResponse> {
    let failureReason = '';
    try {
      await this.databaseFacade.deleteQuizById(quizId);
      return this.createDeleteSuccessResponse(quizId);
    } catch (error) {
      if (error instanceof RecordNotFoundError) {
        failureReason = 'Record not found in database.';
      }
      this.logDeleteQuizFailure(quizId, failureReason);
      return this.createDeleteFailureResponse(quizId, failureReason);
    }
  }

  async addQuestionToQuiz(
    question: QuestionInput,
  ): Promise<QuizServiceResponse> {
    await this.checkIfQuizExists(question.quizId);
    const validationResult = this.validateQuestion(question);
    if (validationResult.status === ValidationStatus.FAILURE) {
      return this.createAddQuestionValidationFailedResponse(
        question,
        validationResult.info,
      );
    }
    return this.addQuestion(question);
  }

  private async createQuiz(quiz: QuizInput): Promise<QuizServiceResponse> {
    const savedQuiz = await this.databaseFacade.saveQuiz(quiz);
    return this.createCreateSaveSuccessResponse(savedQuiz);
  }

  private logDeleteQuizFailure(quizId: number, failureReason: string) {
    this.logger.warn(`Failed to delete Quiz(id=${quizId}): ${failureReason}`);
  }

  private validateQuiz(quiz: QuizInput) {
    const validator = new QuizValidator(quiz);
    return validator.validate();
  }

  private createFindResponse(quiz: Quiz): QuizServiceResponse {
    const builder = new QuizServiceResponseBuilder();
    const responseStatus = this.determineFindResponseStatus(quiz);
    let info = '';
    if (responseStatus === ResponseStatus.FAILURE) {
      info = QuizService.NO_QUIZ_WITH_GIVEN_ID_MESSAGE;
    }
    return builder
      .quiz(quiz)
      .action(QuizServiceAction.FIND)
      .responseStatus(responseStatus)
      .info(info)
      .build();
  }

  private determineFindResponseStatus(quiz: Quiz): ResponseStatus {
    if (quiz == null) {
      return ResponseStatus.FAILURE;
    }
    return ResponseStatus.SUCCESS;
  }

  private createCreateValidationFailedResponse(
    quiz: QuizInput,
    info: string,
  ): QuizServiceResponse {
    const builder = new QuizServiceResponseBuilder();
    return builder
      .quiz(quiz)
      .action(QuizServiceAction.CREATE)
      .responseStatus(ResponseStatus.FAILURE)
      .info(info)
      .build();
  }

  private createCreateOrUpdateValidationFailedResponse(
    quiz: QuizInput,
    info: string,
  ): QuizServiceResponse {
    const builder = new QuizServiceResponseBuilder();
    return builder
      .quiz(quiz)
      .action(QuizServiceAction.UPDATE)
      .responseStatus(ResponseStatus.FAILURE)
      .info(info)
      .build();
  }

  private createCreateSaveSuccessResponse(quiz: Quiz) {
    const builder = new QuizServiceResponseBuilder();
    return builder
      .quiz(quiz)
      .action(QuizServiceAction.CREATE)
      .responseStatus(ResponseStatus.SUCCESS)
      .build();
  }

  private createCreateOrUpdateSuccessResponse(quiz: QuizInput) {
    const builder = new QuizServiceResponseBuilder();
    return builder
      .quiz(quiz)
      .action(QuizServiceAction.UPDATE)
      .responseStatus(ResponseStatus.SUCCESS)
      .build();
  }

  private createDeleteSuccessResponse(quizId: number) {
    const builder = new QuizServiceResponseBuilder();
    const quizOnlyId: Quiz = {
      id: quizId,
      title: '',
      createdBy: '',
      questions: [],
    };

    return builder
      .quiz(quizOnlyId)
      .action(QuizServiceAction.DELETE)
      .responseStatus(ResponseStatus.SUCCESS)
      .build();
  }

  private createDeleteFailureResponse(quizId: number, failureReason: string) {
    const builder = new QuizServiceResponseBuilder();
    const quizOnlyId: Quiz = {
      id: quizId,
      title: '',
      createdBy: '',
      questions: [],
    };

    return builder
      .quiz(quizOnlyId)
      .action(QuizServiceAction.DELETE)
      .responseStatus(ResponseStatus.FAILURE)
      .info(failureReason)
      .build();
  }

  private createFindByQueryResponse(quizzes: Quiz[]) {
    const builder = new QuizServiceMultipleResponseBuilder();

    return builder
      .quizzes(quizzes)
      .action(QuizServiceAction.FIND)
      .responseStatus(ResponseStatus.SUCCESS)
      .build();
  }

  private handleAddQuestionQuizDoesntExist(info: string) {
    throw new QuizNotFoundError(info);
  }

  private validateQuestion(question: QuestionInput) {
    const validator = new QuestionValidator(question);
    return validator.validate();
  }

  private createAddQuestionValidationFailedResponse(
    question: QuestionInput,
    info: string,
  ) {
    const builder = new QuizServiceResponseBuilder();

    return builder
      .action(QuizServiceAction.CREATE)
      .info(info)
      .quiz(null)
      .responseStatus(ResponseStatus.FAILURE)
      .build();
  }

  private createAddQuestionQuizDoesntExistResponse(quizId: number) {
    const builder = new QuizServiceResponseBuilder();

    return builder
      .action(QuizServiceAction.CREATE)
      .responseStatus(ResponseStatus.FAILURE)
      .info(`Quiz with id=${quizId} doesn't exist`)
      .build();
  }

  private async addQuestion(questionInput: QuestionInput) {
    const quiz = await this.databaseFacade.saveQuestion(questionInput);
    return this.createAddQuestionSuccessResponse(quiz);
  }

  private async checkIfQuizExists(quizId: number) {
    const exists = await this.databaseFacade.existsQuizInDatabaseById(quizId);
    if (!exists) {
      throw new QuizNotFoundError("quiz with given id doesn't exist");
    }
  }

  private createAddQuestionSuccessResponse(quiz: Quiz) {
    const builder = new QuizServiceResponseBuilder();
    return builder
      .responseStatus(ResponseStatus.SUCCESS)
      .action(QuizServiceAction.CREATE)
      .quiz(quiz)
      .build();
  }
}
