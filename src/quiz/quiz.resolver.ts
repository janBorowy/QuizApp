import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { Inject } from '@nestjs/common';
import { QuizService } from './quiz.service';
import { QuestionService } from '../question/question.service';
import { Quiz } from '../entities/quiz';
import { QuizInput } from './types/quiz.input';
import { QuizServiceResponse, ResponseStatus } from './quiz.service.response';
import { QuizNotFoundError } from '../exceptions/QuizNotFound.error';

@Resolver((of) => Quiz)
export class QuizResolver {
  constructor(
    @Inject(QuizService)
    private quizService: QuizService,
    @Inject(QuestionService)
    private questionService: QuestionService,
  ) {}

  @Query(() => Quiz)
  async quiz(@Args('id') id: number) {
    const response = await this.quizService.findQuizById(id);
    if (response.responseStatus == ResponseStatus.SUCCESS) {
      return response.quiz;
    }
    return this.handleQuizQueryFailureResponse(id);
  }

  @Mutation((returns) => Quiz)
  async addQuiz(@Args('quiz') quizInput: QuizInput): Promise<Quiz> {
    const quiz = this.quizService.createNewQuiz(quizInput);
    return (await quiz).quiz;
  }

  private handleQuizQueryFailureResponse(quizId: number) {
    throw new QuizNotFoundError(quizId);
  }
}
