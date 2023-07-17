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

@Resolver((of) => Quiz)
export class QuizResolver {
  constructor(
    @Inject(QuizService)
    private quizService: QuizService,
  ) {}

  @Query(() => Quiz)
  async quizById(@Args('id') id: number) {
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
    const solveResult = await this.quizService.solveQuiz(
      solveQuizInput.quizId,
      solveQuizInput.answers,
    );
    return solveResult;
  }

  @Mutation((returns) => Quiz)
  async addQuiz(@Args('quiz') quizInput: QuizInput): Promise<Quiz> {
    const quiz = await this.quizService.createNewQuiz(quizInput);
    return quiz;
  }

  @Mutation(() => Quiz)
  async deleteQuiz(@Args('id') id: number): Promise<void> {
    await this.quizService.deleteQuizById(id);
  }

  @ResolveField((type) => Quiz)
  questions(@Root() quiz: Quiz): Promise<Question[]> {
    return this.quizService.findAllQuizQuestion(quiz.id);
  }
}
