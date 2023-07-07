import { Inject, Injectable, Logger } from '@nestjs/common';
import { DatabaseFacade } from '../database/database.facade';
import { QuizDto } from '../dtos/quiz.dto';
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

@Injectable()
export class QuizService {
  private readonly logger = new Logger(QuizService.name);

  constructor(
    @Inject(DatabaseFacade)
    private databaseFacade: DatabaseFacade,
  ) {}

  async findQuizById(quizId: number): Promise<QuizServiceResponse> {
    const quizDto = await this.databaseFacade.findQuizById(quizId);
    return this.createFindResponse(quizDto);
  }

  async createNewQuiz(quizDto: QuizDto): Promise<QuizServiceResponse> {
    const validationResult = this.validateQuiz(quizDto);
    if (validationResult.status == ValidationStatus.FAILURE) {
      this.logQuizValidationFailure(quizDto.id, validationResult.info);
      return this.createCreateValidationFailedResponse(
        quizDto,
        validationResult.info,
      );
    }
    return this.tryToCreateQuiz(quizDto);
  }

  async createOrUpdateQuiz(quizDto: QuizDto): Promise<QuizServiceResponse> {
    const validationResult = this.validateQuiz(quizDto);
    if (validationResult.status == ValidationStatus.FAILURE) {
      this.logQuizValidationFailure(quizDto.id, validationResult.info);
      return this.createCreateOrUpdateValidationFailedResponse(
        quizDto,
        validationResult.info,
      );
    }
    const savedQuiz = this.databaseFacade.saveOrUpdateQuiz(quizDto);
    return this.createCreateOrUpdateSuccessResponse(quizDto);
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

  private async tryToCreateQuiz(
    quizDto: QuizDto,
  ): Promise<QuizServiceResponse> {
    let failureReason = '';
    try {
      const savedQuizDto = await this.databaseFacade.saveQuiz(quizDto);
      return this.createCreateSaveSuccessResponse(savedQuizDto);
    } catch (error) {
      if (error instanceof RecordAlreadyExistsError) {
        failureReason = 'Record already exists.';
      }
      this.logCreateQuizFailure(quizDto.id, failureReason);
    }
    return this.createCreateSaveFailureResponse(quizDto, failureReason);
  }

  private logCreateQuizFailure(quizId: number, failureReason: string) {
    this.logger.warn(`Failed to create Quiz(id=${quizId}): ${failureReason}`);
  }

  private logDeleteQuizFailure(quizId: number, failureReason: string) {
    this.logger.warn(`Failed to delete Quiz(id=${quizId}): ${failureReason}`);
  }

  private logQuizValidationFailure(quizId: number, info: string) {
    this.logger.warn(`Validation for Quiz(id=${quizId} failed: ${info}`);
  }

  private validateQuiz(quizDto: QuizDto) {
    const validator = new QuizValidator(quizDto);
    return validator.validate();
  }

  private createFindResponse(quizDto: QuizDto): QuizServiceResponse {
    const builder = new QuizServiceResponseBuilder();
    const responseStatus = this.determineFindResponseStatus(quizDto);
    return builder
      .quizDto(quizDto)
      .action(QuizServiceAction.FIND)
      .responseStatus(responseStatus)
      .build();
  }

  private determineFindResponseStatus(quizDto: QuizDto): ResponseStatus {
    if (quizDto == null) {
      return ResponseStatus.FAILURE;
    }
    return ResponseStatus.SUCCESS;
  }

  private createCreateValidationFailedResponse(
    quizDto: QuizDto,
    info: string,
  ): QuizServiceResponse {
    const builder = new QuizServiceResponseBuilder();
    return builder
      .quizDto(quizDto)
      .action(QuizServiceAction.CREATE)
      .responseStatus(ResponseStatus.FAILURE)
      .info(info)
      .build();
  }

  private createCreateOrUpdateValidationFailedResponse(
    quizDto: QuizDto,
    info: string,
  ): QuizServiceResponse {
    const builder = new QuizServiceResponseBuilder();
    return builder
      .quizDto(quizDto)
      .action(QuizServiceAction.UPDATE)
      .responseStatus(ResponseStatus.FAILURE)
      .info(info)
      .build();
  }

  private createCreateSaveSuccessResponse(quizDto: QuizDto) {
    const builder = new QuizServiceResponseBuilder();
    return builder
      .quizDto(quizDto)
      .action(QuizServiceAction.CREATE)
      .responseStatus(ResponseStatus.SUCCESS)
      .build();
  }

  private createCreateSaveFailureResponse(
    quizDto: QuizDto,
    failureInfo: string,
  ) {
    const builder = new QuizServiceResponseBuilder();
    return builder
      .quizDto(quizDto)
      .action(QuizServiceAction.CREATE)
      .responseStatus(ResponseStatus.FAILURE)
      .info(failureInfo)
      .build();
  }

  private createCreateOrUpdateSuccessResponse(quizDto: QuizDto) {
    const builder = new QuizServiceResponseBuilder();
    return builder
      .quizDto(quizDto)
      .action(QuizServiceAction.UPDATE)
      .responseStatus(ResponseStatus.SUCCESS)
      .build();
  }

  private createDeleteSuccessResponse(quizId: number) {
    const builder = new QuizServiceResponseBuilder();
    const quizDtoOnlyId = new QuizDto();
    quizDtoOnlyId.id = quizId;

    return builder
      .quizDto(quizDtoOnlyId)
      .action(QuizServiceAction.DELETE)
      .responseStatus(ResponseStatus.SUCCESS)
      .build();
  }

  private createDeleteFailureResponse(quizId: number, failureReason: string) {
    const builder = new QuizServiceResponseBuilder();
    const quizDtoOnlyId = new QuizDto();
    quizDtoOnlyId.id = quizId;

    return builder
      .quizDto(quizDtoOnlyId)
      .action(QuizServiceAction.DELETE)
      .responseStatus(ResponseStatus.FAILURE)
      .info(failureReason)
      .build();
  }
}
