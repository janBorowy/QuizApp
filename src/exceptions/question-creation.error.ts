export class QuestionCreationError extends Error {
  constructor(info: string) {
    super(`Quiz creation error: ${info}`);

    Object.setPrototypeOf(this, QuestionCreationError.prototype);
  }
}
