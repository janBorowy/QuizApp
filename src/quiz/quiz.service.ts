import { Inject, Injectable, Logger } from '@nestjs/common';
import { ValidationStatus } from '../validation/validation-result';
import { Quiz } from '../entities/quiz';
import { QuizInput } from './types/quiz-input';
import { QuizNotFoundError } from '../exceptions/quiz-not-found.error';
import { QuizValidator } from './quiz-validator';
import { Question } from '../entities/question';
import { SolveResult } from '../entities/solve-result';
import { QuizGrader } from './quiz-grader';
import { QuizDatabaseFacade } from '../database/quiz-database-facade';
import { QuestionDatabaseFacade } from '../database/question-database-facade';

@Injectable()
export class QuizService {
  private readonly logger = new Logger(QuizService.name);
  constructor(
    @Inject(QuizDatabaseFacade)
    private quizDatabaseFacade: QuizDatabaseFacade,
    @Inject(QuestionDatabaseFacade)
    private questionDatabaseFacade: QuestionDatabaseFacade,
  ) {}

  async findQuizById(quizId: number): Promise<Quiz> {
    const quiz = await this.quizDatabaseFacade.findQuizById(quizId);
    return quiz;
  }

  async findQuizByTitle(quizTitle: string): Promise<Quiz[]> {
    const quiz = await this.quizDatabaseFacade.findQuizByQuery({
      title: quizTitle,
    });
    return quiz;
  }

  async createNewQuiz(quiz: QuizInput): Promise<Quiz> {
    const validationResult = this.validateQuiz(quiz);
    if (validationResult.status == ValidationStatus.FAILURE) {
      return null;
    }
    return this.createQuiz(quiz);
  }

  async deleteQuizById(quizId: number): Promise<void> {
    return await this.quizDatabaseFacade.deleteQuizById(quizId);
  }

  async solveQuiz(quizId: number, answers: string[]): Promise<SolveResult> {
    await this.checkIfQuizExists(quizId);
    const questions = await this.questionDatabaseFacade.findAllQuizQuestions(
      quizId,
    );
    const results = QuizGrader.gradeQuiz(questions, answers);
    return this.transformResultsToSolveResult(questions, results);
  }

  private async createQuiz(quiz: QuizInput): Promise<Quiz> {
    const savedQuiz = await this.quizDatabaseFacade.saveQuiz(quiz);
    return savedQuiz;
  }

  private validateQuiz(quiz: QuizInput) {
    const validator = new QuizValidator(quiz);
    return validator.validate();
  }

  private async checkIfQuizExists(quizId: number) {
    const exists = await this.quizDatabaseFacade.existsQuizInDatabaseById(
      quizId,
    );
    if (!exists) {
      throw new QuizNotFoundError("quiz with given id doesn't exist");
    }
  }

  private transformResultsToSolveResult(
    questions: Array<Question>,
    results: Array<number>,
  ): SolveResult {
    const pointsAcquired = this.sumAllArrayElements(results);
    const questionPoints = questions.map((question) => question.possibleScore);
    const possiblePointsToGain = this.sumAllArrayElements(questionPoints);
    const percentageAcquired = Math.round(
      (pointsAcquired / possiblePointsToGain) * 100,
    );
    return {
      results: results,
      sum: pointsAcquired,
      percent: percentageAcquired,
    };
  }

  private sumAllArrayElements(array: Array<number>) {
    return array.reduce((partialSum, element) => {
      return partialSum + element;
    });
  }
}
