import {
  Column,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  RelationId,
} from 'typeorm';
import { Quiz } from './quiz';
import { Field, ObjectType, registerEnumType } from '@nestjs/graphql';

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
  @Column({
    name: 'possible_score',
  })
  possibleScore: number;

  @ManyToOne(() => Quiz)
  @RelationId((question: Question) => question.quiz)
  quiz: Quiz;
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
