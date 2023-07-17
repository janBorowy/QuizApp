import { InjectRepository } from '@nestjs/typeorm';
import { Quiz } from '../entities/quiz';
import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { RecordNotFoundError } from '../exceptions/record-not-found.error';
import { Question } from '../entities/question';
import { QuestionInput } from '../quiz/types/question-input';

@Injectable()
export class QuestionDatabaseFacade {
  constructor(
    @InjectRepository(Quiz)
    private quizRepository: Repository<Quiz>,
    @InjectRepository(Question)
    private questionRepository: Repository<Question>,
  ) {}

  findAllQuizQuestions(quizId: number): Promise<Question[]> {
    const questionsPromise = this.questionRepository.findBy({
      quiz: {
        id: quizId,
      },
    });
    return questionsPromise;
  }

  async saveQuestion(questionInput: QuestionInput): Promise<Quiz> {
    const quiz = await this.quizRepository.findOne({
      where: { id: questionInput.quizId },
      relations: ['questions'],
    });
    const questionToAdd = {
      ...questionInput,
      quiz,
    };
    const question = await this.questionRepository.create(questionToAdd);
    quiz.questions.push(question);
    const quizPromise = this.quizRepository.save(quiz);
    return quizPromise;
  }

  async existsQuestionInDatabaseById(questionId: number): Promise<boolean> {
    return (
      (await this.questionRepository.findOneBy({ id: questionId })) != null
    );
  }

  async deleteQuestionById(questionId: number) {
    if (!(await this.existsQuestionInDatabaseById(questionId))) {
      throw new RecordNotFoundError(questionId);
    }
    const deleteResult = await this.questionRepository.delete({
      id: questionId,
    });

    return deleteResult.affected !== null;
  }
}
