import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Question } from './question';

@Entity()
export class Quiz {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    nullable: false,
    default: '',
  })
  name: string;

  @Column({
    name: 'created_by',
    nullable: false,
    default: '',
  })
  createdBy: string;

  @OneToMany(() => Question, (question) => question.quiz, {
    cascade: true,
    onDelete: 'CASCADE',
  })
  questions: Question[];
}
