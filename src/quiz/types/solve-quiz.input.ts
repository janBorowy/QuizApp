import { Field, InputType } from '@nestjs/graphql';
import AnswerInput from './answer-input';

@InputType()
export class SolveQuizInput {
  @Field()
  quizId: number;

  @Field(() => [AnswerInput])
  answerInputs: AnswerInput[];
}
