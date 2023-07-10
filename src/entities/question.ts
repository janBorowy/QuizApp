import {
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  RelationId,
} from 'typeorm';
import { Quiz } from './quiz';
import { Field, ObjectType, registerEnumType } from '@nestjs/graphql';
import { Answer } from './answer';

@Entity()
@ObjectType()
export class Question {
  @PrimaryGeneratedColumn()
  id: number;

  @Field()
  @Column({
    nullable: false,
  })
  description: string;

  @Field(() => QuestionType)
  @Column({
    nullable: false,
  })
  type: QuestionType;

  @Field()
  @Column()
  possibleScore: number;

  @Field()
  @Column()
  correctAnswerString: string;

  @Field((type) => [Answer])
  @OneToMany((type) => Answer, (answer) => answer.question, { cascade: true })
  answers: Answer[];

  @ManyToOne(() => Quiz)
  quiz: Quiz;
  @RelationId((question: Question) => question.quiz)
  quizId: number;
}

export enum QuestionType {
  SINGLE,
  MULTIPLE,
  PLAIN,
  SORT,
}

registerEnumType(QuestionType, {
  name: 'questionType',
});
