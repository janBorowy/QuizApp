import { InjectRepository } from '@nestjs/typeorm';
import { Quiz } from '../entities/quiz';
import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { QuizDto } from '../dtos/quiz.dto';
import { RecordAlreadyExistsError } from '../exceptions/recordAlreadyExists.error';
import { RecordNotFoundError } from '../exceptions/recordNotFound.error';

@Injectable()
export class DatabaseFacade {
  constructor(
    @InjectRepository(Quiz)
    private quizRepository: Repository<Quiz>,
  ) {}

  async saveQuiz(quizDto: QuizDto): Promise<QuizDto> {
    if (
      quizDto.id != undefined &&
      (await this.existsQuizInDatabaseById(quizDto.id))
    ) {
      throw new RecordAlreadyExistsError(quizDto.id);
    }
    return this.saveQuizToDatabase(quizDto);
  }

  saveOrUpdateQuiz(quizDto: QuizDto): Promise<QuizDto> {
    return this.saveQuizToDatabase(quizDto);
  }

  findQuizById(quizId: number): Promise<QuizDto> {
    const quizDtoPromise = this.quizRepository.findOneBy({ id: quizId });
    return quizDtoPromise;
  }

  async deleteQuizById(quizId: number) {
    if (!(await this.existsQuizInDatabaseById(quizId))) {
      throw new RecordNotFoundError(quizId);
    }
    const deleteResult = await this.quizRepository.delete(quizId);
  }

  private saveQuizToDatabase(quizDto: QuizDto): Promise<QuizDto> {
    const savedQuizEntityPromise = this.quizRepository.save(quizDto);
    return savedQuizEntityPromise;
  }

  private async existsQuizInDatabaseById(quizId: number): Promise<boolean> {
    return (await this.quizRepository.findOneBy({ id: quizId })) != null;
  }
}
