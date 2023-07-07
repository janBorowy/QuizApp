import { ResolveField, Resolver, Root } from '@nestjs/graphql';
import { Question } from '../entities/question';
import { Inject } from '@nestjs/common';
import { QuizService } from '../quiz/quiz.service';
import { QuestionService } from './question.service';
import { Quiz } from '../entities/quiz';

@Resolver(() => Question)
export class QuestionResolver {
  constructor(
    @Inject(QuestionService)
    private readonly questionService: QuestionService,
  ) {}

  @ResolveField()
  async question(@Root() quiz: Quiz) {
    return await this.questionService.findQuestionByQuizId(quiz.id);
  }
}
