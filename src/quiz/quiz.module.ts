import { Inject, Module } from '@nestjs/common';
import { QuizResolver } from './quiz.resolver';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Quiz } from '../entities/quiz';
import { Question } from '../entities/question';
import { QuizService } from './quiz.service';
import { SimpleDataUtil } from '../simpleData.util';
import { QuestionService } from '../question/question.service';
import { DatabaseFacade } from '../database/database.facade';

@Module({
  imports: [TypeOrmModule.forFeature([Quiz, Question])],
  providers: [QuizResolver, QuizService, QuestionService, DatabaseFacade],
})
export class QuizModule {
  constructor(
    @Inject(DatabaseFacade)
    databaseFacade: DatabaseFacade,
  ) {
    SimpleDataUtil.populateDatabaseThroughFacade(databaseFacade);
  }
}
