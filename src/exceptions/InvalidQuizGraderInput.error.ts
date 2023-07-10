export class InvalidQuizGraderInputError extends Error {
  constructor(message: string) {
    super(message);

    Object.setPrototypeOf(this, InvalidQuizGraderInputError.prototype);
  }
}
