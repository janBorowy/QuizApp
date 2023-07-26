import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Question } from './question';
import { Field, ID, ObjectType } from '@nestjs/graphql';

@Entity()
@ObjectType()
export class Quiz {
  @Field((type) => ID)
  @PrimaryGeneratedColumn()
  readonly id: number;

  @Field()
  @Column({
    nullable: false,
    default: '',
  })
  title: string;

  @Field()
  @Column({
    name: 'created_by',
    nullable: false,
    default: '',
  })
  createdBy: string;

  @Field((type) => [Question])
  @OneToMany(() => Question, (question) => question.quiz, {
    cascade: ['update', 'insert', 'remove'],
  })
  questions: Question[];
}
