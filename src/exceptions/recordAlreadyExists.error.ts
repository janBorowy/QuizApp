export class RecordAlreadyExistsError extends Error {
  constructor(id: number) {
    super(`Record with id: ${id} already exists`);

    Object.setPrototypeOf(this, RecordAlreadyExistsError.prototype);
  }
}
