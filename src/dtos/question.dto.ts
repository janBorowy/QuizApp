import { Field, Int, ObjectType } from '@nestjs/graphql';
import { QuizDto } from './quiz.dto';

@ObjectType()
export class QuestionDto {
  @Field((type) => Int, { nullable: true })
  id: number;

  @Field()
  description: string;

  @Field()
  type: 'single' | 'multiple' | 'plain' | 'sort';

  @Field()
  possibleScore: number;

  @Field((type) => [QuizDto])
  quiz: QuizDto;
}
