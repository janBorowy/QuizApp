import { Quiz } from '../entities/quiz';
import { QuizInput } from './types/quiz.input';

export class QuizServiceResponse {
  action: QuizServiceAction;
  responseStatus: ResponseStatus;
  quiz: Quiz;
  info: string;
}

export class QuizServiceMultipleResponse {
  action: QuizServiceAction;
  responseStatus: ResponseStatus;
  quizzes: Quiz[];
  info: string;
}

export class QuizServiceResponseBuilder {
  quizServiceResponse: QuizServiceResponse;

  constructor() {
    this.quizServiceResponse = new QuizServiceResponse();
  }

  action(action: QuizServiceAction): QuizServiceResponseBuilder {
    this.quizServiceResponse.action = action;
    return this;
  }
  responseStatus(responseStatus: ResponseStatus): QuizServiceResponseBuilder {
    this.quizServiceResponse.responseStatus = responseStatus;
    return this;
  }
  quiz(quiz: QuizInput | Quiz): QuizServiceResponseBuilder {
    if (quiz instanceof QuizInput) {
      this.quizServiceResponse.quiz = transformQuizInput(quiz);
      return this;
    }
    this.quizServiceResponse.quiz = quiz;
    return this;
  }

  info(info: string): QuizServiceResponseBuilder {
    this.quizServiceResponse.info = info;
    return this;
  }

  build(): QuizServiceResponse {
    return this.quizServiceResponse;
  }
}

export class QuizServiceMultipleResponseBuilder {
  quizServiceMultipleResponse: QuizServiceMultipleResponse;

  constructor() {
    this.quizServiceMultipleResponse = new QuizServiceMultipleResponse();
  }

  action(action: QuizServiceAction): QuizServiceMultipleResponseBuilder {
    this.quizServiceMultipleResponse.action = action;
    return this;
  }
  responseStatus(
    responseStatus: ResponseStatus,
  ): QuizServiceMultipleResponseBuilder {
    this.quizServiceMultipleResponse.responseStatus = responseStatus;
    return this;
  }

  quizzes(quizzes: (QuizInput | Quiz)[]): QuizServiceMultipleResponseBuilder {
    const quizzesResult = quizzes.map((quiz) => {
      if (quiz instanceof QuizInput) {
        return transformQuizInput(quiz);
      }
      return quiz;
    });
    this.quizServiceMultipleResponse.quizzes = quizzesResult;
    return this;
  }

  info(info: string): QuizServiceMultipleResponseBuilder {
    this.quizServiceMultipleResponse.info = info;
    return this;
  }

  build(): QuizServiceMultipleResponse {
    return this.quizServiceMultipleResponse;
  }
}

function transformQuizInput(quizInput: QuizInput): Quiz {
  return {
    ...quizInput,
    id: -1,
    questions: [],
  };
}

export enum QuizServiceAction {
  CREATE,
  UPDATE,
  DELETE,
  FIND,
}

export enum ResponseStatus {
  SUCCESS,
  FAILURE,
}
