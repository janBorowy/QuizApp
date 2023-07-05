import { Field, Int, ObjectType } from '@nestjs/graphql';
import { QuizDto } from './quiz.dto';

@ObjectType()
export class QuestionDto {
  @Field((type) => Int)
  id: number;

  @Field()
  description: string;

  @Field()
  type: 'single' | 'multiple' | 'plain' | 'sort';

  @Field((type) => [QuizDto])
  quiz: QuizDto;
}
