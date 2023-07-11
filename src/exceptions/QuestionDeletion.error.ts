export class QuestionDeletionError extends Error {
  constructor(info: string) {
    super(info);

    Object.setPrototypeOf(this, QuestionDeletionError.prototype);
  }
}
