import { Inject, Module } from '@nestjs/common';
import { QuizResolver } from './quiz.resolver';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Quiz } from '../entities/quiz';
import { Question } from '../entities/question';
import { QuizService } from './quiz.service';
import { SimpleDataUtil } from '../simpleData.util';
import { QuestionService } from '../question/question.service';

@Module({
  imports: [TypeOrmModule.forFeature([Quiz, Question])],
  providers: [QuizResolver, QuizService, QuestionService],
})
export class QuizModule {
  constructor(
    @Inject(QuizService)
    quizService: QuizService,
  ) {
    SimpleDataUtil.populateQuizThroughProvider(quizService);
  }
}
