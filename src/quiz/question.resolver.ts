import { Resolver } from '@nestjs/graphql';
import { Question } from '../entities/question';
import { Inject } from '@nestjs/common';
import { QuestionService } from './question.service';

@Resolver((of) => Question)
export class QuestionResolver {
  constructor(
    @Inject(QuestionService)
    private questionService: QuestionService,
  ) {}
}
