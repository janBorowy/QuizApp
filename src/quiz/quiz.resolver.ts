import {
  Args,
  Int,
  Mutation,
  Parent,
  Query,
  ResolveField,
  Resolver,
} from '@nestjs/graphql';
import { Inject } from '@nestjs/common';
import { QuizService } from './quiz.service';
import { QuestionService } from '../question/question.service';
import { Quiz } from '../entities/quiz';
import { Question } from '../entities/question';
import { QuizInput } from './types/quiz.input';

@Resolver((of) => Quiz)
export class QuizResolver {
  constructor(
    @Inject(QuizService)
    private quizService: QuizService,
    @Inject(QuestionService)
    private questionService: QuestionService,
  ) {}

  @Mutation((returns) => Quiz)
  async addQuiz(@Args('quiz') quizInput: QuizInput): Promise<Quiz> {
    const quiz = this.quizService.createNewQuiz(quizInput);
    return (await quiz).quiz;
  }
}
