import { Module } from '@nestjs/common';
import { databaseModule } from './database.module';
import { graphQLModule } from './graphQL.module';
import { QuizModule } from './quiz/quiz.module';

@Module({
  imports: [databaseModule, graphQLModule, QuizModule],
})
export class AppModule {}
