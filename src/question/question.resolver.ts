import { ResolveField, Resolver, Root } from '@nestjs/graphql';
import { Question } from '../entities/question';
import { Inject } from '@nestjs/common';
import { QuestionService } from './question.service';

@Resolver(() => Question)
export class QuestionResolver {
  constructor(
    @Inject(QuestionService)
    private readonly questionService: QuestionService,
  ) {}
}
