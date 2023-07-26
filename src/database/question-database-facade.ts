import { InjectRepository } from '@nestjs/typeorm';
import { Quiz } from '../entities/quiz';
import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { Question } from '../entities/question';
import { QuestionInput } from '../quiz/types/question-input';

@Injectable()
export class QuestionDatabaseFacade {
  constructor(
    @InjectRepository(Quiz)
    private quizRepository: Repository<Quiz>,
    @InjectRepository(Question)
    private questionRepository: Repository<Question>,
    private dataSource: DataSource,
  ) {}

  findAllQuizQuestions(quizId: number): Promise<Question[]> {
    const questionsPromise = this.questionRepository.findBy({
      quiz: {
        id: quizId,
      },
    });
    return questionsPromise;
  }

  async saveQuestion(
    questionInput: QuestionInput,
    quizId: number,
  ): Promise<Quiz> {
    const quiz = await this.quizRepository.findOne({
      where: { id: quizId },
      relations: ['questions'],
    });
    const questionToAdd = {
      ...questionInput,
      quiz,
    };
    let quizPromise = null;
    await this.dataSource.transaction(async (manager) => {
      const question = this.questionRepository.create(questionToAdd);
      quiz.questions.push(question);
      quizPromise = this.quizRepository.save(quiz);
    });

    return quizPromise;
  }

  async existsQuestionInDatabaseById(questionId: number): Promise<boolean> {
    return (
      (await this.questionRepository.findOneBy({ id: questionId })) != null
    );
  }
}
