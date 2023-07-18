import { Inject, Injectable, Logger } from '@nestjs/common';
import { Quiz } from '../entities/quiz';
import { QuizInput } from './types/quiz-input';
import { QuizNotFoundError } from '../exceptions/quiz-not-found.error';
import { Question } from '../entities/question';
import { SolveResult } from '../entities/solve-result';
import { QuizGrader } from './quiz-grader';
import { QuizDatabaseFacade } from '../database/quiz-database-facade';
import { QuestionDatabaseFacade } from '../database/question-database-facade';
import { SolveQuizInput } from './types/solve-quiz.input';
import AnswerInput from './types/answer-input';
import InvalidAnswerInputError from '../exceptions/invalid-answer-input.error';
import { AnswerResult } from '../entities/answer-result';

@Injectable()
export class QuizService {
  private readonly logger = new Logger(QuizService.name);
  constructor(
    @Inject(QuizDatabaseFacade)
    private quizDatabaseFacade: QuizDatabaseFacade,
    @Inject(QuestionDatabaseFacade)
    private questionDatabaseFacade: QuestionDatabaseFacade,
  ) {}

  async createQuiz(quiz: QuizInput): Promise<Quiz> {
    const savedQuiz = await this.quizDatabaseFacade.saveQuiz(quiz);

    await Promise.all(
      quiz.questionInputs.map((questionInput) =>
        this.questionDatabaseFacade.saveQuestion(questionInput, savedQuiz.id),
      ),
    );

    return this.quizDatabaseFacade.findQuizById(savedQuiz.id);
  }

  async findQuizById(quizId: number): Promise<Quiz> {
    const quiz = await this.quizDatabaseFacade.findQuizById(quizId);
    if (quiz === null) {
      throw new QuizNotFoundError("quiz with given id doesn't exist");
    }
    return quiz;
  }

  async findQuizByTitle(quizTitle: string): Promise<Quiz[]> {
    const quiz = await this.quizDatabaseFacade.findQuizByQuery({
      title: quizTitle,
    });
    return quiz;
  }

  async deleteQuizById(quizId: number): Promise<void> {
    await this.quizDatabaseFacade.deleteQuizById(quizId);
  }

  async solveQuiz(solveQuizInput: SolveQuizInput): Promise<SolveResult> {
    const quizId = solveQuizInput.quizId;
    await this.checkIfQuizExists(quizId);
    const questions = await this.questionDatabaseFacade.findAllQuizQuestions(
      quizId,
    );
    const answerInputs = solveQuizInput.answerInputs;
    this.checkSolveQuizValidity(questions, answerInputs);
    const answerStrings = answerInputs.map((answerInput) => answerInput.answer);
    const results = QuizGrader.gradeQuiz(questions, answerStrings);
    return this.transformResultsToSolveResult(questions, results);
  }

  async findAllQuizQuestions(quizId: number): Promise<Question[]> {
    const questions = await this.questionDatabaseFacade.findAllQuizQuestions(
      quizId,
    );
    if (questions === null) {
      return [];
    }
    return questions;
  }

  private async checkIfQuizExists(quizId: number) {
    const exists = await this.quizDatabaseFacade.existsQuizInDatabaseById(
      quizId,
    );
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
        return 1;
      }
      return -1;
    });
  }

  private sortAnswerInputsById(answerInputs: AnswerInput[]) {
    return answerInputs.sort((first, second) => {
      if (first.questionId <= second.questionId) {
        return 1;
      }
      return -1;
    });
  }

  private checkSolveQuizValidity(
    questions: Question[],
    answerInputs: AnswerInput[],
  ) {
    this.sortQuestionsById(questions);
    this.sortAnswerInputsById(answerInputs);
    this.checkIfAllAnsweredQuestionsBelongToQuiz(questions, answerInputs);
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
