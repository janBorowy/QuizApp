import { Field, Float, Int, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class SolveResult {
  @Field(() => [Float])
  results: number[];

  @Field()
  sum: number;
}
