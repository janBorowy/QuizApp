import { Field, Float, Int, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class AnswerResult {
  @Field(() => Float)
  pointsAcquired: number;

  @Field(() => Int)
  questionId: number;
}
