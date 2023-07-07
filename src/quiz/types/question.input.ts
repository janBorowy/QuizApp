import { Field, InputType, Int } from '@nestjs/graphql';
import { Question, QuestionType } from '../../entities/question';

@InputType()
export class QuestionInput implements Partial<Question> {
  @Field()
  description: string;

  @Field()
  type: QuestionType;

  @Field((type) => Int)
  possibleScore: number;
}
