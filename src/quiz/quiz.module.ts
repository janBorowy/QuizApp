import { Module } from '@nestjs/common';
import { QuizResolver } from './quiz.resolver';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Quiz } from '../entities/quiz';
import { Question } from '../entities/question';
import { QuizService } from './quiz.service';
import { QuizGrader } from './quiz-grader';

@Module({
  imports: [TypeOrmModule.forFeature([Quiz, Question])],
  providers: [QuizResolver, QuizService, QuizGrader],
})
export class QuizModule {}
