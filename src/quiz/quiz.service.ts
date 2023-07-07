import { Inject, Injectable, Logger } from '@nestjs/common';
import { DatabaseFacade } from '../database/database.facade';
import { RecordAlreadyExistsError } from '../exceptions/recordAlreadyExists.error';
import { QuizValidator } from './quiz.validator';
import { ValidationStatus } from '../validation/validation.result';
import { RecordNotFoundError } from '../exceptions/recordNotFound.error';
import {
  QuizServiceAction,
  QuizServiceResponse,
  QuizServiceResponseBuilder,
  ResponseStatus,
} from './quiz.service.response';
import { Quiz } from '../entities/quiz';
import { QuizInput } from './types/quiz.input';

@Injectable()
export class QuizService {
  private readonly logger = new Logger(QuizService.name);

  constructor(
    @Inject(DatabaseFacade)
    private databaseFacade: DatabaseFacade,
  ) {}

  async findQuizById(quizId: number): Promise<QuizServiceResponse> {
    const quiz = await this.databaseFacade.findQuizById(quizId);
    return this.createFindResponse(quiz);
  }

  async createNewQuiz(quiz: QuizInput): Promise<QuizServiceResponse> {
    const validationResult = this.validateQuiz(quiz);
    if (validationResult.status == ValidationStatus.FAILURE) {
      return this.createCreateValidationFailedResponse(
        quiz,
        validationResult.info,
      );
    }
    return this.tryToCreateQuiz(quiz);
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

  private async tryToCreateQuiz(quiz: QuizInput): Promise<QuizServiceResponse> {
    let failureReason = '';
    try {
      const savedQuiz = await this.databaseFacade.saveQuiz(quiz);
      return this.createCreateSaveSuccessResponse(savedQuiz);
    } catch (error) {
      if (error instanceof RecordAlreadyExistsError) {
        failureReason = 'Record already exists.';
      }
    }
    return this.createCreateSaveFailureResponse(quiz, failureReason);
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
    return builder
      .quiz(quiz)
      .action(QuizServiceAction.FIND)
      .responseStatus(responseStatus)
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

  private createCreateSaveFailureResponse(
    quiz: QuizInput,
    failureInfo: string,
  ) {
    const builder = new QuizServiceResponseBuilder();
    return builder
      .quiz(quiz)
      .action(QuizServiceAction.CREATE)
      .responseStatus(ResponseStatus.FAILURE)
      .info(failureInfo)
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
}
