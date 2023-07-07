import {
  Args,
  Int,
  Mutation,
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
import { Quiz } from '../entities/quiz';

@Resolver((of) => QuizDto)
export class QuizResolver {
  constructor(
    @Inject(QuizService)
    private quizService: QuizService,
    @Inject(QuestionService)
    private questionService: QuestionService,
  ) {}

  @Query((returns) => QuizDto)
  async quiz(@Args('id', { type: () => Int }) id: number) {
    return (await this.quizService.findQuizById(id)).quizDto;
  }

  @Mutation(() => QuizDto)
  async createQuiz(
    @Args('title', { type: () => String }) quizTitle: string,
    @Args('createdBy', { type: () => String }) quizCreatedBy: string,
  ) {
    const quizDto: QuizDto = {
      title: quizTitle,
      createdBy: quizCreatedBy,
      questions: [],
    };
    const response = await this.quizService.createNewQuiz(quizDto);
    return response.quizDto;
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
