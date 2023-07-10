import { InjectRepository } from '@nestjs/typeorm';
import { Quiz } from '../entities/quiz';
import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { RecordNotFoundError } from '../exceptions/recordNotFound.error';
import { QuizInput } from '../quiz/types/quiz.input';
import { Question } from '../entities/question';
import { FindOptions } from '@nestjs/schematics';

@Injectable()
export class DatabaseFacade {
  constructor(
    @InjectRepository(Quiz)
    private quizRepository: Repository<Quiz>,
  ) {}

  async saveQuiz(quiz: QuizInput): Promise<Quiz> {
    const savedQuiz = this.quizRepository.create({
      ...quiz,
      questions: [],
    });
    return this.quizRepository.save(savedQuiz);
  }

  findQuizById(quizId: number): Promise<Quiz> {
    const quizPromise = this.quizRepository.findOneBy({ id: quizId });
    return quizPromise;
  }

  findQuizByQuery(query) {
    const quizPromise = this.quizRepository.findBy(query);
    return quizPromise;
  }

  async deleteQuizById(quizId: number) {
    if (!(await this.existsQuizInDatabaseById(quizId))) {
      throw new RecordNotFoundError(quizId);
    }
    const deleteResult = await this.quizRepository.delete(quizId);
  }

  private async existsQuizInDatabaseById(quizId: number): Promise<boolean> {
    return (await this.quizRepository.findOneBy({ id: quizId })) != null;
  }
}
