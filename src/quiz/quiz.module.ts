import { Module } from '@nestjs/common';
import { QuizResolver } from './quiz.resolver';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Quiz } from '../entities/quiz';
import { Question } from '../entities/question';
import { QuizService } from './quiz.service';
import { QuestionService } from '../question/question.service';
import { DatabaseFacade } from '../database/database.facade';
import { Answer } from '../entities/answer';

@Module({
  imports: [TypeOrmModule.forFeature([Quiz, Question, Answer])],
  providers: [QuizResolver, QuizService, QuestionService, DatabaseFacade],
})
export class QuizModule {}
