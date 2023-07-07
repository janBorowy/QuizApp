import { Inject, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Quiz } from '../entities/quiz';
import { Repository } from 'typeorm';
import { DatabaseFacade } from '../database/database.facade';
import { QuizDto } from '../dtos/quiz.dto';
import { RecordAlreadyExistsError } from '../exceptions/recordAlreadyExists.error';

@Injectable()
export class QuizService {
  private readonly logger = new Logger(QuizService.name);

  constructor(
    @Inject(DatabaseFacade)
    private databaseFacade: DatabaseFacade,
  ) {}

  findQuizById(quizId: number): Promise<QuizDto> {
    return this.databaseFacade.findQuizById(quizId);
  }

  createNewQuiz(quizDto: QuizDto): Promise<QuizDto> {
    return this.tryToCreateQuiz(quizDto);
  }

  createOrUpdateQuiz(quizDto: QuizDto): Promise<QuizDto> {
    return this.databaseFacade.saveOrUpdateQuiz(quizDto);
  }

  private async tryToCreateQuiz(quizDto: QuizDto): Promise<QuizDto> {
    let failureReason = '';
    try {
      const savedQuizDto = await this.databaseFacade.saveQuiz(quizDto);
      return savedQuizDto;
    } catch (error) {
      if (error instanceof RecordAlreadyExistsError) {
        failureReason = 'record already exists.';
        this.handleRecordAlreadyExistsError(error);
      }
      console.log(`Failed to create Quiz(id=${quizDto.id}): ${failureReason}`);
    }
    return null;
  }

  private handleRecordAlreadyExistsError(error: Error) {}
}
