import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Quiz } from './quiz';

@Entity()
export class Question {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    nullable: false,
  })
  description: string;

  @Column({
    nullable: false,
    default: '',
  })
  type: 'single' | 'multiple' | 'plain' | 'sort';

  @Column({
    name: 'possible_score',
  })
  possibleScore: number;

  @ManyToOne(() => Quiz, (quiz) => quiz.questions)
  quiz: Quiz;
}
