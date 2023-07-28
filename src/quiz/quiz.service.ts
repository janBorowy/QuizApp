import { Injectable, Logger } from '@nestjs/common';
import { Quiz } from '../entities/quiz';
import { QuizInput } from './types/quiz-input';
import { QuizNotFoundError } from '../exceptions/quiz-not-found.error';
import { Question } from '../entities/question';
import { SolveResult } from '../entities/solve-result';
import { QuizGrader } from './quiz-grader';
import { SolveQuizInput } from './types/solve-quiz.input';
import AnswerInput from './types/answer-input';
import InvalidAnswerInputError from '../exceptions/invalid-answer-input.error';
import { AnswerResult } from '../entities/answer-result';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { RecordNotFoundError } from '../exceptions/record-not-found.error';

@Injectable()
export class QuizService {
  private readonly logger = new Logger(QuizService.name);
  constructor(
    @InjectRepository(Quiz)
    private quizRepository: Repository<Quiz>,
    @InjectRepository(Question)
    private questionRepository: Repository<Question>,
    private dataSource: DataSource,
  ) {}

  async createQuiz(quiz: QuizInput): Promise<Quiz> {
    let savedQuiz: Quiz = null;
    await this.dataSource.transaction(async () => {
      const quizToSave = this.quizRepository.create({
        ...quiz,
        questions: [],
      });

      for (const question of quiz.questionInputs) {
        quizToSave.questions.push(this.questionRepository.create(question));
      }

      savedQuiz = await this.quizRepository.save(quizToSave);
    });
    return savedQuiz;
  }

  async findQuizById(quizId: number): Promise<Quiz> {
    const quiz = await this.quizRepository.findOneBy({ id: quizId });
    if (quiz === null) {
      throw new QuizNotFoundError("quiz with given id doesn't exist");
    }
    return quiz;
  }

  async findQuizByTitle(quizTitle: string): Promise<Quiz[]> {
    const quiz = this.quizRepository.findBy({
      title: quizTitle,
    });
    return quiz;
  }

  async deleteQuizById(quizId: number): Promise<void> {
    if (!(await this.existsQuizInDatabaseById(quizId))) {
      throw new RecordNotFoundError(quizId);
    }
    await this.dataSource.transaction(async () => {
      await this.quizRepository.delete(quizId);
    });
  }

  async existsQuizInDatabaseById(quizId: number): Promise<boolean> {
    return (await this.quizRepository.findOneBy({ id: quizId })) != null;
  }

  async solveQuiz(solveQuizInput: SolveQuizInput): Promise<SolveResult> {
    const quizId = solveQuizInput.quizId;
    await this.checkIfQuizExists(quizId);
    const questions = await this.findAllQuizQuestions(quizId);
    const answerInputs = solveQuizInput.answerInputs;
    this.sortQuestionsById(questions);
    this.sortAnswerInputsById(answerInputs);
    this.checkIfAllAnsweredQuestionsBelongToQuiz(questions, answerInputs);
    const answerStrings = answerInputs.map((answerInput) => answerInput.answer);
    const results = QuizGrader.gradeQuiz(questions, answerStrings);
    return this.transformResultsToSolveResult(questions, results);
  }

  async findAllQuizQuestions(quizId: number): Promise<Question[]> {
    const questions = await this.questionRepository.findBy({
      quiz: {
        id: quizId,
      },
    });
    if (questions === null) {
      return [];
    }
    return questions;
  }

  private async checkIfQuizExists(quizId: number) {
    const exists = await this.existsQuizInDatabaseById(quizId);
    if (!exists) {
      throw new QuizNotFoundError("quiz with given id doesn't exist");
    }
  }

  private transformResultsToSolveResult(
    questions: Array<Question>,
    results: Array<AnswerResult>,
  ): SolveResult {
    const pointsAcquired = this.sumAllArrayElements(
      results.map((result) => result.pointsAcquired),
    );
    const questionPoints = questions.map((question) => question.possibleScore);
    const possiblePointsToGain = this.sumAllArrayElements(questionPoints);
    const percentageAcquired = Math.round(
      (pointsAcquired / possiblePointsToGain) * 100,
    );
    return {
      results: results,
      sum: pointsAcquired,
      percent: percentageAcquired,
    };
  }

  private sumAllArrayElements(array: Array<number>) {
    return array.reduce((partialSum, element) => {
      return partialSum + element;
    });
  }

  private sortQuestionsById(questions: Question[]) {
    return questions.sort((first, second) => {
      if (first.id <= second.id) {
        return -1;
      }
      return 1;
    });
  }

  private sortAnswerInputsById(answerInputs: AnswerInput[]) {
    return answerInputs.sort((first, second) => {
      if (first.questionId <= second.questionId) {
        return -1;
      }
      return 1;
    });
  }

  private checkIfAllAnsweredQuestionsBelongToQuiz(
    sortedQuestions: Question[],
    sortedAnswers: AnswerInput[],
  ) {
    const questionIds = sortedQuestions.map((question) => question.id);
    const answeredQuestionsIds = sortedAnswers.map(
      (answer) => answer.questionId,
    );
    if (questionIds.toString() != answeredQuestionsIds.toString()) {
      throw new InvalidAnswerInputError(
        "Answered questions don't belong to quiz or don't answer all questions in a quiz",
      );
    }
  }
}
