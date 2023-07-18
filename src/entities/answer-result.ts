import { Field, Float, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class AnswerResult {
  @Field(() => Float)
  pointsAcquired: number;

  @Field()
  questionId: number;
}
