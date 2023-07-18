export default class InvalidAnswerInputError extends Error {
  constructor(message: string) {
    super(message);

    Object.setPrototypeOf(this, InvalidAnswerInputError.prototype);
  }
}
