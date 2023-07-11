export class QuestionCouldNotBeAddedError extends Error {
  constructor(info: string) {
    super(`Question could not be added: ${info}`);

    Object.setPrototypeOf(this, QuestionCouldNotBeAddedError.prototype);
  }
}
