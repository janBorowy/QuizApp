import {
  Args,
  Mutation,
  Query,
  ResolveField,
  Resolver,
  Root,
} from '@nestjs/graphql';
import { Inject } from '@nestjs/common';
import { QuizService } from './quiz.service';
import { Quiz } from '../entities/quiz';
import { QuizInput } from './types/quiz-input';
import { ResponseStatus } from './quiz-service-response';
import { QuizNotFoundError } from '../exceptions/quiz-not-found.error';
import { RuntimeException } from '@nestjs/core/errors/exceptions';
import { QuestionCreationError } from '../exceptions/question-creation.error';
import { QuizDeletionError } from '../exceptions/quiz-deletion.error';
import { QuestionInput } from './types/question-input';
import { QuestionCouldNotBeAddedError } from '../exceptions/question-could-not-be-added.error';
import { Question } from '../entities/question';
import { SolveResult } from '../entities/solve-result';
import { SolveQuizInput } from './types/solve-quiz.input';
import { QuestionDeletionError } from '../exceptions/question-deletion.error';

@Resolver((of) => Quiz)
export class QuizResolver {
  constructor(
    @Inject(QuizService)
    private quizService: QuizService,
  ) {}

  @Query(() => Quiz)
  async quizById(@Args('id') id: number) {
    const response = await this.quizService.findQuizById(id);
    if (response.responseStatus === ResponseStatus.FAILURE) {
      return this.handleQuizByIdQueryFailureResponse(response.info);
    }
    return response.quiz;
  }

  @Query(() => [Quiz])
  async quizByTitle(@Args('title') title: string): Promise<Quiz[]> {
    const response = await this.quizService.findQuizByTitle(title);
    if (response.responseStatus === ResponseStatus.FAILURE) {
      this.handleQueryQuizByTitleFailureResponse(response.info);
    }
    return response.quizzes;
  }

  @Query(() => SolveResult)
  async solveQuiz(@Args('solveQuizInput') solveQuizInput: SolveQuizInput) {
    const results = await this.quizService.solveQuiz(
      solveQuizInput.quizId,
      solveQuizInput.answers,
    );
    return results;
  }

  @Mutation((returns) => Quiz)
  async addQuiz(@Args('quiz') quizInput: QuizInput): Promise<Quiz> {
    const response = await this.quizService.createNewQuiz(quizInput);
    if (response.responseStatus === ResponseStatus.FAILURE) {
      this.handleQuizCreateFailureResponse(response.info);
    }
    return response.quiz;
  }

  @Mutation((returns) => Quiz)
  async addQuestion(
    @Args('question') questionInput: QuestionInput,
  ): Promise<Quiz> {
    const response = await this.quizService.addQuestionToQuiz(questionInput);
    if (response.responseStatus === ResponseStatus.FAILURE) {
      this.handleAddQuestionToQuizFailureResponse(response.info);
    }
    return response.quiz;
  }

  @Mutation(() => Quiz)
  async removeQuestion(@Args('id') questionId: number) {
    const response = await this.quizService.deleteQuestion(questionId);
    if (response.responseStatus === ResponseStatus.FAILURE) {
      this.handleQuestionDeleteFailureResponse(response.info);
    }
    return response.quiz;
  }

  @Mutation(() => Quiz)
  async deleteQuiz(@Args('id') id: number): Promise<Quiz> {
    const response = await this.quizService.deleteQuizById(id);
    if (response.responseStatus === ResponseStatus.FAILURE) {
      this.handleQuizDeleteFailureResponse(response.info);
    }
    return response.quiz;
  }

  @ResolveField()
  questions(@Root() quiz: Quiz): Promise<Question[]> {
    return this.quizService.findAllQuizQuestion(quiz.id);
  }

  private handleQuizByIdQueryFailureResponse(info: string) {
    throw new QuizNotFoundError(info);
  }

  private handleQuizCreateFailureResponse(info: string) {
    throw new QuestionCreationError(info);
  }

  private handleQuizDeleteFailureResponse(info: string) {
    throw new QuizDeletionError(info);
  }

  private handleQuestionDeleteFailureResponse(info: string) {
    throw new QuestionDeletionError(info);
  }

  private handleQueryQuizByTitleFailureResponse(info: string) {
    throw new RuntimeException('Unknown error occurred');
  }

  private handleAddQuestionToQuizFailureResponse(info: string) {
    throw new QuestionCouldNotBeAddedError(info);
  }
}
