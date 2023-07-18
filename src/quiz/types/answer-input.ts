import { Field, InputType, Int } from '@nestjs/graphql';

@InputType()
export default class AnswerInput {
  @Field(() => Int)
  questionId: number;

  @Field(() => String)
  answer: string;
}
