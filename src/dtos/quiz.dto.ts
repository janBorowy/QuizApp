import { Field, Int, ObjectType } from '@nestjs/graphql';
import { QuestionDto } from './question.dto';

@ObjectType()
export class QuizDto {
  @Field((type) => Int)
  id?: number;

  @Field()
  name: string;

  @Field()
  createdBy: string;

  @Field((type) => [QuestionDto])
  questions: QuestionDto[];
}
