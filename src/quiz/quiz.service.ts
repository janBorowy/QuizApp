import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Quiz } from '../entities/quiz';
import { Repository } from 'typeorm';
import { DatabaseFacade } from '../database.facade';
import { QuizDto } from '../dtos/quiz.dto';
import { RecordAlreadyExistsError } from '../exceptions/recordAlreadyExists.error';

@Injectable()
export class QuizService {
  constructor(
    @Inject(DatabaseFacade)
    private databaseFacade: DatabaseFacade,
  ) {}

  createNewQuiz(quizDto: QuizDto): Promise<QuizDto> {
    return this.tryToCreateQuiz(quizDto);
  }

  createOrUpdateQuiz(quizDto: QuizDto): Promise<QuizDto> {
    return this.databaseFacade.saveOrUpdateQuiz(quizDto);
  }

  private tryToCreateQuiz(quizDto: QuizDto): Promise<QuizDto> {
    try {
      const savedQuizDto = this.databaseFacade.saveQuiz(quizDto);
      return savedQuizDto;
    } catch (error) {
      if (error instanceof RecordAlreadyExistsError) {
        this.handleRecordAlreadyExistsError(error);
      }
    }
    return null;
  }

  private handleRecordAlreadyExistsError(error: Error) {}
}
