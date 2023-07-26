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
  @Field()
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

  @Field((type) => [String])
  @Column('varchar', { array: true })
  answers: string[];

  @ManyToOne(() => Quiz, {
    onDelete: 'CASCADE',
  })
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
