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
import { Question } from '../entities/question';
import { SolveResult } from '../entities/solve-result';
import { SolveQuizInput } from './types/solve-quiz.input';
import { QuizGrader } from './quiz-grader';

@Resolver((of) => Quiz)
export class QuizResolver {
  constructor(
    @Inject(QuizService)
    private quizService: QuizService,
    @Inject(QuizGrader)
    private quizGrader: QuizGrader,
  ) {}

  @Query(() => Quiz)
  async quiz(@Args('id') id: number) {
    const quiz = await this.quizService.findQuizById(id);
    return quiz;
  }

  @Query(() => [Quiz])
  async quizByTitle(@Args('title') title: string): Promise<Quiz[]> {
    const quizzes = await this.quizService.findQuizByTitle(title);
    return quizzes;
  }

  @Query(() => SolveResult)
  async solveQuiz(@Args('solveQuizInput') solveQuizInput: SolveQuizInput) {
    return await this.quizGrader.solveQuiz(solveQuizInput);
  }

  @Mutation((returns) => Quiz)
  async addQuiz(@Args('quiz') quizInput: QuizInput): Promise<Quiz> {
    return await this.quizService.createQuiz(quizInput);
  }

  @Mutation(() => Boolean)
  async deleteQuiz(@Args('id') id: number): Promise<boolean> {
    await this.quizService.deleteQuizById(id);
    return true;
  }

  @ResolveField((type) => Quiz)
  async questions(@Root() quiz: Quiz): Promise<Question[]> {
    return await this.quizService.findAllQuizQuestions(quiz.id);
  }
}
