import { InjectRepository } from '@nestjs/typeorm';
import { Quiz } from './entities/quiz';
import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { QuizDto } from './dtos/quiz.dto';
import { RecordAlreadyExistsError } from './exceptions/recordAlreadyExists.error';

@Injectable()
export class DatabaseFacade {
  constructor(
    @InjectRepository(Quiz)
    private quizRepository: Repository<Quiz>,
  ) {}

  async saveQuiz(quizDto: QuizDto): Promise<Quiz> {
    const quizEntity = this.quizDtoToEntity(quizDto);
    if (await this.existsQuizInDatabaseById(quizEntity.id)) {
      throw new RecordAlreadyExistsError(quizEntity.id);
    }
    return this.saveQuizToDatabase(quizEntity);
  }

  saveOrUpdateQuiz(quizDto: QuizDto): Promise<Quiz> {
    const quizEntity = this.quizDtoToEntity(quizDto);
    return this.saveQuizToDatabase(quizEntity);
  }

  findQuizById(quizId: number): Promise<QuizDto> {
    const quizDtoPromise = this.quizRepository.findOneBy({ id: quizId });
    return quizDtoPromise;
  }

  private quizDtoToEntity(quizDto: QuizDto): Quiz {
    // QuizDto is assignable to Quiz
    return quizDto;
  }

  private saveQuizToDatabase(quiz: Quiz): Promise<QuizDto> {
    const savedQuizEntityPromise = this.quizRepository.save(quiz);
    return savedQuizEntityPromise;
  }

  private async existsQuizInDatabaseById(quizId: number): Promise<boolean> {
    return (await this.quizRepository.findOneBy({ id: quizId })) != null;
  }
}
