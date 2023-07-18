import { Field, ObjectType } from '@nestjs/graphql';
import { AnswerResult } from './answer-result';

@ObjectType()
export class SolveResult {
  @Field(() => [AnswerResult])
  results: AnswerResult[];

  @Field()
  sum: number;

  @Field()
  percent: number;
}
