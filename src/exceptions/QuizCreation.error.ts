export class QuizCreationError extends Error {
  constructor(info: string) {
    super(`Quiz creation error: ${info}`);

    Object.setPrototypeOf(this, QuizCreationError.prototype);
  }
}
