import { Field, InputType } from '@nestjs/graphql';
import { Quiz } from '../../entities/quiz';
import { Length } from 'class-validator';

@InputType()
export class QuizInput implements Partial<Quiz> {
  @Field({ nullable: false })
  @Length(10, 100)
  title: string;

  @Field({ nullable: false })
  @Length(10, 100)
  createdBy: string;
}
