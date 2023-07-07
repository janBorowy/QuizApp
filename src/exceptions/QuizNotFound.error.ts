export class QuizNotFoundError extends Error {
  constructor(id: number) {
    super(`Quiz with id=${id} doesn't exist`);

    Object.setPrototypeOf(this, QuizNotFoundError.prototype);
  }
}
