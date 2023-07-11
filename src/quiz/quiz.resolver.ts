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
import { QuizInput } from './types/quiz.input';
import { ResponseStatus } from './quiz.service.response';
import { QuizNotFoundError } from '../exceptions/QuizNotFound.error';
import { RuntimeException } from '@nestjs/core/errors/exceptions';
import { QuizCreationError } from '../exceptions/QuizCreation.error';
import { QuizDeletionError } from '../exceptions/QuizDeletion.error';
import { QuestionInput } from './types/question.input';
import { QuestionCouldNotBeAddedError } from '../exceptions/QuestionCouldNotBeAdded.error';
import { Question } from '../entities/question';

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
  async removeQuestion(@Args('id') questionId: number) {}

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
    throw new QuizCreationError(info);
  }

  private handleQuizDeleteFailureResponse(info: string) {
    throw new QuizDeletionError(info);
  }

  private handleQueryQuizByTitleFailureResponse(info: string) {
    throw new RuntimeException('Unknown error occurred');
  }

  private handleAddQuestionToQuizFailureResponse(info: string) {
    throw new QuestionCouldNotBeAddedError(info);
  }
}
