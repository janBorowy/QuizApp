import { Module } from '@nestjs/common';
import { databaseModule } from './database/database.module';
import { graphQLModule } from './graphQL.module';
import { QuizModule } from './quiz/quiz.module';
import { LoggerModule } from './logging/logger.module';

@Module({
  imports: [databaseModule, graphQLModule, QuizModule, LoggerModule],
})
export class AppModule {}
