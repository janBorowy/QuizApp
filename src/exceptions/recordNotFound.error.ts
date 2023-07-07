export class RecordNotFoundError extends Error {
  constructor(id: number) {
    super(`Record with id: ${id} doesn't exist`);

    Object.setPrototypeOf(this, RecordNotFoundError.prototype);
  }
}
