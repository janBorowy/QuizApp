import { Inject, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Quiz } from '../entities/quiz';
import { Repository } from 'typeorm';
import { DatabaseFacade } from '../database/database.facade';
import { QuizDto } from '../dtos/quiz.dto';
import { RecordAlreadyExistsError } from '../exceptions/recordAlreadyExists.error';
import { QuizValidator } from './quiz.validator';
import {
  ValidationResult,
  ValidationStatus,
} from '../validation/validation.result';
import { RecordNotFoundError } from '../exceptions/recordNotFound.error';
import { QuizServiceResponse } from './quiz.service.response';

@Injectable()
export class QuizService {
  private readonly logger = new Logger(QuizService.name);

  constructor(
    @Inject(DatabaseFacade)
    private databaseFacade: DatabaseFacade,
  ) {}

  findQuizById(quizId: number): Promise<QuizServiceResponse> {
    const quizDto = this.databaseFacade.findQuizById(quizId);
    return createFindResponse(quizDto);
  }

  createNewQuiz(quizDto: QuizDto): Promise<QuizDto> {
    if (this.validateQuizAndParseResult(quizDto)) {
      return this.tryToCreateQuiz(quizDto);
    }
    return null;
  }

  createOrUpdateQuiz(quizDto: QuizDto): Promise<QuizDto> {
    if (this.validateQuizAndParseResult(quizDto)) {
      return this.databaseFacade.saveOrUpdateQuiz(quizDto);
    }
    return null;
  }

  /*deleteQuiz(quizDto: QuizDto): void {
    this.deleteQuizById(quizDto.id);
  }*/

  async deleteQuizById(quizId: number) {
    let failureReason = '';
    try {
      await this.databaseFacade.deleteQuizById(quizId);
    } catch (error) {
      if (error instanceof RecordNotFoundError) {
        failureReason = 'record not found in database.';
      }
      this.logDeleteQuizFailure(quizId, failureReason);
    }
  }

  private async tryToCreateQuiz(quizDto: QuizDto): Promise<QuizDto> {
    let failureReason = '';
    try {
      const savedQuizDto = await this.databaseFacade.saveQuiz(quizDto);
      return savedQuizDto;
    } catch (error) {
      if (error instanceof RecordAlreadyExistsError) {
        failureReason = 'record already exists.';
      }
      this.logCreateQuizFailure(quizDto.id, failureReason);
    }
    return null;
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

  private validateQuizAndParseResult(quizDto: QuizDto): boolean {
    const validationResult = this.validateQuiz(quizDto);
    if (validationResult.status == ValidationStatus.FAILURE) {
      this.logQuizValidationFailure(quizDto.id, validationResult.info);
      return false;
    }
    return true;
  }

  private createFindResponse(quizDto: QuizDto): QuizServiceResponse {}
}
