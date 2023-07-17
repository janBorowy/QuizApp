import { Field, InputType } from '@nestjs/graphql';
import { Quiz } from '../../entities/quiz';
import { Length } from 'class-validator';
import { QuestionInput } from './question-input';

@InputType()
export class QuizInput implements Partial<Quiz> {
  @Field({ nullable: false })
  @Length(10, 100)
  title: string;

  @Field({ nullable: false })
  @Length(10, 100)
  createdBy: string;

  @Field((type) => [QuestionInput])
  questionInputs: QuestionInput[];
}
