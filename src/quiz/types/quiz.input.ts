import { Field, InputType } from '@nestjs/graphql';
import { Quiz } from '../../entities/quiz';

@InputType()
export class QuizInput implements Partial<Quiz> {
  @Field()
  title: string;

  @Field()
  createdBy: string;
}
