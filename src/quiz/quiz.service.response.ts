import { Quiz } from '../entities/quiz';
import { QuizInput } from './types/quiz.input';

export class QuizServiceResponse {
  action: QuizServiceAction;
  responseStatus: ResponseStatus;
  quiz: Quiz;
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
      this.quizServiceResponse.quiz = {
        ...quiz,
        id: -1,
        questions: [],
      };
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
