import { Field, InputType, Int } from '@nestjs/graphql';
import { Question, QuestionType } from '../../entities/question';
import { Length } from 'class-validator';

@InputType()
export class QuestionInput implements Partial<Question> {
  @Field({ nullable: false })
  @Length(5, 200)
  description: string;

  @Field((type) => QuestionType, { nullable: false })
  type: QuestionType;

  @Field((type) => Int, { nullable: false })
  possibleScore: number;

  @Field({ nullable: false })
  correctAnswerString: string;

  @Field()
  quizId: number;

  @Field((type) => [String])
  answers: string[];
}
