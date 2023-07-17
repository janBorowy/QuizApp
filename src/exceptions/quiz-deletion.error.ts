export class QuizDeletionError extends Error {
  constructor(message: string) {
    super(`Could not delete quiz: ${message}`);

    Object.setPrototypeOf(this, QuizDeletionError.prototype);
  }
}
