import { Quiz } from '../entities/quiz';
import { Question, QuestionType } from '../entities/question';
import { InvalidQuizGraderInputError } from '../exceptions/InvalidQuizGraderInput.error';

export class QuizGrader {
  static gradeQuiz(quiz: Quiz, answers: string[]): Array<number> {
    const questionAndAnswersArray = this.mergeQuestionAndAnswerArrays(
      quiz.questions,
      answers,
    );
    const results: Array<number> = [];
    questionAndAnswersArray.forEach((questionAndAnswer) => {
      results.push(this.gradeQuestion(questionAndAnswer));
    });
    return results;
  }

  private static mergeQuestionAndAnswerArrays(
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

  private static checkIfQuestionAndAnswerArraysAreOfSameLength(
    questions: Array<Question>,
    answers: Array<string>,
  ) {
    if (questions.length !== answers.length) {
      throw new InvalidQuizGraderInputError(
        'Questions and answers arrays are of different length',
      );
    }
  }

  private static gradeQuestion(questionAndAnswer: QuestionAndAnswer): number {
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

  private static gradeSingleQuestion(
    question: Question,
    answer: string,
  ): number {
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

  private static gradeMultipleQuestion(
    question: Question,
    answer: string,
    weighted = true,
  ): number {
    return weighted
      ? this.gradeWeightedMultipleQuestion(question, answer)
      : this.gradeNotWeightedMultipleQuestion(question, answer);
  }

  private static gradeWeightedMultipleQuestion(
    question: Question,
    answer: string,
  ) {
    const numberOfMatchingAnswers = this.getNumberOfMatchingCharacters(
      question.correctAnswerString,
      answer,
    );
    const correctAnswerFactor = numberOfMatchingAnswers / answer.length;
    return correctAnswerFactor * question.possibleScore;
  }

  private static gradeNotWeightedMultipleQuestion(
    question: Question,
    answer: string,
  ) {
    if (question.correctAnswerString === answer) {
      return question.possibleScore;
    }
    return 0;
  }

  private static getNumberOfMatchingCharacters(
    first: string,
    second: string,
  ): number {
    this.checkIfStringsAreOfSameLength(first, second);
    let sum = 0;
    for (let i = 0; i < first.length; ++i) {
      if (first[i] === second[i]) {
        ++sum;
      }
    }
    return sum;
  }

  private static checkIfStringsAreOfSameLength(first: string, second: string) {
    if (first.length !== second.length) {
      throw new InvalidQuizGraderInputError(
        'question solution and answer solution strings are of different length',
      );
    }
  }

  private static gradePlainQuestion(question: Question, answer: string) {
    if (question.correctAnswerString.trim() === answer.trim()) {
      return question.possibleScore;
    }
    return 0;
  }

  private static gradeSortQuestion(
    question: Question,
    answer: string,
    weighted = true,
  ) {
    return weighted
      ? this.gradeWeightedSortQuestion(question, answer)
      : this.gradeNotWeightedSortQuestion(question, answer);
  }

  private static gradeWeightedSortQuestion(question: Question, answer: string) {
    const numberOfMatchingAnswers = this.getNumberOfMatchingCharacters(
      question.correctAnswerString,
      answer,
    );
    const correctAnswerFactor = numberOfMatchingAnswers / answer.length;
    return correctAnswerFactor * question.possibleScore;
  }

  private static gradeNotWeightedSortQuestion(
    question: Question,
    answer: string,
  ) {
    if (question.correctAnswerString === answer) {
      return question.possibleScore;
    }
    return 0;
  }
}

interface QuestionAndAnswer {
  question: Question;
  answer: string;
}
