import { Inject, Injectable, Logger } from '@nestjs/common';
import { ValidationStatus } from '../validation/validation-result';
import { RecordNotFoundError } from '../exceptions/record-not-found.error';
import {
  QuizServiceAction,
  QuizServiceMultipleResponse,
  QuizServiceMultipleResponseBuilder,
  QuizServiceResponse,
  QuizServiceResponseBuilder,
  ResponseStatus,
} from './quiz-service-response';
import { Quiz } from '../entities/quiz';
import { QuizInput } from './types/quiz-input';
import { QuizNotFoundError } from '../exceptions/quiz-not-found.error';
import { QuizValidator } from './quiz-validator';
import { QuestionInput } from './types/question-input';
import { QuestionValidator } from './question-validator';
import { Question } from '../entities/question';
import { SolveResult } from '../entities/solve-result';
import { QuizGrader } from './quiz-grader';
import { QueryFailedError } from 'typeorm';
import { QuizDatabaseFacade } from '../database/quiz-database-facade';
import { QuestionDatabaseFacade } from '../database/question-database-facade';

@Injectable()
export class QuizService {
  private readonly logger = new Logger(QuizService.name);
  private static readonly NO_QUIZ_WITH_GIVEN_ID_MESSAGE: string =
    'could not find quiz with given id';

  constructor(
    @Inject(QuizDatabaseFacade)
    private quizDatabaseFacade: QuizDatabaseFacade,
    @Inject(QuestionDatabaseFacade)
    private questionDatabaseFacade: QuestionDatabaseFacade,
  ) {}

  async findQuizById(quizId: number): Promise<QuizServiceResponse> {
    const quiz = await this.quizDatabaseFacade.findQuizById(quizId);
    return this.createFindResponse(quiz);
  }

  async findAllQuizQuestion(quizId: number): Promise<Question[]> {
    const quizzes = await this.questionDatabaseFacade.findAllQuizQuestions(
      quizId,
    );
    return quizzes;
  }

  async findQuizByTitle(
    quizTitle: string,
  ): Promise<QuizServiceMultipleResponse> {
    const quiz = await this.quizDatabaseFacade.findQuizByQuery({
      title: quizTitle,
    });
    return this.createFindByQueryResponse(quiz);
  }

  async createNewQuiz(quiz: QuizInput): Promise<QuizServiceResponse> {
    const validationResult = this.validateQuiz(quiz);
    if (validationResult.status == ValidationStatus.FAILURE) {
      return this.createCreateValidationFailedResponse(
        quiz,
        validationResult.info,
      );
    }
    return this.createQuiz(quiz);
  }

  async deleteQuizById(quizId: number): Promise<QuizServiceResponse> {
    let failureReason = 'unknown reason';
    try {
      await this.quizDatabaseFacade.deleteQuizById(quizId);
      return this.createDeleteSuccessResponse(quizId);
    } catch (error) {
      if (error instanceof RecordNotFoundError) {
        failureReason = 'Record not found in database.';
      }
      if (error instanceof QueryFailedError) {
        failureReason = "driver error occurred - shouldn't happen";
      }
      this.logDeleteQuizFailure(quizId, failureReason);
      return this.createDeleteFailureResponse(quizId, failureReason);
    }
  }

  async addQuestionToQuiz(
    question: QuestionInput,
  ): Promise<QuizServiceResponse> {
    await this.checkIfQuizExists(question.quizId);
    const validationResult = this.validateQuestion(question);
    if (validationResult.status === ValidationStatus.FAILURE) {
      return this.createAddQuestionValidationFailedResponse(
        question,
        validationResult.info,
      );
    }
    return this.addQuestion(question);
  }

  async solveQuiz(quizId: number, answers: string[]): Promise<SolveResult> {
    await this.checkIfQuizExists(quizId);
    const questions = await this.questionDatabaseFacade.findAllQuizQuestions(
      quizId,
    );
    const results = QuizGrader.gradeQuiz(questions, answers);
    return this.transformResultsToSolveResult(questions, results);
  }

  async deleteQuestion(questionId: number) {
    let failureReason = 'unknown reason';
    try {
      await this.questionDatabaseFacade.deleteQuestionById(questionId);
    } catch (error) {
      if (error instanceof RecordNotFoundError) {
        failureReason = 'Record not found in database.';
      }
      if (error instanceof QueryFailedError) {
        failureReason = "driver error occurred - shouldn't happen";
      }
      return this.createDeleteFailureResponse(questionId, failureReason);
    }
    return this.createDeleteSuccessResponse(questionId);
  }

  private async createQuiz(quiz: QuizInput): Promise<QuizServiceResponse> {
    const savedQuiz = await this.quizDatabaseFacade.saveQuiz(quiz);
    return this.createCreateSaveSuccessResponse(savedQuiz);
  }

  private logDeleteQuizFailure(quizId: number, failureReason: string) {
    this.logger.warn(`Failed to delete Quiz(id=${quizId}): ${failureReason}`);
  }

  private validateQuiz(quiz: QuizInput) {
    const validator = new QuizValidator(quiz);
    return validator.validate();
  }

  private createFindResponse(quiz: Quiz): QuizServiceResponse {
    const builder = new QuizServiceResponseBuilder();
    const responseStatus = this.determineFindResponseStatus(quiz);
    let info = '';
    if (responseStatus === ResponseStatus.FAILURE) {
      info = QuizService.NO_QUIZ_WITH_GIVEN_ID_MESSAGE;
    }
    return builder
      .quiz(quiz)
      .action(QuizServiceAction.FIND)
      .responseStatus(responseStatus)
      .info(info)
      .build();
  }

  private determineFindResponseStatus(quiz: Quiz): ResponseStatus {
    if (quiz == null) {
      return ResponseStatus.FAILURE;
    }
    return ResponseStatus.SUCCESS;
  }

  private createCreateValidationFailedResponse(
    quiz: QuizInput,
    info: string,
  ): QuizServiceResponse {
    const builder = new QuizServiceResponseBuilder();
    return builder
      .quiz(quiz)
      .action(QuizServiceAction.CREATE)
      .responseStatus(ResponseStatus.FAILURE)
      .info(info)
      .build();
  }

  private createCreateOrUpdateValidationFailedResponse(
    quiz: QuizInput,
    info: string,
  ): QuizServiceResponse {
    const builder = new QuizServiceResponseBuilder();
    return builder
      .quiz(quiz)
      .action(QuizServiceAction.UPDATE)
      .responseStatus(ResponseStatus.FAILURE)
      .info(info)
      .build();
  }

  private createCreateSaveSuccessResponse(quiz: Quiz) {
    const builder = new QuizServiceResponseBuilder();
    return builder
      .quiz(quiz)
      .action(QuizServiceAction.CREATE)
      .responseStatus(ResponseStatus.SUCCESS)
      .build();
  }

  private createCreateOrUpdateSuccessResponse(quiz: QuizInput) {
    const builder = new QuizServiceResponseBuilder();
    return builder
      .quiz(quiz)
      .action(QuizServiceAction.UPDATE)
      .responseStatus(ResponseStatus.SUCCESS)
      .build();
  }

  private createDeleteSuccessResponse(quizId: number) {
    const builder = new QuizServiceResponseBuilder();
    const quizOnlyId: Quiz = {
      id: quizId,
      title: '',
      createdBy: '',
      questions: [],
    };

    return builder
      .quiz(quizOnlyId)
      .action(QuizServiceAction.DELETE)
      .responseStatus(ResponseStatus.SUCCESS)
      .build();
  }

  private createDeleteFailureResponse(quizId: number, failureReason: string) {
    const builder = new QuizServiceResponseBuilder();
    const quizOnlyId: Quiz = {
      id: quizId,
      title: '',
      createdBy: '',
      questions: [],
    };

    return builder
      .quiz(quizOnlyId)
      .action(QuizServiceAction.DELETE)
      .responseStatus(ResponseStatus.FAILURE)
      .info(failureReason)
      .build();
  }

  private createFindByQueryResponse(quizzes: Quiz[]) {
    const builder = new QuizServiceMultipleResponseBuilder();

    return builder
      .quizzes(quizzes)
      .action(QuizServiceAction.FIND)
      .responseStatus(ResponseStatus.SUCCESS)
      .build();
  }

  private handleAddQuestionQuizDoesntExist(info: string) {
    throw new QuizNotFoundError(info);
  }

  private validateQuestion(question: QuestionInput) {
    const validator = new QuestionValidator(question);
    return validator.validate();
  }

  private createAddQuestionValidationFailedResponse(
    question: QuestionInput,
    info: string,
  ) {
    const builder = new QuizServiceResponseBuilder();

    return builder
      .action(QuizServiceAction.CREATE)
      .info(info)
      .quiz(null)
      .responseStatus(ResponseStatus.FAILURE)
      .build();
  }

  private createAddQuestionQuizDoesntExistResponse(quizId: number) {
    const builder = new QuizServiceResponseBuilder();

    return builder
      .action(QuizServiceAction.CREATE)
      .responseStatus(ResponseStatus.FAILURE)
      .info(`Quiz with id=${quizId} doesn't exist`)
      .build();
  }

  private async addQuestion(questionInput: QuestionInput) {
    const quiz = await this.questionDatabaseFacade.saveQuestion(questionInput);
    return this.createAddQuestionSuccessResponse(quiz);
  }

  private async checkIfQuizExists(quizId: number) {
    const exists = await this.quizDatabaseFacade.existsQuizInDatabaseById(
      quizId,
    );
    if (!exists) {
      throw new QuizNotFoundError("quiz with given id doesn't exist");
    }
  }

  private createAddQuestionSuccessResponse(quiz: Quiz) {
    const builder = new QuizServiceResponseBuilder();
    return builder
      .responseStatus(ResponseStatus.SUCCESS)
      .action(QuizServiceAction.CREATE)
      .quiz(quiz)
      .build();
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
