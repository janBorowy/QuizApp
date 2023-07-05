import {
  Args,
  Int,
  Parent,
  Query,
  ResolveField,
  Resolver,
} from '@nestjs/graphql';
import { Inject } from '@nestjs/common';
import { QuizService } from './quiz.service';
import { QuizDto } from '../dtos/quiz.dto';
import { QuestionDto } from '../dtos/question.dto';
import { QuestionService } from '../question/question.service';

@Resolver((of) => QuizDto)
export class QuizResolver {
  constructor(
    @Inject(QuizService)
    private quizService: QuizService,
    @Inject(QuestionService)
    private questionService: QuestionService,
  ) {}

  @Query((returns) => QuizDto)
  quiz(@Args('id', { type: () => Int }) id: number) {
    return this.quizService.findById(1);
  }

  @ResolveField(() => QuestionDto)
  question(@Parent() quiz: QuizDto) {
    const quizId = quiz.id;

    const questionObjects = this.questionService.find({ quiz: { id: quizId } });

    questionObjects.then((data) => {
      console.log(data);
    });

    return questionObjects;
  }
}
