import { Question, QuestionType } from '../entities/question';
import { InvalidQuizGraderInputError } from '../exceptions/invalid-quiz-grader-input.error';
import { AnswerResult } from '../entities/answer-result';
import { SolveQuizInput } from './types/solve-quiz.input';
import { SolveResult } from '../entities/solve-result';
import AnswerInput from './types/answer-input';
import InvalidAnswerInputError from '../exceptions/invalid-answer-input.error';
import { Inject } from '@nestjs/common';
import { QuizService } from './quiz.service';
import { QuizNotFoundError } from '../exceptions/quiz-not-found.error';

export class QuizGrader {
  constructor(
    @Inject(QuizService)
    private quizService: QuizService,
  ) {}

  async solveQuiz(solveQuizInput: SolveQuizInput): Promise<SolveResult> {
    const quizId = solveQuizInput.quizId;
    await this.checkIfQuizExists(quizId);
    const questions = await this.quizService.findAllQuizQuestions(quizId);
    const answerInputs = solveQuizInput.answerInputs;
    this.sortQuestionsById(questions);
    this.sortAnswerInputsById(answerInputs);
    this.checkIfAllAnsweredQuestionsBelongToQuiz(questions, answerInputs);
    const answerStrings = answerInputs.map((answerInput) => answerInput.answer);
    const results = this.gradeQuiz(questions, answerStrings);
    return this.transformResultsToSolveResult(questions, results);
  }

  private async checkIfQuizExists(quizId: number) {
    const exists = await this.quizService.existsQuizInDatabaseById(quizId);
    if (!exists) {
      throw new QuizNotFoundError("quiz with given id doesn't exist");
    }
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

  private gradeQuiz(
    questions: Question[],
    answers: string[],
  ): Array<AnswerResult> {
    const questionAndAnswersArray = this.mergeQuestionAndAnswerArrays(
      questions,
      answers,
    );
    const results: Array<AnswerResult> = [];
    questionAndAnswersArray.forEach((questionAndAnswer) => {
      results.push({
        pointsAcquired: this.gradeQuestion(questionAndAnswer),
        questionId: questionAndAnswer.question.id,
      });
    });
    return results;
  }

  private mergeQuestionAndAnswerArrays(
    questions: Array<Question>,
    answers: Array<string>,
  ) {
    this.checkIfQuestionAndAnswerArraysAreOfSameLength(questions, answers);
    const output = new Array<QuestionAndAnswer>();
    for (let i = 0; i < questions.length; ++i) {
      output.push({
        question: questions[i],
        answer: answers[i],
      });
    }
    return output;
  }

  private checkIfQuestionAndAnswerArraysAreOfSameLength(
    questions: Array<Question>,
    answers: Array<string>,
  ) {
    if (questions.length !== answers.length) {
      throw new InvalidQuizGraderInputError(
        'Questions and answers arrays are of different length',
      );
    }
  }

  private gradeQuestion(questionAndAnswer: QuestionAndAnswer): number {
    let result: number;
    const question = questionAndAnswer.question;
    const answer = questionAndAnswer.answer;
    switch (question.type) {
      case QuestionType.SINGLE:
        result = this.gradeSingleQuestion(question, answer);
        break;
      case QuestionType.MULTIPLE:
        result = this.gradeMultipleQuestion(question, answer);
        break;
      case QuestionType.PLAIN:
        result = this.gradePlainQuestion(question, answer);
        break;
      case QuestionType.SORT:
        result = this.gradeSortQuestion(question, answer);
        break;
    }
    return result;
  }

  private gradeSingleQuestion(question: Question, answer: string): number {
    const answerIndex = parseInt(answer);
    if (isNaN(answerIndex)) {
      throw new InvalidQuizGraderInputError('Invalid answer input');
    }

    const correctAnswerIndex = parseInt(question.correctAnswerString);
    if (isNaN(correctAnswerIndex)) {
      throw new InvalidQuizGraderInputError('Invalid answer input');
    }

    if (correctAnswerIndex === answerIndex) {
      return question.possibleScore;
    }
    return 0;
  }

  private gradeMultipleQuestion(question: Question, answer: string): number {
    return this.gradeWeightedMultipleQuestion(question, answer);
  }

  private gradeWeightedMultipleQuestion(question: Question, answer: string) {
    const numberOfMatchingAnswers = this.getNumberOfMatchingCharacters(
      question.correctAnswerString,
      answer,
    );
    const correctAnswerFactor = numberOfMatchingAnswers / answer.length;
    return correctAnswerFactor * question.possibleScore;
  }

  private getNumberOfMatchingCharacters(first: string, second: string): number {
    this.checkIfStringsAreOfSameLength(first, second);
    let sum = 0;
    for (let i = 0; i < first.length; ++i) {
      if (first[i] === second[i]) {
        ++sum;
      }
    }
    return sum;
  }

  private checkIfStringsAreOfSameLength(first: string, second: string) {
    if (first.length !== second.length) {
      throw new InvalidQuizGraderInputError(
        'question solution and answer solution strings are of different length',
      );
    }
  }

  private gradePlainQuestion(question: Question, answer: string) {
    const solutionInsensitive = this.convertForStringInsensitiveComparison(
      question.correctAnswerString,
    );
    const answerInsensitive =
      this.convertForStringInsensitiveComparison(answer);
    if (solutionInsensitive === answerInsensitive) {
      return question.possibleScore;
    }
    return 0;
  }

  private convertForStringInsensitiveComparison(str: string) {
    return str.trim().toLowerCase();
  }

  private gradeSortQuestion(question: Question, answer: string) {
    return this.gradeWeightedSortQuestion(question, answer);
  }

  private gradeWeightedSortQuestion(question: Question, answer: string) {
    const numberOfMatchingAnswers = this.getNumberOfMatchingCharacters(
      question.correctAnswerString,
      answer,
    );
    const correctAnswerFactor = numberOfMatchingAnswers / answer.length;
    return correctAnswerFactor * question.possibleScore;
  }
}

interface QuestionAndAnswer {
  question: Question;
  answer: string;
}
