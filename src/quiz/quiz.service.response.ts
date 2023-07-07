import { QuizDto } from '../dtos/quiz.dto';

export class QuizServiceResponse {
  action: QuizServiceAction;
  responseStatus: ResponseStatus;
  quizDto: QuizDto;
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
  quizDto(quizDto: QuizDto): QuizServiceResponseBuilder {
    this.quizServiceResponse.quizDto = quizDto;
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
