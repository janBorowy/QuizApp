import { Module } from '@nestjs/common';
import { QuizResolver } from './quiz-resolver';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Quiz } from '../entities/quiz';
import { Question } from '../entities/question';
import { QuizService } from './quiz.service';
import { QuizDatabaseFacade } from '../database/quiz-database-facade';
import { QuestionDatabaseFacade } from '../database/question-database-facade';
import { QuestionService } from './question.service';

@Module({
  imports: [TypeOrmModule.forFeature([Quiz, Question])],
  providers: [
    QuizResolver,
    QuizService,
    QuestionService,
    QuizDatabaseFacade,
    QuestionDatabaseFacade,
  ],
})
export class QuizModule {}
