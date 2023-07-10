export class QuizNotFoundError extends Error {
  constructor(info: string) {
    super(`Could not find quiz: ${info}`);

    Object.setPrototypeOf(this, QuizNotFoundError.prototype);
  }
}
