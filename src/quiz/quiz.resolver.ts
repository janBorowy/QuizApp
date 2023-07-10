import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { Inject } from '@nestjs/common';
import { QuizService } from './quiz.service';
import { QuestionService } from '../question/question.service';
import { Quiz } from '../entities/quiz';
import { QuizInput } from './types/quiz.input';
import { ResponseStatus } from './quiz.service.response';
import { QuizNotFoundError } from '../exceptions/QuizNotFound.error';
import { RuntimeException } from '@nestjs/core/errors/exceptions';
import { QuizCreationError } from '../exceptions/QuizCreation.error';
import { QuizDeletionError } from '../exceptions/QuizDeletion.error';

@Resolver((of) => Quiz)
export class QuizResolver {
  constructor(
    @Inject(QuizService)
    private quizService: QuizService,
    @Inject(QuestionService)
    private questionService: QuestionService,
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
      this.hanldeQueryQuizByTitleFailureResponse(response.info);
    }
    return response.quizzes;
  }

  @Mutation((returns) => Quiz)
  async addQuiz(@Args('quiz') quizInput: QuizInput): Promise<Quiz> {
    const response = await this.quizService.createNewQuiz(quizInput);
    if (response.responseStatus === ResponseStatus.FAILURE) {
      this.handleQuizCreateFailureResponse(response.info);
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
  private handleQuizByIdQueryFailureResponse(info: string) {
    throw new QuizNotFoundError(info);
  }

  private handleQuizCreateFailureResponse(info: string) {
    throw new QuizCreationError(info);
  }

  private handleQuizDeleteFailureResponse(info: string) {
    throw new QuizDeletionError(info);
  }

  private hanldeQueryQuizByTitleFailureResponse(info: string) {
    throw new RuntimeException('Unknown error occurred');
  }
}
