import { Field, Int, ObjectType } from '@nestjs/graphql';
import { QuestionDto } from './question.dto';

@ObjectType()
export class QuizDto {
  @Field((type) => Int, { nullable: true })
  id?: number;

  @Field()
  title: string;

  @Field()
  createdBy: string;

  @Field((type) => [QuestionDto])
  questions: QuestionDto[];
}
