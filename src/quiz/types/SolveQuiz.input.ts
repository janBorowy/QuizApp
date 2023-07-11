import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class SolveQuizInput {
  @Field()
  quizId: number;

  @Field(() => [String])
  answers: string[];
}
