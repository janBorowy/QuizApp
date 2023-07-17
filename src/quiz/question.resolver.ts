import { Args, Mutation, Resolver } from '@nestjs/graphql';
import { Question } from '../entities/question';
import { Inject } from '@nestjs/common';
import { QuestionService } from './question.service';
import { Quiz } from '../entities/quiz';
import { QuestionInput } from './types/question-input';

@Resolver((of) => Question)
export class QuestionResolver {
  constructor(
    @Inject(QuestionService)
    private questionService: QuestionService,
  ) {}

  @Mutation((returns) => Quiz)
  async addQuestion(
    @Args('question') questionInput: QuestionInput,
  ): Promise<Quiz> {
    const quiz = await this.questionService.addQuestionToQuiz(questionInput);
    return quiz;
  }

  @Mutation(() => Boolean)
  async removeQuestion(@Args('id') questionId: number): Promise<boolean> {
    return await this.questionService.deleteQuestion(questionId);
  }
}
