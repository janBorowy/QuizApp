import { Injectable, Logger } from '@nestjs/common';
import { Quiz } from '../entities/quiz';
import { QuizInput } from './types/quiz-input';
import { QuizNotFoundError } from '../exceptions/quiz-not-found.error';
import { Question } from '../entities/question';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { RecordNotFoundError } from '../exceptions/record-not-found.error';

@Injectable()
export class QuizService {
  private readonly logger = new Logger(QuizService.name);
  constructor(
    @InjectRepository(Quiz)
    private quizRepository: Repository<Quiz>,
    @InjectRepository(Question)
    private questionRepository: Repository<Question>,
    private dataSource: DataSource,
  ) {}

  async createQuiz(quiz: QuizInput): Promise<Quiz> {
    let savedQuiz: Quiz = null;
    await this.dataSource.transaction(async () => {
      const quizToSave = this.quizRepository.create({
        ...quiz,
        questions: [],
      });

      for (const question of quiz.questionInputs) {
        quizToSave.questions.push(this.questionRepository.create(question));
      }

      savedQuiz = await this.quizRepository.save(quizToSave);
    });
    return savedQuiz;
  }

  async findQuizById(quizId: number): Promise<Quiz> {
    const quiz = await this.quizRepository.findOneBy({ id: quizId });
    if (quiz === null) {
      throw new QuizNotFoundError("quiz with given id doesn't exist");
    }
    return quiz;
  }

  async findQuizByTitle(quizTitle: string): Promise<Quiz[]> {
    const quiz = this.quizRepository.findBy({
      title: quizTitle,
    });
    return quiz;
  }

  async deleteQuizById(quizId: number): Promise<void> {
    if (!(await this.existsQuizInDatabaseById(quizId))) {
      throw new RecordNotFoundError(quizId);
    }
    await this.dataSource.transaction(async () => {
      await this.quizRepository.delete(quizId);
    });
  }

  async findAllQuizQuestions(quizId: number): Promise<Question[]> {
    const questions = await this.questionRepository.findBy({
      quiz: {
        id: quizId,
      },
    });
    if (questions === null) {
      return [];
    }
    return questions;
  }

  async existsQuizInDatabaseById(quizId: number): Promise<boolean> {
    return (await this.quizRepository.findOneBy({ id: quizId })) != null;
  }
}
