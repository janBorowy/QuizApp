import { Field, ObjectType } from '@nestjs/graphql';
import {
  Column,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  RelationId,
} from 'typeorm';
import { Question } from './question';

@Entity()
@ObjectType()
export class Answer {
  @PrimaryGeneratedColumn()
  readonly id: number;

  @Field()
  @Column()
  content: string;

  @ManyToOne((type) => Question)
  question: Question;
  @RelationId((answer: Answer) => answer.question)
  questionId: number;
}
